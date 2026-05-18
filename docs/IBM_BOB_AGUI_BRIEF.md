# IBM Bob Task Brief: AG-UI Protocol Integration

## Objective

Integrate the AG-UI protocol (`@ag-ui/client`, `@ag-ui/core`) into the Angela project so that the `/api/chat` endpoint streams responses token-by-token instead of returning a single JSON blob. The frontend `handleChat` function in `src/App.tsx` must be updated to consume the AG-UI stream via `HttpAgent`.

All other endpoints (`/api/diagnose`, `/api/draft`, `/api/ingest`) are out of scope for this task — do not touch them.

---

## Repository

`C:\Users\Harold\Projects\Angela\Angela`

---

## Step 1 — Install packages

```bash
npm install @ag-ui/client @ag-ui/core
```

---

## Step 2 — Rewrite `/api/chat` in `server.ts`

**File:** `server.ts`  
**Current location:** line 496–552

**Current behaviour:** Accepts `{ message, workspaceId }`, calls `genAI.models.generateContent()` (blocking), returns `{ reply, timestamp }` as JSON.

**Target behaviour:** Accepts AG-UI `RunAgentInput` body, calls `genAI.models.generateContentStream()` (streaming), emits AG-UI SSE events to the response.

### What to preserve (do not remove):
- `requireAuth()` and `rateLimit()` middleware on the route
- `inspectPrompt(message)` security check — if it fails, emit `RUN_ERROR` and close
- `writeAuditLog(...)` calls — keep both the DENY and ALLOW log writes
- `user.uid`, `workspaceId` extraction from request context

### New request body shape (AG-UI `RunAgentInput`):
```typescript
{
  threadId: string;       // AG-UI conversation thread ID
  runId: string;          // AG-UI run ID
  messages: Array<{       // conversation history
    role: "user" | "assistant";
    content: string;
  }>;
  state?: Record<string, any>;
  forwardedProps?: {
    workspaceId?: string;
  };
}
```
Extract `message` as the last user message: `messages.findLast(m => m.role === "user")?.content`  
Extract `workspaceId` from: `req.body.forwardedProps?.workspaceId ?? "harbour-tower"`

### SSE event sequence to emit:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

Events (each line: `data: <JSON>\n\n`):

```typescript
// 1. Start
{ type: "RUN_STARTED", threadId, runId }

// 2. Message start
{ type: "TEXT_MESSAGE_START", messageId: <uuid> }

// 3. For each streamed token chunk from Gemini:
{ type: "TEXT_MESSAGE_CONTENT", messageId: <uuid>, delta: <chunk text> }

// 4. Message end
{ type: "TEXT_MESSAGE_END", messageId: <uuid> }

// 5. Run finished
{ type: "RUN_FINISHED", threadId, runId }
```

On security block (inspectPrompt fails), emit then close:
```typescript
{ type: "RUN_ERROR", threadId, runId, message: "Security violation detected." }
```

On any other error, emit then close:
```typescript
{ type: "RUN_ERROR", threadId, runId, message: "Chat failed." }
```

### Gemini streaming call:
Replace `genAI.models.generateContent(...)` with:
```typescript
const stream = await genAI.models.generateContentStream({
  model: "gemini-1.5-pro",
  contents: [
    {
      role: "user",
      parts: [
        { text: CHAT_SYSTEM_PROMPT },
        { text: message },
      ],
    },
  ],
  config: { maxOutputTokens: 600 },
});

for await (const chunk of stream) {
  const delta = chunk.text ?? "";
  if (delta) {
    emit({ type: "TEXT_MESSAGE_CONTENT", messageId, delta });
  }
}
```

### Helper to emit events:
```typescript
const emit = (event: object) => {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
};
```

### Complete new handler shape:

```typescript
app.post("/api/chat", requireAuth(), rateLimit(), async (req, res) => {
  const user = (req as any).user as UserContext;
  const requestId = crypto.randomUUID();
  const { threadId, runId, messages, forwardedProps } = req.body;
  const workspaceId = forwardedProps?.workspaceId ?? "harbour-tower";
  const message = (messages as any[])?.findLast?.((m: any) => m.role === "user")?.content;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const emit = (event: object) => res.write(`data: ${JSON.stringify(event)}\n\n`);

  if (typeof message !== "string" || !message.trim()) {
    emit({ type: "RUN_ERROR", threadId, runId, message: "message must be a non-empty string" });
    return res.end();
  }

  const inspection = inspectPrompt(message);
  if (!inspection.safe) {
    await writeAuditLog({ action: "Chat", actor: user.uid, workspaceId, verdict: "DENY", trigger_reason: inspection.reason, evidence_ids: [], requestId });
    emit({ type: "RUN_ERROR", threadId, runId, message: "Security violation detected." });
    return res.end();
  }

  const messageId = crypto.randomUUID();
  emit({ type: "RUN_STARTED", threadId, runId });
  emit({ type: "TEXT_MESSAGE_START", messageId });

  try {
    const stream = await genAI.models.generateContentStream({
      model: "gemini-1.5-pro",
      contents: [{ role: "user", parts: [{ text: CHAT_SYSTEM_PROMPT }, { text: message }] }],
      config: { maxOutputTokens: 600 },
    });

    for await (const chunk of stream) {
      const delta = chunk.text ?? "";
      if (delta) emit({ type: "TEXT_MESSAGE_CONTENT", messageId, delta });
    }

    emit({ type: "TEXT_MESSAGE_END", messageId });
    emit({ type: "RUN_FINISHED", threadId, runId });

    await writeAuditLog({ action: "Chat", actor: user.uid, workspaceId, verdict: "ALLOW", trigger_reason: "Standard Chat", evidence_ids: [], requestId });
  } catch (error) {
    emit({ type: "RUN_ERROR", threadId, runId, message: "Chat failed." });
  }

  res.end();
});
```

---

## Step 3 — Update `src/App.tsx`

**File:** `src/App.tsx`

### Add import at top of file:
```typescript
import { HttpAgent } from "@ag-ui/client";
```

### Add agent instance above the `handleChat` function:
```typescript
const chatAgent = new HttpAgent({ url: "/api/chat" });
```

### Replace the `handleChat` function (currently lines ~148–176):

**Current:** Uses `fetch('/api/chat', ...)`, sets `isAgentThinking`, appends full reply to `chatHistory` after response completes.

**Target:** Uses `chatAgent.runAgent(...)`, streams `delta` tokens into a partial message that updates live in `chatHistory`, uses AG-UI callbacks for state.

```typescript
const handleChat = async () => {
  if (!chatMessage.trim()) return;
  const userText = chatMessage;
  setChatMessage('');
  setChatHistory(prev => [...prev, { role: 'user' as const, text: userText }]);
  setIsAgentThinking(true);

  // Placeholder agent message that we'll fill in as tokens arrive
  const agentMsgId = crypto.randomUUID();
  setChatHistory(prev => [...prev, { role: 'agent' as const, text: '', _id: agentMsgId }]);

  let accumulated = '';

  try {
    await chatAgent.runAgent(
      {
        threadId: activeWorkspaceId,
        runId: agentMsgId,
        messages: [{ role: 'user', content: userText }],
        forwardedProps: { workspaceId: activeWorkspaceId },
      },
      {
        onEvent: (event: any) => {
          if (event.type === 'TEXT_MESSAGE_CONTENT') {
            accumulated += event.delta ?? '';
            setChatHistory(prev =>
              prev.map(m =>
                (m as any)._id === agentMsgId
                  ? { ...m, text: accumulated }
                  : m
              )
            );
          }
          if (event.type === 'RUN_ERROR') {
            const isSecurityBlock = event.message?.includes('Security violation');
            setChatHistory(prev =>
              prev.map(m =>
                (m as any)._id === agentMsgId
                  ? { ...m, text: isSecurityBlock ? '__SECURITY_DENIED__' : `Error: ${event.message}` }
                  : m
              )
            );
          }
        },
      }
    );
  } catch (e) {
    console.error('Chat failed', e);
    setChatHistory(prev =>
      prev.map(m =>
        (m as any)._id === agentMsgId ? { ...m, text: 'Connection error. Please try again.' } : m
      )
    );
  } finally {
    setIsAgentThinking(false);
  }
};
```

### Also update the `authHeaders` usage:
The `HttpAgent` accepts custom headers via constructor options. Update the agent initialisation to pass auth headers dynamically:

```typescript
// Replace the static chatAgent with a derived one that includes auth headers:
const getChatAgent = () => new HttpAgent({
  url: "/api/chat",
  headers: token
    ? { Authorization: `Bearer ${token}` }
    : { "x-demo-role": "analyst" },
});
```

Then in `handleChat`, call `getChatAgent().runAgent(...)` instead of `chatAgent.runAgent(...)`.

---

## Step 4 — Update the chat history type

**File:** `src/App.tsx`

The `chatHistory` type is currently `{ role: 'user' | 'agent', text: string }[]`.

Update to allow an optional `_id` field for tracking the streaming placeholder:
```typescript
const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agent', text: string, _id?: string }[]>([]);
```

Also update `WorkspaceProps` in `src/Workspace.tsx` to match:
```typescript
chatHistory: { role: 'user' | 'agent', text: string, _id?: string }[];
```

And `AdvisorPanelProps` in `src/components/workspace/AdvisorPanel.tsx`:
```typescript
chatHistory: { role: 'user' | 'agent'; text: string; _id?: string }[];
```

---

## Step 5 — Verify TypeScript compiles

Run:
```bash
npx tsc --noEmit
```

Fix any type errors before finishing.

---

## What NOT to change

- `/api/diagnose`, `/api/draft`, `/api/ingest` — leave completely unchanged
- All auth middleware (`requireAuth`, `resolveUser`, `rateLimit`)
- Security layer (`inspectPrompt`, Lobster Trap patterns)
- Firestore audit log writes (`writeAuditLog`)
- All CSS and component files except the three type signature updates above
- `handleDiagnose` and `handleGenerateDraft` functions in `App.tsx`

---

## Acceptance criteria

1. `npx tsc --noEmit` passes with no errors
2. In DEMO_MODE, sending a chat message causes the agent bubble to appear immediately and fill in token by token
3. A security-violating message still shows the `__SECURITY_DENIED__` state in the bubble
4. No regressions to diagnose or draft flows

# Angela — User Journeys & Stories

## Personas

| Persona | Role | Goal |
|---------|------|------|
| **Alex** | Knowledge Manager / Admin | Controls what Angela knows. Ingests, validates, and governs project documents before they reach the advisor. |
| **Maya** | Project Manager / Analyst | Uses the advisor canvas daily to understand project risks, surface prior decisions, and get answers fast. |
| **Jordan** | Proposal Writer | Creates evidence-backed outputs — risk registers, decision briefs, proposal sections — under time pressure. |

---

## Journey 1 — Knowledge enters Angela

**Persona:** Alex (Admin)  
**Entry point:** Landing page → "How It Works"  
**Goal:** Publish a new planning report so Maya and Jordan can use it in the Advisor Canvas

### Steps

1. Alex lands on the Admin Ingestion console — no login friction in demo mode
2. Sees the three-panel layout: Source Intake → Ingestion Queue → Review & Publish
3. Clicks **Load Demo Document** — `Harbour_Tower_Planning_Report.pdf` appears in the queue
4. Watches the pipeline animate:
   - **Parse source** — file type detected, content split, tables and metadata extracted
   - **Extract entities** — dates, owners, risks, commitments, costs identified
   - **Classify knowledge** — mapped to planning domain, artifact type, confidence scored
   - **Validate trust** — duplicates checked, restricted terms flagged, ownership confirmed
   - **Publish to Angela** — knowledge released to the Advisor Canvas with provenance intact
5. Sees "Published ✓" — document is now live in the Harbour Tower workspace

### User Stories

- **US-1.1** As Alex, I want to load a document into the ingestion pipeline so that Angela can use it to answer analyst questions with grounded evidence.
- **US-1.2** As Alex, I want to see each processing step complete with a status so that I know exactly what happened to the source before it reaches users.
- **US-1.3** As Alex, I want flagged review items (duplicates, missing owners) surfaced before publishing so that I can maintain source quality without reading every document manually.
- **US-1.4** As Alex, I want to set an access policy per document so that restricted commercial data never reaches analysts without clearance.

---

## Journey 2 — Analyst gets an answer

**Persona:** Maya (Project Manager)  
**Entry point:** Landing page → "Enter Advisor Workspace"  
**Goal:** Understand the planning approval risk on Harbour Tower before a steering committee

### Steps

1. Maya opens the Workspace — canvas is pre-loaded with evidence cards (documents, risk register, financial model, decision log, similar projects)
2. She scans the canvas to orient herself — sees the planning report Alex just published
3. Opens the Advisor panel and types: *"What are the main planning approval risks on this project and how do they compare to similar past projects?"*
4. Sees the agent bubble appear immediately — tokens stream in one by one as Angela thinks
5. Angela responds with a grounded answer citing three evidence sources from the canvas
6. Maya follows up: *"What decision was made about the neighbouring stakeholder objections?"*
7. Angela responds in context, pointing to the Decision Log card on the canvas
8. Maya now has what she needs for the steering committee — sourced, traceable, fast

### User Stories

- **US-2.1** As Maya, I want to ask a plain-language question about my project so that I get a sourced answer without searching through documents myself.
- **US-2.2** As Maya, I want responses to stream in token by token so that I can start reading immediately and don't wait for a full response to appear.
- **US-2.3** As Maya, I want to see which evidence sources shaped the answer so that I can verify claims before presenting to stakeholders.
- **US-2.4** As Maya, I want to switch between workspaces (Harbour Tower, Facilities, Enterprise) so that I can work across multiple active projects without losing context.
- **US-2.5** As Maya, I want the canvas to show the right evidence cards for whichever workspace is active so that the context is always relevant.

---

## Journey 3 — Diagnosis and draft report

**Persona:** Jordan (Proposal Writer)  
**Entry point:** Workspace → Advisor Panel  
**Goal:** Produce a decision-ready risk brief for a client in under 10 minutes

### Steps

1. Jordan opens the Workspace with the Harbour Tower project active
2. Types a context statement into the Advisor: *"We need to assess the risk of planning approval delay and its impact on the project programme"*
3. Clicks **Diagnose** instead of Chat — Angela runs a structured diagnostic pass
4. Receives a diagnosis card:
   - **Hypothesis:** Planning approval delay is likely due to unresolved neighbouring stakeholder objections and missing authority pre-consultation
   - **Confidence:** 84%
   - **Evidence cited:** HTPR-001, RISK-003, DL-007
5. Reviews the diagnosis — agrees with the hypothesis
6. Clicks **Generate Draft Report**
7. A structured report modal opens with:
   - Executive Summary
   - Findings (each with evidence ID and confidence score)
   - Recommendations (with rationale)
   - Missing Evidence (gaps Angela identified)
8. Jordan copies the output, edits lightly, and sends to the client — total time: 8 minutes

### User Stories

- **US-3.1** As Jordan, I want to run a diagnosis on a project context so that I get a structured hypothesis with confidence and evidence rather than a freeform answer.
- **US-3.2** As Jordan, I want the diagnosis to cite specific evidence IDs so that every claim in the output is traceable back to a source document.
- **US-3.3** As Jordan, I want to generate a draft report from a diagnosis in one click so that I have a structured, client-ready document without starting from scratch.
- **US-3.4** As Jordan, I want the draft to flag missing evidence so that I know where the gaps are before sending it to a client.
- **US-3.5** As Jordan, I want the draft to persist on screen in a modal so that I can read and copy it without losing my workspace state.

---

## Journey 4 — Security block (trust layer)

**Persona:** Maya (Analyst)  
**Entry point:** Workspace → Advisor Panel  
**Goal:** Ask a question — but trip the security layer

### Steps

1. Maya accidentally (or deliberately) sends a message that matches a restricted pattern — an attempt to extract raw source text, override instructions, or access restricted commercial data
2. The Lobster Trap security layer intercepts the prompt server-side before it reaches Gemini
3. The agent bubble appears but fills with a security denial state instead of a response
4. An audit log entry is written: actor, workspace, trigger reason, timestamp
5. Maya sees a clear signal that the request was blocked — no ambiguity, no partial leak

### User Stories

- **US-4.1** As a Security Officer, I want every prompt inspected before it reaches the AI so that policy-violating requests never produce outputs.
- **US-4.2** As a Security Officer, I want a full audit log of denied requests (actor, workspace, reason) so that I can review patterns and report on enforcement.
- **US-4.3** As Maya, I want a clear signal when a request is blocked so that I know to rephrase rather than assume the system is broken.

---

## Demo Script (5 minutes)

| Time | Act | What the audience sees |
|------|-----|----------------------|
| 0:00–1:00 | **Setup** | Landing page — explain the problem Angela solves. "Enterprise knowledge is scattered. Angela brings it together." Click "How It Works." |
| 1:00–2:00 | **Ingest** | Admin console. Click "Load Demo Document." Watch all 5 pipeline steps animate to Done. "This is how trusted knowledge enters Angela." |
| 2:00–2:30 | **Canvas** | Switch to Workspace. Show the canvas — planning report, risk register, financial model, decision log, similar projects. "Everything Alex published is here, traceable." |
| 2:30–3:30 | **Advise** | Type a question in the Advisor panel. Watch tokens stream. "Angela answers from grounded sources, not from thin air." |
| 3:30–4:30 | **Diagnose + Draft** | Click Diagnose. Show hypothesis + confidence. Click Generate Draft. Open modal — findings, recommendations, missing evidence. "Decision-ready in seconds." |
| 4:30–5:00 | **Close** | "Three personas, one product. Governed knowledge in, trusted outputs out." |

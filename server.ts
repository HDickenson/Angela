import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { INTAKE_SYSTEM_PROMPT, DIAGNOSIS_SYSTEM_PROMPT, DRAFT_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from "./src/lib/prompts.ts";
import { inspectPrompt } from "./src/lib/security.ts";
import { harbourTowerData, facilitiesData, enterpriseData } from "./src/lib/internal_databases.ts";
import { initializeApp as initAdminApp, cert, getApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";

// ─── Type declarations ────────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

// ─── Firebase Admin initialization (graceful) ─────────────────────────────────

let adminAuth: ReturnType<typeof getAdminAuth> | null = null;
let adminDb: ReturnType<typeof getAdminFirestore> | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (getApps().length === 0) {
      initAdminApp({ credential: cert(serviceAccount) });
    }
    adminAuth = getAdminAuth();
    adminDb = getAdminFirestore();
  } else if (process.env.DEMO_MODE !== "true") {
    if (getApps().length === 0) {
      initAdminApp(); // uses Application Default Credentials
    }
    adminAuth = getAdminAuth();
    adminDb = getAdminFirestore();
  }
  // DEMO_MODE=true: skip Admin init entirely — demo mode uses header-based role trust
} catch (e: any) {
  console.warn("Firebase Admin initialization failed:", e.message);
  adminAuth = null;
  adminDb = null;
}

// ─── Role / zone mapping ──────────────────────────────────────────────────────

const ROLE_ZONES: Record<string, string[]> = {
  user: ["public"],
  analyst: ["public", "diagnostic"],
  reviewer: ["public", "diagnostic", "restricted"],
  admin: ["public", "diagnostic", "restricted"],
};

interface UserContext {
  uid: string;
  role: string;
  allowedZones: string[];
}

// ─── resolveUser ──────────────────────────────────────────────────────────────

async function resolveUser(req: express.Request): Promise<UserContext | null> {
  // DEMO_MODE: trust X-Demo-Role header (development/demo only)
  if (process.env.DEMO_MODE === "true") {
    const demoRole = ((req.headers["x-demo-role"] as string) || "analyst").toLowerCase();
    const role = ROLE_ZONES[demoRole] ? demoRole : "user";
    return { uid: "demo-user", role, allowedZones: ROLE_ZONES[role] };
  }

  if (!adminAuth) return null;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7), true);
    const role = ((decoded as any).role as string) || "user";
    return { uid: decoded.uid, role, allowedZones: ROLE_ZONES[role] || ["public"] };
  } catch (e: any) {
    return null;
  }
}

// ─── requireAuth middleware ───────────────────────────────────────────────────

function requireAuth(requiredZone?: string) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = await resolveUser(req);
    if (!user) return res.status(401).json({ error: "authentication_required" });
    if (requiredZone && !user.allowedZones.includes(requiredZone)) {
      return res.status(403).json({ error: "insufficient_clearance" });
    }
    (req as any).user = user;
    next();
  };
}

// ─── In-memory stores ─────────────────────────────────────────────────────────

const auditLogs: any[] = [];
const diagnosesStore = new Map<string, any>();

// ─── Simple in-memory rate limiter: max 20 AI requests per IP per minute ─────

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

function rateLimit() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Skip rate limiting in test environments
    if (process.env.VITEST || process.env.NODE_ENV === "test") return next();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: "rate_limit_exceeded", retryAfter: 60 });
    }
    next();
  };
}

// ─── writeAuditLog helper ─────────────────────────────────────────────────────

async function writeAuditLog(entry: {
  action: string;
  actor: string;
  workspaceId: string;
  verdict: "ALLOW" | "DENY" | "ERROR";
  trigger_reason: string;
  evidence_ids: string[];
  requestId: string;
}) {
  const logEntry = { ...entry, timestamp: new Date().toISOString() };
  auditLogs.unshift(logEntry);

  if (adminDb) {
    try {
      await adminDb.collection("auditLogs").add({
        ...entry,
        timestamp: FieldValue.serverTimestamp(),
      });
    } catch (e: any) {
      console.warn("Audit log Firestore write failed:", e.message);
      // do NOT throw — log failure must not break primary operation
    }
  }

  return logEntry;
}

// ─── Workspace data ───────────────────────────────────────────────────────────

const workspaces = {
  "harbour-tower": {
    name: "Harbour Tower Extension",
    data: harbourTowerData,
    evidenceStore: harbourTowerData.documents.map((d: any) => ({
      id: d.id,
      zone: d.tags.includes("risk") || d.tags.includes("finance") ? "restricted" : "diagnostic",
      content: `${d.fileName} - ${d.tags.join(", ")}`,
      tags: d.tags,
    })).concat(harbourTowerData.risks.map((r: any) => ({
      id: r.id,
      zone: "public",
      content: `Risk: ${r.riskTitle} - ${r.description}`,
      tags: ["risk"],
    }))),
  },
  "facilities": {
    name: "Facilities Management Domain",
    data: facilitiesData,
    evidenceStore: facilitiesData.documents || [],
  },
  "enterprise": {
    name: "Enterprise Operational Data",
    data: enterpriseData,
    evidenceStore: enterpriseData.documents || [],
  },
};

// ─── App factory ──────────────────────────────────────────────────────────────

export async function createApp() {
  const app = express();

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set. AI features will fail.");
  }
  const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

  app.use(express.json());

  // GET /api/health — no auth
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Angela" });
  });

  // GET /api/workspace/:id
  app.get("/api/workspace/:id", requireAuth(), (req, res) => {
    const ws = workspaces[req.params.id as keyof typeof workspaces];
    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json({ ...ws.data, name: ws.name });
  });

  // POST /api/ingest
  app.post("/api/ingest", requireAuth(), rateLimit(), async (req, res) => {
    const user = (req as any).user as UserContext;
    const requestId = crypto.randomUUID();

    try {
      const { payload, source, workspaceId = "harbour-tower" } = req.body;
      if (typeof payload !== "string" || !payload.trim()) {
        return res.status(400).json({ error: "payload must be a non-empty string" });
      }
      const ws = workspaces[workspaceId as keyof typeof workspaces];

      const inspection = inspectPrompt(payload);
      if (!inspection.safe) {
        await writeAuditLog({
          action: "Ingestion",
          actor: user.uid,
          workspaceId,
          verdict: "DENY",
          trigger_reason: inspection.reason,
          evidence_ids: [],
          requestId,
        });
        return res.status(403).json({ error: "Security violation detected in payload.", reason: inspection.reason });
      }

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: INTAKE_SYSTEM_PROMPT },
              { text: `Process following payload from ${source}: ${payload}` },
            ],
          },
        ],
        config: { maxOutputTokens: 400 },
      });

      const responseText = result.text || "";
      const cleanedJson = responseText.replace(/```json|```/g, "").trim();
      let intakeData: any;
      try {
        intakeData = JSON.parse(cleanedJson);
      } catch {
        return res.status(422).json({ error: "classification_parse_failed", raw: responseText.slice(0, 200) });
      }

      const newId = `EV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const newEntry = {
        id: newId,
        content: payload,
        zone: "diagnostic",
        metadata: intakeData,
        tags: [],
        timestamp: new Date().toISOString(),
      };

      if (ws) ws.evidenceStore.push(newEntry);

      if (adminDb) {
        await adminDb
          .collection("workspaces")
          .doc(workspaceId)
          .collection("evidence")
          .doc(newId)
          .set(newEntry)
          .catch((e: any) => console.warn("Evidence Firestore write failed:", e.message));
      }

      await writeAuditLog({
        action: "Ingestion",
        actor: user.uid,
        workspaceId,
        verdict: "ALLOW",
        trigger_reason: "Standard Ingestion",
        evidence_ids: [newId],
        requestId,
      });

      res.json({
        status: "success",
        trace_id: `TRC-${newId}`,
        data: intakeData,
      });
    } catch (error) {
      console.error("Ingestion failed:", error);
      res.status(500).json({ error: "Ingestion failed" });
    }
  });

  // POST /api/diagnose
  app.post("/api/diagnose", requireAuth(), rateLimit(), async (req, res) => {
    const user = (req as any).user as UserContext;
    const requestId = crypto.randomUUID();

    try {
      const { context, workspaceId = "harbour-tower" } = req.body;
      const ws = workspaces[workspaceId as keyof typeof workspaces];
      let evidenceStore = ws ? [...ws.evidenceStore] : [];
      if (adminDb) {
        try {
          const snap = await adminDb
            .collection("workspaces")
            .doc(workspaceId)
            .collection("evidence")
            .get();
          const persisted = snap.docs.map((d: any) => d.data());
          const existingIds = new Set(evidenceStore.map((e: any) => e.id));
          evidenceStore = [...evidenceStore, ...persisted.filter((e: any) => !existingIds.has(e.id))];
        } catch (e: any) {
          console.warn("Evidence Firestore read failed:", e.message);
        }
      }

      // Filter evidence by user's allowed zones (derived from auth, not body)
      const visibleEvidence = evidenceStore.filter((e: any) =>
        user.allowedZones.includes(e.zone)
      );
      const restrictedCount = evidenceStore.length - visibleEvidence.length;

      const prompt = `
        Allowed Zones: ${user.allowedZones.join(", ")}
        Available Evidence: ${JSON.stringify(visibleEvidence)}

        User Request: ${context}
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: [
          {
            role: "user",
            parts: [
              { text: DIAGNOSIS_SYSTEM_PROMPT },
              { text: prompt },
            ],
          },
        ],
        config: { maxOutputTokens: 1500 },
      });

      const responseText = result.text || "";
      const cleanedJson = responseText.replace(/```json|```/g, "").trim();
      let diagnosis: any;
      try {
        diagnosis = JSON.parse(cleanedJson);
      } catch {
        return res.status(422).json({ error: "diagnosis_parse_failed", raw: responseText.slice(0, 200) });
      }

      const diagnosisId = crypto.randomUUID();
      diagnosesStore.set(diagnosisId, {
        ...diagnosis,
        workspaceId,
        createdAt: new Date().toISOString(),
      });

      // Optionally persist to Firestore
      if (adminDb) {
        await adminDb
          .collection("workspaces")
          .doc(workspaceId)
          .collection("diagnoses")
          .doc(diagnosisId)
          .set({ ...diagnosis, workspaceId, createdAt: new Date().toISOString() })
          .catch((e: any) => console.warn("Diagnosis Firestore write failed:", e.message));
      }

      await writeAuditLog({
        action: "Diagnosis Generation",
        actor: user.uid,
        workspaceId,
        verdict: "ALLOW",
        trigger_reason: "Standard Query",
        evidence_ids: diagnosis.evidence_map || [],
        requestId,
      });

      const citedEvidence = visibleEvidence.filter((e: any) =>
        (diagnosis.evidence_map || []).includes(e.id)
      );

      res.json({
        ...diagnosis,
        diagnosisId,
        cited_evidence_details: citedEvidence,
        metadata: {
          visible_evidence_count: visibleEvidence.length,
          restricted_evidence_count: restrictedCount,
        },
      });
    } catch (error) {
      console.error("Diagnosis failed:", error);
      res.status(500).json({ error: "Diagnosis failed" });
    }
  });

  // POST /api/draft — NEW endpoint
  app.post("/api/draft", requireAuth(), rateLimit(), async (req, res) => {
    const user = (req as any).user as UserContext;
    const requestId = crypto.randomUUID();

    try {
      const { diagnosisId, workspaceId = "harbour-tower" } = req.body;

      if (!diagnosisId) {
        return res.status(400).json({ error: "diagnosisId is required" });
      }

      let diagnosis: any = null;

      // Try Firestore first (survives cold starts)
      if (adminDb) {
        try {
          const snap = await adminDb
            .collection("workspaces")
            .doc(workspaceId)
            .collection("diagnoses")
            .doc(diagnosisId)
            .get();
          if (snap.exists) {
            diagnosis = snap.data();
          }
        } catch (e: any) {
          console.warn("Firestore diagnosis lookup failed:", e.message);
        }
      }

      // Fall back to in-memory store
      if (!diagnosis) {
        diagnosis = diagnosesStore.get(diagnosisId);
      }

      // Workspace ownership check
      if (diagnosis && diagnosis.workspaceId !== workspaceId) {
        return res.status(403).json({ error: "diagnosis does not belong to this workspace" });
      }

      if (!diagnosis) {
        return res.status(404).json({ error: "diagnosis_not_found" });
      }

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: DRAFT_SYSTEM_PROMPT + "\n\nDiagnosis:\n" + JSON.stringify(diagnosis) },
            ],
          },
        ],
        config: { maxOutputTokens: 1000 },
      });

      const responseText = result.text || "";
      const cleanedJson = responseText.replace(/```json|```/g, "").trim();

      let draft: any;
      try {
        draft = JSON.parse(cleanedJson);
      } catch {
        return res.status(422).json({ error: "draft_generation_failed", raw: responseText });
      }

      if (!draft.findings || !draft.executive_summary) {
        return res.status(422).json({ error: "draft_generation_failed", raw: responseText });
      }

      await writeAuditLog({
        action: "Draft Generation",
        actor: user.uid,
        workspaceId,
        verdict: "ALLOW",
        trigger_reason: "Draft requested for diagnosis",
        evidence_ids: [],
        requestId,
      });

      res.json(draft);
    } catch (error) {
      console.error("Draft generation failed:", error);
      res.status(500).json({ error: "Draft generation failed" });
    }
  });

  // GET /api/logs — reviewer/admin only
  app.get("/api/logs", requireAuth(), async (req, res) => {
    const user = (req as any).user as UserContext;

    if (!user.allowedZones.includes("restricted")) {
      return res.status(403).json({ error: "insufficient_clearance" });
    }

    if (adminDb) {
      try {
        const snap = await adminDb
          .collection("auditLogs")
          .orderBy("timestamp", "desc")
          .limit(50)
          .get();
        return res.json(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      } catch (e: any) {
        console.warn("Firestore logs query failed, falling back to in-memory:", e.message);
      }
    }

    res.json(auditLogs.slice(0, 50));
  });

  // POST /api/chat — AG-UI SSE streaming
  app.post("/api/chat", requireAuth(), rateLimit(), async (req, res) => {
    const user = (req as any).user as UserContext;
    const requestId = crypto.randomUUID();
    const { threadId, runId, messages, forwardedProps } = req.body;
    const workspaceId: string = forwardedProps?.workspaceId ?? "harbour-tower";
    const ws = workspaces[workspaceId as keyof typeof workspaces];
    let chatEvidence = ws ? [...ws.evidenceStore] : [];
    if (adminDb) {
      try {
        const snap = await adminDb
          .collection("workspaces")
          .doc(workspaceId)
          .collection("evidence")
          .get();
        const persisted = snap.docs.map((d: any) => d.data());
        const existingIds = new Set(chatEvidence.map((e: any) => e.id));
        chatEvidence = [...chatEvidence, ...persisted.filter((e: any) => !existingIds.has(e.id))];
      } catch (e: any) {
        console.warn("Chat evidence Firestore read failed:", e.message);
      }
    }
    const visibleChatEvidence = chatEvidence
      .filter((e: any) => user.allowedZones.includes(e.zone))
      .slice(0, 20);
    const message: string | undefined = Array.isArray(messages)
      ? [...messages].reverse().find((m: any) => m.role === "user")?.content
      : undefined;

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
      await writeAuditLog({
        action: "Chat",
        actor: user.uid,
        workspaceId,
        verdict: "DENY",
        trigger_reason: inspection.reason,
        evidence_ids: [],
        requestId,
      });
      emit({ type: "RUN_ERROR", threadId, runId, message: "Security violation detected." });
      return res.end();
    }

    const messageId = crypto.randomUUID();
    emit({ type: "RUN_STARTED", threadId, runId });
    emit({ type: "TEXT_MESSAGE_START", messageId });

    try {
      const stream = await genAI.models.generateContentStream({
        model: "gemini-1.5-pro",
        contents: [
          {
            role: "user",
            parts: [
              { text: CHAT_SYSTEM_PROMPT },
              { text: `Workspace: ${ws?.name ?? workspaceId}\nProject evidence: ${JSON.stringify(visibleChatEvidence)}\n\nUser question: ${message}` },
            ],
          },
        ],
        config: { maxOutputTokens: 600 },
      });

      for await (const chunk of stream) {
        const delta = chunk.text ?? "";
        if (delta) emit({ type: "TEXT_MESSAGE_CONTENT", messageId, delta });
      }

      emit({ type: "TEXT_MESSAGE_END", messageId });
      emit({ type: "RUN_FINISHED", threadId, runId });

      await writeAuditLog({
        action: "Chat",
        actor: user.uid,
        workspaceId,
        verdict: "ALLOW",
        trigger_reason: "Standard Chat",
        evidence_ids: [],
        requestId,
      });
    } catch (error) {
      emit({ type: "RUN_ERROR", threadId, runId, message: "Chat failed." });
    }

    res.end();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*all", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  return app;
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  const PORT = parseInt(process.env.PORT ?? "3000", 10);
  createApp().then((app) => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Angela server running on http://localhost:${PORT}`);
    });
  });
}

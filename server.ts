import "dotenv/config";
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
  if (process.env.DEMO_MODE === "true") {
    const demoRole = ((req.headers["x-demo-role"] as string) || "analyst").toLowerCase();
    const role = ROLE_ZONES[demoRole] ? demoRole : "analyst";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractJson(raw: string): string {
  const stripped = raw.replace(/```json|```/g, "").replace(/<think>[\s\S]*?<\/think>/g, "");
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return stripped.slice(start, end + 1);
  return stripped.trim();
}

// ─── Demo simulation responses ────────────────────────────────────────────────

const DEMO_SIM = process.env.DEMO_SIM === "true";

const SIM_INTAKE = {
  artifact_type: "planning_report",
  domain: "Planning and approvals",
  confidence: 0.94,
  key_entities: ["Harbour Tower Extension", "Dr. Chen Wei", "James Miller", "Aug 2024", "$38.6M", "14-floor extension", "North facade"],
  risk_signals: ["Structural Podium Failure", "Planning Approval Delay", "North facade setback objections", "Contractor rates void after Oct 2024"],
  recommended_zone: "diagnostic",
};

const SIM_DIAGNOSIS = {
  hypothesis: "Planning approval is at high risk of delay due to unresolved North facade setback objections from neighbouring residents and an incomplete authority pre-consultation process. If approval is delayed past October 2024, locked-in contractor rates will void, increasing project cost by an estimated 12–18%.",
  confidence: 0.87,
  evidence_map: ["RSK-01", "RSK-02", "DEC-03", "EV-DEMO"],
  missing_evidence: [
    "Council's written response to revised setback drawings",
    "Pre-consultation meeting notes with planning authority",
    "Structural peer review outcome from Dr. Chen Wei",
  ],
  strategic_advice: "Resolving the setback objections and structural review in parallel is critical. Delaying either will cascade into contractor rate voids (RSK-03) and potential wind tunnel re-testing (RSK-04) if the form factor changes again.",
  next_actions: [
    "Request formal written response from council on revised North facade setbacks",
    "Expedite Dr. Chen Wei structural peer review — target completion before October 2024",
    "Initiate authority pre-consultation to surface any remaining planning objections early",
  ],
};

const SIM_DRAFT = {
  title: "Planning Approval Risk Brief — Harbour Tower Extension",
  executive_summary: "The Harbour Tower Extension faces a high-probability planning approval delay driven by unresolved North facade setback objections and an incomplete structural peer review. If not resolved before October 2024, locked-in contractor rates will void, adding an estimated 12–18% to project cost. Immediate action is required on two parallel tracks: council engagement on setbacks and expedited structural review.",
  findings: [
    { claim: "Council objections to North facade setbacks remain unresolved following the revised 14-floor form factor submission.", evidence_id: "DEC-03", confidence: 0.91 },
    { claim: "Structural podium load capacity for the 14-floor extension has not yet been independently verified by Dr. Chen Wei.", evidence_id: "RSK-01", confidence: 0.88 },
    { claim: "Contractor rates are locked until October 2024. A planning delay beyond this date voids the current rates.", evidence_id: "RSK-02", confidence: 0.95 },
    { claim: "Wind tunnel testing commissioned by James Miller may need to be repeated if the North facade form factor changes due to setback compliance.", evidence_id: "EV-DEMO", confidence: 0.74 },
  ],
  recommendations: [
    { action: "Request formal written council response on North facade setbacks within 10 business days.", rationale: "Unresolved objections are the primary blocker to planning approval. Written response sets a clear negotiation baseline." },
    { action: "Expedite Dr. Chen Wei structural peer review with a hard deadline of September 2024.", rationale: "Approval cannot proceed without independent structural sign-off. Delay cascades into contractor rate voids." },
    { action: "Initiate authority pre-consultation immediately to surface any further objections before formal lodgement.", rationale: "Pre-consultation reduces the risk of late-stage plan rejections that would require form factor changes and trigger wind tunnel re-testing." },
  ],
  missing_evidence: [
    "Council written response to revised setback drawings",
    "Dr. Chen Wei structural peer review report",
    "Authority pre-consultation meeting notes",
  ],
};

// ─── LLM + Embedding helpers ──────────────────────────────────────────────────

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:4b";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "embeddinggemma:300m";
// For demo: set GEMINI_EMBED_MODEL=gemini-embedding-exp-03-07 (or latest Gemini Embedding 2 ID)
const GEMINI_EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

async function embedText(text: string): Promise<number[]> {
  // Use Gemini Embedding 2 if configured, else fall back to local Ollama
  if (GEMINI_EMBED_MODEL && GEMINI_API_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: `models/${GEMINI_EMBED_MODEL}`, content: { parts: [{ text }] } }),
      }
    );
    if (!res.ok) throw new Error(`Gemini embed error: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    return data.embedding.values as number[];
  }
  // Ollama fallback
  const res = await fetch(`${OLLAMA_BASE}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`Ollama embed error: ${res.status} ${await res.text()}`);
  const data: any = await res.json();
  return (data.embeddings?.[0] ?? data.embedding) as number[];
}

function semanticTopK(
  queryVec: number[],
  evidence: any[],
  k = 8
): any[] {
  return evidence
    .map((e) => ({ e, score: e.vector ? cosineSimilarity(queryVec, e.vector) : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ e }) => e);
}

const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const GEMINI_FLASH = "gemini-2.0-flash";

async function llmGenerate(systemPrompt: string, userPrompt: string): Promise<string> {
  if (genAI) {
    const result = await genAI.models.generateContent({
      model: GEMINI_FLASH,
      config: { systemInstruction: systemPrompt },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });
    return result.text ?? "";
  }
  // Ollama fallback
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options: { temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  const data: any = await res.json();
  return data.message?.content ?? "";
}

async function* llmStream(systemPrompt: string, userPrompt: string): AsyncGenerator<string> {
  if (genAI) {
    const stream = await genAI.models.generateContentStream({
      model: GEMINI_FLASH,
      config: { systemInstruction: systemPrompt },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });
    for await (const chunk of stream) {
      const delta = chunk.text ?? "";
      if (delta) yield delta;
    }
    return;
  }
  // Ollama fallback
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options: { temperature: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama stream error: ${res.status}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split("\n").filter(Boolean)) {
      try {
        const obj = JSON.parse(line);
        if (obj.message?.content) yield obj.message.content;
      } catch {}
    }
  }
}

// ─── App factory ──────────────────────────────────────────────────────────────

export async function createApp() {
  const app = express();

  app.use(express.json());

  // GET /api/health — no auth
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "Angela",
      model: genAI ? GEMINI_FLASH : OLLAMA_MODEL,
    });
  });

  // GET /api/workspace/:id
  app.get("/api/workspace/:id", requireAuth(), (req, res) => {
    const ws = workspaces[req.params.id as keyof typeof workspaces];
    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    const user = (req as any).user as UserContext;
    const data = {
      ...ws.data,
      name: ws.name,
      documents: ws.data.documents?.filter((d: any) => !d.zone || user.allowedZones.includes(d.zone)),
    };
    res.json(data);
  });

  // POST /api/ingest
  app.post("/api/ingest", requireAuth(), rateLimit(), async (req, res) => {
    const user = (req as any).user as UserContext;
    if (user.role !== "admin") {
      return res.status(403).json({ error: "insufficient_clearance" });
    }
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

      let intakeData: any;
      if (DEMO_SIM) {
        intakeData = SIM_INTAKE;
      } else {
        const responseText = await llmGenerate(
          INTAKE_SYSTEM_PROMPT,
          `Process following payload from ${source}: ${payload}`
        );
        const cleanedJson = extractJson(responseText);
        try {
          intakeData = JSON.parse(cleanedJson);
        } catch {
          return res.status(422).json({ error: "classification_parse_failed", raw: responseText.slice(0, 200) });
        }
      }

      const newId = `EV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      let vector: number[] | undefined;
      try {
        vector = await embedText(payload);
      } catch (e: any) {
        console.warn("Embedding failed, evidence stored without vector:", e.message);
      }
      const VALID_ZONES = new Set(["public", "diagnostic", "restricted"]);
      const zone = VALID_ZONES.has(intakeData.recommended_zone) ? intakeData.recommended_zone : "diagnostic";
      const newEntry: any = {
        id: newId,
        content: payload,
        zone,
        metadata: intakeData,
        tags: [],
        timestamp: new Date().toISOString(),
        ...(vector ? { vector } : {}),
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
      if (typeof context !== "string" || !context.trim()) {
        return res.status(400).json({ error: "context must be a non-empty string" });
      }
      const inspection = inspectPrompt(context);
      if (!inspection.safe) {
        await writeAuditLog({ action: "Diagnosis", actor: (req as any).user.uid, workspaceId, verdict: "DENY", trigger_reason: inspection.reason!, evidence_ids: [], requestId });
        return res.status(403).json({ error: "Security violation detected.", reason: inspection.reason });
      }
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

      // Semantic retrieval — embed the query and find the most relevant evidence
      let relevantEvidence = visibleEvidence;
      try {
        const queryVec = await embedText(context);
        relevantEvidence = semanticTopK(queryVec, visibleEvidence, 8);
      } catch (e: any) {
        console.warn("Semantic search failed, using full evidence set:", e.message);
      }

      const prompt = `
        Allowed Zones: ${user.allowedZones.join(", ")}
        Available Evidence: ${JSON.stringify(relevantEvidence)}

        User Request: ${context}
      `;

      let diagnosis: any;
      if (DEMO_SIM) {
        diagnosis = SIM_DIAGNOSIS;
      } else {
        const responseText = await llmGenerate(DIAGNOSIS_SYSTEM_PROMPT, prompt);
        const cleanedJson = extractJson(responseText);
        try {
          diagnosis = JSON.parse(cleanedJson);
        } catch {
          return res.status(422).json({ error: "diagnosis_parse_failed", raw: responseText.slice(0, 200) });
        }
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

      let draft: any;
      if (DEMO_SIM) {
        draft = SIM_DRAFT;
      } else {
        const responseText = await llmGenerate(
          DRAFT_SYSTEM_PROMPT,
          `Diagnosis:\n${JSON.stringify(diagnosis)}`
        );
        const cleanedJson = extractJson(responseText);
        try {
          draft = JSON.parse(cleanedJson);
        } catch {
          return res.status(422).json({ error: "draft_generation_failed", raw: responseText });
        }
        if (draft.error === "insufficient_evidence_for_draft") {
          return res.status(200).json({ error: "insufficient_evidence_for_draft" });
        }
        if (!draft.findings || !draft.executive_summary) {
          return res.status(422).json({ error: "draft_generation_failed", raw: responseText });
        }
        if (diagnosis.evidence_map) {
          const validIds = new Set(Object.keys(diagnosis.evidence_map));
          draft.findings = draft.findings.map((f: any) => {
            if (f.evidence_id && !validIds.has(f.evidence_id)) {
              const { evidence_id, ...rest } = f;
              return rest;
            }
            return f;
          });
        }
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
    const message: string | undefined = Array.isArray(messages)
      ? [...messages].reverse().find((m: any) => m.role === "user")?.content
      : undefined;

    const zoneFilteredEvidence = chatEvidence.filter((e: any) => user.allowedZones.includes(e.zone));
    let visibleChatEvidence = zoneFilteredEvidence;
    if (typeof message === "string" && message.trim()) {
      try {
        const queryVec = await embedText(message);
        visibleChatEvidence = semanticTopK(queryVec, zoneFilteredEvidence, 8);
      } catch (e: any) {
        console.warn("Chat semantic search failed, using full set:", e.message);
        visibleChatEvidence = zoneFilteredEvidence.slice(0, 20);
      }
    }

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
      const stream = llmStream(
        CHAT_SYSTEM_PROMPT,
        `Workspace: ${ws?.name ?? workspaceId}\nProject evidence: ${JSON.stringify(visibleChatEvidence)}\n\nUser question: ${message}`
      );

      for await (const delta of stream) {
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
    } catch (error: any) {
      const isDown = error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED');
      emit({
        type: "RUN_ERROR",
        threadId,
        runId,
        message: isDown
          ? "AI service is unreachable. Check that Ollama is running, then try again."
          : "Chat failed. Please try again.",
      });
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

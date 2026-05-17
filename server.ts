import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { INTAKE_SYSTEM_PROMPT, DIAGNOSIS_SYSTEM_PROMPT } from "./src/lib/prompts.ts";
import { inspectPrompt } from "./src/lib/security.ts";
import { harbourTowerData, facilitiesData, enterpriseData } from "./src/lib/internal_databases.ts";

const auditLogs: any[] = [];

// Convert our data into evidence stores for the AI endpoints
const workspaces = {
  "harbour-tower": {
    name: "Harbour Tower Extension",
    data: harbourTowerData,
    evidenceStore: harbourTowerData.documents.map(d => ({
      id: d.id,
      zone: d.tags.includes("risk") || d.tags.includes("finance") ? "restricted" : "diagnostic",
      content: `${d.fileName} - ${d.tags.join(', ')}`,
      tags: d.tags
    })).concat(harbourTowerData.risks.map(r => ({
      id: r.id,
      zone: "public",
      content: `Risk: ${r.riskTitle} - ${r.description}`,
      tags: ["risk"]
    })))
  },
  "facilities": {
    name: "Facilities Management Domain",
    data: facilitiesData,
    evidenceStore: facilitiesData.documents || []
  },
  "enterprise": {
    name: "Enterprise Operational Data",
    data: enterpriseData,
    evidenceStore: enterpriseData.documents || []
  }
};

export async function createApp() {
  const app = express();

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set. AI features will fail.");
  }
  const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

  app.use(express.json());

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Angela" });
  });

  app.get("/api/workspace/:id", (req, res) => {
    const ws = workspaces[req.params.id as keyof typeof workspaces];
    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json({ ...ws.data, name: ws.name });
  });

  // API Route: Secure Ingestion Workflow (Task 1.2)
  app.post("/api/ingest", async (req, res) => {
    try {
      const { payload, source, role, workspaceId = "harbour-tower" } = req.body;
      const ws = workspaces[workspaceId as keyof typeof workspaces];
      
      const inspection = inspectPrompt(payload);
      if (!inspection.safe) {
        auditLogs.unshift({
          id: `AUD-${Math.floor(Math.random() * 10000)}`,
          action: "Ingestion",
          actor: role || "Unknown",
          verdict: "DENY",
          trigger_reason: inspection.reason,
          evidence_ids: [],
          timestamp: new Date().toISOString()
        });
        return res.status(403).json({ error: "Security violation detected in payload.", reason: inspection.reason });
      }

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          { role: 'user', parts: [
            { text: INTAKE_SYSTEM_PROMPT },
            { text: `Process following payload from ${source}: ${payload}` }
          ]}
        ],
        config: { maxOutputTokens: 250 }
      });
      
      const responseText = result.text || "";
      const cleanedJson = responseText.replace(/```json|```/g, "").trim();
      const intakeData = JSON.parse(cleanedJson);

      const newId = `EV-${Math.floor(Math.random() * 900) + 100}`;
      const newEntry = {
        id: newId,
        content: payload,
        zone: "diagnostic",
        metadata: intakeData,
        tags: [],
        timestamp: new Date().toISOString()
      };
      
      if (ws) ws.evidenceStore.push(newEntry);

      auditLogs.unshift({
        id: `AUD-${Math.floor(Math.random() * 10000)}`,
        action: "Ingestion",
        actor: role || "Unknown",
        verdict: "ALLOW",
        trigger_reason: "Standard Ingestion",
        evidence_ids: [newId],
        timestamp: new Date().toISOString()
      });

      res.json({
        status: "success",
        trace_id: `TRC-${newId}`,
        data: intakeData
      });
    } catch (error) {
      console.error("Ingestion failed:", error);
      res.status(500).json({ error: "Ingestion failed" });
    }
  });

  // API Route: Diagnosis (Task 3.1 & 3.2 logic)
  app.post("/api/diagnose", async (req, res) => {
    try {
      const { context, clearance, role, workspaceId = "harbour-tower" } = req.body;
      const ws = workspaces[workspaceId as keyof typeof workspaces];
      const evidenceStore = ws ? ws.evidenceStore : [];
      
      const inspection = inspectPrompt(context);
      if (!inspection.safe) {
        // Log security denial
        auditLogs.unshift({
          id: `AUD-${Math.floor(Math.random() * 10000)}`,
          action: "Diagnosis Generation",
          actor: role || "Unknown",
          verdict: "DENY",
          trigger_reason: inspection.reason,
          evidence_ids: [],
          timestamp: new Date().toISOString()
        });
        return res.status(403).json({ error: "Security violation detected in diagnosis context.", reason: inspection.reason });
      }

      // Filter evidence by clearance
      const visibleEvidence = evidenceStore.filter(e => {
        if (clearance === "restricted") return true;
        if (clearance === "diagnostic") return e.zone !== "restricted";
        return e.zone === "public";
      });

      const restrictedCount = evidenceStore.length - visibleEvidence.length;

      const prompt = `
        Current Clearance Level: ${clearance}
        Available Evidence: ${JSON.stringify(visibleEvidence)}
        
        User Request: ${context}
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: [
          { role: 'user', parts: [
            { text: DIAGNOSIS_SYSTEM_PROMPT },
            { text: prompt }
          ]}
        ],
        config: { maxOutputTokens: 250 }
      });

      const responseText = result.text || "";
      const cleanedJson = responseText.replace(/```json|```/g, "").trim();
      const diagnosis = JSON.parse(cleanedJson);

      // Log the event (Task 3.3)
      const auditEntry = {
        id: `AUD-${Math.floor(Math.random() * 10000)}`,
        action: "Diagnosis Generation",
        actor: role || "Unknown",
        verdict: "ALLOW",
        trigger_reason: "Standard Query",
        evidence_ids: diagnosis.evidence_map,
        timestamp: new Date().toISOString()
      };
      auditLogs.unshift(auditEntry);

      // Map evidence IDs to full objects for the client
      const citedEvidence = visibleEvidence.filter(e => diagnosis.evidence_map.includes(e.id));

      res.json({
        ...diagnosis,
        cited_evidence_details: citedEvidence,
        metadata: {
          visible_evidence_count: visibleEvidence.length,
          restricted_evidence_count: restrictedCount
        }
      });
    } catch (error) {
      console.error("Diagnosis failed:", error);
      res.status(500).json({ error: "Diagnosis failed" });
    }
  });

  app.get("/api/logs", (req, res) => {
    res.json(auditLogs);
  });

  // API Route: Chat/Advisory
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, role, workspaceId = "harbour-tower" } = req.body;

      const inspection = inspectPrompt(message);
      if (!inspection.safe) {
        auditLogs.unshift({
          id: `AUD-${Math.floor(Math.random() * 10000)}`,
          action: "Chat",
          actor: role || "Unknown",
          verdict: "DENY",
          trigger_reason: inspection.reason,
          evidence_ids: [],
          timestamp: new Date().toISOString()
        });
        return res.status(403).json({ error: "Security violation detected in chat message.", reason: inspection.reason });
      }

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: [
          { role: 'user', parts: [
            { text: "You are Angela, an advisory copilot. Respond contextually and point out OPEX/Strategic hits if relevant." },
            { text: message }
          ]}
        ],
        config: { maxOutputTokens: 250 }
      });

      auditLogs.unshift({
        id: `AUD-${Math.floor(Math.random() * 10000)}`,
        action: "Chat",
        actor: role || "Unknown",
        verdict: "ALLOW",
        trigger_reason: "Standard Chat",
        evidence_ids: [],
        timestamp: new Date().toISOString()
      });

      res.json({
        reply: result.text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Chat failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*all', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  return app;
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  const PORT = 3000;
  createApp().then(app => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Angela server running on http://localhost:${PORT}`);
    });
  });
}

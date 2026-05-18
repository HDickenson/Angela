# Angela: Comprehensive Review & Feature Tracker

## 1. Overview
Angela is a "Diagnosis-First" enterprise AI assistant designed for secure, trace-based operational and strategic advisory. Unlike standard chatbots, Angela is bound by a strict Constitution that prioritizes evidence mapping, structured reasoning, and multi-layered security (e.g., the Lobster Trap prompt inspection proxy) over freewheeling generative text. 

This document tracks the core user stories against the developed output of Angela v1.0.

---

## 2. User Profiles

The system currently simulates a Role-Based Access Control (RBAC) model mapping directly to data clearance levels.

### **Profile 1: Triage Analyst (`triage_analyst`)**
* **Clearance**: `diagnostic` and `public` zones.
* **Responsibilities**: Frontline incident ingestion, initial log review, and drafting preliminary OPEX or technical hypotheses.
* **Limitations**: Automatically restricted from viewing internal security audits, PII, or `restricted`-zone evidence. If the AI aggregates a finding requiring restricted contexts, the Triage Analyst uses the system's "missing evidence" markers to know they need an escalation.

### **Profile 2: Reviewer (`reviewer`)**
* **Clearance**: `restricted`, `diagnostic`, and `public` zones.
* **Responsibilities**: Escalation management, final strategic approval of draft reports, and deep-dive diagnosis into highly confidential internal data (e.g., tenant isolation leaks, unpatched edge cases).
* **Limitations**: Still bound by the Lobster Trap safety constraints mapping to enterprise perimeter policies.

---

## 3. Feature Tracker & Development Status

### 3.1 Case Intake & Logic (P0)
* **User Story**: As a Triage Analyst, I want to paste raw log outputs or incident descriptions into the system so that the AI can instantly extract severity, affected entities, and follow-up troubleshooting questions.
* **Implementation Status**: **✅ Done.** The application leverages a robust `/api/ingest` route using `gemini-1.5-flash` to structure raw text via the `INTAKE_SYSTEM_PROMPT`.

### 3.2 Evidence Management & Access Control (P0)
* **User Story**: As a Reviewer, I need evidence strictly partitioned into zones so that Analysts cannot query or hallucinate their way into confidential data.
* **Implementation Status**: **✅ Done.** The `evidenceStore` accurately blocks datasets based on role context (`triage_analyst` vs `reviewer`).

### 3.3 Diagnosis & Drafting (P0)
* **User Story**: As a Reviewer, I want the AI to formulate an operational hypothesis and provide a structured markdown report, BUT it must explicitly cite the evidence IDs used to ensure truthfulness.
* **Implementation Status: ✅ Done (Full Pipeline).** The `/api/diagnose` endpoint generates structured JSON with evidence citations and stores each diagnosis with a UUID. The new `/api/draft` endpoint accepts a `diagnosisId` and generates a structured report via `DRAFT_SYSTEM_PROMPT`, with all claims traceable to evidence IDs. The frontend surfaces this via a 'Generate Draft Report' button in `AdvisorPanel` and displays the output in `DraftModal.tsx`.

### 3.4 Trust & Security "Lobster Trap" (P0)
* **User Story**: As a System Architect, I want a deterministic security layer intercepting all inbound inference requests to block "Dirty Dozen" prompt injections before they reach the GenAI API limit.
* **Implementation Status**: **✅ Done.** Fully functional heuristic interceptor. Real-time blocking of directives ("override previous rules"), SQL injections ("DROP TABLE"), and credential fishing. Evaluated via a dedicated tab ("Lobster Trap") and automated via `Vitest`.

### 3.6 Draft Generator (P0)
* **User Story**: As an Analyst, I want to generate a client-ready structured report from a diagnosis, with every claim traceable to a specific evidence ID.
* **Implementation Status**: **✅ Done.** `POST /api/draft` in `server.ts` accepts a `diagnosisId`, loads the stored diagnosis from memory (or Firestore), and generates a structured report via `DRAFT_SYSTEM_PROMPT` with Gemini Flash. Output includes `title`, `executive_summary`, `findings` (each with `evidence_id` and `confidence`), `recommendations`, and `missing_evidence`. Returns 422 if output is malformed.

### 3.5 Data Ingestion & Research (P1)
* **User Story**: As a Triage Analyst, I want to quickly simulate SEC financial advisories alongside internal Loghub telemetry to understand the OPEX impact of system outages.
* **Implementation Status**: **✅ Done.** "Simulate Incident" and "Get Public Intel" buttons provide one-click ingestion tests linking SEC/Loghub vectors.

---

## 4. Comparison to Developed Output

### **Successes & Adherence to Constitution**
1. **Never Invent Facts**: The developed JSON schema mandates the `evidence_map` and `missing_evidence` properties. Angela cannot generate a conclusion without citing existing system arrays.
2. **Security as a Demo**: The UI beautifully highlights "Confidence Scores" with Red/Amber/Green indicators and a pulse animation for reviews `< 90%` confidence. The "Audit & Outcome" table stores all inspection metrics clearly.
3. **Structured Outputs First**: `INTAKE_SYSTEM_PROMPT` and `DIAGNOSIS_SYSTEM_PROMPT` enforce machine-readable interfaces separating backend logic from generative flow.

### **Areas for Future Work (Stretch Goals / Backlog)**
1. **Persistent State (Database Integration)**: **Partially Done** — Audit logs and diagnoses now persist to Firestore when `FIREBASE_SERVICE_ACCOUNT_KEY` is configured. Remaining: migrate evidence store from hardcoded `internal_databases.ts` constants to Firestore for multi-session accumulation.
2. **Voice Interaction Modality**: The Constitution prescribes "Voice Second". The frontend is purely "Text First" chat today; WebRTC or Live API configurations are needed for the voice stretch goal.
3. **Formal OAuth Identities**: The current roles use `import.meta.env` and hardcoded toggle states. Full `signInWithOauth` integration mapped to enterprise identity providers (OIDC/SAML) is the logical next component.

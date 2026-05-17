# Hackathon Rules & Security Enforcement

This document outlines the strict guidelines and constraints for the Angela v1.0 prototype developed for the enterprise hackathon. These rules are derived directly from the enterprise compliance office and hackathon committee. 

## ⚠️ PROHIBITED ACTIONS

1. **Implement security checks at the model level (e.g., adding LLM security layers)**
   * **Why:** The enterprise architecture relies on strict internal security routing. Adding another LLM for security introduces unpredictability, latency, and violates the "direct trace" mandate.
   * **Implementation:** We enforce security directly via string-matching rules and RBAC, routing clean requests directly to Gemini 1.5 Pro.

2. **Route diagnosis queries through Lobster Trap**
   * **Why:** Diagnosis must be **DIRECT** to `gemini-1.5-pro` for maximum reasoning capability without arbitrary intermediary translation. The Lobster Trap module is restricted to drafting/chat safety checks. 
   * **Implementation:** The `/api/diagnose` route directly invokes the Gemini API using `DIAGNOSIS_SYSTEM_PROMPT`.

3. **Generate evidence IDs without traceable data sources**
   * **Why:** Halucinated evidence destroys trust. Every strategic recommendation must point to a real document or data point inside the approved internal databases.
   * **Implementation:** Prompt engineering rigorously forces the model to include an `evidence_id` mapped strictly from the provided context chunks.

4. **Use public internet sources for demo data**
   * **Why:** The prototype must demonstrate utility on proprietary, siloed enterprise data, not public knowledge. 
   * **Implementation:** All context is hardcoded in `src/lib/internal_databases.ts`. External database lookups and searches are prohibited.

5. **Skip the security denial test**
   * **Why:** Earning enterprise approval requires demonstrating robust guardrails. If the system fails to block a malicious request, it loses credibility.
   * **Implementation:** `src/lib/security.ts` acts as the deterministic filter for "sensitive" or "confidential" requests.

6. **Add role-based access control beyond the 3 roles (admin/analyst/user)**
   * **Why:** Complexity kills hackathon demos. Limiting the system to three core roles ensures clear, observable separation of concerns.
   * **Implementation:** RBAC is strictly scoped. Admins ingest, Analysts access diagnostic zones, Users access public zones.

## ✅ NON-NEGOTIABLE REQUIREMENTS

| Requirement | Why it is implemented | Technical Implementation |
|-------------|-----------------------|--------------------------|
| **Direct Diagnosis Processing** | Lobster Trap handles safety and prompt alignment, but reasoning must happen through the primary model to ensure auditability of the logic tree. | `/api/diagnose` bypasses auxiliary LLM wrappers and interacts directly with `gemini-1.5-pro`. |
| **Evidence Traceability** | Trust relies on verification. Without a direct link back to a source file, Angela is perceived as an oracle rather than an assistant. | Outputs require `evidence_id` fields citing records from `internal_databases.ts`. |
| **Targeted Security Denial** | We must demonstrate precise blocking without false positives across standard operations. | `src/lib/security.ts` blocks any prompt matching `/sensitive\|confidential/i`. |
| **Hardcoded Internal Data** | The enterprise security review forbids connecting pre-production applications to live operational stores or public internet scraping. | `harbourTowerData`, `facilitiesData`, and `enterpriseData` serve as the absolute truth source. |
| **Rigid Audit Logging** | Actionability relies on accountability. If the app acts, it must be logged. | The `auditLogs` array consistently records the `verdict`, `trigger_reason`, `evidence_ids`, and `actor` for every transaction. |
| **Hard Token Limits (250)** | Hackathon cost controls, latency budgets, and enforcing concise, actionable responses. | `config: { maxOutputTokens: 250 }` is appended to all `genAI.models.generateContent` calls. |

## 📅 Hackathon Deadlines & Milestones Completed

- **Day 1:** Constitution & Security Rules (✅ Completed via `SECURITY_PATTERNS` & `docs/CONSTITUTION.md`)
- **Day 2:** Demo data ready & Security Denial Test (✅ Completed via `internal_databases.ts` & `src/lib/security.ts`)
- **Day 3:** Full audit trail & role-based filtering (✅ Completed via `auditLogs` push interceptors in `server.ts` & RBAC zone filtering `public`/`diagnostic`/`restricted`)

## 💡 The "Why": Enterprise Review Constraints

Failure to adhere to these boundaries presents specific risks defined by the security and governance teams:

* **Non-compliant Architecture:** Introducing prohibited actions (like extra LLMs) will cause Angela to fail the final Enterprise Security Review.
* **Lack of Traceability:** If non-negotiables like `evidence_id` citations are omitted, the "traceability" promise breaks, resulting in an immediate failure of the governance audit.
* **Loss of Hackathon Points:** Mismanaging timelines and skipping the interactive demo data features and security test will cause the team to forfeit essential hackathon scoring criteria.

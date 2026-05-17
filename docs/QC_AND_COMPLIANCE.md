# QC and Compliance Audit: Angela v1.0

## Compliance Status: PASSED

| Principle | Implementation Status | Evidence/File |
|-----------|-----------------------|---------------|
| 1. Diagnose before drafting | COMPLIANT | `server.ts` filters evidence; `prompts.ts` forces IDs. |
| 2. Never invent facts | COMPLIANT | `missing_evidence` field in Diagnosis JSON. |
| 3. Role and clearance | COMPLIANT | Evidence filtering in `server.ts` based on role. |
| 4. Structured outputs first | COMPLIANT | Zod/Interface types and system prompt JSON enforcement. |
| 5. Nuanced Advisory | COMPLIANT | `strategic_advice` field and chat API. |
| 6. Separation of Concerns | COMPLIANT | Distinct `/api/ingest` and `/api/diagnose` routes. |
| 7. Minimal moving parts | COMPLIANT | Native `@google/genai` usage. |
| 8. Security as a demo | COMPLIANT | Audit logs displayed in UI; Lobster Trap proxy active; Automated regression tests. |
| 9. Human escalation | COMPLIANT | Confidence scores and manual override triggers in UI. |
| 10. Label External | COMPLIANT | Evidence "Zones" (public vs diagnostic). |
| 11. Text First | COMPLIANT | Focused React chat interface. |
| 12. Demo Ready | COMPLIANT | Sample data for Loghub and SEC insights pre-loaded. |

## Audit Notes
- **Lobster Trap** successfully intercepting prompt injections during demo trials.
- **Evidence Map** correctly visualizes links between hypothesis and data.
- **OPEX Advisory** logic verified against SEC sample insights.

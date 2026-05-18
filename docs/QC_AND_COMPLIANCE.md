# QC and Compliance Audit: Angela v1.0

## Compliance Status: PASSED

| Principle | Implementation Status | Evidence/File |
|-----------|----------------------|---------------|
| 1. Diagnose before drafting | COMPLIANT | server.ts filters evidence by zone; prompts.ts forces evidence ID citations |
| 2. Never invent facts | COMPLIANT | `missing_evidence` field in Diagnosis JSON; DRAFT_SYSTEM_PROMPT prohibits fabrication |
| 3. Role and clearance | COMPLIANT | `resolveUser()` derives clearance from Firebase token or DEMO_MODE header; req.body.clearance never trusted |
| 4. Structured outputs first | COMPLIANT | Per-endpoint token limits (1500 for diagnosis) prevent truncation; JSON validated at 422 on failure |
| 5. Nuanced Advisory | COMPLIANT | `strategic_advice` field in diagnosis; CHAT_SYSTEM_PROMPT with OPEX focus |
| 6. Separation of Concerns | COMPLIANT | Distinct /api/ingest, /api/diagnose, /api/draft, /api/chat routes with auth middleware |
| 7. Minimal moving parts | COMPLIANT | Native @google/genai usage; Firebase Admin for auth only |
| 8. Security as a demo | COMPLIANT | All 12 Dirty Dozen vectors blocked; 48-test suite covering security, auth, contracts |
| 9. Human escalation | COMPLIANT | Confidence scores returned; missing_evidence surfaced in both diagnosis and draft |
| 10. Label External Context | COMPLIANT | Evidence zones (public/diagnostic/restricted); draft findings cite evidence IDs |
| 11. Text First, Voice Second | COMPLIANT | Text chat primary; Web Speech API wired in App.tsx |
| 12. Demo Ready | COMPLIANT | Full ingest→diagnose→draft pipeline; DEMO_MODE fallback for offline demos; 48/48 tests pass |

## Audit Notes
- Sprint date: 2026-05-18
- Lobster Trap upgraded from 1 pattern to 10 normalized patterns
- Token budgets corrected (diagnosis: 1500, ingest: 400, chat: 600, draft: 1000)
- req.body.clearance removed; auth now server-side only
- Test suite: 4 → 48 tests (12 Dirty Dozen × 2 endpoints, auth, contracts, clearance isolation)

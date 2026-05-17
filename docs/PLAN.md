# Angela Technical Plan

## Architecture
- **Ingestion Service (Server-Side):** Secure, server-side only workflow for data cleaning, sanitization, and evidence indexing.
- **Workspace Agent (Client-Facing):** Intranet-accessible React application using AI SDK UI.
- **AI Core:** Gemini 1.5 Pro (for complex diagnosis) and Flash (for intake/drafting).
- **Security:** "Lobster Trap" inspection layer + RBAC + Ingestion validation.
- **Schemas:** JSON Schema for evidence packets, diagnosis outputs, and audit logs.

## Implementation Phases
### Phase 1: Core Engine
- [ ] Setup Express server and basic routing.
- [ ] Implement Gemini generation helpers with structured outputs.
- [ ] Build basic UI for case intake and diagnosis display.

### Phase 2: Security & RBAC
- [ ] Define "Data Zones" and user clearance levels.
- [ ] Implement policy middleware for filtering evidence per role.
- [ ] Add audit logging for all AI-generated conclusions.

### Phase 3: Drafting & Polish
- [ ] Build document drafting engine using diagnosis context.
- [ ] Refine UI with `motion` for fluid generative transitions.
- [ ] (Stretch) Implement voice interaction via real-time protocols.

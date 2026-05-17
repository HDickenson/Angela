# Angela Product Specification

## Overview
Angela is a diagnosis-first enterprise copilot designed for the TechEx hackathon (Track 4: Data & Intelligence). It turns enterprise data into actionable intelligence by generating structured diagnostic outputs and providing nuanced conversational advice during tasks like proposal generation.

## Core Features (P0)
- **Secure Ingestion Workflow:** A server-side pipeline for processing evidence and case data, decoupled from the agent interface.
- **Workspace Intranet Agent:** The primary conversational interface for analysts, accessible through the enterprise intranet.
- **Clearance-Aware Retrieval:** Access evidence based on "Public", "Diagnostic", and "Restricted" zones.
- **Diagnosis Engine:** Generate structured hypotheses with confidence scores and explicit evidence mapping.
- **Nuanced Advisory (Chat):** Provides real-time insights during document generation (e.g., identifying OPEX spikes due to specific engineering choices).
- **Draft Generator:** Turn diagnoses into client-ready or operator-ready drafts with preserved metadata and advisory insights.
- **Security Trust Layer:** Integrated "Lobster Trap" style inspection for policy enforcement and auditability.

## User Roles
- **Analyst:** Submits cases, reviews diagnoses, generates drafts.
- **Reviewer:** Approves/corrects diagnoses, accesses restricted evidence.
- **Security Officer:** Monitors audit logs and policy enforcement (Lobster Trap).

## Success Metrics
1. **Traceability:** 100% of diagnostic claims cite specific evidence IDs.
2. **Security:** Zero leakage of "Restricted" data to "Analyst" roles.
3. **Integrity:** 100% of generator outputs align with the underlying diagnosis object.

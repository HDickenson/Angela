export const harbourTowerData = {
  stakeholders: [
    { id: "SH-01", fullName: "James Miller", initials: "JM", role: "Project Director", department: "Executive", coreFocus: "Profitability and timeline adherence for the $38.6M uplift." },
    { id: "SH-02", fullName: "Amelia Hart", initials: "AH", role: "Strategy & Proposals", department: "Commercial", coreFocus: "Managing council feedback and mitigating risks to ensure planning approval." },
    { id: "SH-03", fullName: "Dr. Chen Wei", initials: "CW", role: "Lead Structural Engineer", department: "Engineering", coreFocus: "Ensuring podium structural integrity under the load of 14 new floors." },
    { id: "SH-04", fullName: "Sarah Jenkins", initials: "SJ", role: "Chief Financial Officer", department: "Finance", coreFocus: "Preventing cost escalations and ensuring the financial model holds up against setbacks." }
  ],
  documents: [
    { id: "DOC-01", fileName: "HT_Extension_Planning_Proposal.pdf", fileType: "PDF", sizeMB: 12.4, uploadDate: "-30 days", uploadedBy: "SH-02", tags: ["planning", "proposal", "council"] },
    { id: "DOC-02", fileName: "Structural_Load_Review_v2.docx", fileType: "DOCX", sizeMB: 4.8, uploadDate: "-15 days", uploadedBy: "SH-03", tags: ["structural", "engineering", "risk"] },
    { id: "DOC-03", fileName: "Financial_Model_Uplift_Aug24.xlsx", fileType: "XLSX", sizeMB: 8.1, uploadDate: "-10 days", uploadedBy: "SH-04", tags: ["finance", "modeling", "budget"] },
    { id: "DOC-04", fileName: "Council_Feedback_Setbacks_Memo.pdf", fileType: "PDF", sizeMB: 1.2, uploadDate: "-5 days", uploadedBy: "SH-02", tags: ["council", "feedback", "compliance"] },
    { id: "DOC-05", fileName: "HT_Podium_As_Builts_1998.pdf", fileType: "PDF", sizeMB: 45.0, uploadDate: "-40 days", uploadedBy: "SH-03", tags: ["historical", "structural", "podium"] },
    { id: "DOC-06", fileName: "Wind_Tunnel_Test_Results.pdf", fileType: "PDF", sizeMB: 15.6, uploadDate: "-2 days", uploadedBy: "SH-03", tags: ["engineering", "aerodynamics", "risk"] }
  ],
  decisions: [
    { id: "DEC-01", decisionSummary: "Proceed with 14-floor model instead of 10-floor base case.", dateDecided: "July 15, 2024", decidedBy: "SH-01", rationale: "Financial modeling shows the $38.6M uplift is only viable with 14 floors to offset the podium reinforcement costs.", sourceDocumentId: "DOC-03", confidenceScore: 0.92 },
    { id: "DEC-02", decisionSummary: "Initiate independent structural peer review.", dateDecided: "August 2, 2024", decidedBy: "SH-03", rationale: "Given the age of the 1998 podium as-builts, independent verification of lateral load capacity is required.", sourceDocumentId: "DOC-05", confidenceScore: 0.85 },
    { id: "DEC-03", decisionSummary: "Alter podium setbacks on North facade.", dateDecided: "August 20, 2024", decidedBy: "SH-02", rationale: "Required to address direct feedback from the city council regarding waterfront sightlines.", sourceDocumentId: "DOC-04", confidenceScore: 0.76 },
    { id: "DEC-04", decisionSummary: "Commission additional wind tunnel testing.", dateDecided: "August 22, 2024", decidedBy: "SH-01", rationale: "Mitigate aerodynamic risks resulting from the new 14-floor form factor.", sourceDocumentId: "DOC-06", confidenceScore: 0.88 }
  ],
  risks: [
    { id: "RSK-01", riskTitle: "Structural Podium Failure", description: "Existing podium cannot support the lateral loads of the 14 new floors without significant, unbudgeted reinforcement.", impact: "High", likelihood: "Medium", riskScore: 15, mitigatingStakeholderId: "SH-03", confidenceScore: 0.72 },
    { id: "RSK-02", riskTitle: "Planning Approval Delay", description: "Council rejects the revised setbacks, delaying the project start date and voiding locked-in contractor rates.", impact: "High", likelihood: "Medium", riskScore: 12, mitigatingStakeholderId: "SH-02", confidenceScore: 0.81 },
    { id: "RSK-03", riskTitle: "Cost Escalation", description: "Supply chain issues increase the cost of specialized glass facades modeled in the $38.6M uplift figure.", impact: "Medium", likelihood: "High", riskScore: 10, mitigatingStakeholderId: "SH-04", confidenceScore: 0.65 },
    { id: "RSK-04", riskTitle: "Wind Load Discrepancies", description: "New wind tunnel results necessitate a redesign of the upper three floors' facade system.", impact: "High", likelihood: "Low", riskScore: 8, mitigatingStakeholderId: "SH-03", confidenceScore: 0.89 }
  ],
  timeline: [
    { id: "PH-01", phaseName: "Feasibility & Modeling", targetDate: "June 2024", status: "completed" },
    { id: "PH-02", phaseName: "Planning", targetDate: "August 2024", status: "active" },
    { id: "PH-03", phaseName: "Detailed Design", targetDate: "November 2024", status: "pending" },
    { id: "PH-04", phaseName: "Procurement", targetDate: "January 2025", status: "pending" },
    { id: "PH-05", phaseName: "Construction Start", targetDate: "April 2025", status: "pending" }
  ],
  chatContext: [
    { id: "MSG-01", sender: "user", messageText: "Angela, can you summarize the current structural risks holding up the Harbour Tower planning approval?", timestamp: "10:02 AM" },
    { id: "MSG-02", sender: "advisor", messageText: "Currently, the primary structural risk (RSK-01) involves the existing 1998 podium's capacity to handle lateral loads from the new 14 floors. Dr. Chen Wei initiated an independent peer review on Aug 2 based on the historical as-builts (DOC-05).", timestamp: "10:02 AM" },
    { id: "MSG-03", sender: "user", messageText: "Did the wind tunnel tests impact this?", timestamp: "10:04 AM" },
    { id: "MSG-04", sender: "advisor", messageText: "Yes, James Miller commissioned additional wind tunnel testing (DOC-06) on Aug 22 to mitigate aerodynamic risks. If discrepancies arise, it could necessitate a facade redesign (RSK-04).", timestamp: "10:04 AM" }
  ],
  canvas: {
    items: {
      overview: { id: 'overview', x: 0, y: 0, w: 220, h: 176, type: 'overview' },
      document: { id: 'document', x: 268, y: 0, w: 220, h: 176, type: 'document', dataId: 'DOC-01' },
      site: { id: 'site', x: 536, y: 0, w: 220, h: 176, type: 'site' },
      sheet: { id: 'sheet', x: 804, y: 0, w: 220, h: 176, type: 'sheet', dataId: 'DOC-03' },
      decision: { id: 'decision', x: 22, y: 205, w: 610, h: 168, type: 'decision' },
      risk: { id: 'risk', x: 678, y: 205, w: 332, h: 168, type: 'risk' },
      similar: { id: 'similar', x: 0, y: 405, w: 194, h: 210, type: 'similar' },
      timeline: { id: 'timeline', x: 236, y: 405, w: 306, h: 210, type: 'timeline' },
      stakeholders: { id: 'stakeholders', x: 576, y: 405, w: 198, h: 210, type: 'stakeholders' },
      notes: { id: 'notes', x: 806, y: 405, w: 204, h: 210, type: 'notes' },
    },
    connectors: [
      { id: "c1", fromItemId: "overview", fromEdge: "right", fromOffset: 0.5, toItemId: "document", toEdge: "left", toOffset: 0.5, type: "source_to_evidence", dataType: "document", state: "verified", direction: "one_way", createdBy: "system", explanation: "Source document supports overview", lastUpdated: "2h ago" },
      { id: "c2", fromItemId: "document", fromEdge: "bottom", fromOffset: 0.8, toItemId: "decision", toEdge: "top", toOffset: 0.8, type: "evidence_to_insight", dataType: "decision", state: "generated", direction: "one_way", createdBy: "user", explanation: "Decision log entry", lastUpdated: "1d ago", confidence: 0.8 },
      { id: "c3", fromItemId: "site", fromEdge: "bottom", fromOffset: 0.5, toItemId: "risk", toEdge: "top", toOffset: 0.2, type: "risk_contributor", dataType: "risk", state: "needs_review", direction: "one_way", createdBy: "user", explanation: "Visual/site context may contribute to planning risk", lastUpdated: "5h ago", confidence: 0.6 },
      { id: "c4", fromItemId: "sheet", fromEdge: "bottom", fromOffset: 0.5, toItemId: "risk", toEdge: "top", toOffset: 0.8, type: "evidence_to_insight", dataType: "spreadsheet", state: "live", direction: "one_way", createdBy: "system", explanation: "Live data feeds risk scoring", lastUpdated: "Just now" },
      { id: "c5", fromItemId: "decision", fromEdge: "right", fromOffset: 0.5, toItemId: "risk", toEdge: "left", toOffset: 0.5, type: "decision_dependency", dataType: "decision", state: "verified", direction: "one_way", createdBy: "user", explanation: "Decision impacts risk assessment", lastUpdated: "3d ago" },
      { id: "c6", fromItemId: "similar", fromEdge: "top", fromOffset: 0.5, toItemId: "decision", toEdge: "bottom", toOffset: 0.1, type: "similarity_match", dataType: "similar_project", state: "generated", direction: "one_way", createdBy: "user", explanation: "Suggested reusable project proof", lastUpdated: "1d ago", confidence: 0.88 },
      { id: "c7", fromItemId: "notes", fromEdge: "top", fromOffset: 0.5, toItemId: "risk", toEdge: "bottom", toOffset: 0.8, type: "restricted_source", dataType: "note", state: "restricted", direction: "one_way", createdBy: "user", explanation: "Output was influenced by restricted data", lastUpdated: "1w ago" }
    ]
  }
};

export const facilitiesData = {
  // Existing placeholder data converted into the same format, or we just map it into the unstructured `content` blob in server.ts
  documents: [
    { id: "EV-001", zone: "diagnostic", content: "HVAC telemetry: Unusual power draw in North Wing chiller units.", tags: ["hvac", "power"] },
    { id: "EV-002", zone: "public", content: "National Weather Service: Severe heatwave predicted for the local region starting next week.", tags: ["weather", "environment"] },
    { id: "EV-003", zone: "restricted", content: "Internal Audit: The contract for the North Wing principal HVAC vendor expired 3 days ago. Maintenance SLA is void.", tags: ["contract", "legal", "audit"] },
    { id: "EV-LOG-01", zone: "diagnostic", content: "Building Management System: [2024-05-01 10:00:01] WARNING - Chiller-02 outlet temp deviation 4°C above setpoint. Compressor amp draw spiking.", tags: ["bms", "telemetry", "incident"] },
    { id: "EV-LOG-02", zone: "diagnostic", content: "Building Management System: [2024-05-01 10:15:33] CRITICAL - Coolant pressure drop detected in secondary line.", tags: ["bms", "hvac", "critical"] },
    { id: "EV-SEC-01", zone: "public", content: "Industry Benchmark: Facilities OPEX for commercial real estate expected to rise 18% due to aging HVAC infrastructure failing during extreme weather.", tags: ["benchmark", "opex", "strategy"] },
    { id: "EV-SEC-02", zone: "public", content: "Risk Report: Liability for commercial tenant safety increases significantly without active SLA coverage during extreme heat events.", tags: ["risk", "compliance"] }
  ],
  canvas: {
    items: {
      overview: { id: 'overview', x: 0, y: 0, w: 220, h: 176, type: 'overview' },
      document1: { id: 'document1', x: 268, y: 0, w: 220, h: 176, type: 'document', dataId: 'EV-001' },
      document2: { id: 'document2', x: 268, y: 205, w: 220, h: 176, type: 'document', dataId: 'EV-003' },
      risk: { id: 'risk', x: 536, y: 0, w: 332, h: 168, type: 'risk' }
    },
    connectors: [
      { id: "c1", fromItemId: "overview", fromEdge: "right", fromOffset: 0.5, toItemId: "document1", toEdge: "left", toOffset: 0.5, type: "source_to_evidence", dataType: "document", state: "verified", direction: "one_way", createdBy: "system", explanation: "Telemetry supports overview", lastUpdated: "2h ago" },
      { id: "c2", fromItemId: "document1", fromEdge: "right", fromOffset: 0.5, toItemId: "risk", toEdge: "left", toOffset: 0.2, type: "evidence_to_insight", dataType: "risk", state: "live", direction: "one_way", createdBy: "system", explanation: "HVAC issue informs risk", lastUpdated: "5h ago" },
      { id: "c3", fromItemId: "document2", fromEdge: "right", fromOffset: 0.5, toItemId: "risk", toEdge: "left", toOffset: 0.8, type: "evidence_to_insight", dataType: "risk", state: "verified", direction: "one_way", createdBy: "user", explanation: "Contract expiry exacerbates risk", lastUpdated: "3d ago" }
    ]
  }
};

export const enterpriseData = {
  documents: [
    { id: "ENT-EV-001", zone: "diagnostic", content: "ERP System: Supply chain logistics delay in APAC region impacting Q3 delivery schedules by 14 days.", tags: ["erp", "supply-chain", "logistics"] },
    { id: "ENT-EV-002", zone: "public", content: "Market Report: Semiconductor shortage projected to ease slightly but prices remain 5% above baseline.", tags: ["market", "supply-chain", "report"] },
    { id: "ENT-EV-003", zone: "restricted", content: "HR Database: Key engineering staff turnover in the APAC facility reached 12% this quarter due to competitor poaching.", tags: ["hr", "turnover", "staffing"] },
    { id: "ENT-LOG-01", zone: "diagnostic", content: "Logistics: [2024-06-01 14:00:01] WARNING - Container shipment delayed at port.", tags: ["logistics", "shipping", "incident"] }
  ],
  canvas: {
    items: {
      overview: { id: 'overview', x: 0, y: 0, w: 220, h: 176, type: 'overview' },
      document1: { id: 'document1', x: 268, y: 0, w: 220, h: 176, type: 'document', dataId: 'ENT-EV-001' },
      document2: { id: 'document2', x: 268, y: 205, w: 220, h: 176, type: 'document', dataId: 'ENT-EV-003' },
      risk: { id: 'risk', x: 536, y: 0, w: 332, h: 168, type: 'risk' }
    },
    connectors: [
      { id: "c1", fromItemId: "overview", fromEdge: "right", fromOffset: 0.5, toItemId: "document1", toEdge: "left", toOffset: 0.5, type: "source_to_evidence", dataType: "document", state: "verified", direction: "one_way", createdBy: "system", explanation: "Logistics delay affects overview", lastUpdated: "4h ago" },
      { id: "c2", fromItemId: "document1", fromEdge: "right", fromOffset: 0.5, toItemId: "risk", toEdge: "left", toOffset: 0.2, type: "evidence_to_insight", dataType: "risk", state: "live", direction: "one_way", createdBy: "system", explanation: "Delay maps to risk", lastUpdated: "5h ago" }
    ]
  }
};

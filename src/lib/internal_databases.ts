export const harbourTowerData = {
  stakeholders: [
    { id: "SH-01", fullName: "James Miller", initials: "JM", role: "Project Director", department: "Executive", coreFocus: "Profitability and timeline adherence for the $38.6M uplift." },
    { id: "SH-02", fullName: "Amelia Hart", initials: "AH", role: "Strategy & Proposals", department: "Commercial", coreFocus: "Managing council feedback and mitigating risks to ensure planning approval." },
    { id: "SH-03", fullName: "Dr. Chen Wei", initials: "CW", role: "Lead Structural Engineer", department: "Engineering", coreFocus: "Ensuring podium structural integrity under the load of 14 new floors." },
    { id: "SH-04", fullName: "Sarah Jenkins", initials: "SJ", role: "Chief Financial Officer", department: "Finance", coreFocus: "Preventing cost escalations and ensuring the financial model holds up against setbacks." }
  ],
  documents: [
    { id: "DOC-01", zone: "public", fileName: "HT_Extension_Planning_Proposal.pdf", fileType: "PDF", sizeMB: 12.4, uploadDate: "-30 days", uploadedBy: "SH-02", tags: ["planning", "proposal", "council"], content: "14-floor extension planning proposal for Harbour Tower, addressing council setback requirements and waterfront sightlines." },
    { id: "DOC-02", zone: "diagnostic", fileName: "Structural_Load_Review_v2.docx", fileType: "DOCX", sizeMB: 4.8, uploadDate: "-15 days", uploadedBy: "SH-03", tags: ["structural", "engineering", "risk"], content: "Peer review of existing 1998 podium lateral load capacity under 14 new floors." },
    { id: "DOC-03", zone: "public", fileName: "Financial_Model_Uplift_Aug24.xlsx", fileType: "XLSX", sizeMB: 8.1, uploadDate: "-10 days", uploadedBy: "SH-04", tags: ["finance", "modeling", "budget"], content: "$38.6M uplift financial model showing 14-floor scenario vs 10-floor base case." },
    { id: "DOC-04", zone: "public", fileName: "Council_Feedback_Setbacks_Memo.pdf", fileType: "PDF", sizeMB: 1.2, uploadDate: "-5 days", uploadedBy: "SH-02", tags: ["council", "feedback", "compliance"], content: "Council memo requiring revised North facade setbacks to protect waterfront sightlines." },
    { id: "DOC-05", zone: "diagnostic", fileName: "HT_Podium_As_Builts_1998.pdf", fileType: "PDF", sizeMB: 45.0, uploadDate: "-40 days", uploadedBy: "SH-03", tags: ["historical", "structural", "podium"], content: "Original 1998 podium as-built drawings used as basis for structural peer review." },
    { id: "DOC-06", zone: "diagnostic", fileName: "Wind_Tunnel_Test_Results.pdf", fileType: "PDF", sizeMB: 15.6, uploadDate: "-2 days", uploadedBy: "SH-03", tags: ["engineering", "aerodynamics", "risk"], content: "Wind tunnel test results for the revised 14-floor form factor — facade redesign implications pending." }
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
  meta: {
    purpose: "Additional 14 floors / mixed use",
    value: "$38.6M estimated uplift",
    summary: "14-floor extension above existing 1998 podium. Planning approval pending council setback revision and structural peer review.",
  },
  canvas: {
    items: {
      overview:     { id: 'overview',     x: 0,   y: 0,   w: 220, h: 176, type: 'overview' },
      document:     { id: 'document',     x: 268, y: 0,   w: 220, h: 176, type: 'document', dataId: 'DOC-01' },
      site:         { id: 'site',         x: 536, y: 0,   w: 220, h: 176, type: 'site' },
      sheet:        { id: 'sheet',        x: 804, y: 0,   w: 220, h: 176, type: 'sheet', dataId: 'DOC-03' },
      decision:     { id: 'decision',     x: 22,  y: 205, w: 610, h: 168, type: 'decision' },
      risk:         { id: 'risk',         x: 678, y: 205, w: 332, h: 168, type: 'risk' },
      similar:      { id: 'similar',      x: 0,   y: 405, w: 194, h: 210, type: 'similar' },
      timeline:     { id: 'timeline',     x: 236, y: 405, w: 306, h: 210, type: 'timeline' },
      stakeholders: { id: 'stakeholders', x: 576, y: 405, w: 198, h: 210, type: 'stakeholders' },
      notes:        { id: 'notes',        x: 806, y: 405, w: 204, h: 210, type: 'notes' },
    },
    connectors: [
      { id: "c1", fromItemId: "overview",  fromEdge: "right",  fromOffset: 0.5, toItemId: "document",  toEdge: "left",   toOffset: 0.5, type: "source_to_evidence",   dataType: "document",       state: "verified",     direction: "one_way", createdBy: "system", explanation: "Source document supports overview",                      lastUpdated: "2h ago" },
      { id: "c2", fromItemId: "document",  fromEdge: "bottom", fromOffset: 0.8, toItemId: "decision",  toEdge: "top",    toOffset: 0.8, type: "evidence_to_insight",  dataType: "decision",       state: "generated",    direction: "one_way", createdBy: "user",   explanation: "Decision log entry",                                    lastUpdated: "1d ago",   confidence: 0.8 },
      { id: "c3", fromItemId: "site",      fromEdge: "bottom", fromOffset: 0.5, toItemId: "risk",      toEdge: "top",    toOffset: 0.2, type: "risk_contributor",     dataType: "risk",           state: "needs_review", direction: "one_way", createdBy: "user",   explanation: "Visual/site context may contribute to planning risk",   lastUpdated: "5h ago",   confidence: 0.6 },
      { id: "c4", fromItemId: "sheet",     fromEdge: "bottom", fromOffset: 0.5, toItemId: "risk",      toEdge: "top",    toOffset: 0.8, type: "evidence_to_insight",  dataType: "spreadsheet",    state: "live",         direction: "one_way", createdBy: "system", explanation: "Live data feeds risk scoring",                          lastUpdated: "Just now" },
      { id: "c5", fromItemId: "decision",  fromEdge: "right",  fromOffset: 0.5, toItemId: "risk",      toEdge: "left",   toOffset: 0.5, type: "decision_dependency",  dataType: "decision",       state: "verified",     direction: "one_way", createdBy: "user",   explanation: "Decision impacts risk assessment",                      lastUpdated: "3d ago" },
      { id: "c6", fromItemId: "similar",   fromEdge: "top",    fromOffset: 0.5, toItemId: "decision",  toEdge: "bottom", toOffset: 0.1, type: "similarity_match",     dataType: "similar_project",state: "generated",    direction: "one_way", createdBy: "user",   explanation: "Suggested reusable project proof",                      lastUpdated: "1d ago",   confidence: 0.88 },
      { id: "c7", fromItemId: "notes",     fromEdge: "top",    fromOffset: 0.5, toItemId: "risk",      toEdge: "bottom", toOffset: 0.8, type: "restricted_source",    dataType: "note",           state: "restricted",   direction: "one_way", createdBy: "user",   explanation: "Output was influenced by restricted data",              lastUpdated: "1w ago" }
    ]
  }
};

export const facilitiesData = {
  stakeholders: [
    { id: "FM-SH-01", fullName: "Marcus Reid", initials: "MR", role: "Facilities Director", department: "Operations", coreFocus: "Maintaining building performance and preventing tenant liability during heatwave events." },
    { id: "FM-SH-02", fullName: "Linda Park", initials: "LP", role: "Chief Engineer", department: "Engineering", coreFocus: "HVAC system diagnostics and emergency vendor coordination." },
    { id: "FM-SH-03", fullName: "Tom Nguyen", initials: "TN", role: "Legal Counsel", department: "Legal", coreFocus: "SLA compliance and liability exposure with expired vendor contract." },
    { id: "FM-SH-04", fullName: "Priya Shah", initials: "PS", role: "Operations Analyst", department: "Finance", coreFocus: "OPEX budget impact of emergency maintenance and potential infrastructure upgrade." }
  ],
  documents: [
    { id: "EV-001", zone: "diagnostic", fileName: "HVAC_Telemetry_NorthWing.csv", fileType: "CSV", sizeMB: 0.8, uploadDate: "-1 days", uploadedBy: "FM-SH-02", tags: ["hvac", "power", "telemetry"], content: "HVAC telemetry: Unusual power draw in North Wing chiller units." },
    { id: "EV-002", zone: "public",     fileName: "NWS_Heatwave_Advisory.pdf",    fileType: "PDF", sizeMB: 0.3, uploadDate: "-2 days", uploadedBy: "FM-SH-01", tags: ["weather", "environment"],      content: "National Weather Service: Severe heatwave predicted for the local region starting next week." },
    { id: "EV-003", zone: "restricted", fileName: "Vendor_Contract_Audit.pdf",    fileType: "PDF", sizeMB: 1.1, uploadDate: "-3 days", uploadedBy: "FM-SH-03", tags: ["contract", "legal", "audit"],   content: "Internal Audit: The contract for the North Wing principal HVAC vendor expired 3 days ago. Maintenance SLA is void." },
    { id: "EV-LOG-01", zone: "diagnostic", fileName: "BMS_Incident_Log_May01.log", fileType: "LOG", sizeMB: 0.2, uploadDate: "-1 days", uploadedBy: "FM-SH-02", tags: ["bms", "telemetry", "incident"], content: "BMS [2024-05-01 10:00:01] WARNING - Chiller-02 outlet temp deviation 4°C above setpoint." },
    { id: "EV-LOG-02", zone: "diagnostic", fileName: "BMS_Critical_Alert_May01.log", fileType: "LOG", sizeMB: 0.1, uploadDate: "-1 days", uploadedBy: "FM-SH-02", tags: ["bms", "hvac", "critical"],   content: "BMS [2024-05-01 10:15:33] CRITICAL - Coolant pressure drop detected in secondary line." },
    { id: "EV-SEC-01", zone: "public",  fileName: "OPEX_Benchmark_Report.pdf",   fileType: "PDF", sizeMB: 2.4, uploadDate: "-7 days", uploadedBy: "FM-SH-04", tags: ["benchmark", "opex", "strategy"], content: "Industry Benchmark: Facilities OPEX expected to rise 18% due to aging HVAC infrastructure failing during extreme weather." },
    { id: "EV-SEC-02", zone: "public",  fileName: "Tenant_Liability_Risk.pdf",   fileType: "PDF", sizeMB: 1.8, uploadDate: "-5 days", uploadedBy: "FM-SH-03", tags: ["risk", "compliance"],             content: "Liability for commercial tenant safety increases significantly without active SLA coverage during extreme heat events." }
  ],
  decisions: [
    { id: "FM-DEC-01", decisionSummary: "Escalate to emergency HVAC maintenance protocol.", dateDecided: "May 1, 2024", decidedBy: "FM-SH-01", rationale: "BMS critical alerts on Chiller-02 require immediate response to prevent full system failure during incoming heatwave.", sourceDocumentId: "EV-LOG-02", confidenceScore: 0.94 },
    { id: "FM-DEC-02", decisionSummary: "Engage backup vendor under emergency procurement clause.", dateDecided: "May 1, 2024", decidedBy: "FM-SH-03", rationale: "Primary vendor SLA is void due to contract expiry. Emergency clause permits direct engagement of backup vendor without tender.", sourceDocumentId: "EV-003", confidenceScore: 0.88 },
    { id: "FM-DEC-03", decisionSummary: "Notify affected tenants of potential service disruption.", dateDecided: "May 2, 2024", decidedBy: "FM-SH-01", rationale: "Duty of care requires 24-hour notice to tenants if cooling cannot be guaranteed during the heatwave period.", sourceDocumentId: "EV-002", confidenceScore: 0.79 }
  ],
  risks: [
    { id: "FM-RSK-01", riskTitle: "Full HVAC Failure — North Wing", description: "Chiller-02 failure during heatwave event could render 4 floors uninhabitable for up to 72 hours.", impact: "High", likelihood: "High", riskScore: 16, mitigatingStakeholderId: "FM-SH-02", confidenceScore: 0.82 },
    { id: "FM-RSK-02", riskTitle: "Tenant Liability Exposure", description: "Without active SLA, FM is directly liable for any health or safety incidents in the affected areas.", impact: "High", likelihood: "Medium", riskScore: 12, mitigatingStakeholderId: "FM-SH-03", confidenceScore: 0.77 },
    { id: "FM-RSK-03", riskTitle: "OPEX Budget Overrun", description: "Emergency vendor rates are estimated at 2.4x standard contract rates, pushing Q2 facilities OPEX over budget by ~18%.", impact: "Medium", likelihood: "High", riskScore: 9, mitigatingStakeholderId: "FM-SH-04", confidenceScore: 0.71 }
  ],
  timeline: [
    { id: "FM-PH-01", phaseName: "Incident Detected",       targetDate: "May 1, 2024",  status: "completed" },
    { id: "FM-PH-02", phaseName: "Emergency Vendor Engaged", targetDate: "May 2, 2024",  status: "active" },
    { id: "FM-PH-03", phaseName: "Heatwave Window",         targetDate: "May 6–9, 2024", status: "pending" },
    { id: "FM-PH-04", phaseName: "Post-Incident Review",    targetDate: "May 15, 2024", status: "pending" },
    { id: "FM-PH-05", phaseName: "Contract Re-tender",      targetDate: "June 2024",    status: "pending" }
  ],
  meta: {
    purpose: "Emergency HVAC response — North Wing",
    value: "~$420K liability exposure",
    summary: "Critical HVAC failure risk during incoming heatwave. Primary vendor SLA void. Emergency protocol activated.",
  },
  canvas: {
    items: {
      overview:     { id: 'overview',     x: 0,   y: 0,   w: 220, h: 176, type: 'overview' },
      document:     { id: 'document',     x: 268, y: 0,   w: 220, h: 176, type: 'document', dataId: 'EV-LOG-01' },
      site:         { id: 'site',         x: 536, y: 0,   w: 220, h: 176, type: 'site' },
      sheet:        { id: 'sheet',        x: 804, y: 0,   w: 220, h: 176, type: 'sheet', dataId: 'EV-SEC-01' },
      decision:     { id: 'decision',     x: 22,  y: 205, w: 610, h: 168, type: 'decision' },
      risk:         { id: 'risk',         x: 678, y: 205, w: 332, h: 168, type: 'risk' },
      timeline:     { id: 'timeline',     x: 236, y: 405, w: 306, h: 210, type: 'timeline' },
      stakeholders: { id: 'stakeholders', x: 576, y: 405, w: 198, h: 210, type: 'stakeholders' },
      notes:        { id: 'notes',        x: 806, y: 405, w: 204, h: 210, type: 'notes' },
    },
    connectors: [
      { id: "c1", fromItemId: "overview",  fromEdge: "right",  fromOffset: 0.5, toItemId: "document",  toEdge: "left",   toOffset: 0.5, type: "source_to_evidence",  dataType: "document",    state: "live",         direction: "one_way", createdBy: "system", explanation: "BMS telemetry feeds overview",          lastUpdated: "Just now" },
      { id: "c2", fromItemId: "document",  fromEdge: "bottom", fromOffset: 0.5, toItemId: "decision",  toEdge: "top",    toOffset: 0.3, type: "evidence_to_insight", dataType: "decision",    state: "generated",    direction: "one_way", createdBy: "system", explanation: "Alert triggered emergency protocol",    lastUpdated: "1h ago",   confidence: 0.9 },
      { id: "c3", fromItemId: "sheet",     fromEdge: "bottom", fromOffset: 0.5, toItemId: "risk",      toEdge: "top",    toOffset: 0.8, type: "evidence_to_insight", dataType: "spreadsheet", state: "needs_review", direction: "one_way", createdBy: "system", explanation: "OPEX benchmark informs budget risk",    lastUpdated: "3h ago" },
      { id: "c4", fromItemId: "decision",  fromEdge: "right",  fromOffset: 0.5, toItemId: "risk",      toEdge: "left",   toOffset: 0.5, type: "decision_dependency", dataType: "decision",    state: "verified",     direction: "one_way", createdBy: "user",   explanation: "Decision mitigates FM-RSK-01",         lastUpdated: "2h ago" },
    ]
  }
};

export const enterpriseData = {
  stakeholders: [
    { id: "ENT-SH-01", fullName: "David Chen", initials: "DC", role: "Chief Operating Officer", department: "Executive", coreFocus: "APAC supply chain continuity and Q3 delivery commitments to key clients." },
    { id: "ENT-SH-02", fullName: "Rachel Kim", initials: "RK", role: "Head of Procurement", department: "Procurement", coreFocus: "Renegotiating logistics contracts and sourcing alternative shipping routes." },
    { id: "ENT-SH-03", fullName: "Omar Farouq", initials: "OF", role: "VP Engineering — APAC", department: "Engineering", coreFocus: "Retaining engineering talent and managing project delivery capacity." },
    { id: "ENT-SH-04", fullName: "Yuki Tanaka", initials: "YT", role: "Finance Controller", department: "Finance", coreFocus: "Quantifying the revenue impact of Q3 delivery delays and revising forecasts." }
  ],
  documents: [
    { id: "ENT-EV-001", zone: "diagnostic", fileName: "ERP_APAC_Logistics_Q3.xlsx",    fileType: "XLSX", sizeMB: 3.2, uploadDate: "-3 days", uploadedBy: "ENT-SH-02", tags: ["erp", "supply-chain", "logistics"], content: "ERP System: Supply chain logistics delay in APAC region impacting Q3 delivery schedules by 14 days." },
    { id: "ENT-EV-002", zone: "public",     fileName: "Semiconductor_Market_Brief.pdf", fileType: "PDF",  sizeMB: 1.9, uploadDate: "-7 days", uploadedBy: "ENT-SH-04", tags: ["market", "supply-chain", "report"],  content: "Market Report: Semiconductor shortage projected to ease slightly but prices remain 5% above baseline." },
    { id: "ENT-EV-003", zone: "restricted", fileName: "HR_APAC_Turnover_Report.pdf",   fileType: "PDF",  sizeMB: 2.1, uploadDate: "-5 days", uploadedBy: "ENT-SH-03", tags: ["hr", "turnover", "staffing"],          content: "HR Database: Key engineering staff turnover in the APAC facility reached 12% this quarter due to competitor poaching." },
    { id: "ENT-LOG-01", zone: "diagnostic", fileName: "Port_Delay_Incident_Log.log",   fileType: "LOG",  sizeMB: 0.2, uploadDate: "-2 days", uploadedBy: "ENT-SH-02", tags: ["logistics", "shipping", "incident"],   content: "Logistics [2024-06-01 14:00:01] WARNING - Container shipment delayed at port. ETA revised +14 days." },
    { id: "ENT-DOC-01", zone: "public",     fileName: "Q3_Delivery_Commitment.pdf",    fileType: "PDF",  sizeMB: 0.8, uploadDate: "-10 days", uploadedBy: "ENT-SH-01", tags: ["commitments", "clients", "q3"],       content: "Signed Q3 delivery commitments to 3 major clients. Penalty clauses apply for delays exceeding 10 business days." },
    { id: "ENT-DOC-02", zone: "diagnostic", fileName: "Alt_Routing_Options.xlsx",      fileType: "XLSX", sizeMB: 1.4, uploadDate: "-1 days", uploadedBy: "ENT-SH-02", tags: ["logistics", "routing", "contingency"], content: "Alternative routing analysis: air freight and southern port routing add 8–12% cost vs sea route baseline." }
  ],
  decisions: [
    { id: "ENT-DEC-01", decisionSummary: "Activate contingency routing via southern port.", dateDecided: "June 2, 2024", decidedBy: "ENT-SH-02", rationale: "Northern port delay of 14 days breaches Q3 client commitment window. Southern port adds 9% cost but preserves delivery SLA.", sourceDocumentId: "ENT-DOC-02", confidenceScore: 0.87 },
    { id: "ENT-DEC-02", decisionSummary: "Notify affected clients and propose revised schedule.", dateDecided: "June 2, 2024", decidedBy: "ENT-SH-01", rationale: "Contractual obligation requires 5-day notice of material delay. Early notification may reduce penalty exposure.", sourceDocumentId: "ENT-DOC-01", confidenceScore: 0.91 },
    { id: "ENT-DEC-03", decisionSummary: "Freeze non-critical APAC hiring pending turnover analysis.", dateDecided: "June 3, 2024", decidedBy: "ENT-SH-03", rationale: "12% turnover rate exceeds threshold. Freezing hires allows retention package review before further investment.", sourceDocumentId: "ENT-EV-003", confidenceScore: 0.74 }
  ],
  risks: [
    { id: "ENT-RSK-01", riskTitle: "Q3 Client Penalty Clauses Triggered", description: "14-day delay exceeds 10-day penalty window in 2 of 3 major Q3 delivery contracts.", impact: "High", likelihood: "High", riskScore: 16, mitigatingStakeholderId: "ENT-SH-01", confidenceScore: 0.88 },
    { id: "ENT-RSK-02", riskTitle: "APAC Engineering Capacity Collapse", description: "12% turnover without retention action risks cascading exits — delivery capacity for Q4 severely impacted.", impact: "High", likelihood: "Medium", riskScore: 12, mitigatingStakeholderId: "ENT-SH-03", confidenceScore: 0.69 },
    { id: "ENT-RSK-03", riskTitle: "Procurement Cost Overrun", description: "Alternative routing adds 8–12% logistics cost vs baseline — unbudgeted for Q3.", impact: "Medium", likelihood: "High", riskScore: 9, mitigatingStakeholderId: "ENT-SH-04", confidenceScore: 0.82 }
  ],
  timeline: [
    { id: "ENT-PH-01", phaseName: "Delay Detected",          targetDate: "June 1, 2024",  status: "completed" },
    { id: "ENT-PH-02", phaseName: "Contingency Activated",   targetDate: "June 2, 2024",  status: "active" },
    { id: "ENT-PH-03", phaseName: "Client Notifications",    targetDate: "June 5, 2024",  status: "pending" },
    { id: "ENT-PH-04", phaseName: "Revised Q3 Delivery",     targetDate: "July 2024",     status: "pending" },
    { id: "ENT-PH-05", phaseName: "Retention Review",        targetDate: "June 2024",     status: "pending" }
  ],
  meta: {
    purpose: "APAC supply chain continuity — Q3",
    value: "$2.1M penalty exposure",
    summary: "14-day port delay threatens Q3 client SLAs. Contingency routing activated. Engineering turnover compounds delivery risk.",
  },
  canvas: {
    items: {
      overview:     { id: 'overview',     x: 0,   y: 0,   w: 220, h: 176, type: 'overview' },
      document:     { id: 'document',     x: 268, y: 0,   w: 220, h: 176, type: 'document', dataId: 'ENT-LOG-01' },
      site:         { id: 'site',         x: 536, y: 0,   w: 220, h: 176, type: 'site' },
      sheet:        { id: 'sheet',        x: 804, y: 0,   w: 220, h: 176, type: 'sheet', dataId: 'ENT-EV-001' },
      decision:     { id: 'decision',     x: 22,  y: 205, w: 610, h: 168, type: 'decision' },
      risk:         { id: 'risk',         x: 678, y: 205, w: 332, h: 168, type: 'risk' },
      timeline:     { id: 'timeline',     x: 236, y: 405, w: 306, h: 210, type: 'timeline' },
      stakeholders: { id: 'stakeholders', x: 576, y: 405, w: 198, h: 210, type: 'stakeholders' },
      notes:        { id: 'notes',        x: 806, y: 405, w: 204, h: 210, type: 'notes' },
    },
    connectors: [
      { id: "c1", fromItemId: "overview",  fromEdge: "right",  fromOffset: 0.5, toItemId: "document",  toEdge: "left",   toOffset: 0.5, type: "source_to_evidence",  dataType: "document",    state: "live",      direction: "one_way", createdBy: "system", explanation: "Logistics log feeds overview",           lastUpdated: "Just now" },
      { id: "c2", fromItemId: "sheet",     fromEdge: "bottom", fromOffset: 0.5, toItemId: "decision",  toEdge: "top",    toOffset: 0.2, type: "evidence_to_insight", dataType: "spreadsheet", state: "generated", direction: "one_way", createdBy: "system", explanation: "ERP delay data drives routing decision", lastUpdated: "3h ago",   confidence: 0.87 },
      { id: "c3", fromItemId: "document",  fromEdge: "bottom", fromOffset: 0.5, toItemId: "risk",      toEdge: "top",    toOffset: 0.3, type: "evidence_to_insight", dataType: "document",    state: "live",      direction: "one_way", createdBy: "system", explanation: "Port delay maps to Q3 penalty risk",     lastUpdated: "2h ago" },
      { id: "c4", fromItemId: "decision",  fromEdge: "right",  fromOffset: 0.5, toItemId: "risk",      toEdge: "left",   toOffset: 0.5, type: "decision_dependency", dataType: "decision",    state: "verified",  direction: "one_way", createdBy: "user",   explanation: "Routing decision reduces penalty risk",  lastUpdated: "1h ago" },
    ]
  }
};

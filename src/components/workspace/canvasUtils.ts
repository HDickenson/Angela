export type ConnectorEdge = 'top' | 'bottom' | 'left' | 'right';

export interface CanvasConnector {
  id: string;
  fromItemId: string;
  fromEdge: ConnectorEdge;
  fromOffset?: number; // relative offset % (0-1)
  toItemId: string;
  toEdge: ConnectorEdge;
  toOffset?: number;
  type: string;
  dataType: string;
  state: 'live' | 'snapshot' | 'generated' | 'verified' | 'needs_review' | 'restricted' | 'broken';
  direction: 'one_way' | 'two_way';
  confidence?: number;
  createdBy: 'user' | 'angela' | 'system';
  explanation: string;
  lastUpdated: string;
}

export const ITEMS = {
  overview: { id: 'overview', x: 0, y: 0, w: 220, h: 176 },
  document: { id: 'document', x: 268, y: 0, w: 220, h: 176 },
  site: { id: 'site', x: 536, y: 0, w: 220, h: 176 },
  sheet: { id: 'sheet', x: 804, y: 0, w: 220, h: 176 },
  decision: { id: 'decision', x: 22, y: 205, w: 610, h: 168 },
  risk: { id: 'risk', x: 678, y: 205, w: 332, h: 168 },
  similar: { id: 'similar', x: 0, y: 405, w: 194, h: 210 },
  timeline: { id: 'timeline', x: 236, y: 405, w: 306, h: 210 },
  stakeholders: { id: 'stakeholders', x: 576, y: 405, w: 198, h: 210 },
  notes: { id: 'notes', x: 806, y: 405, w: 204, h: 210 },
};

export const INITIAL_CONNECTORS: CanvasConnector[] = [
  {
    id: "c1",
    fromItemId: "overview",
    fromEdge: "right",
    fromOffset: 0.5,
    toItemId: "document",
    toEdge: "left",
    toOffset: 0.5,
    type: "source_to_evidence",
    dataType: "document",
    state: "verified",
    direction: "one_way",
    createdBy: "system",
    explanation: "Source document supports overview",
    lastUpdated: "2h ago"
  },
  {
    id: "c2",
    fromItemId: "document",
    fromEdge: "bottom",
    fromOffset: 0.8,
    toItemId: "decision",
    toEdge: "top",
    toOffset: 0.8,
    type: "evidence_to_insight",
    dataType: "decision",
    state: "generated",
    direction: "one_way",
    createdBy: "angela",
    explanation: "Angela found decision log entry",
    lastUpdated: "1d ago",
    confidence: 0.8
  },
  {
    id: "c3",
    fromItemId: "site",
    fromEdge: "bottom",
    fromOffset: 0.5,
    toItemId: "risk",
    toEdge: "top",
    toOffset: 0.2,
    type: "risk_contributor",
    dataType: "risk",
    state: "needs_review",
    direction: "one_way",
    createdBy: "angela",
    explanation: "Visual/site context may contribute to planning risk",
    lastUpdated: "5h ago",
    confidence: 0.6
  },
  {
    id: "c4",
    fromItemId: "sheet",
    fromEdge: "bottom",
    fromOffset: 0.5,
    toItemId: "risk",
    toEdge: "top",
    toOffset: 0.8,
    type: "evidence_to_insight",
    dataType: "spreadsheet",
    state: "live",
    direction: "one_way",
    createdBy: "system",
    explanation: "Live data feeds risk scoring",
    lastUpdated: "Just now"
  },
  {
    id: "c5",
    fromItemId: "decision",
    fromEdge: "right",
    fromOffset: 0.5,
    toItemId: "risk",
    toEdge: "left",
    toOffset: 0.5,
    type: "decision_dependency",
    dataType: "decision",
    state: "verified",
    direction: "one_way",
    createdBy: "user",
    explanation: "Decision impacts risk assessment",
    lastUpdated: "3d ago"
  },
  {
    id: "c6",
    fromItemId: "similar",
    fromEdge: "top",
    fromOffset: 0.5,
    toItemId: "decision",
    toEdge: "bottom",
    toOffset: 0.1,
    type: "similarity_match",
    dataType: "similar_project",
    state: "generated",
    direction: "one_way",
    createdBy: "angela",
    explanation: "Angela suggested reusable project proof",
    lastUpdated: "1d ago",
    confidence: 0.88
  },
  {
    id: "c7",
    fromItemId: "notes",
    fromEdge: "top",
    fromOffset: 0.5,
    toItemId: "risk",
    toEdge: "bottom",
    toOffset: 0.8,
    type: "restricted_source",
    dataType: "note",
    state: "restricted",
    direction: "one_way",
    createdBy: "user",
    explanation: "Output was influenced by restricted data",
    lastUpdated: "1w ago"
  }
];

export function getPoint(item: {x: number, y: number, w: number, h: number}, edge: ConnectorEdge, offset: number = 0.5) {
  switch (edge) {
    case 'top': return { x: item.x + item.w * offset, y: item.y };
    case 'bottom': return { x: item.x + item.w * offset, y: item.y + item.h };
    case 'left': return { x: item.x, y: item.y + item.h * offset };
    case 'right': return { x: item.x + item.w, y: item.y + item.h * offset };
  }
}

export function getPath(p1: {x: number, y: number}, p2: {x: number, y: number}, edge1: ConnectorEdge, edge2: ConnectorEdge) {
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  
  // simple bezier curve control points
  const c1 = { ...p1 };
  const c2 = { ...p2 };
  
  const factor = Math.max(dx, dy) * 0.4;
  
  if (edge1 === 'left') c1.x -= factor;
  if (edge1 === 'right') c1.x += factor;
  if (edge1 === 'top') c1.y -= factor;
  if (edge1 === 'bottom') c1.y += factor;
  
  if (edge2 === 'left') c2.x -= factor;
  if (edge2 === 'right') c2.x += factor;
  if (edge2 === 'top') c2.y -= factor;
  if (edge2 === 'bottom') c2.y += factor;
  
  return `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
}

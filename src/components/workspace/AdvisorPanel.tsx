import React, { useState, useEffect } from 'react';
import { Mic, FileText, AlertTriangle, CheckSquare, ArrowRight } from 'lucide-react';

export interface AdvisorPanelProps {
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  chatHistory: { role: 'user' | 'agent'; text: string; _id?: string }[];
  handleChat: () => void;
  isListening: boolean;
  handleToggleListening: () => void;
  className?: string;
  isAgentThinking?: boolean;
  activeWorkspaceId?: string;
}

const EV_PATTERN = /(\[(?:EV|RSK|DEC|DOC|ENT)-[A-Z0-9-]+\])/g;

function renderWithEvidenceChipsSafe(text: string): React.ReactNode[] {
  EV_PATTERN.lastIndex = 0;
  const parts = text.split(EV_PATTERN);
  return parts.map((part, i) =>
    EV_PATTERN.test(part)
      ? <span key={i} className="ev-chip">{part}</span>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

const COLLAPSIBLE_THRESHOLD = 120;

function CollapsibleBubble({ text, isUser }: { text: string; isUser: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  const needsCollapse = !isUser && text.length > COLLAPSIBLE_THRESHOLD;
  return (
    <div>
      <div className={`bubble${needsCollapse && !expanded ? ' bubble-collapsed' : ''}`}>
        {renderWithEvidenceChipsSafe(text)}
      </div>
      {needsCollapse && (
        <button className="bubble-toggle" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Show less ↑' : 'Show more ↓'}
        </button>
      )}
    </div>
  );
}

// ─── Harbour Tower Proposal ───────────────────────────────────────────────────

function ProposalCard() {
  const decisions = [
    { id: 'DEC-01', summary: 'Proceed with 14-floor model',         doc: 'DOC-03', conf: 92, decidedBy: 'J. Miller',   date: 'Jul 15' },
    { id: 'DEC-02', summary: 'Independent structural peer review',  doc: 'DOC-05', conf: 85, decidedBy: 'Dr. C. Wei', date: 'Aug 2'  },
    { id: 'DEC-03', summary: 'Alter North facade setbacks',         doc: 'DOC-04', conf: 76, decidedBy: 'A. Hart',    date: 'Aug 20' },
    { id: 'DEC-04', summary: 'Commission wind tunnel testing',       doc: 'DOC-06', conf: 88, decidedBy: 'J. Miller',  date: 'Aug 22' },
  ];

  const risks = [
    { id: 'RSK-01', title: 'Structural podium failure',  score: 15, impact: 'High',   likelihood: 'Med', color: '#ef4444', dec: 'DEC-02' },
    { id: 'RSK-02', title: 'Planning approval delay',    score: 12, impact: 'High',   likelihood: 'Med', color: '#f59e0b', dec: 'DEC-03' },
    { id: 'RSK-03', title: 'Cost escalation',            score: 10, impact: 'Med',    likelihood: 'High',color: '#f59e0b', dec: 'DEC-01' },
    { id: 'RSK-04', title: 'Wind load discrepancies',    score: 8,  impact: 'High',   likelihood: 'Low', color: '#6b7280', dec: 'DEC-04' },
  ];

  const actions = [
    { text: 'Finalise podium structural report',    refs: ['RSK-01', 'DEC-02', 'DOC-02'] },
    { text: 'Lodge revised setback drawings',       refs: ['RSK-02', 'DEC-03', 'DOC-04'] },
    { text: 'Integrate wind tunnel results',        refs: ['RSK-04', 'DEC-04', 'DOC-06'] },
    { text: 'Lock contractor rates before Oct',     refs: ['RSK-03', 'DEC-01', 'DOC-03'] },
  ];

  return (
    <div className="proposal-card">
      {/* Header */}
      <div className="proposal-header">
        <div className="proposal-kicker">Planning Approval Briefing · Aug 2024</div>
        <div className="proposal-title">Harbour Tower Extension</div>
        <div className="proposal-subtitle">
          Angela synthesised <span className="ev-chip">[DOC-01]</span> <span className="ev-chip">[DOC-03]</span> <span className="ev-chip">[DOC-04]</span> <span className="ev-chip">[DOC-05]</span> <span className="ev-chip">[DOC-06]</span> and 4 decisions to generate this briefing.
        </div>
      </div>

      {/* Executive summary */}
      <div className="proposal-section">
        <div className="proposal-section-label">Executive Summary</div>
        <p className="proposal-body">
          The $38.6M extension proceeds on the 14-floor model {renderWithEvidenceChipsSafe('[DEC-01]')} per the financial uplift analysis {renderWithEvidenceChipsSafe('[DOC-03]')}. Planning council approval is required before October 2024 to preserve locked contractor rates. Two structural and regulatory issues remain open before submission can proceed.
        </p>
      </div>

      {/* Decisions */}
      <div className="proposal-section">
        <div className="proposal-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckSquare size={10} style={{ opacity: 0.7 }} /> Decisions on Record
          <span className="proposal-count">{decisions.length}</span>
        </div>
        <div className="proposal-decisions">
          {decisions.map(d => (
            <div key={d.id} className="proposal-decision-row">
              <div className="proposal-decision-id">{renderWithEvidenceChipsSafe(`[${d.id}]`)}</div>
              <div className="proposal-decision-body">
                <div className="proposal-decision-summary">{d.summary}</div>
                <div className="proposal-decision-meta">
                  {d.decidedBy} · {d.date}
                  <span className="proposal-decision-source">{renderWithEvidenceChipsSafe(`[${d.doc}]`)}</span>
                </div>
              </div>
              <div className="proposal-conf" style={{ color: d.conf >= 85 ? '#10b981' : '#f59e0b' }}>{d.conf}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      <div className="proposal-section">
        <div className="proposal-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={10} style={{ opacity: 0.7 }} /> Risk Profile
          <span className="proposal-count">{risks.length} active</span>
        </div>
        <div className="proposal-risks">
          {risks.map(r => (
            <div key={r.id} className="proposal-risk-row">
              <div className="proposal-risk-score" style={{ color: r.color, borderColor: `${r.color}40` }}>{r.score}</div>
              <div className="proposal-risk-body">
                <div className="proposal-risk-title">{renderWithEvidenceChipsSafe(`[${r.id}]`)} {r.title}</div>
                <div className="proposal-risk-meta">{r.impact} impact · {r.likelihood} likelihood → {renderWithEvidenceChipsSafe(`[${r.dec}]`)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next actions */}
      <div className="proposal-section">
        <div className="proposal-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowRight size={10} style={{ opacity: 0.7 }} /> Recommended Actions
        </div>
        <div className="proposal-actions">
          {actions.map((a, i) => (
            <div key={i} className="proposal-action-row">
              <div className="proposal-action-num">{i + 1}</div>
              <div className="proposal-action-body">
                <div className="proposal-action-text">{a.text}</div>
                <div className="proposal-action-refs">
                  {a.refs.map(r => (
                    <span key={r} className="ev-chip">[{r}]</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="proposal-footer">
        Generated from 6 sources · 4 decisions · 4 risks · Confidence 85%
      </div>
    </div>
  );
}

// ─── Facilities Onboarding Notes ─────────────────────────────────────────────

const FACILITIES_NOTES = [
  {
    num: 1,
    label: 'Select Data Sources',
    desc: 'Connect your HVAC logs, maintenance records, and SLA documents so Angela can analyse the incident.',
    chip: 'What data sources should I upload for this incident?',
  },
  {
    num: 2,
    label: 'Review Proposal Breakdown & Tasks',
    desc: 'Angela will suggest a remediation plan, prioritised tasks, and owner assignments based on your sources.',
    chip: 'Suggest a remediation plan for the HVAC incident',
  },
  {
    num: 3,
    label: 'Team Development & Phase 1 Drafting',
    desc: 'Assign teams, set milestones, and let Angela draft the Phase 1 incident response brief.',
    chip: 'Draft a Phase 1 incident response brief',
  },
];

function FacilitiesOnboarding({ onChipClick }: { onChipClick: (chip: string) => void }) {
  return (
    <>
      <div className="message">
        <div className="spark">✦</div>
        <div className="bubble">Hi — I'm ready to help manage the Facilities Management incident. Follow the steps below to get started.</div>
      </div>
      <div className="onboarding-notes">
        {FACILITIES_NOTES.map(n => (
          <div key={n.num} className="onboarding-note">
            <div className="onboarding-note-step">
              <div className="onboarding-note-num">{n.num}</div>
              <div className="onboarding-note-label">{n.label}</div>
            </div>
            <div className="onboarding-note-desc">{n.desc}</div>
            <div className="onboarding-note-action">
              <button className="onboarding-chip" onClick={() => onChipClick(n.chip)}>
                <ArrowRight size={9} /> Ask Angela
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Workspace context for non-HT workspaces ─────────────────────────────────

const WORKSPACE_CONTEXT: Record<string, {
  greeting: string;
  sampleQ: string;
  sampleA: string;
  riskTitle: string;
  risks: { label: string; conf: string; confColor: string; detail: string }[];
  chips: string[];
}> = {
  'enterprise': {
    greeting: "Hi — I'm tracking the APAC supply chain situation. What do you need to know?",
    sampleQ: "What's the impact of the APAC logistics delay?",
    sampleA: "The 14-day port delay [ENT-LOG-01] exceeds Q3 client SLA windows [ENT-DOC-01]. Penalty clauses apply. Contingency routing has been activated.",
    riskTitle: "Active Business Risks",
    risks: [
      { label: "Q3 client penalty clauses triggered", conf: "88%", confColor: "#ef4444", detail: "High impact · High likelihood\n14-day delay breaches 2 of 3 contracts." },
      { label: "APAC engineering capacity loss",       conf: "69%", confColor: "#f59e0b", detail: "High impact · Medium likelihood\n12% turnover — Q4 delivery capacity at risk." },
    ],
    chips: [
      "What is the Q3 penalty exposure?",
      "Which decisions have been made on the delay?",
      "What is the contingency routing plan?",
    ],
  },
};

const HT_CHIPS = [
  "What evidence supports DEC-01?",
  "Which risks are still unresolved?",
  "Draft the planning submission cover letter",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AdvisorPanel({
  chatMessage,
  setChatMessage,
  chatHistory,
  handleChat,
  isListening,
  handleToggleListening,
  className = 'advisor',
  isAgentThinking,
  activeWorkspaceId = 'harbour-tower',
}: AdvisorPanelProps) {
  const isHarbourTower = activeWorkspaceId === 'harbour-tower';
  const isFacilities = activeWorkspaceId === 'facilities';
  const ctx = WORKSPACE_CONTEXT[activeWorkspaceId];

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeModel, setActiveModel] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setActiveModel(d.model ?? ''))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAgentThinking]);

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  }

  function doSend() {
    handleChat();
    if (inputRef.current) inputRef.current.style.height = 'auto';
  }

  function handleChipClick(chip: string) {
    setChatMessage(chip);
    inputRef.current?.focus();
  }

  const chips = isHarbourTower ? HT_CHIPS : isFacilities ? [] : (ctx?.chips ?? []);

  return (
    <div className={className}>
      <div className="chat-scroll" ref={scrollRef}>
        {chatHistory.length === 0 ? (
          <>
            {isHarbourTower ? (
              <>
                <div className="message">
                  <div className="spark">✦</div>
                  <div className="bubble">Hi Amelia — I've reviewed the Harbour Tower project evidence. Here's a briefing ready for the planning committee.</div>
                </div>
                <div className="message user">
                  <div className="bubble">Prepare a project briefing for planning committee.</div>
                </div>
                <div className="message">
                  <div className="spark">✦</div>
                  <ProposalCard />
                </div>
              </>
            ) : isFacilities ? (
              <FacilitiesOnboarding onChipClick={handleChipClick} />
            ) : ctx ? (
              <>
                <div className="message">
                  <div className="spark">✦</div>
                  <div className="bubble">{ctx.greeting}</div>
                </div>
                <div className="message user">
                  <div className="bubble">{ctx.sampleQ}</div>
                </div>
                <div className="message">
                  <div className="spark">✦</div>
                  <div className="bubble">{renderWithEvidenceChipsSafe(ctx.sampleA)}</div>
                </div>
                <div className="risk-panel">
                  <h3>{ctx.riskTitle}</h3>
                  {ctx.risks.map((r, i) => (
                    <div className="risk-item" key={i}>
                      <div className="risk-num">{i + 1}</div>
                      <div className="risk-copy" style={{ width: '100%', display: 'block' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>{r.label}</span>
                          <span style={{ fontSize: '10px', background: `${r.confColor}26`, color: r.confColor, padding: '2px 6px', borderRadius: '12px', border: `1px solid ${r.confColor}80` }}>{r.conf}</span>
                        </div>
                        <div style={{ color: 'var(--muted)', lineHeight: '1.5', fontSize: '12px', whiteSpace: 'pre-line' }}>{r.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} className={`message ${msg.role === 'user' ? 'user' : ''}`}>
              {msg.role === 'agent' && <div className="spark">✦</div>}
              {msg.role === 'agent' && msg.text === '__SECURITY_DENIED__' ? (
                <div className="bubble security-denied">
                  Request blocked by security layer. Rephrase and try again.
                </div>
              ) : (
                <CollapsibleBubble text={msg.text} isUser={msg.role === 'user'} />
              )}
            </div>
          ))
        )}
        {isAgentThinking && (
          <div className="message">
            <div className="spark">✦</div>
            <div className="thinking">
              <div className="thinking-dot" />
              <div className="thinking-dot" />
              <div className="thinking-dot" />
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        {chatHistory.length === 0 && chips.length > 0 && (
          <div className="starter-chips">
            {chips.map(chip => (
              <button key={chip} className="starter-chip" onClick={() => handleChipClick(chip)}>
                {chip}
              </button>
            ))}
          </div>
        )}
        <div className="input-shell" style={{ display: 'flex', height: 'auto', alignItems: 'center' }}>
          <textarea
            ref={inputRef}
            rows={1}
            style={{
              background: 'transparent',
              outline: 'none',
              border: 'none',
              width: '100%',
              color: 'var(--text)',
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'inherit',
              fontSize: '13px',
              lineHeight: '1.5',
              padding: '10px 0',
              maxHeight: '80px',
            }}
            placeholder="Ask Angela about this project..."
            value={chatMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleToggleListening}
            style={{
              marginLeft: '8px',
              color: isListening ? 'var(--danger)' : 'var(--muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              animation: isListening ? 'evidence-node-pulse 1.5s infinite' : 'none',
            }}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic size={18} fill="currentColor" strokeWidth={0} />
          </button>
          <button className="send" aria-label="Send message" onClick={doSend} style={{ flexShrink: 0 }}>→</button>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', opacity: 0.8 }} /> Direct Routing
          </span>
          <span>{activeModel || 'angela'}</span>
        </div>
      </div>
    </div>
  );
}

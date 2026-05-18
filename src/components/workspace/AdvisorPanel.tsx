import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Mic, AlertTriangle, CheckSquare, ArrowRight, ArrowUp, ChevronDown } from 'lucide-react';

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

// ─── Evidence chip renderer ────────────────────────────────────────────────

const EV_PATTERN = /(\[(?:EV|RSK|DEC|DOC|ENT)-[A-Z0-9-]+\])/g;

function renderWithEvChips(text: string): React.ReactNode[] {
  EV_PATTERN.lastIndex = 0;
  const parts = text.split(EV_PATTERN);
  return parts.map((part, i) =>
    EV_PATTERN.test(part)
      ? <span key={i} className="ev-chip">{part}</span>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

// ─── Primitive message components ─────────────────────────────────────────

function MsgAgent({ children }: { children: React.ReactNode }) {
  return (
    <div className="msg msg-agent">
      <div className="msg-avatar">A</div>
      <div className="msg-body">{children}</div>
    </div>
  );
}

function MsgAgentText({ text }: { text: string }) {
  return (
    <MsgAgent>
      <div className="msg-text">{renderWithEvChips(text)}</div>
    </MsgAgent>
  );
}

function MsgUser({ text }: { text: string }) {
  return (
    <div className="msg msg-user">
      <div className="msg-pill">{text}</div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="msg msg-agent">
      <div className="msg-avatar">A</div>
      <div className="msg-body">
        <div className="msg-thinking">
          <div className="thinking-dot" />
          <div className="thinking-dot" />
          <div className="thinking-dot" />
        </div>
      </div>
    </div>
  );
}

// ─── Harbour Tower Proposal ────────────────────────────────────────────────

function ProposalCard() {
  const decisions = [
    { id: 'DEC-01', summary: 'Proceed with 14-floor model',        doc: 'DOC-03', conf: 92, decidedBy: 'J. Miller',  date: 'Jul 15' },
    { id: 'DEC-02', summary: 'Independent structural peer review', doc: 'DOC-05', conf: 85, decidedBy: 'Dr. C. Wei', date: 'Aug 2'  },
    { id: 'DEC-03', summary: 'Alter North facade setbacks',        doc: 'DOC-04', conf: 76, decidedBy: 'A. Hart',    date: 'Aug 20' },
    { id: 'DEC-04', summary: 'Commission wind tunnel testing',      doc: 'DOC-06', conf: 88, decidedBy: 'J. Miller',  date: 'Aug 22' },
  ];
  const risks = [
    { id: 'RSK-01', title: 'Structural podium failure', score: 15, impact: 'High', likelihood: 'Med',  color: '#ef4444', dec: 'DEC-02' },
    { id: 'RSK-02', title: 'Planning approval delay',   score: 12, impact: 'High', likelihood: 'Med',  color: '#f59e0b', dec: 'DEC-03' },
    { id: 'RSK-03', title: 'Cost escalation',           score: 10, impact: 'Med',  likelihood: 'High', color: '#f59e0b', dec: 'DEC-01' },
    { id: 'RSK-04', title: 'Wind load discrepancies',   score: 8,  impact: 'High', likelihood: 'Low',  color: '#6b7280', dec: 'DEC-04' },
  ];
  const actions = [
    { text: 'Finalise podium structural report',  refs: ['RSK-01', 'DEC-02', 'DOC-02'] },
    { text: 'Lodge revised setback drawings',     refs: ['RSK-02', 'DEC-03', 'DOC-04'] },
    { text: 'Integrate wind tunnel results',      refs: ['RSK-04', 'DEC-04', 'DOC-06'] },
    { text: 'Lock contractor rates before Oct',  refs: ['RSK-03', 'DEC-01', 'DOC-03'] },
  ];

  return (
    <div className="proposal-card">
      <div className="proposal-header">
        <div className="proposal-kicker">Planning Approval Briefing · Aug 2024</div>
        <div className="proposal-title">Harbour Tower Extension</div>
        <div className="proposal-subtitle">
          Angela synthesised{' '}
          {['DOC-01','DOC-03','DOC-04','DOC-05','DOC-06'].map(d => (
            <span key={d} className="ev-chip">[{d}]</span>
          ))}{' '}
          and 4 decisions.
        </div>
      </div>

      <div className="proposal-section">
        <div className="proposal-section-label">Executive Summary</div>
        <p className="proposal-body">
          The $38.6M extension proceeds on the 14-floor model {renderWithEvChips('[DEC-01]')} per the financial uplift analysis {renderWithEvChips('[DOC-03]')}. Planning council approval required before Oct 2024 to preserve locked contractor rates.
        </p>
      </div>

      <div className="proposal-section">
        <div className="proposal-section-label proposal-section-label--row">
          <CheckSquare size={10} /> Decisions on Record
          <span className="proposal-count">{decisions.length}</span>
        </div>
        <div className="proposal-decisions">
          {decisions.map(d => (
            <div key={d.id} className="proposal-decision-row">
              <div className="proposal-decision-id">{renderWithEvChips(`[${d.id}]`)}</div>
              <div className="proposal-decision-body">
                <div className="proposal-decision-summary">{d.summary}</div>
                <div className="proposal-decision-meta">
                  {d.decidedBy} · {d.date}
                  <span className="proposal-decision-source">{renderWithEvChips(`[${d.doc}]`)}</span>
                </div>
              </div>
              <div className={`proposal-conf ${d.conf >= 85 ? 'conf-high' : 'conf-med'}`}>{d.conf}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="proposal-section">
        <div className="proposal-section-label proposal-section-label--row">
          <AlertTriangle size={10} /> Risk Profile
          <span className="proposal-count">{risks.length} active</span>
        </div>
        <div className="proposal-risks">
          {risks.map(r => (
            <div key={r.id} className="proposal-risk-row">
              <div className="proposal-risk-score" style={{ color: r.color, borderColor: `${r.color}40` }}>{r.score}</div>
              <div className="proposal-risk-body">
                <div className="proposal-risk-title">{renderWithEvChips(`[${r.id}]`)} {r.title}</div>
                <div className="proposal-risk-meta">{r.impact} · {r.likelihood} → {renderWithEvChips(`[${r.dec}]`)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="proposal-section">
        <div className="proposal-section-label proposal-section-label--row">
          <ArrowRight size={10} /> Recommended Actions
        </div>
        <div className="proposal-actions">
          {actions.map((a, i) => (
            <div key={i} className="proposal-action-row">
              <div className="proposal-action-num">{i + 1}</div>
              <div className="proposal-action-body">
                <div className="proposal-action-text">{a.text}</div>
                <div className="proposal-action-refs">
                  {a.refs.map(r => <span key={r} className="ev-chip">[{r}]</span>)}
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

// ─── Facilities Onboarding Notes ───────────────────────────────────────────

const FACILITIES_NOTES = [
  {
    num: 1,
    label: 'Select Data Sources',
    desc: 'Connect HVAC logs, maintenance records, and SLA documents so Angela can analyse the incident.',
    chip: 'What data sources should I upload for this incident?',
  },
  {
    num: 2,
    label: 'Review Proposal Breakdown & Tasks',
    desc: 'Angela will suggest a remediation plan, prioritised tasks, and owner assignments.',
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
      <MsgAgentText text="Hi — I'm ready to help manage the Facilities Management incident. Follow the steps below to get started." />
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

// ─── Workspace context (enterprise) ───────────────────────────────────────

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

// ─── Main component ────────────────────────────────────────────────────────

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
  const isFacilities   = activeWorkspaceId === 'facilities';
  const ctx = WORKSPACE_CONTEXT[activeWorkspaceId];

  const feedRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [activeModel, setActiveModel] = useState('');
  const [atBottom,    setAtBottom]    = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setActiveModel(d.model ?? ''))
      .catch(() => {});
  }, []);

  // Scroll to bottom on initial mount so ProposalCard is visible
  useLayoutEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activeWorkspaceId]);

  // Scroll to bottom when conversation grows
  useEffect(() => {
    if (atBottom && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [chatHistory, isAgentThinking, atBottom]);

  function handleScroll() {
    const el = feedRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }

  function scrollToBottom() {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    setAtBottom(true);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  }

  function doSend() {
    if (!chatMessage.trim()) return;
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
      {/* Message feed */}
      <div className="chat-feed" ref={feedRef} onScroll={handleScroll}>
        {chatHistory.length === 0 ? (
          <>
            {isHarbourTower ? (
              <>
                <MsgAgentText text="Hi Amelia — I've reviewed the Harbour Tower evidence. Here's a planning briefing." />
                <MsgUser text="Prepare a project briefing for planning committee." />
                <div className="msg-card">
                  <ProposalCard />
                </div>
              </>
            ) : isFacilities ? (
              <FacilitiesOnboarding onChipClick={handleChipClick} />
            ) : ctx ? (
              <>
                <MsgAgentText text={ctx.greeting} />
                <MsgUser text={ctx.sampleQ} />
                <MsgAgentText text={ctx.sampleA} />
                <div className="risk-panel">
                  <h3>{ctx.riskTitle}</h3>
                  {ctx.risks.map((r, i) => (
                    <div className="risk-item" key={i}>
                      <div className="risk-num">{i + 1}</div>
                      <div className="risk-copy">
                        <div className="risk-copy-row">
                          <span className="risk-label">{r.label}</span>
                          <span className="risk-conf-badge" style={{ background: `${r.confColor}26`, color: r.confColor, borderColor: `${r.confColor}80` }}>{r.conf}</span>
                        </div>
                        <div className="risk-detail">{r.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          chatHistory.map((msg, i) => (
            msg.role === 'user' ? (
              <MsgUser key={i} text={msg.text} />
            ) : msg.text === '__SECURITY_DENIED__' ? (
              <div key={i} className="msg msg-agent">
                <div className="msg-avatar">A</div>
                <div className="msg-body">
                  <div className="msg-denied">Request blocked by security layer. Rephrase and try again.</div>
                </div>
              </div>
            ) : (
              <MsgAgentText key={i} text={msg.text} />
            )
          ))
        )}

        {isAgentThinking && <ThinkingBubble />}
      </div>

      {/* Scroll-to-bottom FAB */}
      {!atBottom && (
        <button className="scroll-fab" onClick={scrollToBottom} aria-label="Scroll to bottom">
          <ChevronDown size={14} />
        </button>
      )}

      {/* Composer */}
      <div className="chat-composer">
        {chatHistory.length === 0 && chips.length > 0 && (
          <div className="starter-chips">
            {chips.map(chip => (
              <button key={chip} className="starter-chip" onClick={() => handleChipClick(chip)}>
                {chip}
              </button>
            ))}
          </div>
        )}
        <div className="composer-box">
          <textarea
            ref={inputRef}
            className="composer-textarea"
            rows={1}
            placeholder="Ask Angela about this project…"
            value={chatMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />
          <div className="composer-row">
            <span className="composer-model">
              <span className="dot-live" />
              {activeModel || 'angela'}
            </span>
            <div className="composer-btns">
              <button
                className={`btn-mic${isListening ? ' btn-mic-active' : ''}`}
                onClick={handleToggleListening}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                <Mic size={14} />
              </button>
              <button
                className="btn-send"
                aria-label="Send"
                onClick={doSend}
                disabled={!chatMessage.trim() && !isAgentThinking}
              >
                <ArrowUp size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

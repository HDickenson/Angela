import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

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

const EV_PATTERN = /(\[(?:EV|RSK|DEC|DOC)-[A-Z0-9]+\])/g;

function renderWithEvidenceChips(text: string): React.ReactNode[] {
  const parts = text.split(EV_PATTERN);
  return parts.map((part, i) =>
    EV_PATTERN.test(part) ? (
      <span key={i} className="ev-chip">{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
// Reset lastIndex after use since the regex is stateful
function renderWithEvidenceChipsSafe(text: string): React.ReactNode[] {
  EV_PATTERN.lastIndex = 0;
  return renderWithEvidenceChips(text);
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

const WORKSPACE_CONTEXT: Record<string, {
  greeting: string;
  sampleQ: string;
  sampleA: string;
  riskTitle: string;
  risks: { label: string; conf: string; confColor: string; detail: string }[];
  chips: string[];
}> = {
  'harbour-tower': {
    greeting: "Hi Amelia — I'm across the Harbour Tower project. Ask me anything.",
    sampleQ: "What are the key risks to planning approval?",
    sampleA: "The top risks are [RSK-02] planning approval delay and [RSK-01] structural podium load capacity, both flagged in your council feedback and structural review.",
    riskTitle: "Top Planning Risks",
    risks: [
      { label: "Planning approval delay",   conf: "81%", confColor: "#10b981", detail: "High impact · Medium likelihood\nCouncil setback and podium height objections." },
      { label: "Structural podium failure",  conf: "72%", confColor: "#f59e0b", detail: "High impact · Medium likelihood\nPeer review of 1998 as-builts still in progress." },
    ],
    chips: [
      "What are the main planning approval risks?",
      "Which decisions have been made so far?",
      "What evidence is missing for the podium review?",
    ],
  },
  'facilities': {
    greeting: "Hi — I'm monitoring the Facilities Management incident. What do you need?",
    sampleQ: "What's the current status of the HVAC incident?",
    sampleA: "Chiller-02 is showing critical coolant pressure drop [EV-LOG-02]. The vendor SLA is void [EV-003] and emergency procurement is underway.",
    riskTitle: "Active Incident Risks",
    risks: [
      { label: "Full HVAC failure — North Wing", conf: "82%", confColor: "#ef4444", detail: "High impact · High likelihood\nHeatwave arrives in 4 days. Chiller-02 critical." },
      { label: "Tenant liability exposure",       conf: "77%", confColor: "#f59e0b", detail: "High impact · Medium likelihood\nSLA void — direct liability without active cover." },
    ],
    chips: [
      "What triggered the HVAC incident?",
      "What decisions have been made so far?",
      "What is the tenant liability exposure?",
    ],
  },
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
  const ctx = WORKSPACE_CONTEXT[activeWorkspaceId] ?? WORKSPACE_CONTEXT['harbour-tower'];
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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }

  function handleChipClick(chip: string) {
    setChatMessage(chip);
    inputRef.current?.focus();
  }

  return (
    <div className={className}>
      <div className="chat-scroll" ref={scrollRef}>
        {chatHistory.length === 0 ? (
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
              <div className="bubble">
                {renderWithEvidenceChipsSafe(ctx.sampleA)}
              </div>
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
                    <div style={{ color: 'var(--muted)', lineHeight: '1.5', fontSize: '12px', whiteSpace: 'pre-line' }}>
                      {r.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        {chatHistory.length === 0 && (
          <div className="starter-chips">
            {ctx.chips.map(chip => (
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
              animation: isListening ? 'evidence-node-pulse 1.5s infinite' : 'none'
            }}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic size={18} fill="currentColor" strokeWidth={0} />
          </button>
          <button className="send" aria-label="Send message" onClick={doSend} style={{ flexShrink: 0 }}>→</button>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: 6, height: 6, borderRadius: '50%', background: '#10b981', opacity: 0.8}}></div> Direct Routing</span>
          <span>{activeModel || 'angela'}</span>
        </div>

      </div>
    </div>
  );
}

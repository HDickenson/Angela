import React from 'react';
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

const STARTER_CHIPS = [
  'What are the main planning approval risks?',
  'Which decisions have been made so far?',
  'What evidence is missing for a full diagnosis?',
];

export function AdvisorPanel({
  chatMessage,
  setChatMessage,
  chatHistory,
  handleChat,
  isListening,
  handleToggleListening,
  className = 'advisor',
  isAgentThinking
}: AdvisorPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

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
              <div className="bubble">Hi Amelia, how can I help you understand this project?</div>
            </div>
            <div className="message user">
              <div className="bubble">What are the key risks to the planning approval for this extension?</div>
            </div>
            <div className="message">
              <div className="spark">✦</div>
              <div className="bubble">
                {renderWithEvidenceChipsSafe(
                  'Here are the top planning-related risks based on your project evidence [EV-0012] and council feedback [RSK-03].'
                )}
              </div>
            </div>
            <div className="risk-panel">
              <h3>Top Planning Risks</h3>
              <div className="risk-item">
                <div className="risk-num">1</div>
                <div className="risk-copy" style={{ width: '100%', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>Planning approval delay</span>
                    <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.5)' }}>85% Confidence</span>
                  </div>
                  <div style={{ color: 'var(--muted)', lineHeight: '1.5', fontSize: '12px' }}>
                    High impact · Medium likelihood<br/>Council feedback on height and podium setback.
                  </div>
                </div>
              </div>
              <div className="risk-item">
                <div className="risk-num">2</div>
                <div className="risk-copy" style={{ width: '100%', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>Community objections</span>
                    <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 6px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.5)' }}>72% Confidence</span>
                  </div>
                  <div style={{ color: 'var(--muted)', lineHeight: '1.5', fontSize: '12px' }}>
                    Medium impact · Medium likelihood<br/>Noise and overshadowing concerns raised in consultation.
                  </div>
                </div>
              </div>
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
            {STARTER_CHIPS.map(chip => (
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
          <span>gemini-2.0-flash</span>
        </div>

      </div>
    </div>
  );
}

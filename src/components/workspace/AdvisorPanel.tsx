import React from 'react';
import { Mic } from 'lucide-react';

export interface AdvisorPanelProps {
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  chatHistory: { role: 'user' | 'agent'; text: string; _id?: string }[];
  handleChat: () => void;
  isListening: boolean;
  handleToggleListening: () => void;
  onClose?: () => void;
  onDiagnose?: () => void;
  onGenerateDraft?: () => void;
  lastDiagnosis?: { diagnosisId: string; hypothesis: string; confidence: number } | null;
  isDraftLoading?: boolean;
  isAgentThinking?: boolean;
}

export function AdvisorPanel({
  chatMessage,
  setChatMessage,
  chatHistory,
  handleChat,
  isListening,
  handleToggleListening,
  onClose,
  onDiagnose,
  onGenerateDraft,
  lastDiagnosis,
  isDraftLoading,
  isAgentThinking
}: AdvisorPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAgentThinking]);

  return (
    <aside className="advisor">
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
              <div className="bubble">Here are the top planning-related risks based on your project evidence.</div>
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
                <div className="bubble">{msg.text}</div>
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
        <div className="input-shell" style={{ display: 'flex' }}>
          <input 
            style={{background: 'transparent', outline: 'none', border: 'none', width: '100%', color: 'var(--text)'}} 
            placeholder="Ask Angela about this project..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
          />
          <button 
            onClick={handleToggleListening}
            style={{
              marginLeft: '8px',
              color: isListening ? 'var(--danger)' : 'var(--muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              animation: isListening ? 'evidence-node-pulse 1.5s infinite' : 'none'
            }}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic size={18} fill="currentColor" strokeWidth={0} />
          </button>
          <button className="send" aria-label="Send message" onClick={handleChat}>→</button>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: 6, height: 6, borderRadius: '50%', background: '#10b981', opacity: 0.8}}></div> Direct Routing</span>
          <span>gemini-1.5-pro</span>
        </div>

        {(onDiagnose || onGenerateDraft) && (
          <div className="advisor-toolbar">
            {onDiagnose && (
              <button
                className="advisor-action"
                onClick={onDiagnose}
                disabled={isAgentThinking}
                aria-label="Run diagnosis on current context"
                title="Diagnose current workspace"
              >
                ⚡ Diagnose
              </button>
            )}
            {onGenerateDraft && (
              <button
                className="advisor-action primary-action"
                onClick={onGenerateDraft}
                disabled={isAgentThinking || isDraftLoading || !lastDiagnosis}
                aria-label="Generate draft report from last diagnosis"
                title={!lastDiagnosis ? 'Run a diagnosis first' : 'Generate draft report'}
              >
                {isDraftLoading ? '⏳ Generating…' : '📄 Draft Report'}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

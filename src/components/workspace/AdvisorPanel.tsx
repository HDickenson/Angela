import React from 'react';
import { Mic } from 'lucide-react';

export interface AdvisorPanelProps {
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  chatHistory: { role: 'user' | 'agent'; text: string }[];
  handleChat: () => void;
  isListening: boolean;
  handleToggleListening: () => void;
  onClose?: () => void;
}

export function AdvisorPanel({
  chatMessage,
  setChatMessage,
  chatHistory,
  handleChat,
  isListening,
  handleToggleListening,
  onClose
}: AdvisorPanelProps) {
  return (
    <aside className="advisor">
      <div className="chat-scroll">
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
              <div className="risk-item"><div className="risk-num">1</div><div className="risk-copy"><strong>Planning approval delay</strong>High impact · Medium likelihood<br/>Council feedback on height and podium setback.</div></div>
              <div className="risk-item"><div className="risk-num">2</div><div className="risk-copy"><strong>Community objections</strong>Medium impact · Medium likelihood<br/>Noise and overshadowing concerns raised in consultation.</div></div>
            </div>
          </>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} className={`message ${msg.role === 'user' ? 'user' : ''}`}>
              {msg.role === 'agent' && <div className="spark">✦</div>}
              <div className="bubble">{msg.text}</div>
            </div>
          ))
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
      </div>
    </aside>
  );
}

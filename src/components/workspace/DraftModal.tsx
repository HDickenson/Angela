import React from 'react';

interface Finding {
  claim: string;
  evidence_id: string;
  confidence: number;
}

interface Recommendation {
  action: string;
  rationale: string;
}

interface Draft {
  title: string;
  executive_summary: string;
  findings: Finding[];
  recommendations: Recommendation[];
  missing_evidence: string[];
}

interface DraftModalProps {
  draft: Draft | null;
  isOpen: boolean;
  onClose: () => void;
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10b981';
  if (confidence >= 0.6) return '#f59e0b';
  return '#ef4444';
}

export default function DraftModal({ draft, isOpen, onClose }: DraftModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !draft) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'sticky', top: 0, background: 'var(--card)', paddingTop: '4px', marginTop: '-4px', zIndex: 1 }}>
          <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: 0, paddingRight: '16px' }}>
            {draft.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              padding: '2px 4px'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Executive Summary */}
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--brass)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Executive Summary
          </h3>
          <p style={{ color: 'var(--text)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            {draft.executive_summary}
          </p>
        </section>

        {/* Findings */}
        {draft.findings && draft.findings.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--brass)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Findings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {draft.findings.map((finding, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    padding: '10px 12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(117, 82, 209, 0.14)',
                        color: '#c4b8f0',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius)',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        border: '1px solid rgba(117, 82, 209, 0.22)'
                      }}
                    >
                      {finding.evidence_id}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: confidenceColor(finding.confidence),
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {Math.round(finding.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {finding.claim}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {draft.recommendations && draft.recommendations.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--brass)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {draft.recommendations.map((rec, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: '2px solid var(--brass)',
                    paddingLeft: '12px'
                  }}
                >
                  <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '500', margin: '0 0 2px' }}>
                    {rec.action}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                    {rec.rationale}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Missing Evidence */}
        {draft.missing_evidence && draft.missing_evidence.length > 0 && (
          <section>
            <h3 style={{ color: 'var(--brass)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Missing Evidence
            </h3>
            <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {draft.missing_evidence.map((item, i) => (
                <li key={i} style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.5' }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import './AdminIngestionArea.css';

interface AdminIngestionAreaProps {
  onExit: () => void;
  onIngestComplete?: () => void;
}

const DEMO_PAYLOAD = `Harbour Tower Extension — Planning Approval Report (Aug 2024)
Project value: $38.6M uplift. 14-floor extension above existing 1998 podium.
Key issues: (1) Podium structural load capacity — independent peer review commissioned by Dr. Chen Wei due to age of as-built drawings. (2) Council feedback on North facade setbacks — waterfront sightline objections from neighbouring residents. (3) Wind tunnel testing commissioned by James Miller following revised 14-floor form factor. (4) Contractor rates locked until Oct 2024 — planning approval delay would void these rates and increase project cost.
Decisions recorded: Proceed with 14-floor model (DEC-01), initiate structural peer review (DEC-02), alter North facade setbacks (DEC-03), commission wind tunnel testing (DEC-04).
Risks: RSK-01 Structural Podium Failure (score 15), RSK-02 Planning Approval Delay (score 12), RSK-03 Cost Escalation (score 10), RSK-04 Wind Load Discrepancies (score 8).`;

type IngestResult = {
  artifact_type?: string;
  domain?: string;
  confidence?: number;
  key_entities?: string[];
  risk_signals?: string[];
  recommended_zone?: string;
  trace_id?: string;
};

export default function AdminIngestionArea({ onExit, onIngestComplete }: AdminIngestionAreaProps) {
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    setError(null);
    setDemoStep(1);

    // Steps 1–2 complete immediately (client-side parsing is instant)
    await delay(700);
    setDemoStep(2);
    await delay(600);
    setDemoStep(3); // Step 3 (Classify) runs while Gemini processes

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'admin',
        },
        body: JSON.stringify({
          payload: DEMO_PAYLOAD,
          source: 'Harbour_Tower_Planning_Report.pdf',
          workspaceId: 'harbour-tower',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ingestion failed');
        setDemoStep(0);
        setIsRunning(false);
        return;
      }

      // Step 3 done, step 4 validates, step 5 publishes
      setDemoStep(4);
      await delay(500);
      setDemoStep(5);
      await delay(600);
      setDemoStep(6);

      setResult({ ...data.data, trace_id: data.trace_id });
      onIngestComplete?.();
    } catch (e) {
      setError('Network error — check the server is running');
      setDemoStep(0);
    } finally {
      setIsRunning(false);
    }
  };

  const getQueueBadge = () => {
    if (demoStep === 0) return <span className="badge">Queued</span>;
    if (demoStep < 6) return <span className="badge blue">Processing…</span>;
    return <span className="badge green">Published ✓</span>;
  };

  const getStepBadge = (stepIndex: number) => {
    const stepNum = stepIndex + 1;
    if (stepIndex === 4) {
      if (demoStep >= 6) return <span className="badge green">Published ✓</span>;
      if (demoStep === 5) return <span className="badge blue">Running…</span>;
      return <span className="badge">Pending</span>;
    }
    if (demoStep > stepNum) return <span className="badge green">Done</span>;
    if (demoStep === stepNum) return <span className="badge blue">Running…</span>;
    return <span className="badge">Pending</span>;
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={onExit}>
          <div className="brand-mark"></div>
          <div><strong>Angela</strong><span>Admin Console</span></div>
        </div>

        <div className="nav-group">
          <div className="nav-label">Operations</div>
          <div className="nav-item active">Ingestion <span className="nav-count">1</span></div>
        </div>

        <div className="nav-group" style={{ marginTop: 'auto' }}>
          <div className="nav-label">Environment</div>
          <div className="nav-item">Demo Mode <span className="nav-count">Live</span></div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="topbar">
          <div className="title-block">
            <h1>Admin Ingestion Area</h1>
            <p>Load, validate, classify and publish trusted project knowledge into Angela.</p>
          </div>
          <div className="top-actions">
            <button className="btn primary" onClick={runDemo} disabled={isRunning}>
              {isRunning ? 'Processing…' : 'Run Ingestion'}
            </button>
          </div>
        </header>

        <section className="admin-workspace">
          {/* Panel 1 — Source Intake */}
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>1. Source Intake</h2>
                <p>Nothing reaches the Advisor Canvas until it passes validation.</p>
              </div>
              <span className="badge amber">Admin only</span>
            </div>
            <div className="panel-body">
              <div className="upload-card">
                <div className="upload-icon">↑</div>
                <h3>Harbour_Tower_Planning_Report.pdf</h3>
                <p>43 pages · Planning approval risk assessment for the $38.6M 14-floor extension. Includes structural review, council feedback, wind tunnel findings.</p>
                <button className="btn primary" onClick={runDemo} disabled={isRunning}>
                  {demoStep === 0 ? 'Ingest Document' : demoStep < 6 ? 'Processing…' : 'Ingested ✓'}
                </button>
              </div>

              <div className="source-grid">
                <div className="source-tile"><strong>Documents</strong><span>PDF, DOCX, policy packs, proposals, reports.</span></div>
                <div className="source-tile"><strong>Spreadsheets</strong><span>XLSX, CSV, financial models, cost tables.</span></div>
                <div className="source-tile"><strong>Images</strong><span>Site photos, scans, diagrams, visual evidence.</span></div>
                <div className="source-tile"><strong>Systems</strong><span>SharePoint, Drive, CRM, ERP, archive exports.</span></div>
              </div>

              <div className="form-stack">
                <div className="field">
                  <label>Knowledge domain</label>
                  <select defaultValue="Planning and approvals">
                    <option>Real estate / project delivery</option>
                    <option>Commercial governance</option>
                    <option>Planning and approvals</option>
                    <option>Design and construction</option>
                  </select>
                </div>
                <div className="field">
                  <label>Access policy</label>
                  <select defaultValue="Project team only">
                    <option>Project team only</option>
                    <option>Admin + leadership</option>
                    <option>Restricted commercial</option>
                    <option>Public internal knowledge</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 2 — Queue + Pipeline */}
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>2. Ingestion Queue</h2>
                <p>Each item is parsed, extracted, classified and prepared for review.</p>
              </div>
              <span className={`badge ${demoStep >= 6 ? 'green' : 'blue'}`}>
                {demoStep >= 6 ? 'Complete' : '1 active'}
              </span>
            </div>
            <div className="panel-body">
              {error && (
                <div style={{ padding: '10px 12px', marginBottom: '10px', background: 'rgba(215,125,134,0.1)', border: '1px solid rgba(215,125,134,0.3)', borderRadius: 'var(--radius-xl)', color: '#d77d86', fontSize: '12px' }}>
                  ✕ {error}
                </div>
              )}
              {demoStep >= 6 && (
                <div style={{ padding: '10px 12px', marginBottom: '10px', background: 'rgba(130,201,157,0.1)', border: '1px solid rgba(130,201,157,0.3)', borderRadius: 'var(--radius-xl)', color: '#82c99d', fontSize: '12px' }}>
                  ✓ Published to Angela — evidence now available in Harbour Tower workspace
                </div>
              )}

              <div className="queue-list">
                <div className="queue-item">
                  <div className="file-icon">PDF</div>
                  <div>
                    <div className="queue-title">Harbour_Tower_Planning_Report.pdf</div>
                    <div className="queue-meta"><span>43 pages</span><span>Planning / approvals</span><span>Harbour Tower</span></div>
                  </div>
                  {getQueueBadge()}
                </div>
              </div>

              <div className="pipeline">
                <div className="step"><div className="step-num">01</div><div><strong>Parse source</strong><span>Detect file type, split content, extract tables, metadata and text.</span></div>{getStepBadge(0)}</div>
                <div className="step"><div className="step-num">02</div><div><strong>Extract entities</strong><span>Find dates, owners, risks, commitments, costs and decisions.</span></div>{getStepBadge(1)}</div>
                <div className="step"><div className="step-num">03</div><div><strong>Classify knowledge</strong><span>Gemini maps content to project domain, artifact type and confidence.</span></div>{getStepBadge(2)}</div>
                <div className="step"><div className="step-num">04</div><div><strong>Validate trust</strong><span>Check duplicates, restricted terms and source quality.</span></div>{getStepBadge(3)}</div>
                <div className="step"><div className="step-num">05</div><div><strong>Publish to Angela</strong><span>Release to Advisor Canvas with provenance intact.</span></div>{getStepBadge(4)}</div>
              </div>
            </div>
          </section>

          {/* Panel 3 — Inspector */}
          <section className="panel inspector-panel">
            <div className="panel-header">
              <div>
                <h2>3. Review & Publish</h2>
                <p>What Gemini extracted from the document.</p>
              </div>
              <span className={`badge ${demoStep >= 6 ? 'green' : 'violet'}`}>
                {demoStep >= 6 ? 'Published' : 'Inspector'}
              </span>
            </div>
            <div className="panel-body">
              {result ? (
                <>
                  <div className="quality-grid">
                    <div className="metric">
                      <strong>{result.confidence ? `${Math.round(result.confidence * 100)}%` : '—'}</strong>
                      <span>Confidence</span>
                    </div>
                    <div className="metric">
                      <strong>{result.key_entities?.length ?? '—'}</strong>
                      <span>Entities found</span>
                    </div>
                    <div className="metric">
                      <strong>{result.risk_signals?.length ?? '—'}</strong>
                      <span>Risk signals</span>
                    </div>
                  </div>

                  <div className="inspector-card">
                    <h3>Harbour Tower Planning Report</h3>
                    {result.artifact_type && <div className="kv"><span>Artifact type</span><span>{result.artifact_type}</span></div>}
                    {result.domain && <div className="kv"><span>Domain</span><span>{result.domain}</span></div>}
                    {result.recommended_zone && <div className="kv"><span>Access zone</span><span>{result.recommended_zone}</span></div>}
                    {result.trace_id && <div className="kv"><span>Trace ID</span><span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{result.trace_id}</span></div>}
                  </div>

                  {result.key_entities && result.key_entities.length > 0 && (
                    <div className="evidence-list">
                      <div className="evidence">
                        <strong>Key entities extracted</strong>
                        <p>{result.key_entities.join(' · ')}</p>
                      </div>
                    </div>
                  )}

                  {result.risk_signals && result.risk_signals.length > 0 && (
                    <div className="evidence-list" style={{ marginTop: '10px' }}>
                      <div className="evidence">
                        <strong>Risk signals detected</strong>
                        <p>{result.risk_signals.join(' · ')}</p>
                      </div>
                    </div>
                  )}

                  <div className="audit" style={{ marginTop: '14px' }}>
                    <div className="audit-row"><span>Now</span><div><strong>Angela classified source</strong><br />{result.domain ?? 'Planning evidence'} · confidence {result.confidence ? Math.round(result.confidence * 100) + '%' : 'assessed'}</div></div>
                    <div className="audit-row"><span>Now</span><div><strong>Evidence published</strong><br />Available in Harbour Tower workspace chat and diagnose</div></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="quality-grid">
                    <div className="metric"><strong>—</strong><span>Confidence</span></div>
                    <div className="metric"><strong>—</strong><span>Entities found</span></div>
                    <div className="metric"><strong>—</strong><span>Risk signals</span></div>
                  </div>
                  <div className="inspector-card">
                    <h3>Awaiting ingestion</h3>
                    <div className="kv"><span>Status</span><span><span className="badge">{demoStep > 0 ? 'Processing…' : 'Ready'}</span></span></div>
                    <div className="kv"><span>Source</span><span>Harbour_Tower_Planning_Report.pdf</span></div>
                    <div className="kv"><span>Workspace</span><span>Harbour Tower Extension</span></div>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle"><span>Allow Advisor Canvas use</span><span className="switch"></span></div>
                    <div className="toggle"><span>Require source trail citation</span><span className="switch"></span></div>
                    <div className="toggle"><span>Mark sensitive commercial sections</span><span className="switch"></span></div>
                  </div>
                </>
              )}
            </div>
          </section>
        </section>

        <footer className="statusbar">
          <div className="status-items">
            <span><i className="status-dot"></i>RBAC enforced</span>
            <span><i className="status-dot"></i>Source trails preserved</span>
            <span><i className="status-dot"></i>Audit logging active</span>
            <span><i className="status-dot"></i>Gemini classification active</span>
          </div>
          <div>Harbour Tower Extension · Demo Mode</div>
        </footer>
      </main>
    </div>
  );
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

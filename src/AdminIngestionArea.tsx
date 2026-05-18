import React, { useState } from 'react';
import './AdminIngestionArea.css';

interface AdminIngestionAreaProps {
  onExit: () => void;
}

export default function AdminIngestionArea({ onExit }: AdminIngestionAreaProps) {
  const [demoStep, setDemoStep] = useState<number>(0); // 0=idle, 1-5=steps running, 6=complete
  const [isRunning, setIsRunning] = useState(false);

  const runDemo = () => {
    if (isRunning) return;
    setIsRunning(true);
    setDemoStep(1);
    const delays = [1400, 1300, 1600, 1200, 1500];
    let total = 0;
    delays.forEach((d, i) => {
      total += d;
      setTimeout(() => setDemoStep(i + 2), total);
    });
    setTimeout(() => setIsRunning(false), total);
  };

  const getQueueBadge = () => {
    if (demoStep === 0) return <span className="badge">Queued</span>;
    if (demoStep >= 1 && demoStep < 6) return <span className="badge blue">Processing...</span>;
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
        <div className="brand cursor-pointer" onClick={onExit}>
          <div className="brand-mark"></div>
          <div><strong>Angela</strong><span>Admin Console</span></div>
        </div>

        <div className="nav-group">
          <div className="nav-label">Operations</div>
          <div className="nav-item active">Ingestion <span className="nav-count">18</span></div>
        </div>

        <div className="nav-group" style={{ marginTop: 'auto' }}>
          <div className="nav-label">Environment</div>
          <div className="nav-item">Hackathon Demo <span className="nav-count">Live</span></div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="topbar">
          <div className="title-block">
            <h1>Admin Ingestion Area</h1>
            <p>Load, validate, classify and publish trusted project knowledge into Angela.</p>
          </div>
          <div className="top-actions">
            <button className="btn primary" onClick={runDemo}>Run Ingestion Demo</button>
          </div>
        </header>

        <section className="admin-workspace">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>1. Source Intake</h2>
                <p>Admins add raw material here. Nothing reaches the Advisor Canvas until it passes validation.</p>
              </div>
              <span className="badge amber">Admin only</span>
            </div>
            <div className="panel-body">
              <div className="upload-card">
                <div className="upload-icon">↑</div>
                <h3>Drop files or connect a source</h3>
                <p>Upload PDFs, spreadsheets, site images, meeting notes, contracts, project records or structured exports.</p>
                <button className="btn primary" onClick={runDemo}>Load Demo Document</button>
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
                  <select defaultValue="Real estate / project delivery">
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
                <div className="field">
                  <label>Admin note</label>
                  <textarea placeholder="Why is this source being added? What should Angela treat carefully?"></textarea>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>2. Ingestion Queue</h2>
                <p>Each item is parsed, extracted, classified, permissioned and prepared for review.</p>
              </div>
              <span className="badge blue">18 active</span>
            </div>
            <div className="panel-body">
              {demoStep >= 6 && (
                <div style={{ padding: '10px 12px', marginBottom: '10px', background: 'rgba(130,201,157,0.1)', border: '1px solid rgba(130,201,157,0.3)', borderRadius: 'var(--radius-xl)', color: '#82c99d', fontSize: '12px' }}>
                  ✓ Harbour_Tower_Planning_Report.pdf published to Angela canvas
                </div>
              )}
              <div className="queue-list">
                <div className="queue-item">
                  <div className="file-icon">PDF</div>
                  <div><div className="queue-title">Harbour_Tower_Planning_Report.pdf</div><div className="queue-meta"><span>43 pages</span><span>OCR complete</span><span>Needs review</span></div></div>
                  {getQueueBadge()}
                </div>
                <div className="queue-item">
                  <div className="file-icon">XLS</div>
                  <div><div className="queue-title">Q4_Cost_Model_Revised.xlsx</div><div className="queue-meta"><span>12 sheets</span><span>Live-link candidate</span><span>Validated</span></div></div>
                  <span className="badge green">96%</span>
                </div>
                <div className="queue-item">
                  <div className="file-icon">IMG</div>
                  <div><div className="queue-title">Site_Access_Photos.zip</div><div className="queue-meta"><span>26 images</span><span>Location tags missing</span><span>Restricted</span></div></div>
                  <span className="badge rose">Hold</span>
                </div>
              </div>

              <div className="pipeline">
                <div className="step"><div className="step-num">01</div><div><strong>Parse source</strong><span>Detect file type, split content, extract tables, images, metadata and text.</span></div>{getStepBadge(0)}</div>
                <div className="step"><div className="step-num">02</div><div><strong>Extract entities</strong><span>Find dates, owners, locations, risks, commitments, costs and decisions.</span></div>{getStepBadge(1)}</div>
                <div className="step"><div className="step-num">03</div><div><strong>Classify knowledge</strong><span>Map items to project domain, artifact type, taxonomy and confidence.</span></div>{getStepBadge(2)}</div>
                <div className="step"><div className="step-num">04</div><div><strong>Validate trust</strong><span>Check duplicates, restricted terms, missing owners and weak source quality.</span></div>{getStepBadge(3)}</div>
                <div className="step"><div className="step-num">05</div><div><strong>Publish to Angela</strong><span>Release approved knowledge to the Advisor Canvas with provenance intact.</span></div>{getStepBadge(4)}</div>
              </div>
            </div>
          </section>

          <section className="panel inspector-panel">
            <div className="panel-header">
              <div>
                <h2>3. Review & Publish</h2>
                <p>Admins approve what Angela can use, what remains restricted, and what needs a human label.</p>
              </div>
              <span className="badge violet">Inspector</span>
            </div>
            <div className="panel-body">
              <div className="quality-grid">
                <div className="metric"><strong>91%</strong><span>Source quality</span></div>
                <div className="metric"><strong>14</strong><span>Entities found</span></div>
                <div className="metric"><strong>3</strong><span>Review flags</span></div>
              </div>

              <div className="inspector-card">
                <h3>Harbour Tower Planning Report</h3>
                <div className="kv"><span>Status</span><span><span className="badge amber">Needs review</span></span></div>
                <div className="kv"><span>Classification</span><span>Planning / approvals / risk evidence</span></div>
                <div className="kv"><span>Access</span><span>Project team, planning leads, admins</span></div>
                <div className="kv"><span>Suggested use</span><span>Risk detection, decision support, proposal evidence</span></div>
              </div>

              <div className="evidence-list">
                <div className="evidence"><strong>Detected risk signal</strong><p>Multiple references to access constraints, neighbouring stakeholder concerns and timing dependency on authority approval.</p></div>
                <div className="evidence"><strong>Missing metadata</strong><p>Document owner and approval status are not present. Require admin label before publishing.</p></div>
                <div className="evidence"><strong>Duplicate candidate</strong><p>Similar content found in "Planning_Report_v3_FINAL.pdf". Recommend merge or archive one version. Classic enterprise filename crime scene.</p></div>
              </div>

              <div className="toggle-row">
                <div className="toggle"><span>Allow Advisor Canvas use</span><span className="switch"></span></div>
                <div className="toggle"><span>Require source trail citation</span><span className="switch"></span></div>
                <div className="toggle"><span>Mark sensitive commercial sections</span><span className="switch"></span></div>
              </div>

              <div className="audit">
                <div className="audit-row"><span>10:42</span><div><strong>Angela classified source</strong><br/>Planning evidence · confidence 0.84</div></div>
                <div className="audit-row"><span>10:44</span><div><strong>Admin changed access policy</strong><br/>From "project team" to "planning leads only"</div></div>
                <div className="audit-row"><span>10:47</span><div><strong>Validation flagged duplicate</strong><br/>Potential overlap with previous final report</div></div>
              </div>
            </div>
          </section>
        </section>

        <footer className="statusbar">
          <div className="status-items">
            <span><i className="status-dot"></i>RBAC enforced</span>
            <span><i className="status-dot"></i>Source trails preserved</span>
            <span><i className="status-dot"></i>Audit logging active</span>
            <span><i className="status-dot"></i>PII scan enabled</span>
          </div>
          <div>Last ingestion check: 18 May 2026 · 10:48 GST</div>
        </footer>
      </main>
    </div>
  );
}

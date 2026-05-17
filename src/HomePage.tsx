import React from 'react';
import './HomePage.css';
import { Lock } from 'lucide-react';

interface HomePageProps {
  onEnter: () => void;
  onAdminEnter: () => void;
}

export default function HomePage({ onEnter, onAdminEnter }: HomePageProps) {
  return (
    <div className="landing-root">
      <div className="site-shell">
        <nav className="nav" aria-label="Primary navigation">
          <div className="nav-inner">
            <a href="#" className="brand" aria-label="Angela home">
              <span className="brand-mark">✦</span>
              <span className="brand-name">Angela</span>
            </a>
            <div className="nav-links" aria-label="Page sections">
              <a href="#why">Why Angela</a>
              <a href="#canvas">Advisor Canvas</a>
              <a href="#workflow">Workflow</a>
              <a href="#trust">Trust</a>
            </div>
            <div className="nav-actions">
              <button className="action-button" onClick={onAdminEnter}><Lock size={14} style={{display: 'inline-block', marginRight: '6px', verticalAlign: 'text-bottom'}} /> Admins</button>
              <button className="action-button primary" onClick={onEnter}>Enter Advisor</button>
            </div>
          </div>
        </nav>

        <header className="hero">
          <div className="hero-grid">
            <div className="hero-copy-wrap">
              <div className="eyebrow">Enterprise diagnostic intelligence</div>
              <h1>Grounded project <span>knowledge.</span></h1>
              <p className="hero-copy">
                Angela helps professional teams collect project evidence, connect decisions and risks, surface similar work, and create decision-ready outputs without turning your institutional knowledge into another generic chatbot.
              </p>
              <div className="hero-actions">
                <button className="action-button primary" onClick={onEnter}>Enter the Advisor Workspace</button>
                <a className="action-button" href="#workflow">Explore the workflow</a>
              </div>
              <div className="hero-proof" aria-label="Product trust indicators">
                <div className="proof-item"><span className="proof-icon">✣</span>Traceable outputs</div>
                <div className="proof-item"><span className="proof-icon">▢</span>Governed sources</div>
                <div className="proof-item"><span className="proof-icon">◈</span>Live or snapshot</div>
              </div>
            </div>

            <div className="hero-stage" id="canvas" aria-label="Angela advisor canvas preview">
              <div className="mock-top">
                <div className="mock-title">Harbour Tower Extension <span className="mock-pill">◎ Workspace</span></div>
                <div className="mock-pill">Source-linked</div>
              </div>
              <div className="mock-body">
                <svg className="connector-layer" width="760" height="560" viewBox="0 0 760 560" aria-hidden="true">
                  <path className="connector brass" d="M190 92 C225 92 220 146 248 146" />
                  <path className="connector blue" d="M425 126 C456 150 456 230 510 230" />
                  <path className="connector violet" d="M250 300 C320 330 390 330 500 300" />
                  <path className="connector brass" d="M430 360 C430 410 438 418 448 420" />
                  <path className="connector violet" d="M294 468 C340 470 340 470 346 470" />
                  <circle className="node brass" cx="190" cy="92" r="4" />
                  <circle className="node blue" cx="425" cy="126" r="4" />
                  <circle className="node violet" cx="500" cy="300" r="4" />
                  <circle className="node brass" cx="448" cy="420" r="4" />
                </svg>

                <article className="mini-card card-doc">
                  <button className="pin" aria-label="Pinned project document">📌</button>
                  <div className="mini-label">Source Document</div>
                  <div className="mini-lines"><div className="line long"></div><div className="line mid"></div><div className="line short"></div></div>
                </article>

                <article className="mini-card card-sheet">
                  <button className="pin" aria-label="Pinned spreadsheet">📌</button>
                  <div className="mini-label">Financial Model</div>
                  <table className="mini-table">
                    <tbody>
                      <tr><td>Cost signal</td><td>High</td></tr>
                      <tr><td>Planning</td><td>Med</td></tr>
                      <tr><td>Score</td><td>20</td></tr>
                    </tbody>
                  </table>
                </article>

                <article className="mini-card card-image">
                  <button className="pin" aria-label="Pinned site image">📌</button>
                  <div className="mini-label">Site Image</div>
                  <div className="photo-block"></div>
                  <div className="mini-lines"><div className="line mid"></div></div>
                </article>

                <article className="mini-card card-decision">
                  <button className="pin" aria-label="Pinned decision log">📌</button>
                  <div className="mini-label">Decision Log</div>
                  <table className="mini-table">
                    <tbody>
                      <tr><td>Proceed with option 2B</td><td>Verified</td></tr>
                      <tr><td>Structural peer review</td><td>Source-linked</td></tr>
                      <tr><td>Planning approval</td><td>Needs review</td></tr>
                    </tbody>
                  </table>
                </article>

                <article className="mini-card card-risk">
                  <button className="pin" aria-label="Pinned risk register">📌</button>
                  <div className="mini-label">Risk Register</div>
                  <table className="mini-table">
                    <tbody>
                      <tr><td>Approval delay</td><td>15</td></tr>
                      <tr><td>Cost escalation</td><td>20</td></tr>
                      <tr><td>Community objections</td><td>11</td></tr>
                    </tbody>
                  </table>
                </article>

                <article className="mini-card card-similar">
                  <button className="pin" aria-label="Pinned similar projects">📌</button>
                  <div className="mini-label">Similar Projects</div>
                  <div className="mini-lines"><div className="line long"></div><div className="line mid"></div><div className="line short"></div></div>
                </article>

                <article className="mini-card card-output">
                  <button className="pin" aria-label="Pinned proposal output">📌</button>
                  <div className="mini-label">Advisor Output</div>
                  <div className="mini-lines"><div className="line long"></div><div className="line long"></div><div className="line mid"></div></div>
                </article>

                <aside className="advisor-mini" aria-label="Angela advisor suggestion">
                  <div className="spark">✦</div>
                  <strong>Angela noticed a pattern.</strong>
                  <p>This project resembles three prior extensions with planning approval risk. Pin the comparison or view evidence.</p>
                </aside>
              </div>
            </div>
          </div>
        </header>

        <section className="section" id="why">
          <div className="section-head">
            <div>
              <div className="kicker">Why it exists</div>
              <h2>Enterprise knowledge is not missing. It is scattered.</h2>
            </div>
            <p>
              Project decisions, risks, proposal proof, stakeholder context, financial assumptions, and lessons learned usually live in different places. Angela gives teams a calm surface to collate what matters and understand how it connects.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">▤</div>
              <h3>Collect project evidence</h3>
              <p>Add documents, images, spreadsheets, notes, and source records to one working canvas without forcing users into technical ingestion flows.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">⌬</div>
              <h3>Connect what matters</h3>
              <p>Evidence links show where insights came from, what state the data is in, and whether a relationship is live, verified, suggested, or restricted.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">✦</div>
              <h3>Suggest useful context</h3>
              <p>Angela surfaces similar projects, likely concerns, planning risks, and supporting evidence while leaving the professional in control.</p>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="kicker">Two operating modes</div>
              <h2>Built for governed knowledge and professional creation.</h2>
            </div>
            <p>
              Angela separates operational control from professional output. Admin teams manage what can be used. Specialists use the Advisor Canvas to understand, correlate, and create.
            </p>
          </div>

          <div className="split-section">
            <article className="ecosystem">
              <h3>Ingest &amp; Manage</h3>
              <p>For technical, admin, and governance teams preparing safe, classified, source-linked institutional knowledge.</p>
              <div className="ecosystem-list">
                <div className="ecosystem-item">Connect source libraries, project records, spreadsheets, images, and decision logs.</div>
                <div className="ecosystem-item">Classify data by role, access level, sensitivity, and freshness.</div>
                <div className="ecosystem-item">Monitor ingestion quality, audit trails, and source health.</div>
              </div>
            </article>

            <article className="ecosystem">
              <h3>Advisor Canvas</h3>
              <p>For proposal writers, project managers, consultants, and work-winning teams creating useful outputs from grounded evidence.</p>
              <div className="ecosystem-list">
                <div className="ecosystem-item">Pin documents, notes, spreadsheets, risks, and similar project cards to the canvas.</div>
                <div className="ecosystem-item">Ask Angela to explain decisions, surface risks, and compare prior projects.</div>
                <div className="ecosystem-item">Create evidence-backed briefs, risk registers, proposal sections, and project summaries.</div>
              </div>
            </article>
          </div>
        </section>

        <section className="section" id="workflow">
          <div className="section-head">
            <div>
              <div className="kicker">How Angela works</div>
              <h2>A goal-led workflow, not another search box.</h2>
            </div>
            <p>
              The interface stays simple: add what you know, ask what you need, review what Angela suggests, then pin the useful evidence or output back to the canvas.
            </p>
          </div>

          <div className="workflow">
            <div className="workflow-row">
              <div className="workflow-label"><span>01</span><h3>Add project context</h3></div>
              <div className="workflow-detail">
                <span className="chip brass">Documents</span>
                <span className="chip blue">Spreadsheets</span>
                <span className="chip">Images</span>
                <span className="chip">Notes</span>
              </div>
            </div>
            <div className="workflow-row">
              <div className="workflow-label"><span>02</span><h3>Angela correlates signals</h3></div>
              <div className="workflow-detail">
                <span className="chip violet">Similar projects</span>
                <span className="chip brass">Decision lineage</span>
                <span className="chip blue">Live data links</span>
                <span className="chip">Risk contributors</span>
              </div>
            </div>
            <div className="workflow-row">
              <div className="workflow-label"><span>03</span><h3>Create decision-ready work</h3></div>
              <div className="workflow-detail">
                <span className="chip violet">Proposal section</span>
                <span className="chip">Risk register</span>
                <span className="chip brass">Decision brief</span>
                <span className="chip blue">Evidence packet</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="trust">
          <div className="section-head">
            <div>
              <div className="kicker">Trust layer</div>
              <h2>Every useful answer needs receipts.</h2>
            </div>
            <p>
              Angela’s interface is designed to make provenance visible without turning the workspace into a compliance swamp. Users can see source trails, permissions, and freshness when it matters.
            </p>
          </div>

          <div className="trust-grid">
            <article className="trust-card"><strong>Traceable</strong><p>Every generated output can point back to the documents, data, or project records that shaped it.</p></article>
            <article className="trust-card"><strong>Governed</strong><p>Role-aware access keeps sensitive knowledge out of reach while still allowing safe summaries and redactions.</p></article>
            <article className="trust-card"><strong>Current</strong><p>Canvas objects can be live-linked or frozen as snapshots for proposals, audit records, and client outputs.</p></article>
            <article className="trust-card"><strong>Human-led</strong><p>Angela suggests, collates, and explains. The professional decides what gets pinned, edited, exported, or ignored.</p></article>
          </div>
        </section>

        <section className="section" id="cta">
          <div className="cta-panel">
            <div>
              <div className="kicker">Start with the Advisor Canvas</div>
              <h2>Know what your projects already know.</h2>
              <p>Use Angela to understand decisions, troubleshoot issues, create risk registers, and write proposal extensions from grounded project knowledge.</p>
            </div>
            <div className="hero-actions" style={{ margin: 0 }}>
              <button className="action-button primary" onClick={onEnter}>Enter Advisor Workspace</button>
              <button className="action-button" onClick={onEnter}>Explore Ingest &amp; Manage</button>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="brand">
              <span className="brand-mark" style={{ fontSize: '22px', width: '26px', height: '26px' }}>✦</span>
              <span className="brand-name" style={{ fontSize: '25px' }}>Angela</span>
            </div>
            <div>Grounded project knowledge for enterprise teams.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

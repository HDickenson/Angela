import React from 'react';

export function StatusBar() {
  return (
    <footer className="statusbar">
      <div className="trust">
        <div className="trust-item">
          <span className="status-dot"></span>
          <span>Data live-linked<small>3 sources tracking</small></span>
        </div>
        <div className="trust-item">
          <span className="icon">🛡</span>
          <span>Role: Strategy &amp; Proposals<small>Restricted data hidden</small></span>
        </div>
      </div>
      <div className="freshness">Last synced: 2m ago</div>
    </footer>
  );
}

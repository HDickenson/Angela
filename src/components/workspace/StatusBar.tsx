import React, { useState, useEffect } from 'react';

export function StatusBar() {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatAge = (s: number) => {
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

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
      <div className="freshness">Last synced: {formatAge(secondsAgo)}</div>
    </footer>
  );
}

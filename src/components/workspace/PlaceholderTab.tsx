import React from 'react';

export function PlaceholderTab({ tabName }: { tabName: string }) {
  return (
    <div style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}>🚧</div>
      <h2 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '12px' }}>{tabName.charAt(0).toUpperCase() + tabName.slice(1)} view is under construction</h2>
      <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
        This section of the Harbour Tower Extension workspace is currently being built. 
        Select <strong>Projects</strong> from the sidebar to return to the interactive canvas.
      </p>
    </div>
  );
}

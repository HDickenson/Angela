import React from 'react';

export interface WorkspaceHeaderProps {
  onExit: () => void;
}

export function WorkspaceHeader({ onExit }: WorkspaceHeaderProps) {
  return (
    <header className="topbar">
      <div className="workspace-switcher">
        Harbour Tower Extension⌄
        <span className="pill">◎ Workspace</span>
      </div>
      <div className="top-actions">
        <div className="search">⌕ <span>Search</span><span style={{marginLeft: "auto"}}>≡</span></div>
        <span className="icon">♢</span>
        <div className="avatar cursor-pointer" onClick={onExit} title="Exit Workspace">AH</div>
      </div>
    </header>
  );
}

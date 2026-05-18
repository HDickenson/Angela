import React from 'react';

export interface ProjectHeaderProps {
  activeWorkspaceId: string;
  activeView?: string;
  setActiveView?: (view: string) => void;
}

export function ProjectHeader({ activeWorkspaceId, activeView = 'canvas', setActiveView }: ProjectHeaderProps) {
  const getWorkspaceName = () => {
    switch (activeWorkspaceId) {
      case 'harbour-tower': return 'Harbour Tower Extension';
      case 'facilities': return 'Facilities Management Domain';
      case 'enterprise': return 'Enterprise Operational Data';
      default: return 'Project Workspace';
    }
  };

  return (
    <section className="project-head">
      <div>
        <h1>{getWorkspaceName()}</h1>
        <div className="subtitle">Collect. Connect. Understand. Create.</div>
      </div>
      <div className="head-actions">
        <button className="button">♙ Share</button>
        <button className="button">Export⌄</button>
        <button className="button primary">＋ Add to canvas</button>
      </div>
      <div className="toolbar">
        <div className="tabs">
          <div className={`tab${activeView === 'canvas' ? ' active' : ''}`} onClick={() => setActiveView?.('canvas')}>▦ Canvas</div>
          <div className={`tab${activeView === 'board' ? ' active' : ''}`} onClick={() => setActiveView?.('board')}>▥ Board</div>
          <div className={`tab${activeView === 'timeline' ? ' active' : ''}`} onClick={() => setActiveView?.('timeline')}>☷ Timeline</div>
          <div className={`tab${activeView === 'table' ? ' active' : ''}`} onClick={() => setActiveView?.('table')}>▤ Table</div>
        </div>
        <div className="zoom-tools">
          <div className="pill">Group: <strong>None</strong>⌄</div>
          <div className="pill">− &nbsp; 100% &nbsp; ＋</div>
          <div className="pill">⛶</div>
        </div>
      </div>
    </section>
  );
}

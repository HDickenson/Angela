import React from 'react';

export interface ProjectHeaderProps {
  activeWorkspaceId: string;
}

export function ProjectHeader({ activeWorkspaceId }: ProjectHeaderProps) {
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
          <div className="tab active">▦ Canvas</div>
          <div className="tab">▥ Board</div>
          <div className="tab">☷ Timeline</div>
          <div className="tab">▤ Table</div>
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

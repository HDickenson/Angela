import React from 'react';

export interface SidebarProps {
  currentRole: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ currentRole, isCollapsed, onToggleCollapse, activeWorkspaceId, setActiveWorkspaceId, activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="brand" onClick={onToggleCollapse} style={{ cursor: 'pointer' }}>
        <div className="brand-mark">✦</div>
        {!isCollapsed && <div className="brand-name">Angela</div>}
      </div>

      <div>
        {!isCollapsed && <div className="section-label">Ingest &amp; Manage</div>}
        <nav className="nav-list">
          <div className={`nav-item ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}><span className="icon">⌘</span>{!isCollapsed && <span>Sources</span>}</div>
          <div className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}><span className="icon">□</span>{!isCollapsed && <span>Projects</span>}</div>
          <div className={`nav-item ${activeTab === 'decisions' ? 'active' : ''}`} onClick={() => setActiveTab('decisions')}><span className="icon">✓</span>{!isCollapsed && <span>Decisions</span>}</div>
          <div className={`nav-item ${activeTab === 'risks' ? 'active' : ''}`} onClick={() => setActiveTab('risks')}><span className="icon">▱</span>{!isCollapsed && <span>Risks</span>}</div>
          <div className={`nav-item ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}><span className="icon">♙</span>{!isCollapsed && <span>People &amp; Organisations</span>}</div>
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><span className="icon">◎</span>{!isCollapsed && <span>Audit Trail</span>}</div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><span className="icon">⚙</span>{!isCollapsed && <span>Settings</span>}</div>
        </nav>
      </div>

      <div className="spacer"></div>

      <div className="workspace-list-wrap">
        {!isCollapsed && <div className="section-label">Recent Workspaces</div>}
        <div className="workspace-list">
          <div className={`workspace-item ${activeWorkspaceId === 'harbour-tower' ? 'active' : ''}`} onClick={() => setActiveWorkspaceId('harbour-tower')} style={{ cursor: 'pointer' }}>
            <span className="icon">▧</span>{!isCollapsed && <span>Harbour Tower Extension</span>}
          </div>
          <div className={`workspace-item ${activeWorkspaceId === 'facilities' ? 'active' : ''}`} onClick={() => setActiveWorkspaceId('facilities')} style={{ cursor: 'pointer' }}>
            <span className="icon">⌬</span>{!isCollapsed && <span>Facilities Management</span>}
          </div>
          <div className={`workspace-item ${activeWorkspaceId === 'enterprise' ? 'active' : ''}`} onClick={() => setActiveWorkspaceId('enterprise')} style={{ cursor: 'pointer' }}>
            <span className="icon">◈</span>{!isCollapsed && <span>Enterprise Operations</span>}
          </div>
          <div className="workspace-item"><span className="icon">▤</span>{!isCollapsed && <span>Westfield Square Proposal</span>}</div>
          <div className="workspace-item"><span className="icon">▧</span>{!isCollapsed && <span>Transit Hub Delivery</span>}</div>
          <div className="workspace-item"><span className="icon">▣</span>{!isCollapsed && <span>Northbank Masterplan</span>}</div>
        </div>
      </div>

      <div className="profile">
        <div className="avatar">AH</div>
        {!isCollapsed && (
          <div>
            <strong className="small">Amelia Hart</strong>
            <small>{currentRole === 'reviewer' ? 'Reviewer / Admin' : 'Strategy & Proposals'}</small>
          </div>
        )}
      </div>
    </aside>
  );
}

import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  AlertTriangle,
  Users,
  ScrollText,
  Settings,
} from 'lucide-react';

const PROJECTS = [
  { id: 'harbour-tower', name: 'Harbour Tower Extension', abbr: 'HT' },
  { id: 'facilities',    name: 'Facilities Management',   abbr: 'FM' },
  { id: 'enterprise',   name: 'Enterprise Operations',    abbr: 'EO' },
];

const SUB_ITEMS = [
  { id: 'projects',  label: 'Canvas',              Icon: LayoutDashboard },
  { id: 'sources',   label: 'Sources',             Icon: FolderOpen      },
  { id: 'decisions', label: 'Decisions',           Icon: CheckSquare     },
  { id: 'risks',     label: 'Risks',               Icon: AlertTriangle   },
  { id: 'people',    label: 'People & Orgs',       Icon: Users           },
  { id: 'audit',     label: 'Audit Trail',         Icon: ScrollText      },
  { id: 'settings',  label: 'Settings',            Icon: Settings        },
];

export interface SidebarProps {
  currentRole: string;
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({
  currentRole,
  activeWorkspaceId,
  setActiveWorkspaceId,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  return (
    <div className="rail-nav">
      <div className="brand">
        <div className="brand-mark">✦</div>
        <div className="brand-name">Angela</div>
      </div>

      <div className="nav-section-label">Projects</div>

      <nav className="project-nav">
        {PROJECTS.map(p => {
          const isActive = activeWorkspaceId === p.id;
          return (
            <div key={p.id} className="project-group">
              <div
                className={`project-row${isActive ? ' active' : ''}`}
                onClick={() => {
                  setActiveWorkspaceId(p.id);
                  if (!isActive) setActiveTab('projects');
                }}
              >
                <div className="project-avatar">{p.abbr}</div>
                <span className="project-name">{p.name}</span>
                <span className="project-chevron">
                  {isActive ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
              </div>

              {isActive && (
                <div className="project-children">
                  {SUB_ITEMS.map(({ id, label, Icon }) => (
                    <div
                      key={id}
                      className={`sub-item${activeTab === id ? ' active' : ''}`}
                      onClick={() => setActiveTab(id)}
                    >
                      <Icon size={13} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div className="profile">
        <div className="avatar">AH</div>
        <div>
          <strong className="small">Amelia Hart</strong>
          <small>{currentRole === 'admin' ? 'Reviewer / Admin' : 'Strategy & Proposals'}</small>
        </div>
      </div>
    </div>
  );
}

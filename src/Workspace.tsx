import React, { useState } from 'react';
import './Workspace.css';
import { PanelRight } from 'lucide-react';

import { Sidebar } from './components/workspace/Sidebar';
import { ProjectHeader } from './components/workspace/ProjectHeader';
import { CanvasArea } from './components/workspace/CanvasArea';
import { AdvisorPanel } from './components/workspace/AdvisorPanel';
import { StatusBar } from './components/workspace/StatusBar';
import { PlaceholderTab } from './components/workspace/PlaceholderTab';

export interface WorkspaceProps {
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  chatHistory: {role: 'user' | 'agent', text: string}[];
  handleChat: () => void;
  isListening: boolean;
  handleToggleListening: () => void;
  onExit: () => void;
  currentRole: string;
}

export default function Workspace({
  activeWorkspaceId,
  setActiveWorkspaceId,
  chatMessage,
  setChatMessage,
  chatHistory,
  handleChat,
  isListening,
  handleToggleListening,
  onExit,
  currentRole
}: WorkspaceProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(true);

  return (
    <div 
      className="workspace-root app" 
      style={{ 
        '--sidebar': isSidebarCollapsed ? '76px' : '240px',
        '--advisor': isAdvisorOpen ? '360px' : '0px'
      } as React.CSSProperties}
    >
      <Sidebar 
        currentRole={currentRole} 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <header className="topbar">
        <div className="workspace-switcher">
          {activeWorkspaceId === 'harbour-tower' ? 'Harbour Tower Extension' : activeWorkspaceId === 'facilities' ? 'Facilities Management' : activeWorkspaceId === 'enterprise' ? 'Enterprise Operations' : 'Project Workspace'}⌄
          <span className="pill">◎ Workspace</span>
        </div>
        <div className="top-actions">
          <div className="search">⌕ <span>Search</span><span style={{marginLeft: "auto"}}>≡</span></div>
          <button 
            onClick={() => setIsAdvisorOpen(!isAdvisorOpen)}
            style={{ display: 'grid', placeItems: 'center', width: '32px', height: '32px', borderRadius: '4px', background: isAdvisorOpen ? 'rgba(255,255,255,0.08)' : 'transparent', color: isAdvisorOpen ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', border: 'none' }}
            title="Toggle Advisor"
          >
            <PanelRight size={18} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="main">
        {activeTab === 'projects' ? (
          <>
            <ProjectHeader activeWorkspaceId={activeWorkspaceId} />
            <CanvasArea activeWorkspaceId={activeWorkspaceId} />
          </>
        ) : (
          <PlaceholderTab tabName={activeTab} />
        )}
      </main>
      
      {isAdvisorOpen && (
        <AdvisorPanel 
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          chatHistory={chatHistory}
          handleChat={handleChat}
          isListening={isListening}
          handleToggleListening={handleToggleListening}
          onClose={() => setIsAdvisorOpen(false)}
        />
      )}
      
      <StatusBar />
    </div>
  );
}

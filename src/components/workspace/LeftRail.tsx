import React from 'react';
import { Sidebar, SidebarProps } from './Sidebar';
import { AdvisorPanel, AdvisorPanelProps } from './AdvisorPanel';

type LeftRailProps = SidebarProps & Omit<AdvisorPanelProps, 'className'>;

export function LeftRail({
  currentRole,
  activeWorkspaceId,
  setActiveWorkspaceId,
  activeTab,
  setActiveTab,
  chatMessage,
  setChatMessage,
  chatHistory,
  handleChat,
  isListening,
  handleToggleListening,
  isAgentThinking,
}: LeftRailProps) {
  return (
    <aside className="left-rail">
      <Sidebar
        currentRole={currentRole}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <AdvisorPanel
        className="rail-chat"
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        chatHistory={chatHistory}
        handleChat={handleChat}
        isListening={isListening}
        handleToggleListening={handleToggleListening}
        isAgentThinking={isAgentThinking}
      />
    </aside>
  );
}

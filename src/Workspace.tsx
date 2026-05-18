import React, { useState, useEffect } from 'react';
import './Workspace.css';

import { LeftRail } from './components/workspace/LeftRail';
import { ProjectHeader } from './components/workspace/ProjectHeader';
import { CanvasArea } from './components/workspace/CanvasArea';
import { StatusBar } from './components/workspace/StatusBar';
import { PlaceholderTab } from './components/workspace/PlaceholderTab';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import type { User } from 'firebase/auth';

export interface WorkspaceProps {
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  onTokenChange?: (token: string | null) => void;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  chatHistory: {role: 'user' | 'agent', text: string, _id?: string}[];
  handleChat: () => void;
  isListening: boolean;
  handleToggleListening: () => void;
  onExit: () => void;
  currentRole: string;
  isAgentThinking?: boolean;
  canvasRefreshKey?: number;
}

export default function Workspace({
  activeWorkspaceId,
  setActiveWorkspaceId,
  onTokenChange,
  chatMessage,
  setChatMessage,
  chatHistory,
  handleChat,
  isListening,
  handleToggleListening,
  onExit,
  currentRole,
  isAgentThinking,
  canvasRefreshKey,
}: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState('projects');
  const [activeProjectView, setActiveProjectView] = useState('canvas');

  const [needsAuth, setNeedsAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        setUser(user);
        setToken(token);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onTokenChange?.(token);
  }, [token, onTokenChange]);

  useEffect(() => {
    setActiveProjectView('canvas');
  }, [activeWorkspaceId]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        const idToken = await result.user.getIdToken();
        setToken(idToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUser(null);
    setNeedsAuth(true);
  };

  return (
    <div className="workspace-root app">
      <LeftRail
        currentRole={currentRole}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        chatHistory={chatHistory}
        handleChat={handleChat}
        isListening={isListening}
        handleToggleListening={handleToggleListening}
        isAgentThinking={isAgentThinking}
      />

      <header className="topbar">
        <div className="workspace-switcher">
          {activeWorkspaceId === 'harbour-tower' ? 'Harbour Tower Extension' : activeWorkspaceId === 'facilities' ? 'Facilities Management' : activeWorkspaceId === 'enterprise' ? 'Enterprise Operations' : 'Project Workspace'}⌄
          <span className="pill">◎ Workspace</span>
        </div>
        <div className="top-actions">
          <div className="search">⌕ <span>Search</span><span style={{marginLeft: "auto"}}>≡</span></div>
          {!import.meta.env.VITE_DEMO_MODE && (needsAuth ? (
            <button
              className="gsi-material-button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              style={{ padding: '0 8px', height: '32px', display: 'flex', alignItems: 'center', background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer', borderRadius: 'var(--radius)' }}
            >
              Sign in with Google
            </button>
          ) : (
            <button
              onClick={handleLogout}
              style={{ padding: '0 12px', height: '32px', display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer', borderRadius: 'var(--radius)', fontSize: '12px' }}
            >
              Logout Google
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        {activeTab === 'projects' ? (
          <>
            <ProjectHeader
              activeWorkspaceId={activeWorkspaceId}
              activeView={activeProjectView}
              setActiveView={setActiveProjectView}
            />
            {activeProjectView === 'canvas' ? (
              <CanvasArea activeWorkspaceId={activeWorkspaceId} refreshKey={canvasRefreshKey} token={token} />
            ) : (
              <PlaceholderTab tabName={activeProjectView} />
            )}
          </>
        ) : (
          <PlaceholderTab tabName={activeTab} />
        )}
      </main>

      <StatusBar />
    </div>
  );
}

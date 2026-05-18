/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { HttpAgent } from '@ag-ui/client';
import HomePage from './HomePage.tsx';
import Workspace from './Workspace.tsx';
import AdminIngestionArea from './AdminIngestionArea.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace' | 'admin'>('landing');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('harbour-tower');
  const [token, setToken] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistories, setChatHistories] = useState<Record<string, {role: 'user' | 'agent', text: string, _id?: string}[]>>({});
  const chatHistory = chatHistories[activeWorkspaceId] ?? [];
  const setChatHistory = (updater: ((prev: {role: 'user' | 'agent', text: string, _id?: string}[]) => {role: 'user' | 'agent', text: string, _id?: string}[]) | {role: 'user' | 'agent', text: string, _id?: string}[], wsId = activeWorkspaceId) => {
    setChatHistories(prev => ({
      ...prev,
      [wsId]: typeof updater === 'function' ? updater(prev[wsId] ?? []) : updater,
    }));
  };
  const [isListening, setIsListening] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [canvasRefreshKey, setCanvasRefreshKey] = useState(0);

  const recognitionRef = useRef<any>(null);
  const textBeforeListenRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        if (final) {
          textBeforeListenRef.current = (textBeforeListenRef.current + ' ' + final).trim();
        }
        setChatMessage((textBeforeListenRef.current + ' ' + interim).trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      textBeforeListenRef.current = chatMessage;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Recognition start error', e);
      }
    }
  };

  const authHeaders = (): Record<string, string> => {
    if (token) return { 'Authorization': `Bearer ${token}` };
    return { 'x-demo-role': 'analyst' };
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const userText = chatMessage;
    const wsId = activeWorkspaceId;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user' as const, text: userText }], wsId);
    setIsAgentThinking(true);

    const agentMsgId = crypto.randomUUID();
    setChatHistory(prev => [...prev, { role: 'agent' as const, text: '', _id: agentMsgId }], wsId);

    const agent = new HttpAgent({
      url: '/api/chat',
      headers: authHeaders(),
      threadId: wsId,
      initialMessages: [{ role: 'user' as const, id: crypto.randomUUID(), content: userText }],
    });

    let accumulated = '';

    try {
      await agent.runAgent(
        { runId: agentMsgId, forwardedProps: { workspaceId: wsId } },
        {
          onEvent: ({ event }: { event: any }) => {
            if (event.type === 'TEXT_MESSAGE_CONTENT') {
              accumulated += event.delta ?? '';
              setChatHistory(prev =>
                prev.map(m => m._id === agentMsgId ? { ...m, text: accumulated } : m)
              , wsId);
            }
            if (event.type === 'RUN_ERROR') {
              const isSecurityBlock = event.message?.includes('Security violation');
              setChatHistory(prev =>
                prev.map(m =>
                  m._id === agentMsgId
                    ? { ...m, text: isSecurityBlock ? '__SECURITY_DENIED__' : `Error: ${event.message}` }
                    : m
                )
              , wsId);
            }
          },
        }
      );
    } catch (e) {
      console.error('Chat failed', e);
      setChatHistory(prev =>
        prev.map(m => m._id === agentMsgId ? { ...m, text: 'Connection error. Please try again.' } : m)
      , wsId);
    } finally {
      setIsAgentThinking(false);
    }
  };

  if (currentView === 'admin') {
    return (
      <AdminIngestionArea
        onExit={() => setCurrentView('landing')}
        onIngestComplete={() => setCanvasRefreshKey(k => k + 1)}
      />
    );
  }

  if (currentView === 'landing') {
    return <HomePage 
      onEnter={() => setCurrentView('workspace')} 
      onAdminEnter={() => setCurrentView('admin')} 
    />;
  }

  return (
    <Workspace
      activeWorkspaceId={activeWorkspaceId}
      setActiveWorkspaceId={setActiveWorkspaceId}
      onTokenChange={setToken}
      chatMessage={chatMessage}
      setChatMessage={setChatMessage}
      chatHistory={chatHistory}
      handleChat={handleChat}
      isListening={isListening}
      handleToggleListening={handleToggleListening}
      onExit={() => setCurrentView('landing')}
      currentRole="analyst"
      isAgentThinking={isAgentThinking}
      canvasRefreshKey={canvasRefreshKey}
    />
  );
}

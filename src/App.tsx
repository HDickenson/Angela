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
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'agent', text: string, _id?: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastDiagnosis, setLastDiagnosis] = useState<{ diagnosisId: string; hypothesis: string; confidence: number } | null>(null);
  const [draftContent, setDraftContent] = useState<any | null>(null);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  useEffect(() => {
    setLastDiagnosis(null);
  }, [activeWorkspaceId]);

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

  const handleDiagnose = async () => {
    if (!chatMessage.trim()) return;
    const query = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: `[Diagnose] ${query}` }]);
    setIsAgentThinking(true);

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ context: query, workspaceId: activeWorkspaceId })
      });
      const data = await res.json();
      if (!res.ok) {
        setChatHistory(prev => [...prev, { role: 'agent', text: `Diagnosis failed: ${data.error}` }]);
        return;
      }
      setLastDiagnosis({ diagnosisId: data.diagnosisId, hypothesis: data.hypothesis, confidence: data.confidence });
      const summary = `**Diagnosis:** ${data.hypothesis}\n**Confidence:** ${Math.round(data.confidence * 100)}%\n**Evidence cited:** ${(data.evidence_map || []).join(', ')}\n\n*Click "Generate Draft Report" to create a full report.*`;
      setChatHistory(prev => [...prev, { role: 'agent', text: summary }]);
    } catch (e) {
      console.error('Diagnose failed', e);
    } finally {
      setIsAgentThinking(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!lastDiagnosis) return;
    setIsDraftLoading(true);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ diagnosisId: lastDiagnosis.diagnosisId, workspaceId: activeWorkspaceId })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Draft generation failed: ${data.error}`);
        return;
      }
      if (data.error === 'insufficient_evidence_for_draft') {
        alert('Insufficient evidence to generate a draft. Add more evidence and run a diagnosis first.');
        return;
      }
      setDraftContent(data);
      setIsDraftOpen(true);
    } catch (e) {
      console.error('Draft failed', e);
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const userText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user' as const, text: userText }]);
    setIsAgentThinking(true);

    const agentMsgId = crypto.randomUUID();
    setChatHistory(prev => [...prev, { role: 'agent' as const, text: '', _id: agentMsgId }]);

    const agent = new HttpAgent({
      url: '/api/chat',
      headers: authHeaders(),
      threadId: activeWorkspaceId,
      initialMessages: [{ role: 'user' as const, id: crypto.randomUUID(), content: userText }],
    });

    let accumulated = '';

    try {
      await agent.runAgent(
        { runId: agentMsgId, forwardedProps: { workspaceId: activeWorkspaceId } },
        {
          onEvent: ({ event }: { event: any }) => {
            if (event.type === 'TEXT_MESSAGE_CONTENT') {
              accumulated += event.delta ?? '';
              setChatHistory(prev =>
                prev.map(m => m._id === agentMsgId ? { ...m, text: accumulated } : m)
              );
            }
            if (event.type === 'RUN_ERROR') {
              const isSecurityBlock = event.message?.includes('Security violation');
              setChatHistory(prev =>
                prev.map(m =>
                  m._id === agentMsgId
                    ? { ...m, text: isSecurityBlock ? '__SECURITY_DENIED__' : `Error: ${event.message}` }
                    : m
                )
              );
            }
          },
        }
      );
    } catch (e) {
      console.error('Chat failed', e);
      setChatHistory(prev =>
        prev.map(m => m._id === agentMsgId ? { ...m, text: 'Connection error. Please try again.' } : m)
      );
    } finally {
      setIsAgentThinking(false);
    }
  };

  if (currentView === 'admin') {
    return <AdminIngestionArea onExit={() => setCurrentView('landing')} />;
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
      handleDiagnose={handleDiagnose}
      handleGenerateDraft={handleGenerateDraft}
      lastDiagnosis={lastDiagnosis}
      isDraftLoading={isDraftLoading}
      isDraftOpen={isDraftOpen}
      setIsDraftOpen={setIsDraftOpen}
      draftContent={draftContent}
      isAgentThinking={isAgentThinking}
    />
  );
}

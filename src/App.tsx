/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import HomePage from './HomePage.tsx';
import Workspace from './Workspace.tsx';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('harbour-tower');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
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

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const newMsg = { role: 'user' as const, text: chatMessage };
    setChatHistory(prev => [...prev, newMsg]);
    const currentInput = chatMessage;
    setChatMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, role: 'triage_analyst', workspaceId: activeWorkspaceId })
      });
      const data = await res.json();
      if (res.status === 403) {
        setChatHistory(prev => prev.slice(0, -1)); // Remove the last user message if it failed security
        return;
      }
      setChatHistory(prev => [...prev, { role: 'agent', text: data.reply }]);
    } catch (e) {
      console.error('Chat failed', e);
    }
  };

  if (showLanding) {
    return <HomePage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <Workspace 
      activeWorkspaceId={activeWorkspaceId}
      setActiveWorkspaceId={setActiveWorkspaceId}
      chatMessage={chatMessage}
      setChatMessage={setChatMessage}
      chatHistory={chatHistory}
      handleChat={handleChat}
      isListening={isListening}
      handleToggleListening={handleToggleListening}
      onExit={() => setShowLanding(true)}
      currentRole="triage_analyst"
    />
  );
}

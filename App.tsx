
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { CHANNELS, PERSONAS } from './constants';
import { Session, Message, Role } from './types';
import { geminiService } from './services/geminiService';

const STORAGE_KEY_SESSIONS = 'ultrademic_sessions_v1';
const STORAGE_KEY_MESSAGES = 'ultrademic_messages_v1';

const App: React.FC = () => {
  // Initialize sessions from localStorage or constants
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (saved) return JSON.parse(saved);
    
    // Default static channels as starting sessions
    return CHANNELS.map(ch => ({
      id: ch.id,
      name: ch.name,
      personaId: ch.persona.id,
      lastUpdate: Date.now(),
      isStatic: true
    }));
  });

  // Initialize messages from localStorage
  const [messageHistory, setMessageHistory] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    return saved ? JSON.parse(saved) : {};
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const [isTyping, setIsTyping] = useState(false);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  // Sync messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messageHistory));
  }, [messageHistory]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const activeMessages = messageHistory[activeSessionId] || [];

  const handleCreateSession = (personaId: string) => {
    const persona = PERSONAS[personaId];
    const newId = `uplink-${Date.now()}`;
    const newSession: Session = {
      id: newId,
      name: `uplink_${newId.slice(-4)}`,
      personaId: personaId,
      lastUpdate: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);

    // Initial bot message for context
    const greeting: Message = {
      id: `greet-${newId}`,
      role: Role.MODEL,
      content: `[NEURAL LINK ESTABLISHED] Identity: ${persona.name}. Waiting for command input...`,
      timestamp: Date.now()
    };
    setMessageHistory(prev => ({
      ...prev,
      [newId]: [greeting]
    }));
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setMessageHistory(prev => {
      const { [sessionId]: _, ...rest } = prev;
      return rest;
    });
    geminiService.resetSession(sessionId);
    if (activeSessionId === sessionId) {
      setActiveSessionId(sessions[0].id);
    }
  };

  const handleNewMessage = (msg: Message) => {
    setMessageHistory(prev => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), msg]
    }));
  };

  const handleUpdateBotMessage = (id: string, content: string) => {
    setMessageHistory(prev => ({
      ...prev,
      [activeSessionId]: (prev[activeSessionId] || []).map(m => 
        m.id === id ? { ...m, content } : m
      )
    }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-[#00ffcc] font-roboto selection:bg-[#00ffcc]/30 selection:text-black">
      {/* Glitch Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#00ffcc 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />
      
      <main className="flex-1 flex flex-col relative z-10">
        <ChatInterface 
          session={activeSession} 
          messages={activeMessages}
          onNewMessage={handleNewMessage}
          onUpdateBotMessage={handleUpdateBotMessage}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
        />
        
        {/* Visual Decoration Elements */}
        <div className="absolute top-0 right-0 p-1 pointer-events-none opacity-20 z-20">
          <div className="w-12 h-1 bg-[#00ffcc]"></div>
          <div className="w-1 h-12 bg-[#00ffcc] ml-auto"></div>
        </div>
        <div className="absolute bottom-0 left-0 p-1 pointer-events-none opacity-20 z-20">
          <div className="w-1 h-12 bg-[#00ffcc]"></div>
          <div className="w-12 h-1 bg-[#00ffcc]"></div>
        </div>
      </main>

      {/* Connectivity Loading Line */}
      <div className="fixed top-0 left-64 right-0 h-0.5 bg-[#00ffcc]/10 z-50 overflow-hidden">
        <div className="h-full bg-[#00ffcc] w-24 shadow-[0_0_10px_#00ffcc] animate-[loading_6s_linear_infinite]"></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(800%); }
        }
      `}</style>
    </div>
  );
};

export default App;

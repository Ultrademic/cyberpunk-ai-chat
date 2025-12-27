import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import BootSequence from './components/BootSequence';
import LoginPrompt from './components/LoginPrompt';
import { CHANNELS, PERSONAS } from './constants';
import { Session, Message, Role } from './types';
import { geminiService } from './services/geminiService';

const STORAGE_KEY_SESSIONS = 'ultrademic_sessions_v1';
const STORAGE_KEY_MESSAGES = 'ultrademic_messages_v1';
const STORAGE_KEY_USER = 'ultrademic_user_v1';
const STORAGE_KEY_THEME = 'ultrademic_theme_v1';

type AppState = 'BOOTING' | 'LOGIN' | 'READY';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('BOOTING');
  
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (saved) return JSON.parse(saved);
    
    return CHANNELS.map(ch => ({
      id: ch.id,
      name: ch.name,
      personaId: ch.persona.id,
      lastUpdate: Date.now(),
      isStatic: true
    }));
  });

  const [messageHistory, setMessageHistory] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    return saved ? JSON.parse(saved) : {};
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_USER) || 'Netrunner_Local';
  });

  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) || '#00ffcc';
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messageHistory));
  }, [messageHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, themeColor);
    document.documentElement.style.setProperty('--primary', themeColor);
    const glow = themeColor.startsWith('#') ? `${themeColor}66` : themeColor;
    document.documentElement.style.setProperty('--primary-glow', glow);
  }, [themeColor]);

  useEffect(() => {
    if (appState === 'READY' && !activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [appState, activeSessionId, sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const activeMessages = activeSessionId ? (messageHistory[activeSessionId] || []) : [];

  const handleCreateSession = (personaId: string) => {
    const persona = PERSONAS[personaId];
    const newId = `uplink-${Date.now()}`;
    const newSession: Session = {
      id: newId,
      name: `Uplink_${newId.slice(-4)}`,
      personaId: personaId,
      lastUpdate: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);

    const greeting: Message = {
      id: `greet-${newId}`,
      role: Role.MODEL,
      content: `[NEURAL LINK ESTABLISHED] Identity: ${persona.name}. Buffer ready for command transmission. Proceed.`,
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
      const remaining = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, name: newName } : s));
  };

  const handleNewMessage = (msg: Message) => {
    if (!activeSessionId) return;
    setMessageHistory(prev => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), msg]
    }));
  };

  const handleUpdateBotMessage = (id: string, content: string, image?: string) => {
    if (!activeSessionId) return;
    setMessageHistory(prev => {
      const currentHistory = prev[activeSessionId] || [];
      const updatedHistory = currentHistory.map(m => {
        if (m.id === id) {
          return { ...m, content, ...(image ? { image } : {}) };
        }
        return m;
      });
      return { ...prev, [activeSessionId]: updatedHistory };
    });
  };

  const handleTriggerImageGen = async (prompt: string) => {
    if (!activeSessionId || !activeSession) return;
    
    const botMessageId = 'bot-img-' + Date.now();
    const botPlaceholder: Message = {
      id: botMessageId,
      role: Role.MODEL,
      content: `[SIDEBAR_REMOTE_SYNTHESIS]\nPROMPT: ${prompt.toUpperCase()}\nALLOCATING_CYCLES...`,
      timestamp: Date.now()
    };
    
    handleNewMessage(botPlaceholder);
    setIsTyping(true);

    const imageData = await geminiService.generateImage(prompt);
    
    if (imageData) {
      handleUpdateBotMessage(botMessageId, `[VISUAL_BUFFER_ESTABLISHED] Direct from Sidebar Console.\nBuffer decypted.`, imageData);
    } else {
      handleUpdateBotMessage(botMessageId, `[RENDER_ERROR]: SYNTHESIS_FAILED. System overload.`);
    }
    setIsTyping(false);
  };

  if (appState === 'BOOTING') {
    return <BootSequence onComplete={() => setAppState('LOGIN')} />;
  }

  if (appState === 'LOGIN') {
    return <LoginPrompt userName={userName} onLogin={(name) => {
      setUserName(name);
      setAppState('READY');
    }} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-[var(--primary)] font-roboto selection:bg-[var(--primary)] selection:text-black animate-in fade-in duration-1000">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId || ''}
        onSelectSession={setActiveSessionId}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onGenerateImage={handleTriggerImageGen}
        userName={userName}
        setUserName={setUserName}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        <div className="hidden sm:flex h-6 bg-[var(--primary)]/10 border-b border-[var(--primary)]/20 px-4 items-center justify-between text-[8px] uppercase font-mono tracking-widest">
           <div className="flex items-center space-x-4">
             <span>CPU_LOAD: 12%</span>
             <span>MEM_USAGE: 4.2GB</span>
             <span>NODE: SYD-0x9</span>
           </div>
           <div className="flex items-center space-x-4">
             <span className="animate-pulse text-green-500">LINK_STABLE</span>
             <span>{new Date().toLocaleDateString()}</span>
           </div>
        </div>

        <ChatInterface 
          session={activeSession} 
          messages={activeMessages}
          userName={userName}
          onNewMessage={handleNewMessage}
          onUpdateBotMessage={handleUpdateBotMessage}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="hidden xs:block absolute top-10 right-2 p-1 pointer-events-none opacity-20 z-20">
          <div className="w-8 h-0.5 bg-[var(--primary)] mb-1"></div>
          <div className="w-4 h-0.5 bg-[var(--primary)] ml-auto"></div>
        </div>
      </main>

      <div className="fixed top-0 left-0 md:left-72 right-0 h-0.5 bg-[var(--primary)]/5 z-50 overflow-hidden">
        <div className="h-full bg-[var(--primary)] w-32 shadow-[0_0_15px_var(--primary)] animate-[link_4s_ease-in-out_infinite]"></div>
      </div>
      
      <style>{`
        @keyframes link {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(800%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
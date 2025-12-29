
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
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
    return localStorage.getItem(STORAGE_KEY_THEME) || '#00ff00';
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const activeMessages = activeSessionId ? (messageHistory[activeSessionId] || []) : [];

  const handleExportVault = () => {
    const data = {
      userName,
      themeColor,
      sessions,
      messageHistory,
      exportTimestamp: Date.now(),
      version: '4.2.1'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural_identity_${userName}_${Date.now()}.cyber`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.sessions && data.messageHistory) {
          setSessions(data.sessions);
          setMessageHistory(data.messageHistory);
          setUserName(data.userName || userName);
          setThemeColor(data.themeColor || themeColor);
          alert("[SUCCESS]: NEURAL_VAULT_RESTORED. System re-initializing.");
        }
      } catch (err) {
        alert("[ERROR]: CORRUPT_PACKET. Restoration failed.");
      }
    };
    reader.readAsText(file);
  };

  const handleCreateSession = (personaId: string) => {
    const persona = PERSONAS[personaId];
    if (!persona) return;

    const newId = `uplink-${Date.now()}`;
    const newSession: Session = {
      id: newId,
      name: `Link_${persona.name}`,
      personaId: personaId,
      lastUpdate: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);

    const greeting: Message = {
      id: `greet-${newId}`,
      role: Role.MODEL,
      content: `[NEURAL_LINK_ESTABLISHED] ${persona.name} core online. Buffer ready.`,
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
      setActiveSessionId(null);
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
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      if (sessions.length > 0) {
        targetSessionId = sessions[0].id;
        setActiveSessionId(targetSessionId);
      } else {
        handleCreateSession('neuro-synapse');
        return;
      }
    }
    
    const botMessageId = 'bot-img-' + Date.now();
    const botPlaceholder: Message = {
      id: botMessageId,
      role: Role.MODEL,
      content: `[INITIATING_SYNTHESIS]\nPROMPT: ${prompt.toUpperCase()}\nPROCESSING...`,
      timestamp: Date.now()
    };
    
    setMessageHistory(prev => ({
      ...prev,
      [targetSessionId!]: [...(prev[targetSessionId!] || []), botPlaceholder]
    }));
    
    setIsTyping(true);
    const imageData = await geminiService.generateImage(prompt);
    
    if (imageData) {
      handleUpdateBotMessage(botMessageId, `[VISUAL_BUFFER_LOCKED] Stream decrypted.`, imageData);
    } else {
      handleUpdateBotMessage(botMessageId, `[RENDER_ERROR]: SYNTHESIS_FAILURE.`);
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
    <div className="flex h-screen w-screen overflow-hidden bg-black text-[#00ff00] font-mono selection:bg-[#00ff00] selection:text-black animate-in fade-in duration-1000">
      
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId}
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
        onExport={handleExportVault}
        onImport={handleImportVault}
      />
      
      <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        
        {/* MAIN VIEWPORT */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {activeSessionId ? (
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
          ) : (
            <Dashboard 
              onSelectSession={setActiveSessionId}
              onCreateSession={handleCreateSession}
              onOpenSettings={() => setIsSidebarOpen(true)}
            />
          )}
        </div>

        {/* BOTTOM TASKBAR */}
        <div className="h-10 bg-black border-t border-[#00ff00]/40 flex items-center justify-between px-2 z-50">
          <div className="flex items-center space-x-1 h-full">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-1.5 hover:bg-[#00ff00]/20 text-[#00ff00] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4M4 10h4M4 14h4M4 18h4M12 6h4M12 10h4M12 14h4M12 18h4M20 6h4M20 10h4M20 14h4M20 18h4" />
              </svg>
            </button>
            <div className="h-full w-px bg-[#00ff00]/20 mx-1"></div>
            {activeSession && (
              <div className="bg-[#00ff00]/10 border border-[#00ff00]/30 px-3 py-1 flex items-center space-x-2 animate-in slide-in-from-left-2">
                 <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[100px]">{activeSession.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 pr-2">
            <div className="flex items-center space-x-2 text-[#00ff00]/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.05 6.929a16 16 0 0122.9 0" strokeWidth="2" strokeLinecap="round"/></svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="text-right leading-none">
               <div className="text-[10px] font-black">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}</div>
               <div className="text-[7px] font-bold opacity-60">{currentTime.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { PERSONAS } from '../constants';
import { Session } from '../types';
import Logo from './Logo';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: (personaId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onGenerateImage: (prompt: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onGenerateImage,
  userName,
  setUserName,
  themeColor,
  setThemeColor,
  isOpen,
  onClose
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Image synthesis state
  const [imgPrompt, setImgPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleStartEdit = (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditValue(session.name);
  };

  const handleSaveEdit = () => {
    if (editingSessionId && editValue.trim()) {
      onRenameSession(editingSessionId, editValue.trim());
    }
    setEditingSessionId(null);
  };

  const handleImageGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrompt.trim()) return;
    setIsSynthesizing(true);
    onGenerateImage(imgPrompt.trim());
    setImgPrompt('');
    setTimeout(() => setIsSynthesizing(false), 2000);
  };

  const THEMES = [
    { name: 'Cyan', color: '#00ffcc' },
    { name: 'Pink', color: '#ff00ff' },
    { name: 'Amber', color: '#ffaa00' },
    { name: 'Matrix', color: '#33ff33' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-72 bg-[#050505] border-r border-[var(--primary)]/30 flex flex-col h-full z-[70] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b border-[var(--primary)]/30 flex items-center space-x-4">
          <Logo size="sm" />
          <div className="overflow-hidden">
            <h1 className="text-lg font-orbitron font-bold text-[var(--primary)] tracking-widest neon-text truncate">
              ULTRADEMIC
            </h1>
            <p className="text-[9px] text-[var(--primary)]/60 uppercase font-mono tracking-tighter">OS_SHELL v.42-N</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          <div className="relative">
            <button 
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="w-full py-3 px-4 border border-[var(--primary)]/50 bg-[var(--primary)]/5 hover:bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold rounded flex items-center justify-between transition-all group"
            >
              <span className="tracking-tighter uppercase">Initiate Uplink</span>
              <span className="text-lg">+</span>
            </button>
            
            {showPersonaMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-[var(--primary)]/50 p-2 z-[80] shadow-[0_10px_40px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[8px] text-[var(--primary)]/40 uppercase font-bold mb-2 px-1 tracking-widest">Select Persona</p>
                {Object.values(PERSONAS).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onCreateSession(p.id);
                      setShowPersonaMenu(false);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 text-[10px] text-[var(--primary)] hover:bg-[var(--primary)]/20 rounded mb-1 transition-colors flex items-center space-x-3 border border-transparent hover:border-[var(--primary)]/30"
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="uppercase font-bold">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-[10px] font-black text-[var(--primary)]/40 uppercase mb-4 px-2 flex items-center justify-between tracking-[0.2em]">
              <span>Active Links</span>
              <span className="text-[8px] opacity-40 font-mono">CH:{sessions.length}</span>
            </h2>
            <div className="space-y-1">
              {sessions.map((session) => {
                const persona = PERSONAS[session.personaId] || PERSONAS['neuro-synapse'];
                const isActive = activeSessionId === session.id;
                const isEditing = editingSessionId === session.id;

                return (
                  <div key={session.id} className="group relative">
                    <div
                      onClick={() => {
                        if (!isEditing) {
                          onSelectSession(session.id);
                          onClose();
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 flex flex-col border cursor-pointer ${
                        isActive
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
                          : 'bg-transparent border-transparent text-[var(--primary)]/40 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 w-full">
                          <span className={`text-[8px] font-mono ${isActive ? 'text-[var(--primary)]' : 'opacity-20'}`}>&gt;</span>
                          {isEditing ? (
                            <input
                              autoFocus
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              className="bg-black border border-[var(--primary)]/50 text-[var(--primary)] text-xs font-bold py-0.5 px-1 outline-none w-full uppercase"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="truncate font-bold tracking-tight text-xs uppercase block">{session.name}</span>
                          )}
                        </div>
                      </div>
                      {!isEditing && (
                        <div className="text-[7px] opacity-40 mt-1 flex justify-between uppercase font-mono tracking-widest">
                          <span>{persona.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleStartEdit(e, session)} className="p-1 hover:text-[var(--primary)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        {!session.isStatic && (
                          <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-1 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* NEURAL PRINT MODULE (Image Gen) */}
        <div className="px-4 py-6 border-t border-[var(--primary)]/20 bg-[var(--primary)]/5">
          <h2 className="text-[10px] font-black text-[var(--primary)]/60 uppercase mb-3 px-2 tracking-[0.2em] flex items-center">
             <span className="w-2 h-2 bg-[var(--primary)] mr-2 animate-pulse"></span>
             Neural_Print
          </h2>
          <form onSubmit={handleImageGen} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                placeholder="PROMPT_VISUAL..."
                className="w-full bg-black border border-[var(--primary)]/30 p-2 text-[9px] text-[var(--primary)] focus:border-[var(--primary)] outline-none font-mono uppercase"
                disabled={isSynthesizing}
              />
            </div>
            <button
              type="submit"
              disabled={isSynthesizing || !imgPrompt.trim()}
              className={`w-full py-1.5 border border-[var(--primary)]/40 text-[9px] font-bold uppercase tracking-widest transition-all ${isSynthesizing ? 'bg-[var(--primary)] text-black animate-pulse' : 'bg-transparent text-[var(--primary)]/80 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'}`}
            >
              {isSynthesizing ? 'SYNTHESIZING...' : 'GENERATE_ASCII'}
            </button>
          </form>
          <div className="mt-2 text-[7px] text-[var(--primary)]/30 font-mono uppercase tracking-tighter">
            * Visual output rendered in ASCII format
          </div>
        </div>

        <div className="mt-auto border-t border-[var(--primary)]/30 bg-black relative">
          {showSettings && (
            <div className="absolute bottom-full left-0 right-0 mb-0 p-4 bg-[#0a0a0a] border-t border-[var(--primary)]/50 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-[0_-10px_30px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest flex items-center space-x-2">
                   <div className="w-1.5 h-1.5 bg-[var(--primary)] animate-pulse"></div>
                   <span>Matrix Config</span>
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-[var(--primary)]/40 hover:text-[var(--primary)]">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] text-[var(--primary)]/60 uppercase mb-2 font-bold tracking-widest">User Handle</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-black border border-[var(--primary)]/30 p-2 text-[10px] text-[var(--primary)] focus:border-[var(--primary)] outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-[var(--primary)]/60 uppercase mb-2 font-bold tracking-widest">Phosphor Hue</label>
                  <div className="grid grid-cols-4 gap-2">
                    {THEMES.map(t => (
                      <button
                        key={t.name}
                        onClick={() => setThemeColor(t.color)}
                        className={`aspect-square rounded-sm border transition-all ${themeColor === t.color ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        style={{ backgroundColor: t.color + '11' }}
                      >
                        <div className="w-full h-full" style={{ backgroundColor: t.color }}></div>
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-[9px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
                >
                  Terminate Session
                </button>
              </div>
            </div>
          )}

          <div className="p-4 flex items-center justify-between group cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-sm border border-[var(--primary)]/40 overflow-hidden bg-black relative">
                <img src={`https://picsum.photos/seed/${userName}/100`} className="object-cover w-full h-full opacity-60 grayscale group-hover:opacity-100 transition-all" alt="User" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/20 to-transparent"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[var(--primary)] truncate uppercase tracking-tighter">{userName}</p>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(0,255,0,0.5)]"></div>
                  <p className="text-[8px] text-[var(--primary)]/50 uppercase font-mono tracking-widest">Jacked_In</p>
                </div>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[var(--primary)]/40 ${showSettings ? 'rotate-90' : ''} transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
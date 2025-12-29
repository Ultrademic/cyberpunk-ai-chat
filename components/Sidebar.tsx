
import React, { useState } from 'react';
import { PERSONAS } from '../constants';
import { Session } from '../types';
import Logo from './Logo';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
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
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onClose,
  onExport,
  onImport
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const THEMES = [
    { name: 'Matrix', color: '#00ff00' },
    { name: 'Cyan', color: '#00ffcc' },
    { name: 'Pink', color: '#ff00ff' },
    { name: 'Amber', color: '#ffaa00' }
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] md:hidden" onClick={onClose} />}

      <div className={`fixed inset-y-0 left-0 w-64 bg-[#080808] flex flex-col h-full z-[70] transition-transform duration-300 md:relative md:translate-x-0 border-r border-[var(--primary)]/10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* OS BRANDING */}
        <div className="p-4 border-b border-[var(--primary)]/20 bg-black/40">
           <div 
             className="flex items-center space-x-3 cursor-pointer group" 
             onClick={() => { onSelectSession(null); onClose(); }}
           >
              <div className="group-hover:scale-110 transition-transform">
                <Logo size="sm" />
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-orbitron font-bold tracking-[0.2em] text-[var(--primary)] neon-text">VIPER_OS</h1>
                <span className="text-[8px] opacity-30 uppercase font-mono">Kernel_v4.2</span>
              </div>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-hide">
          
          {/* SYSTEM NAVIGATION */}
          <div className="space-y-1">
            <h3 className="text-[9px] font-black uppercase opacity-20 px-3 mb-2 tracking-[0.3em]">System_Tasks</h3>
            <button 
              onClick={() => { onSelectSession(null); onClose(); }}
              className={`w-full py-2.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center space-x-3 transition-all ${!activeSessionId ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30' : 'hover:bg-white/5 opacity-50'}`}
            >
              <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
              <span>System Desktop</span>
            </button>
          </div>

          {/* NEURAL VAULT UTILITIES */}
          <div className="space-y-2 px-1">
            <h3 className="text-[9px] font-black uppercase opacity-20 px-3 mb-1 tracking-[0.3em]">Neural_Vault</h3>
            <div className="grid grid-cols-2 gap-1 px-1">
              <button 
                onClick={onExport}
                className="py-1.5 text-[8px] font-bold border border-[var(--primary)]/20 hover:bg-[var(--primary)]/10 text-[var(--primary)] uppercase tracking-widest"
              >
                Export
              </button>
              <label className="py-1.5 text-[8px] font-bold border border-[var(--primary)]/20 hover:bg-[var(--primary)]/10 text-[var(--primary)] uppercase tracking-widest text-center cursor-pointer">
                Import
                <input type="file" accept=".cyber" onChange={onImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* ACTIVE SESSIONS / TRACES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-[9px] font-black uppercase opacity-20 tracking-[0.3em]">Active_Uplinks</h3>
              <span className="text-[8px] font-mono opacity-20">{sessions.length}</span>
            </div>

            <div className="space-y-0.5 max-h-[40vh] overflow-y-auto scrollbar-hide px-1">
              {sessions.length === 0 ? (
                <div className="px-3 py-4 border border-dashed border-white/5 rounded-sm text-center">
                   <p className="text-[8px] opacity-20 uppercase tracking-widest">No active links...</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = activeSessionId === session.id;
                  const persona = PERSONAS[session.personaId];
                  return (
                    <div key={session.id} className="group relative">
                      <div
                        onClick={() => { onSelectSession(session.id); onClose(); }}
                        className={`px-3 py-2 transition-all flex items-center justify-between border-l-2 cursor-pointer ${isActive ? 'bg-[var(--primary)]/10 border-[var(--primary)]' : 'border-transparent opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: persona?.color || 'var(--primary)' }}></div>
                           <div className="overflow-hidden">
                              <div className="text-[9px] font-bold uppercase truncate w-32 tracking-wider">{session.name}</div>
                              <div className="text-[7px] opacity-30 uppercase font-mono truncate">{persona?.name || 'Unknown'}</div>
                           </div>
                        </div>
                        {!session.isStatic && (
                          <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* SETTINGS BAR */}
        <div className="mt-auto bg-black border-t border-[var(--primary)]/10">
          {showSettings && (
            <div className="p-4 bg-[#0a0a0a] border-t border-[var(--primary)]/30 shadow-2xl animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-[var(--primary)] tracking-widest">Config_Nexus</span>
                <button onClick={() => setShowSettings(false)} className="text-[var(--primary)]/40 hover:text-[var(--primary)] text-xs font-black">X</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[7px] uppercase opacity-40 block mb-1 font-black">Handle</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-black border border-[var(--primary)]/20 p-2 text-[10px] text-[var(--primary)] outline-none focus:border-[var(--primary)] uppercase font-mono" />
                </div>
                <div>
                  <label className="text-[7px] uppercase opacity-40 block mb-1 font-black">Color Space</label>
                  <div className="flex gap-2">
                    {THEMES.map(t => (
                      <button key={t.name} onClick={() => setThemeColor(t.color)} className={`flex-1 h-5 border transition-all ${themeColor === t.color ? 'border-[var(--primary)] scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: t.color }} title={t.name} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-[var(--primary)]/5 transition-colors" onClick={() => setShowSettings(!showSettings)}>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 border border-[var(--primary)]/30 bg-black relative p-0.5">
                <img src={`https://picsum.photos/seed/${userName}/100`} className="object-cover w-full h-full grayscale opacity-70 contrast-125" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/80 uppercase truncate w-24 tracking-widest">{userName}</p>
                <span className="text-[7px] opacity-30 uppercase font-mono">Status: Secure</span>
              </div>
            </div>
            <svg className={`w-3.5 h-3.5 text-[var(--primary)]/40 ${showSettings ? 'rotate-180' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2"/></svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

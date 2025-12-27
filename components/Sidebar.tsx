
import React from 'react';
import { CHANNELS, PERSONAS } from '../constants';
import { Session, Persona } from '../types';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: (personaId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onCreateSession,
  onDeleteSession 
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = React.useState(false);

  return (
    <div className="w-64 bg-black border-r border-[#00ffcc]/30 flex flex-col h-full z-40">
      <div className="p-6 border-b border-[#00ffcc]/30">
        <h1 className="text-xl font-orbitron font-bold text-[#00ffcc] tracking-widest neon-text-cyan">
          ULTRADEMIC
        </h1>
        <p className="text-[10px] text-[#00ffcc]/60 mt-1 uppercase">Neural Link Terminal v4.2.0</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* New Uplink Section */}
        <div className="relative">
          <button 
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="w-full py-2 px-4 border border-[#00ffcc]/50 bg-[#00ffcc]/10 hover:bg-[#00ffcc]/30 text-[#00ffcc] text-xs font-bold rounded flex items-center justify-between transition-all duration-300 group"
          >
            <span className="group-hover:neon-text-cyan">NEW NEURAL UPLINK</span>
            <span className="text-lg">+</span>
          </button>
          
          {showPersonaMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-[#00ffcc]/50 p-2 z-50 shadow-[0_0_20px_rgba(0,255,204,0.3)] animate-in fade-in zoom-in duration-200">
              <p className="text-[9px] text-[#00ffcc]/40 uppercase font-bold mb-2 px-1">Select Persona</p>
              {Object.values(PERSONAS).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onCreateSession(p.id);
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[10px] text-[#00ffcc] hover:bg-[#00ffcc]/20 rounded mb-1 transition-colors flex items-center space-x-2"
                >
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs font-bold text-[#00ffcc]/40 uppercase mb-3 px-2 flex items-center justify-between">
            <span>Neural Uplinks</span>
            <span className="text-[10px] bg-[#00ffcc]/10 px-1 rounded">{sessions.length}</span>
          </h2>
          <div className="space-y-1">
            {sessions.map((session) => {
              const persona = PERSONAS[session.personaId] || PERSONAS['neuro-synapse'];
              return (
                <div key={session.id} className="group relative">
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-all duration-200 flex flex-col ${
                      activeSessionId === session.id
                        ? 'bg-[#00ffcc]/20 text-[#00ffcc] border-l-2 border-[#00ffcc] shadow-[inset_0_0_10px_rgba(0,255,204,0.1)]'
                        : 'text-[#00ffcc]/60 hover:bg-[#00ffcc]/10 hover:text-[#00ffcc]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold opacity-50">0x</span>
                      <span className="truncate font-medium">{session.name}</span>
                    </div>
                    <div className="text-[8px] opacity-40 mt-0.5 flex justify-between uppercase">
                      <span>{persona.name}</span>
                    </div>
                  </button>
                  {!session.isStatic && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                      title="Terminate Link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#00ffcc]/10">
          <h2 className="text-xs font-bold text-[#00ffcc]/40 uppercase mb-2 px-2">System Diagnostics</h2>
          <div className="space-y-1 opacity-40 text-[9px] px-2 font-mono">
            <div className="flex justify-between"><span>Core:</span> <span className="text-[#00ffcc]">STABLE</span></div>
            <div className="flex justify-between"><span>Uptime:</span> <span>104:12:09</span></div>
            <div className="flex justify-between"><span>Memory:</span> <span>64.2 TB</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#00ffcc]/30 bg-[#00ffcc]/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-[#00ffcc]/20 border border-[#00ffcc]/40 flex items-center justify-center relative overflow-hidden">
            <img src="https://picsum.photos/seed/user/100" className="object-cover w-full h-full opacity-80" alt="User" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#00ffcc] truncate uppercase tracking-tighter">Netrunner_Local</p>
            <p className="text-[10px] text-[#00ffcc]/50 truncate">PERSISTENCE: ON</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


import React from 'react';

interface DashboardProps {
  onSelectSession: (id: string | null) => void;
  onCreateSession: (personaId: string) => void;
  onOpenSettings?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateSession, onOpenSettings }) => {
  const icons = [
    { id: 'terminal', label: 'TERMINAL', persona: 'glitch-zero' },
    { id: 'explorer', label: 'EXPLORER', persona: 'neuro-synapse' },
    { id: 'cutscene', label: 'CUTSCENE', persona: 'ghost-shell' },
    { id: 'settings', label: 'SETTINGS', action: onOpenSettings },
  ];

  return (
    <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden select-none cursor-default">
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1010] via-[#0a0a0a] to-[#0a1a20] opacity-50"></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* Vertical Icon Grid */}
      <div className="relative z-10 p-10 flex flex-col items-start space-y-12 h-full">
        {icons.map((item) => (
          <div 
            key={item.id}
            onClick={() => item.action ? item.action() : onCreateSession(item.persona!)}
            className="flex flex-col items-center group cursor-pointer w-24"
          >
            <div className="w-16 h-16 mb-2 flex items-center justify-center border-2 border-transparent group-hover:border-[#00ff00]/40 group-hover:bg-[#00ff00]/5 transition-all duration-200">
               {item.id === 'terminal' ? (
                 <span className="text-3xl font-black text-[#00ff00] group-hover:scale-110 transition-transform tracking-tighter">&gt;_</span>
               ) : item.id === 'explorer' ? (
                 <svg className="w-10 h-10 text-[#00ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
               ) : item.id === 'cutscene' ? (
                 <svg className="w-10 h-10 text-[#00ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
               ) : (
                 <svg className="w-10 h-10 text-[#00ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               )}
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] text-[#00ff00] bg-black/40 px-1 py-0.5 border-x border-[#00ff00]/20 whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        .viper-glow {
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

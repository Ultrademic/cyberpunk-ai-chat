import React, { useState } from 'react';

const ASCII_TITLE = `
   __  ____   ________________  ____  ________  __________
  / / / / /  /_  __/ __  / __ \\/ __ \\/ ____/  |/  /  _/ ____/
 / / / / /    / / / /_/ / /_/ / / / / __/ / /|_/ // // /     
/ /_/ / /___ / / / _, _/ _, _/ /_/ / /___/ /  / // // /___   
\\____/_____//_/ /_/ |_/_/ |_/_____/_____/_/  /_/___/\\____/   
`;

interface LoginPromptProps {
  userName: string;
  onLogin: (name: string) => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ userName, onLogin }) => {
  const [input, setInput] = useState(userName);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsAuthorizing(true);
      setTimeout(() => onLogin(input.trim()), 1500);
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center p-6 text-[var(--primary)]">
      <pre className="text-[6px] sm:text-[10px] leading-tight mb-8 text-[var(--primary)] neon-text opacity-80 select-none animate-pulse">
        {ASCII_TITLE}
      </pre>

      <div className="w-full max-w-sm border border-[var(--primary)]/30 p-8 bg-[var(--primary)]/5 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--primary)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--primary)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--primary)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--primary)]"></div>

        <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-6 text-center">Identity Verification</h2>
        
        {!isAuthorizing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[8px] uppercase tracking-widest mb-2 opacity-60">Neural ID / Netrunner Handle</label>
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-black border border-[var(--primary)]/50 p-3 text-xs outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all uppercase font-mono"
                placeholder="ENTER_ID..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[var(--primary)] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              Initialize Uplink
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4 animate-pulse">
            <div className="text-xs font-bold uppercase tracking-widest">Authorizing {input}...</div>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-[8px] opacity-40 uppercase tracking-widest font-mono text-center max-w-xs">
        System monitoring in effect. Encrypted packets processed via node 0x7F2.
      </div>
    </div>
  );
};

export default LoginPrompt;
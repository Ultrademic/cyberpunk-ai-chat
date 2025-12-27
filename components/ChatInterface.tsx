
import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, Session } from '../types';
import { geminiService } from '../services/geminiService';
import { PERSONAS } from '../constants';
import Logo from './Logo';
import AsciiImage from './AsciiImage';

interface ChatInterfaceProps {
  session: Session | null;
  messages: Message[];
  userName: string;
  onNewMessage: (msg: Message) => void;
  onUpdateBotMessage: (id: string, content: string, image?: string) => void;
  isTyping: boolean;
  setIsTyping: (val: boolean) => void;
  onMenuToggle: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, 
  messages, 
  userName,
  onNewMessage, 
  onUpdateBotMessage,
  isTyping,
  setIsTyping,
  onMenuToggle
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const persona = session ? (PERSONAS[session.personaId] || PERSONAS['neuro-synapse']) : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !session || !persona) return;

    const trimmedInput = input.trim();
    const isRenderCommand = trimmedInput.startsWith('/render ') || trimmedInput.startsWith('/imagine ');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: trimmedInput,
      timestamp: Date.now()
    };

    onNewMessage(userMessage);
    setInput('');
    setIsTyping(true);

    if (isRenderCommand) {
      const prompt = trimmedInput.replace(/^\/(render|imagine)\s+/, '');
      
      const botMessageId = 'bot-' + Date.now();
      const botPlaceholder: Message = {
        id: botMessageId,
        role: Role.MODEL,
        content: `[INITIATING_VISUAL_SYNTHESIS]\nPROMPT: ${prompt.toUpperCase()}\nALLOCATING_GPU_CYCLES...`,
        timestamp: Date.now()
      };
      onNewMessage(botPlaceholder);

      const imageData = await geminiService.generateImage(prompt);
      
      if (imageData) {
        onUpdateBotMessage(
          botMessageId, 
          `[VISUAL_BUFFER_ESTABLISHED] Source: Neural_Engine_v2.5\nDeciphering stream...`,
          imageData
        );
      } else {
        onUpdateBotMessage(botMessageId, `[RENDER_ERROR]: SYNTHESIS_FAILED. Neural link timed out.`);
      }
    } else {
      const botMessageId = 'bot-' + Date.now();
      const botPlaceholder: Message = {
        id: botMessageId,
        role: Role.MODEL,
        content: '',
        timestamp: Date.now()
      };
      onNewMessage(botPlaceholder);

      let fullResponse = '';
      const stream = geminiService.sendMessageStream(session.id, persona, trimmedInput, messages);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        onUpdateBotMessage(botMessageId, fullResponse);
      }
    }

    setIsTyping(false);
  };

  if (!session || !persona) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] p-6 text-center relative overflow-hidden">
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-[var(--primary)]/20 flex items-center px-4 bg-black/80 backdrop-blur-md z-30">
          <button onClick={onMenuToggle} className="p-2 text-[var(--primary)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        <Logo size="lg" />
        <div className="max-w-md mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
          <h2 className="text-xl font-orbitron font-bold text-[var(--primary)] tracking-[0.3em] uppercase mb-4 neon-text">
            Ultrademic Nexus
          </h2>
          <div className="space-y-2 font-mono text-[10px] text-[var(--primary)]/40 uppercase tracking-widest">
            <p className="animate-pulse">&gt; Welcome back, {userName}</p>
            <p>&gt; Initializing neural core protocols...</p>
            <p>&gt; Connection status: Awaiting user uplink</p>
            <p>&gt; Select an active channel or initiate new link to begin</p>
            <p className="mt-4 text-[8px] opacity-20 italic">Try /render followed by a prompt to generate imagery</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative">
      <div className="h-14 border-b border-[var(--primary)]/20 flex items-center justify-between px-4 md:px-6 bg-black/50 backdrop-blur-md z-30">
        <div className="flex items-center space-x-3">
          <button onClick={onMenuToggle} className="md:hidden p-2 -ml-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <span className="text-[var(--primary)] font-bold hidden xs:inline">#</span>
          <h2 className="font-orbitron text-[var(--primary)] font-bold tracking-tight uppercase text-sm md:text-base truncate max-w-[120px] xs:max-w-[200px]">
            {session.name}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_5px_var(--primary)]"></div>
             <span className="text-[9px] text-[var(--primary)]/60 uppercase font-mono hidden sm:inline">Uplink Stable</span>
           </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth pb-24 md:pb-6">
        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] md:max-w-[80%] flex ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <div className={`flex-shrink-0 ${msg.role === Role.USER ? 'ml-2 md:ml-3' : 'mr-2 md:mr-3'}`}>
                <div 
                  className="w-7 h-7 md:w-8 md:h-8 rounded border p-0.5" 
                  style={{ 
                    borderColor: msg.role === Role.USER ? 'var(--primary)' : persona.color,
                    boxShadow: `0 0 5px ${msg.role === Role.USER ? 'var(--primary)' : persona.color}`
                  }}
                >
                   <img 
                    src={msg.role === Role.USER ? `https://picsum.photos/seed/${userName}/100` : persona.avatar} 
                    className="w-full h-full object-cover grayscale opacity-70 contrast-125"
                    alt=""
                   />
                </div>
              </div>

              <div className={msg.role === Role.USER ? 'text-right' : 'text-left'}>
                <div className={`flex items-baseline space-x-2 mb-1 ${msg.role === Role.USER ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <span className={`text-[9px] font-bold uppercase tracking-widest`} style={{ color: msg.role === Role.USER ? 'var(--primary)' : persona.color }}>
                    {msg.role === Role.USER ? userName : persona.name}
                  </span>
                  <span className="text-[7px] text-[var(--primary)]/30 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg text-xs md:text-sm leading-relaxed ${msg.role === Role.USER ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-white shadow-[inset_0_0_10px_rgba(0,255,204,0.1)]' : 'bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-[var(--primary)]/90 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]'}`}
                  style={{ borderColor: msg.role === Role.USER ? 'var(--primary-glow)' : `${persona.color}44` }}>
                  
                  <div className="whitespace-pre-wrap font-sans break-words overflow-hidden mb-1">
                    {msg.content || (isTyping && i === messages.length - 1 ? 'DECIPHERING...' : '')}
                  </div>

                  {msg.image && (
                    <div className="mt-4 border-t border-[var(--primary)]/10 pt-4 max-w-full">
                      <AsciiImage src={msg.image} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="animate-pulse text-[9px] text-[var(--primary)]/40 font-bold uppercase tracking-[0.2em] ml-11 flex items-center space-x-2">
               <div className="w-1 h-1 bg-[var(--primary)]/40 rounded-full animate-bounce"></div>
               <span>Data Stream incoming...</span>
             </div>
           </div>
        )}
      </div>

      <div className="p-3 md:p-6 bg-black/40 border-t border-[var(--primary)]/20 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="relative max-w-5xl mx-auto">
          <div className="absolute -top-5 left-1 text-[7px] font-bold text-[var(--primary)]/30 uppercase flex space-x-4 tracking-tighter">
             <span>Buffer: {input.length}b</span>
             <span className="hidden xs:inline">Target: {persona.name}</span>
             <span className="opacity-60 font-mono">CYBER_COMMANDS: /render, /imagine</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={`Neural command...`}
            className="w-full bg-[#111] border border-[var(--primary)]/30 rounded-lg py-3 md:py-4 px-4 md:px-6 pr-14 text-[var(--primary)] placeholder-[var(--primary)]/20 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-[inset_0_0_15px_rgba(0,255,204,0.05)] font-mono text-sm"
          />
          <button type="submit" disabled={isTyping || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 disabled:opacity-10 text-[var(--primary)] rounded-md border border-[var(--primary)]/40 flex items-center justify-center transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-active:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

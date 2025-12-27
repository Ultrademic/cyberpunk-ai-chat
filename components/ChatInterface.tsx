
import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, Session, Persona } from '../types';
import { geminiService } from '../services/geminiService';
import { PERSONAS } from '../constants';

interface ChatInterfaceProps {
  session: Session;
  messages: Message[];
  onNewMessage: (msg: Message) => void;
  onUpdateBotMessage: (id: string, content: string) => void;
  isTyping: boolean;
  setIsTyping: (val: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, 
  messages, 
  onNewMessage, 
  onUpdateBotMessage,
  isTyping,
  setIsTyping
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const persona = PERSONAS[session.personaId] || PERSONAS['neuro-synapse'];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: input,
      timestamp: Date.now()
    };

    onNewMessage(userMessage);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const botMessageId = 'bot-' + Date.now();
    const botPlaceholder: Message = {
      id: botMessageId,
      role: Role.MODEL,
      content: '',
      timestamp: Date.now()
    };
    onNewMessage(botPlaceholder);

    let fullResponse = '';
    // Pass current history to the service for context
    const stream = geminiService.sendMessageStream(session.id, persona, currentInput, messages);
    
    for await (const chunk of stream) {
      fullResponse += chunk;
      onUpdateBotMessage(botMessageId, fullResponse);
    }

    setIsTyping(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative">
      {/* Header Bar */}
      <div className="h-14 border-b border-[#00ffcc]/20 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-[#00ffcc] font-bold">#</span>
          <h2 className="font-orbitron text-[#00ffcc] font-bold tracking-tight uppercase">{session.name}</h2>
          <span className="text-xs text-[#00ffcc]/40 hidden md:inline-block">|</span>
          <p className="text-xs text-[#00ffcc]/60 truncate hidden md:inline-block max-w-sm">Neural link established with {persona.name}</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse"></div>
             <span className="text-[10px] text-[#00ffcc]/60 uppercase tracking-tighter">Connection Active</span>
           </div>
        </div>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
            <div className="text-6xl mb-4">⚡</div>
            <p className="font-orbitron text-sm tracking-[0.5em] text-center uppercase">Awaiting Transmission...</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[80%] flex ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <div className={`flex-shrink-0 ${msg.role === Role.USER ? 'ml-3' : 'mr-3'}`}>
                <div 
                  className="w-8 h-8 rounded border p-0.5" 
                  style={{ 
                    borderColor: msg.role === Role.USER ? '#ff00ff' : persona.color,
                    boxShadow: `0 0 5px ${msg.role === Role.USER ? '#ff00ff' : persona.color}`
                  }}
                >
                   <img 
                    src={msg.role === Role.USER ? 'https://picsum.photos/seed/u1/100' : persona.avatar} 
                    className="w-full h-full object-cover grayscale opacity-70 contrast-125"
                    alt="avatar"
                   />
                </div>
              </div>

              <div className={msg.role === Role.USER ? 'text-right' : 'text-left'}>
                <div className={`flex items-baseline space-x-2 mb-1 ${msg.role === Role.USER ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <span 
                    className={`text-[10px] font-bold uppercase tracking-widest`} 
                    style={{ color: msg.role === Role.USER ? '#ff00ff' : persona.color }}
                  >
                    {msg.role === Role.USER ? 'NETRUNNER_LOCAL' : persona.name}
                  </span>
                  <span className="text-[8px] text-[#00ffcc]/30">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div 
                  className={`p-3 rounded-lg text-sm leading-relaxed ${
                    msg.role === Role.USER 
                      ? 'bg-pink-500/10 border border-pink-500/30 text-pink-50' 
                      : 'bg-[#00ffcc]/5 border border-[#00ffcc]/20 text-[#00ffcc]/90'
                  }`}
                  style={{ 
                    borderColor: msg.role === Role.USER ? '#ff00ff44' : `${persona.color}44`,
                    boxShadow: msg.role === Role.USER ? 'inset 0 0 10px #ff00ff11' : `inset 0 0 10px ${persona.color}11`
                  }}
                >
                  <div className="whitespace-pre-wrap font-sans break-words">
                    {msg.content || (isTyping && i === messages.length - 1 ? 'DECIPHERING...' : '')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="animate-pulse text-[10px] text-[#00ffcc]/40 font-bold uppercase tracking-[0.2em]">
               Neural Pulse Transmitting...
             </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-black/40 border-t border-[#00ffcc]/20 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="absolute -top-6 left-2 text-[8px] font-bold text-[#00ffcc]/30 uppercase flex space-x-4">
             <span>Buffer: {input.length} bytes</span>
             <span>Status: Ready</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={`Neural link bypass for #${session.name}...`}
            className="w-full bg-[#111] border border-[#00ffcc]/30 rounded py-4 px-6 pr-16 text-[#00ffcc] placeholder-[#00ffcc]/30 focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc] transition-all shadow-[inset_0_0_15px_rgba(0,255,204,0.05)] font-mono"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00ffcc]/10 hover:bg-[#00ffcc]/30 disabled:opacity-20 text-[#00ffcc] rounded border border-[#00ffcc]/50 flex items-center justify-center transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

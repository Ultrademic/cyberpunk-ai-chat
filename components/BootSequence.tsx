import React, { useState, useEffect } from 'react';

const BOOT_LOGS = [
  "ULTRADEMIC BIOS v4.2.1-RELEASE",
  "CORE(TM) NEURAL PROCESSOR 1024-GHZ INITIALIZED",
  "MEMORY TEST: 16TB OK",
  "DETECTING NETWORK PROTOCOLS...",
  "TCP/IP V6 STACK: ESTABLISHED",
  "MOUNTING /DEV/NEURAL_CORE...",
  "SYSTEM INTEGRITY CHECK: 99.98% OK",
  "WARNING: BUFFER OVERFLOW IN ETH0 - RECTIFIED",
  "LOADING AI HEURISTICS...",
  "ESTABLISHING SECURE TUNNEL TO GEMINI_NODE...",
  "ENCRYPTION: RSA-8192 ACTIVE",
  "UPLINK STABLE. WELCOME TO THE NEXUS.",
];

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < BOOT_LOGS.length) {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, BOOT_LOGS[index]]);
        setIndex(prev => prev + 1);
      }, Math.random() * 200 + 50);
      return () => clearTimeout(timeout);
    } else {
      const finalTimeout = setTimeout(onComplete, 1000);
      return () => clearTimeout(finalTimeout);
    }
  }, [index, onComplete]);

  return (
    <div className="w-full h-full bg-black p-8 font-mono text-[10px] sm:text-xs text-[var(--primary)] flex flex-col justify-start overflow-hidden">
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="flex space-x-2">
            <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
            <span className={i === BOOT_LOGS.length - 1 ? "neon-text font-bold" : ""}>{log}</span>
          </div>
        ))}
        {index < BOOT_LOGS.length && (
          <div className="flex space-x-2">
            <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
            <span className="typing-cursor">_</span>
          </div>
        )}
      </div>
      
      <div className="mt-auto opacity-20 text-[8px] uppercase tracking-widest text-center py-4">
        Property of Ultrademic Corp // Violators will be traced and purged
      </div>
    </div>
  );
};

export default BootSequence;
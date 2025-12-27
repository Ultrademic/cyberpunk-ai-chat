import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => {
  const isLarge = size === 'lg';
  const dimension = isLarge ? "240" : "40";

  return (
    <div className={`relative flex items-center justify-center ${isLarge ? 'p-12' : 'p-2'}`}>
      <svg width={dimension} height={dimension} viewBox="0 0 200 200" className="drop-shadow-[0_0_15px_var(--primary-glow)]">
        {/* Outer Ring */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--primary)" strokeWidth="1" strokeDasharray="20 10" className="animate-[spin_10s_linear_infinite]" opacity="0.3" />
        
        {/* Middle Ring */}
        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="5 15" className="animate-[spin_6s_linear_infinite_reverse]" opacity="0.5" />
        
        {/* Inner Tech Ring */}
        <path d="M100 40 L100 60 M140 100 L160 100 M100 140 L100 160 M40 100 L60 100" stroke="var(--primary)" strokeWidth="2" opacity="0.8" />
        
        {/* Central Hexagon Chip */}
        <path 
          d="M100 70 L126 85 L126 115 L100 130 L74 115 L74 85 Z" 
          fill="var(--primary)" 
          fillOpacity="0.1"
          stroke="var(--primary)" 
          strokeWidth="3"
          className="animate-pulse"
        />
        
        {/* Neural Pathways */}
        <g stroke="var(--primary)" strokeWidth="1" opacity="0.4">
          <path d="M100 80 L100 120" />
          <path d="M85 100 L115 100" />
          <circle cx="100" cy="100" r="5" fill="var(--primary)" />
        </g>

        {/* Binary Bits (Decorative) */}
        {isLarge && (
          <g fontSize="6" fill="var(--primary)" opacity="0.6" className="font-mono">
            <text x="95" y="30">01</text>
            <text x="165" y="105">10</text>
            <text x="95" y="180">11</text>
            <text x="25" y="105">00</text>
          </g>
        )}
      </svg>
      
      {/* Glitch Overlay for large version */}
      {isLarge && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full border border-[var(--primary)]/10 rounded-full animate-ping opacity-10"></div>
        </div>
      )}
    </div>
  );
};

export default Logo;
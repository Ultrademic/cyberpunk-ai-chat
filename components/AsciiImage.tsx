
import React, { useEffect, useState, useRef } from 'react';

interface AsciiImageProps {
  src: string;
  width?: number;
}

type RenderMode = 'ASCII' | 'RAW';

const AsciiImage: React.FC<AsciiImageProps> = ({ src, width = 80 }) => {
  const [ascii, setAscii] = useState<string>('INITIATING_DECODER...');
  const [mode, setMode] = useState<RenderMode>('ASCII');
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Calculate height maintaining aspect ratio
      const height = Math.floor((img.height / img.width) * width * 0.5);
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;

      // Character ramp for DARK MODE (Bright text on dark background)
      // We want dense characters for bright pixels
      const chars = " .:-=+*#%@".split(""); 
      let result = "";

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
          const r = imageData[offset];
          const g = imageData[offset + 1];
          const b = imageData[offset + 2];
          
          // Perceived brightness
          const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          
          // Map brightness to character index
          const charIndex = Math.floor(brightness * (chars.length - 1));
          result += chars[charIndex];
        }
        result += "\n";
      }
      setAscii(result);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setAscii('DECODER_ERROR: CORRUPT_BUFFER');
    };

    img.src = src;
  }, [src, width]);

  return (
    <div className="relative group border border-[var(--primary)]/20 bg-black/60 p-1 rounded overflow-hidden">
      {/* Header / Mode Switcher */}
      <div className="flex items-center justify-between mb-1 px-1 py-0.5 border-b border-[var(--primary)]/10">
        <span className="text-[7px] font-mono font-bold text-[var(--primary)]/50 tracking-widest uppercase">
          Neural_Visual_Buffer_{mode}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={() => setMode('ASCII')}
            className={`text-[7px] px-1.5 py-0.5 border uppercase font-bold transition-all ${mode === 'ASCII' ? 'bg-[var(--primary)] text-black border-[var(--primary)]' : 'text-[var(--primary)]/40 border-[var(--primary)]/20 hover:text-[var(--primary)]'}`}
          >
            Ascii
          </button>
          <button 
            onClick={() => setMode('RAW')}
            className={`text-[7px] px-1.5 py-0.5 border uppercase font-bold transition-all ${mode === 'RAW' ? 'bg-[var(--primary)] text-black border-[var(--primary)]' : 'text-[var(--primary)]/40 border-[var(--primary)]/20 hover:text-[var(--primary)]'}`}
          >
            Raw
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[100px] flex items-center justify-center">
        <canvas ref={canvasRef} className="hidden" />
        
        {mode === 'ASCII' ? (
          <pre className="text-[7px] leading-[6px] sm:text-[8px] sm:leading-[7px] font-mono text-[var(--primary)] bg-black/20 p-2 overflow-x-auto whitespace-pre select-none w-full text-center">
            {ascii}
          </pre>
        ) : (
          <div className="relative w-full aspect-square sm:aspect-video flex items-center justify-center bg-[#050505]">
            <img 
              src={src} 
              alt="Neural Scan" 
              className="max-w-full max-h-full object-contain grayscale contrast-125 opacity-80"
            />
            {/* Cyberpunk Scan Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[var(--primary)]/10 to-transparent opacity-20 animate-[scan_3s_linear_infinite]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] opacity-60"></div>
            </div>
          </div>
        )}

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-[9px] font-mono text-[var(--primary)] animate-pulse tracking-widest uppercase">
              Decoding_Stream...
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
};

export default AsciiImage;

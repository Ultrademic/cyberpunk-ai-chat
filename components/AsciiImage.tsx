import React, { useEffect, useState, useRef } from 'react';

interface AsciiImageProps {
  src: string;
  width?: number;
}

type RenderMode = 'ASCII' | 'RAW';

const AsciiImage: React.FC<AsciiImageProps> = ({ src, width = 72 }) => {
  const [ascii, setAscii] = useState<string>('INITIATING_DECODER...');
  const [mode, setMode] = useState<RenderMode>('ASCII');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = "Anonymous";
    }
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Adjust density based on screen
      const targetWidth = window.innerWidth < 640 ? 48 : width;
      const height = Math.floor((img.height / img.width) * targetWidth * 0.48); // Ratio adj for terminal font
      
      canvas.width = targetWidth;
      canvas.height = height;

      // Apply contrast/brightness boost for better ASCII extraction
      ctx.filter = 'brightness(1.1) contrast(1.4) grayscale(1)';
      ctx.drawImage(img, 0, 0, targetWidth, height);
      const imageData = ctx.getImageData(0, 0, targetWidth, height).data;

      // Character ramp for BRIGHT text on DARK background
      // Using denser characters for brighter areas
      const chars = " .':,;clodxkO0KXNWM@".split(""); 
      let result = "";

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const offset = (y * targetWidth + x) * 4;
          const r = imageData[offset];
          const g = imageData[offset + 1];
          const b = imageData[offset + 2];
          
          const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const charIndex = Math.floor(brightness * (chars.length - 1));
          result += chars[charIndex];
        }
        result += "\n";
      }
      setAscii(result);
      setIsLoaded(true);
      setError(null);
    };

    img.onerror = () => {
      setError('DECODER_ERROR: BUFFER_CORRUPT');
      setIsLoaded(true);
    };

    img.src = src;
  }, [src, width]);

  return (
    <div className="relative border-l-2 border-[var(--primary)]/40 bg-black/40 p-2 my-2 overflow-hidden group">
      <div className="flex items-center justify-between mb-2 text-[8px] font-mono font-bold uppercase tracking-widest text-[var(--primary)]/60">
        <div className="flex items-center">
          <span className="mr-2">SCAN_NODE: {mode}</span>
          <div className="w-1 h-1 bg-[var(--primary)] animate-ping"></div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setMode('ASCII')}
            className={`hover:text-[var(--primary)] transition-colors ${mode === 'ASCII' ? 'text-[var(--primary)] underline underline-offset-4' : 'opacity-40'}`}
          >
            Terminal
          </button>
          <button 
            onClick={() => setMode('RAW')}
            className={`hover:text-[var(--primary)] transition-colors ${mode === 'RAW' ? 'text-[var(--primary)] underline underline-offset-4' : 'opacity-40'}`}
          >
            Visual
          </button>
        </div>
      </div>

      <div className="relative min-h-[100px] flex items-center justify-center bg-black/60 border border-[var(--primary)]/10">
        <canvas ref={canvasRef} className="hidden" />
        
        {error ? (
          <div className="text-red-500 font-mono text-[9px] uppercase p-4">{error}</div>
        ) : mode === 'ASCII' ? (
          <pre className="text-[7px] leading-[6px] sm:text-[8px] sm:leading-[7px] font-mono text-[var(--primary)] p-1 overflow-x-auto whitespace-pre selection:bg-[var(--primary)] selection:text-black w-full text-center tracking-[1px] font-bold">
            {ascii}
          </pre>
        ) : (
          <div className="relative w-full max-h-[400px] flex items-center justify-center overflow-hidden">
            <img src={src} alt="Source Scan" className="max-w-full max-h-full object-contain grayscale brightness-110 contrast-125 opacity-80" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--primary)]/30 shadow-[0_0_10px_var(--primary)] animate-[hudscan_3s_linear_infinite]"></div>
            </div>
          </div>
        )}

        {!isLoaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            <div className="text-[9px] font-mono text-[var(--primary)] animate-pulse tracking-[0.4em] uppercase">
              Decyphering_Pixels...
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes hudscan {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AsciiImage;
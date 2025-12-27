
import React, { useEffect, useState, useRef } from 'react';

interface AsciiImageProps {
  src: string;
  width?: number;
}

const AsciiImage: React.FC<AsciiImageProps> = ({ src, width = 60 }) => {
  const [ascii, setAscii] = useState<string>('CONVERTING_TO_ASCII...');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const height = Math.floor((img.height / img.width) * width * 0.5);
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;

      const chars = "@#S%?*+;:,.. ";
      let result = "";

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
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
    };
  }, [src, width]);

  return (
    <div className="relative group">
      <canvas ref={canvasRef} className="hidden" />
      <pre className="text-[6px] leading-[5px] font-mono text-[var(--primary)] bg-black/40 p-2 border border-[var(--primary)]/20 overflow-x-auto whitespace-pre select-none">
        {ascii}
      </pre>
      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[8px] uppercase font-bold border-l border-b border-[var(--primary)]/40">
        Visual_Buffer_0x
      </div>
    </div>
  );
};

export default AsciiImage;

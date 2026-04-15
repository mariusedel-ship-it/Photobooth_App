import React, { useRef, useEffect } from 'react';

export default function FilmGrainOverlay({ enabled = 0, width, height, className = '' }) {
  const canvasRef = useRef(null);
  const framesRef = useRef([]);

  useEffect(() => {
    if (!enabled) return;

    // Generate 8 random film grain frames
    const generateFrames = () => {
      const frames = [];
      for (let frame = 0; frame < 8; frame++) {
        const canvas = document.createElement('canvas');
        canvas.width = width || 1280;
        canvas.height = height || 960;
        const ctx = canvas.getContext('2d');
        
        // Random dust particles
        const dustCount = Math.floor(Math.random() * 60) + 50;
        for (let i = 0; i < dustCount; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 3 + 0.3;
          const opacity = Math.random() * 0.4 + 0.05;
          const isWhite = Math.random() > 0.3;
          
          ctx.fillStyle = isWhite 
            ? `rgba(255, 255, 255, ${opacity})` 
            : `rgba(0, 0, 0, ${opacity * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Random scratches
        const scratchCount = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < scratchCount; i++) {
          const x1 = Math.random() * canvas.width;
          const y1 = Math.random() * canvas.height;
          const length = Math.random() * 200 + 30;
          const angle = Math.random() * Math.PI * 2;
          const x2 = x1 + Math.cos(angle) * length;
          const y2 = y1 + Math.sin(angle) * length;
          const opacity = Math.random() * 0.2 + 0.03;
          const lineWidth = Math.random() * 2 + 0.3;
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        
        // Random dark spots
        const spotCount = Math.floor(Math.random() * 15) + 10;
        for (let i = 0; i < spotCount; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 12 + 1;
          const opacity = Math.random() * 0.25 + 0.03;
          const isDark = Math.random() > 0.2;
          
          ctx.fillStyle = isDark
            ? `rgba(0, 0, 0, ${opacity})`
            : `rgba(255, 255, 255, ${opacity * 0.6})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Random hair/fiber lines
        const fiberCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < fiberCount; i++) {
          const x1 = Math.random() * canvas.width;
          const y1 = Math.random() * canvas.height;
          const length = Math.random() * 80 + 20;
          const angle = Math.random() * Math.PI * 2;
          const x2 = x1 + Math.cos(angle) * length;
          const y2 = y1 + Math.sin(angle) * length;
          const opacity = Math.random() * 0.15 + 0.05;
          
          ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.lineWidth = Math.random() * 0.8 + 0.3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        
        frames.push(canvas);
      }
      return frames;
    };
    
    framesRef.current = generateFrames();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const animate = () => {
      if (framesRef.current.length > 0) {
        const randomIndex = Math.floor(Math.random() * framesRef.current.length);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(framesRef.current[randomIndex], 0, 0, canvas.width, canvas.height);
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled, width, height]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width || 1280}
      height={height || 960}
      className={className}
      style={{ pointerEvents: 'none' }}
    />
  );
}
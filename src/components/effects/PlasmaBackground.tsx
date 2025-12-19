import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PlasmaBackgroundProps {
  className?: string;
  intensity?: number;
}

export const PlasmaBackground = ({ className, intensity = 1 }: PlasmaBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const animate = () => {
      time += 0.008 * intensity;
      
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          const idx = (y * canvas.width + x) * 4;

          // Plasma algorithm with mystical purple/gold tones
          const cx = x / canvas.width - 0.5;
          const cy = y / canvas.height - 0.5;

          const v1 = Math.sin(x * 0.02 + time);
          const v2 = Math.sin((y * 0.02 + time) * 0.5);
          const v3 = Math.sin((x * 0.02 + y * 0.02 + time) * 0.5);
          const v4 = Math.sin(Math.sqrt(cx * cx + cy * cy) * 12 + time * 2);

          const v = (v1 + v2 + v3 + v4) / 4;

          // Mystical color palette: deep purple, gold, and ethereal blue
          const r = Math.floor(Math.sin(v * Math.PI + time) * 40 + 80); // Purple-red
          const g = Math.floor(Math.sin(v * Math.PI + time + 2) * 30 + 30); // Low green
          const b = Math.floor(Math.sin(v * Math.PI + time + 4) * 60 + 140); // Blue-purple

          // Add golden highlights
          const gold = Math.max(0, Math.sin(v * Math.PI * 2 + time * 3) * 0.5);
          
          data[idx] = Math.min(255, r + gold * 180);
          data[idx + 1] = Math.min(255, g + gold * 140);
          data[idx + 2] = Math.min(255, b - gold * 50);
          data[idx + 3] = 200; // Semi-transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none',
        className
      )}
    />
  );
};

import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

interface CardRevealMistProps {
  className?: string;
  isActive?: boolean;
}

export const CardRevealMist: React.FC<CardRevealMistProps> = ({ className, isActive = false }) => {
  const [showMist, setShowMist] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowMist(true);
      // Mist effect lasts for 3 seconds
      const timer = setTimeout(() => {
        setShowMist(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowMist(false);
    }
  }, [isActive]);

  if (!showMist) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden z-20', className)}>
      {/* SVG filter for organic smoke movement */}
      <svg className="hidden">
        <filter id="reveal-mist-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" seed="10">
            <animate attributeName="baseFrequency" dur="3s" values="0.015;0.01;0.008" repeatCount="1" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="100" />
        </filter>
      </svg>

      {/* Central burst effect */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-0"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(138, 100, 200, 0.2) 30%, transparent 60%)',
          filter: 'blur(40px)',
          animation: 'reveal-burst 2s ease-out forwards',
        }}
      />

      {/* Rising mist columns */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`column-${i}`}
          className="absolute bottom-0"
          style={{
            left: `${(i / 8) * 100}%`,
            width: '20%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.4) 0%, rgba(212, 175, 55, 0.15) 30%, transparent 70%)',
            filter: 'blur(25px) url(#reveal-mist-filter)',
            animation: `mist-column-rise 2.5s ease-out forwards`,
            animationDelay: `${i * 0.08}s`,
            opacity: 0,
          }}
        />
      ))}

      {/* Ethereal smoke puffs */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`puff-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${80 + Math.random() * 120}px`,
            height: `${60 + Math.random() * 80}px`,
            left: `${20 + Math.random() * 60}%`,
            bottom: `-10%`,
            background: `radial-gradient(circle, rgba(255, 255, 255, ${0.2 + Math.random() * 0.2}) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 70%)`,
            filter: 'blur(20px)',
            animation: `spirit-rise ${1.5 + Math.random() * 1.5}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            opacity: 0,
          }}
        />
      ))}

      {/* Golden sparkles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute rounded-full bg-gold/80"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
            boxShadow: '0 0 6px 2px rgba(212, 175, 55, 0.6)',
            animation: `sparkle-float ${1 + Math.random() * 2}s ease-out forwards`,
            animationDelay: `${0.2 + Math.random() * 0.8}s`,
            opacity: 0,
          }}
        />
      ))}

      <style>{`
        @keyframes reveal-burst {
          0% { 
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
          }
          30% { 
            opacity: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes mist-column-rise {
          0% { 
            transform: translateY(100%) scaleY(0.5);
            opacity: 0;
          }
          20% { 
            opacity: 0.6;
          }
          100% { 
            transform: translateY(-30%) scaleY(1.2);
            opacity: 0;
          }
        }
        
        @keyframes spirit-rise {
          0% { 
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          15% { 
            opacity: 0.7;
          }
          100% { 
            transform: translateY(-400px) scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes sparkle-float {
          0% { 
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          20% { 
            transform: scale(1);
            opacity: 1;
          }
          100% { 
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

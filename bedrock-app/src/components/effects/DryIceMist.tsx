import { cn } from '@/lib/utils';
import React from 'react';

interface DryIceMistProps {
    className?: string;
    isActive?: boolean;
}

export const DryIceMist: React.FC<DryIceMistProps> = ({ className, isActive = true }) => {
    if (!isActive) return null;

    return (
        <div className={cn('absolute inset-0 pointer-events-none overflow-hidden z-[2]', className)}>
            {/* SVG filter for organic smoke movement */}
            <svg className="hidden">
                <filter id="mist-filter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="5">
                        <animate attributeName="baseFrequency" dur="30s" values="0.012;0.008;0.012" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" scale="80" />
                </filter>
            </svg>

            {/* Dense bottom fog */}
            <div
                className="absolute bottom-[-10%] left-[-10%] right-[-10%] h-[60%] opacity-40 mix-blend-screen"
                style={{
                    background: 'radial-gradient(ellipse at bottom, rgba(255, 255, 255, 0.4) 0%, rgba(200, 200, 255, 0.2) 40%, transparent 80%)',
                    filter: 'blur(40px) url(#mist-filter)',
                    animation: 'mist-drift 20s ease-in-out infinite alternate',
                }}
            />

            {/* Rising mist puffs */}
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${Math.random() * 300 + 200}px`,
                        height: `${Math.random() * 200 + 150}px`,
                        left: `${Math.random() * 120 - 10}%`,
                        bottom: `${Math.random() * 20 - 10}%`,
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
                        filter: 'blur(30px) url(#mist-filter)',
                        animation: `puff-rise ${6 + Math.random() * 4}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: 0.3 + Math.random() * 0.3,
                    }}
                />
            ))}

            <style>{`
        @keyframes mist-drift {
          from { transform: translateX(-5%) translateY(5%) scale(1); }
          to { transform: translateX(5%) translateY(-5%) scale(1.1); }
        }
        @keyframes puff-rise {
          0% { transform: translateY(20%) scale(0.8); opacity: 0; }
          20% { opacity: 0.4; }
          100% { transform: translateY(-40%) scale(1.5); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

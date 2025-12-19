import { cn } from '@/lib/utils';

interface MysticMistProps {
  className?: string;
  isActive?: boolean;
}

export const MysticMist = ({ className, isActive = true }: MysticMistProps) => {
  if (!isActive) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {/* Rising mist particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-mist-rise"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            left: `${Math.random() * 100}%`,
            bottom: `-${Math.random() * 50}px`,
            background: `radial-gradient(ellipse, 
              hsla(280, 70%, 60%, ${0.1 + Math.random() * 0.15}) 0%, 
              hsla(45, 80%, 50%, ${0.05 + Math.random() * 0.1}) 50%,
              transparent 70%)`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            filter: 'blur(20px)',
          }}
        />
      ))}

      {/* Swirling energy orbs */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full animate-float-swirl"
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            background: `radial-gradient(circle, 
              hsla(45, 100%, 70%, 0.4) 0%, 
              hsla(280, 80%, 50%, 0.2) 50%,
              transparent 70%)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
            filter: 'blur(8px)',
          }}
        />
      ))}

      {/* Dragon smoke effect - dense bottom fog */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2 animate-pulse"
        style={{
          background: `linear-gradient(to top,
            hsla(280, 60%, 20%, 0.8) 0%,
            hsla(280, 50%, 30%, 0.4) 30%,
            hsla(45, 60%, 40%, 0.1) 60%,
            transparent 100%)`,
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
};

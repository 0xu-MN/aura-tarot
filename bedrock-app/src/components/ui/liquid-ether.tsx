import React from 'react';

export const LiquidEther: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`liquid-ether-container ${className}`}>
      <div className="liquid-gradient"></div>
      <style>{`
        .liquid-ether-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          opacity: 0.7;
          pointer-events: none;
        }
        
        .liquid-gradient {
          position: absolute;
          inset: -50%;
          background: radial-gradient(
            circle at 20% 50%,
            rgba(218, 165, 32, 0.5) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 80% 80%,
            rgba(186, 85, 211, 0.5) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 40% 20%,
            rgba(138, 43, 226, 0.4) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 60% 70%,
            rgba(218, 165, 32, 0.4) 0%,
            transparent 50%
          );
          animation: liquid-flow 15s ease-in-out infinite;
          filter: blur(50px);
        }
        
        @keyframes liquid-flow {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(15%, -15%) rotate(90deg) scale(1.2);
          }
          50% {
            transform: translate(-10%, 15%) rotate(180deg) scale(0.95);
          }
          75% {
            transform: translate(-15%, -10%) rotate(270deg) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

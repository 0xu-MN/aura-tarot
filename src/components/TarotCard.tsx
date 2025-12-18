import { useState } from "react";
import { cn } from "@/lib/utils";
import tarotBack from "@/assets/tarot-back.png";

interface TarotCardProps {
  frontImage?: string;
  isReversed?: boolean;
  onFlipComplete?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const sizeClasses = {
  sm: "w-24 h-40",
  md: "w-36 h-60",
  lg: "w-52 h-[340px]",
};

export const TarotCard = ({
  frontImage,
  isReversed = false,
  onFlipComplete,
  className,
  size = "md",
  interactive = true,
}: TarotCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!interactive || isAnimating || isFlipped) return;
    
    setIsAnimating(true);
    setIsFlipped(true);
    
    setTimeout(() => {
      setIsAnimating(false);
      onFlipComplete?.();
    }, 800);
  };

  return (
    <div
      className={cn(
        "perspective-1000 cursor-pointer",
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 preserve-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden border-2 border-gold/50 shadow-lg">
          <img
            src={tarotBack}
            alt="타로 카드"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 card-shine pointer-events-none" />
        </div>

        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden border-2 border-gold shadow-lg",
            isReversed && "rotate-180"
          )}
        >
          {frontImage ? (
            <img
              src={frontImage}
              alt="타로 카드 앞면"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-mystic-purple/20 to-mystic-orange/20 flex items-center justify-center">
              <span className="text-gold font-display text-lg">✦</span>
            </div>
          )}
          {isFlipped && (
            <div className="absolute inset-0 animate-pulse-glow rounded-xl pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};

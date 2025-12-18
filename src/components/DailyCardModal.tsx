import { useState, useEffect } from "react";
import { X, Share2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { TarotCard } from "./TarotCard";
import { cn } from "@/lib/utils";
import tarotBack from "@/assets/tarot-back.png";

interface DailyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cardMeanings = [
  {
    name: "The Fool",
    korean: "광대",
    meaning: "새로운 시작과 무한한 가능성이 당신을 기다리고 있습니다. 두려움 없이 첫 걸음을 내딛으세요.",
    advice: "오늘은 모험을 두려워하지 마세요. 새로운 기회가 찾아올 것입니다.",
  },
  {
    name: "The Magician",
    korean: "마법사",
    meaning: "당신 안에 모든 것을 이룰 수 있는 힘이 있습니다. 의지와 집중력으로 원하는 것을 현실로 만드세요.",
    advice: "창의력을 발휘할 때입니다. 당신의 아이디어를 실행에 옮기세요.",
  },
  {
    name: "The High Priestess",
    korean: "여사제",
    meaning: "직감을 믿으세요. 숨겨진 진실이 곧 드러날 것입니다. 내면의 목소리에 귀 기울이세요.",
    advice: "조용히 명상하는 시간을 가지세요. 답은 이미 당신 안에 있습니다.",
  },
  {
    name: "The Empress",
    korean: "여황제",
    meaning: "풍요와 창조의 에너지가 당신을 감싸고 있습니다. 사랑과 아름다움을 받아들일 준비를 하세요.",
    advice: "자신을 돌보는 것을 잊지 마세요. 충분한 휴식이 필요합니다.",
  },
  {
    name: "The Star",
    korean: "별",
    meaning: "희망의 빛이 당신의 길을 비추고 있습니다. 어둠 속에서도 믿음을 잃지 마세요.",
    advice: "긍정적인 마음을 유지하세요. 소원이 이루어질 조짐이 보입니다.",
  },
];

export const DailyCardModal = ({ isOpen, onClose }: DailyCardModalProps) => {
  const [phase, setPhase] = useState<"shuffle" | "select" | "reveal" | "reading">("shuffle");
  const [selectedCard, setSelectedCard] = useState<typeof cardMeanings[0] | null>(null);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhase("shuffle");
      setSelectedCard(null);
      
      // Auto-advance to select phase
      const timer = setTimeout(() => {
        setPhase("select");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCardSelect = () => {
    const randomCard = cardMeanings[Math.floor(Math.random() * cardMeanings.length)];
    const reversed = Math.random() > 0.7;
    setSelectedCard(randomCard);
    setIsReversed(reversed);
    setPhase("reveal");
  };

  const handleFlipComplete = () => {
    setTimeout(() => setPhase("reading"), 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Shuffle Phase */}
          {phase === "shuffle" && (
            <div className="text-center py-16">
              <div className="flex justify-center gap-2 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-24 rounded-lg bg-card border border-gold/30"
                    style={{
                      animation: `shuffle ${0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                      transform: `rotate(${(i - 1) * 5}deg)`,
                    }}
                  >
                    <img src={tarotBack} alt="" className="w-full h-full object-cover rounded-lg" />
                  </div>
                ))}
              </div>
              <p className="text-lg text-foreground animate-pulse">
                카드를 섞고 있습니다...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                마음을 집중하고 질문을 떠올려 보세요
              </p>
            </div>
          )}

          {/* Select Phase */}
          {phase === "select" && (
            <div className="text-center py-8">
              <h3 className="font-display text-2xl text-gold-gradient mb-4">
                카드를 선택하세요
              </h3>
              <p className="text-muted-foreground mb-8">
                마음이 이끄는 카드를 터치하세요
              </p>
              
              <div className="flex justify-center gap-4">
                {[...Array(3)].map((_, i) => (
                  <button
                    key={i}
                    onClick={handleCardSelect}
                    className={cn(
                      "w-24 h-40 rounded-xl border-2 border-gold/30 overflow-hidden transition-all duration-300",
                      "hover:border-gold hover:scale-105 hover:shadow-[0_0_30px_hsl(43_74%_49%_/_0.3)]",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <img src={tarotBack} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reveal Phase */}
          {(phase === "reveal" || phase === "reading") && selectedCard && (
            <div className="text-center">
              <div className="mb-6">
                <TarotCard
                  size="lg"
                  isReversed={isReversed}
                  onFlipComplete={handleFlipComplete}
                  className="mx-auto"
                />
              </div>

              {phase === "reading" && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-display text-2xl text-gold">
                      {selectedCard.korean}
                    </h3>
                    {isReversed && (
                      <span className="px-2 py-0.5 text-xs bg-mystic-purple/30 text-mystic-purple rounded-full">
                        역방향
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedCard.name}
                  </p>
                  
                  <div className="bg-muted/30 rounded-xl p-4 mt-6 text-left">
                    <h4 className="text-sm font-medium text-gold mb-2">카드 해석</h4>
                    <p className="text-foreground leading-relaxed">
                      {selectedCard.meaning}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-gold/10 to-mystic-purple/10 rounded-xl p-4 text-left">
                    <h4 className="text-sm font-medium text-gold mb-2">오늘의 조언</h4>
                    <p className="text-foreground leading-relaxed">
                      {selectedCard.advice}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                      <RefreshCw className="w-4 h-4" />
                      다시 뽑기
                    </Button>
                    <Button variant="gold" className="flex-1">
                      <Share2 className="w-4 h-4" />
                      공유하기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shuffle {
          0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--rotation, 0deg)); }
        }
      `}</style>
    </div>
  );
};

import { useState, useEffect } from "react";
import { X, Share2, Download, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { TarotCard } from "./TarotCard";
import { cn } from "@/lib/utils";
import { LiquidEther } from "./ui/liquid-ether";
import { PlasmaBackground } from "./effects/PlasmaBackground";
import { MysticMist } from "./effects/MysticMist";
import tarotBack from "@/assets/tarot-back.png";

interface DailyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: string;
}

const cardMeanings = [
  {
    name: "The Fool",
    korean: "광대",
    meaning: "새로운 시작과 무한한 가능성이 당신을 기다리고 있습니다. 광대 카드는 순수함과 자발성, 그리고 미지의 세계로의 도약을 상징합니다. 당신은 지금 인생의 새로운 장을 열어가고 있으며, 과거의 경험에 얽매이지 않는 자유로운 영혼을 가지고 있습니다.\n\n이 카드는 당신이 두려움 없이 첫 걸음을 내딛을 준비가 되었음을 알려줍니다. 때로는 주변 사람들이 당신의 선택을 무모하다고 생각할 수 있지만, 진정한 성장은 익숙한 영역을 벗어날 때 일어납니다. 우주는 당신을 지지하고 있으며, 새로운 모험을 통해 자신의 진정한 잠재력을 발견하게 될 것입니다.",
    advice: "오늘은 모험을 두려워하지 마세요. 직관을 믿고 마음이 이끄는 대로 따라가세요. 완벽한 준비를 기다리기보다는 지금 있는 그대로의 모습으로 시작하세요. 새로운 기회가 당신을 기다리고 있으며, 열린 마음으로 받아들인다면 놀라운 경험을 하게 될 것입니다. 실수를 두려워하지 말고, 그것들을 배움의 기회로 삼으세요.",
  },
  {
    name: "The Magician",
    korean: "마법사",
    meaning: "마법사 카드는 현현과 창조의 힘을 상징합니다. 당신은 지금 필요한 모든 도구와 자원을 가지고 있으며, 의지와 집중력만 있다면 무엇이든 이룰 수 있는 시기입니다. 이 카드는 '위에 있는 것과 같이 아래에도'라는 연금술의 원리를 나타내며, 당신의 생각과 의도가 현실로 구현될 수 있음을 알려줍니다.\n\n마법사는 네 가지 원소(지, 물, 불, 공기)를 모두 다루며, 이는 당신이 물질적, 감정적, 정신적, 영적 영역 모두에서 균형을 이룰 수 있음을 의미합니다. 당신의 창의력과 기술, 지식이 완벽하게 조화를 이루는 순간입니다.",
    advice: "지금은 당신의 아이디어를 실행에 옮길 완벽한 타이밍입니다. 명확한 의도를 설정하고, 목표를 향해 집중하세요. 당신 안에 있는 창조적 에너지를 활용하여 원하는 현실을 만들어가세요. 자신의 능력을 의심하지 말고, 자신감을 가지고 앞으로 나아가세요. 필요한 자원은 이미 당신 곁에 있으며, 그것들을 어떻게 활용할지는 당신의 선택입니다.",
  },
  {
    name: "The High Priestess",
    korean: "여사제",
    meaning: "여사제는 직관과 내면의 지혜, 그리고 숨겨진 지식을 상징합니다. 이 카드는 표면 아래에 더 깊은 진실이 있음을 알려주며, 당신의 무의식이 중요한 메시지를 전하고 있음을 나타냅니다. 지금은 외부의 소음을 차단하고 내면의 목소리에 귀 기울여야 할 때입니다.\n\n여사제는 달의 에너지와 연결되어 있으며, 이는 순환과 변화, 그리고 감정의 흐름을 의미합니다. 당신은 지금 인생의 신비로운 측면과 더 깊이 연결되고 있으며, 이성적 사고만으로는 이해할 수 없는 진리를 경험하고 있습니다. 인내심을 가지고 기다리세요. 때가 되면 모든 것이 명확해질 것입니다.",
    advice: "조용히 명상하는 시간을 가지세요. 답은 이미 당신 안에 있으며, 고요함 속에서 그것을 발견할 수 있습니다. 꿈에 주의를 기울이고, 직관적인 느낌을 무시하지 마세요. 때로는 행동하기보다 관찰하고 기다리는 것이 더 현명한 선택입니다. 내면의 지혜를 신뢰하고, 우주의 타이밍을 믿으세요. 숨겨진 것들이 곧 드러날 것입니다.",
  },
  {
    name: "The Empress",
    korean: "여황제",
    meaning: "여황제는 풍요와 창조, 양육의 에너지를 상징합니다. 이 카드는 자연의 아름다움과 생명력, 그리고 무조건적인 사랑을 나타냅니다. 당신은 지금 받을 준비가 되어 있으며, 우주는 당신에게 풍성한 축복을 내리고 있습니다.\n\n여황제는 창조성과 감성의 표현을 장려합니다. 이는 예술적 프로젝트, 새로운 관계, 또는 아이디어의 실현 등 다양한 형태로 나타날 수 있습니다. 당신의 여성적 에너지(성별과 무관하게)가 강화되고 있으며, 이를 통해 더 균형잡힌 삶을 살아갈 수 있습니다. 자기 자신과 다른 사람들을 돌보는 것의 중요성을 기억하세요.",
    advice: "자신을 돌보는 것을 최우선으로 하세요. 충분한 휴식을 취하고, 아름다움과 편안함으로 자신을 둘러싸세요. 창조적 활동에 시간을 할애하고, 감각적 경험을 즐기세요. 자연과 연결되는 시간을 가지며, 당신의 양육하는 측면을 표현하세요. 풍요는 당신의 것이며, 감사하는 마음으로 받아들이세요. 사랑과 아름다움이 당신의 삶에 넘쳐나도록 하세요.",
  },
  {
    name: "The Star",
    korean: "별",
    meaning: "별 카드는 희망과 영감, 그리고 영적 지도를 상징합니다. 어두운 시기를 지나온 후에 나타나는 이 카드는 치유와 갱신의 메시지를 전합니다. 당신은 지금 우주와 깊은 연결을 경험하고 있으며, 더 높은 목적을 향해 나아가고 있습니다.\n\n이 카드는 순수한 마음과 낙관적인 전망을 나타냅니다. 별은 하늘에서 당신을 지켜보며 길을 밝혀주고 있습니다. 어떤 어려움이 있더라도, 당신에게는 그것을 극복할 힘이 있으며, 더 나은 미래가 기다리고 있습니다. 믿음을 잃지 마세요. 당신의 꿈과 소망이 실현될 시기가 다가오고 있습니다.",
    advice: "긍정적인 마음가짐을 유지하고, 당신의 비전을 명확히 하세요. 소원을 빌고, 우주가 그것을 들어줄 것이라 믿으세요. 다른 사람들에게 영감을 주고, 당신의 빛을 세상과 나누세요. 과거의 상처를 치유하고, 미래를 향해 열린 마음으로 나아가세요. 당신은 혼자가 아니며, 우주의 지지를 받고 있습니다. 희망을 가지세요. 기적이 일어나고 있습니다.",
  },
];

export const DailyCardModal = ({ isOpen, onClose, question }: DailyCardModalProps) => {
  const [phase, setPhase] = useState<"shuffle" | "select" | "reading">("shuffle");
  const [selectedCard, setSelectedCard] = useState<typeof cardMeanings[0] | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhase("shuffle");
      setSelectedCard(null);
      setShowCard(false);

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

    // Immediate transition to reading
    setPhase("reading");
    setTimeout(() => setShowCard(true), 100);
  };

  const handleDrawAgain = () => {
    setPhase("shuffle");
    setSelectedCard(null);
    setShowCard(false);

    setTimeout(() => {
      setPhase("select");
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg h-[80vh] bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in flex flex-col overflow-hidden">
        {/* Plasma & Mystic Effects Background */}
        {(phase === "select" || phase === "reading") && (
          <div className="absolute inset-0 z-0">
            <PlasmaBackground intensity={phase === "reading" ? 1.5 : 0.8} />
            <MysticMist isActive={true} />
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
          </div>
        )}

        {/* Liquid Ether Background - Additional layer for reading phase */}
        {phase === "reading" && (
          <div className="absolute inset-0 z-[1] opacity-50">
            <LiquidEther className="h-full w-full" />
          </div>
        )}

        {/* Close Button - High Z-Index */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-background/80 hover:bg-background border border-gold/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10 p-6 md:p-8">

          {/* Question Display (Always visible if exists) */}
          {question && phase !== "shuffle" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gold/10 to-mystic-purple/10 rounded-xl backdrop-blur-sm border border-gold/20">
              <p className="text-sm text-muted-foreground mb-1">당신의 질문:</p>
              <p className="text-foreground italic">"{question}"</p>
            </div>
          )}

          {/* Shuffle Phase */}
          {phase === "shuffle" && (
            <div className="h-full flex flex-col items-center justify-center pb-20">
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
              <p className="text-lg text-foreground animate-pulse">카드를 섞고 있습니다...</p>
              <p className="text-sm text-muted-foreground mt-2">마음을 집중하고 질문을 떠올려 보세요</p>
            </div>
          )}

          {/* Select Phase */}
          {phase === "select" && (
            <div className="h-full flex flex-col items-center justify-center pb-20 animate-fade-in">
              <h3 className="font-display text-2xl text-gold-gradient mb-4">카드를 선택하세요</h3>
              <p className="text-muted-foreground mb-8">마음이 이끄는 카드를 터치하세요</p>

              <div className="flex justify-center gap-4">
                {[...Array(3)].map((_, i) => (
                  <button
                    key={i}
                    onClick={handleCardSelect}
                    className={cn(
                      "w-24 h-40 rounded-xl border-2 border-gold/30 overflow-hidden transition-all duration-300",
                      "hover:border-gold hover:scale-105 hover:shadow-[0_0_30px_hsl(43_74%_49%_/_0.3)]",
                      "animate-fade-in card-glow cursor-pointer"
                    )}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <img src={tarotBack} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reading Phase */}
          {phase === "reading" && selectedCard && (
            <div className={cn("text-center pb-8", showCard && "animate-fade-in")}>
              <div className="mb-6 relative inline-block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="halo-effect" />
                </div>
                <TarotCard
                  size="lg"
                  isReversed={isReversed}
                  className="relative z-10"
                  isFlipped={showCard}
                  interactive={false}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-display text-2xl text-gold">{selectedCard.korean}</h3>
                  {isReversed && (
                    <span className="px-2 py-0.5 text-xs bg-mystic-purple/30 text-mystic-purple rounded-full">
                      역방향
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{selectedCard.name}</p>

                <div className="bg-background/40 backdrop-blur-md rounded-xl p-5 mt-6 text-left border border-gold/10 shadow-sm">
                  <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> 카드 해석
                  </h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-line text-sm opacity-90">
                    {selectedCard.meaning}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-gold/10 to-mystic-purple/10 backdrop-blur-md rounded-xl p-5 text-left border border-gold/20 shadow-sm">
                  <h4 className="text-sm font-medium text-gold mb-3">✨ 오늘의 조언</h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-line text-sm opacity-90">
                    {selectedCard.advice}
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 bg-background/50 backdrop-blur-sm border-gold/20 hover:bg-gold/10">
                      <Download className="w-4 h-4 mr-2" />
                      이미지 저장
                    </Button>
                    <Button variant="outline" className="flex-1 bg-background/50 backdrop-blur-sm border-gold/20 hover:bg-gold/10">
                      <Share2 className="w-4 h-4 mr-2" />
                      공유하기
                    </Button>
                  </div>

                  <Button variant="gold" className="w-full shadow-lg shadow-gold/20" onClick={handleDrawAgain}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    한 장 더 뽑기
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shuffle {
          0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--rotation, 0deg)); }
        }

        @keyframes halo-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes halo-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .halo-effect {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(43, 74%, 49%) 0%, hsl(280, 70%, 50%) 50%, transparent 70%);
          filter: blur(20px);
          animation: halo-pulse 2s ease-in-out infinite, halo-rotate 4s linear infinite;
          opacity: 0.6;
        }

        .card-glow:hover {
          animation: card-glow-pulse 1.5s ease-in-out infinite !important;
        }

        @keyframes card-glow-pulse {
          0%, 100% { box-shadow: 0 0 20px hsl(43 74% 49% / 0.3); }
          50% { box-shadow: 0 0 40px hsl(43 74% 49% / 0.6), 0 0 60px hsl(280 70% 50% / 0.4); }
        }
      `}</style>
    </div>
  );
};

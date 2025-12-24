import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Share2, Download, Sparkles, RotateCcw, Home, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { TarotCard } from "./TarotCard";
import { cn } from "@/lib/utils";
import { Plasma } from "./effects/Plasma";
import { DryIceMist } from "./effects/DryIceMist";
import { CardRevealMist } from "./effects/CardRevealMist";
import { saveResultAsImage, shareResult, captureResultAsDataURL } from "@/lib/shareUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import tarotBack from "@/assets/tarot-back.png";
import { PaymentModal } from "./premium/PaymentModal";
import { useAuth } from "@/contexts/AuthContext";
import { DrawAgainModal } from "./DrawAgainModal";
import { TAROT_CARDS, TarotCardData } from "@/lib/tarot-data";

const MAX_FREE_DRAWS = 3;
const DAILY_DRAW_KEY = 'daily_card_draws';

interface DailyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDrawAgain?: () => void;
  question?: string;
}

// Helper functions for daily draw tracking
const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

const getDailyDrawCount = (): number => {
  try {
    const stored = localStorage.getItem(DAILY_DRAW_KEY);
    if (!stored) return 0;
    const data = JSON.parse(stored);
    if (data.date !== getTodayKey()) return 0;
    return data.count || 0;
  } catch {
    return 0;
  }
};

const incrementDailyDrawCount = () => {
  const currentCount = getDailyDrawCount();
  localStorage.setItem(DAILY_DRAW_KEY, JSON.stringify({
    date: getTodayKey(),
    count: currentCount + 1
  }));
};

export const DailyCardModal = ({ isOpen, onClose, onDrawAgain, question }: DailyCardModalProps) => {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"shuffle" | "select" | "reading">("shuffle");
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [showDrawAgainModal, setShowDrawAgainModal] = useState(false);
  const [aiReading, setAiReading] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDrawCount(getDailyDrawCount());
      setPhase("shuffle");
      setSelectedCard(null);
      setShowCard(false);
      setAiReading("");

      const timer = setTimeout(() => {
        setPhase("select");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const recordReading = async (card: TarotCardData, reversed: boolean, interpretation: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Record the reading
      const { error: readingError } = await supabase.from('daily_readings').insert({
        user_id: user.id,
        question: question || '오늘의 운세',
        card_name: card.name,
        interpretation: interpretation,
        advice: "AI 리딩에 포함됨",
        is_reversed: reversed
      });

      if (readingError) throw readingError;
    } catch (error) {
      console.error('Error recording reading:', error);
    }
  };

  const fetchAiReading = async (card: TarotCardData, reversed: boolean) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('tarot-chat', {
        body: {
          type: 'reading',
          context: {
            question: question || '오늘의 전반적인 운세와 조언을 알려주세요.',
            cards: [{ name: card.name, isReversed: reversed }]
          }
        }
      });

      if (error) throw error;
      if (data?.message) {
        setAiReading(data.message);
        await recordReading(card, reversed, data.message);
      }
    } catch (err) {
      console.error('Error fetching AI reading:', err);
      toast.error('AI 리딩을 생성하는 중 오류가 발생했습니다.');
      setAiReading("죄송합니다. AI 마스터와 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCardSelect = async () => {
    // Check if user has exceeded free draws
    const currentDraws = getDailyDrawCount();
    if (currentDraws >= MAX_FREE_DRAWS) {
      setShowPaymentModal(true);
      return;
    }

    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    const reversed = Math.random() > 0.7;
    setSelectedCard(randomCard);
    setIsReversed(reversed);

    // Increment draw count
    incrementDailyDrawCount();
    setDrawCount(currentDraws + 1);

    // Start AI Reading
    fetchAiReading(randomCard, reversed);

    // Immediate transition to reading
    setPhase("reading");
    setTimeout(() => setShowCard(true), 100);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveResultAsImage('daily-reading-result', `AuraTarot_${new Date().getTime()}`);
    if (success) {
      toast.success('이미지가 저장되었습니다');
    } else {
      toast.error('이미지 저장에 실패했습니다');
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    if (!selectedCard) return;
    const success = await shareResult(
      'Aura Tarot - 오늘의 운세',
      `오늘 나의 카드는 "${selectedCard.koreanName}"입니다. 당신의 운세도 확인해보세요!`
    );
    if (!success) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.info('링크가 클립보드에 복사되었습니다');
    }
  };

  const handleShareToLounge = async () => {
    setIsSaving(true);
    const imageData = await captureResultAsDataURL('daily-reading-result');
    if (imageData) {
      // Navigate to lounge and pass image data in state
      navigate('/lounge', {
        state: {
          autoOpenCreate: true,
          attachedImage: imageData,
          initialTitle: `오늘 나의 ${selectedCard?.koreanName} 카드 결과`,
          initialContent: `오늘 저는 "${selectedCard?.koreanName}" 카드를 뽑았습니다.\n\n해석: ${aiReading.substring(0, 100)}...`
        }
      });
      onClose();
    } else {
      toast.error('라운지 공유에 실패했습니다');
    }
    setIsSaving(false);
  };

  const handleDrawAgain = () => {
    // Check if user has exceeded free draws
    const currentDraws = getDailyDrawCount();
    if (currentDraws >= MAX_FREE_DRAWS) {
      setShowPaymentModal(true);
      return;
    }
    // Show draw again modal to let user choose
    setShowDrawAgainModal(true);
  };

  const handlePaymentSuccess = () => {
    // After payment, allow unlimited draws for today
    setShowPaymentModal(false);
    // Show draw again modal
    setShowDrawAgainModal(true);
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
        {/* New Plasma & Dry Ice Effects Background */}
        {(phase === "select" || phase === "reading") && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Plasma
              color="#d4af37"
              speed={phase === "reading" ? 0.8 : 0.4}
              opacity={0.6}
              scale={1.2}
            />
            <DryIceMist isActive={true} />
            <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
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
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10">
          <div id="daily-reading-result" className="p-6 md:p-8 min-h-full flex flex-col">
            {/* Question Display (Always visible if exists) */}
            {question && phase !== "shuffle" && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gold/10 to-mystic-purple/10 rounded-xl backdrop-blur-sm border border-gold/20">
                <p className="text-sm text-muted-foreground mb-1">당신의 질문:</p>
                <p className="text-foreground italic">"{question}"</p>
              </div>
            )}

            {/* Shuffle Phase */}
            {phase === "shuffle" && (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
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
              <div className="flex-1 flex flex-col items-center justify-center py-20 animate-fade-in">
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
                {/* Spirit reveal mist effect */}
                <CardRevealMist isActive={showCard} />

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
                    <h3 className="font-display text-2xl text-gold">{selectedCard.koreanName}</h3>
                    {isReversed && (
                      <span className="px-2 py-0.5 text-xs bg-mystic-purple/30 text-mystic-purple rounded-full">
                        역방향
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedCard.name}</p>

                  <div className="bg-background/40 backdrop-blur-md rounded-xl p-5 mt-6 text-left border border-gold/10 shadow-sm">
                    <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> 리딩 결과
                    </h4>
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-gold" />
                        <p className="text-xs text-muted-foreground animate-pulse">AI 마스터가 운명을 읽고 있습니다...</p>
                      </div>
                    ) : (
                      <p className="text-foreground leading-relaxed whitespace-pre-line text-sm opacity-90">
                        {aiReading}
                      </p>
                    )}
                  </div>

                  {!isAnalyzing && aiReading && (
                    <div className="flex flex-col gap-3 mt-8 no-capture">
                      <Button
                        variant="gold"
                        className="w-full bg-gold/10 hover:bg-gold/20 text-gold border-gold/30"
                        onClick={handleShareToLounge}
                        disabled={isSaving}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        라운지에 공유하기
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-background/50 backdrop-blur-sm border-gold/20 hover:bg-gold/10"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          이미지 저장
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-background/50 backdrop-blur-sm border-gold/20 hover:bg-gold/10"
                          onClick={handleShare}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          공유하기
                        </Button>
                      </div>

                      <Button variant="gold" className="w-full shadow-lg shadow-gold/20" onClick={handleDrawAgain}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        한 장 더 뽑기
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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

      {/* Draw Again Modal */}
      <DrawAgainModal
        isOpen={showDrawAgainModal}
        onClose={() => setShowDrawAgainModal(false)}
        onSameQuestion={() => {
          setShowDrawAgainModal(false);
          setPhase("shuffle");
          setSelectedCard(null);
          setShowCard(false);
          setAiReading("");
          setTimeout(() => setPhase("select"), 2000);
        }}
        onNewQuestion={() => {
          setShowDrawAgainModal(false);
          onClose();
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        featureName="오늘의 타로 - 추가 뽑기"
        featureId="daily-tarot-extra"
        price={1}
      />
    </div>
  );
};

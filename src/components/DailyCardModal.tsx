import { useState, useEffect, useRef } from "react";
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
import { IS_BETA_ACTIVE } from "@/lib/beta-config";

const MAX_FREE_DRAWS = 3;
const DAILY_DRAW_KEY = 'daily_card_draws';
const DAILY_PAID_KEY = 'daily_card_paid';

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

const isDailyPaid = (): boolean => {
  try {
    const stored = localStorage.getItem(DAILY_PAID_KEY);
    if (!stored) return false;
    const data = JSON.parse(stored);
    return data.date === getTodayKey() && data.paid === true;
  } catch {
    return false;
  }
};

const setDailyPaid = () => {
  localStorage.setItem(DAILY_PAID_KEY, JSON.stringify({
    date: getTodayKey(),
    paid: true
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

  // Add ref to prevent double-click counting
  const isSelectionProcessing = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setDrawCount(getDailyDrawCount());
      setPhase("shuffle");
      setSelectedCard(null);
      setShowCard(false);
      setAiReading("");
      isSelectionProcessing.current = false; // Reset lock on open

      const timer = setTimeout(() => {
        setPhase("select");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ... (existing recordReading and fetchAiReading)

  const handleCardSelect = async () => {
    if (isSelectionProcessing.current) return;

    // Check if user has exceeded free draws
    const currentDraws = getDailyDrawCount();

    // STRICT BETA LIMIT CHECK
    if (IS_BETA_ACTIVE) {
      if (currentDraws >= MAX_FREE_DRAWS) {
        toast.error('베타 기간 동안은 하루 3회 무료 이용만 가능합니다. 내일 다시 이용해주세요! ✨', {
          duration: 3000,
        });
        return;
      }
    } else {
      // Only block if limit exceeded AND not paid for today (Normal Mode)
      if (currentDraws >= MAX_FREE_DRAWS && !isDailyPaid()) {
        setShowPaymentModal(true);
        return;
      }
    }

    // Lock selection to prevent double counting
    isSelectionProcessing.current = true;

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
// ...
                      <Button
                        className="w-full bg-gold hover:bg-gold/90 text-black border-gold/50 shadow-lg shadow-gold/20 font-bold"
                        onClick={handleConsultSom}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        솜이에게 더 물어보기
                      </Button>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 text-sm font-medium backdrop-blur-sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          이미지 저장
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 text-sm font-medium backdrop-blur-sm"
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
                    </div >
                  )}
                </div >
              </div >
            )}
          </div >
        </div >
      </div >

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

{/* Draw Again Modal */ }
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

{/* Payment Modal */ }
<PaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  onSuccess={handlePaymentSuccess}
  featureName="오늘의 타로 - 추가 뽑기"
  featureId="daily-tarot-extra"
  price={1}
/>
    </div >
  );
};

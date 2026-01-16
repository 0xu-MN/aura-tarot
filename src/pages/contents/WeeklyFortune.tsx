import React, { useState, useEffect } from "react";
import { SpreadLayout } from "@/components/tarot/SpreadLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Sparkles, Loader2, Calendar, ChevronLeft } from "lucide-react";
import { GlareButton } from '@/components/ui/GlareButton';
import { useNavigate } from "react-router-dom";
import { getRandomCards, TarotCardData } from "@/lib/tarot-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { IS_BETA_ACTIVE, BETA_WEEKLY_LIMIT } from "@/lib/beta-config";
import { LoginRequiredModal } from '@/components/LoginRequiredModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { captureResultAsDataURL } from '@/lib/shareUtils';

export default function WeeklyFortune() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<"intro" | "spread" | "reading">("intro");
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [reading, setReading] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginRequired, setShowLoginRequired] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);


    // Calculate Weekly Date Range
    const getWeeklyDateRange = () => {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1); // This Monday
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6); // This Sunday

        const formatDate = (date: Date) => `${date.getMonth() + 1}.${date.getDate()}`;
        return `${formatDate(monday)} ~ ${formatDate(sunday)}`;
    };


    // Helper to get ISO week number and year key
    const getWeekKey = () => {
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const year = d.getUTCFullYear();
        const weekNo = Math.ceil((((d.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000) + 1) / 7);
        return `aura_limit_weekly_${year}_${weekNo}`;
    };

    const handleStart = () => {
        if (IS_BETA_ACTIVE) {
            const key = getWeekKey();
            const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
            if (currentCount >= BETA_WEEKLY_LIMIT) {
                toast.error(`베타 기간 동안 주간 운세는 주 ${BETA_WEEKLY_LIMIT}회로 제한됩니다. 다음 주에 다시 만나요! 🌙`);
                return;
            }
        }
        setStep("spread");
    };

    const weeklyDate = getWeeklyDateRange();

    // AI Interpretation Trigger
    useEffect(() => {
        if (step === "reading" && drawnCards.length > 0 && !reading && !isLoading) {
            if (!user) {
                // Determine if guest user - show login modal instead of generating reading
                // Only set if not already true to be safe
                if (!showLoginRequired) setShowLoginRequired(true);
            } else {
                generateReading();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, drawnCards, user?.id]);

    const handleSpreadComplete = (indices: number[]) => {
        setIsLoading(true);
        // Draw 5 random cards: Theme, Mon-Wed, Thu-Fri, Sat-Sun, Advice
        const cards = getRandomCards(5);
        setDrawnCards(cards);
        setSelectedCards(indices);
        setStep("reading");
        setIsLoading(false);
    };

    const generateReading = async () => {
        setIsLoading(true);
        try {
            // Check limit again and increment here to ensure we only count successful attempts (or at least attempts that start reading)
            // Ideally we check before API call to save cost?
            // But we already checked at start.
            // Let's increment NOW to prevent abuse.
            if (IS_BETA_ACTIVE) {
                const key = getWeekKey();
                const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
                localStorage.setItem(key, (currentCount + 1).toString());
            }

            const prompt = `
당신은 전문적인 타로 리더 '솜이'입니다.
사용자의 [${weeklyDate}] 주간 운세를 5장의 카드로 해석해주세요.

1. 전체 테마: ${drawnCards[0].card.koreanName} (${drawnCards[0].isReversed ? '역방향' : '정방향'})
2. 주초 (월~수): ${drawnCards[1].card.koreanName} (${drawnCards[1].isReversed ? '역방향' : '정방향'})
3. 주중 (목~금): ${drawnCards[2].card.koreanName} (${drawnCards[2].isReversed ? '역방향' : '정방향'})
4. 주말 (토~일): ${drawnCards[3].card.koreanName} (${drawnCards[3].isReversed ? '역방향' : '정방향'})
5. 조언: ${drawnCards[4].card.koreanName} (${drawnCards[4].isReversed ? '역방향' : '정방향'})

사용자: ${user?.nickname || '방문자'}님

요청사항:
- 반말(친근한 말투) 사용하되 전문적인 느낌 유지
- '멍!', '킁킁' 등 강아지 소리 사용 금지
- 시작 멘트: "안녕하세요, ${user?.nickname || '방문자'}님! 타로전문가 솜이입니다! 이번 주 운세 흐름을 읽어드릴게요."
- 전체 테마 요약 (2~3문장)
- 각 시기별 해석 (2~3문장)
- 조언 비중 있게 해석 + 구체적인 '이번 주 실천 액션' 1가지 제안
- 이모지 적절히 사용
- 마크다운 형식 사용

출력 형식:
## 🔮 이번 주 테마
(전체 요약)

## 📅 주간 흐름
* **월~수 (초반)**: (해석)
* **목~금 (중반)**: (해석)
* **토~일 (말미)**: (해석)

## ✨ 이번 주 조언
(조언 해석)
**🎯 실천 액션**: (한 문장 액션)
`;

            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: {
                    type: 'reading',
                    context: {
                        question: prompt,
                        cards: drawnCards.map(c => ({
                            name: c.card.name,
                            isReversed: c.isReversed
                        }))
                    }
                }
            });

            if (error) throw error;

            let content = data?.message || data?.response;
            if (content) {
                // Ensure we clean up any thinking blocks if they exist (DeepSeek style)
                content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                setReading(content);

                if (user) {
                    await supabase.from('daily_readings').insert({
                        user_id: user.id,
                        reading_type: 'weekly',
                        cards: drawnCards.map(c => ({ name: c.card.name, is_reversed: c.isReversed })),
                        interpretation: content,
                        query: 'weekly_fortune_5card'
                    });
                }
            } else {
                throw new Error("No response from AI");
            }

        } catch (err) {
            console.error(err);
            toast.error("AI 해석을 불러오는 데 실패했습니다. 다시 시도해주세요.");
            // Fallback content to ensure user sees something
            setReading(`
## 🔮 이번 주 테마
별들의 신호를 수신하는 중에 잠시 방해가 있었나 봐요. 하지만 걱정 마세요. ${drawnCards[0]?.card.koreanName} 카드는 당신에게 긍정적인 에너지를 보내고 있습니다.

## 📅 주간 흐름
* **월~수 (초반)**: 시작이 반입니다. 차분하게 계획을 점검해보세요.
* **목~금 (중반)**: 흐름을 타는 시기입니다. 자신감을 가지세요.
* **토~일 (말미)**: 휴식과 재충전이 필요한 시기입니다.

## ✨ 이번 주 조언
${drawnCards[4]?.card.koreanName} 카드는 당신이 이미 충분한 능력을 가지고 있음을 상기시켜 줍니다.
**🎯 실천 액션**: 잠시 눈을 감고 심호흡하며 나 자신을 믿어주기
            `);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        const element = document.getElementById('result-capture');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { backgroundColor: '#000000', scale: 2 });
            const dataUrl = canvas.toDataURL('image/png');

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'weekly_fortune.png', { type: 'image/png' });
                await navigator.share({
                    title: `이번 주 나의 운세 (${weeklyDate})`,
                    text: 'Aura Tarot에서 확인한 주간 운세입니다 ✨',
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.download = 'weekly_fortune.png';
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            toast.error("공유하기에 실패했습니다.");
        }
    };



    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-24 overflow-x-hidden relative selection:bg-gold/30">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-900/10 via-transparent to-transparent blur-3xl opacity-50" />
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:text-gold hover:bg-white/5">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-gold/60 flex items-center gap-1">
                        {weeklyDate} WEEKLY
                    </span>
                    <h1 className="font-display text-lg tracking-wider text-white">이번 주 나의 운세</h1>
                </div>
                <div className="w-10" />
            </div>

            <div className="pt-24 px-4 w-full max-w-7xl mx-auto h-full flex flex-col relative z-10">

                {step === "intro" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in min-h-[60vh] max-w-md mx-auto w-full">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gold/20 to-purple-500/20 flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_40px_rgba(218,165,32,0.15)] animate-pulse-slow">
                            <Calendar className="w-10 h-10 text-gold" />
                        </div>

                        <h2 className="text-4xl font-display text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gold/50 mb-4 leading-tight">
                            이번 주<br />나의 운세
                        </h2>

                        <p className="text-gray-400 mb-10 leading-relaxed font-light">
                            새로운 한 주, 어떤 에너지가 기다릴까요?<br />
                            함께 뽑아볼게요 ✨
                            <span className="block text-xs text-gold/60 mt-4 border-t border-white/5 pt-4 w-32 mx-auto">
                                {weeklyDate}
                            </span>
                        </p>

                        <Button
                            onClick={handleStart}
                            className="w-full max-w-xs h-14 bg-white text-black hover:bg-gold hover:text-white font-bold text-lg rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            이번 주 운세 뽑기
                        </Button>
                    </div>
                )}

                {step === "spread" && (
                    <div className="flex-1 flex flex-col justify-center animate-fade-in py-10 w-full">
                        <div className="text-center mb-10">
                            <span className="text-gold text-sm font-medium tracking-wider">5 CARDS SPREAD</span>
                            <h3 className="text-xl text-white font-light mt-2">이번 주를 위한 5장의 카드</h3>
                        </div>
                        <div className="w-full max-w-5xl mx-auto">
                            <SpreadLayout
                                cardCount={5}
                                onSpreadComplete={handleSpreadComplete}
                                instruction="신중하게 5장을 선택해주세요"
                            />
                        </div>
                    </div>
                )}

                {step === "reading" && (
                    <div className="animate-fade-in pb-10 max-w-md mx-auto w-full" id="result-capture">
                        {/* 5 Cards Display Grid */}
                        {/* Layout: Top(Theme) - Middle(3 Flow) - Bottom(Advice) */}
                        <div className="flex flex-col gap-6 mb-8">

                            {/* 1. Theme Card */}
                            <div className="flex justify-center">
                                {drawnCards[0] && (
                                    <div className="flex flex-col items-center gap-2 animate-scale-in w-1/3 min-w-[100px]">
                                        <span className="text-[10px] font-bold text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-500/30">전체 테마</span>
                                        <div className={`relative aspect-[2/3] w-full rounded-lg border border-purple-500/30 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.2)] ${drawnCards[0].isReversed ? 'rotate-180' : ''}`}>
                                            <img
                                                src={drawnCards[0].card.image}
                                                alt={drawnCards[0].card.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-xs text-white/80">{drawnCards[0].card.koreanName}</span>
                                    </div>
                                )}
                            </div>

                            {/* 2-4. Flow Cards */}
                            <div className="grid grid-cols-3 gap-2 relative">
                                {/* Connectors */}
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

                                {drawnCards.slice(1, 4).map((card, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 animate-scale-in" style={{ animationDelay: `${(idx + 1) * 0.15}s` }}>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            {idx === 0 ? "초반(월-수)" : idx === 1 ? "중반(목-금)" : "말미(토-일)"}
                                        </span>
                                        <div className={`relative aspect-[2/3] w-full rounded-lg border border-white/10 overflow-hidden shadow-lg ${card.isReversed ? 'rotate-180' : ''}`}>
                                            <img
                                                src={card.card.image}
                                                alt={card.card.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-[10px] text-white/70 truncate w-full text-center">{card.card.koreanName}</span>
                                    </div>
                                ))}
                            </div>

                            {/* 5. Advice Card */}
                            <div className="flex justify-center mt-2">
                                {drawnCards[4] && (
                                    <div className="flex flex-col items-center gap-2 animate-scale-in w-1/3 min-w-[100px]" style={{ animationDelay: '0.6s' }}>
                                        <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">✨ 조언</span>
                                        <div className={`relative aspect-[2/3] w-full rounded-lg border border-gold/50 overflow-hidden shadow-[0_0_20px_rgba(218,165,32,0.3)] ring-1 ring-gold/20 ${drawnCards[4].isReversed ? 'rotate-180' : ''}`}>
                                            <img
                                                src={drawnCards[4].card.image}
                                                alt={drawnCards[4].card.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
                                        </div>
                                        <span className="text-xs text-gold font-medium">{drawnCards[4].card.koreanName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reading Content */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[200px] relative overflow-hidden shadow-2xl">
                            {!user ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm z-10 transition-all duration-300">
                                    <Sparkles className="w-12 h-12 text-gold animate-pulse" />
                                    <p className="text-gray-300 font-medium">카드의 의미를 확인하려면 로그인이 필요합니다</p>
                                    <Button
                                        onClick={() => setShowLoginRequired(true)}
                                        className="bg-gold text-black hover:bg-gold/80 font-bold"
                                        variant="default"
                                    >
                                        로그인하고 결과 보기
                                    </Button>
                                </div>
                            ) : isLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                                    <p className="text-sm text-gray-400 animate-pulse">운세 데이터를 분석중입니다...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-p:text-sm prose-headings:text-gold prose-strong:text-white max-w-none">
                                    <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-sm md:text-base">
                                        {reading}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Guest Access Modals */}
                        <LoginRequiredModal
                            isOpen={showLoginRequired}
                            onClose={() => setShowLoginRequired(false)}
                            onShowLogin={() => {
                                setShowLoginRequired(false);
                                setShowLoginModal(true);
                            }}
                            message="주간 운세를 확인하려면 로그인이 필요합니다."
                        />
                        <LoginModal
                            isOpen={showLoginModal}
                            onClose={() => setShowLoginModal(false)}
                            onSwitchToRegister={() => {
                                setShowLoginModal(false);
                                setShowRegisterModal(true);
                            }}
                        />
                        <RegisterModal
                            isOpen={showRegisterModal}
                            onClose={() => setShowRegisterModal(false)}
                            onSwitchToLogin={() => {
                                setShowRegisterModal(false);
                                setShowLoginModal(true);
                            }}
                        />

                        {/* Action Buttons */}
                        {!isLoading && (
                            <div className="mt-8 space-y-3">
                                <Button
                                    onClick={() => {
                                        setStep('intro');
                                        setDrawnCards([]);
                                        setReading('');
                                    }}
                                    className="w-full h-14 bg-gold text-black hover:bg-gold/80 font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    한번 더 뽑기
                                </Button>
                                <div className="flex gap-3">
                                    <GlareButton
                                        onClick={handleShare}
                                        className="flex-1 bg-white text-black hover:bg-gray-200"
                                    >
                                        <Share2 className="w-5 h-5 mr-2" />
                                        공유하기
                                    </GlareButton>
                                    <GlareButton
                                        variant="outline"
                                        className="flex-1 border-white/20 hover:bg-white/10"
                                        onClick={async () => {
                                            const element = document.getElementById('result-capture');
                                            if (!element) return;
                                            try {
                                                const canvas = await html2canvas(element, { backgroundColor: '#0a0a0a', scale: 2 });
                                                const dataUrl = canvas.toDataURL('image/png');
                                                const link = document.createElement('a');
                                                link.download = 'weekly_fortune.png';
                                                link.href = dataUrl;
                                                link.click();
                                                toast.success("이미지가 저장되었습니다.");
                                            } catch (err) {
                                                toast.error("이미지 저장에 실패했습니다.");
                                            }
                                        }}
                                    >
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        이미지 저장
                                    </GlareButton>
                                </div>

                                <p className="text-center text-xs text-gray-500 mt-4">
                                    매주 월요일 00:00에 새로운 운세가 업데이트됩니다
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>


        </div>
    );
}

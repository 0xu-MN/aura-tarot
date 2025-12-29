import React, { useState, useEffect } from "react";
import { SpreadLayout } from "@/components/tarot/SpreadLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Share2, Sparkles, ChevronLeft, Loader2, Calendar, ArrowLeft } from 'lucide-react';
import { GlareButton } from '@/components/ui/GlareButton';
import { useNavigate } from "react-router-dom";
import { getRandomCards, TarotCardData } from "@/lib/tarot-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export default function MonthlyFortune() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<"intro" | "spread" | "reading">("intro");
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [reading, setReading] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // Calculate Monthly Date
    const getMonthlyDate = () => {
        const now = new Date();
        return `${now.getMonth() + 1}월`;
    };

    const monthlyDate = getMonthlyDate();

    // AI Interpretation Trigger
    useEffect(() => {
        if (step === "reading" && drawnCards.length > 0 && !reading && !isLoading) {
            generateReading();
        }
    }, [step, drawnCards]);

    const handleSpreadComplete = (indices: number[]) => {
        setIsLoading(true);
        // Draw 5 random cards: Theme, Early, Mid, Late, Advice
        const cards = getRandomCards(5);
        setDrawnCards(cards);
        setSelectedCards(indices);
        setStep("reading");
        setIsLoading(false);
    };

    const generateReading = async () => {
        setIsLoading(true);
        try {
            const prompt = `
당신은 신비로운 타로 리더 '소미'입니다.
사용자의 [${monthlyDate}] 월간 운세를 5장의 카드로 해석해주세요.

1. 전체 테마: ${drawnCards[0].card.koreanName} (${drawnCards[0].isReversed ? '역방향' : '정방향'})
2. 월초 (1일~10일): ${drawnCards[1].card.koreanName} (${drawnCards[1].isReversed ? '역방향' : '정방향'})
3. 월중 (11일~20일): ${drawnCards[2].card.koreanName} (${drawnCards[2].isReversed ? '역방향' : '정방향'})
4. 월말 (21일~말일): ${drawnCards[3].card.koreanName} (${drawnCards[3].isReversed ? '역방향' : '정방향'})
5. 이번 달 조언: ${drawnCards[4].card.koreanName} (${drawnCards[4].isReversed ? '역방향' : '정방향'})

사용자: ${user?.nickname || '방문자'}님

요청사항:
- 반말(친근한 말투) 사용
- 전체 테마 요약 (2~3문장)
- 각 시기별(초/중/말) 흐름 해석 (2~3문장)
- 조언 비중 있게 해석 + 구체적인 '이번 달 실천 액션' 1가지 제안
- 이모지 적절히 사용
- 마크다운 형식 사용

출력 형식:
## 🌕 이번 달 테마
(전체 요약)

## 📅 월간 흐름
* **월초 (1~10일)**: (해석)
* **월중 (11~20일)**: (해석)
* **월말 (21~말일)**: (해석)

## ✨ 이번 달 조언
(조언 해석)
**🎯 실천 액션**: (한 문장 액션)
`;

            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: {
                    message: prompt,
                    history: []
                }
            });

            if (error) throw error;

            let content = data.response;
            if (content) {
                content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

                setReading(content);

                if (user) {
                    await supabase.from('daily_readings').insert({
                        user_id: user.id,
                        reading_type: 'monthly',
                        // Store detailed card info so we can analyze history later if needed
                        cards: drawnCards.map(c => ({ name: c.card.name, is_reversed: c.isReversed })),
                        interpretation: content,
                        query: 'monthly_fortune_5card'
                    });
                }
            } else {
                setReading("별들의 메시지를 수신하지 못했어요. 트래픽이 많아 잠시 후 다시 시도해주세요.");
            }

        } catch (err) {
            console.error(err);
            toast.error("해석을 불러오는 중 문제가 발생했습니다.");
            setReading("별들의 메시지를 수신하지 못했어요. 잠시 후 다시 시도해주세요.");
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
                const file = new File([blob], 'monthly_fortune.png', { type: 'image/png' });
                await navigator.share({
                    title: `이번 달 나의 운세 (${monthlyDate})`,
                    text: 'Aura Tarot에서 확인한 월간 운세입니다 ✨',
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.download = 'monthly_fortune.png';
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            toast.error("공유하기에 실패했습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-white pb-24 overflow-x-hidden relative selection:bg-purple-500/30">
            {/* Background - Slightly different from Weekly (more deep blue/purple) */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050510] to-black" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent blur-3xl opacity-40" />
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '70px 70px' }} />
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:text-purple-300 hover:bg-white/5">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-purple-300/80 flex items-center gap-1">
                        {monthlyDate} MONTHLY
                    </span>
                    <h1 className="font-display text-lg tracking-wider text-white">이번 달 나의 운세</h1>
                </div>
                <div className="w-10" />
            </div>

            <div className="pt-24 px-4 w-full max-w-7xl mx-auto h-full flex flex-col relative z-10">

                {step === "intro" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in min-h-[60vh] max-w-md mx-auto w-full">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-pulse-slow">
                            <span className="text-4xl">🌕</span>
                        </div>

                        <h2 className="text-4xl font-display text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-purple-400/50 mb-4 leading-tight">
                            이번 달<br />나의 운세
                        </h2>

                        <p className="text-gray-400 mb-10 leading-relaxed font-light">
                            새로운 한 달, 어떤 흐름이 이어질까요?<br />
                            당신의 한 달을 미리 확인해보세요.
                            <span className="block text-xs text-purple-300/60 mt-4 border-t border-white/5 pt-4 w-32 mx-auto">
                                {monthlyDate}
                            </span>
                        </p>

                        <Button
                            onClick={() => setStep("spread")}
                            className="w-full max-w-xs h-14 bg-white text-black hover:bg-purple-100 font-bold text-lg rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        >
                            이번 달 운세 뽑기
                        </Button>
                    </div>
                )}

                {step === "spread" && (
                    <div className="flex-1 flex flex-col justify-center animate-fade-in py-10 w-full">
                        <div className="text-center mb-10">
                            <span className="text-purple-300 text-sm font-medium tracking-wider">MONTHLY SPREAD</span>
                            <h3 className="text-xl text-white font-light mt-2">이번 달을 위한 5장의 카드</h3>
                        </div>
                        <div className="w-full max-w-5xl mx-auto">
                            <SpreadLayout
                                cardCount={5}
                                onSpreadComplete={handleSpreadComplete}
                                instruction="깊게 심호흡하고 5장을 선택해주세요"
                            />
                        </div>
                    </div>
                )}

                {step === "reading" && (
                    <div className="animate-fade-in pb-10 max-w-md mx-auto w-full" id="result-capture">
                        {/* 5 Cards Display Grid */}
                        <div className="flex flex-col gap-6 mb-8">

                            {/* 1. Theme Card */}
                            <div className="flex justify-center">
                                {drawnCards[0] && (
                                    <div className="flex flex-col items-center gap-2 animate-scale-in w-1/3 min-w-[100px]">
                                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-500/30">전체 테마</span>
                                        <div className={`relative aspect-[2/3] w-full rounded-lg border border-indigo-500/30 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.2)] ${drawnCards[0].isReversed ? 'rotate-180' : ''}`}>
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

                            {/* 2-4. Flow Cards (Early, Mid, Late Month) */}
                            <div className="grid grid-cols-3 gap-2 relative">
                                {/* Connectors */}
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

                                {drawnCards.slice(1, 4).map((card, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 animate-scale-in" style={{ animationDelay: `${(idx + 1) * 0.15}s` }}>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            {idx === 0 ? "월초 (1-10)" : idx === 1 ? "월중 (11-20)" : "월말 (21-)"}
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
                                        <span className="text-[10px] font-bold text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-500/30">✨ 조언</span>
                                        <div className={`relative aspect-[2/3] w-full rounded-lg border border-purple-500/50 overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/20 ${drawnCards[4].isReversed ? 'rotate-180' : ''}`}>
                                            <img
                                                src={drawnCards[4].card.image}
                                                alt={drawnCards[4].card.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay" />
                                        </div>
                                        <span className="text-xs text-purple-300 font-medium">{drawnCards[4].card.koreanName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reading Content */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[200px] relative overflow-hidden shadow-2xl">
                            {isLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-400/50" />
                                    <p className="text-sm text-gray-400 animate-pulse">월간 운세 데이터를 분석중입니다...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-p:text-sm prose-headings:text-purple-300 prose-strong:text-white max-w-none">
                                    <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-sm md:text-base">
                                        {reading}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {!isLoading && (
                            <div className="mt-8 space-y-3">
                                <Button
                                    onClick={handleShare}
                                    className="w-full h-14 bg-gradient-to-r from-indigo-900 to-purple-900 text-white hover:from-indigo-800 hover:to-purple-800 font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 border border-white/10"
                                >
                                    <Share2 className="w-5 h-5" />
                                    이번 달 운세 저장하기
                                </Button>
                                <div className="flex gap-3">
                                    <GlareButton
                                        onClick={handleShare}
                                        className="flex-1 bg-gradient-to-r from-indigo-900 to-purple-900 text-white hover:from-indigo-800 hover:to-purple-800 border border-white/10"
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
                                                const canvas = await html2canvas(element, { backgroundColor: '#050510', scale: 2 });
                                                const dataUrl = canvas.toDataURL('image/png');
                                                const link = document.createElement('a');
                                                link.download = 'monthly_fortune.png';
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
                                    언제든 다시 확인하며 한 달을 계획해보세요
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

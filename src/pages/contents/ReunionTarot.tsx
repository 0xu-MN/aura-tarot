import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { ArrowLeft, Moon, Loader2, Share2, RefreshCw } from 'lucide-react';
import { getWeightedCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export function ReunionTarot() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<'intro' | 'question' | 'spread' | 'reading'>('intro');
    const [question, setQuestion] = useState('');
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [reading, setReading] = useState('');
    const [reunionChance, setReunionChance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = () => {
        setStep('question');
    };

    const handleQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) {
            toast.error("질문을 입력해주세요");
            return;
        }
        setStep('spread');
    };

    const handleSpreadComplete = (indices: number[]) => {
        setIsLoading(true);
        // Weighted selection: High chance of Cups (Emotion) and Swords (Conflict/Reason)
        const cards = getWeightedCards(4, { cups: 3, swords: 3, major: 1, wands: 1, pentacles: 1 });
        setDrawnCards(cards);
        setStep('reading');
        generateReading(cards);
    };

    const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
        try {
            const prompt = `
당신은 솔직하면서도 공감 능력이 뛰어난 타로 리더 '문'입니다.
사용자의 재회 관련 질문에 대해 [나의 감정, 상대방 속마음, 방해물, 재회 가능성] 4장으로 해석해주세요.

질문: ${question}

1. 나의 감정: ${cards[0].card.koreanName} (${cards[0].isReversed ? '역방향' : '정방향'})
2. 상대방 속마음: ${cards[1].card.koreanName} (${cards[1].isReversed ? '역방향' : '정방향'})
3. 방해물/장애물: ${cards[2].card.koreanName} (${cards[2].isReversed ? '역방향' : '정방향'})
4. 재회 가능성(결과): ${cards[3].card.koreanName} (${cards[3].isReversed ? '역방향' : '정방향'})

요청사항:
- 말투: 차분하고 진지하게 (해요체), 하지만 따뜻한 위로를 담아서.
- 재회 확률을 0~100 사이의 숫자로 판단해서 맨 마지막 줄에 "CHANCE: [숫자]" 형식을 꼭 포함해주세요.
  (예: CHANCE: 85)
- 솔직하게 해석하되, 가능성이 낮다면 어떻게 마음을 정리하거나 극복할지 조언해주세요.

출력 형식:
## 💭 나의 마음 vs 상대의 마음
(1, 2번 카드 통합 해석)

## 🚧 우리 사이의 벽
(3번 카드 해석)

## 🌙 재회 가능성
(4번 카드 해석과 전체적인 흐름)

## 💡 달의 조언
(구체적인 행동 지침)

CHANCE: [숫자]
`;
            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: { messages: [{ role: 'user', content: prompt }] }
            });

            if (error) throw error;

            let content = data.message || "";
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

            // Extract Chance
            const match = content.match(/CHANCE:\s*(\d+)/i);
            const chance = match ? parseInt(match[1], 10) : Math.floor(Math.random() * 60) + 20; // Default random if missing
            setReunionChance(chance);

            // Remove the CHANCE line from display
            content = content.replace(/CHANCE:\s*\d+/i, '').trim();

            setReading(content);
            setIsLoading(false);

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                try {
                    await supabase.from('daily_readings').insert({
                        user_id: currentUser.id,
                        question: question,
                        card_name: cards[0].card.name,
                        interpretation: content,
                        advice: "AI Reunion Tarot Reading",
                        is_reversed: cards[0].isReversed
                    });
                } catch (dbError) {
                    console.error("Failed to save reading (ReunionTarot):", dbError);
                }
            }

        } catch (err) {
            console.error(err);
            toast.error("해석을 불러오지 못했어요.");
            setReading("별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요.");
            setReunionChance(50);
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        const element = document.getElementById('result-capture');
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { backgroundColor: '#0f172a', scale: 2 });
            const dataUrl = canvas.toDataURL('image/png');
            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'reunion_tarot.png', { type: 'image/png' });
                await navigator.share({
                    title: `재회 확률 타로`,
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.download = 'reunion_tarot.png';
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            toast.error("공유 실패");
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900 to-black pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 px-4 py-4 flex items-center">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-300 hover:bg-white/5">
                        <ArrowLeft />
                    </Button>
                </div>

                <div className="max-w-2xl mx-auto px-6 relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center">

                    {step === 'intro' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="w-24 h-24 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                <Moon className="w-10 h-10 text-indigo-300 fill-indigo-300/30" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-slate-200 mb-4">
                                    재회 확률 타로
                                </h1>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    상대방의 진심, 그리고 다시 만날 가능성.<br />
                                    마주할 준비가 되셨나요? 💭
                                </p>
                            </div>
                            <Button onClick={handleStart} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0 h-12 rounded-full text-lg shadow-lg shadow-indigo-900/50">
                                속마음 알아보기
                            </Button>
                        </div>
                    )}

                    {step === 'question' && (
                        <form onSubmit={handleQuestionSubmit} className="w-full animate-fade-in space-y-6 max-w-md mx-auto">
                            <div>
                                <h2 className="text-2xl font-display text-white mb-2">무엇이 가장 궁금한가요?</h2>
                                <p className="text-sm text-slate-400">솔직한 질문이 가장 정확한 답을 줍니다</p>
                            </div>

                            {/* Recommended Questions */}
                            <div className="space-y-2">
                                <p className="text-xs text-indigo-300/50 font-medium ml-1">추천 질문</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {[
                                        "전 연인과 재회 가능성 있을까?",
                                        "상대가 나를 아직 좋아할까?",
                                        "재회 타이밍은 언제?",
                                        "상대 속마음이 뭐야?",
                                        "재회 성공 확률은?",
                                        "재회할지 말지 조언해줘",
                                        "헤어진 이유와 재회 팁"
                                    ].map((q, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setQuestion(q)}
                                            className="px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-200/80 text-xs hover:bg-indigo-500/20 hover:text-indigo-100 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="직접 입력하거나 위에서 선택하세요"
                                className="bg-white/5 border-indigo-500/30 text-center h-14 text-lg focus:border-indigo-500 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 rounded-full">
                                카드 뽑기
                            </Button>
                        </form>
                    )}

                    {step === 'spread' && (
                        <div className="w-full animate-fade-in">
                            <h3 className="text-slate-300 mb-8">당신의 마음을 담아<br />4장을 선택해주세요</h3>
                            <SpreadLayout
                                cardCount={4}
                                onSpreadComplete={handleSpreadComplete}
                                instruction=""
                            />
                        </div>
                    )}

                    {step === 'reading' && (
                        <div id="result-capture" className="w-full animate-fade-in pb-10">
                            {/* Cards Row */}
                            <div className="grid grid-cols-4 gap-2 mb-8 w-full max-w-xl mx-auto">
                                {drawnCards.map((card, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 animate-scale-in" style={{ animationDelay: `${idx * 0.15}s` }}>
                                        <div className={`w-full aspect-[2/3] rounded-lg border border-indigo-500/30 overflow-hidden shadow-lg ${card.isReversed ? 'rotate-180' : ''}`}>
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center p-0.5 bg-[url('/assets/tarot-back.png')] bg-cover">
                                                {/* Image fallback if needed, currently just name */}
                                                <span className="text-[8px] text-white/50">{card.card.name}</span>
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-indigo-300/80 truncate w-full text-center">
                                            {idx === 0 ? '나' : idx === 1 ? '상대' : idx === 2 ? '장애물' : '결과'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Gauge */}
                            <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-white/5 backdrop-blur-sm">
                                <h3 className="text-indigo-300 text-sm font-bold mb-4 uppercase tracking-wider text-center">Reunion Probability</h3>
                                {isLoading ? (
                                    <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden w-full relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 animate-pulse w-full"></div>
                                    </div>
                                ) : (
                                    <div className="relative pt-2">
                                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden w-full">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out rounded-full relative"
                                                style={{ width: `${reunionChance}%` }}
                                            >
                                                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50 shadow-[0_0_10px_white]"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs font-mono text-indigo-200/70">
                                            <span>0%</span>
                                            <span className="text-white font-bold text-lg -mt-6">{reunionChance}%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reading Content */}
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-indigo-500/10 text-left shadow-xl">
                                {isLoading ? (
                                    <div className="flex flex-col items-center py-10 gap-4">
                                        <Loader2 className="animate-spin text-indigo-400 w-8 h-8" />
                                        <p className="text-indigo-200/60 animate-pulse text-sm">별들이 운명을 계산하고 있습니다...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-indigo-200">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {reading}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isLoading && (
                                <div className="mt-8 flex justify-center gap-3">
                                    <Button onClick={() => {
                                        setStep('intro');
                                        setDrawnCards([]);
                                        setReading('');
                                        setReunionChance(0);
                                        setQuestion('');
                                    }} variant="ghost" className="text-slate-400 hover:text-white">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        다시하기
                                    </Button>
                                    <Button onClick={handleShare} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 rounded-full px-8 shadow-lg shadow-indigo-900/30">
                                        <Share2 className="w-4 h-4" />
                                        결과 저장
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}

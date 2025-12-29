import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { ArrowLeft, Heart, Loader2, Share2 } from 'lucide-react';
import { getWeightedCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { BetaLockOverlay } from '@/components/beta/BetaLockOverlay';

export function LoveTarot() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<'intro' | 'question' | 'spread' | 'reading'>('intro');
    // ... hooks ...

    // State definitions
    const [question, setQuestion] = useState('');
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [reading, setReading] = useState('');
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
        // Weighted selection: High chance of Cups (Emotion) and Major Arcana
        const cards = getWeightedCards(3, { cups: 5, major: 2, wands: 1, swords: 1, pentacles: 1 });
        setDrawnCards(cards);
        setStep('reading');
        generateReading(cards);
    };

    const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
        try {
            const prompt = `
                당신은 로맨틱하고 감성적인 타로 리더 '로즈'입니다.
                사용자의 연애 고민에 대해 [과거-현재-미래] 3장으로 해석해주세요.

                질문: ${question}

                1. 과거: ${cards[0].card.koreanName} (${cards[0].isReversed ? '역방향' : '정방향'})
                2. 현재: ${cards[1].card.koreanName} (${cards[1].isReversed ? '역방향' : '정방향'})
                3. 미래: ${cards[2].card.koreanName} (${cards[2].isReversed ? '역방향' : '정방향'})

                요청사항:
                - 말투: 부드럽고 다정하게 (해요체), 이모지 많이 사용 🌹💖
                - 부정적인 카드가 나와도 "이 시련이 더 깊은 사랑을 위한 과정"처럼 긍정적으로 승화해주세요.
                - 상대방의 감정을 깊이 있게 묘사해주세요.
                - 300자 내외로 핵심만 임팩트 있게.

                출력 형식:
                ## 💖 과거의 흐름
                (해석)

                ## 🌹 현재의 마음
                (해석)

                ## ✨ 우리의 미래
                (해석)

                ## 💌 로즈의 조언
                (한 마디 조언)
                `;
            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: { messages: [{ role: 'user', content: prompt }] }
            });

            if (error) throw error;

            let content = data.message || "";
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            setReading(content);
            setIsLoading(false);

            // Save reading history
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                try {
                    await supabase.from('daily_readings').insert({
                        user_id: currentUser.id,
                        question: question,
                        card_name: cards[0].card.name,
                        interpretation: content,
                        advice: "AI Love Tarot Reading",
                        is_reversed: cards[0].isReversed
                    });
                } catch (dbError) {
                    console.error("Failed to save reading (LoveTarot):", dbError);
                }
            }

        } catch (err) {
            console.error(err);
            toast.error("해석을 불러오지 못했어요.");
            setReading("별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요.");
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        const element = document.getElementById('result-capture');
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { backgroundColor: '#1a0b2e', scale: 2 });
            const dataUrl = canvas.toDataURL('image/png');
            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'love_tarot.png', { type: 'image/png' });
                await navigator.share({
                    title: `나의 연애운`,
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.download = 'love_tarot.png';
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            toast.error("공유 실패");
        }
    };

    return (
        <AppLayout>
            <BetaLockOverlay title="연애운 타로" />
            <div className="container mx-auto px-4 py-8 max-w-lg min-h-screen bg-[#1a0b2e] text-pink-50 pb-20 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-900/20 via-[#1a0b2e] to-black pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/stars.svg')] opacity-20 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 px-4 py-4 flex items-center">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-pink-200 hover:bg-pink-900/20">
                        <ArrowLeft />
                    </Button>
                </div>

                <div className="max-w-md mx-auto px-6 relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center">

                    {step === 'intro' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="w-24 h-24 mx-auto bg-pink-500/10 rounded-full flex items-center justify-center border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-pulse-slow">
                                <Heart className="w-10 h-10 text-pink-400 fill-pink-400/50" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-rose-400 mb-4">
                                    연애운 타로
                                </h1>
                                <p className="text-pink-200/60 leading-relaxed font-light">
                                    썸, 짝사랑, 연애 고민...<br />
                                    복잡한 마음의 답을 찾아줄게요 🌹
                                </p>
                            </div>
                            <Button onClick={handleStart} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 h-12 rounded-full text-lg shadow-lg shadow-pink-900/50">
                                지금 확인하기
                            </Button>
                        </div>
                    )}

                    {step === 'question' && (
                        <form onSubmit={handleQuestionSubmit} className="w-full animate-fade-in space-y-6">
                            <div>
                                <h2 className="text-2xl font-display text-pink-100 mb-2">가장 궁금한 것은?</h2>
                                <p className="text-sm text-pink-400/60">구체적으로 물어볼수록 정확해요</p>
                            </div>

                            {/* Recommended Questions */}
                            <div className="space-y-2">
                                <p className="text-xs text-pink-300/50 font-medium ml-1">추천 질문</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {[
                                        "오늘 연애운은 어때?",
                                        "썸 상대가 나를 좋아할까?",
                                        "짝사랑 성공 가능성 있어?",
                                        "데이트 운세 봐줘",
                                        "이상형 만날 타이밍은?",
                                        "연애운 좋게 만드는 팁은?",
                                        "현재 연애 상황 분석해줘"
                                    ].map((q, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setQuestion(q)}
                                            className="px-3 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-200/80 text-xs hover:bg-pink-500/20 hover:text-pink-100 transition-colors"
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
                                className="bg-white/5 border-pink-500/30 text-center h-14 text-lg focus:border-pink-500 focus:ring-pink-500/20 transition-all placeholder:text-pink-500/20"
                                autoFocus
                            />
                            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 h-12 rounded-full">
                                카드 뽑기
                            </Button>
                        </form>
                    )}

                    {step === 'spread' && (
                        <div className="w-full animate-fade-in">
                            <h3 className="text-pink-200 mb-8">과거, 현재, 미래를 생각하며<br />3장을 선택해주세요</h3>
                            <SpreadLayout
                                cardCount={3}
                                onSpreadComplete={handleSpreadComplete}
                                instruction=""
                            />
                        </div>
                    )}

                    {step === 'reading' && (
                        <div id="result-capture" className="w-full animate-fade-in pb-10">
                            <div className="flex justify-center gap-3 mb-8 perspective-1000">
                                {drawnCards.map((card, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 animate-scale-in" style={{ animationDelay: `${idx * 0.2}s` }}>
                                        <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">
                                            {idx === 0 ? 'PAST' : idx === 1 ? 'PRESENT' : 'FUTURE'}
                                        </span>
                                        <div className={`w-24 aspect-[2/3] rounded-lg border border-pink-500/30 overflow-hidden shadow-[0_0_15px_rgba(236,72,153,0.2)] ${card.isReversed ? 'rotate-180' : ''}`}>
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-center p-1 bg-[url('/assets/tarot-back.png')] bg-cover">
                                                <span className="text-[8px] text-white/50">{card.card.name}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-pink-200/80 truncate w-20">{card.card.koreanName}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-pink-500/20 text-left shadow-xl">
                                {isLoading ? (
                                    <div className="flex flex-col items-center py-10 gap-4">
                                        <Loader2 className="animate-spin text-pink-400 w-8 h-8" />
                                        <p className="text-pink-200/60 animate-pulse text-sm">장미빛 미래를 읽고 있어요...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-p:text-pink-100/90 prose-headings:text-pink-300">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {reading}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isLoading && (
                                <div className="mt-6 flex justify-center">
                                    <Button onClick={handleShare} variant="outline" className="border-pink-500/30 text-pink-300 hover:bg-pink-900/30 gap-2 rounded-full px-6">
                                        <Share2 className="w-4 h-4" />
                                        결과 공유하기
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

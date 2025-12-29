import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Sparkles, Share2, Download, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { getRandomCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';

export const StudentSupportTarot = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'spread' | 'result'>('intro');
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [aiReading, setAiReading] = useState('');
    const [healingTip, setHealingTip] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const question = "오늘 나를 응원하는 메시지는?";

    const handleStart = () => {
        setStep('spread');
    };

    const fetchAiReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
        setIsAnalyzing(true);
        try {
            const cardName = cards[0].card.koreanName;
            const orientation = cards[0].isReversed ? '역방향' : '정방향';

            // Construct a prompt context that guides the generic 'reading' type to behave as requested
            // We append the structure instructions to the question context.
            const promptContext = `
                질문: ${question}
                (학생/수험생을 위한 응원 타로입니다. 말투는 따뜻하고 부드럽게 해요.)
                
                다음 구조로 해석해주세요:
                1. [공감] "지친 마음이 느껴져요..." 같은 현재 마음 공감 (1문장)
                2. [의미] 카드의 의미를 긍정적으로 해석 (부정적인 카드도 성장의 기회로 긍정 전환) (1문장)
                3. [동기부여] 노력 인정과 앞으로의 응원 메시지 (2문장)
                4. [TIP] 카드의 조언에 맞는 구체적인 행동 팁 (예: 미지근한 물 마시기, 좋아하는 노래 듣기 등) (1문장)
                
                답변의 맨 마지막 줄에 반드시 "[TIP]" 이라는 태그를 붙이고 그 뒤에 팁 내용을 적어주세요.
            `;

            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: {
                    type: 'reading',
                    context: {
                        question: promptContext,
                        cards: cards.map(c => ({
                            name: c.card.name,
                            isReversed: c.isReversed
                        }))
                    }
                }
            });

            if (error) throw error;
            if (data?.message) {
                const fullMessage = data.message;
                // Parse Separator [TIP]
                const parts = fullMessage.split('[TIP]');
                if (parts.length > 1) {
                    setAiReading(parts[0].trim());
                    setHealingTip(parts[1].trim());
                } else {
                    setAiReading(fullMessage);
                    setHealingTip("오늘 정말 수고 많았어요. 잠깐 스트레칭하고 물 한 잔 마시며 쉬어가세요.");
                }
            }
        } catch (err) {
            console.error('Error fetching AI reading:', err);
            toast.error('AI 응원 메시지를 가져오는 중 오류가 발생했습니다.');
            setAiReading("오늘도 정말 수고 많았어요. 당신의 노력은 반드시 빛을 발할 거예요!");
            setHealingTip("잠시 눈을 감고 1분만 명상을 해보세요.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSpreadComplete = (indices: number[]) => {
        const newDrawnCards = getRandomCards(1);
        setDrawnCards(newDrawnCards);

        // Start fetching reading immediately
        fetchAiReading(newDrawnCards);

        setTimeout(() => {
            setStep('result');
        }, 1000);
    };

    const handleReveal = () => {
        setIsRevealed(true);
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium mb-3">
                        <BookOpen className="w-4 h-4" />
                        <span>수험생 응원 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        오늘도 수고한 너에게
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        공부하느라 힘든 하루였죠? 타로가 작은 응원 보낼게요 ✨
                    </p>
                </div>

                {/* Intro Step */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-8 animate-fade-in py-10">
                        <div className="w-40 h-40 mx-auto rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-gold/10 opacity-50" />
                            <img src="/lovable-uploads/c7c9431e-1510-4ed3-8a3c-5b2344799015.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <Sparkles className="w-12 h-12 text-gold animate-pulse relative z-10" />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-white">매일 한 장, 나를 위한 응원</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                성적, 진로, 불안한 미래...<br />
                                혼자 고민하지 마세요.<br />
                                당신의 노력은 결코 헛되지 않아요.
                            </p>
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12 h-14 text-lg" onClick={handleStart}>
                            오늘의 응원 카드 뽑기
                        </Button>

                        <p className="text-xs text-muted-foreground/50">
                            * 매일 1회 무료로 제공됩니다
                        </p>
                    </div>
                )}

                {/* Spread Step */}
                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={1}
                            instruction="마음을 가라앉히고 한 장을 선택해주세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && (
                    <div className="w-full max-w-2xl animate-fade-in pb-20">
                        <div className="flex flex-col items-center mb-10">
                            <div onClick={handleReveal} className="cursor-pointer transition-transform hover:scale-105 mb-6">
                                <TarotCard
                                    size="lg"
                                    isFlipped={isRevealed}
                                    isReversed={drawnCards[0]?.isReversed}
                                    frontImage={drawnCards[0]?.card.image}
                                    interactive={false}
                                />
                            </div>

                            {!isRevealed ? (
                                <p className="text-gold animate-pulse text-lg font-medium">카드를 터치해서 뒤집어보세요</p>
                            ) : (
                                <div className="text-center animate-fade-in">
                                    <h2 className="font-display text-2xl text-gold mb-1">
                                        {drawnCards[0].card.koreanName}
                                        {drawnCards[0].isReversed && <span className="text-sm ml-2 text-muted-foreground">(역방향)</span>}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">{drawnCards[0].card.name}</p>
                                </div>
                            )}
                        </div>

                        {isRevealed && (
                            <div className="space-y-6 animate-slide-up bg-card/40 backdrop-blur-sm p-8 rounded-3xl border border-gold/10">
                                <div id="student-result-content" className="space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        TO. 빛나는 너에게 <Sparkles className="w-5 h-5 text-gold" />
                                    </h3>

                                    {isAnalyzing ? (
                                        <div className="py-8 text-center space-y-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
                                            <p className="text-sm text-muted-foreground">따뜻한 응원의 메시지를 적고 있어요...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <p className="text-lg leading-loose text-white/90 whitespace-pre-line">
                                                {aiReading}
                                            </p>

                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                                                <span className="text-xl">🌿</span>
                                                <div>
                                                    <p className="font-bold text-emerald-400 text-sm mb-1">오늘의 힐링 팁</p>
                                                    <p className="text-sm text-emerald-100/80">{healingTip || "오늘 정말 수고 많았어요. 잠깐 스트레칭하고 물 한 잔 마시며 쉬어가세요."}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!isAnalyzing && (
                                    <div className="pt-4 space-y-3">
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('student-result-content', 'aura-student-support')}>
                                                <Download className="w-4 h-4 mr-2" /> 저장
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={() => shareResult('오늘의 응원 타로', '오늘 나를 위한 타로 응원 메시지예요!')}>
                                                <Share2 className="w-4 h-4 mr-2" /> 공유
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            className="w-full text-muted-foreground hover:text-white"
                                            onClick={() => {
                                                setStep('intro');
                                                setDrawnCards([]);
                                                setIsRevealed(false);
                                                setAiReading('');
                                                setHealingTip('');
                                            }}
                                        >
                                            처음으로 돌아가기
                                        </Button>
                                    </div>
                                )}

                                <p className="text-xs text-center text-muted-foreground/40 pt-4 border-t border-white/5">
                                    타로는 힐링과 재미를 위한 것입니다. 실제 성적은 당신의 노력에 달려 있어요.<br />
                                    믿음을 가지고 끝까지 화이팅!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

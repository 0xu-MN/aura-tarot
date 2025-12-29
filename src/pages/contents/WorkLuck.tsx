import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Sparkles, Share2, Download, Loader2, Briefcase, Coffee, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getRandomCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';

export const WorkLuck = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'question' | 'spread' | 'result'>('intro');
    const [selectedQuestion, setSelectedQuestion] = useState<string>("");
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [aiReading, setAiReading] = useState('');
    const [workMission, setWorkMission] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const questions = [
        "오늘 직장운 어때?",
        "내일 회의 잘 될까?",
        "이직 타이밍은?",
        "상사/동료 관계 조언"
    ];

    const handleStart = () => {
        setStep('question');
    };

    const handleQuestionSelect = (q: string) => {
        setSelectedQuestion(q);
        setStep('spread');
    };

    const fetchAiReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
        setIsAnalyzing(true);
        try {
            const cardName = cards[0].card.koreanName;
            const orientation = cards[0].isReversed ? '역방향' : '정방향';

            // Construct a prompt context
            const promptContext = `
                질문: ${selectedQuestion}
                (직장인을 위한 하루 한 장 위로 타로입니다. 힐링과 실질적인 조언 위주로 20~40대 직장인에게 말하듯 편안하게 해주세요.)
                
                카드: ${cardName} (${orientation})
                
                다음 구조로 해석해주세요:
                1. [도입] 질문의 의도에 맞춰 자연스럽게 시작해주세요. 
                   - '어때?', '될까?', '타이밍' 등 미래/예측 질문이면: 긍정적인 에너지나 흐름 예고로 시작 (예: "오늘 하루는 ~한 흐름이 느껴지네요!")
                   - '조언', '힘듦' 등 위로 질문이면: "오늘도 고생 많으셨어요" 같은 공감으로 시작
                2. [해석] 카드의 핵심 의미를 질문에 맞춰 해석 (부정적인 카드도 긍정적/희망적으로 전환)
                3. [조언] 실질적이고 구체적인 행동 가이드 또는 마인드셋 제안 (2문장)
                4. [MISSION] 카드 운세에 맞는 '오늘의 퇴근 미션' (예: 맛있는 저녁 먹기, 일찍 잠들기, 친구에게 연락하기 등) (1문장)
                
                답변의 맨 마지막 줄에 반드시 "[MISSION]" 이라는 태그를 붙이고 그 뒤에 미션 내용을 적어주세요.
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
                const parts = fullMessage.split('[MISSION]');
                if (parts.length > 1) {
                    setAiReading(parts[0].trim());
                    setWorkMission(parts[1].trim());
                } else {
                    setAiReading(fullMessage);
                    setWorkMission("오늘은 야근 금지! 일찍 퇴근해서 좋아하는 것을 하며 푹 쉬세요.");
                }
            }
        } catch (err) {
            console.error('Error fetching AI reading:', err);
            toast.error('AI 조언을 가져오는 중 오류가 발생했습니다.');
            // Fallback content
            setAiReading("오늘도 치열한 하루 보내느라 고생 많으셨어요. \n이 카드는 잠시 멈춤이 필요하다는 신호일 수 있어요. \n내일은 더 좋은 기운이 함께할 테니, 오늘은 걱정을 내려놓고 푹 쉬세요. \n당신의 능력은 이미 충분히 빛나고 있습니다.");
            setWorkMission("좋아하는 음악을 들으며 퇴근길 산책하기");
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
            <div className="container px-4 py-8 min-h-[80vh] flex flex-col items-center w-full max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium mb-3">
                        <Briefcase className="w-4 h-4" />
                        <span>직장인 힐링 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        오늘도 수고한 직장인에게
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        회사에서 힘든 하루였죠? 타로가 작은 위로와 내일 힘을 줄게요 🌙
                    </p>
                </div>

                {/* Intro Step */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-8 animate-fade-in py-10">
                        <div className="w-40 h-40 mx-auto rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-gold/10 opacity-50" />
                            <Coffee className="w-16 h-16 text-gold/80 relative z-10" />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-white">퇴근길, 나를 위한 작은 위로</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                잦은 야근, 상사와의 갈등, <br />
                                왠지 모를 불안감까지.<br />
                                오늘 하루도 버텨낸 당신을 응원합니다.
                            </p>
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12 h-14 text-lg" onClick={handleStart}>
                            오늘의 직장운 보기
                        </Button>

                        <p className="text-xs text-muted-foreground/50">
                            * 매일 1회 무료로 제공됩니다
                        </p>
                    </div>
                )}

                {/* Question Selection Step */}
                {step === 'question' && (
                    <div className="max-w-md w-full animate-fade-in py-6">
                        <h3 className="text-xl text-center text-white mb-8">가장 궁금한 것은 무엇인가요?</h3>
                        <div className="space-y-3">
                            {questions.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuestionSelect(q)}
                                    className="w-full p-4 rounded-xl bg-card border border-gold/10 hover:border-gold/50 hover:bg-gold/5 transition-all text-left group flex items-center justify-between"
                                >
                                    <span className="text-white/90 group-hover:text-gold transition-colors">{q}</span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Spread Step */}
                {step === 'spread' && (
                    <div className="w-full max-w-5xl animate-fade-in">
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
                                <div id="work-result-content" className="space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        TO. 묵묵히 빛나는 당신에게 <Sparkles className="w-5 h-5 text-gold" />
                                    </h3>

                                    <div className="text-sm text-gold/60 mb-2">
                                        Q. {selectedQuestion}
                                    </div>

                                    {isAnalyzing ? (
                                        <div className="py-8 text-center space-y-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
                                            <p className="text-sm text-muted-foreground">당신을 위한 위로와 조언을 적고 있어요...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <p className="text-lg leading-loose text-white/90 whitespace-pre-line animate-fade-in">
                                                {aiReading}
                                            </p>

                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in delay-200">
                                                <span className="text-xl">☕</span>
                                                <div>
                                                    <p className="font-bold text-blue-400 text-sm mb-1">오늘의 퇴근 미션</p>
                                                    <p className="text-sm text-blue-100/80">{workMission || "오늘은 야근 금지! 일찍 퇴근해서 좋아하는 것을 하며 푹 쉬세요."}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!isAnalyzing && (
                                    <div className="pt-4 space-y-3">
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('work-result-content', 'aura-work-support')}>
                                                <Download className="w-4 h-4 mr-2" /> 저장
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={() => shareResult('직장인 위로 타로', '오늘 나를 위한 타로 위로 메시지예요!')}>
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
                                                setWorkMission('');
                                                setSelectedQuestion('');
                                            }}
                                        >
                                            처음으로 돌아가기
                                        </Button>
                                    </div>
                                )}

                                <p className="text-xs text-center text-muted-foreground/40 pt-4 border-t border-white/5">
                                    타로는 힐링과 재미를 위한 것입니다. 힘든 일은 가볍게 털어버리세요.<br />
                                    내일은 분명 더 좋은 일이 생길 거예요!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

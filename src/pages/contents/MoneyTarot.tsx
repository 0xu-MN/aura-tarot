import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Coins, Lock, Sparkles, RefreshCw, Share2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';
import { getRandomCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';


const FEATURE_ID = 'money-tarot';

export const MoneyTarot = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [question, setQuestion] = useState('');
    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);
    const [aiReading, setAiReading] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Load persisted state on mount
    useEffect(() => {
        const saved = premiumStore.getFeatureState(FEATURE_ID);
        if (saved.hasPaid && premiumStore.isPaid(FEATURE_ID)) {
            setHasPaid(true);
        }

        if (saved.readingState) {
            const {
                step: savedStep,
                question: savedQuestion,
                selectedCardIndices: savedIndices,
                revealedCards: savedRevealed,
                drawnCards: savedDrawn,
                aiReading: savedAiReading
            } = saved.readingState;

            if (savedStep) setStep(savedStep);
            if (savedQuestion) setQuestion(savedQuestion);
            if (savedIndices) setSelectedCardIndices(savedIndices);
            if (savedRevealed) setRevealedCards(savedRevealed);
            if (savedDrawn) setDrawnCards(savedDrawn);
            if (savedAiReading) setAiReading(savedAiReading);
        }
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (step !== 'intro') {
            premiumStore.saveReadingState(FEATURE_ID, {
                step,
                question,
                selectedCardIndices,
                revealedCards,
                drawnCards,
                aiReading
            });
        }
    }, [step, question, selectedCardIndices, revealedCards, drawnCards, aiReading]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!question.trim()) {
            toast.error('금전 고민을 입력해주세요!');
            return;
        }
        if (question.length < 10) {
            toast.error('내용을 더 구체적으로 적어주세요', {
                description: '정확한 금전운 분석을 위해 최소 10자 이상 입력해주세요.'
            });
            return;
        }

        if (hasPaid) {
            setStep('spread');
        } else {
            setStep('payment-check');
        }
    };

    const handleUnlock = () => {
        setHasPaid(true);
        setStep('spread');
    };

    const fetchAiReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
        setIsAnalyzing(true);
        try {
            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: {
                    type: 'reading',
                    context: {
                        question: question,
                        cards: cards.map(c => ({
                            name: c.card.name,
                            isReversed: c.isReversed
                        })),
                        username: user?.nickname || '방문자'
                    }
                }
            });

            if (error) throw error;
            if (data?.message) {
                setAiReading(data.message);
            }
        } catch (err) {
            console.error('Error fetching AI reading:', err);
            toast.error('AI 리딩을 가져오는 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSpreadComplete = (indices: number[]) => {
        const newDrawnCards = getRandomCards(3);
        setDrawnCards(newDrawnCards);
        setSelectedCardIndices(indices);

        fetchAiReading(newDrawnCards);

        setTimeout(() => {
            setStep('result');
        }, 1000);
    };

    const handleReveal = (index: number) => {
        if (!revealedCards.includes(index)) {
            setRevealedCards([...revealedCards, index]);
        }
    };



    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-sm font-medium mb-3">
                        <Coins className="w-4 h-4" />
                        <span>금전·재물운 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        흐르는 재물의 길목
                    </h1>
                </div>

                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            막힌 금전운을 뚫고 재물을 불러들이는 비책이 필요하신가요?<br />
                            현재의 자금 흐름과 앞으로의 투자, 횡재수까지<br />
                            3장의 카드로 당신의 재물 지도를 완성해 드립니다.
                        </p>
                        <Button size="lg" variant="gold" className="px-12" onClick={handleStart}>
                            금전운 분석 시작
                        </Button>
                    </div>
                )}

                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">
                                구체적인 금전 고민을 입력해주세요
                            </label>
                            <Textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="예: 이번 달은 지출이 많을까요? 새로운 투자를 시작해도 될까요?"
                                className="min-h-[100px] bg-card/50 px-4 py-3"
                            />
                        </div>
                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            황금 카드 뽑기
                        </Button>
                    </div>
                )}

                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">프리미엄 재물운 심층 리딩</h2>
                            <p className="text-muted-foreground">
                                현재 자금 기류와 장애물 분석은 물론,<br />
                                구체적인 재물 증식 시나리오를 제공합니다.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 금전운 확인하기
                        </Button>
                    </div>
                )}

                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={3}
                            instruction="나의 재물운을 생각하며 3장의 카드를 골라주세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {['현재의 재물운', '금전적 장애물', '미래의 결실'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-4">{label}</h4>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="lg"
                                            isFlipped={revealedCards.includes(i)}
                                            isReversed={drawnCards[i]?.isReversed}
                                            frontImage={drawnCards[i]?.card.image}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && drawnCards[i] && (
                                        <div className="mt-4 text-center animate-fade-in">
                                            <h4 className="font-display text-lg text-gold">
                                                {drawnCards[i].card.koreanName}
                                                {drawnCards[i].isReversed && <span className="text-xs ml-1 text-mystic-purple">(역방향)</span>}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">{drawnCards[i].card.name}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 3 && (
                            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 animate-fade-in">
                                <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    AI 재물운 리딩 결과
                                </h3>

                                <div id="money-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl">
                                        <h4 className="font-bold text-gold mb-2">Q. {question}</h4>
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                                <p className="text-sm text-muted-foreground animate-pulse">AI 마스터가 금전의 흐름을 분석하고 있습니다...</p>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {aiReading || '리딩 결과를 불러올 수 없습니다.'}
                                            </p>
                                        )}
                                    </div>

                                    {!isAnalyzing && aiReading && (
                                        <div className="space-y-3 pt-4">
                                            <div className="flex gap-3">
                                                <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('money-result-content', 'aura-money-tarot')}>
                                                    <Download className="w-4 h-4 mr-2" /> 저장
                                                </Button>
                                                <Button variant="outline" className="flex-1" onClick={() => shareResult('금전운 타로 결과', '제 금전운 리딩 결과를 확인해보세요!')}>
                                                    <Share2 className="w-4 h-4 mr-2" /> 공유
                                                </Button>
                                            </div>

                                        </div>
                                    )}

                                    <Button
                                        variant="ghost"
                                        className="w-full mt-4 border border-gold/30 hover:bg-gold/10"
                                        onClick={() => {
                                            premiumStore.resetFeature(FEATURE_ID);
                                            setHasPaid(false);
                                            setStep('input');
                                            setSelectedCardIndices([]);
                                            setRevealedCards([]);
                                            setDrawnCards([]);
                                            setAiReading('');
                                        }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        한번 더 뽑기
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName="금전운 타로 프리미엄"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

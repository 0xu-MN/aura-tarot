import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult, captureResultAsDataURL } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Heart, Lock, Sparkles, User, RefreshCw, Share2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';
import { TAROT_CARDS, getRandomCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';

const FEATURE_ID = 'love-tarot';

export const LoveTarot = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [question, setQuestion] = useState('');
    const [partnerInfo, setPartnerInfo] = useState('');
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
                partnerInfo: savedPartner,
                selectedCardIndices: savedIndices,
                revealedCards: savedRevealed,
                drawnCards: savedDrawn,
                aiReading: savedAiReading
            } = saved.readingState;

            if (savedStep) setStep(savedStep);
            if (savedQuestion) setQuestion(savedQuestion);
            if (savedPartner) setPartnerInfo(savedPartner);
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
                partnerInfo,
                selectedCardIndices,
                revealedCards,
                drawnCards,
                aiReading
            });
        }
    }, [step, question, partnerInfo, selectedCardIndices, revealedCards, drawnCards, aiReading]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!question.trim()) {
            toast.error('질문을 입력해주세요!');
            return;
        }
        if (question.length < 10) {
            toast.error('내용을 더 구체적으로 적어주세요', {
                description: '정확한 분석을 위해 최소 10자 이상 입력해주세요.'
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
                        question: `${question}${partnerInfo ? ` (상대방 정보: ${partnerInfo})` : ''}`,
                        cards: cards.map(c => ({
                            name: c.card.name,
                            isReversed: c.isReversed
                        }))
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

        // Start fetching reading immediately
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

    const handleShareToLounge = async () => {
        try {
            const dataUrl = await captureResultAsDataURL('love-result-content');
            if (dataUrl) {
                navigate('/lounge', {
                    state: {
                        autoOpenCreate: true,
                        attachedImage: dataUrl,
                        initialTitle: `${question}에 대한 AI 타로 결과`,
                        initialContent: `오늘 본 연애운 타로 결과입니다. #타로 #연애운`
                    }
                });
            }
        } catch (error) {
            console.error('Error sharing to lounge:', error);
            toast.error('라운지 공유 중 오류가 발생했습니다.');
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 text-sm font-medium mb-3">
                        <Heart className="w-4 h-4 fill-current" />
                        <span>연애운 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        사랑의 흐름을 읽다
                    </h1>
                </div>

                {/* Intro Step */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            당신의 연애, 썸, 혹은 짝사랑에 대한 깊은 통찰이 필요하신가요?<br />
                            과거, 현재, 미래를 아우르는 3장의 켈틱 크로스 약식 스프레드로<br />
                            관계의 흐름과 조언을 명쾌하게 풀어드립니다.
                        </p>

                        <div className="grid grid-cols-3 gap-4 my-8">
                            {['과거의 원인', '현재의 상황', '미래의 흐름'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-gold/20">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-display text-gold font-bold text-lg">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12" onClick={handleStart}>
                            무료로 시작하기 <span className="ml-1 text-xs opacity-70">(맛보기)</span>
                        </Button>
                    </div>
                )}

                {/* Input Step */}
                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">
                                궁금한 점을 구체적으로 적어주세요
                            </label>
                            <Textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="예: 썸타는 그 사람과 연인으로 발전할 수 있을까요?"
                                className="min-h-[100px] bg-card/50 resize-none px-4 py-3"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                                <User className="w-4 h-4 text-gold" />
                                상대방 정보 (선택사항)
                            </label>
                            <Textarea
                                value={partnerInfo}
                                onChange={(e) => setPartnerInfo(e.target.value)}
                                placeholder="예: 이름 초성(K), 나이, 혹은 별자리 등"
                                className="min-h-[60px] bg-card/50 resize-none px-4 py-3"
                            />
                        </div>

                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            타로 카드 뽑기
                        </Button>
                    </div>
                )}

                {/* Payment Check Step */}
                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>

                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">
                                프리미엄 상세 분석
                            </h2>
                            <p className="text-muted-foreground">
                                질문에 대한 심층적인 3장 스프레드 해석과<br />
                                AI의 맞춤형 조언을 확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 전체 결과 확인하기
                        </Button>

                        <p className="text-xs text-muted-foreground/60">
                            * 커피 한 잔 값보다 저렴한 가격으로 운명을 확인하세요
                        </p>
                    </div>
                )}

                {/* Spread Step */}
                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={3}
                            instruction="과거, 현재, 미래를 생각하며 3장을 뽑아주세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {['과거: 원인', '현재: 상황', '미래: 흐름'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4">{label}</h3>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="lg"
                                            isFlipped={revealedCards.includes(i)}
                                            isReversed={drawnCards[i]?.isReversed}
                                            frontImage={undefined}
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
                                    AI 심층 리딩 결과
                                </h3>

                                <div id="love-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl">
                                        <h4 className="font-bold text-gold mb-2">Q. {question}</h4>
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                                <p className="text-sm text-muted-foreground animate-pulse">AI 마스터가 카드를 분석하고 있습니다...</p>
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
                                                <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('love-result-content', 'aura-love-tarot')}>
                                                    <Download className="w-4 h-4 mr-2" /> 저장
                                                </Button>
                                                <Button variant="outline" className="flex-1" onClick={() => shareResult('연애운 타로 결과', '제 연애운 결과를 확인해보세요!')}>
                                                    <Share2 className="w-4 h-4 mr-2" /> 공유
                                                </Button>
                                            </div>
                                            <Button
                                                className="w-full bg-mystic-purple/20 hover:bg-mystic-purple/30 border border-mystic-purple/40 text-white"
                                                onClick={handleShareToLounge}
                                            >
                                                <Share2 className="w-4 h-4 mr-2" /> 라운지에 공유하여 자랑하기
                                            </Button>
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

                        {revealedCards.length < 3 && (
                            <div className="text-center mt-8 animate-pulse text-muted-foreground">
                                카드를 터치하여 뒤집어보세요
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName="연애운 타로 프리미엄"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

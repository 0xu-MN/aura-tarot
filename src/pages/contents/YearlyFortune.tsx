import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult, captureResultAsDataURL } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Calendar, Lock, Sparkles, RefreshCw, Share2, Download, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';
import { getRandomCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';

const FEATURE_ID = 'yearly-fortune';

export const YearlyFortune = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [name, setName] = useState('');
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
                name: savedName,
                selectedCardIndices: savedIndices,
                revealedCards: savedRevealed,
                drawnCards: savedDrawn,
                aiReading: savedAiReading
            } = saved.readingState;

            if (savedStep) setStep(savedStep);
            if (savedName) setName(savedName);
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
                name,
                selectedCardIndices,
                revealedCards,
                drawnCards,
                aiReading
            });
        }
    }, [step, name, selectedCardIndices, revealedCards, drawnCards, aiReading]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!name.trim()) {
            toast.error('이름을 입력해주세요!');
            return;
        }
        if (name.length < 2) {
            toast.error('이름은 2자 이상 입력해주세요.');
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
                        question: `${name}님의 2026년 신년 운세는 어떤가요? (사계절 중심)`,
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
        const newDrawnCards = getRandomCards(4);
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

    const handleShareToLounge = async () => {
        try {
            const dataUrl = await captureResultAsDataURL('yearly-result-content');
            if (dataUrl) {
                navigate('/lounge', {
                    state: {
                        autoOpenCreate: true,
                        attachedImage: dataUrl,
                        initialTitle: `${name}님의 2026년 AI 신년운세 결과`,
                        initialContent: `오늘 본 2026년 AI 신년운세 결과입니다. #타로 #신년운세 #2026`
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>신년 종합 운세</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        2026년 운명의 흐름
                    </h1>
                </div>

                {/* Steps logic */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            다가오는 한 해, 당신에게는 어떤 일들이 기다리고 있을까요?<br />
                            봄, 여름, 가을, 겨울 사계절의 흐름을 4장의 카드로 분석하여<br />
                            성공과 행복을 위한 종합 가이드를 제시해 드립니다.
                        </p>
                        <Button size="lg" variant="gold" className="px-12" onClick={handleStart}>
                            신년운세 시작하기
                        </Button>
                    </div>
                )}

                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                                <User className="w-4 h-4 text-gold" />
                                이름을 입력해주세요
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="홍길동"
                                className="bg-card/50 px-4 py-2 h-12"
                            />
                        </div>
                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            운세 카드 뽑기
                        </Button>
                    </div>
                )}

                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">2026년 정밀 총운</h2>
                            <p className="text-muted-foreground">
                                분기별 핵심 키워드와 조언, 그리고<br />
                                행운을 가져다줄 '올해의 카드'를 확인하세요.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 신년 총운 보기
                        </Button>
                    </div>
                )}

                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={4}
                            instruction="나의 2026년을 상상하며 4장의 카드를 골라주세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {['봄 (1-3월)', '여름 (4-6월)', '가을 (7-9월)', '겨울 (10-12월)'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h4 className="text-xs text-muted-foreground mb-2">{label}</h4>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="sm"
                                            isFlipped={revealedCards.includes(i)}
                                            isReversed={drawnCards[i]?.isReversed}
                                            frontImage={drawnCards[i]?.card.image}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && drawnCards[i] && (
                                        <div className="mt-2 text-center animate-fade-in">
                                            <span className="text-sm font-medium text-gold">
                                                {drawnCards[i].card.koreanName}
                                                {drawnCards[i].isReversed && <span className="text-[10px] ml-1 opacity-70">(역)</span>}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 4 && (
                            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 animate-fade-in">
                                <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    {name}님의 2026년 운세 리포트
                                </h3>

                                <div id="yearly-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl">
                                        <h4 className="font-bold text-gold mb-2">총괄적 분석</h4>
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                                <p className="text-sm text-muted-foreground animate-pulse">AI 마스터가 한 해의 운명을 엮고 있습니다...</p>
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
                                                <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('yearly-result-content', 'aura-yearly-fortune')}>
                                                    <Download className="w-4 h-4 mr-2" /> 저장
                                                </Button>
                                                <Button variant="outline" className="flex-1" onClick={() => shareResult('신년 총운 결과', `${name}님의 2026년 운세 결과를 확인해보세요!`)}>
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
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName="신년 총운 프리미엄"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult, captureResultAsDataURL } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Users, Lock, Sparkles, RefreshCw, Share2, Download, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';
import { getRandomCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';

const FEATURE_ID = 'compatibility-tarot';

export const CompatibilityTarot = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [myName, setMyName] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);
    const [score, setScore] = useState(0);
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
                myName: savedMyName,
                partnerName: savedPartnerName,
                selectedCardIndices: savedIndices,
                revealedCards: savedRevealed,
                drawnCards: savedDrawn,
                aiReading: savedAiReading,
                score: savedScore
            } = saved.readingState;

            if (savedStep) setStep(savedStep);
            if (savedMyName) setMyName(savedMyName);
            if (savedPartnerName) setPartnerName(savedPartnerName);
            if (savedIndices) setSelectedCardIndices(savedIndices);
            if (savedRevealed) setRevealedCards(savedRevealed);
            if (savedDrawn) setDrawnCards(savedDrawn);
            if (savedAiReading) setAiReading(savedAiReading);
            if (savedScore) setScore(savedScore);
        }
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (step !== 'intro') {
            premiumStore.saveReadingState(FEATURE_ID, {
                step,
                myName,
                partnerName,
                selectedCardIndices,
                revealedCards,
                drawnCards,
                aiReading,
                score
            });
        }
    }, [step, myName, partnerName, selectedCardIndices, revealedCards, drawnCards, aiReading, score]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!myName.trim() || !partnerName.trim()) {
            toast.error('두 분의 이름을 모두 입력해주세요!');
            return;
        }
        if (myName.length < 2 || partnerName.length < 2) {
            toast.error('이름을 정확히 입력해주세요.');
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
                        question: `${myName}님과 ${partnerName}님의 궁합은 어떤가요?`,
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
        const newDrawnCards = getRandomCards(5);
        setDrawnCards(newDrawnCards);
        setSelectedCardIndices(indices);

        fetchAiReading(newDrawnCards);

        setTimeout(() => {
            setStep('result');
            setScore(Math.floor(Math.random() * 31) + 70); // 70-100 score
        }, 1000);
    };

    const handleReveal = (index: number) => {
        if (!revealedCards.includes(index)) {
            setRevealedCards([...revealedCards, index]);
        }
    };

    const handleShareToLounge = async () => {
        try {
            const dataUrl = await captureResultAsDataURL('compatibility-result-content');
            if (dataUrl) {
                navigate('/lounge', {
                    state: {
                        autoOpenCreate: true,
                        attachedImage: dataUrl,
                        initialTitle: `${myName} & ${partnerName}의 AI 궁합 결과`,
                        initialContent: `오늘 본 AI 궁합 타로 결과입니다. #타로 #궁합 #연애`
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-sm font-medium mb-3">
                        <Users className="w-4 h-4" />
                        <span>정통 궁합 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        두 사람의 운명적 어울림
                    </h1>
                </div>

                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            당신과 그 사람은 얼마나 잘 어울릴까요?<br />
                            성격 조화, 가치관의 일치, 그리고 함께 그려갈 미래까지<br />
                            5장의 카드로 두 분의 궁합 점수를 확인해보세요.
                        </p>
                        <Button size="lg" variant="gold" className="px-12" onClick={handleStart}>
                            궁합 확인하기
                        </Button>
                    </div>
                )}

                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground ml-1">내 이름</label>
                                <Input
                                    value={myName}
                                    onChange={(e) => setMyName(e.target.value)}
                                    placeholder="내 이름"
                                    className="bg-card/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground ml-1">상대방 이름</label>
                                <Input
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    placeholder="상대 이름"
                                    className="bg-card/50"
                                />
                            </div>
                        </div>
                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            운명의 스프레드 시작
                        </Button>
                    </div>
                )}

                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">프리미엄 5카드 궁합 분석</h2>
                            <p className="text-muted-foreground">
                                현재 기류, 깊은 속마음, 성격 궁합, 가치관,<br />
                                그리고 최종 운명적 결과까지 정밀 도출합니다.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 궁합 결과 보기
                        </Button>
                    </div>
                )}

                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={5}
                            instruction="두 분의 조화를 생각하며 5장을 한 장씩 뽑아주세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div className="flex justify-center flex-wrap gap-4 mb-12">
                            {['현재 기류', '상대 속마음', '내 속마음', '조화도', '결과'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center min-w-[80px]">
                                    <h4 className="text-[10px] text-muted-foreground mb-2 whitespace-nowrap">{label}</h4>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="sm"
                                            isFlipped={revealedCards.includes(i)}
                                            isReversed={drawnCards[i]?.isReversed}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && drawnCards[i] && (
                                        <div className="mt-2 text-center animate-fade-in">
                                            <span className="text-[11px] font-medium text-gold leading-tight">
                                                {drawnCards[i].card.koreanName}
                                                {drawnCards[i].isReversed && <span className="opacity-70 ml-0.5">(역)</span>}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 5 && (
                            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 animate-fade-in">
                                <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    {myName} ❤️ {partnerName} 궁합 리포트
                                </h3>

                                <div id="compatibility-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl flex items-center justify-between">
                                        <h4 className="font-bold text-gold">최종 궁합 점수</h4>
                                        <span className="text-2xl font-display text-gold">{score}점</span>
                                    </div>

                                    <div className="space-y-4">
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                                <p className="text-sm text-muted-foreground animate-pulse">AI 마스터가 두 분의 어울림을 분석하고 있습니다...</p>
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
                                                <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('compatibility-result-content', 'aura-compat-tarot')}>
                                                    <Download className="w-4 h-4 mr-2" /> 저장
                                                </Button>
                                                <Button variant="outline" className="flex-1" onClick={() => shareResult('궁합 타로 결과', `${myName}님과 ${partnerName}님의 궁합을 확인해보세요!`)}>
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
                                            setMyName('');
                                            setPartnerName('');
                                            setSelectedCardIndices([]);
                                            setRevealedCards([]);
                                            setDrawnCards([]);
                                            setAiReading('');
                                            setScore(0);
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
                featureName="궁합 타로 프리미엄"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

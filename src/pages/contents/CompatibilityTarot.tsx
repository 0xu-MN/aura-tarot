import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult, captureResultAsDataURL } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Users, Lock, Sparkles, RefreshCw, Share2, Download, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';
import { getWeightedCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';

const FEATURE_ID = 'compatibility-tarot';

export const CompatibilityTarot = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Form States
    const [myName, setMyName] = useState('');
    const [myBirthDate, setMyBirthDate] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [partnerBirthDate, setPartnerBirthDate] = useState('');
    const [question, setQuestion] = useState(''); // Added question state

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
            const state = saved.readingState;
            if (state.step) setStep(state.step);
            if (state.myName) setMyName(state.myName);
            if (state.partnerName) setPartnerName(state.partnerName);
            // Restore dates if saved (or ignore if not present in old save)
            if (state.myBirthDate) setMyBirthDate(state.myBirthDate);
            if (state.partnerBirthDate) setPartnerBirthDate(state.partnerBirthDate);
            if (state.question) setQuestion(state.question);

            if (state.selectedCardIndices) setSelectedCardIndices(state.selectedCardIndices);
            if (state.revealedCards) setRevealedCards(state.revealedCards);
            if (state.drawnCards) setDrawnCards(state.drawnCards);
            if (state.aiReading) setAiReading(state.aiReading);
            if (state.score) setScore(state.score);
        }
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (step !== 'intro') {
            premiumStore.saveReadingState(FEATURE_ID, {
                step,
                myName,
                myBirthDate,
                partnerName,
                partnerBirthDate,
                question,
                selectedCardIndices,
                revealedCards,
                drawnCards,
                aiReading,
                score
            });
        }
    }, [step, myName, myBirthDate, partnerName, partnerBirthDate, question, selectedCardIndices, revealedCards, drawnCards, aiReading, score]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!myName.trim() || !partnerName.trim() || !myBirthDate || !partnerBirthDate) {
            toast.error('모든 정보를 입력해주세요!');
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
                        question: `${myName}(${myBirthDate})님과 ${partnerName}(${partnerBirthDate})님의 궁합 리딩` + (question ? `\n\n구체적인 질문: ${question}` : ''),
                        cards: cards.map((c, i) => ({
                            position: ['나의 에너지', '상대방 에너지', '관계의 강점', '관계의 약점', '전반적인 궁합'][i],
                            name: c.card.name,
                            isReversed: c.isReversed
                        })),
                        extraContext: `로맨틱하고 현실적인 톤으로 해석해주세요. 두 사람의 생년월일을 고려하여 운명의 흐름도 덧붙여주세요. ${question ? `사용자가 다음 질문에 집중해달라고 했습니다: "${question}"` : ''}`
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
            setAiReading("죄송합니다. AI 마스터와의 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSpreadComplete = (indices: number[]) => {
        // Weighted selection: Cups and Pentacles have higher probability (weight 2)
        const newDrawnCards = getWeightedCards(5, { cups: 2, pentacles: 2 });
        setDrawnCards(newDrawnCards);
        setSelectedCardIndices(indices);

        fetchAiReading(newDrawnCards);

        setTimeout(() => {
            setStep('result');
            // Random compatibility score 50-95
            setScore(Math.floor(Math.random() * 46) + 50);
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
                        initialTitle: `${myName} & ${partnerName}의 궁합: ${score}% 💕`,
                        initialContent: `오늘 본 커플 궁합 타로 결과입니다. #타로 #궁합 #럽스타그램`
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-sm font-medium mb-3">
                        <Heart className="w-4 h-4 fill-current" />
                        <span>Love Compatibility</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        커플 궁합 타로
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        두 사람 이름/생일 입력하고 궁합 봐보세요. 로맨틱한 결과 기다려요 💕
                    </p>
                </div>

                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-8 animate-fade-in py-10">
                        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                            <Users className="w-16 h-16 text-pink-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg text-foreground/90 font-medium">
                                "우리 두 사람, 운명일까요?"
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                서로의 에너지, 강점과 약점,<br />
                                그리고 두 분의 최종적인 케미스트리까지<br />
                                5장의 카드로 로맨틱하게 풀어드립니다.
                            </p>
                        </div>
                        <Button size="lg" variant="gold" className="px-12 h-14 text-lg" onClick={handleStart}>
                            <Heart className="w-5 h-5 mr-2" />
                            궁합 확인하기
                        </Button>
                    </div>
                )}

                {step === 'input' && (
                    <div className="max-w-md w-full space-y-8 animate-fade-in bg-card/30 p-6 md:p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-base text-gold">나의 정보</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        value={myName}
                                        onChange={(e) => setMyName(e.target.value)}
                                        placeholder="이름"
                                        className="bg-black/40 border-gold/20 focus:border-gold/50 h-11"
                                    />
                                    <Input
                                        type="date"
                                        value={myBirthDate}
                                        onChange={(e) => setMyBirthDate(e.target.value)}
                                        className="bg-black/40 border-gold/20 focus:border-gold/50 h-11"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">AND</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base text-pink-400">상대방 정보</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        value={partnerName}
                                        onChange={(e) => setPartnerName(e.target.value)}
                                        placeholder="이름"
                                        className="bg-black/40 border-pink-500/20 focus:border-pink-500/50 h-11"
                                    />
                                    <Input
                                        type="date"
                                        value={partnerBirthDate}
                                        onChange={(e) => setPartnerBirthDate(e.target.value)}
                                        className="bg-black/40 border-pink-500/20 focus:border-pink-500/50 h-11"
                                    />
                                </div>
                            </div>

                            {/* Question Section */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <Label className="text-base text-white/90">궁금한 점 (선택사항)</Label>

                                {/* Recommended Questions */}
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "우리 궁합 어때?",
                                        "결혼 궁합 봐줘",
                                        "성격 궁합은 맞을까?",
                                        "장기 연애 가능성 있을까?",
                                        "서로 보완하는 부분은?",
                                        "관계 유지 팁은?",
                                        "파트너와의 미래는?"
                                    ].map((q, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setQuestion(q)}
                                            className="px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-gold/80 text-xs hover:bg-gold/20 hover:text-gold transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>

                                <Input
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="직접 입력하거나 위에서 선택하세요"
                                    className="bg-black/40 border-white/20 focus:border-gold/50 h-11"
                                />
                            </div>
                        </div>

                        <Button size="lg" variant="gold" className="w-full h-12 text-base font-semibold" onClick={handleInputSubmit}>
                            운명의 스프레드 펼치기
                        </Button>
                    </div>
                )}

                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse border border-gold/30">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="font-display text-2xl text-foreground">프리미엄 궁합 분석</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                두 분의 생년월일을 바탕으로 한 정밀 분석,<br />
                                컵과 펜타클의 기운을 담은 5장의 카드 리딩을<br />
                                지금 바로 확인하세요.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-amber-400 hover:to-amber-600 text-black font-bold h-14 shadow-lg shadow-gold/20 text-lg"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 결과 잠금해제
                        </Button>
                    </div>
                )}

                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={5}
                            instruction={`${myName}님과 ${partnerName}님의 관계를 떠올리며 5장을 선택하세요`}
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        {/* Cards Display */}
                        <div className="flex justify-center flex-wrap gap-3 md:gap-6 mb-12">
                            {['나의 에너지', '상대 에너지', '관계의 강점', '관계의 약점', '전체 궁합'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <h4 className="text-xs md:text-sm text-muted-foreground mb-3 font-medium bg-black/40 px-3 py-1 rounded-full">{label}</h4>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-2">
                                        <TarotCard
                                            size="sm"
                                            isFlipped={revealedCards.includes(i)}
                                            isReversed={drawnCards[i]?.isReversed}
                                            interactive={false}
                                            frontImage={drawnCards[i]?.card?.image}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && drawnCards[i] && (
                                        <div className="mt-3 text-center animate-fade-in w-24">
                                            <span className="text-xs font-bold text-gold leading-tight block truncate">
                                                {drawnCards[i].card.koreanName}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Analysis Report */}
                        {revealedCards.length === 5 && (
                            <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-gold/20 animate-fade-in shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <h3 className="font-display text-2xl md:text-3xl text-gold-gradient mb-8 flex items-center justify-center gap-3 relative z-10">
                                    <Sparkles className="w-6 h-6 text-gold" />
                                    궁합 분석 리포트
                                </h3>

                                <div id="compatibility-result-content" className="space-y-8 relative z-10">
                                    {/* Score Chart */}
                                    <div className="flex justify-center py-6">
                                        <div className="relative w-40 h-40 flex items-center justify-center">
                                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                <circle cx="50%" cy="50%" r="70" className="stroke-muted fill-none stroke-[8]" />
                                                <circle
                                                    cx="50%" cy="50%" r="70"
                                                    className="stroke-pink-500 fill-none stroke-[8] transition-all duration-1000 ease-out"
                                                    strokeDasharray="440"
                                                    strokeDashoffset={440 - (440 * score) / 100}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="text-center">
                                                <span className="block text-sm text-muted-foreground">궁합 점수</span>
                                                <span className="block text-4xl font-display text-white">{score}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Analysis */}
                                    <div className="space-y-4">
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-4 bg-black/20 rounded-2xl">
                                                <Loader2 className="w-10 h-10 animate-spin text-pink-400" />
                                                <p className="text-sm text-pink-200/80 animate-pulse">
                                                    두 분의 별자리와 카드의 기운을 읽고 있습니다...
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert max-w-none">
                                                <p className="whitespace-pre-wrap leading-loose text-gray-100 text-lg font-light text-justify">
                                                    {aiReading || '리딩 결과를 불러올 수 없습니다.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {!isAnalyzing && aiReading && (
                                        <div className="space-y-4 pt-6 border-t border-white/10">
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-12 bg-white/5 border-white/10 hover:bg-white/10"
                                                    onClick={() => saveResultAsImage('compatibility-result-content', `aura_compat_${myName}_${partnerName}`)}
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    이미지 저장
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-12 bg-white/5 border-white/10 hover:bg-white/10"
                                                    onClick={() => shareResult('궁합 타로 결과', `${myName}님과 ${partnerName}님의 궁합 점수는 ${score}%입니다! 💕`)}
                                                >
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    공유하기
                                                </Button>
                                            </div>
                                            <Button
                                                className="w-full h-12 bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium"
                                                onClick={handleShareToLounge}
                                            >
                                                <Share2 className="w-4 h-4 mr-2" />
                                                라운지에 자랑하기
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        variant="ghost"
                                        className="w-full mt-2 text-muted-foreground hover:text-white hover:bg-white/5"
                                        onClick={() => {
                                            premiumStore.resetFeature(FEATURE_ID);
                                            setHasPaid(false);
                                            setStep('input');
                                            setMyName('');
                                            setPartnerName('');
                                            setMyBirthDate('');
                                            setPartnerBirthDate('');
                                            setSelectedCardIndices([]);
                                            setRevealedCards([]);
                                            setDrawnCards([]);
                                            setAiReading('');
                                            setScore(0);
                                        }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        처음부터 다시 하기
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
                featureName="커플 궁합 타로"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

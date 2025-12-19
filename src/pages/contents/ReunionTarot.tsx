import { useState, useEffect } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Moon, Lock, Sparkles, RefreshCw, Share2, Download, User } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';

const FEATURE_ID = 'reunion-tarot';

// Mock Card Data
const MOCK_CARDS = [
    { name: "Five of Cups", korean: "컵 5", meaning: "상실감, 후회...", advice: "과거에 얽매이지 마세요." },
    { name: "The Hierophant", korean: "교황", meaning: "조언, 신념, 관습...", advice: "주변의 조언을 구하세요." },
    { name: "Eight of Swords", korean: "검 8", meaning: "고립, 두려움...", advice: "스스로 만든 감옥에서 나오세요." },
    { name: "Wheel of Fortune", korean: "운명의 수레바퀴", meaning: "변화, 기회, 운명...", advice: "흐름에 몸을 맡기세요." },
];

export const ReunionTarot = () => {
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [question, setQuestion] = useState('');
    const [partnerInfo, setPartnerInfo] = useState('');
    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);
    const [probability, setProbability] = useState(0);

    // Load persisted state on mount
    useEffect(() => {
        const saved = premiumStore.getFeatureState(FEATURE_ID);
        if (saved.hasPaid && premiumStore.isPaid(FEATURE_ID)) {
            setHasPaid(true);
        }

        if (saved.readingState) {
            const { step: savedStep, question: savedQuestion, partnerInfo: savedPartner, selectedCardIndices: savedIndices, revealedCards: savedRevealed } = saved.readingState;
            if (savedStep) setStep(savedStep);
            if (savedQuestion) setQuestion(savedQuestion);
            if (savedPartner) setPartnerInfo(savedPartner);
            if (savedIndices) setSelectedCardIndices(savedIndices);
            if (savedRevealed) setRevealedCards(savedRevealed);
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
                revealedCards
            });
        }
    }, [step, question, partnerInfo, selectedCardIndices, revealedCards]);

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
                description: '재회 가능성을 분석하기 위해 최소 10자 이상 입력해주세요.'
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

    const handleSpreadComplete = (indices: number[]) => {
        setSelectedCardIndices(indices);
        setTimeout(() => {
            setStep('result');
            setProbability(Math.floor(Math.random() * 41) + 40); // 40-80%
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-medium mb-3">
                        <Moon className="w-4 h-4" />
                        <span>재회운 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        떠나간 인연의 행방
                    </h1>
                </div>

                {/* Steps logic */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            끊어진 인연이 다시 이어질 수 있을까요?<br />
                            상대방의 속마음과 우리 관계의 현재 에너지를 분석하여<br />
                            가장 가능성 높은 재회 시나리오와 조언을 들려드립니다.
                        </p>
                        <Button size="lg" variant="gold" className="px-12" onClick={handleStart}>
                            무료로 시작하기
                        </Button>
                    </div>
                )}

                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">
                                현재 심정이나 궁금한 점을 적어주세요
                            </label>
                            <Textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="예: 헤어진 지 3개월 된 전 남친에게 먼저 연락해도 될까요?"
                                className="min-h-[100px] bg-card/50 px-4 py-3"
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
                                placeholder="예: 헤어진 시기, 마지막 연락 내용 등"
                                className="min-h-[60px] bg-card/50 px-4 py-3"
                            />
                        </div>
                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            운명의 카드 뽑기
                        </Button>
                    </div>
                )}

                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">재회 가능성 정밀 분석</h2>
                            <p className="text-muted-foreground">
                                4장의 카드를 통한 입체적 분석과<br />
                                구체적인 재회 확률, 최적의 타이밍을 제안합니다.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 재회운 확인하기
                        </Button>
                    </div>
                )}

                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={4}
                            instruction="상대방을 떠올리며 4장의 카드를 신중히 골라주세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        {/* Probability Gauge */}
                        <div className="mb-12 text-center">
                            <h3 className="text-muted-foreground mb-4">재회 확률</h3>
                            <div className="relative w-48 h-24 mx-auto overflow-hidden">
                                <div className="absolute top-0 left-0 w-48 h-48 border-[12px] border-muted/20 rounded-full" />
                                <div
                                    className="absolute top-0 left-0 w-48 h-48 border-[12px] border-gold rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        clipPath: `inset(0 0 50% 0)`,
                                        transform: `rotate(${(probability / 100) * 180}deg)`,
                                        transformOrigin: '50% 50%'
                                    }}
                                />
                                <div className="absolute bottom-0 left-0 w-full text-3xl font-display text-gold">
                                    {probability}%
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {['내 마음', '상대방 마음', '장애물', '최종 결과'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h4 className="text-xs text-muted-foreground mb-2">{label}</h4>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="sm"
                                            isFlipped={revealedCards.includes(i)}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && (
                                        <div className="mt-2 text-center animate-fade-in">
                                            <span className="text-sm font-medium text-gold">{MOCK_CARDS[i].korean}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 4 && (
                            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20">
                                <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    재회 전략 리딩
                                </h3>

                                <div id="reunion-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl">
                                        <h4 className="font-bold text-gold mb-2">현재의 흐름</h4>
                                        <p className="opacity-80">
                                            현재 질문자님은 상실감(컵 5)을 느끼고 있지만, 운명의 흐름(운명의 수레바퀴)은
                                            두 사람의 관계를 다시 끌어당기고 있습니다. 상대방은 현재 방어적인 입장(검 8)일 수 있으나,
                                            지혜로운 접근(교황)을 통해 오해를 풀 기회가 생길 것입니다.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold mb-2">💫 최적의 타이밍</h4>
                                        <p>
                                            지금 당장 연락하기보다는 2주 정도의 시간을 두고 상대방이 스스로
                                            생각할 여유를 주시는 것이 좋습니다. 보름달이 뜨는 시기 근처가
                                            두 사람의 대화가 가장 부드럽게 풀릴 좋은 시점입니다.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('reunion-result-content', 'aura-reunion-tarot')}>
                                            <Download className="w-4 h-4 mr-2" /> 저장
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => shareResult('재회운 타로 결과', '제 재회 가능성을 확인해보세요!')}>
                                            <Share2 className="w-4 h-4 mr-2" /> 공유
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="w-full mt-4 border border-gold/30 hover:bg-gold/10"
                                        onClick={() => {
                                            premiumStore.resetFeature(FEATURE_ID);
                                            setHasPaid(false);
                                            setStep('input');
                                            setSelectedCardIndices([]);
                                            setRevealedCards([]);
                                            setProbability(0);
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
                featureName="재회운 타로 프리미엄"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

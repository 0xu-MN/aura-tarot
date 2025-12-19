import { useState, useEffect } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Calendar, Lock, Sparkles, RefreshCw, Share2, Download, User } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';

const FEATURE_ID = 'yearly-fortune';

// Mock Card Data (4 cards for 4 seasons)
const MOCK_CARDS = [
    { name: "Ace of Pentacles", korean: "펜타클 에이스", meaning: "새로운 시작, 풍요...", advice: "봄에는 새로운 투자가 좋습니다." },
    { name: "The Chariot", korean: "전차", meaning: "승리, 전진, 의지...", advice: "여름에는 거침없이 나아가세요." },
    { name: "Queen of Pentacles", korean: "펜타클 퀸", meaning: "결실, 안정, 가꿈...", advice: "가을에는 노력의 결과가 나옵니다." },
    { name: "Justice", korean: "정의", meaning: "균형, 공정, 결단...", advice: "겨울에는 한 해를 차분히 정리하세요." },
];

export const YearlyFortune = () => {
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [name, setName] = useState('');
    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    // Load persisted state on mount
    useEffect(() => {
        const saved = premiumStore.getFeatureState(FEATURE_ID);
        if (saved.hasPaid && premiumStore.isPaid(FEATURE_ID)) {
            setHasPaid(true);
        }

        if (saved.readingState) {
            const { step: savedStep, name: savedName, selectedCardIndices: savedIndices, revealedCards: savedRevealed } = saved.readingState;
            if (savedStep) setStep(savedStep);
            if (savedName) setName(savedName);
            if (savedIndices) setSelectedCardIndices(savedIndices);
            if (savedRevealed) setRevealedCards(savedRevealed);
        }
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (step !== 'intro') {
            premiumStore.saveReadingState(FEATURE_ID, {
                step,
                name,
                selectedCardIndices,
                revealedCards
            });
        }
    }, [step, name, selectedCardIndices, revealedCards]);

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

    const handleSpreadComplete = (indices: number[]) => {
        setSelectedCardIndices(indices);
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>신년 종합 운세</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        2025년 운명의 흐름
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
                            <h2 className="font-display text-2xl text-foreground mb-4">2025년 정밀 총운</h2>
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
                            instruction="나의 2025년을 상상하며 4장의 카드를 골라주세요"
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
                                    {name}님의 2025년 운세 리포트
                                </h3>

                                <div id="yearly-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl">
                                        <h4 className="font-bold text-gold mb-2">계절별 운세 흐름</h4>
                                        <p className="opacity-80">
                                            올해는 새로운 금전적 기회(펜타클 에이스)로 시작하여 정열적으로 전진(전차)하는
                                            역동적인 한 해가 될 것입니다. 가을에는 안정적인 성과(펜타클 퀸)를 거두게 되며,
                                            연말에는 공정한 보상과 정리(정의)를 통해 보람찬 마무리를 하게 됩니다.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold mb-2">🌟 올해의 행운 전략</h4>
                                        <p>
                                            상반기에는 과감한 도전이 성과로 이어집니다. 새로운 분야의 공부나 투자를 시작해보세요.
                                            하반기에는 확장보다는 내실을 기하는 것이 유리합니다. 자신의 성취를 주변과 나누면
                                            더 큰 복이 돌아올 것입니다.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('yearly-result-content', 'aura-yearly-fortune')}>
                                            <Download className="w-4 h-4 mr-2" /> 저장
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => shareResult('신년 총운 결과', `${name}님의 2025년 운세 결과를 확인해보세요!`)}>
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

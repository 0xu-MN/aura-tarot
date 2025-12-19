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

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!question.trim()) {
            toast.error('상황을 입력해주세요!');
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

    // Probability Animation
    useEffect(() => {
        if (step === 'result' && revealedCards.length === 4) {
            let start = 0;
            const target = 72; // Mock probability
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);

                setProbability(Math.floor(start + (target - start) * easeOut));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }
    }, [step, revealedCards]);

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-medium mb-3">
                        <Moon className="w-4 h-4 fill-current" />
                        <span>재회운 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        그 사람과 다시 만날 수 있을까?
                    </h1>
                </div>

                {/* Intro */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            이별 후에도 마음이 남아있으신가요?<br />
                            상대방의 속마음부터 재회 가능성까지,<br />
                            4장의 카드로 그 가능성을 진실하게 확인해보세요.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
                            {['나의 미련', '그의 속마음', '현실적 장애물', '재회 가능성'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-gold/20">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center font-display text-gold font-bold">
                                        {i + 1}
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12" onClick={handleStart}>
                            확률 확인하기
                        </Button>
                    </div>
                )}

                {/* Input */}
                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">
                                현재 상황과 고민을 적어주세요
                            </label>
                            <Textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="예: 3개월 전 헤어진 남자친구입니다. 연락이 올까요?"
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
                                placeholder="이름 초성, 헤어진 시기 등"
                                className="min-h-[60px] bg-card/50 resize-none px-4 py-3"
                            />
                        </div>

                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            타로 카드 뽑기
                        </Button>
                    </div>
                )}

                {/* Payment Check */}
                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>

                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">
                                프리미엄 심층 분석
                            </h2>
                            <p className="text-muted-foreground">
                                상대방의 숨겨진 속마음과 정확한 재회 확률 데이터를<br />
                                확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 재회 확률 확인
                        </Button>
                    </div>
                )}

                {/* Spread */}
                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={4}
                            instruction="간절한 마음을 담아 4장의 카드를 선택하세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        {/* Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            {['나의 미련', '그의 속마음', '장애물', '재회 가능성'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h3 className="text-xs font-medium text-muted-foreground mb-2">{label}</h3>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105 w-full max-w-[120px]">
                                        <TarotCard
                                            size="md"
                                            isFlipped={revealedCards.includes(i)}
                                            frontImage={undefined}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && (
                                        <div className="mt-3 text-center animate-fade-in">
                                            <h4 className="font-display text-sm text-gold">{MOCK_CARDS[i].korean}</h4>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 4 && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Probability Gauge */}
                                <div className="bg-card/40 backdrop-blur-md rounded-2xl p-8 border border-gold/20 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gold/10">
                                        <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${probability}%` }} />
                                    </div>
                                    <h3 className="text-muted-foreground text-sm mb-2">AI가 분석한 재회 성공 확률</h3>
                                    <div className="font-display text-6xl text-gold-gradient mb-4">
                                        {probability}%
                                    </div>
                                    <p className="text-sm text-foreground/80">
                                        {probability > 70 ? "매우 긍정적인 신호입니다. 용기를 내보세요!" :
                                            probability > 40 ? "노력이 필요하지만 가능성은 열려있습니다." : "당분간은 거리를 두는 것이 좋습니다."}
                                    </p>
                                </div>

                                {/* Analysis */}
                                <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20">
                                    <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        상세 리딩
                                    </h3>

                                    <div id="reunion-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                        <div className="p-6 bg-background/50 rounded-xl border border-gold/10 shadow-sm">
                                            <h4 className="font-bold text-indigo-400 mb-3 text-lg">❤️ 그 사람의 진심 깊이 읽기</h4>
                                            <p className="opacity-90 mb-4">
                                                현재 상대방은 깊은 감정의 소용돌이 속에 있습니다(컵 5). 당신과의 추억을 떠올리며 후회와 그리움을 동시에 느끼고 있지만,
                                                한편으로는 현실적인 문제들로 인해 쉽게 다가서지 못하는 이중적인 태도를 보입니다.
                                                그의 무의식 속에는 여전히 당신이라는 존재가 '안식처'로 남아있으며, 완전히 끝났다고 생각하기보다는
                                                '언젠가'라는 막연한 기대를 품고 있을 가능성이 높습니다.
                                            </p>
                                            <p className="opacity-90">
                                                특히 밤이 되면 당신에 대한 생각이 깊어지는 흐름이 보이며,
                                                주변의 시선이나 자존심 문제만 해결된다면 의외로 먼저 연락해올 수 있는 에너지가 감지됩니다.
                                            </p>
                                        </div>

                                        <div className="p-6 bg-background/50 rounded-xl border border-gold/10 shadow-sm">
                                            <h4 className="font-bold mb-3 text-lg">💡 현실적인 장애물과 해결책</h4>
                                            <p className="opacity-90 mb-3">
                                                두 분 사이의 가장 큰 장애물은 외부적인 요인보다는 내면의 '두려움'과 '고립감'(검 8)입니다.
                                                서로가 "상대방은 나를 잊었을 거야"라고 오해하고 있어, 먼저 손을 내미는 것을 두려워하고 있습니다.
                                            </p>
                                            <p className="opacity-90">
                                                운명의 수레바퀴 카드가 나온 것으로 보아, 2주에서 1달 이내에 우연한 계기로 연락이 닿거나 마주칠 운명적 타이밍이 찾아옵니다.
                                                이때를 놓치지 말고 가벼운 안부를 묻는다면 재회의 물꼬가 급격히 트일 것입니다.
                                            </p>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('reunion-result-content', 'aura-reunion-result')}>
                                                <Download className="w-4 h-4 mr-2" /> 저장
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={() => shareResult('재회운 타로 결과', '제 재회 확률은 ' + probability + '% 입니다! 당신의 운세도 확인해보세요.')}>
                                                <Share2 className="w-4 h-4 mr-2" /> 공유
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            className="w-full mt-4 border border-gold/30 hover:bg-gold/10"
                                            onClick={() => {
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
                            </div>
                        )}

                        {revealedCards.length < 4 && (
                            <div className="text-center mt-8 animate-pulse text-muted-foreground">
                                카드를 하나씩 터치하여 뒤집어보세요
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
                price={1}
            />
        </AppLayout>
    );
};

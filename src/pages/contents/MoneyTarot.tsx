import { useState } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Eye, Lock, Sparkles, Share2, Download, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Mock Card Data
const MOCK_CARDS = [
    { name: "Ace of Pentacles", korean: "펜타클 에이스", meaning: "금전적 기회, 번영...", advice: "기회를 꽉 잡으세요." },
    { name: "Four of Pentacles", korean: "펜타클 4", meaning: "소유, 집착, 안정...", advice: "지키는 것도 중요합니다." },
    { name: "The Empress", korean: "여황제", meaning: "풍요, 사치, 결실...", advice: "풍요를 즐기되 낭비는 금물." },
];

export const MoneyTarot = () => {
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [question, setQuestion] = useState('');

    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!question.trim()) {
            toast.error('고민을 입력해주세요!');
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

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium mb-3">
                        <Eye className="w-4 h-4 fill-current" />
                        <span>금전운 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        부의 흐름이 보이나요?
                    </h1>
                </div>

                {/* Intro */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            재물은 흐르는 물과 같습니다.<br />
                            현재 당신의 재정 상태, 다가올 기회, 그리고 조언을 통해<br />
                            풍요로운 흐름에 올라타세요.
                        </p>

                        <div className="grid grid-cols-3 gap-4 my-8">
                            {['현재 재물운', '가까운 미래', '행동 조언'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-gold/20">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-display text-emerald-400 font-bold text-lg">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12" onClick={handleStart}>
                            금전운 확인하기
                        </Button>
                    </div>
                )}

                {/* Input */}
                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">
                                현재 가장 큰 금전적 고민은?
                            </label>
                            <Textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="예: 사업 확장을 해도 될까요? 언제쯤 목돈이 모일까요?"
                                className="min-h-[100px] bg-card/50 resize-none px-4 py-3"
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
                                프리미엄 재물 분석
                            </h2>
                            <p className="text-muted-foreground">
                                구체적인 재물 흐름과 실질적인 조언을<br />
                                확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 재물운 열기
                        </Button>
                    </div>
                )}

                {/* Spread */}
                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={3}
                            instruction="부를 부르는 3장의 카드를 선택하세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {['현재 재물운', '가까운 미래', '행동 조언'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4">{label}</h3>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="lg"
                                            isFlipped={revealedCards.includes(i)}
                                            frontImage={undefined}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && (
                                        <div className="mt-4 text-center animate-fade-in">
                                            <h4 className="font-display text-lg text-gold">{MOCK_CARDS[i].korean}</h4>
                                            <p className="text-xs text-muted-foreground">{MOCK_CARDS[i].meaning}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 3 && (
                            <div id="money-result-content" className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 animate-fade-in">
                                <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    AI 금전운 분석
                                </h3>

                                <div className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-6 bg-background/50 rounded-xl border border-emerald-500/20 shadow-sm">
                                        <h4 className="font-bold text-emerald-400 mb-3 text-lg">💰 현재의 재물 흐름</h4>
                                        <p className="opacity-90 mb-4">
                                            매우 강력한 재물운(펜타클 에이스)이 귀하의 삶으로 들어오고 있습니다.
                                            이는 단순한 월급의 인상이 아닌, 새로운 수입원의 창출이나 예상치 못한 보너스, 혹은
                                            장기적으로 큰 이익을 가져다줄 '씨앗 자금'의 확보를 의미합니다.
                                        </p>
                                        <p className="opacity-90">
                                            특히 펜타클 4 카드는 현재 귀하가 재물을 지키려는 의지가 강함을 보여주지만,
                                            때로는 너무 움켜쥐는 것이 오히려 흐름을 막을 수 있음을 경고합니다.
                                        </p>
                                    </div>

                                    <div className="p-6 bg-background/50 rounded-xl border border-gold/10 shadow-sm">
                                        <h4 className="font-bold mb-3 text-lg">🚀 부의 추월차선 조언</h4>
                                        <p className="opacity-90 mb-3">
                                            여황제(The Empress) 카드는 '생산적 투자'와 '풍요의 순환'을 상징합니다.
                                            지금은 아끼기만 할 때가 아니라, 나 자신의 가치를 높이거나 확실한 투자처에
                                            과감히 씨앗을 뿌려야 할 시기입니다.
                                        </p>
                                        <p className="opacity-90">
                                            소비를 위한 지출은 줄이되, 미래 가치를 위한 지출에는 관대해지세요.
                                            3개월 내에 귀인이나 좋은 제안이 찾아올 확률이 높으니 주변을 잘 살피시기 바랍니다.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('money-result-content', 'aura-money-result')}>
                                            <Download className="w-4 h-4 mr-2" /> 저장
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => shareResult('금전운 타로 결과', '제 금전운은 대박 조짐이 보입니다! 당신의 금전운도 확인해보세요.')}>
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
                featureName="금전운 타로 프리미엄"
                price={1}
            />
        </AppLayout>
    );
};

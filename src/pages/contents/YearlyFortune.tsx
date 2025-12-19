import { useState } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Calendar, Lock, Sparkles, Share2, Download, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Mock Card Data
const MOCK_CARDS = [
    { name: "Ace of Wands", korean: "완드 에이스", meaning: "새로운 시작, 열정...", season: "봄" },
    { name: "The Sun", korean: "태양", meaning: "성취, 활력, 행복...", season: "여름" },
    { name: "Five of Pentacles", korean: "펜타클 5", meaning: "궁핍, 고난...", season: "가을" },
    { name: "The Hermit", korean: "은둔자", meaning: "성찰, 휴식, 지혜...", season: "겨울" },
];

export const YearlyFortune = () => {
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Inputs
    const [name, setName] = useState('');
    const [yearGoal, setYearGoal] = useState('');

    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!name) {
            toast.error('이름을 입력해주세요!');
            return;
        }
        if (name.length < 2) {
            toast.error('이름을 정확히 입력해주세요');
            return;
        }
        if (!yearGoal) {
            toast.error('정보를 모두 입력해주세요!');
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium mb-3">
                        <Calendar className="w-4 h-4 fill-current" />
                        <span>2025 신년운세</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        당신의 2025년은 어떤 모습일까요?
                    </h1>
                </div>

                {/* Intro */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            다가오는 2025년,<br />
                            봄, 여름, 가을, 겨울 사계절의 흐름을 미리 확인하세요.<br />
                            각 계절별 주요 이슈와 조언을 통해 더 나은 한 해를 계획할 수 있습니다.
                        </p>

                        <div className="grid grid-cols-4 gap-2 my-8">
                            {['봄 (3~5월)', '여름 (6~8월)', '가을 (9~11월)', '겨울 (12~2월)'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center p-2 rounded-lg bg-card border border-gold/20">
                                    <div className="text-xs font-bold text-gold mb-1">{['🌱', '☀️', '🍁', '❄️'][i]}</div>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12" onClick={handleStart}>
                            신년운세 보기
                        </Button>
                    </div>
                )}

                {/* Input */}
                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">이름</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-card/50 border border-gold/20 focus:border-gold outline-none text-foreground"
                                placeholder="본명을 입력해주세요"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">새해 가장 큰 목표나 소망</label>
                            <Textarea
                                value={yearGoal}
                                onChange={(e) => setYearGoal(e.target.value)}
                                placeholder="예: 취업 성공, 결혼, 내 집 마련 등"
                                className="min-h-[100px] bg-card/50 resize-none px-4 py-3"
                            />
                        </div>

                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            운세 카드 뽑기
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
                                프리미엄 신년 운세
                            </h2>
                            <p className="text-muted-foreground">
                                2025년 의 월별 흐름과 계절별 상세 조언을<br />
                                확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 1년 운세 확인
                        </Button>
                    </div>
                )}

                {/* Spread */}
                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={4}
                            instruction="각 계절을 대표할 4장의 카드를 선택하세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        {/* Timeline UI */}
                        <div className="relative mb-12 px-4">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0 -translate-y-1/2 hidden md:block" />

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
                                {['봄 (3~5월)', '여름 (6~8월)', '가을 (9~11월)', '겨울 (12~2월)'].map((label, i) => (
                                    <div key={i} className="flex flex-col items-center relative z-10">
                                        <div className="mb-4 bg-background px-2 text-sm font-medium text-gold">{label}</div>
                                        <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105 w-[140px] md:w-[120px]">
                                            <TarotCard
                                                size="md"
                                                isFlipped={revealedCards.includes(i)}
                                                frontImage={undefined}
                                                interactive={false}
                                            />
                                        </div>
                                        {revealedCards.includes(i) && (
                                            <div className="mt-3 text-center animate-fade-in">
                                                <h4 className="font-display text-lg text-gold">{MOCK_CARDS[i].korean}</h4>
                                                <p className="text-xs text-muted-foreground">{MOCK_CARDS[i].season}의 운세</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {revealedCards.length === 4 && (
                            <div id="yearly-result-content" className="space-y-6 animate-slide-up">
                                {/* Timeline Mock */}
                                <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 scrollbar-hide overflow-x-auto">
                                    <div className="flex justify-between min-w-[300px] relative pt-4">
                                        <div className="absolute top-6 left-0 w-full h-0.5 bg-gold/20" />
                                        {['봄', '여름', '가을', '겨울'].map((season, i) => (
                                            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full border-2 ${i === 2 ? 'bg-gold border-gold' : 'bg-background border-gold/50'}`} />
                                                <span className="text-xs text-muted-foreground">{season}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 text-center">
                                        <p className="font-display text-lg text-gold">가을: 운명의 전환점</p>
                                        <p className="text-sm text-muted-foreground">가장 중요한 변화가 일어나는 시기입니다.</p>
                                    </div>
                                </div>

                                {/* Analysis */}
                                <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20">
                                    <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        2025년 총운 분석
                                    </h3>

                                    <div className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                        <div className="p-6 bg-background/50 rounded-xl border border-gold/5 shadow-sm">
                                            <h4 className="font-bold text-amber-400 mb-3 text-lg">📅 올해의 핵심 키워드: "새로운 도약"</h4>
                                            <p className="opacity-90 mb-4">
                                                올해는 당신에게 있어 그동안 준비해왔던 것들이 결실을 맺는 수확의 해가 될 것입니다.
                                                특히 상반기보다는 하반기(가을, 겨울)로 갈수록 운의 흐름이 강력해집니다.
                                            </p>
                                            <p className="opacity-90">
                                                봄과 여름에는 다소 정체된 느낌을 받을 수 있으나, 이는 더 높이 뛰기 위한 도움닫기 과정입니다.
                                                가을에 찾아올 '여황제'의 기운은 풍요와 안정을 약속합니다.
                                                조급해하지 말고 꾸준히 자신의 자리를 지킨다면, 연말에는 기대 이상의 성과를 손에 쥘 수 있습니다.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold mb-2">💡 월별 조언</h4>
                                            <ul className="list-disc list-inside space-y-1 opacity-80 text-sm">
                                                <li><strong className="text-gold">봄:</strong> 새로운 시작보다는 내실을 다지는 시기입니다.</li>
                                                <li><strong className="text-gold">여름:</strong> 인간관계에서의 작은 오해를 주의하세요.</li>
                                                <li><strong className="text-gold">가을:</strong> 금전운과 명예운이 최고조에 달합니다.</li>
                                                <li><strong className="text-gold">겨울:</strong> 한 해의 성과를 인정받고 보상받습니다.</li>
                                            </ul>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('yearly-result-content', 'aura-yearly-fortune')}>
                                                <Download className="w-4 h-4 mr-2" /> 저장
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={() => shareResult('2025 신년 운세', '내년 가을, 대박 운세가 터진다? 당신의 신년 운세도 확인해보세요!')}>
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
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName="2025 신년운세 프리미엄"
                price={1}
            />
        </AppLayout>
    );
};

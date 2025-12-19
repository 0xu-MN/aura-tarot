import { useState } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Users, Lock, Sparkles, Share2, Download, Heart, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Mock Card Data
const MOCK_CARDS = [
    { name: "Ace of Cups", korean: "컵 에이스", meaning: "새로운 감정, 시작...", advice: "서로에게 마음을 여세요." },
    { name: "The Sun", korean: "태양", meaning: "긍정, 행복, 성공...", advice: "밝은 미래가 기다립니다." },
    { name: "Two of Pentacles", korean: "펜타클 2", meaning: "균형, 조율...", advice: "서로의 다름을 인정하세요." },
    { name: "The Devil", korean: "악마", meaning: "집착, 구속...", advice: "건강한 관계를 위해 거리가 필요합니다." },
    { name: "Ten of Cups", korean: "컵 10", meaning: "완성, 행복한 가정...", advice: "함께하는 미래를 꿈꾸세요." },
];

export const CompatibilityTarot = () => {
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Inputs
    const [myName, setMyName] = useState('');
    const [myBirth, setMyBirth] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [partnerBirth, setPartnerBirth] = useState('');

    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!myName.trim() || !partnerName.trim()) {
            toast.error('두 분의 이름을 입력해주세요!');
            return;
        }
        if (myName.length < 2 || partnerName.length < 2) {
            toast.error('이름을 정확히 입력해주세요', {
                description: '최소 2글자 이상 입력해야 합니다.'
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium mb-3">
                        <Users className="w-4 h-4 fill-current" />
                        <span>커플 궁합 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        우리 두 사람, 정말 잘 맞을까?
                    </h1>
                </div>

                {/* Intro */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            설레는 썸부터 깊은 연인 관계까지,<br />
                            두 사람의 에너지 조화를 5장의 카드로 분석합니다.<br />
                            서로의 강점과 약점을 파악하여 더 깊은 관계로 나아가세요.
                        </p>

                        <div className="flex justify-center gap-2 my-6">
                            {['나의 에너지', '상대의 에너지', '강점 요인', '약점 요인', '최종 궁합'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 text-xs flex items-center justify-center font-bold mb-1">
                                        {i + 1}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{label.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12" onClick={handleStart}>
                            궁합 확인하기
                        </Button>
                    </div>
                )}

                {/* Input */}
                {step === 'input' && (
                    <div className="max-w-md w-full space-y-8 animate-fade-in">
                        {/* My Info */}
                        <div className="space-y-4 p-4 rounded-xl bg-card border border-gold/10">
                            <h3 className="font-display text-lg text-gold flex items-center gap-2">
                                <User className="w-4 h-4" /> 나의 정보
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder="이름"
                                    value={myName}
                                    onChange={(e) => setMyName(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Input
                                    placeholder="생년월일 (선택)"
                                    value={myBirth}
                                    onChange={(e) => setMyBirth(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        {/* Partner Info */}
                        <div className="space-y-4 p-4 rounded-xl bg-card border border-gold/10">
                            <h3 className="font-display text-lg text-rose-400 flex items-center gap-2">
                                <Heart className="w-4 h-4" /> 상대방 정보
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder="이름"
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Input
                                    placeholder="생년월일 (선택)"
                                    value={partnerBirth}
                                    onChange={(e) => setPartnerBirth(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            궁합 카드 뽑기
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
                                프리미엄 상세 궁합
                            </h2>
                            <p className="text-muted-foreground">
                                두 사람의 에너지 조화, 강점, 약점,<br />
                                그리고 최종 궁합 점수를 확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 5장 상세 분석
                        </Button>
                    </div>
                )}

                {/* Spread */}
                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={5}
                            instruction="두 사람을 생각하며 5장의 카드를 선택하세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        {/* Cards Grid - Pentagon Layout-ish (Simplified to Grid) */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
                            {['나의 에너지', '상대의 에너지', '강점 요인', '약점 요인', '최종 궁합'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{label}</h3>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105 w-[90px] h-[140px] lg:w-full lg:max-w-[140px]">
                                        <TarotCard
                                            size="sm"
                                            isFlipped={revealedCards.includes(i)}
                                            frontImage={undefined}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && (
                                        <div className="mt-2 text-center animate-fade-in">
                                            <h4 className="font-display text-xs text-gold">{MOCK_CARDS[i].korean}</h4>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 5 && (
                            <div id="compatibility-result-content" className="space-y-6 animate-slide-up">
                                {/* Chart Mockup */}
                                <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 flex flex-col items-center text-center">
                                    <h3 className="font-display text-2xl text-rose-300 mb-2">💖 궁합 지수: 85점</h3>
                                    <p className="text-sm text-foreground/80 max-w-lg mb-6">
                                        두 분은 서로 다른 매력을 가지고 있으면서도(펜타클 2),
                                        깊은 감정적 유대감(컵 10)을 형성할 수 있는 아주 좋은 궁합입니다.
                                    </p>

                                    {/* CSS Polygon Mock */}
                                    <div className="relative w-48 h-48 my-4">
                                        <div className="absolute inset-0 bg-gold/5 rounded-full border border-gold/20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-32 h-32 bg-rose-500/20 backdrop-blur-sm transform rotate-45 border border-rose-500/40" />
                                        </div>
                                        <div className="absolute top-0 w-full text-center text-xs text-gold">소통</div>
                                        <div className="absolute bottom-0 w-full text-center text-xs text-gold">가치관</div>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gold">성격</div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gold">감정</div>
                                    </div>
                                </div>

                                {/* Analysis */}
                                <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20">
                                    <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        상세 분석
                                    </h3>

                                    <div className="space-y-6 text-foreground/90 leading-relaxed text-sm">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-background/50 rounded-xl border-l-2 border-gold h-full">
                                                <h4 className="font-bold mb-2 text-gold">👍 강점 요인</h4>
                                                <p className="opacity-90 text-sm leading-relaxed">
                                                    서로에게 긍정적인 에너지(태양)를 무한히 공급하는 관계입니다.
                                                    함께 있을 때 단순히 즐거운 것을 넘어, 서로의 잠재력을 끌어올려주는 '시너지 효과'가 매우 큽니다.
                                                    특히 의사소통에 있어서 서로의 의도를 찰떡같이 알아차리는 점은 두 분만의 강력한 무기입니다.
                                                </p>
                                            </div>
                                            <div className="p-4 bg-background/50 rounded-xl border-l-2 border-rose-400 h-full">
                                                <h4 className="font-bold mb-2 text-rose-400">👎 주의할 점</h4>
                                                <p className="opacity-90 text-sm leading-relaxed">
                                                    가끔씩 서로를 소유하려는 욕구가 강해져 무의식적인 집착(악마)으로 이어질 수 있습니다.
                                                    사랑하는 마음이 크기 때문이지만, 각자의 사생활과 취미 생활을 존중해줄 때 관계가 더욱 건강하고 오래 지속될 수 있음을 기억하세요.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('compatibility-result-content', 'aura-compatibility-result')}>
                                                <Download className="w-4 h-4 mr-2" /> 저장
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={() => shareResult('커플 궁합 결과', '우리 커플의 궁합 지수는 85점! 상세 분석을 확인해보세요.')}>
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

                        {revealedCards.length < 5 && (
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
                featureName="커플 궁합 프리미엄"
                price={1}
            />
        </AppLayout>
    );
};

// Simple User icon component since it was missing import
function User({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

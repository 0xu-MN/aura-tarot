import { useState, useEffect } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Users, Lock, Sparkles, RefreshCw, Share2, Download, User } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';

const FEATURE_ID = 'compatibility-tarot';

// Mock Card Data
const MOCK_CARDS = [
    { name: "The Sun", korean: "태양", meaning: "성공, 기쁨, 활력...", advice: "긍정적인 에너지가 넘칩니다." },
    { name: "Ten of Cups", korean: "컵 10", meaning: "가족애, 평화, 행운...", advice: "정서적 만족이 큽니다." },
    { name: "Strength", korean: "힘", meaning: "인내, 자제력, 부드러운 힘...", advice: "포용력 있는 대화가 필요합니다." },
    { name: "The Star", korean: "별", meaning: "희망, 영감, 치유...", advice: "꿈을 함께 나누세요." },
    { name: "The Empress", korean: "여황제", meaning: "풍요, 모성, 물질적 안락...", advice: "관계를 가꾸는 기쁨을 만끽하세요." },
];

export const CompatibilityTarot = () => {
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [myName, setMyName] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    // Load persisted state on mount
    useEffect(() => {
        const saved = premiumStore.getFeatureState(FEATURE_ID);
        if (saved.hasPaid && premiumStore.isPaid(FEATURE_ID)) {
            setHasPaid(true);
        }

        if (saved.readingState) {
            const { step: savedStep, myName: savedMyName, partnerName: savedPartnerName, selectedCardIndices: savedIndices, revealedCards: savedRevealed } = saved.readingState;
            if (savedStep) setStep(savedStep);
            if (savedMyName) setMyName(savedMyName);
            if (savedPartnerName) setPartnerName(savedPartnerName);
            if (savedIndices) setSelectedCardIndices(savedIndices);
            if (savedRevealed) setRevealedCards(savedRevealed);
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
                revealedCards
            });
        }
    }, [step, myName, partnerName, selectedCardIndices, revealedCards]);

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
                                <div key={i} className="flex flex-col items-center">
                                    <h4 className="text-[10px] text-muted-foreground mb-2">{label}</h4>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="sm"
                                            isFlipped={revealedCards.includes(i)}
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && (
                                        <div className="mt-2 text-center animate-fade-in">
                                            <span className="text-xs font-medium text-gold">{MOCK_CARDS[i].korean}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 5 && (
                            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20">
                                <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    {myName} ❤️ {partnerName} 궁합 리포트
                                </h3>

                                <div id="compatibility-result-content" className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl flex items-center justify-between">
                                        <h4 className="font-bold text-gold">최종 궁합 점수</h4>
                                        <span className="text-2xl font-display text-gold">92점</span>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="opacity-80">
                                            두 분은 서로의 에너지를 북돋아주는 매우 이상적인 궁합(태양 & 컵 10)입니다.
                                            특히 가치관적인 면에서 높은 일치도를 보이며, 서로를 향한 배려와
                                            인내심(힘)이 바탕이 되어 안정적인 관계를 이어나갈 수 있습니다.
                                        </p>
                                        <p>
                                            함께 있을 때 새로운 목표와 꿈(별)이 생겨나며, 정서적뿐만 아니라
                                            물질적으로도 서로에게 행운을 가져다주는 관계(여황제)라고 할 수 있습니다.
                                            작은 오해가 생기더라도 솔직한 대화를 통해 쉽게 해결될 것입니다.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('compatibility-result-content', 'aura-compat-tarot')}>
                                            <Download className="w-4 h-4 mr-2" /> 저장
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => shareResult('궁합 타로 결과', `${myName}님과 ${partnerName}님의 궁합을 확인해보세요!`)}>
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
                                            setMyName('');
                                            setPartnerName('');
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
                featureName="궁합 타로 프리미엄"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

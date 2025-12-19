import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { Heart, Lock, Sparkles, User, RefreshCw, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';

// Mock Card Data (would come from DB/API)
const MOCK_CARDS = [
    { name: "The Lovers", korean: "연인", meaning: "사랑, 조화, 선택...", advice: "마음을 열고..." },
    { name: "Two of Cups", korean: "컵 2", meaning: "파트너십, 끌림...", advice: "대화가 중요합니다..." },
    { name: "Ace of Wands", korean: "완드 에이스", meaning: "새로운 열정...", advice: "적극적으로 행동하세요..." },
];

export const LoveTarot = () => {
    const [step, setStep] = useState<'intro' | 'input' | 'payment-check' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [question, setQuestion] = useState('');
    const [partnerInfo, setPartnerInfo] = useState('');
    const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    const handleStart = () => {
        setStep('input');
    };

    const handleInputSubmit = () => {
        if (!question.trim()) {
            toast.error('질문을 입력해주세요!');
            return;
        }

        if (hasPaid) {
            setStep('spread');
        } else {
            setStep('payment-check');
        }
    };

    const handleUnlock = () => {
        setHasPaid(true); // Persist this in a real app context/DB
        setStep('spread');
    };

    const handleSpreadComplete = (indices: number[]) => {
        setSelectedCardIndices(indices);
        setTimeout(() => {
            setStep('result');
            // Auto reveal sequence simulation could go here or be manual
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 text-sm font-medium mb-3">
                        <Heart className="w-4 h-4 fill-current" />
                        <span>연애운 타로</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        사랑의 흐름을 읽다
                    </h1>
                </div>

                {/* Intro Step */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            당신의 연애, 썸, 혹은 짝사랑에 대한 깊은 통찰이 필요하신가요?<br />
                            과거, 현재, 미래를 아우르는 3장의 켈틱 크로스 약식 스프레드로<br />
                            관계의 흐름과 조언을 명쾌하게 풀어드립니다.
                        </p>

                        <div className="grid grid-cols-3 gap-4 my-8">
                            {['과거의 원인', '현재의 상황', '미래의 흐름'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-gold/20">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-display text-gold font-bold text-lg">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12" onClick={handleStart}>
                            무료로 시작하기 <span className="ml-1 text-xs opacity-70">(맛보기)</span>
                        </Button>
                    </div>
                )}

                {/* Input Step */}
                {step === 'input' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">
                                궁금한 점을 구체적으로 적어주세요
                            </label>
                            <Textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="예: 썸타는 그 사람과 연인으로 발전할 수 있을까요?"
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
                                placeholder="예: 이름 초성(K), 나이, 혹은 별자리 등"
                                className="min-h-[60px] bg-card/50 resize-none px-4 py-3"
                            />
                        </div>

                        <Button size="lg" variant="gold" className="w-full" onClick={handleInputSubmit}>
                            타로 카드 뽑기
                        </Button>
                    </div>
                )}

                {/* Payment Check Step */}
                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>

                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">
                                프리미엄 상세 분석
                            </h2>
                            <p className="text-muted-foreground">
                                질문에 대한 심층적인 3장 스프레드 해석과<br />
                                AI의 맞춤형 조언을 확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 전체 결과 확인하기
                        </Button>

                        <p className="text-xs text-muted-foreground/60">
                            * 커피 한 잔 값보다 저렴한 가격으로 운명을 확인하세요
                        </p>
                    </div>
                )}

                {/* Spread Step */}
                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <SpreadLayout
                            cardCount={3}
                            instruction="과거, 현재, 미래를 생각하며 3장을 뽑아주세요"
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {['과거: 원인', '현재: 상황', '미래: 흐름'].map((label, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4">{label}</h3>
                                    <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform hover:scale-105">
                                        <TarotCard
                                            size="lg"
                                            isFlipped={revealedCards.includes(i)}
                                            frontImage={undefined} // Map real images here
                                            interactive={false}
                                        />
                                    </div>
                                    {revealedCards.includes(i) && (
                                        <div className="mt-4 text-center animate-fade-in">
                                            <h4 className="font-display text-lg text-gold">{MOCK_CARDS[i].korean}</h4>
                                            <p className="text-xs text-muted-foreground">{MOCK_CARDS[i].name}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {revealedCards.length === 3 && (
                            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 animate-fade-in">
                                <h3 className="font-display text-xl text-gold-gradient mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    AI 심층 리딩 결과
                                </h3>

                                <div className="space-y-6 text-foreground/90 leading-relaxed text-sm md:text-base">
                                    <div className="p-4 bg-background/50 rounded-xl">
                                        <h4 className="font-bold text-gold mb-2">Q. {question}</h4>
                                        <p className="opacity-80">
                                            선택하신 카드들은 현재 질문자님의 상황에서 매우 긍정적인 신호를 보내고 있습니다.
                                            특히 과거의 인연(연인 카드)이 현재의 감정적 교류(컵 2)로 이어지고 있어,
                                            두 분 사이의 유대감이 깊어지는 시기라고 해석됩니다.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold mb-2">💡 미래의 조언</h4>
                                        <p>
                                            곧 새로운 기회나 열정적인 사건(완드 에이스)이 찾아올 것입니다.
                                            망설이지 말고 마음이 이끄는 대로 표현해보세요.
                                            재회나 새로운 시작을 원하신다면 지금이 적기입니다.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="flex-1">
                                            <Download className="w-4 h-4 mr-2" /> 저장
                                        </Button>
                                        <Button variant="outline" className="flex-1">
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
                featureName="연애운 타로 프리미엄"
                price={1}
            />
        </AppLayout>
    );
};

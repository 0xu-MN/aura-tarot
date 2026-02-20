import { useState } from 'react';
import { DailyCardModal } from '@/components/DailyCardModal';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { IS_BETA_ACTIVE } from "@/lib/beta-config";

const AI_SUGGESTED_QUESTIONS = [
    '오늘 나에게 필요한 조언은 무엇인가요?',
    '현재 나의 연애운은 어떤가요?',
    '새로운 시작을 앞두고 있는데 조언을 주세요',
    '지금 내가 집중해야 할 것은 무엇인가요?',
    '오늘의 행운을 높이는 방법은?',
    '현재 직장에서의 운세는 어떤가요?',
    '나의 재물운을 높이려면 어떻게 해야 하나요?',
];

export const CardDrawing = ({ onShowLogin }: { onShowLogin?: () => void }) => {
    // Auth removed - guest access for everyone now

    const [question, setQuestion] = useState('');
    const [showCardModal, setShowCardModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [drawCount, setDrawCount] = useState(0); // Used to force modal reset
    const [suggestedQuestions, setSuggestedQuestions] = useState(() => {
        // Get 3 random suggestions
        const shuffled = [...AI_SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    });

    const handleDrawCard = async () => {
        if (!question.trim()) {
            toast.error('질문을 입력해주세요', {
                description: '카드에게 물어볼 질문을 작성해주세요.',
            });
            return;
        }

        // Logic for checking draw limits (simplified for guest/beta)
        if (drawCount >= 3) {
            if (IS_BETA_ACTIVE) {
                toast.error('베타 기간 동안은 하루 3회 무료 이용만 가능합니다. 내일 다시 이용해주세요! ✨', {
                    duration: 3000,
                });
                return;
            }
            setShowPaymentModal(true);
            return;
        }

        // Increment drawCount to force DailyCardModal state reset
        setDrawCount(prev => prev + 1);
        setShowCardModal(true);
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        // Add a tiny delay to ensure state transitions smoothly
        setTimeout(() => {
            setDrawCount(prev => prev + 1);
            setShowCardModal(true);
        }, 100);
    };

    const handleCardModalClose = async () => {
        setShowCardModal(false);
        setQuestion('');
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuestion(suggestion);
    };

    return (
        <>
            <div className="bg-card rounded-3xl border border-gold/30 p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-gold" />
                    <h2 className="font-display text-2xl text-gold-gradient">
                        오늘의 카드 뽑기
                    </h2>
                </div>

                <p className="text-muted-foreground mb-6">
                    마음속 질문을 떠올리며 카드를 선택하세요
                </p>

                {/* Question Input */}
                <div className="space-y-4 mb-6">
                    <Label htmlFor="question">질문을 입력하세요</Label>
                    <Textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="솜이야, 연애운 봐줘"
                        className="min-h-[100px] bg-background/50 resize-none"
                        maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {question.length}/200
                    </p>
                </div>

                {/* AI Suggested Questions */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-gold" />
                            <p className="text-sm font-medium">AI 추천 질문</p>
                        </div>
                        <button
                            onClick={() => {
                                const shuffled = [...AI_SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5);
                                setSuggestedQuestions(shuffled.slice(0, 3));
                            }}
                            className="text-muted-foreground hover:text-gold transition-colors p-1"
                            title="질문 새로고침"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {suggestedQuestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-left px-4 py-3 rounded-xl bg-background/50 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-200 text-sm"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={handleDrawCard}
                >
                    <Sparkles className="w-5 h-5" />
                    카드 뽑기
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        오늘의 무료 카드 뽑기: {3 - drawCount}/3 남음
                    </p>
                </Button>
            </div>

            {/* Modals */}
            <DailyCardModal
                key={drawCount}
                isOpen={showCardModal}
                onClose={handleCardModalClose}
                onDrawAgain={handleDrawCard}
                onShowLogin={() => { }} // No-op
                question={question}
            />
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
                featureName="오늘의 한 장 추가 뽑기"
                featureId="daily-extra-draw"
                price={1}
            />
        </>
    );
};

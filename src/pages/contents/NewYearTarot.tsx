
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult, captureResultAsDataURL } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { SpreadLayout } from '@/components/tarot/SpreadLayout';
import { TarotCard } from '@/components/TarotCard';
import { CalendarDays, Lock, Sparkles, RefreshCw, Share2, Download, Loader2, Sun, Sunset, Snowflake, Flower, Heart, Coins, Briefcase, Activity, Users, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';
import { getWeightedCards, TarotCardData } from '@/lib/tarot-data';
import { supabase } from '@/integrations/supabase/client';

const FEATURE_ID = 'new-year-2026';

const THEMES = [
    { id: 'general', label: '전체 운세', icon: <Sparkles className="w-5 h-5" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { id: 'love', label: '연애운', icon: <Heart className="w-5 h-5" />, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { id: 'wealth', label: '재물운', icon: <Coins className="w-5 h-5" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { id: 'career', label: '커리어/승진', icon: <Briefcase className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'health', label: '건강운', icon: <Activity className="w-5 h-5" />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { id: 'relationship', label: '인간관계', icon: <Users className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { id: 'growth', label: '자기계발', icon: <BookOpen className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
];

import { BetaLockOverlay } from '@/components/beta/BetaLockOverlay';

export const NewYearTarot = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'payment-check' | 'theme-selection' | 'spread' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<typeof THEMES[0]>(THEMES[0]);

    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);
    const [aiReading, setAiReading] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentInstruction, setCurrentInstruction] = useState("");

    const handleProgress = (count: number) => {
        const prompts = [
            "올해 '초반'을 생각하며 한 장을 뽑아주세요",
            "올해 '중반'을 생각하며 한 장을 뽑아주세요",
            "올해 '후반'을 생각하며 한 장을 뽑아주세요",
            "올해 필요한 '조언'을 생각하며 마지막 한 장을 뽑아주세요"
        ];
        if (count < 4) {
            setCurrentInstruction(prompts[count] || "카드를 선택해주세요");
        } else {
            setCurrentInstruction("2026년의 운명을 확인하는 중...");
        }
    };

    // Load persisted state on mount
    useEffect(() => {
        const saved = premiumStore.getFeatureState(FEATURE_ID);
        if (saved.hasPaid && premiumStore.isPaid(FEATURE_ID)) {
            setHasPaid(true);
        }

        if (saved.readingState) {
            const state = saved.readingState;
            // Only restore state if it has the new 'selectedThemeId' property (Version Check)
            if (state.selectedThemeId) {
                // If the user already finished the reading (result step), we force a reset 
                // so they can start fresh when they come back.
                if (state.step === 'result') {
                    premiumStore.resetFeature(FEATURE_ID);
                    // Keep payment status if paid
                    if (saved.hasPaid) setHasPaid(true);
                    return;
                }

                if (state.step) setStep(state.step);
                if (state.drawnCards) setDrawnCards(state.drawnCards);
                if (state.revealedCards) setRevealedCards(state.revealedCards);
                if (state.aiReading) setAiReading(state.aiReading);

                const theme = THEMES.find(t => t.id === state.selectedThemeId);
                if (theme) setSelectedTheme(theme);
            } else {
                // Detected old state format (legacy season version) -> Force Reset
                premiumStore.resetFeature(FEATURE_ID);
                setStep('intro');
                setDrawnCards([]);
                setRevealedCards([]);
                setAiReading('');
                setHasPaid(false); // Optional: Re-check payment if needed, or keep payment but reset flow

                // If payment was valid, keep it
                if (saved.hasPaid) setHasPaid(true);
            }
        }
    }, []);

    // Save state
    useEffect(() => {
        if (step !== 'intro') {
            premiumStore.saveReadingState(FEATURE_ID, {
                step,
                drawnCards,
                revealedCards,
                aiReading,
                selectedThemeId: selectedTheme.id
            });
        }
    }, [step, drawnCards, revealedCards, aiReading, selectedTheme]);

    const handleStart = () => {
        if (hasPaid) {
            setStep('theme-selection');
        } else {
            setStep('payment-check');
        }
    };

    const handleUnlock = () => {
        setHasPaid(true);
        setStep('theme-selection');
    };

    const handleThemeSelect = (theme: typeof THEMES[0]) => {
        setSelectedTheme(theme);
        setStep('spread');
        setCurrentInstruction("올해 '초반'을 생각하며 한 장을 뽑아주세요");
    };

    const fetchAiReading = async (cards: { card: TarotCardData; isReversed: boolean }[], theme: typeof THEMES[0]) => {
        setIsAnalyzing(true);
        try {
            const prompt = `
당신은 신비로운 타로 마스터입니다.
사용자의 2026년 신년 운세를 '${theme.label}' 테마 중심으로 해석해주세요.

1. 초반: ${cards[0].card.koreanName} (${cards[0].isReversed ? '역방향' : '정방향'})
2. 중반: ${cards[1].card.koreanName} (${cards[1].isReversed ? '역방향' : '정방향'})
3. 후반: ${cards[2].card.koreanName} (${cards[2].isReversed ? '역방향' : '정방향'})
4. 조언: ${cards[3].card.koreanName} (${cards[3].isReversed ? '역방향' : '정방향'})

요청사항:
- ${theme.label} 관점에서 구체적으로 해석해주세요.
- 전체적인 1년의 흐름을 요약해주세요.
- 각 시기별(초반, 중반, 후반) 흐름과 의미를 설명해주세요.
- 마지막으로 가장 중요한 행동 조언을 주세요.
- 희망차고 긍정적인 톤을 유지하되, 조심할 점은 부드럽게 조언해주세요.
`;

            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: { messages: [{ role: 'user', content: prompt }] }
            });

            if (error) throw error;

            let content = data.message || "";
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            setAiReading(content);
        } catch (err) {
            console.error('Error fetching AI reading:', err);
            toast.error('AI 리딩을 가져오는 중 오류가 발생했습니다.');
            setAiReading("죄송합니다. AI 마스터와의 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSpreadComplete = (indices: number[]) => {
        // Weighted Logic
        // Base weight is 1. +50% -> 1.5 ~ 2, +30% -> 1.3 ~ 1-2
        // Since our utility uses integer weights (loop count), we map:
        // +50% -> weight 2 (approximate, slightly higher than 1.5 but emphasizes effectively)
        // +30% -> weight 2 (to simulate boost without precise floats)
        // Use weight 1 for normal.

        let weights: any = {};

        switch (selectedTheme.id) {
            case 'love':
                weights = { cups: 2 }; // +100% (simplest integer boost)
                break;
            case 'wealth':
                weights = { pentacles: 2 };
                break;
            case 'career':
                weights = { wands: 2, swords: 2 };
                break;
            default:
                weights = {}; // Equal
        }

        const newDrawnCards = getWeightedCards(4, weights);
        setDrawnCards(newDrawnCards);

        fetchAiReading(newDrawnCards, selectedTheme);

        setTimeout(() => {
            setStep('result');
        }, 1000);
    };

    const handleReveal = (index: number) => {
        if (!revealedCards.includes(index)) {
            setRevealedCards([...revealedCards, index]);
        }
    };

    const handleShareToLounge = async () => {
        try {
            const dataUrl = await captureResultAsDataURL('newyear-result-content');
            if (dataUrl) {
                navigate('/lounge', {
                    state: {
                        autoOpenCreate: true,
                        attachedImage: dataUrl,
                        initialTitle: `나의 2026년 ${selectedTheme.label} 🎆`,
                        initialContent: `2026년 ${selectedTheme.label} 결과를 공유합니다. #타로 #신년운세 #2026`
                    }
                });
            }
        } catch (error) {
            console.error('Error sharing to lounge:', error);
            toast.error('라운지 공유 중 오류가 발생했습니다.');
        }
    };

    const getPositionLabel = (index: number) => {
        switch (index) {
            case 0: return '초반 (1~4월)';
            case 1: return '중반 (5~8월)';
            case 2: return '후반 (9~12월)';
            case 3: return '✨ 전체 조언';
            default: return '';
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-4xl relative min-h-[80vh] flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${selectedTheme.bg} ${selectedTheme.color} ${selectedTheme.border} text-sm font-medium mb-3 transition-colors`}>
                        <CalendarDays className="w-4 h-4" />
                        <span>2026년 {step === 'result' ? selectedTheme.label : '신년운세'}</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        2026년 신년운세
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        {step === 'theme-selection'
                            ? "보고 싶은 테마를 선택하세요. 한 해 운세를 알려줄게요 🎇"
                            : "새로운 한 해, 타로가 길잡이가 돼줄게요. 🎇"}
                    </p>
                </div>

                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-8 animate-fade-in py-10">
                        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            <Sparkles className="w-16 h-16 text-indigo-200" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-xl text-foreground/90 font-medium">
                                "당신의 2026년은 어떤 모습일까요?"
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                연애, 재물, 커리어...<br />
                                가장 궁금한 테마를 선택해 집중적으로 알아보세요.<br />
                                4장의 카드가 1년의 흐름을 명확히 보여드립니다.
                            </p>
                        </div>
                        <Button size="lg" variant="gold" className="px-12 h-14 text-lg" onClick={handleStart}>
                            <Sparkles className="w-5 h-5 mr-2" />
                            2026년 운세보기
                        </Button>
                    </div>
                )}

                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse border border-gold/30">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="font-display text-2xl text-foreground">프리미엄 신년 운세</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                원하는 테마별 맞춤 심층 분석과<br />
                                2026년 핵심 시기별 흐름을 포함한<br />
                                프리미엄 리포트를 제공합니다.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-amber-400 hover:to-amber-600 text-black font-bold h-14 shadow-lg shadow-gold/20 text-lg"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 1년의 운명 확인하기
                        </Button>
                    </div>
                )}

                {step === 'theme-selection' && (
                    <div className="max-w-2xl w-full animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme)}
                                    className={`relative p-6 rounded-2xl border transition-all duration-300 group flex items-center gap-4 text-left
                                        ${theme.bg} ${theme.border} hover:scale-[1.02] hover:shadow-lg`}
                                >
                                    <div className={`p-3 rounded-full bg-black/20 ${theme.color}`}>
                                        {theme.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg mb-1 ${theme.color}`}>{theme.label}</h3>
                                        <p className="text-sm text-muted-foreground/80">
                                            {theme.label}을 중심으로 <br />2026년을 미리봅니다.
                                        </p>
                                    </div>
                                    <ArrowRight className={`w-5 h-5 absolute right-6 opacity-0 group-hover:opacity-100 transition-all ${theme.color}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'spread' && (
                    <div className="w-full animate-fade-in">
                        <div className="text-center mb-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${selectedTheme.bg} ${selectedTheme.color} ${selectedTheme.border}`}>
                                선택된 테마: {selectedTheme.label}
                            </span>
                        </div>
                        <SpreadLayout
                            cardCount={4}
                            instruction={currentInstruction}
                            onProgress={handleProgress}
                            onSpreadComplete={handleSpreadComplete}
                        />
                    </div>
                )}

                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        {/* Timeline / Cards Display */}
                        <div className="relative mb-12 px-4">
                            {/* Horizontal Line connecting cards */}
                            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent -z-10 hidden md:block" />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col items-center group">
                                        <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground mb-3 font-medium bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                            {getPositionLabel(i)}
                                        </div>
                                        <div onClick={() => handleReveal(i)} className="cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-2 w-full max-w-[120px] flex justify-center">
                                            <TarotCard
                                                size="sm"
                                                isFlipped={revealedCards.includes(i)}
                                                isReversed={drawnCards[i]?.isReversed}
                                                interactive={false}
                                                frontImage={drawnCards[i]?.card?.image}
                                            />
                                        </div>
                                        {revealedCards.includes(i) && drawnCards[i] && (
                                            <div className="mt-3 text-center animate-fade-in w-full">
                                                <span className="text-xs font-bold text-gold leading-tight block truncate">
                                                    {drawnCards[i].card.koreanName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Analysis Report */}
                        {revealedCards.length === 4 && (
                            <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-gold/20 animate-fade-in shadow-2xl">
                                <h3 className="font-display text-2xl md:text-3xl text-gold-gradient mb-8 flex items-center justify-center gap-3">
                                    <CalendarDays className="w-6 h-6 text-gold" />
                                    2026년 {selectedTheme.label} 리포트
                                </h3>

                                <div id="newyear-result-content" className="space-y-8">
                                    {/* Text Analysis */}
                                    <div className="space-y-4">
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-4 bg-black/20 rounded-2xl">
                                                <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                                                <p className="text-sm text-indigo-200/80 animate-pulse">
                                                    {selectedTheme.label} 흐름을 읽고 있습니다...
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
                                                    onClick={() => saveResultAsImage('newyear-result-content', `aura_2026_fortune`)}
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    이미지 저장
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-12 bg-white/5 border-white/10 hover:bg-white/10"
                                                    onClick={() => shareResult('신년 운세 결과', `저의 2026년 ${selectedTheme.label}을 확인해보세요!`)}
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
                                                라운지에 결과 자랑하기
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        variant="ghost"
                                        className="w-full mt-2 text-muted-foreground hover:text-white hover:bg-white/5"
                                        onClick={() => {
                                            premiumStore.resetFeature(FEATURE_ID);
                                            setHasPaid(false);
                                            setStep('intro'); // Go back to intro for New Year
                                            setRevealedCards([]);
                                            setDrawnCards([]);
                                            setAiReading('');
                                        }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        처음부터 다시 보기
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
                featureName="신년 운세"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

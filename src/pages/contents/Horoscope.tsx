import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { Star, Moon, Sun, Share2, Download, ChevronRight, Lock, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';
import { supabase } from '@/integrations/supabase/client';

const FEATURE_ID = 'horoscope-premium';

const ZODIAC_SIGNS = [
    { name: "물병자리", date: "1.20~2.18", icon: "🏺", element: "Air", trait: "창의적, 독립적" },
    { name: "물고기자리", date: "2.19~3.20", icon: "♓", element: "Water", trait: "감성적, 예술적" },
    { name: "양자리", date: "3.21~4.19", icon: "♈", element: "Fire", trait: "열정적, 도전적" },
    { name: "황소자리", date: "4.20~5.20", icon: "♉", element: "Earth", trait: "신중함, 끈기" },
    { name: "쌍둥이자리", date: "5.21~6.21", icon: "♊", element: "Air", trait: "호기심, 다재다능" },
    { name: "게자리", date: "6.22~7.22", icon: "♋", element: "Water", trait: "가정적, 감수성" },
    { name: "사자자리", date: "7.23~8.22", icon: "♌", element: "Fire", trait: "자신감, 리더십" },
    { name: "처녀자리", date: "8.23~9.23", icon: "♍", element: "Earth", trait: "섬세함, 분석적" },
    { name: "천칭자리", date: "9.24~10.22", icon: "♎", element: "Air", trait: "조화, 사교적" },
    { name: "전갈자리", date: "10.23~11.22", icon: "♏", element: "Water", trait: "통찰력, 신비로움" },
    { name: "사수자리", date: "11.23~12.24", icon: "♐", element: "Fire", trait: "자유로움, 낙천적" },
    { name: "염소자리", date: "12.25~1.19", icon: "♑", element: "Earth", trait: "성실함, 책임감" },
];

const TIMEFRAMES = [
    { id: 'daily', label: '오늘의 운세', price: 0 },
    { id: 'weekly', label: '주간 운세', price: 1 },
    { id: 'monthly', label: '월간 운세', price: 1 },
    { id: 'yearly', label: '2026년 총운', price: 1 },
];

export const Horoscope = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'select-sign' | 'select-timeframe' | 'payment-check' | 'result'>('select-sign');
    const [selectedSign, setSelectedSign] = useState<typeof ZODIAC_SIGNS[0] | null>(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState<typeof TIMEFRAMES[0] | null>(null);
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [aiReading, setAiReading] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Load persisted state on mount
    useEffect(() => {
        const saved = premiumStore.getFeatureState(FEATURE_ID);
        if (saved.hasPaid && premiumStore.isPaid(FEATURE_ID)) {
            setHasPaid(true);
        }

        if (saved.readingState) {
            const { step: savedStep, selectedSign: savedSign, selectedTimeframeId, aiReading: savedAiReading } = saved.readingState;
            if (savedStep) setStep(savedStep);
            if (savedSign) setSelectedSign(savedSign);
            if (savedAiReading) setAiReading(savedAiReading);
            if (selectedTimeframeId) {
                const tf = TIMEFRAMES.find(t => t.id === selectedTimeframeId);
                if (tf) setSelectedTimeframe(tf);
            }
        }
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (step !== 'select-sign') {
            premiumStore.saveReadingState(FEATURE_ID, {
                step,
                selectedSign,
                selectedTimeframeId: selectedTimeframe?.id,
                aiReading
            });
        }
    }, [step, selectedSign, selectedTimeframe, aiReading]);

    const fetchAiReading = async (sign: string, timeframe: string) => {
        setIsAnalyzing(true);
        try {
            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: {
                    type: 'horoscope',
                    context: {
                        sign,
                        timeframe
                    }
                }
            });

            if (error) throw error;
            if (data?.message) {
                setAiReading(data.message);
            }
        } catch (err) {
            console.error('Error fetching AI reading:', err);
            toast.error('AI 운세를 가져오는 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSignSelect = (sign: typeof ZODIAC_SIGNS[0]) => {
        setSelectedSign(sign);
        setStep('select-timeframe');
    };

    const handleTimeframeSelect = (timeframe: typeof TIMEFRAMES[0]) => {
        setSelectedTimeframe(timeframe);
        if (timeframe.price > 0 && !hasPaid) {
            setStep('payment-check');
        } else {
            setStep('result');
            if (selectedSign) {
                fetchAiReading(selectedSign.name, timeframe.label);
            }
        }
    };

    const handleUnlock = () => {
        setHasPaid(true);
        setStep('result');
        if (selectedSign && selectedTimeframe) {
            fetchAiReading(selectedSign.name, selectedTimeframe.label);
        }
    };



    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-medium mb-3">
                        <Moon className="w-4 h-4 fill-current" />
                        <span>별자리 운세</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        별들이 말하는 당신의 운명
                    </h1>
                </div>

                {/* Step 1: Select Sign */}
                {step === 'select-sign' && (
                    <div className="w-full max-w-4xl animate-fade-in">
                        <p className="text-center text-muted-foreground mb-8">
                            본인의 별자리를 선택해주세요.
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {ZODIAC_SIGNS.map((sign) => (
                                <button
                                    key={sign.name}
                                    onClick={() => handleSignSelect(sign)}
                                    className="flex flex-col items-center p-4 rounded-xl bg-card border border-border hover:border-gold hover:bg-gold/5 transition-all group"
                                >
                                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{sign.icon}</span>
                                    <span className="font-bold text-sm text-foreground">{sign.name}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1">{sign.date}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Timeframe */}
                {step === 'select-timeframe' && selectedSign && (
                    <div className="w-full max-w-md animate-fade-in space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-gold/20 mb-6">
                            <span className="text-4xl">{selectedSign.icon}</span>
                            <div>
                                <h3 className="font-bold text-lg text-gold">{selectedSign.name}</h3>
                                <p className="text-xs text-muted-foreground">{selectedSign.date} • {selectedSign.element}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
                                setStep('select-sign');
                                premiumStore.clearReadingState(FEATURE_ID);
                            }}>
                                변경
                            </Button>
                        </div>

                        <h3 className="text-center text-lg font-medium mb-4">어떤 운세가 궁금하신가요?</h3>

                        <div className="space-y-3">
                            {TIMEFRAMES.map((tf) => (
                                <button
                                    key={tf.id}
                                    onClick={() => handleTimeframeSelect(tf)}
                                    className="w-full p-4 rounded-xl bg-card border border-border hover:border-gold hover:bg-gold/5 transition-all flex items-center justify-between group"
                                >
                                    <span className="font-medium group-hover:text-gold transition-colors">{tf.label}</span>
                                    {tf.price === 0 ? (
                                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">무료</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {hasPaid ? (
                                                <Sparkles className="w-3 h-3 text-gold" />
                                            ) : (
                                                <Lock className="w-3 h-3 text-muted-foreground" />
                                            )}
                                            <span className="text-xs text-muted-foreground">Premium</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment Check */}
                {step === 'payment-check' && selectedSign && selectedTimeframe && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>

                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">
                                프리미엄 {selectedTimeframe.label}
                            </h2>
                            <p className="text-muted-foreground">
                                {selectedSign.name}의 {selectedTimeframe.label}를<br />
                                상세하게 확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 운세 확인
                        </Button>

                        <Button variant="ghost" onClick={() => setStep('select-timeframe')}>
                            뒤로 가기
                        </Button>
                    </div>
                )}

                {/* Result */}
                {step === 'result' && selectedSign && selectedTimeframe && (
                    <div id="horoscope-result-content" className="w-full max-w-2xl animate-fade-in pb-20">
                        <div className="bg-card/40 backdrop-blur-md rounded-2xl p-8 border border-gold/20 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <span className="text-9xl">{selectedSign.icon}</span>
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <span className="text-6xl mb-4 animate-bounce-slow">{selectedSign.icon}</span>
                                    <h2 className="font-display text-2xl text-gold-gradient mb-1">
                                        {selectedSign.name} {selectedTimeframe.label}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date().toLocaleDateString()} 기준
                                    </p>
                                </div>

                                <div className="space-y-6 text-foreground/90 leading-relaxed">
                                    <div className="p-6 bg-background/50 rounded-xl border-l-4 border-indigo-500">
                                        <h3 className="font-bold text-indigo-400 mb-2 text-lg">✨ AI 심층 분석</h3>
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                                <p className="text-sm text-muted-foreground animate-pulse">별들의 움직임을 읽고 있습니다...</p>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {aiReading || '운세 리딩을 불러올 수 없습니다.'}
                                            </p>
                                        )}
                                    </div>

                                    {!isAnalyzing && aiReading && (
                                        <div className="space-y-3 pt-6 border-t border-white/10">
                                            <div className="flex gap-3">
                                                <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('horoscope-result-content', `aura-horoscope-${selectedSign.name}`)}>
                                                    <Download className="w-4 h-4 mr-2" /> 저장
                                                </Button>
                                                <Button variant="outline" className="flex-1" onClick={() => shareResult(`${selectedSign.name}의 운세`, `제 별자리 운세 결과가 나왔습니다! ${selectedSign.name}의 ${selectedTimeframe.label}를 확인해보세요.`)}>
                                                    <Share2 className="w-4 h-4 mr-2" /> 공유
                                                </Button>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full mt-6"
                            onClick={() => {
                                premiumStore.resetFeature(FEATURE_ID);
                                setHasPaid(false);
                                setStep('select-sign');
                                setSelectedSign(null);
                                setSelectedTimeframe(null);
                                setAiReading('');
                            }}
                        >
                            다른 별자리 보기
                        </Button>
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName={`${selectedSign?.name} 프리미엄 운세`}
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

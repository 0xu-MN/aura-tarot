import { useState, useEffect } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { Hand, Camera, Lock, Sparkles, RefreshCw, Share2, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';

const FEATURE_ID = 'palm-reading';

export const PalmReading = () => {
    const [step, setStep] = useState<'intro' | 'upload' | 'payment-check' | 'analyzing' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Load persisted state on mount
    useEffect(() => {
        const saved = premiumStore.getFeatureState(FEATURE_ID);
        if (saved.hasPaid && premiumStore.isPaid(FEATURE_ID)) {
            setHasPaid(true);
        }

        if (saved.readingState) {
            const { step: savedStep, selectedImage: savedImage } = saved.readingState;
            if (savedStep) setStep(savedStep);
            if (savedImage) setSelectedImage(savedImage);
        }
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (step !== 'intro') {
            premiumStore.saveReadingState(FEATURE_ID, {
                step,
                selectedImage
            });
        }
    }, [step, selectedImage]);

    const handleStart = () => {
        setStep('upload');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, you'd upload this to a server
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                if (hasPaid) {
                    setStep('analyzing');
                    startAnalysis();
                } else {
                    setStep('payment-check');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const startAnalysis = () => {
        setTimeout(() => {
            setStep('result');
        }, 3000);
    };

    const handleUnlock = () => {
        setHasPaid(true);
        setStep('analyzing');
        startAnalysis();
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium mb-3">
                        <Hand className="w-4 h-4" />
                        <span>AI 손금 분석</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        손안에 담긴 운명의 지도
                    </h1>
                </div>

                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-8 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            손금은 단순한 선이 아니라 당신이 살아온 흔적과<br />
                            나아가야 할 길을 보여주는 고유한 지도입니다.<br />
                            AI 기술을 통해 손금의 깊이와 모양을 정밀 분석해 드립니다.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: Sparkles, text: '생명선과 건강' },
                                { icon: Sparkles, text: '두뇌선과 재능' },
                                { icon: Sparkles, text: '감정선과 인연' }
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-card border border-gold/10 flex flex-col items-center gap-3">
                                    <item.icon className="w-6 h-6 text-gold" />
                                    <span className="text-sm font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" variant="gold" className="px-12" onClick={handleStart}>
                            분석 시작하기
                        </Button>
                    </div>
                )}

                {step === 'upload' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                        <div className="aspect-[3/4] rounded-3xl border-2 border-dashed border-gold/30 bg-card/50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            {selectedImage ? (
                                <img src={selectedImage} alt="Uploaded hand" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Camera className="w-16 h-16 text-gold/30 mb-4" />
                                    <p className="text-muted-foreground mb-6">
                                        손바닥이 잘 보이도록<br />사진을 촬영하거나 업로드해주세요.
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <Button variant="gold" className="pointer-events-none">
                                        사진 선택하기
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {step === 'payment-check' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">프리미엄 정밀 손금 리포트</h2>
                            <p className="text-muted-foreground">
                                생명선, 두뇌선, 감정선, 태양선 등<br />
                                7대 주요 손금을 정밀 분석하여 리포트를 제공합니다.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 상세 분석 확인하기
                        </Button>
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-20">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 border-4 border-gold/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                            <Hand className="absolute inset-0 m-auto w-12 h-12 text-gold animate-pulse" />
                        </div>
                        <p className="text-lg font-medium text-gold-gradient animate-pulse">
                            AI가 손금의 결을 분석하는 중입니다...
                        </p>
                    </div>
                )}

                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="rounded-3xl overflow-hidden border border-gold/20 bg-card/40">
                                <img src={selectedImage || ''} alt="Hand analysis" className="w-full h-full object-cover" />
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-display text-2xl text-gold-gradient">당신의 손금 분석 결과</h3>

                                <div id="palm-result-content" className="space-y-4">
                                    {[
                                        { label: '생명선', score: 85, desc: '강한 생명력과 건강운을 타고나셨습니다. 규칙적인 운동이 운을 더해줍니다.' },
                                        { label: '두뇌선', score: 92, desc: '창의적이고 직관적인 사고력이 뛰어납니다. 기술이나 예술 분야에서 대성할 운입니다.' },
                                        { label: '감정선', score: 78, desc: '주변 사람들에게 따뜻하고 포용력이 넓어 대인관계 운이 매우 좋습니다.' }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-card border border-gold/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-gold" />
                                                    {item.label}
                                                </span>
                                                <span className="text-gold font-display">{item.score}점</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}

                                    <div className="flex gap-3 pt-6">
                                        <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('palm-result-content', 'aura-palm-reading')}>
                                            <Download className="w-4 h-4 mr-2" /> 저장
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => shareResult('AI 손금 분석 결과', '제 손안에 담긴 운명의 지도를 확인해보세요!')}>
                                            <Share2 className="w-4 h-4 mr-2" /> 공유
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="w-full mt-4 border border-gold/30 hover:bg-gold/10"
                                        onClick={() => {
                                            premiumStore.resetFeature(FEATURE_ID);
                                            setHasPaid(false);
                                            setStep('intro');
                                            setSelectedImage(null);
                                        }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        다시 분석하기
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName="AI 손금 분석 프리미엄"
                featureId={FEATURE_ID}
                price={1}
            />
        </AppLayout>
    );
};

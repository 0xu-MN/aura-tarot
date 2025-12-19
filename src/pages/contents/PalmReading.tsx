import { useState } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { Star, Lock, Sparkles, Upload, Loader2, Share2, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const PalmReading = () => {
    const [step, setStep] = useState<'intro' | 'payment-check' | 'upload' | 'analyzing' | 'result'>('intro');
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleStart = () => {
        if (hasPaid) {
            setStep('upload');
        } else {
            setStep('payment-check');
        }
    };

    const handleUnlock = () => {
        setHasPaid(true);
        setStep('upload');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setStep('analyzing');
                // Mock analysis delay
                setTimeout(() => {
                    setStep('result');
                }, 3000);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium mb-3">
                        <Star className="w-4 h-4 fill-current" />
                        <span>AI 손금 분석</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        손바닥에 새겨진 운명
                    </h1>
                </div>

                {/* Intro */}
                {step === 'intro' && (
                    <div className="max-w-xl w-full text-center space-y-6 animate-fade-in">
                        <p className="text-muted-foreground leading-relaxed">
                            당신의 손바닥에는 인생의 지도가 그려져 있습니다.<br />
                            생명선, 두뇌선, 감정선을 AI가 정밀하게 스캔하여<br />
                            타고난 재능과 앞으로의 운명을 해석해드립니다.
                        </p>

                        <div className="flex justify-center gap-8 my-8 opacity-70">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-20 border-2 border-dashed border-gold rounded-lg flex items-center justify-center mb-2">
                                    <Upload className="w-6 h-6 text-gold" />
                                </div>
                                <span className="text-xs">사진 업로드</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-20 border-2 border-dashed border-gold rounded-lg flex items-center justify-center mb-2">
                                    <Sparkles className="w-6 h-6 text-gold" />
                                </div>
                                <span className="text-xs">AI 분석</span>
                            </div>
                        </div>

                        <Button size="lg" variant="gold" className="w-full md:w-auto px-12" onClick={handleStart}>
                            손금 분석 시작하기
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
                                프리미엄 손금 리포트
                            </h2>
                            <p className="text-muted-foreground">
                                고해상도 이미지 분석 기술을 통한<br />
                                3대 주요선 및 운명선 상세 리포트를 확인하세요.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 손금 확인
                        </Button>
                    </div>
                )}

                {/* Upload */}
                {step === 'upload' && (
                    <div className="max-w-md w-full text-center space-y-6 animate-fade-in py-12">
                        <div className="border-2 border-dashed border-gold/40 rounded-2xl p-12 hover:bg-gold/5 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-12 h-12 text-gold mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">손바닥 사진 올리기</h3>
                            <p className="text-sm text-muted-foreground">
                                손바닥이 잘 보이도록 밝은 곳에서 촬영해주세요.<br />
                                (터치하여 업로드)
                            </p>
                        </div>
                    </div>
                )}

                {/* Analyzing */}
                {step === 'analyzing' && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12 relative">
                        {selectedImage && (
                            <div className="w-48 h-64 mx-auto rounded-xl overflow-hidden relative shadow-2xl border border-gold/30">
                                <img src={selectedImage} alt="Palm" className="w-full h-full object-cover opacity-50" />
                                {/* Scanning Animation line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gold shadow-[0_0_15px_rgba(218,165,32,1)] animate-[scan_2s_ease-in-out_infinite]" />
                            </div>
                        )}

                        <div>
                            <h3 className="font-display text-xl text-gold animate-pulse mb-2">AI가 손금을 분석 중입니다...</h3>
                            <p className="text-sm text-muted-foreground">생명선의 굴곡, 두뇌선의 길이, 감정선의 깊이 측정 중</p>
                        </div>
                    </div>
                )}

                {/* Result */}
                {step === 'result' && (
                    <div className="w-full max-w-4xl animate-fade-in pb-20">
                        <div id="palm-result-content" className="bg-card/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 flex flex-col md:flex-row gap-8">
                            {/* Image with overlay mock */}
                            <div className="w-full md:w-1/3 aspect-[3/4] rounded-xl overflow-hidden relative border border-gold/30">
                                <img src={selectedImage!} alt="Palm Result" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Mock SVG overlay */}
                                    <svg viewBox="0 0 100 133" className="w-full h-full stroke-gold stroke-[0.5] fill-none opacity-80">
                                        <path d="M 20 60 Q 40 80 50 120" strokeDasharray="2,1" />
                                        <path d="M 20 50 Q 50 60 90 55" strokeDasharray="2,1" />
                                        <path d="M 20 40 Q 40 45 80 30" strokeDasharray="2,1" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <h3 className="font-display text-2xl text-gold-gradient flex items-center gap-2">
                                    <Sparkles className="w-6 h-6" />
                                    분석 결과
                                </h3>

                                <div className="space-y-4">
                                    <div className="bg-background/50 p-4 rounded-lg border-l-2 border-red-300">
                                        <h4 className="font-bold text-red-300 mb-1">❤️ 감정선</h4>
                                        <p className="text-sm opacity-90 leading-relaxed">
                                            길고 선명하게 뻗어있는 감정선은 풍부한 감수성과 따뜻한 마음씨를 나타냅니다.
                                            사랑에 있어서 헌신적이며, 타인의 감정을 잘 이해하는 공감 능력이 뛰어납니다.
                                        </p>
                                    </div>
                                    <div className="bg-background/50 p-4 rounded-lg border-l-2 border-blue-300">
                                        <h4 className="font-bold text-blue-300 mb-1">🧠 두뇌선</h4>
                                        <p className="text-sm opacity-90 leading-relaxed">
                                            월구 방향으로 완만하게 휘어지는 두뇌선은 창의적이고 예술적인 재능을 암시합니다.
                                            논리보다는 직관이 발달해 있으며, 아이디어가 풍부한 기획자나 예술가 타입입니다.
                                        </p>
                                    </div>
                                    <div className="bg-background/50 p-4 rounded-lg border-l-2 border-green-300">
                                        <h4 className="font-bold text-green-300 mb-1">🌿 생명선</h4>
                                        <p className="text-sm opacity-90 leading-relaxed">
                                            손목까지 길고 깊게 이어지는 생명선은 타고난 건강 체질과 장수할 운명을 보여줍니다.
                                            에너지가 넘치고 회복력이 좋아 웬만한 스트레스는 잘 이겨냅니다.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('palm-result-content', 'aura-palm-reading')}>
                                        <Download className="w-4 h-4 mr-2" /> 리포트 저장
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => shareResult('AI 손금 분석 결과', '제 손금에는 예술가적 기질이 숨어있대요! 당신의 손금도 확인해보세요.')}>
                                        <Share2 className="w-4 h-4 mr-2" /> 공유하기
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    className="w-full mt-4 border border-gold/30 hover:bg-gold/10"
                                    onClick={() => {
                                        setStep('upload');
                                        setSelectedImage(null);
                                    }}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    다른 손금 분석
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CSS to support scanning animation */}
                <style>{`
                    @keyframes scan {
                        0% { top: 0%; opacity: 0; }
                        50% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                `}</style>
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName="손금 분석 프리미엄"
                price={1}
            />
        </AppLayout>
    );
};

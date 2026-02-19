import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { premiumStore } from '@/lib/premiumStore';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    featureName: string;
    featureId: string; // Added to track which feature is being paid for
    price?: number;
}

export const PaymentModal = ({
    isOpen,
    onClose,
    onSuccess,
    featureName,
    featureId,
    price = 1
}: PaymentModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate payment processing delay
        setTimeout(() => {
            setIsProcessing(false);

            // Persist payment status
            premiumStore.setPaid(featureId);

            // Close modal first, then trigger success to avoid UI transition conflicts
            onClose();

            setTimeout(() => {
                onSuccess();
                toast.success('결제가 완료되었습니다!', {
                    description: `${featureName} 컨텐츠가 해금되었습니다.`,
                });
            }, 300);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-gold/20 via-mystic-purple/20 to-background flex items-center justify-center">
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-background/50 hover:bg-background transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                            <Sparkles className="w-6 h-6 text-gold" />
                        </div>
                        <h2 className="font-display text-xl text-gold-gradient">프리미엄 컨텐츠</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium mb-2">{featureName}</h3>
                        <p className="text-muted-foreground text-sm">
                            더 깊이 있는 해석과 통찰을 통해<br />
                            당신의 궁금증을 명확하게 해결해드립니다.
                        </p>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-gold" />
                            <span>심층 3~5장 스프레드 분석</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-gold" />
                            <span>상황별 맞춤형 상세 조언</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-gold" />
                            <span>광고 없는 쾌적한 환경</span>
                        </div>
                    </div>

                    <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full h-12 text-lg bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90 text-black font-medium shadow-lg shadow-gold/20"
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                <span>결제 처리 중...</span>
                            </div>
                        ) : (
                            <span>{price}원에 잠금 해제</span>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-muted-foreground/60">
                        <ShieldCheck className="w-3 h-3" />
                        <span>안전한 결제 시스템으로 보호됩니다</span>
                    </div>

                    {/* Developer Bypass */}
                    {import.meta.env.DEV && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-4 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-auto py-1"
                            onClick={() => {
                                premiumStore.setPaid(featureId);
                                onClose();
                                setTimeout(() => {
                                    onSuccess();
                                    toast.info('⚡️ 개발자 모드: 결제가 우회되었습니다.');
                                }, 300);
                            }}
                        >
                            ⚡️ DEVELOPER BYPASS
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

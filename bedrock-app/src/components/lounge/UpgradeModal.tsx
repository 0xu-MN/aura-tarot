import { X, Check, Star, Sparkles, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
    if (!isOpen) return null;

    const benefits = [
        {
            icon: <Star className="w-5 h-5 text-gold" />,
            title: "상위 1% 프라이빗 리그 입장",
            description: "자산가, 연애 마스터, CEO 전용 라운지에서 고품격 대화 참여"
        },
        {
            icon: <Shield className="w-5 h-5 text-gold" />,
            title: "검증된 유저들과의 네트워킹",
            description: "신뢰할 수 있는 소수 정예 멤버들과의 실시간 익명 익명 소통"
        },
        {
            icon: <Trophy className="w-5 h-5 text-gold" />,
            title: "프리미엄 전용 콘텐츠",
            description: "고급 투자 정보, 연애 비법, 비즈니스 인사이트 등 독점 공유"
        },
        {
            icon: <Sparkles className="w-5 h-5 text-gold" />,
            title: "무제한 카드 리딩",
            description: "일일 제한 없는 타로 리딩과 상세한 심층 해석 제공"
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/95 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg overflow-hidden bg-card rounded-[2rem] border border-gold/30 shadow-2xl animate-scale-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 md:p-10 pt-12 text-center">
                    {/* Header Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gold/10 flex items-center justify-center text-5xl">
                        👑
                    </div>

                    <h2 className="font-display text-3xl text-gold-gradient mb-3">
                        Aura Premium
                    </h2>
                    <p className="text-muted-foreground mb-10 max-w-[280px] mx-auto text-sm leading-relaxed">
                        이제껏 경험하지 못한 특별한 순간, <br />
                        상위 1%만을 위한 공간이 시작됩니다.
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-6 text-left mb-10">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-gold/5 rounded-2xl border border-gold/20 p-6 mb-8 text-center">
                        <span className="text-xs text-gold font-bold tracking-widest uppercase mb-1 block">
                            Special Offer
                        </span>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-muted-foreground line-through text-lg">₩49,000</span>
                            <span className="text-3xl font-display text-white">₩29,900</span>
                        </div>
                        <p className="text-xs text-muted-foreground">월 정기 구독 (첫 달 할인 40%)</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <Button
                            variant="gold"
                            size="lg"
                            className="w-full h-14 text-lg font-bold shadow-lg shadow-gold/20 hover:scale-[1.02] transition-transform"
                            onClick={() => {
                                // Implement payment logic later
                                onClose();
                            }}
                        >
                            프리미엄 시작하기
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-sm text-muted-foreground hover:text-white transition-colors py-2"
                        >
                            다음에 할게요
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold/10 rounded-full blur-[80px]" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-mystic-purple/10 rounded-full blur-[80px]" />
            </div>
        </div>
    );
};

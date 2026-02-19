import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BETA_LOCK_MESSAGE, IS_BETA_ACTIVE } from '@/lib/beta-config';

interface BetaLockOverlayProps {
    title?: string;
    onGoBack?: () => void;
}

export const BetaLockOverlay = ({ title, onGoBack }: BetaLockOverlayProps) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onGoBack) {
            onGoBack();
        } else {
            navigate(-1);
        }
    };

    if (!IS_BETA_ACTIVE) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Lock className="w-8 h-8 text-gold" />
            </div>

            {title && (
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                    {title}
                </h2>
            )}

            <p className="text-lg text-gold/90 font-medium mb-8 max-w-xs leading-relaxed">
                {BETA_LOCK_MESSAGE}
            </p>

            <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2 border-white/20 hover:bg-white/10 text-white"
            >
                <ArrowLeft className="w-4 h-4" />
                돌아가기
            </Button>
        </div>
    );
};

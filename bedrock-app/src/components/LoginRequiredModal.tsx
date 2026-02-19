import { X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowLogin?: () => void;
    message?: string;
}

export const LoginRequiredModal = ({
    isOpen,
    onClose,
    onShowLogin,
    message = "로그인이 필요한 서비스입니다."
}: LoginRequiredModalProps) => {

    if (!isOpen) return null;

    const handleLoginClick = () => {
        onClose();
        if (onShowLogin) {
            onShowLogin();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm bg-card rounded-2xl border border-gold/30 shadow-2xl p-6 animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-4 pt-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                        <LogIn className="w-6 h-6 text-gold" />
                    </div>

                    <h3 className="font-display text-xl text-gold-gradient">
                        로그인 안내
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                        {message}
                        {"\n"}로그인하고 모든 기능을 이용해보세요!
                    </p>

                    <Button
                        className="w-full bg-gold text-black hover:bg-gold-light mt-4"
                        onClick={handleLoginClick}
                    >
                        로그인 / 회원가입 하러가기
                    </Button>
                </div>
            </div>
        </div>
    );
};

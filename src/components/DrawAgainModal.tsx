import { Button } from '@/components/ui/button';
import { RotateCcw, Home } from 'lucide-react';

interface DrawAgainModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSameQuestion: () => void;
    onNewQuestion: () => void;
}

export const DrawAgainModal = ({ isOpen, onClose, onSameQuestion, onNewQuestion }: DrawAgainModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in p-8">
                <h2 className="font-display text-2xl text-gold-gradient mb-4 text-center">
                    다시 뽑기
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                    어떻게 진행하시겠습니까?
                </p>

                <div className="space-y-3">
                    <Button
                        variant="gold"
                        className="w-full justify-start gap-3 h-auto py-4"
                        onClick={onSameQuestion}
                    >
                        <RotateCcw className="w-5 h-5" />
                        <div className="flex-1 text-left">
                            <p className="font-medium">같은 질문으로 한 장 더 뽑기</p>
                            <p className="text-xs opacity-80">현재 질문으로 카드를 추가로 뽑습니다</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-4"
                        onClick={onNewQuestion}
                    >
                        <Home className="w-5 h-5" />
                        <div className="flex-1 text-left">
                            <p className="font-medium">다른 질문으로 새로 뽑기</p>
                            <p className="text-xs opacity-80">홈으로 돌아가서 새로운 질문을 시작합니다</p>
                        </div>
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={onClose}
                >
                    취소
                </Button>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { INTEREST_CATEGORIES } from '@/types/user';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
    const { signUp } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    // Step 1 fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [nicknameChecking, setNicknameChecking] = useState(false);
    const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);

    // Step 2 fields
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    // Nickname duplicate check with debounce
    useEffect(() => {
        if (!nickname || nickname.length < 2) {
            setNicknameAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setNicknameChecking(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('nickname')
                    .eq('nickname', nickname)
                    .maybeSingle();

                if (error) throw error;
                setNicknameAvailable(!data);
            } catch (error) {
                console.error('Nickname check error:', error);
                setNicknameAvailable(null);
            } finally {
                setNicknameChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [nickname]);

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 6) {
            toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        if (nicknameAvailable === false) {
            toast.error('이미 사용 중인 닉네임입니다.');
            return;
        }

        if (nicknameChecking) {
            toast.error('닉네임 중복 확인 중입니다. 잠시만 기다려주세요.');
            return;
        }

        setStep(2);
    };

    const toggleInterest = (interestId: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interestId)
                ? prev.filter((id) => id !== interestId)
                : [...prev, interestId]
        );
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedInterests.length === 0) {
            toast.error('최소 1개 이상의 관심분야를 선택해주세요.');
            return;
        }

        setLoading(true);

        const { error } = await signUp({
            username,
            password,
            name,
            nickname,
            interests: selectedInterests as any,
        });

        if (error) {
            toast.error('회원가입 실패', {
                description: error,
            });
        } else {
            toast.success('회원가입 완료!', {
                description: '로그인되었습니다.',
            });
            onClose();
            resetForm();
        }

        setLoading(false);
    };

    const resetForm = () => {
        setStep(1);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setNickname('');
        setSelectedInterests([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/90 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <h2 className="font-display text-3xl text-gold-gradient mb-2 text-center">
                        회원가입
                    </h2>
                    <p className="text-muted-foreground text-center mb-6">
                        {step === 1
                            ? '기본 정보를 입력해주세요'
                            : '관심분야를 선택해주세요 (맞춤 추천에 활용됩니다)'}
                    </p>

                    {/* Progress indicator */}
                    <div className="flex gap-2 mb-6">
                        <div
                            className={cn(
                                'flex-1 h-1 rounded-full transition-colors',
                                step >= 1 ? 'bg-gold' : 'bg-muted'
                            )}
                        />
                        <div
                            className={cn(
                                'flex-1 h-1 rounded-full transition-colors',
                                step >= 2 ? 'bg-gold' : 'bg-muted'
                            )}
                        />
                    </div>

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <form onSubmit={handleStep1Submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">이메일</Label>
                                <Input
                                    id="username"
                                    type="email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="이메일을 입력하세요 (예: user@example.com)"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호 (최소 6자)"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름을 입력하세요"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nickname">닉네임</Label>
                                <div className="relative">
                                    <Input
                                        id="nickname"
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="닉네임을 입력하세요"
                                        required
                                        className={cn(
                                            "bg-background/50 pr-10",
                                            nicknameAvailable === true && "border-green-500",
                                            nicknameAvailable === false && "border-red-500"
                                        )}
                                    />
                                    {nicknameChecking && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {!nicknameChecking && nicknameAvailable === true && (
                                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                    )}
                                    {!nicknameChecking && nicknameAvailable === false && (
                                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                    )}
                                </div>
                                {nicknameAvailable === false && (
                                    <p className="text-xs text-red-500">
                                        이미 사용 중인 닉네임입니다
                                    </p>
                                )}
                                {nicknameAvailable === true && (
                                    <p className="text-xs text-green-500">
                                        사용 가능한 닉네임입니다
                                    </p>
                                )}
                                {nicknameAvailable === null && nickname.length >= 2 && !nicknameChecking && (
                                    <p className="text-xs text-muted-foreground">
                                        앱에서 닉네임으로 표시됩니다
                                    </p>
                                )}
                                {nickname.length < 2 && (
                                    <p className="text-xs text-muted-foreground">
                                        2자 이상 입력해주세요
                                    </p>
                                )}
                            </div>

                            <Button type="submit" variant="gold" className="w-full">
                                다음
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Interest Selection */}
                    {step === 2 && (
                        <form onSubmit={handleFinalSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                {INTEREST_CATEGORIES.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => toggleInterest(category.id)}
                                        className={cn(
                                            'relative p-4 rounded-xl border-2 transition-all duration-200',
                                            'hover:scale-105 text-left',
                                            selectedInterests.includes(category.id)
                                                ? 'border-gold bg-gold/10'
                                                : 'border-gold/30 bg-background/50'
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-2xl">{category.icon}</span>
                                            {selectedInterests.includes(category.id) && (
                                                <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-background" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium">{category.label}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="flex-1"
                                >
                                    이전
                                </Button>
                                <Button
                                    type="submit"
                                    variant="gold"
                                    className="flex-1"
                                    disabled={loading || selectedInterests.length === 0}
                                >
                                    {loading ? '가입 중...' : '가입 완료'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            이미 계정이 있으신가요?{' '}
                            <button
                                onClick={() => {
                                    resetForm();
                                    onSwitchToLogin();
                                }}
                                className="text-gold hover:text-gold/80 font-medium"
                            >
                                로그인
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

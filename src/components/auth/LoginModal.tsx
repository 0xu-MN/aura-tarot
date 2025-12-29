import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
    saveRememberedEmail,
    getRememberedEmail,
    clearRememberedEmail,
    saveAutoLoginPreference,
    getAutoLoginPreference
} from '@/lib/authStorage';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
    const { signIn, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Load remembered email on mount
    useEffect(() => {
        const rememberedEmail = getRememberedEmail();
        if (rememberedEmail) {
            setUsername(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const {
                data: { user, session },
                error: signInError,
            } = await supabase.auth.signInWithPassword({
                email: username,
                password: password,
            });

            if (signInError) {
                toast.error(signInError.message === "Invalid login credentials" ? "입력하신 정보가 일치하지 않습니다." : "로그인 중 오류가 발생하였습니다.");
                setLoading(false);
                return;
            }

            // user와 session 두 값 모두 null이 아닐 경우에만 로그인이 완료되었음을 의미
            if (user && session) {
                // Save preferences
                if (rememberMe) {
                    saveRememberedEmail(username);
                } else {
                    clearRememberedEmail();
                }

                toast.success("로그인을 완료하였습니다.");
                onClose();
                navigate("/home");
            }

            setLoading(false);
        } catch (error) {
            console.error('Login error:', error);
            toast.error("로그인 중 오류가 발생하였습니다.");
            setLoading(false);
        }
    }

    // Developer mode bypass
    const handleDevMode = () => {
        toast.success('개발자 모드로 진입합니다', {
            description: '데이터베이스 없이 UI를 테스트할 수 있습니다.',
        });
        onClose();
        navigate('/home');
    };

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <h2 className="font-display text-3xl text-gold-gradient mb-2 text-center">
                        로그인
                    </h2>
                    <p className="text-muted-foreground text-center mb-6">
                        오늘의 운세를 확인하세요
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="비밀번호를 입력하세요"
                                required
                                className="bg-background/50"
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember-me"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <Label
                                htmlFor="remember-me"
                                className="text-sm font-normal cursor-pointer"
                            >
                                이메일 기억하기
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            variant="gold"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">또는</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 border-white/10 hover:bg-white/5 hover:text-white"
                            onClick={signInWithGoogle}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google로 계속하기
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            계정이 없으신가요?{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="text-gold hover:text-gold/80 font-medium"
                            >
                                회원가입
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import supabase from '@/utils/supabase';
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
    const { signIn } = useAuth();
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

                        {/* Developer Mode Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full text-xs opacity-50 hover:opacity-100"
                            onClick={handleDevMode}
                        >
                            🔧 개발자 모드 (DB 없이 테스트)
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

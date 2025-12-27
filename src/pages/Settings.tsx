import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Heart, TrendingUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { INTEREST_CATEGORIES } from '@/types/user';

const Settings = () => {
    const { user, userProfile, signOut } = useAuth();
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Reset error state when avatar changes
    useEffect(() => {
        setImgError(false);
    }, [userProfile?.avatar_url]);

    const handleLogout = async () => {
        await signOut();
        localStorage.removeItem('dev_mode'); // Clear developer mode on logout
        window.location.href = '/';
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-8">
                    설정
                </h1>

                {/* Profile Section */}
                <div className="bg-card rounded-2xl border border-gold/20 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16 border border-gold/20">
                            {userProfile?.avatar_url && !imgError ? (
                                <img
                                    key={userProfile.avatar_url}
                                    src={userProfile.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <AvatarFallback className="bg-gold/20 text-gold text-xl">
                                    {userProfile?.nickname?.charAt(0) || 'U'}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="font-display text-xl text-gold">
                                {userProfile?.nickname || '사용자'}
                            </h2>
                            <p className="text-sm text-muted-foreground mb-2">
                                @{userProfile?.username}
                            </p>
                            {/* Interests */}
                            <div className="flex flex-wrap gap-1.5">
                                {userProfile?.interests?.map((interestId) => {
                                    const category = INTEREST_CATEGORIES.find(c => c.id === interestId);
                                    if (!category) return null;
                                    return (
                                        <span
                                            key={interestId}
                                            className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs border border-gold/20"
                                        >
                                            {category.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowProfileEdit(true)}>
                            <User className="w-4 h-4" />
                            수정
                        </Button>
                    </div>

                    <Separator className="my-4 bg-gold/20" />

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">이름</span>
                            <span>{userProfile?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">가입일</span>
                            <span>
                                {userProfile?.created_at
                                    ? new Date(userProfile.created_at).toLocaleDateString('ko-KR')
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-card rounded-2xl border border-gold/20 p-6 mb-6">
                    <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gold" />
                        사용 통계
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-display text-gold mb-1">
                                {userProfile?.daily_draws_remaining !== undefined
                                    ? `${3 - userProfile.daily_draws_remaining}/3`
                                    : '0/3'
                                }
                            </p>
                            <p className="text-sm text-muted-foreground">오늘 사용한 카드</p>
                        </div>
                        <div className="bg-background/50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-display text-gold mb-1">
                                {userProfile?.total_draws || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">총 카드 뽑기</p>
                        </div>
                    </div>
                </div>



                {/* App Preferences */}
                <div className="bg-card rounded-2xl border border-gold/20 p-6 mb-6">
                    <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-gold" />
                        앱 설정
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notifications" className="cursor-pointer">
                                알림 받기
                            </Label>
                            <Switch id="notifications" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="daily-reminder" className="cursor-pointer">
                                매일 운세 알림
                            </Label>
                            <Switch id="daily-reminder" />
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                </Button>

                {/* Developer Mode Toggle (Hidden) */}
                <div
                    className="mt-8 text-center"
                    onClick={() => {
                        const currentCount = parseInt(sessionStorage.getItem('dev_click_count') || '0');
                        if (currentCount + 1 >= 10) {
                            const isDev = localStorage.getItem('dev_mode') === 'true';
                            if (isDev) {
                                localStorage.removeItem('dev_mode');
                                toast.info('개발자 모드가 비활성화되었습니다.');
                            } else {
                                localStorage.setItem('dev_mode', 'true');
                                toast.success('개발자 모드가 활성화되었습니다! 🛠️');
                            }
                            sessionStorage.removeItem('dev_click_count');
                        } else {
                            sessionStorage.setItem('dev_click_count', (currentCount + 1).toString());
                        }
                    }}
                >
                    <span className="text-xs text-muted-foreground/30 cursor-default select-none transition-colors hover:text-muted-foreground/50">
                        Version 1.0.0
                    </span>
                </div>

                {/* Profile Edit Modal */}
                <ProfileEditModal
                    isOpen={showProfileEdit}
                    onClose={() => setShowProfileEdit(false)}
                />
            </div>
        </AppLayout>
    );
};

export default Settings;

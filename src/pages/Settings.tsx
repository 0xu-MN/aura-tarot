import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Heart, TrendingUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
    const { user, userProfile, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
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
                        <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-gold/20 text-gold text-xl">
                                {userProfile?.nickname?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="font-display text-xl text-gold">
                                {userProfile?.nickname || '사용자'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                @{userProfile?.username}
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
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
                                {userProfile?.daily_draws_remaining || 0}/3
                            </p>
                            <p className="text-sm text-muted-foreground">오늘 남은 카드</p>
                        </div>
                        <div className="bg-background/50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-display text-gold mb-1">
                                {userProfile?.total_draws || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">총 카드 뽑기</p>
                        </div>
                    </div>
                </div>

                {/* Interests */}
                <div className="bg-card rounded-2xl border border-gold/20 p-6 mb-6">
                    <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-gold" />
                        관심 분야
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {userProfile?.interests?.map((interest: string) => (
                            <span
                                key={interest}
                                className="px-3 py-1.5 rounded-full bg-gold/20 text-gold text-sm"
                            >
                                {interest === 'love' && '연애운'}
                                {interest === 'compatibility' && '궁합'}
                                {interest === 'reunion' && '재회확률'}
                                {interest === 'newyear' && '신년운세'}
                                {interest === 'zodiac' && '별자리 운세'}
                                {interest === 'career' && '직업운'}
                                {interest === 'wealth' && '재물운'}
                                {interest === 'health' && '건강운'}
                                {interest === 'study' && '학업운'}
                                {interest === 'family' && '가족운'}
                            </span>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                        관심분야 수정
                    </Button>
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
            </div>
        </AppLayout>
    );
};

export default Settings;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, MessageSquare, Eye, Heart, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CommunityLounge = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'lounge' | 'premium'>('lounge');
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);

    // Check developer mode
    useEffect(() => {
        const devMode = localStorage.getItem('dev_mode') === 'true';
        setIsDeveloperMode(devMode);
        
        // If not in developer mode, redirect back with toast
        if (!devMode) {
            toast.info('라운지 준비 중', {
                description: '곧 오픈 예정입니다. 조금만 기다려주세요!',
            });
            navigate('/home');
        }
    }, [navigate]);

    // Mock data for general lounge
    const mockPosts = [
        {
            id: 1,
            user: { nickname: '에뛰드', avatar: '에' },
            title: '승무원이야 썬다걸 했는데',
            time: '25분전',
            views: 180,
            comments: 32,
            category: 'BEST'
        },
        {
            id: 2,
            user: { nickname: '타로마스터', avatar: '타' },
            title: '2025 부동산 전망 공유',
            time: '45분전',
            views: 122,
            comments: 18,
            category: 'BEST'
        },
        {
            id: 3,
            user: { nickname: '썰녀', avatar: '썰' },
            title: '썰녀의 오마카세 가서 사치했음ㅋㅋ',
            time: '1시간전',
            views: 95,
            comments: 24,
            image: true
        },
        {
            id: 4,
            user: { nickname: '알쓸정', avatar: '알' },
            title: '알쓸정 데이트 코스 알려줌ㅋㅋ',
            time: '2시간전',
            views: 122,
            comments: 32
        },
        {
            id: 5,
            user: { nickname: '최사운', avatar: '최' },
            title: '최사 운빨로 코인 비교',
            time: '3시간전',
            views: 122,
            comments: 21
        },
    ];

    // Premium lounges
    const premiumLounges = [
        {
            id: 1,
            name: '자산가 리그',
            description: '부동산, 재테크, 핫플레이스 등 다양한 정보 교류와 데이트까지 가능해요',
            icon: '💰',
            members: 1234
        },
        {
            id: 2,
            name: '연애 마스터 리그',
            description: '연애 고민 상담부터 썸 타는 법까지',
            icon: '💕',
            members: 892
        },
        {
            id: 3,
            name: 'CEO 리그',
            description: '비즈니스 네트워킹과 인사이트 공유',
            icon: '👔',
            members: 567
        }
    ];

    // If not in developer mode, don't render (will redirect)
    if (!isDeveloperMode) {
        return null;
    }

    const isPremium = (userProfile as any)?.is_premium || false;

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header with Tab Switcher */}
                <div className="mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <button
                            onClick={() => setActiveTab('lounge')}
                            className={cn(
                                'font-display text-2xl transition-colors',
                                activeTab === 'lounge'
                                    ? 'text-gold'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Lounge
                        </button>
                        <span className="text-2xl text-muted-foreground">|</span>
                        <button
                            onClick={() => setActiveTab('premium')}
                            className={cn(
                                'font-display text-2xl transition-colors flex items-center gap-2',
                                activeTab === 'premium'
                                    ? 'text-gold'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Premium
                            {!isPremium && <Lock className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Lounge Tab */}
                {activeTab === 'lounge' && (
                    <div className="space-y-4">
                        <div className="bg-card rounded-2xl border border-gold/20 p-6">
                            <h2 className="font-display text-xl text-gold mb-4">
                                오늘의 한 장 라운지
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                타로 결과를 공유하고 소통하는 공간입니다
                            </p>

                            {/* Post List */}
                            <div className="space-y-3">
                                {mockPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-background/50 rounded-xl p-4 hover:bg-background/80 transition-colors cursor-pointer border border-transparent hover:border-gold/20"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarFallback className="bg-gold/20 text-gold text-sm">
                                                    {post.user.avatar}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {post.category && (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">
                                                            {post.category}
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-medium">
                                                        {post.user.nickname}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {post.time}
                                                    </span>
                                                </div>
                                                <p className="text-sm mb-2 truncate">
                                                    {post.title}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {post.views}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        {post.comments}
                                                    </span>
                                                </div>
                                            </div>
                                            {post.image && (
                                                <div className="w-12 h-12 rounded-lg bg-gold/10 flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Premium Tab */}
                {activeTab === 'premium' && (
                    <div className="space-y-4">
                        {premiumLounges.map((lounge) => (
                            <div
                                key={lounge.id}
                                className="bg-card rounded-2xl border border-gold/20 p-6 hover:border-gold/40 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-mystic-purple/20 flex items-center justify-center text-3xl flex-shrink-0">
                                        {lounge.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-display text-lg text-gold">
                                                {lounge.name}
                                            </h3>
                                            {!isPremium && (
                                                <Lock className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {lounge.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {lounge.members.toLocaleString()}명 참여 중
                                            </span>
                                            {isPremium ? (
                                                <Button size="sm" variant="gold">
                                                    입장하기
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline">
                                                    업그레이드
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!isPremium && (
                            <div className="bg-gradient-to-r from-gold/10 to-mystic-purple/10 rounded-2xl border border-gold/20 p-6 text-center">
                                <Lock className="w-12 h-12 mx-auto mb-4 text-gold" />
                                <h3 className="font-display text-xl text-gold mb-2">
                                    프리미엄 멤버십이 필요합니다
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    월 29,900원으로 모든 프리미엄 라운지에 접근하세요
                                </p>
                                <Button variant="gold" size="lg">
                                    프리미엄 가입하기
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Floating Write Button (Lounge only) */}
                {activeTab === 'lounge' && (
                    <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gold hover:bg-gold/90 shadow-lg shadow-gold/20 flex items-center justify-center transition-all hover:scale-110">
                        <Edit3 className="w-6 h-6 text-background" />
                    </button>
                )}
            </div>
        </AppLayout>
    );
};

export default CommunityLounge;

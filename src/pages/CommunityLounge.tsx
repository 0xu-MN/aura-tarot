import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, MessageSquare, Eye, Heart, Edit3, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { PostDetailModal } from '@/components/community/PostDetailModal';

const CATEGORIES = [
    { id: 'all', label: '전체' },
    { id: 'love', label: '연애고민' },
    { id: 'story', label: '썰소' },
    { id: 'invest', label: '투자' },
    { id: 'random', label: '아무거나' },
];

const CommunityLounge = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'lounge' | 'premium'>('lounge');
    const [activeCategory, setActiveCategory] = useState('all');
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);
    const location = useLocation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [initialPostData, setInitialPostData] = useState<{
        images: string[];
        title: string;
        content: string;
        type: string;
    } | null>(null);

    // Check developer mode and location state
    useEffect(() => {
        const devMode = localStorage.getItem('dev_mode') === 'true';
        setIsDeveloperMode(devMode);
        if (!devMode) {
            toast.info('라운지 준비 중', {
                description: '곧 오픈 예정입니다. 조금만 기다려주세요!',
            });
            navigate('/home');
        }

        if (location.state?.autoOpenCreate) {
            setInitialPostData({
                images: location.state.attachedImage ? [location.state.attachedImage] : [],
                title: location.state.initialTitle || '',
                content: location.state.initialContent || '',
                type: 'tarot'
            });
            setShowCreateModal(true);
            // Clear location state to prevent re-opening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, navigate]);

    // Mock data for general lounge
    const [mockPosts, setMockPosts] = useState([
        {
            id: 1,
            author: '에뛰드',
            avatar: '에',
            type: '연애고민',
            title: '예쁜 승무원이랑 썸타게 됐는데',
            content: '오늘 타로 결과가 너무 좋게 나와서 대시해봤는데 정말 잘 됐어요! 앞날이 기대되네요.',
            time: '25분전',
            timestamp: '25분전',
            views: 180,
            likes: 122,
            comments: 32,
            category: 'BEST'
        },
        {
            id: 2,
            author: '푸른늑대',
            avatar: '푸',
            type: '투자',
            title: '2025 부동산 정책 공유',
            content: '새로운 부동산 정책이 발표되었습니다. 투자에 참고하세요!',
            time: '15분전',
            timestamp: '15분전',
            views: 400,
            likes: 122,
            comments: 42,
            category: 'BEST'
        },
        {
            id: 3,
            author: '오마카세킬러',
            avatar: '오',
            type: '썰소',
            title: '썸녀랑 오마카세 가서 사진찍어줄래',
            content: '오마카세 갔는데 분위기 너무 좋았어요. 사진 잘 찍어주는 법 공유합니다.',
            time: '20분전',
            timestamp: '20분전',
            views: 180,
            likes: 122,
            comments: 3,
            image: true
        }
    ]);

    const handlePostClick = (post: any) => {
        setSelectedPost({
            ...post,
            id: post.id,
            author: post.author,
            avatar: post.avatar,
            type: post.type,
            title: post.title,
            content: post.content,
            likes: post.likes || 0,
            comments: post.comments || 0,
            timestamp: post.time,
        });
    };

    const handleCreatePost = (newPostData: any) => {
        const newPost = {
            id: mockPosts.length + 1,
            author: userProfile?.nickname || '사용자',
            avatar: (userProfile?.nickname || '사')[0],
            type: CATEGORIES.find(c => c.id === activeCategory)?.label || '아무거나',
            title: newPostData.title,
            content: newPostData.content,
            time: '방금 전',
            timestamp: '방금 전',
            views: 0,
            likes: 0,
            comments: 0,
            category: '',
        };
        setMockPosts([newPost, ...mockPosts]);
    };

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
            <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
                {/* Lounge | Premium Header */}
                <div className="flex justify-center items-center gap-6 mb-8 border-b border-gold/10 pb-4">
                    <button
                        onClick={() => setActiveTab('lounge')}
                        className={cn(
                            "text-3xl font-display transition-all duration-300",
                            activeTab === 'lounge' ? "text-gold scale-105" : "text-muted-foreground hover:text-foreground opacity-50"
                        )}
                    >
                        Lounge
                    </button>
                    <div className="h-8 w-px bg-gold/20" />
                    <button
                        onClick={() => setActiveTab('premium')}
                        className={cn(
                            "text-3xl font-display transition-all duration-300 flex items-center gap-2",
                            activeTab === 'premium' ? "text-gold scale-105" : "text-muted-foreground hover:text-foreground opacity-50"
                        )}
                    >
                        Premium
                        {!isPremium && <Lock className="w-5 h-5" />}
                    </button>
                </div>

                {/* Lounge Content */}
                {activeTab === 'lounge' && (
                    <div className="space-y-6">
                        {/* Title Section */}
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-display text-white mb-4">상위 1% 대화는 다르니까</h2>
                            <p className="text-muted-foreground">부동산, 재테크, 핫플레이스 등 다양한 정보 교류와 데이트까지 가능해요</p>
                        </div>

                        {/* Category Selector */}
                        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={cn(
                                        "px-6 py-2 rounded-full border transition-all duration-300 whitespace-nowrap",
                                        activeCategory === category.id
                                            ? "bg-gold text-background border-gold font-bold"
                                            : "border-gold/20 text-muted-foreground hover:border-gold/50"
                                    )}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* Post List */}
                        <div className="space-y-4">
                            {mockPosts.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() => handlePostClick(post)}
                                    className="bg-card rounded-2xl border border-gold/10 p-5 hover:border-gold/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="w-10 h-10 border border-gold/20">
                                            <AvatarFallback className="bg-gold/10 text-gold">{post.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white group-hover:text-gold transition-colors">{post.author}</span>
                                                <span className="text-xs text-muted-foreground">{post.time} · 조회 {post.views}</span>
                                                {post.category === 'BEST' && (
                                                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold tracking-tighter">BEST</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                <span>{post.type}</span>
                                            </div>
                                        </div>
                                        <button className="text-muted-foreground hover:text-white transition-colors">
                                            <MessageSquare className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{post.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                                        </div>
                                        {post.image && (
                                            <div className="w-20 h-20 rounded-xl bg-gold/5 flex-shrink-0 flex items-center justify-center text-4xl border border-gold/10">
                                                🖼️
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-gold/5 text-sm text-muted-foreground">
                                        <button className="flex items-center gap-1.5 hover:text-gold transition-colors">
                                            <Heart className="w-4 h-4" />
                                            <span>{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 hover:text-gold transition-colors">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{post.comments}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 hover:text-gold transition-colors ml-auto">
                                            <Share2 className="w-4 h-4" />
                                            <span>공유하기</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gold hover:bg-gold/90 shadow-lg shadow-gold/20 flex items-center justify-center transition-all hover:scale-110 z-50 text-background"
                    >
                        <Edit3 className="w-6 h-6" />
                    </button>
                )}

                {/* Modals */}
                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setInitialPostData(null);
                    }}
                    onSubmit={handleCreatePost}
                    initialImages={initialPostData?.images}
                    initialType={initialPostData?.type || 'random'}
                />
                {selectedPost && (
                    <PostDetailModal
                        isOpen={!!selectedPost}
                        onClose={() => setSelectedPost(null)}
                        post={selectedPost}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default CommunityLounge;

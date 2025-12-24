import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, MessageSquare, Eye, Heart, Edit3, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { PostDetailModal } from '@/components/community/PostDetailModal';
import { UpgradeModal } from '@/components/lounge/UpgradeModal';
import { PremiumChat } from '@/components/lounge/PremiumChat';

const CATEGORIES = [
    { id: 'all', label: '전체' },
    { id: 'tarot', label: '타로공유' },
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
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null);
    const [initialPostData, setInitialPostData] = useState<{
        images: string[];
        title: string;
        content: string;
        type: string;
    } | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check developer mode and location state
    useEffect(() => {
        const devMode = localStorage.getItem('dev_mode') === 'true';
        setIsDeveloperMode(devMode);

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

        fetchPosts();
    }, [location.state, navigate, activeCategory]);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch posts
            let query = supabase
                .from('community_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (activeCategory !== 'all') {
                query = query.eq('category', activeCategory);
            }

            const { data: postsData, error: postsError } = await query;
            if (postsError) throw postsError;
            if (!postsData || postsData.length === 0) {
                setPosts([]);
                return;
            }

            // 2. Fetch profiles for these posts
            const userIds = Array.from(new Set(postsData.map(p => p.user_id)));
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, nickname')
                .in('user_id', userIds);

            if (profilesError) throw profilesError;

            // 3. Merge profiles into posts
            const postsWithProfiles = postsData.map(post => ({
                ...post,
                profiles: profilesData?.find(p => p.user_id === post.user_id) || { nickname: '익명' }
            }));

            setPosts(postsWithProfiles);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('게시글을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // Mock data removal (keeping only logic for real posts)
    const handlePostClick = (post: any) => {
        setSelectedPost({
            ...post,
            author: post.profiles?.nickname || '익명',
            avatar: (post.profiles?.nickname || '익')[0],
            time: new Date(post.created_at).toLocaleDateString(),
            timestamp: new Date(post.created_at).toLocaleDateString(),
        });
    };

    const uploadImage = async (file: File | string) => {
        try {
            let blob: Blob;
            let fileName: string;

            if (typeof file === 'string' && file.startsWith('data:image')) {
                const res = await fetch(file);
                blob = await res.blob();
                fileName = `tarot_${Date.now()}.png`;
            } else if (file instanceof File) {
                blob = file;
                fileName = `${Date.now()}_${file.name}`;
            } else {
                return typeof file === 'string' ? file : null;
            }

            const { data, error } = await supabase.storage
                .from('lounge')
                .upload(fileName, blob);

            if (error) {
                console.warn('Storage upload failed (bucket might not exist):', error);
                return typeof file === 'string' ? file : null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('lounge')
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return typeof file === 'string' ? file : null;
        }
    };

    const handleCreatePost = async (newPostData: any) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let imageUrl = null;
            if (newPostData.images && newPostData.images.length > 0) {
                imageUrl = await uploadImage(newPostData.images[0]);
            }

            const { error } = await supabase.from('community_posts').insert({
                user_id: user.id,
                title: newPostData.title,
                content: newPostData.content,
                category: newPostData.type || 'random',
                tarot_image_url: imageUrl,
                lounge_type: 'general'
            });

            if (error) throw error;

            toast.success('게시글이 등록되었습니다.');
            setShowCreateModal(false);
            setInitialPostData(null);
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('게시글 등록에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
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

    const isPremium = false; // Reverted premium check to mock state

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
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-gold/10">
                                    <p className="text-muted-foreground">아직 등록된 게시글이 없습니다.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => handlePostClick(post)}
                                        className="bg-card rounded-2xl border border-gold/10 p-5 hover:border-gold/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className="w-10 h-10 border border-gold/20">
                                                <AvatarFallback className="bg-gold/10 text-gold">
                                                    {(post.profiles?.nickname || '익')[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white group-hover:text-gold transition-colors">
                                                        {post.profiles?.nickname || '익명'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                    <span>{CATEGORIES.find(c => c.id === post.category)?.label || '아무거나'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{post.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                                            </div>
                                            {post.tarot_image_url && (
                                                <div className="w-20 h-20 rounded-xl bg-gold/5 flex-shrink-0 flex items-center justify-center border border-gold/10 overflow-hidden">
                                                    <img src={post.tarot_image_url} alt="Tarot" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-gold/5 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Heart className="w-4 h-4" />
                                                <span>{post.likes_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MessageCircle className="w-4 h-4" />
                                                <span>{post.comments_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <Share2 className="w-4 h-4" />
                                                <span>공유하기</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Premium Tab */}
                {activeTab === 'premium' && (
                    <div className="space-y-4">
                        {currentChatRoom ? (
                            <PremiumChat
                                roomName={currentChatRoom}
                                onBack={() => setCurrentChatRoom(null)}
                            />
                        ) : (
                            <>
                                {premiumLounges.map((lounge) => (
                                    <div
                                        key={lounge.id}
                                        onClick={() => {
                                            if (isPremium || isDeveloperMode) {
                                                setCurrentChatRoom(lounge.name);
                                            } else {
                                                setShowUpgradeModal(true);
                                            }
                                        }}
                                        className="bg-card rounded-2xl border border-gold/20 p-6 hover:border-gold/40 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-mystic-purple/20 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                                {lounge.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-display text-lg text-gold group-hover:text-white transition-colors">
                                                        {lounge.name}
                                                    </h3>
                                                    {!isPremium && !isDeveloperMode && (
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
                                                    {(isPremium || isDeveloperMode) ? (
                                                        <Button size="sm" variant="gold">
                                                            입장하기
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowUpgradeModal(true);
                                                            }}
                                                        >
                                                            업그레이드
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {!isPremium && !isDeveloperMode && (
                                    <div className="bg-gradient-to-r from-gold/10 to-mystic-purple/10 rounded-2xl border border-gold/20 p-6 text-center">
                                        <Lock className="w-12 h-12 mx-auto mb-4 text-gold" />
                                        <h3 className="font-display text-xl text-gold mb-2">
                                            프리미엄 멤버십이 필요합니다
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            월 29,900원으로 모든 프리미엄 라운지에 접근하세요
                                        </p>
                                        <Button
                                            variant="gold"
                                            size="lg"
                                            onClick={() => setShowUpgradeModal(true)}
                                        >
                                            프리미엄 가입하기
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Floating Write Button (Lounge only) */}
                {activeTab === 'lounge' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gold hover:bg-gold/90 shadow-lg shadow-gold/20 flex items-center justify-center transition-all hover:scale-110 z-50 text-background"
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
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                />
            </div>
        </AppLayout>
    );
};

export default CommunityLounge;

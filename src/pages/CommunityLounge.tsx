import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BetaLockOverlay } from '@/components/beta/BetaLockOverlay';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, MessageSquare, Eye, Heart, Edit3, Share2, MessageCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { PostDetailModal } from '@/components/community/PostDetailModal';
import { UpgradeModal } from '@/components/lounge/UpgradeModal';
import { PremiumChat } from '@/components/lounge/PremiumChat';
import { MyActivityModal } from '@/components/community/MyActivityModal';

const CATEGORIES = [
    { id: 'all', label: '전체' },
    { id: 'tarot', label: '타로공유' },
    { id: 'story', label: '일상' },
    { id: 'love', label: '고민상담' },
    { id: 'random', label: '아무거나' },
];

import { UserProfileModal } from "@/components/community/UserProfileModal";
import { GalaxyBackground } from '@/components/ui/GalaxyBackground';
import { LoginRequiredModal } from '@/components/LoginRequiredModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';

const CommunityLounge = () => {
    const { user, userProfile, session } = useAuth(); // Destructure session
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'lounge' | 'premium'>('lounge');
    const [activeCategory, setActiveCategory] = useState('all');
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);
    const location = useLocation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showLoginRequired, setShowLoginRequired] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null);
    const [initialPostData, setInitialPostData] = useState<{
        images: string[];
        title: string;
        content: string;
        type: string;
    } | null>(null);
    const [selectedUserProfile, setSelectedUserProfile] = useState<{ id: string, nickname: string, avatar_url?: string | null } | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check for guest user
    useEffect(() => {
        if (!user) {
            setShowLoginRequired(true);
        }
    }, [user]);

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
                .select('user_id, nickname, avatar_url')
                .in('user_id', userIds) as any;

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
            user_id: post.user_id, // CRITICAL: needed for delete button authorization
            author: post.profiles?.nickname || '익명',
            avatar: (post.profiles?.nickname || '익')[0],
            time: new Date(post.created_at).toLocaleDateString(),
            timestamp: new Date(post.created_at).toLocaleDateString(),
        });
    };

    const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();

        if (!window.confirm('정말 이 게시글을 영구적으로 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.')) return;

        try {
            const { error } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            toast.success('게시글이 삭제되었습니다.');
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('게시글 삭제에 실패했습니다.');
        }
    };

    const handleDetailDelete = async (postId: string) => {
        try {
            // Check authentication
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            // Get post to verify ownership
            const { data: post, error: fetchError } = await supabase
                .from('community_posts')
                .select('user_id')
                .eq('id', postId)
                .single();

            if (fetchError) throw fetchError;

            // Verify ownership
            if (post.user_id !== session.user.id) {
                toast.error('본인이 작성한 게시글만 삭제할 수 있습니다.');
                return;
            }

            // Delete post
            const { error } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            toast.success('게시글이 삭제되었습니다.');
            setPosts(posts.filter(p => p.id !== postId));
            setSelectedPost(null);
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('게시글 삭제에 실패했습니다.');
        }
    };

    const uploadImage = async (file: File | string) => {
        try {
            let blob: Blob;
            let fileName: string;
            let fileExt = 'png';

            if (typeof file === 'string' && file.startsWith('data:image')) {
                const res = await fetch(file);
                blob = await res.blob();
                fileName = `tarot_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
            } else if (file instanceof File) {
                blob = file;
                const nameParts = file.name.split('.');
                if (nameParts.length > 1) {
                    fileExt = nameParts.pop() || 'png';
                }
                fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt} `;
            } else {
                return typeof file === 'string' ? file : null;
            }

            const { data, error } = await supabase.storage
                .from('lounge')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                // If bucket not found error, might inform user
                if (error.message.includes('Bucket not found')) {
                    toast.error('이미지 저장소(lounge)가 존재하지 않습니다. 관리자에게 문의하세요.');
                }
                throw error;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('lounge')
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            // Don't silence the error, let the caller handle it or return null if non-critical
            // But for post creation, we probably want to know.
            return null;
        }
    };

    const handleCreatePost = async (newPostData: any) => {
        setIsLoading(true);
        try {
            // 1. Check strict authentication
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session?.user) {
                console.error("Auth Error:", sessionError);
                throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
            }

            const currentUser = session.user;

            let imageUrl = null;
            if (newPostData.images && newPostData.images.length > 0) {
                imageUrl = await uploadImage(newPostData.images[0]);

                if (!imageUrl) {
                    throw new Error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
                }
            }

            const { error } = await supabase.from('community_posts').insert({
                user_id: currentUser.id,
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
            name: '자산가 라운지',
            description: '부동산, 재테크, 핫플레이스 등 다양한 정보 교류와 데이트까지 가능해요',
            icon: '💰',
            members: 1234
        },
        {
            id: 2,
            name: '연애 마스터 라운지',
            description: '연애 고민 상담부터 썸 타는 법까지',
            icon: '💕',
            members: 892
        },
        {
            id: 3,
            name: 'CEO 라운지',
            description: '비즈니스 네트워킹과 인사이트 공유',
            icon: '👔',
            members: 456
        },
        {
            id: 4,
            name: '대학생 라운지',
            description: '캠퍼스 라이프, 진로 고민, 풋풋한 연애 이야기',
            icon: '🎓',
            members: 2341
        },
        {
            id: 5,
            name: '대학원생 라운지',
            description: '논문, 연구실 생활, 학업의 고충을 함께 나누는 공간',
            icon: '📚',
            members: 512
        },
        {
            id: 6,
            name: '수험생 라운지',
            description: '합격 기원! 수험 정보 공유와 서로를 위한 응원',
            icon: '✏️',
            members: 3421
        }
    ];

    const isPremium = false; // Reverted premium check to mock state

    const handleCommentUpdate = (postId: string, newCount: number) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, comments_count: newCount }
                    : post
            )
        );

        // Also update selectedPost if it matches
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(prev => prev ? { ...prev, comments_count: newCount } : null);
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 pt-2 pb-8 max-w-4xl min-h-screen">
                {/* Lounge | Premium Header - Sticky */}
                <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md flex justify-center items-center gap-6 border-b border-gold/10 py-2 mb-0 -mx-4 px-4 transition-all duration-300">
                    <button
                        onClick={() => setActiveTab('lounge')}
                        className={cn(
                            "text-2xl font-display transition-all duration-300",
                            activeTab === 'lounge' ? "text-gold scale-105" : "text-muted-foreground hover:text-foreground opacity-50"
                        )}
                    >
                        Lounge
                    </button>
                    <div className="h-6 w-px bg-gold/20" />
                    <button
                        onClick={() => setActiveTab('premium')}
                        className={cn(
                            "text-2xl font-display transition-all duration-300 flex items-center gap-2",
                            activeTab === 'premium' ? "text-gold scale-105" : "text-muted-foreground hover:text-foreground opacity-50"
                        )}
                    >
                        Premium
                        {!isPremium && <Lock className="w-4 h-4" />}
                    </button>
                </div>

                {/* Lounge Content */}
                {activeTab === 'lounge' && (
                    <div>
                        {/* Title Section (Welcome Banner) - Full Width */}
                        <div className="relative w-screen left-[calc(-50vw+50%)] text-center">
                            <GalaxyBackground
                                className="py-12 px-6 w-full"
                                style={{
                                    maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                                }}
                            >
                                <div className="max-w-4xl mx-auto relative z-10">
                                    <h2 className="relative text-2xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gold to-white mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                        타로로 연결된 우리들의 공간
                                    </h2>
                                    <p className="relative text-orange-50/90 text-sm md:text-base leading-relaxed font-light whitespace-pre-line drop-shadow-md">
                                        오늘의 한 장, 자유롭게 공유해요.{'\n'}
                                        서로 응원하며 즐겨보세요 ✨
                                    </p>
                                </div>
                            </GalaxyBackground>

                            {/* Separator - Full Width */}
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent absolute bottom-0 left-0" />
                        </div>

                        {/* Category Selector */}
                        <div className="flex overflow-x-auto gap-2 py-6 scrollbar-hide">
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
                                        className="bg-black/60 rounded-2xl border border-gold/20 p-5 hover:border-gold/50 transition-all cursor-pointer group relative shadow-lg shadow-black/20"
                                    >
                                        {/* Delete Button (Only for author) */}
                                        {session?.user?.id === post.user_id && (
                                            <button
                                                onClick={(e) => handleDeletePost(e, post.id)}
                                                className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 z-10 p-1 transition-colors"
                                                title="게시글 영구 삭제"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                        <div className="flex gap-3 md:gap-4">
                                            {/* Left: Profile Information */}
                                            <div
                                                className="flex-shrink-0 z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (post.profiles) {
                                                        setSelectedUserProfile({
                                                            id: post.user_id,
                                                            nickname: post.profiles?.nickname || '익명',
                                                            avatar_url: post.profiles?.avatar_url
                                                        });
                                                    }
                                                }}
                                            >
                                                <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-gold/30 hover:border-gold cursor-pointer transition-colors">
                                                    {post.profiles?.avatar_url ? (
                                                        <img src={post.profiles.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <AvatarFallback className="bg-gold/10 text-gold font-bold">
                                                            {(post.profiles?.nickname || '익')[0]}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                            </div>

                                            {/* Middle: Content */}
                                            <div className="flex-1 min-w-0 flex flex-col gap-1 md:gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                        className="font-bold text-gold group-hover:text-white transition-colors text-sm md:text-base cursor-pointer z-10 hover:underline whitespace-nowrap"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (post.profiles) {
                                                                setSelectedUserProfile({
                                                                    id: post.user_id,
                                                                    nickname: post.profiles?.nickname || '익명',
                                                                    avatar_url: post.profiles?.avatar_url
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {post.profiles?.nickname || '익명'}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs text-white/40 whitespace-nowrap">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs text-gold/90 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 whitespace-nowrap font-medium">
                                                        {CATEGORIES.find(c => c.id === post.category)?.label || '아무거나'}
                                                    </span>
                                                </div>

                                                {/* Title Box */}
                                                <div className="text-[#FFF8E7] font-bold text-base md:text-lg px-1 break-keep leading-tight group-hover:text-white transition-colors">
                                                    {post.title}
                                                </div>

                                                {/* Content Box */}
                                                <div className="text-gray-300 text-xs md:text-sm line-clamp-2 md:line-clamp-3 min-h-[1.5em] px-1 break-words leading-relaxed font-light">
                                                    {post.content}
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center gap-3 md:gap-4 mt-1 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                        <span>{post.likes_count || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                        <span>{post.comments_count || 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Image */}
                                            {post.tarot_image_url && (
                                                <div className="w-20 h-20 md:w-32 md:h-32 rounded-lg md:rounded-xl bg-gold/5 flex-shrink-0 border border-gold/10 overflow-hidden self-start mt-1">
                                                    <img
                                                        src={post.tarot_image_url}
                                                        alt="Tarot"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Premium Tab */}
                {activeTab === 'premium' && (
                    <div className="space-y-4 relative min-h-[400px]">
                        {/* BETA LOCK OVERLAY */}
                        <BetaLockOverlay />

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
                                            const isDev = localStorage.getItem('dev_mode') === 'true';
                                            if (isPremium || isDev) {
                                                setCurrentChatRoom(lounge.name);
                                            } else {
                                                setShowUpgradeModal(true);
                                            }
                                        }}
                                        className="bg-card rounded-2xl border border-gold/20 p-6 hover:border-gold/40 transition-colors cursor-pointer group blur-sm pointer-events-none select-none"
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
                                    <div className="bg-gradient-to-r from-gold/10 to-mystic-purple/10 rounded-2xl border border-gold/20 p-6 text-center blur-sm pointer-events-none select-none">
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
                {/* Floating Action Buttons (Lounge only) */}
                {activeTab === 'lounge' && (
                    <div className="fixed bottom-24 right-6 flex flex-col items-center gap-4 z-50">
                        {/* My Activity Button */}
                        <button
                            onClick={() => setShowActivityModal(true)}
                            className="w-14 h-14 rounded-full bg-card border border-gold/30 shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:border-gold overflow-hidden"
                            title="내 활동"
                        >
                            <Avatar className="w-full h-full">
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-gold/10 text-gold text-xs">
                                        {userProfile?.nickname?.[0] || '나'}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </button>

                        {/* Write Post Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-14 h-14 rounded-full bg-gold hover:bg-gold/90 shadow-lg shadow-gold/20 flex items-center justify-center transition-all hover:scale-110 text-background"
                            title="글쓰기"
                        >
                            <Edit3 className="w-6 h-6" />
                        </button>
                    </div>
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
                        onCommentChange={handleCommentUpdate}
                        onDelete={
                            (session?.user?.id && selectedPost?.user_id && session.user.id === selectedPost.user_id)
                                ? () => handleDetailDelete(selectedPost.id)
                                : undefined
                        }
                    />
                )}

                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                />
                <MyActivityModal
                    isOpen={showActivityModal}
                    onClose={() => setShowActivityModal(false)}
                    userId={user?.id || ''}
                />

                <UserProfileModal
                    isOpen={!!selectedUserProfile}
                    onClose={() => setSelectedUserProfile(null)}
                    targetUser={selectedUserProfile}
                />

                {/* Guest Access Modals */}
                <LoginRequiredModal
                    isOpen={showLoginRequired}
                    onClose={() => setShowLoginRequired(false)}
                    onShowLogin={() => {
                        setShowLoginRequired(false);
                        setShowLoginModal(true);
                    }}
                    message="커뮤니티 기능을 이용하려면 로그인이 필요합니다."
                />
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSwitchToRegister={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                    }}
                />
                <RegisterModal
                    isOpen={showRegisterModal}
                    onClose={() => setShowRegisterModal(false)}
                    onSwitchToLogin={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                    }}
                />
            </div>
        </AppLayout>
    );
};

export default CommunityLounge;

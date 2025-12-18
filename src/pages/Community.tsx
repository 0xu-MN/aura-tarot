import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Plus, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { PostDetailModal } from '@/components/community/PostDetailModal';

const Community = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    const mockPosts = [
        {
            id: 1,
            author: '타로마니아',
            avatar: 'T',
            type: '타로공유',
            title: '오늘 뽑은 카드가 너무 신기해요!',
            content: '연애운을 물어봤는데 The Lovers 카드가 나왔어요. 오늘 정말 특별한 만남이 있을 것 같은 예감이...\n\n혹시 비슷한 경험 있으신 분 계실까요? 저는 이 카드가 나온 날은 항상 좋은 일이 생기더라고요! 🌟',
            images: ['img1', 'img2'],
            likes: 12,
            comments: 5,
            timestamp: '2시간 전',
        },
        {
            id: 2,
            author: '운세전문가',
            avatar: '운',
            type: '전문가',
            title: '2025년 별자리별 운세 총정리',
            content: '안녕하세요, 20년 경력의 타로 리더입니다. 올해 별자리별 전반적인 운세를 정리해봤습니다...\n\n궁금하신 점 있으시면 댓글로 물어보세요!',
            likes: 45,
            comments: 18,
            timestamp: '5시간 전',
        },
        {
            id: 3,
            author: '일상러버',
            avatar: '일',
            type: '일상',
            title: '오늘 하루 너무 행복했어요 💕',
            content: '아침에 타로 봤는데 The Sun이 나왔고, 정말로 좋은 일들만 가득했던 하루였습니다!\n\n여러분도 오늘 좋은 하루 보내세요~',
            likes: 8,
            comments: 3,
            timestamp: '1일 전',
        },
    ];

    const handlePostClick = (post: any) => {
        setSelectedPost(post);
    };

    return (
        <>
            <AppLayout>
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-display text-3xl md:text-4xl text-gold-gradient">
                            커뮤니티
                        </h1>
                        <Button variant="gold" size="sm" onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4" />
                            글쓰기
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="w-full justify-start overflow-x-auto">
                            <TabsTrigger value="all">전체</TabsTrigger>
                            <TabsTrigger value="tarot">타로공유</TabsTrigger>
                            <TabsTrigger value="general">일상</TabsTrigger>
                            <TabsTrigger value="expert">전문가</TabsTrigger>
                            <TabsTrigger value="ad">광고</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            <div className="space-y-4">
                                {mockPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-card rounded-2xl border border-gold/20 p-6 hover:border-gold/50 transition-all duration-300 cursor-pointer"
                                        onClick={() => handlePostClick(post)}
                                    >
                                        {/* Author */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar>
                                                <AvatarFallback className="bg-gold/20 text-gold">
                                                    {post.avatar}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{post.author}</p>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold">
                                                        {post.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {post.timestamp}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="font-display text-lg mb-2">{post.title}</h3>
                                        <p className="text-muted-foreground mb-4 line-clamp-2">
                                            {post.content}
                                        </p>

                                        {/* Image Preview */}
                                        {post.images && post.images.length > 0 && (
                                            <div className="flex gap-2 mb-4">
                                                {post.images.slice(0, 3).map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-20 h-20 rounded-lg bg-gradient-to-br from-gold/20 to-mystic-purple/20 flex items-center justify-center text-2xl"
                                                    >
                                                        🖼️
                                                    </div>
                                                ))}
                                                {post.images.length > 3 && (
                                                    <div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center text-sm">
                                                        +{post.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <button className="flex items-center gap-1 hover:text-gold transition-colors">
                                                <Heart className="w-4 h-4" />
                                                <span>{post.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-1 hover:text-gold transition-colors">
                                                <MessageCircle className="w-4 h-4" />
                                                <span>{post.comments}</span>
                                            </button>
                                            <button className="flex items-center gap-1 hover:text-gold transition-colors ml-auto">
                                                <Share2 className="w-4 h-4" />
                                                <span>공유</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </AppLayout>

            {/* Modals */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            {selectedPost && (
                <PostDetailModal
                    isOpen={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                    post={selectedPost}
                />
            )}
        </>
    );
};

export default Community;

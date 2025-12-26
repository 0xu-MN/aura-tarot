import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Share2, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: {
        id: string;
        user_id: string;
        author: string;
        avatar: string;
        type: string;
        title: string;
        content: string;
        tarot_image_url?: string;
        likes_count: number;
        comments_count: number;
        timestamp: string;
        category?: string;
    };
    onDelete?: () => void;
}

interface Comment {
    id: string;
    profiles: {
        nickname: string;
    };
    content: string;
    created_at: string;
}

export const PostDetailModal = ({ isOpen, onClose, post, onDelete }: PostDetailModalProps) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [liked, setLiked] = useState(false);
    const [initialLiked, setInitialLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && post.id) {
            fetchComments();
            checkIfLiked();
        }
    }, [isOpen, post.id]);

    const fetchComments = async () => {
        try {
            // 1. Fetch comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('post_comments')
                .select('*')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            if (!commentsData || commentsData.length === 0) {
                setComments([]);
                return;
            }

            // 2. Fetch profiles for comments
            const userIds = Array.from(new Set(commentsData.map(c => c.user_id)));
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, nickname')
                .in('user_id', userIds);

            if (profilesError) throw profilesError;

            // 3. Merge profiles into comments
            const mergedComments = commentsData.map(comment => ({
                ...comment,
                profiles: profilesData?.find(p => p.user_id === comment.user_id) || { nickname: '익명' }
            }));

            setComments(mergedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const checkIfLiked = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();

        if (data) {
            setLiked(true);
            setInitialLiked(true);
        }
    };

    const handleLike = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            if (liked) {
                await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', post.id)
                    .eq('user_id', user.id);
                setLiked(false);
            } else {
                await supabase
                    .from('post_likes')
                    .insert({ post_id: post.id, user_id: user.id });
                setLiked(true);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleSubmitComment = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            const { error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: post.id,
                    user_id: user.id,
                    content: comment,
                });

            if (error) throw error;

            setComment('');
            fetchComments();
            toast.success('댓글이 등록되었습니다.');
        } catch (error) {
            console.error('Error submitting comment:', error);
            toast.error('댓글 등록에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in">
                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    {/* Delete button (Only for author) */}
                    {onDelete && (
                        <button
                            onClick={() => {
                                if (window.confirm('정말 이 게시글을 영구적으로 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.')) {
                                    onDelete();
                                    onClose();
                                }
                            }}
                            className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-500/30 transition-colors border-2 border-red-500"
                            title="게시글 영구 삭제"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col h-full max-h-[90vh]">
                    {/* Post Content */}
                    <ScrollArea className="flex-1 p-6 md:p-8">
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

                        {/* Title */}
                        <h2 className="font-display text-2xl mb-4">{post.title}</h2>

                        {/* Content */}
                        <p className="text-foreground leading-relaxed whitespace-pre-line mb-6">
                            {post.content}
                        </p>

                        {/* Images */}
                        {post.tarot_image_url && (
                            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gold/20 to-mystic-purple/20 mb-6 border border-gold/20 max-w-sm mx-auto">
                                <img src={post.tarot_image_url} alt="Tarot Result" className="w-full h-auto" />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-6 mb-6">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-gold'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                                <span>{post.likes_count + (liked ? (initialLiked ? 0 : 1) : (initialLiked ? -1 : 0))}</span>
                            </button>
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span>{comments.length}</span>
                            </button>
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors ml-auto">
                                <Share2 className="w-5 h-5" />
                                <span>공유</span>
                            </button>
                        </div>

                        <Separator className="my-6 bg-gold/20" />

                        {/* Comments Section */}
                        <div>
                            <h3 className="font-display text-lg mb-4">
                                댓글 {comments.length}
                            </h3>

                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="bg-muted text-sm">
                                                {(comment.profiles?.nickname || '익')[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium">{comment.profiles?.nickname || '익명'}</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Comment Input */}
                    <div className="border-t border-gold/20 p-4">
                        <form onSubmit={handleSubmitComment} className="flex gap-2">
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-background/50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        if (e.nativeEvent.isComposing) return;
                                        e.preventDefault();
                                        handleSubmitComment(e);
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                variant="gold"
                                disabled={!comment.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

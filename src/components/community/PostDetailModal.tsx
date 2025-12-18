import { useState } from 'react';
import { X, Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: {
        id: number;
        author: string;
        avatar: string;
        type: string;
        title: string;
        content: string;
        images?: string[];
        likes: number;
        comments: number;
        timestamp: string;
    };
}

interface Comment {
    id: number;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
}

export const PostDetailModal = ({ isOpen, onClose, post }: PostDetailModalProps) => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            author: '타로러버',
            avatar: 'ㅌ',
            content: '저도 비슷한 경험이 있어요! 궁금하네요',
            timestamp: '1시간 전',
        },
        {
            id: 2,
            author: '운세전문',
            avatar: '운',
            content: '좋은 정보 감사합니다!',
            timestamp: '30분 전',
        },
    ]);
    const [liked, setLiked] = useState(false);

    const handleSubmitComment = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const newComment: Comment = {
            id: comments.length + 1,
            author: '나',
            avatar: 'N',
            content: comment,
            timestamp: '방금 전',
        };

        setComments([...comments, newComment]);
        setComment('');
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
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

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
                        {post.images && post.images.length > 0 && (
                            <div className={`grid gap-2 mb-6 ${post.images.length === 1 ? 'grid-cols-1' :
                                post.images.length === 2 ? 'grid-cols-2' :
                                    'grid-cols-2 md:grid-cols-3'
                                }`}>
                                {post.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gold/20 to-mystic-purple/20"
                                    >
                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                            🖼️
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-6 mb-6">
                            <button
                                onClick={() => setLiked(!liked)}
                                className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-gold'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                                <span>{post.likes + (liked ? 1 : 0)}</span>
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
                                                {comment.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium">{comment.author}</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {comment.timestamp}
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

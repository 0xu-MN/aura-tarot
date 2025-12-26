
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { X, MessageSquare, Heart, Bookmark, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface MyActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'posts' | 'scraps';
}

export const MyActivityModal = ({ isOpen, onClose, initialTab = 'posts' }: MyActivityModalProps) => {
    const { session } = useAuth();
    const user = session?.user;
    const [activeTab, setActiveTab] = useState<'posts' | 'scraps'>(initialTab);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchItems();
        }
    }, [isOpen, activeTab, user]);

    const fetchItems = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (activeTab === 'posts') {
                const { data, error } = await supabase
                    .from('community_posts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setItems(data || []);
            } else {
                // Fetch Scraps
                const { data, error } = await supabase
                    .from('post_scraps' as any)
                    .select(`
                        post_id,
                        created_at,
                        community_posts (*)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                // Transform to post list
                setItems(data?.map((item: any) => item.community_posts) || []);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const { error } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;
            toast.success('게시글이 삭제되었습니다.');
            setItems(prev => prev.filter(item => item.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('삭제 실패');
        }
    };

    const handleUnscrap = async (postId: string) => {
        if (!user) return;
        if (!confirm('스크랩을 취소하시겠습니까?')) return;
        try {
            const { error } = await supabase
                .from('post_scraps' as any)
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success('스크랩이 취소되었습니다.');
            setItems(prev => prev.filter(item => item.id !== postId));
        } catch (error) {
            console.error('Error unscrapping:', error);
            toast.error('취소 실패');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-card rounded-3xl border border-gold/20 shadow-2xl overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="p-6 border-b border-gold/10 flex justify-between items-center">
                    <h2 className="font-display text-2xl">내 활동</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gold/10">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'posts' ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        작성한 글
                        {activeTab === 'posts' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('scraps')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'scraps' ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        스크랩
                        {activeTab === 'scraps' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                    </button>
                </div>

                {/* List */}
                <ScrollArea className="h-[60vh] p-6">
                    {loading ? (
                        <div className="text-center py-20 text-muted-foreground">로딩 중...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            {activeTab === 'posts' ? '작성한 게시글이 없습니다.' : '스크랩한 게시글이 없습니다.'}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((post) => (
                                <div key={post.id} className="bg-background/50 rounded-xl p-4 border border-border hover:border-gold/30 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                                                    {post.type}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-medium mb-1 line-clamp-1">{post.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Heart className="w-3 h-3" /> {post.likes_count}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" /> {post.comments_count}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            {activeTab === 'posts' ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUnscrap(post.id); }}
                                                    className="p-2 text-gold hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="스크랩 취소"
                                                >
                                                    <Bookmark className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

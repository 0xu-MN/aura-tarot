import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSession: (messages: any[]) => void;
}

export const ChatHistoryModal = ({ isOpen, onClose, onSelectSession }: ChatHistoryModalProps) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen]);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase as any)
                .from('chat_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSessions(data || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const { error } = await (supabase as any)
                .from('chat_sessions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card border-gold/20">
                <DialogHeader>
                    <DialogTitle className="text-gold font-display text-xl">상담 기록</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gold" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            저장된 상담 기록이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 rounded-xl border border-gold/10 hover:border-gold/30 bg-background/50 cursor-pointer transition-all group relative"
                                    onClick={() => {
                                        onSelectSession(session.messages);
                                        onClose();
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate pr-6">
                                                {session.title || '상담 기록'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(session.created_at), 'PPP a h:mm', { locale: ko })}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, session.id)}
                                        className="absolute right-3 top-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

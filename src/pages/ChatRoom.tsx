import { AppLayout } from "@/layouts/AppLayout";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

interface Participant {
    user_id: string;
    profiles: {
        nickname: string;
        avatar_url: string | null;
    };
}

const ChatRoom = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sending, setSending] = useState(false);

    const otherUser = participants.find(p => p.user_id !== user?.id)?.profiles;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!roomId || !user) return;

        const fetchRoomData = async () => {
            try {
                // 1. Fetch participants to get name/avatar
                const { data: partData, error: partError } = await supabase
                    .from('chat_participants')
                    .select(`
                        user_id,
                        profiles:user_id (
                            nickname,
                            avatar_url
                        )
                    `)
                    .eq('room_id', roomId);

                if (partError) throw partError;
                // Cast to any to bypass type check for now until generic types updated
                setParticipants(partData as any);

                // 2. Fetch messages
                const { data: msgData, error: msgError } = await supabase
                    .from('private_messages')
                    .select('*')
                    .eq('room_id', roomId)
                    .order('created_at', { ascending: true });

                if (msgError) throw msgError;
                setMessages(msgData as any);

            } catch (error) {
                console.error('Error fetching room data:', error);
                toast.error('채팅방 정보를 불러오지 못했습니다.');
                navigate('/messages');
            } finally {
                setLoading(false);
            }
        };

        fetchRoomData();

        // 3. Realtime Subscription
        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'private_messages',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages(prev => [...prev, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, user, navigate]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user || !roomId) return;

        setSending(true);
        try {
            const { error } = await supabase
                .from('private_messages')
                .insert({
                    room_id: roomId,
                    sender_id: user.id,
                    content: newMessage.trim()
                });

            if (error) throw error;
            setNewMessage("");

            // Update room's updated_at timestamp
            await supabase
                .from('private_chat_rooms')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', roomId);

        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('메시지 전송 실패');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="flex items-center gap-4 px-4 py-3 border-b border-gold/20 bg-card/80 backdrop-blur-md sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gold/10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-gold/30">
                        <AvatarImage src={otherUser?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gold/10 text-gold text-xs">
                            {otherUser?.nickname?.[0] || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground">{otherUser?.nickname || '알 수 없는 사용자'}</span>
                        <span className="text-xs text-muted-foreground">online</span>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMyMessage = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id} className={cn("flex", isMyMessage ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words",
                                isMyMessage
                                    ? "bg-gold text-white rounded-br-none"
                                    : "bg-card border border-gold/20 text-foreground rounded-bl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t border-gold/20 pb-safe">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="bg-background border-gold/30 focus:border-gold"
                        disabled={sending}
                    />
                    <Button type="submit" variant="gold" size="icon" disabled={sending || !newMessage.trim()}>
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;

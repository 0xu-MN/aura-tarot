import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Loader2, MoreVertical, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GalaxyBackground } from '@/components/ui/GalaxyBackground';

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

    // Get the OTHER user (assuming 1:1 chat)
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

            // Update room's updated_at timestamp (optional, good for sorting list)
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
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="relative flex flex-col h-screen bg-black overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <GalaxyBackground className="w-full h-full opacity-30" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-black/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gold/10 text-white hover:text-gold -ml-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <Avatar className="w-10 h-10 border border-gold/50 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                        <AvatarImage src={otherUser?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gold/10 text-gold text-xs font-bold">
                            {otherUser?.nickname?.[0] || '?'}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                        <span className="font-bold text-white text-base tracking-wide flex items-center gap-1">
                            {otherUser?.nickname || '알 수 없는 사용자'}
                            {/* Protection Icon (Just for show, makes it look safer/premium) */}
                            {/* <Shield className="w-3 h-3 text-gold/50" /> */}
                        </span>
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online
                        </span>
                    </div>
                </div>

                <Button variant="ghost" size="icon" className="text-white/50 hover:text-gold">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </header>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg) => {
                    const isMyMessage = msg.sender_id === user?.id;
                    const timeString = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div key={msg.id} className={cn("flex w-full", isMyMessage ? "justify-end" : "justify-start")}>
                            <div className={cn("flex flex-col max-w-[75%]", isMyMessage ? "items-end" : "items-start")}>
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words shadow-sm",
                                    isMyMessage
                                        ? "bg-gradient-to-br from-gold to-yellow-600 text-white rounded-br-none shadow-[0_2px_10px_rgba(255,215,0,0.2)]"
                                        : "bg-white/10 border border-white/10 text-gray-100 rounded-bl-none backdrop-blur-sm"
                                )}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-500 mt-1 px-1">
                                    {timeString}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 bg-black/80 border-t border-gold/20 pb-safe backdrop-blur-lg">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end max-w-4xl mx-auto">
                    <div className="relative flex-1">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            className="bg-white/5 border-gold/20 focus:border-gold/60 text-white placeholder:text-gray-500 pl-4 py-6 rounded-full transition-all focus:bg-white/10"
                            disabled={sending}
                        />
                    </div>
                    <Button
                        type="submit"
                        className={cn(
                            "rounded-full w-12 h-12 flex-shrink-0 transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.1)]",
                            newMessage.trim()
                                ? "bg-gold hover:bg-yellow-500 text-black scale-100 rotate-0"
                                : "bg-white/5 text-gray-500 scale-95 rotate-12 cursor-not-allowed"
                        )}
                        disabled={sending || !newMessage.trim()}
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;

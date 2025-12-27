import { AppLayout } from "@/layouts/AppLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatRoom {
    id: string;
    updated_at: string;
    participants: {
        user_id: string;
        profiles: {
            nickname: string;
            avatar_url: string | null;
        }
    }[];
    last_message?: {
        content: string;
        created_at: string;
    };
}

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchRooms = async () => {
            try {
                // Fetch rooms I am participating in
                const { data: myParticipations, error: partError } = await supabase
                    .from('chat_participants')
                    .select('room_id')
                    .eq('user_id', user.id);

                if (partError) throw partError;

                const roomIds = myParticipations.map(p => p.room_id);

                if (roomIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch details for these rooms
                const { data: roomsData, error: roomsError } = await supabase
                    .from('private_chat_rooms')
                    .select(`
                        id,
                        updated_at,
                        chat_participants (
                            user_id,
                            profiles:user_id (
                                nickname,
                                avatar_url
                            )
                        )
                    `)
                    .in('id', roomIds)
                    .order('updated_at', { ascending: false });

                if (roomsError) throw roomsError;

                // Transform data to easy-to-use format
                const formattedRooms = roomsData.map((room: any) => ({
                    id: room.id,
                    updated_at: room.updated_at,
                    participants: room.chat_participants.filter((p: any) => p.user_id !== user.id), // Only show other participants
                    // We might want to fetch last message separately or include via join if performance allows
                }));

                setRooms(formattedRooms);

            } catch (error) {
                console.error('Error fetching chat rooms:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [user]);

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
                <h1 className="text-3xl font-display text-gold-gradient mb-8">메시지</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-gold/10">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">대화 기록이 없습니다.</p>
                        <p className="text-sm text-muted-foreground/50 mt-1">라운지에서 친구를 사귀어보세요!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rooms.map((room) => {
                            const otherUser = room.participants[0]?.profiles;
                            if (!otherUser) return null;

                            return (
                                <div
                                    key={room.id}
                                    onClick={() => navigate(`/chat/${room.id}`)} // Route to be created
                                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-gold/10 hover:border-gold/30 transition-all cursor-pointer hover:bg-gold/5"
                                >
                                    <Avatar className="w-12 h-12 border border-gold/20">
                                        <AvatarImage src={otherUser.avatar_url || undefined} />
                                        <AvatarFallback className="bg-gold/10 text-gold text-xs">
                                            {otherUser.nickname[0]}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-foreground">{otherUser.nickname}</h3>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(room.updated_at), 'MM.dd HH:mm', { locale: ko })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            대화 내용 보기...
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Messages;

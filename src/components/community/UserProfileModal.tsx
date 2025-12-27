import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUser: {
        id: string;
        nickname: string;
        avatar_url?: string | null;
    } | null;
}

export const UserProfileModal = ({ isOpen, onClose, targetUser }: UserProfileModalProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (!targetUser) return null;

    const handleStartChat = async () => {
        if (!user) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        if (user.id === targetUser.id) {
            toast.error("나 자신과는 대화할 수 없습니다.");
            return;
        }

        setLoading(true);
        try {
            // 1. Check if room exists
            const { data: existingRooms, error: searchError } = await supabase
                .from('private_chat_rooms')
                .select(`
          id,
          chat_participants!inner(user_id)
        `)
                .eq('chat_participants.user_id', user.id); // Optimized query to be improved

            // Simplified logic for MVP: Fetch all my rooms and check if target is in them
            // Real app should use a better excessive query or RPC

            // Let's create a new room for now if we can't easily find one
            // Or better: Insert and ignore conflict if possible, but we don't have unique constraint on pair yet.

            // For now, let's just create a room and navigate to it (Chat functionality will handle deduplication or just open raw)
            // Actually, we need to create the room properly.

            const { data: room, error: createError } = await supabase
                .from('private_chat_rooms')
                .insert({})
                .select()
                .single();

            if (createError) throw createError;

            // Add participants
            const { error: joinError } = await supabase
                .from('chat_participants')
                .insert([
                    { room_id: room.id, user_id: user.id },
                    { room_id: room.id, user_id: targetUser.id }
                ]);

            if (joinError) throw joinError;

            // Navigate to chat (or open chat modal)
            // For this step, let's just toast
            toast.success(`${targetUser.nickname}님과의 대화방이 생성되었습니다.`);
            onClose();
            // In future: navigate('/chat/' + room.id) or open ChatModal

        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error("대화방 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-gold/20 p-6">
                <div className="flex flex-col items-center gap-6 py-6">
                    <Avatar className="w-24 h-24 border-2 border-gold/30">
                        <AvatarImage src={targetUser.avatar_url || undefined} />
                        <AvatarFallback className="bg-gold/10 text-gold text-2xl">
                            {targetUser.nickname[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-display text-gold-gradient">{targetUser.nickname}</h2>
                        <p className="text-muted-foreground text-sm">Aura Tarot Member</p>
                    </div>

                    <div className="flex gap-3 w-full max-w-xs">
                        <Button
                            variant="gold"
                            className="flex-1 shadow-lg shadow-gold/20"
                            onClick={handleStartChat}
                            disabled={loading}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            대화하기
                        </Button>
                        {/* Future Feature: Follow/Unfollow */}
                        {/* <Button variant="outline" className="flex-1 border-gold/30 hover:bg-gold/10">
              <UserPlus className="w-4 h-4 mr-2" />
              팔로우
            </Button> */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

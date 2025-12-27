import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, UserMinus, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { INTEREST_CATEGORIES } from "@/types/user";

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
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && targetUser?.id) {
            fetchFullProfile();
        }
    }, [isOpen, targetUser]);

    const fetchFullProfile = async () => {
        if (!targetUser?.id) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetUser.id)
            .single();

        if (!error && data) {
            setFullProfile(data);
        }
    };

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
            // Simplified room creation logic
            const { data: room, error: createError } = await supabase
                .from('private_chat_rooms')
                .insert({})
                .select()
                .single();

            if (createError) throw createError;

            const { error: joinError } = await supabase
                .from('chat_participants')
                .insert([
                    { room_id: room.id, user_id: user.id },
                    { room_id: room.id, user_id: targetUser.id }
                ]);

            if (joinError) throw joinError;

            toast.success(`${targetUser.nickname}님과의 대화방이 생성되었습니다.`);
            onClose();
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

                    {/* Interests Display */}
                    {fullProfile?.interests && fullProfile.interests.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                            {fullProfile.interests.map((interestId: string) => {
                                const category = INTEREST_CATEGORIES.find(c => c.id === interestId);
                                if (!category) return null;
                                return (
                                    <span key={interestId} className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-xs border border-gold/20">
                                        {category.label}
                                    </span>
                                );
                            })}
                        </div>
                    )}

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

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(user.id)) {
            toast.error("로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.");
            return;
        }

        if (!uuidRegex.test(targetUser.id)) {
            toast.error("유효하지 않은 사용자 ID입니다. 대화를 시작할 수 없습니다.");
            return;
        }

        setLoading(true);
        try {
            // 1. Check if a room already exists
            const { data: existingRooms, error: checkError } = await supabase
                .from('chat_participants')
                .select('room_id')
                .eq('user_id', user.id);

            if (checkError) throw checkError;

            let targetRoomId = null;

            if (existingRooms && existingRooms.length > 0) {
                const roomIds = existingRooms.map(r => r.room_id);
                // Check if target user is in any of these rooms
                const { data: targetMatch, error: matchError } = await supabase
                    .from('chat_participants')
                    .select('room_id')
                    .in('room_id', roomIds)
                    .eq('user_id', targetUser.id)
                    .single(); // Assuming 1:1 chat for now

                if (!matchError && targetMatch) {
                    targetRoomId = targetMatch.room_id;
                }
            }

            // 2. If no room exists, create one
            if (!targetRoomId) {
                const { data: newRoomId, error: rpcError } = await supabase
                    .rpc('create_new_chat_room', {
                        other_user_id: targetUser.id
                    });

                if (rpcError) throw rpcError;

                targetRoomId = newRoomId;
                toast.success(`${targetUser.nickname}님와의 대화방이 생성되었습니다.`);
            }

            // 3. Navigate
            onClose();
            navigate(`/messages/${targetRoomId}`);

        } catch (error) {
            console.error('Error starting chat:', error);
            // @ts-ignore
            toast.error(`대화방 이동 실패: ${error?.message || JSON.stringify(error) || '알 수 없는 오류'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-gold/20 p-6">
                <div className="sr-only">
                    <DialogTitle>{targetUser.nickname || '차단된 사용자'}의 프로필</DialogTitle>
                    <DialogDescription>
                        {targetUser.nickname}님의 상세 프로필 정보입니다. 관심사를 확인하고 대화를 시작할 수 있습니다.
                    </DialogDescription>
                </div>
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

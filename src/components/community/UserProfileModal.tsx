import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { INTEREST_CATEGORIES } from "@/types/user";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && targetUser?.id) {
            console.log("[UserProfileModal] Fetching profile for:", targetUser);
            fetchFullProfile();
        }
    }, [isOpen, targetUser]);

    const fetchFullProfile = async () => {
        if (!targetUser?.id) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', targetUser.id) // Fixed: query by user_id (UUID) not id (int)
            .single();

        if (!error && data) {
            setFullProfile(data);
        }
    };

    if (!targetUser) return null;

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
                    {(() => {
                        let interests: string[] = [];
                        try {
                            if (Array.isArray(fullProfile?.interests)) {
                                interests = fullProfile.interests;
                            } else if (typeof fullProfile?.interests === 'string') {
                                // Attempt to parse if it looks like a JSON array
                                if (fullProfile.interests.startsWith('[')) {
                                    interests = JSON.parse(fullProfile.interests);
                                } else {
                                    // Handle comma separated if applicable, or single item
                                    interests = [fullProfile.interests];
                                }
                            }
                        } catch (e) {
                            console.error("Failed to parse interests:", e);
                            interests = [];
                        }

                        if (interests.length === 0) return null;

                        return (
                            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                                {interests.map((interestId: string) => {
                                    const category = INTEREST_CATEGORIES.find(c => c.id === interestId);
                                    if (!category) return null;
                                    return (
                                        <span key={interestId} className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-xs border border-gold/20">
                                            {category.label}
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </DialogContent>
        </Dialog>
    );
};

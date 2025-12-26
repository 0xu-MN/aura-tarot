import { useState, useEffect } from 'react';
import { X, Upload, Check, AlertCircle, Dice5 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
    const { user, userProfile, refreshProfile } = useAuth();
    const [nickname, setNickname] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [nicknameChecking, setNicknameChecking] = useState(false);
    const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [canEditNickname, setCanEditNickname] = useState(true);
    const [daysUntilEdit, setDaysUntilEdit] = useState(0);

    useEffect(() => {
        if (isOpen && userProfile) {
            setNickname(userProfile.nickname || '');
            setAvatarUrl(userProfile.avatar_url || '');
            checkNicknameEditPermission();
        }
    }, [isOpen, userProfile]);

    // Check if user can edit nickname (30-day restriction)
    // Note: nickname_last_changed column needs to be added to profiles table
    const checkNicknameEditPermission = async () => {
        if (!user) return;
        // For now, allow editing since column doesn't exist yet
        setCanEditNickname(true);
    };

    // Nickname duplicate check with debounce
    useEffect(() => {
        if (!nickname || nickname.length < 2 || nickname === userProfile?.nickname) {
            setNicknameAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setNicknameChecking(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('nickname')
                    .eq('nickname', nickname)
                    .maybeSingle();

                if (error) throw error;
                setNicknameAvailable(!data);
            } catch (error) {
                console.error('Nickname check error:', error);
                setNicknameAvailable(null);
            } finally {
                setNicknameChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [nickname, userProfile?.nickname]);

    const handleRandomAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        const randomAvatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
        setAvatarUrl(randomAvatarUrl);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar_${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            setLoading(true);

            // 1. Upload image
            const { error: uploadError } = await supabase.storage
                .from('lounge') // Using existing 'lounge' bucket
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('lounge')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            toast.success('이미지가 업로드되었습니다. 저장 버튼을 눌러 적용해주세요.');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('이미지 업로드 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        if (!canEditNickname) {
            toast.error(`닉네임은 ${daysUntilEdit}일 후에 변경할 수 있습니다.`);
            return;
        }

        if (nickname !== userProfile?.nickname && nicknameAvailable === false) {
            toast.error('이미 사용 중인 닉네임입니다.');
            return;
        }

        if (nickname.length < 2) {
            toast.error('닉네임은 최소 2자 이상이어야 합니다.');
            return;
        }

        setLoading(true);

        try {
            const updates: any = {};

            // Update nickname if changed
            if (nickname !== userProfile?.nickname) {
                updates.nickname = nickname;
            }

            if (avatarUrl !== userProfile?.avatar_url) {
                updates.avatar_url = avatarUrl;
            }

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (error) throw error;

                await refreshProfile();
                toast.success('프로필이 업데이트되었습니다.');
                onClose();
            } else {
                toast.info('변경된 내용이 없습니다.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('프로필 업데이트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
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
            <div className="relative w-full max-w-md bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in p-8">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <h2 className="font-display text-2xl text-gold-gradient mb-6 text-center">
                    프로필 수정
                </h2>

                <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-24 h-24 border-2 border-gold/20">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <AvatarFallback className="bg-gold/20 text-gold font-display text-3xl">
                                    {nickname?.charAt(0) || 'U'}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleRandomAvatar} className="border-gold/30 hover:bg-gold/10">
                                <Dice5 className="w-4 h-4 mr-2" />
                                랜덤 생성
                            </Button>
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gold/30 hover:bg-gold/10 cursor-pointer"
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                    disabled={loading}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    업로드
                                </Button>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nickname */}
                    <div className="space-y-2">
                        <Label htmlFor="nickname">닉네임</Label>
                        <div className="relative">
                            <Input
                                id="nickname"
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                                disabled={!canEditNickname || loading}
                                className={cn(
                                    "bg-background/50 pr-10",
                                    nicknameAvailable === true && "border-green-500",
                                    nicknameAvailable === false && "border-red-500"
                                )}
                            />
                            {nicknameChecking && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            {!nicknameChecking && nicknameAvailable === true && (
                                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            )}
                            {!nicknameChecking && nicknameAvailable === false && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                            )}
                        </div>

                        {!canEditNickname && (
                            <p className="text-xs text-red-500">
                                닉네임은 {daysUntilEdit}일 후에 변경할 수 있습니다 (30일 제한)
                            </p>
                        )}
                        {nicknameAvailable === false && (
                            <p className="text-xs text-red-500">
                                이미 사용 중인 닉네임입니다
                            </p>
                        )}
                        {nicknameAvailable === true && (
                            <p className="text-xs text-green-500">
                                사용 가능한 닉네임입니다
                            </p>
                        )}
                        {nickname.length < 2 && nickname.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                2자 이상 입력해주세요
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            취소
                        </Button>
                        <Button
                            variant="gold"
                            className="flex-1"
                            onClick={handleSave}
                            disabled={loading || !canEditNickname || (nickname === userProfile?.nickname && avatarUrl === userProfile?.avatar_url)}
                        >
                            {loading ? '저장 중...' : '저장'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

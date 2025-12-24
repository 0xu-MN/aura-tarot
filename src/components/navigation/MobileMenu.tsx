import { User, Settings, BookOpen, Users, MessageSquare, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { clearAuthPreferences } from '@/lib/authStorage';
import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);

    // Check developer mode when menu opens
    useEffect(() => {
        if (isOpen) {
            const devMode = localStorage.getItem('dev_mode') === 'true';
            setIsDeveloperMode(devMode);
        }
    }, [isOpen]);

    const handleSignOut = async () => {
        await signOut();
        clearAuthPreferences();
        onClose();
        navigate('/');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    const menuItems = [
        {
            icon: User,
            label: '프로필',
            path: '/settings',
            description: '내 정보 관리',
        },
        {
            icon: BookOpen,
            label: '콘텐츠',
            path: '/contents',
            description: '타로 & 운세',
        },
        {
            icon: Users,
            label: '라운지',
            path: '/lounge',
            description: '소통 공간',
        },
        {
            icon: Users,
            label: '그룹/모임',
            path: '/groups',
            description: '관심사별 모임',
        },
        {
            icon: MessageSquare,
            label: '메시지',
            path: '/messages',
            description: '1:1 대화',
        },
    ];

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="w-full max-w-[85vw] sm:w-96 p-0 border-l border-gold/20 bg-card"
            >
                <div className="flex flex-col h-full">
                    <SheetHeader className="sr-only">
                        <SheetTitle>메뉴</SheetTitle>
                    </SheetHeader>

                    {/* Header - 로그인 상태에 따라 다르게 표시 */}
                    <div className="p-6 border-b border-gold/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-display text-xl text-gold">메뉴</h2>
                            {/* Sheet usually has its own close button, but we can keep custom one or rely on Sheet's. 
                                Shadcn SheetContent includes a close button by default. 
                                We'll hide the default one via CSS if we want our own, or just remove our own.
                                The default close button is absolute positioned. 
                            */}
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gold/10 to-mystic-purple/10 border border-gold/20">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-gold/20 text-gold font-display text-lg">
                                        {user.nickname?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-display text-lg font-medium truncate">
                                        {user.nickname}님
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{user.name}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Main - 로그인 시 메뉴 목록, 비로그인 시 안내 문구 */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {user ? (
                            <div className="space-y-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavigation(item.path)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gold/10 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                                            <item.icon className="w-5 h-5 text-gold" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-center">
                                    로그인하여 더 많은<br />
                                    기능을 이용하세요
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer - 로그인 시 로그아웃, 비로그인 시 로그인 버튼 */}
                    <div className="p-4 border-t border-gold/10">
                        {user ? (
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                                onClick={handleSignOut}
                            >
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </Button>
                        ) : (
                            <Button
                                variant="gold"
                                className="w-full"
                                onClick={() => handleNavigation('/')}
                            >
                                로그인
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

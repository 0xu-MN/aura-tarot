import { User, Settings, BookOpen, Users, MessageSquare, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { clearAuthPreferences } from '@/lib/authStorage';
import { useState, useEffect } from 'react';
import { INTEREST_CATEGORIES } from '@/types/user';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginClick?: () => void;
}

export const MobileMenu = ({ isOpen, onClose, onLoginClick }: MobileMenuProps) => {
    const { user, userProfile, signOut } = useAuth();
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

    const handleLoginClick = () => {
        onClose(); // Close the mobile menu first
        if (onLoginClick) {
            onLoginClick(); // Call parent's login handler
        }
    };

    const menuItems = [
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
            icon: MessageSquare,
            label: '메시지',
            path: '/messages',
            description: '1:1 대화',
        },
        {
            icon: Settings,
            label: '설정',
            path: '/settings',
            description: '내 정보 관리',
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
                            <div
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gold/20 p-5 cursor-pointer transition-all hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5"
                                onClick={() => handleNavigation('/settings')}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-14 h-14 border-2 border-gold/20 group-hover:border-gold/50 transition-colors">
                                        <AvatarFallback className="bg-gold/20 text-gold font-display text-xl">
                                            {user.nickname?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-display text-lg text-gold group-hover:text-gold-light transition-colors truncate pr-2">
                                                {user.nickname}
                                            </h2>
                                            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {user.email || '사용자'}
                                        </p>

                                        {/* Interests Badges */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {userProfile?.interests?.slice(0, 3).map((interestId) => {
                                                const category = INTEREST_CATEGORIES.find(c => c.id === interestId);
                                                if (!category) return null;
                                                return (
                                                    <span
                                                        key={interestId}
                                                        className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] border border-gold/20"
                                                    >
                                                        {category.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
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
                                onClick={handleLoginClick}
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

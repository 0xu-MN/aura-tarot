import { X, User, Settings, BookOpen, Users, MessageSquare, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { clearAuthPreferences } from '@/lib/authStorage';
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}
export const MobileMenu = ({
  isOpen,
  onClose
}: MobileMenuProps) => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
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
  const menuItems = [{
    icon: User,
    label: '프로필',
    path: '/settings',
    description: '내 정보 관리'
  }, {
    icon: Settings,
    label: '설정',
    path: '/settings',
    description: '앱 설정'
  }, {
    icon: BookOpen,
    label: '콘텐츠',
    path: '/contents',
    description: '타로 & 운세'
  }, {
    icon: Users,
    label: '커뮤니티',
    path: '/community',
    description: '소통 공간'
  }, {
    icon: Users,
    label: '그룹/모임',
    path: '/groups',
    description: '관심사별 모임'
  }, {
    icon: MessageSquare,
    label: '메시지',
    path: '/messages',
    description: '1:1 대화'
  }];
  return <>
            {/* Backdrop */}
            <div className={cn('fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={onClose} />

            {/* Menu Drawer */}
            <div className={cn('fixed top-0 right-0 h-full w-96 max-w-[85vw] bg-card border-l border-gold/20 shadow-2xl z-50', 'transform transition-transform duration-300 ease-in-out', isOpen ? 'translate-x-0' : 'translate-x-full')}>
                <div className="flex flex-col h-full">
                    {/* User Greeting Header */}
                    {user && <div className="p-6 border-b border-gold/10">
                            <button onClick={() => handleNavigation('/settings')} className="w-full text-left hover:opacity-80 transition-opacity">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gold/10 to-mystic-purple/10 border border-gold/20">
                                    <Avatar className="w-14 h-14">
                                        <AvatarFallback className="bg-gold/20 text-gold font-display text-xl">
                                            {user.nickname?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-display text-lg font-medium truncate">
                                            {user.nickname}님
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            프로필 보기 &gt;
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>}

                    {/* Header */}
                    <div className="p-6 border-b border-gold/10">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-xl text-gold">오늘의 한장</h2>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        {user ? <div className="space-y-1">
                                {menuItems.map(item => <button key={item.path} onClick={() => handleNavigation(item.path)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gold/10 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                                            <item.icon className="w-5 h-5 text-gold" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </button>)}
                            </div> : <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-center">로그인하여 더 많은
기능을 이용하세요<br />
                                    기능을 이용하세요
                                </p>
                            </div>}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gold/10">
                        {user ? <Button variant="outline" className="w-full justify-start gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={handleSignOut}>
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </Button> : <Button variant="gold" className="w-full" onClick={() => handleNavigation('/')}>
                                로그인
                            </Button>}
                    </div>
                </div>
            </div>
        </>;
};
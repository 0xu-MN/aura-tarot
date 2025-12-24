import { NavLink as RouterNavLink } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { path: '/home', label: '홈', icon: Home },
    { path: '/contents', label: '컨텐츠', icon: BookOpen },
    { path: '/chatbot', label: '챗봇', icon: MessageCircle },
    { path: '/lounge', label: '라운지', icon: Users },
    { path: '/settings', label: '설정', icon: Settings },
];

export const BottomNav = () => {


    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-gold/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => (
                        <RouterNavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                                    'hover:bg-gold/10',
                                    isActive
                                        ? 'text-gold'
                                        : 'text-muted-foreground'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        className={cn(
                                            'w-5 h-5 transition-transform duration-200',
                                            isActive && 'scale-110'
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            'text-xs font-medium',
                                            isActive && 'font-semibold'
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold animate-pulse" />
                                    )}
                                </>
                            )}
                        </RouterNavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

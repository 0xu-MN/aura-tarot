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
        <nav className="fixed bottom-6 left-4 right-4 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl" />
            <div className="relative container mx-auto px-2">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => (
                        <RouterNavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    'relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300',
                                    'hover:bg-white/5',
                                    isActive
                                        ? 'text-gold'
                                        : 'text-muted-foreground/60 hover:text-muted-foreground'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={cn(
                                        "absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold/20 blur-xl transition-all duration-300",
                                        isActive ? "opacity-100" : "opacity-0"
                                    )} />

                                    <item.icon
                                        className={cn(
                                            'w-5 h-5 transition-transform duration-300 z-10',
                                            isActive && 'scale-110 -translate-y-0.5'
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            'text-[10px] font-medium transition-all duration-300 z-10',
                                            isActive
                                                ? 'opacity-100 translate-y-0'
                                                : 'opacity-70 translate-y-0.5'
                                        )}
                                    >
                                        {item.label}
                                    </span>

                                    {isActive && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                                    )}
                                </>
                            )}
                        </RouterNavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
    );
};

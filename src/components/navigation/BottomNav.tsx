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
        <nav className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="relative w-full max-w-md pointer-events-auto">
                {/* Glass Background */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/5" />

                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                <div className="relative flex items-center justify-around h-20 px-4">
                    {navItems.map((item) => (
                        <RouterNavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    'relative flex flex-col items-center justify-center w-full h-full gap-1 rounded-full transition-all duration-300 group',
                                    isActive
                                        ? 'text-gold'
                                        : 'text-muted-foreground/60 hover:text-white/80'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active Glow Background */}
                                    <div className={cn(
                                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gold/10 blur-md transition-all duration-500",
                                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                    )} />

                                    {/* Icon */}
                                    <item.icon
                                        className={cn(
                                            'w-6 h-6 transition-all duration-300 z-10',
                                            isActive ? 'scale-110 -translate-y-1 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : 'group-hover:scale-105'
                                        )}
                                    />

                                    {/* Label */}
                                    <span
                                        className={cn(
                                            'text-[10px] font-medium transition-all duration-300 z-10 absolute bottom-2',
                                            isActive
                                                ? 'opacity-100 translate-y-0'
                                                : 'opacity-0 translate-y-2'
                                        )}
                                    >
                                        {item.label}
                                    </span>

                                    {/* Active Dot indicator (Optional, keeping simple for now) */}
                                    {isActive && (
                                        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-gold shadow-[0_0_5px_#ffd700]" />
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

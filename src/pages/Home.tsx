import { useState, useEffect } from 'react'; // Added useEffect
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useNavigate } from "react-router-dom"; // Added useNavigate
import weeklyThumb from '@/assets/weekly-thumb.jpg';
import monthlyThumb from '@/assets/monthly-thumb.jpg';
import { UserProfileModal } from "@/components/community/UserProfileModal"; // Added UserProfileModal
import { BetaBanner } from '@/components/beta/BetaBanner'; // Added BetaBanner
import { CardDrawing } from '@/components/CardDrawing';
import { RecommendedContent } from '@/components/RecommendedContent';
import { Sparkles } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate(); // Added navigate
    const { user, userProfile } = useAuth(); // Added user
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false); // Added showProfileModal
    const [welcomeMessage, setWelcomeMessage] = useState(""); // Added welcomeMessage

    useEffect(() => { // Added useEffect for welcome message
        const hours = new Date().getHours();
        if (hours < 12) setWelcomeMessage("좋은 아침입니다");
        else if (hours < 18) setWelcomeMessage("나른한 오후네요");
        else setWelcomeMessage("하루를 마무리할 시간입니다");
    }, []);

    return (
        <>
            <AppLayout> {/* Default showHeader is true */}
                <BetaBanner /> {/* Added BetaBanner */}
                <div className="container mx-auto px-4 pt-6 pb-20"> {/* Adjusted padding */}
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-gold" />
                            <h1 className="font-display text-2xl md:text-3xl text-gold-gradient">
                                안녕하세요, {userProfile?.nickname || '방문자'}님
                            </h1>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            당신의 운명을 점쳐보세요
                        </p>

                    </div>

                    {/* Card Drawing Section */}
                    <CardDrawing />

                    {/* Weekly & Monthly Fortune Banner Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 w-full animate-fade-in mt-8">
                        {/* Weekly Fortune */}
                        <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 h-32" onClick={() => window.location.href = '/tarot/weekly'}>
                            <div className="absolute inset-0">
                                <img
                                    src={weeklyThumb}
                                    alt="Weekly Horoscope"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                            </div>
                            <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] text-gold font-bold">
                                        WEEKLY
                                    </span>
                                    <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl text-white mb-0.5">이번 주 운세</h3>
                                    <p className="text-xs text-gray-300">한 주의 에너지를 미리 확인하세요</p>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Fortune */}
                        <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 h-32" onClick={() => window.location.href = '/tarot/monthly'}>
                            <div className="absolute inset-0">
                                <img
                                    src={monthlyThumb}
                                    alt="Monthly Horoscope"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                            </div>
                            <div className="absolute inset-0 bg-[url('/assets/stars.svg')] opacity-30" />
                            <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] text-purple-200 font-bold">
                                        MONTHLY
                                    </span>
                                    <span className="text-xl group-hover:scale-110 transition-transform">🌕</span>
                                </div>
                                <div>
                                    <h3 className="font-display text-xl text-white mb-0.5">이번 달 운세</h3>
                                    <p className="text-xs text-gray-300">이달의 흐름과 키워드를 알아보세요</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Content */}
                    <div className="mt-12">
                        <RecommendedContent />
                    </div>
                </div>
            </AppLayout>

            {/* Auth Modals */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                }}
            />
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                }}
            />
        </>
    );
};

export default Home;

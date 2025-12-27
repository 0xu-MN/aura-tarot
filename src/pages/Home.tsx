import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { CardDrawing } from '@/components/CardDrawing';
import { RecommendedContent } from '@/components/RecommendedContent';
import { Sparkles } from 'lucide-react';

const Home = () => {
    const { userProfile } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    return (
        <>
            <AppLayout>
                <div className="container mx-auto px-4 py-8">
                    {/* Welcome Section */}
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
                        {userProfile && (
                            <p className="text-muted-foreground">
                                오늘의 무료 카드 뽑기: {userProfile.daily_draws_remaining}/3 남음
                            </p>
                        )}
                    </div>

                    {/* Card Drawing Section */}
                    <CardDrawing />

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

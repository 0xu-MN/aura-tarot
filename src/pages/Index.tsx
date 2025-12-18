import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { LoginModal } from "@/components/auth/LoginModal";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleStartReading = () => {
    if (user) {
      navigate("/home");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleFeatureClick = (feature: string) => {
    if (feature === "daily") {
      handleStartReading();
    } else {
      toast("준비 중입니다", {
        description: "이 기능은 곧 출시될 예정입니다.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <HeroSection onStartReading={handleStartReading} />
        <FeaturesSection onFeatureClick={handleFeatureClick} />

        {/* Footer */}
        <footer className="py-12 border-t border-gold/10">
          <div className="container mx-auto px-4 text-center">
            <p className="font-display text-lg text-gold-gradient mb-2">
              오늘의 한 장
            </p>
            <p className="text-sm text-muted-foreground">
              AI 타로 마스터와 함께하는 신비로운 여정
            </p>
            <p className="text-xs text-muted-foreground/50 mt-4">
              © 2025 오늘의 한 장. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

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
      <Toaster />
    </div>
  );
};

export default Index;

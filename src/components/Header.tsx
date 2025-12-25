import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileMenu } from "./navigation/MobileMenu";
import { LoginModal } from "./auth/LoginModal";
import { RegisterModal } from "./auth/RegisterModal";

export const Header = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-gold/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={user ? "/home" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Aura Tarot" className="w-12 h-12 rounded-lg object-cover" />
            <span className="font-display text-xl text-gold-gradient">
              오늘의 한 장
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <MobileMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      </header>

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

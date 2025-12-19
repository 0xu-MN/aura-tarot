import { Sparkles, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-gold/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? "/home" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl text-gold-gradient">
            오늘의 한 장
          </span>
        </Link>

        <Button variant="ghost" size="icon" className="text-foreground">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

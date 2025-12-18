import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DailyCardModal } from "@/components/DailyCardModal";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartReading = () => {
    setIsModalOpen(true);
  };

  const handleFeatureClick = (feature: string) => {
    if (feature === "daily") {
      setIsModalOpen(true);
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

      <DailyCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Toaster />
    </div>
  );
};

export default Index;

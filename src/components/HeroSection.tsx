import { Button } from "./ui/button";
import { TarotCard } from "./TarotCard";
import { Sparkles, Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

interface HeroSectionProps {
  onStartReading?: () => void;
}

export const HeroSection = ({ onStartReading }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-gold/30 mb-6 animate-fade-in">
          <Star className="w-4 h-4 text-gold" />
          <span className="text-sm text-foreground">AI가 해석하는 나만의 타로</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-gold-gradient mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          오늘의 한 장
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          당신의 운명을 비추는 타로 카드<br />
          AI 타로 마스터가 깊이 있는 해석을 전해드립니다
        </p>

        {/* Floating Card */}
        <div className="my-10 animate-float">
          <TarotCard size="lg" interactive={false} className="mx-auto glow-gold" />
        </div>

        <Button
          variant="gold"
          size="xl"
          onClick={onStartReading}
          className="animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <Sparkles className="w-5 h-5" />
          오늘의 카드 뽑기
        </Button>

        <p className="mt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
          무료로 시작하기 • 매일 새로운 운세
        </p>
      </div>
    </section>
  );
};

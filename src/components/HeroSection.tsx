import { useState } from "react";
import { TarotCard } from "./TarotCard";
import { Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onStartReading?: () => void;
  isEntering?: boolean;
}

export const HeroSection = ({ onStartReading, isEntering = false }: HeroSectionProps) => {
  const handleCardClick = () => {
    if (isEntering) return;
    onStartReading?.();
  };

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
      <div
        className={cn(
          "relative z-10 container mx-auto px-4 py-20 text-center transition-all duration-700",
          isEntering && "scale-110 opacity-0"
        )}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-gold/30 mb-6 animate-fade-in">
          <Star className="w-4 h-4 text-gold" />
          <span className="text-sm text-foreground">AI가 해석하는 나만의 타로</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-gold-gradient mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          오늘의 한 장
        </h1>

        {/* Fixed 2-line text */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
          <span className="block">당신의 운명을 비추는 타로 카드</span>
          <span className="hidden md:block">AI 타로 마스터가 깊이 있는 해석을 전해드립니다</span>
          <span className="block md:hidden">AI 타로 마스터가 깊이 있는</span>
          <span className="block md:hidden">해석을 전해드립니다</span>
        </p>

        {/* Clickable Card with Entry Animation */}
        <div
          className={cn(
            "my-10 cursor-pointer transition-all duration-700 relative group",
            !isEntering && "animate-float",
            isEntering && "scale-150 opacity-0"
          )}
          onClick={handleCardClick}
        >
          <div className="relative mx-auto w-fit mb-8">
            <TarotCard size="lg" interactive={false} className="mx-auto glow-gold" />

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 rounded-xl glow-mystic" />
            </div>
          </div>

          {/* Glass Gold Surface Button */}
          <div className="relative mx-auto w-fit group/button">
            <div className={cn(
              "relative px-10 py-5 rounded-2xl transition-all duration-300",
              "bg-gold/20 backdrop-blur-xl backdrop-saturate-200 backdrop-brightness-110",
              "border border-gold/40",
              "shadow-[inset_0_1px_0_0_rgba(255,215,0,0.5),_inset_0_-1px_0_0_rgba(212,175,55,0.3),_0_8px_32px_0_rgba(0,0,0,0.4)]",
              "group-hover/button:bg-gold/30 group-hover/button:border-gold/60 group-hover/button:shadow-[inset_0_1px_0_0_rgba(255,215,0,0.7),_inset_0_-1px_0_0_rgba(212,175,55,0.4),_0_12px_48px_0_rgba(212,175,55,0.4)]",
              "active:scale-95"
            )}>
              <div className="flex items-center gap-3">
                <span className="font-display text-xl text-gold-foreground font-bold tracking-wide group-hover/button:text-white transition-colors">
                  운명의 카드 뽑기
                </span>
                <Star className="w-5 h-5 text-gold group-hover/button:text-white transition-colors animate-pulse" />
              </div>

              {/* Shine Sweep Effect */}
              <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-[-150%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover/button:left-[250%]" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
          무료로 시작하기 • 매일 새로운 운세
        </p>
      </div>

      {/* Entry overlay effect */}
      <div
        className={cn(
          "absolute inset-0 z-20 bg-background pointer-events-none transition-opacity duration-500",
          isEntering ? "opacity-100" : "opacity-0"
        )}
      />
    </section>
  );
};

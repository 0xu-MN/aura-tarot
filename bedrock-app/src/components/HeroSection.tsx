import { useState } from "react";
import { TarotCard } from "./TarotCard";
import { Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onStartReading?: () => void;
  onGuestEntry?: () => void;
  isEntering?: boolean;
}

export const HeroSection = ({ onStartReading, onGuestEntry, isEntering = false }: HeroSectionProps) => {
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

        <div className="flex flex-col items-center gap-6">
          <div
            className={cn(
              "cursor-pointer transition-all duration-700 hover:scale-105",
              !isEntering && "animate-float",
              isEntering && "scale-150 opacity-0"
            )}
            onClick={handleCardClick}
          >
            <div className="relative mx-auto w-fit mb-4">
              <TarotCard size="lg" interactive={false} className="mx-auto glow-gold" />

              {/* Simple Text CTA */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="font-display text-lg text-gold/80 hover:text-white transition-colors drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] tracking-wider">
                  카드를 터치하세요
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onGuestEntry}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium text-white/50 border border-white/20 hover:bg-white/10 hover:text-white/80 transition-all duration-300 animate-fade-in mt-8",
              isEntering && "opacity-0"
            )}
            style={{ animationDelay: "0.5s" }}
          >
            회원가입 없이 둘러보기
          </button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
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

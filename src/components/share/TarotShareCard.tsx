import React from 'react';
import { cn } from '@/lib/utils';
import { TarotCardData } from '@/lib/tarot-data';

interface TarotShareCardProps {
    id?: string;
    date: string;
    card: TarotCardData;
    isReversed: boolean;
    reading: string;
    userName?: string;
    type: 'monthly' | 'daily';
}

export const TarotShareCard = ({
    id = "tarot-share-card",
    date,
    card,
    isReversed,
    reading,
    userName = 'Traveler',
    type
}: TarotShareCardProps) => {
    // Split reading into chunks for bubbles (max 3)
    const messages = reading
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 3);

    return (
        <div
            id={id}
            className="w-[600px] h-[600px] relative overflow-hidden bg-[#1a1a1a]"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
        >
            {/* Background Image */}
            <img
                src="/assets/somi-reading-bg.jpg"
                alt="Som-i Reading"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Speech Bubbles Container */}
            <div className="absolute top-12 right-6 w-[360px] flex flex-col gap-3 z-20">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className="flex items-start gap-3 animate-fade-in"
                        style={{ animationDelay: `${idx * 0.15}s` }}
                    >
                        {/* Somi Avatar */}
                        <div className="w-9 h-9 rounded-full bg-[#FFB84C] flex items-center justify-center shrink-0 border-2 border-white shadow-md z-10">
                            <span className="text-white font-bold text-[8px] tracking-tighter">Somi</span>
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                            "bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-[18px] rounded-tl-[4px] shadow-lg text-gray-800 text-sm font-medium leading-relaxed relative",
                            "border border-white/50"
                        )}>
                            {msg}
                        </div>
                    </div>
                ))}
            </div>

            {/* Card Overlay Area - Reduced Size & Positoned Lower/Left to reveal face */}
            {/* 
                Original: top-[45%] left-[34%] w-[140px]
                Adjusted: top-[52%] left-[32%] w-[100px] (Smaller, lower)
            */}
            <div
                className="absolute top-[55%] left-[32%] w-[100px] aspect-[2/3] z-10 transform -translate-x-1/2 -translate-y-1/2 -rotate-[12deg] shadow-2xl"
            >
                <div className={cn(
                    "w-full h-full rounded-[6px] overflow-hidden border-[1.5px] border-[#d4af37] bg-black shadow-lg",
                    isReversed ? "rotate-180" : ""
                )}>
                    <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Date Badge - Pill Shape */}
            <div className="absolute bottom-7 left-6 z-20">
                <div className="bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-lg flex items-center gap-3">
                    <span className="text-white font-display text-sm tracking-wider font-medium">{date}</span>
                    <div className="w-[1px] h-3 bg-white/30" />
                    <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase">오늘의 한 장</span>
                </div>
            </div>

            {/* Brand Watermark */}
            <div className="absolute bottom-6 right-6 text-white/40 text-[10px] font-light tracking-widest">
                @today_one_card
            </div>
        </div>
    );
};

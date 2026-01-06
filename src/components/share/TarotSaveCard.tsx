import React from 'react';
import { cn } from '@/lib/utils';
import { TarotCardData } from '@/lib/tarot-data';
import { Menu } from 'lucide-react';

interface TarotSaveCardProps {
    date: string;
    card: TarotCardData;
    isReversed: boolean;
    reading: string;
    userName?: string;
}

export const TarotSaveCard = ({
    date,
    card,
    isReversed,
    reading,
    userName = 'Traveler'
}: TarotSaveCardProps) => {
    const formattedDate = date;

    // Parse reading to extract question and content
    const parseReading = (text: string) => {
        // Extract question (text between 📝 and first newline)
        const questionMatch = text.match(/📝\s*(.+?)(?:\n|$)/);
        const question = questionMatch ? questionMatch[1].trim() : '';

        // CLEAN TEXT for save (remove intro)
        let content = text;
        content = content.replace(/^[^.!?]+[.!?]\s*/, ''); // Remove 1st sentence
        content = content.replace(/^[^.!?]+[.!?]\s*/, ''); // Remove 2nd sentence
        content = content.replace(/안녕하세요[^.!?]*[.!?]/g, '');
        content = content.replace(/타로\s*전문가\s*솜이/g, '');
        content = content.replace(/살펴보겠습니다[.!?]/g, '');
        content = content.trim().replace(/\n{3,}/g, '\n\n');

        return { question, content };
    };

    const { question: userQuestion, content: mainContent } = parseReading(reading);

    return (
        <div
            id="tarot-save-final"
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-[#1a1a1a]"
            style={{ width: '1080px', height: '1350px', fontFamily: 'Pretendard, sans-serif' }}
        >
            {/* Background Image */}
            <img
                src="/assets/tarot-save-bg.jpg"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* iPhone Pro Style Phone Panel */}
            <div className="absolute top-[80px] left-[80px] w-[500px] bottom-[80px] flex flex-col">
                {/* Phone Outer Shell */}
                <div className="relative w-full h-full rounded-[48px] bg-gradient-to-br from-gray-800 to-gray-900 p-[3px] shadow-[0_25px_70px_rgba(0,0,0,0.6)]">

                    {/* Bezel Shine */}
                    <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>

                    {/* Inner Screen - BRIGHTENED */}
                    <div className="relative w-full h-full rounded-[45px] bg-[#1c1c1e] backdrop-blur-md overflow-hidden flex flex-col border border-white/10">

                        {/* iOS Status Bar (Top) */}
                        <div className="absolute top-[14px] left-0 right-0 px-8 flex items-center justify-between text-white text-sm font-semibold z-40">
                            {/* Left: Time */}
                            <div className="text-white">9:41</div>
                            {/* Right: Icons */}
                            <div className="flex items-center gap-1.5">
                                {/* Signal Strength */}
                                <svg className="w-4 h-3.5" viewBox="0 0 16 14" fill="white">
                                    <circle cx="2" cy="12" r="1.5" />
                                    <circle cx="6" cy="9" r="1.5" />
                                    <circle cx="10" cy="6" r="1.5" />
                                    <circle cx="14" cy="3" r="1.5" />
                                </svg>
                                {/* WiFi */}
                                <svg className="w-4 h-3.5" viewBox="0 0 16 14" fill="white">
                                    <path d="M8 14C8.55 14 9 13.55 9 13C9 12.45 8.55 12 8 12C7.45 12 7 12.45 7 13C7 13.55 7.45 14 8 14Z" />
                                    <path d="M8 10C9.1 10 10 10.9 10 12H6C6 10.9 6.9 10 8 10Z" />
                                    <path d="M8 6C10.2 6 12 7.8 12 10H4C4 7.8 5.8 6 8 6Z" />
                                </svg>
                                {/* Battery */}
                                <svg className="w-6 h-3" viewBox="0 0 24 12" fill="none">
                                    <rect x="0" y="2" width="18" height="8" rx="2" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.35" />
                                    <rect x="2" y="4" width="10" height="4" rx="1" fill="white" />
                                    <rect x="19" y="4" width="2" height="4" rx="0.5" fill="white" fillOpacity="0.4" />
                                </svg>
                            </div>
                        </div>

                        {/* Dynamic Island (Notch) */}
                        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[130px] h-[32px] bg-black rounded-[20px] z-30 shadow-[0_2px_10px_rgba(0,0,0,0.8)] border border-gray-900">
                            <div className="absolute top-1/2 left-[20px] -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-gradient-to-br from-blue-900 to-black border border-gray-700"></div>
                            <div className="absolute top-1/2 right-[20px] -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-red-950 border border-gray-700"></div>
                        </div>

                        {/* Physical Buttons */}
                        <div className="absolute top-[140px] -right-[3px] w-[5px] h-[70px] bg-gradient-to-r from-gray-600 to-gray-700 rounded-l-md shadow-inner"></div>
                        <div className="absolute top-[230px] -right-[3px] w-[5px] h-[50px] bg-gradient-to-r from-gray-600 to-gray-700 rounded-l-md shadow-inner"></div>
                        <div className="absolute top-[120px] -left-[3px] w-[5px] h-[50px] bg-gradient-to-l from-gray-600 to-gray-700 rounded-r-md shadow-inner"></div>
                        <div className="absolute top-[185px] -left-[3px] w-[5px] h-[50px] bg-gradient-to-l from-gray-600 to-gray-700 rounded-r-md shadow-inner"></div>
                        <div className="absolute top-[80px] -left-[3px] w-[5px] h-[25px] bg-gradient-to-l from-orange-600 to-orange-700 rounded-r-md shadow-inner"></div>

                        {/* Screen Glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>

                        {/* Header */}
                        <div className="h-[80px] px-6 flex items-center justify-between border-b border-white/10 shrink-0 mt-[40px]">
                            <Menu className="w-8 h-8 text-white" />
                            <span className="text-white font-bold text-xl">오늘의 한 장</span>
                            <div className="w-8" />
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-4 relative flex flex-col gap-4 overflow-y-auto">
                            <div className="absolute left-[54px] top-6 bottom-6 w-[2px] bg-white/30" />

                            {/* Post 1: Card */}
                            <div className="relative z-10 flex gap-4 items-start">
                                <div className="w-14 h-14 rounded-full bg-[#FF5E2B] flex items-center justify-center shrink-0 border-2 border-[#2a2a2a] shadow-lg z-10 overflow-hidden">
                                    <img src="/som-i.jpg" alt="Somi" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    {/* FORCE CENTERED BADGES - compensate for font metrics */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="bg-[#FF5E2B] text-white text-[11px] px-3 rounded-full font-bold inline-flex items-center justify-center"
                                            style={{
                                                height: '22px',
                                                lineHeight: '1',
                                                paddingTop: '0',
                                                paddingBottom: '0'
                                            }}
                                        >
                                            <span style={{ transform: 'translateY(0px)', display: 'block' }}>
                                                {userName}
                                            </span>
                                        </div>
                                        <div
                                            className="bg-[#FF5E2B] text-white text-[11px] px-3 rounded-full font-bold inline-flex items-center justify-center"
                                            style={{
                                                height: '22px',
                                                lineHeight: '1',
                                                paddingTop: '0',
                                                paddingBottom: '0'
                                            }}
                                        >
                                            <span style={{ transform: 'translateY(0px)', display: 'block' }}>
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </div>
                                    {/* SMALLER CARD: 180px -> 160px */}
                                    <div className="w-full max-w-[160px] aspect-[2/3] bg-black/50 rounded-lg overflow-hidden border border-white/10 shadow-inner p-2">
                                        <div className={cn("w-full h-full relative rounded-md overflow-hidden", isReversed ? "rotate-180" : "")}>
                                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Post 2: Reading */}
                            <div className="relative z-10 flex gap-4 items-start">
                                <div className="w-14 h-14 rounded-full bg-[#FF5E2B] flex items-center justify-center shrink-0 border-2 border-[#2a2a2a] shadow-lg z-10 overflow-hidden">
                                    <img src="/som-i.jpg" alt="Somi" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    {/* FORCE CENTERED BADGE */}
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="bg-[#FF5E2B] text-white text-[11px] px-3 rounded-full font-bold inline-flex items-center justify-center"
                                            style={{
                                                height: '22px',
                                                lineHeight: '1',
                                                paddingTop: '0',
                                                paddingBottom: '0'
                                            }}
                                        >
                                            <span style={{ transform: 'translateY(0px)', display: 'block' }}>
                                                {userName}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Main content box */}
                                    <div className="bg-[#2a2a2a] text-white/90 p-5 rounded-xl border border-white/5 text-sm leading-relaxed whitespace-pre-line shadow-lg">
                                        {mainContent}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="relative z-10 ml-[54px] pt-4 pb-8">
                                <p className="text-white/30 text-xs pl-4">To continue...</p>
                            </div>
                        </div>

                        {/* Home Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-[5px] bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

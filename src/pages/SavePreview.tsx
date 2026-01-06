import React from 'react';
import { TarotSaveCard } from '@/components/share/TarotSaveCard';
import { TAROT_CARDS } from '@/lib/tarot-data';

export default function SavePreview() {
    const sampleCard = TAROT_CARDS.find(c => c.id === 0) || TAROT_CARDS[0];
    const sampleDate = "2024. 01. 06";
    const sampleReading = `새로운 시작의 기운이 강하게 느껴지는 하루입니다. 
당신의 순수한 열정이 길을 열어줄 것입니다.
    
망설였던 일이 있다면 과감하게 도전해보세요. 
무모해 보일지라도 지금은 당신의 직관을 믿고 나아갈 때입니다.`;

    return (
        <div className="min-h-screen bg-black overflow-auto flex items-center justify-center p-10">
            {/* Scale down for preview if needed */}
            <div className="transform scale-[0.5] origin-top">
                <TarotSaveCard
                    date={sampleDate}
                    card={sampleCard}
                    isReversed={false}
                    reading={sampleReading}
                    userName="AuraUser"
                />
            </div>
        </div>
    );
}

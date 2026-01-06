import React from 'react';
import { TarotShareCard } from '@/components/share/TarotShareCard';
import { TAROT_CARDS } from '@/lib/tarot-data';

export default function SharePreview() {
    // Sample Data for Promo
    const sampleCard = TAROT_CARDS.find(c => c.id === 0) || TAROT_CARDS[0]; // The Fool
    const sampleDate = "2024. 01. 06";

    // Promotional Copy
    const promoReading = `2026년 신년운? 연애운? 재물운? 직장운?
오늘의 한장에서 다 물어봐도 돼 💌
팔로우하고 지금 무료로 뽑아보자 💕`;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-10">
            <TarotShareCard
                date={sampleDate}
                card={sampleCard}
                isReversed={false}
                reading={promoReading}
                userName="AuraUser"
                type="daily"
            />
        </div>
    );
}

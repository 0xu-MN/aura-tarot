export interface TarotCardData {
    name: string;
    koreanName: string;
    arcana: 'major' | 'minor';
    suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
    number: number;
    image?: string;
}

export const TAROT_CARDS: TarotCardData[] = [
    // Major Arcana
    { name: "The Fool", koreanName: "광대", arcana: "major", number: 0, image: "/tarot-cards/major_00.jpg" },
    { name: "The Magician", koreanName: "마법사", arcana: "major", number: 1, image: "/tarot-cards/major_01.jpg" },
    { name: "The High Priestess", koreanName: "고위 여사제", arcana: "major", number: 2, image: "/tarot-cards/major_02.jpg" },
    { name: "The Empress", koreanName: "여황제", arcana: "major", number: 3, image: "/tarot-cards/major_03.jpg" },
    { name: "The Emperor", koreanName: "황제", arcana: "major", number: 4, image: "/tarot-cards/major_04.jpg" },
    { name: "The Hierophant", koreanName: "교황", arcana: "major", number: 5, image: "/tarot-cards/major_05.jpg" },
    { name: "The Lovers", koreanName: "연인", arcana: "major", number: 6, image: "/tarot-cards/major_06.jpg" },
    { name: "The Chariot", koreanName: "전차", arcana: "major", number: 7, image: "/tarot-cards/major_07.png" },
    { name: "Strength", koreanName: "힘", arcana: "major", number: 8, image: "/tarot-cards/major_08.jpg" },
    { name: "The Hermit", koreanName: "은둔자", arcana: "major", number: 9, image: "/tarot-cards/major_09.jpg" },
    { name: "Wheel of Fortune", koreanName: "운명의 수레바퀴", arcana: "major", number: 10, image: "/tarot-cards/major_10.jpg" },
    { name: "Justice", koreanName: "정의", arcana: "major", number: 11, image: "/tarot-cards/major_11.jpg" },
    { name: "The Hanged Man", koreanName: "매달린 사람", arcana: "major", number: 12, image: "/tarot-cards/major_12.jpg" },
    { name: "Death", koreanName: "죽음", arcana: "major", number: 13, image: "/tarot-cards/major_13.jpg" },
    { name: "Temperance", koreanName: "절제", arcana: "major", number: 14, image: "/tarot-cards/major_14.jpg" },
    { name: "The Devil", koreanName: "악마", arcana: "major", number: 15, image: "/tarot-cards/major_15.jpg" },
    { name: "The Tower", koreanName: "탑", arcana: "major", number: 16, image: "/tarot-cards/major_16.jpg" },
    { name: "The Star", koreanName: "별", arcana: "major", number: 17, image: "/tarot-cards/major_17.jpg" },
    { name: "The Moon", koreanName: "달", arcana: "major", number: 18, image: "/tarot-cards/major_18.jpg" },
    { name: "The Sun", koreanName: "태양", arcana: "major", number: 19, image: "/tarot-cards/major_19.jpg" },
    { name: "Judgement", koreanName: "심판", arcana: "major", number: 20, image: "/tarot-cards/major_20.jpg" },
    { name: "The World", koreanName: "세계", arcana: "major", number: 21, image: "/tarot-cards/major_21.jpg" },

    // Cups
    { name: "Ace of Cups", koreanName: "컵 에이스", arcana: "minor", suit: "cups", number: 1, image: "/tarot-cards/cups_01.jpg" },
    { name: "Two of Cups", koreanName: "컵 2", arcana: "minor", suit: "cups", number: 2, image: "/tarot-cards/cups_02.jpg" },
    { name: "Three of Cups", koreanName: "컵 3", arcana: "minor", suit: "cups", number: 3, image: "/tarot-cards/cups_03.jpg" },
    { name: "Four of Cups", koreanName: "컵 4", arcana: "minor", suit: "cups", number: 4, image: "/tarot-cards/cups_04.jpg" },
    { name: "Five of Cups", koreanName: "컵 5", arcana: "minor", suit: "cups", number: 5, image: "/tarot-cards/cups_05.jpg" },
    { name: "Six of Cups", koreanName: "컵 6", arcana: "minor", suit: "cups", number: 6, image: "/tarot-cards/cups_06.jpg" },
    { name: "Seven of Cups", koreanName: "컵 7", arcana: "minor", suit: "cups", number: 7, image: "/tarot-cards/cups_07.jpg" },
    { name: "Eight of Cups", koreanName: "컵 8", arcana: "minor", suit: "cups", number: 8, image: "/tarot-cards/cups_08.jpg" },
    { name: "Nine of Cups", koreanName: "컵 9", arcana: "minor", suit: "cups", number: 9, image: "/tarot-cards/cups_09.jpg" },
    { name: "Ten of Cups", koreanName: "컵 10", arcana: "minor", suit: "cups", number: 10, image: "/tarot-cards/cups_10.jpg" },
    { name: "Page of Cups", koreanName: "컵 페이지", arcana: "minor", suit: "cups", number: 11, image: "/tarot-cards/cups_11.jpg" },
    { name: "Knight of Cups", koreanName: "컵 나이트", arcana: "minor", suit: "cups", number: 12, image: "/tarot-cards/cups_12.jpg" },
    { name: "Queen of Cups", koreanName: "컵 퀸", arcana: "minor", suit: "cups", number: 13, image: "/tarot-cards/cups_13.jpg" },
    { name: "King of Cups", koreanName: "컵 킹", arcana: "minor", suit: "cups", number: 14, image: "/tarot-cards/cups_14.jpg" },

    // Pentacles
    { name: "Ace of Pentacles", koreanName: "펜타클 에이스", arcana: "minor", suit: "pentacles", number: 1, image: "/tarot-cards/pentacles_01.jpg" },
    { name: "Two of Pentacles", koreanName: "펜타클 2", arcana: "minor", suit: "pentacles", number: 2, image: "/tarot-cards/pentacles_02.jpg" },
    { name: "Three of Pentacles", koreanName: "펜타클 3", arcana: "minor", suit: "pentacles", number: 3, image: "/tarot-cards/pentacles_03.jpg" },
    { name: "Four of Pentacles", koreanName: "펜타클 4", arcana: "minor", suit: "pentacles", number: 4, image: "/tarot-cards/pentacles_04.jpg" },
    { name: "Five of Pentacles", koreanName: "펜타클 5", arcana: "minor", suit: "pentacles", number: 5, image: "/tarot-cards/pentacles_05.jpg" },
    { name: "Six of Pentacles", koreanName: "펜타클 6", arcana: "minor", suit: "pentacles", number: 6, image: "/tarot-cards/pentacles_06.jpg" },
    { name: "Seven of Pentacles", koreanName: "펜타클 7", arcana: "minor", suit: "pentacles", number: 7, image: "/tarot-cards/pentacles_07.jpg" },
    { name: "Eight of Pentacles", koreanName: "펜타클 8", arcana: "minor", suit: "pentacles", number: 8, image: "/tarot-cards/pentacles_08.jpg" },
    { name: "Nine of Pentacles", koreanName: "펜타클 9", arcana: "minor", suit: "pentacles", number: 9, image: "/tarot-cards/pentacles_09.jpg" },
    { name: "Ten of Pentacles", koreanName: "펜타클 10", arcana: "minor", suit: "pentacles", number: 10, image: "/tarot-cards/pentacles_10.jpg" },
    { name: "Page of Pentacles", koreanName: "펜타클 페이지", arcana: "minor", suit: "pentacles", number: 11, image: "/tarot-cards/pentacles_11.jpg" },
    { name: "Knight of Pentacles", koreanName: "펜타클 나이트", arcana: "minor", suit: "pentacles", number: 12, image: "/tarot-cards/pentacles_12.jpg" },
    { name: "Queen of Pentacles", koreanName: "펜타클 퀸", arcana: "minor", suit: "pentacles", number: 13, image: "/tarot-cards/pentacles_13.jpg" },
    { name: "King of Pentacles", koreanName: "펜타클 킹", arcana: "minor", suit: "pentacles", number: 14, image: "/tarot-cards/pentacles_14.jpg" },

    // Swords
    { name: "Ace of Swords", koreanName: "소드 에이스", arcana: "minor", suit: "swords", number: 1, image: "/tarot-cards/swords_01.jpg" },
    { name: "Two of Swords", koreanName: "소드 2", arcana: "minor", suit: "swords", number: 2, image: "/tarot-cards/swords_02.jpg" },
    { name: "Three of Swords", koreanName: "소드 3", arcana: "minor", suit: "swords", number: 3, image: "/tarot-cards/swords_03.jpg" },
    { name: "Four of Swords", koreanName: "소드 4", arcana: "minor", suit: "swords", number: 4, image: "/tarot-cards/swords_04.jpg" },
    { name: "Five of Swords", koreanName: "소드 5", arcana: "minor", suit: "swords", number: 5, image: "/tarot-cards/swords_05.jpg" },
    { name: "Six of Swords", koreanName: "소드 6", arcana: "minor", suit: "swords", number: 6, image: "/tarot-cards/swords_06.jpg" },
    { name: "Seven of Swords", koreanName: "소드 7", arcana: "minor", suit: "swords", number: 7, image: "/tarot-cards/swords_07.jpg" },
    { name: "Eight of Swords", koreanName: "소드 8", arcana: "minor", suit: "swords", number: 8, image: "/tarot-cards/swords_08.jpg" },
    { name: "Nine of Swords", koreanName: "소드 9", arcana: "minor", suit: "swords", number: 9, image: "/tarot-cards/swords_09.jpg" },
    { name: "Ten of Swords", koreanName: "소드 10", arcana: "minor", suit: "swords", number: 10, image: "/tarot-cards/swords_10.jpg" },
    { name: "Page of Swords", koreanName: "소드 페이지", arcana: "minor", suit: "swords", number: 11, image: "/tarot-cards/swords_11.jpg" },
    { name: "Knight of Swords", koreanName: "소드 나이트", arcana: "minor", suit: "swords", number: 12, image: "/tarot-cards/swords_12.jpg" },
    { name: "Queen of Swords", koreanName: "소드 퀸", arcana: "minor", suit: "swords", number: 13, image: "/tarot-cards/swords_13.jpg" },
    { name: "King of Swords", koreanName: "소드 킹", arcana: "minor", suit: "swords", number: 14, image: "/tarot-cards/swords_14.jpg" },

    // Wands
    { name: "Ace of Wands", koreanName: "완드 에이스", arcana: "minor", suit: "wands", number: 1, image: "/tarot-cards/wands_01.jpg" },
    { name: "Two of Wands", koreanName: "완드 2", arcana: "minor", suit: "wands", number: 2, image: "/tarot-cards/wands_02.jpg" },
    { name: "Three of Wands", koreanName: "완드 3", arcana: "minor", suit: "wands", number: 3, image: "/tarot-cards/wands_03.jpg" },
    { name: "Four of Wands", koreanName: "완드 4", arcana: "minor", suit: "wands", number: 4, image: "/tarot-cards/wands_04.jpg" },
    { name: "Five of Wands", koreanName: "완드 5", arcana: "minor", suit: "wands", number: 5, image: "/tarot-cards/wands_05.jpg" },
    { name: "Six of Wands", koreanName: "완드 6", arcana: "minor", suit: "wands", number: 6, image: "/tarot-cards/wands_06.jpg" },
    { name: "Seven of Wands", koreanName: "완드 7", arcana: "minor", suit: "wands", number: 7, image: "/tarot-cards/wands_07.jpg" },
    { name: "Eight of Wands", koreanName: "완드 8", arcana: "minor", suit: "wands", number: 8, image: "/tarot-cards/wands_08.jpg" },
    { name: "Nine of Wands", koreanName: "완드 9", arcana: "minor", suit: "wands", number: 9, image: "/tarot-cards/wands_09.jpg" },
    { name: "Ten of Wands", koreanName: "완드 10", arcana: "minor", suit: "wands", number: 10, image: "/tarot-cards/wands_10.jpg" },
    { name: "Page of Wands", koreanName: "완드 페이지", arcana: "minor", suit: "wands", number: 11, image: "/tarot-cards/wands_11.jpg" },
    { name: "Knight of Wands", koreanName: "완드 나이트", arcana: "minor", suit: "wands", number: 12, image: "/tarot-cards/wands_12.jpg" },
    { name: "Queen of Wands", koreanName: "완드 퀸", arcana: "minor", suit: "wands", number: 13, image: "/tarot-cards/wands_13.jpg" },
    { name: "King of Wands", koreanName: "완드 킹", arcana: "minor", suit: "wands", number: 14, image: "/tarot-cards/wands_14.jpg" },
];

export const getRandomCards = (count: number): { card: TarotCardData; isReversed: boolean }[] => {
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(card => ({
        card,
        isReversed: Math.random() > 0.7 // 30% chance of being reversed
    }));
};

// Weighted Random Selection
export const getWeightedCards = (
    count: number,
    suitWeights: { [key in 'major' | 'cups' | 'pentacles' | 'swords' | 'wands']?: number }
): { card: TarotCardData; isReversed: boolean }[] => {
    // 1. Create a weighted pool
    const weightedPool: TarotCardData[] = [];

    TAROT_CARDS.forEach(card => {
        let weight = 1; // Default weight

        if (card.arcana === 'major') {
            weight = suitWeights.major || 1;
        } else if (card.suit && suitWeights[card.suit]) {
            weight = suitWeights[card.suit]!;
        }

        // Add card to pool 'weight' times
        // Note: For larger datasets, this expanding method is inefficient, 
        // but for 78 cards it's perfectly fine and strictly random.
        for (let i = 0; i < weight; i++) {
            weightedPool.push(card);
        }
    });

    // 2. Shuffle and pick unique cards
    const selectedCards: { card: TarotCardData; isReversed: boolean }[] = [];
    const seenNames = new Set<string>();

    while (selectedCards.length < count) {
        if (weightedPool.length === 0) break; // Should not happen

        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        const card = weightedPool[randomIndex];

        if (!seenNames.has(card.name)) {
            seenNames.add(card.name);
            selectedCards.push({
                card,
                isReversed: Math.random() > 0.7 // 30% chance reverse
            });
        }
    }

    return selectedCards;
};

// React Native Tarot Data - Simple and Direct
import { ASSETS } from './assets';

export interface TarotCardData {
    id: string;
    name: string;
    koreanName: string;
    arcana: 'major' | 'minor';
    suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
    number: number;
    imageFile: string; // Added for compatibility with TarotCard.tsx
    image: any;        // Generated { uri: string }
}

// Raw data with image filenames
const RAW_CARDS = [
    // Major Arcana (22 cards)
    { name: "The Fool", koreanName: "광대", arcana: "major", number: 0, imageFile: 'major_00.jpg' },
    { name: "The Magician", koreanName: "마법사", arcana: "major", number: 1, imageFile: 'major_01.jpg' },
    { name: "The High Priestess", koreanName: "고위 여사제", arcana: "major", number: 2, imageFile: 'major_02.jpg' },
    { name: "The Empress", koreanName: "여황제", arcana: "major", number: 3, imageFile: 'major_03.jpg' },
    { name: "The Emperor", koreanName: "황제", arcana: "major", number: 4, imageFile: 'major_04.jpg' },
    { name: "The Hierophant", koreanName: "교황", arcana: "major", number: 5, imageFile: 'major_05.jpg' },
    { name: "The Lovers", koreanName: "연인", arcana: "major", number: 6, imageFile: 'major_06.jpg' },
    { name: "The Chariot", koreanName: "전차", arcana: "major", number: 7, imageFile: 'major_07.jpg' },
    { name: "Strength", koreanName: "힘", arcana: "major", number: 8, imageFile: 'major_08.jpg' },
    { name: "The Hermit", koreanName: "은둔자", arcana: "major", number: 9, imageFile: 'major_09.jpg' },
    { name: "Wheel of Fortune", koreanName: "운명의 수레바퀴", arcana: "major", number: 10, imageFile: 'major_10.jpg' },
    { name: "Justice", koreanName: "정의", arcana: "major", number: 11, imageFile: 'major_11.jpg' },
    { name: "The Hanged Man", koreanName: "매달린 사람", arcana: "major", number: 12, imageFile: 'major_12.jpg' },
    { name: "Death", koreanName: "죽음", arcana: "major", number: 13, imageFile: 'major_13.jpg' },
    { name: "Temperance", koreanName: "절제", arcana: "major", number: 14, imageFile: 'major_14.jpg' },
    { name: "The Devil", koreanName: "악마", arcana: "major", number: 15, imageFile: 'major_15.jpg' },
    { name: "The Tower", koreanName: "탑", arcana: "major", number: 16, imageFile: 'major_16.jpg' },
    { name: "The Star", koreanName: "별", arcana: "major", number: 17, imageFile: 'major_17.jpg' },
    { name: "The Moon", koreanName: "달", arcana: "major", number: 18, imageFile: 'major_18.jpg' },
    { name: "The Sun", koreanName: "태양", arcana: "major", number: 19, imageFile: 'major_19.jpg' },
    { name: "Judgement", koreanName: "심판", arcana: "major", number: 20, imageFile: 'major_20.jpg' },
    { name: "The World", koreanName: "세계", arcana: "major", number: 21, imageFile: 'major_21.jpg' },

    // Cups (14 cards)
    { name: "Ace of Cups", koreanName: "컵 에이스", arcana: "minor", suit: "cups", number: 1, imageFile: 'cups_01.jpg' },
    { name: "Two of Cups", koreanName: "컵 2", arcana: "minor", suit: "cups", number: 2, imageFile: 'cups_02.jpg' },
    { name: "Three of Cups", koreanName: "컵 3", arcana: "minor", suit: "cups", number: 3, imageFile: 'cups_03.jpg' },
    { name: "Four of Cups", koreanName: "컵 4", arcana: "minor", suit: "cups", number: 4, imageFile: 'cups_04.jpg' },
    { name: "Five of Cups", koreanName: "컵 5", arcana: "minor", suit: "cups", number: 5, imageFile: 'cups_05.jpg' },
    { name: "Six of Cups", koreanName: "컵 6", arcana: "minor", suit: "cups", number: 6, imageFile: 'cups_06.jpg' },
    { name: "Seven of Cups", koreanName: "컵 7", arcana: "minor", suit: "cups", number: 7, imageFile: 'cups_07.jpg' },
    { name: "Eight of Cups", koreanName: "컵 8", arcana: "minor", suit: "cups", number: 8, imageFile: 'cups_08.jpg' },
    { name: "Nine of Cups", koreanName: "컵 9", arcana: "minor", suit: "cups", number: 9, imageFile: 'cups_09.jpg' },
    { name: "Ten of Cups", koreanName: "컵 10", arcana: "minor", suit: "cups", number: 10, imageFile: 'cups_10.jpg' },
    { name: "Page of Cups", koreanName: "컵 페이지", arcana: "minor", suit: "cups", number: 11, imageFile: 'cups_11.jpg' },
    { name: "Knight of Cups", koreanName: "컵 나이트", arcana: "minor", suit: "cups", number: 12, imageFile: 'cups_12.jpg' },
    { name: "Queen of Cups", koreanName: "컵 퀸", arcana: "minor", suit: "cups", number: 13, imageFile: 'cups_13.jpg' },
    { name: "King of Cups", koreanName: "컵 킹", arcana: "minor", suit: "cups", number: 14, imageFile: 'cups_14.jpg' },

    // Pentacles (14 cards)
    { name: "Ace of Pentacles", koreanName: "펜타클 에이스", arcana: "minor", suit: "pentacles", number: 1, imageFile: 'pentacles_01.jpg' },
    { name: "Two of Pentacles", koreanName: "펜타클 2", arcana: "minor", suit: "pentacles", number: 2, imageFile: 'pentacles_02.jpg' },
    { name: "Three of Pentacles", koreanName: "펜타클 3", arcana: "minor", suit: "pentacles", number: 3, imageFile: 'pentacles_03.jpg' },
    { name: "Four of Pentacles", koreanName: "펜타클 4", arcana: "minor", suit: "pentacles", number: 4, imageFile: 'pentacles_04.jpg' },
    { name: "Five of Pentacles", koreanName: "펜타클 5", arcana: "minor", suit: "pentacles", number: 5, imageFile: 'pentacles_05.jpg' },
    { name: "Six of Pentacles", koreanName: "펜타클 6", arcana: "minor", suit: "pentacles", number: 6, imageFile: 'pentacles_06.jpg' },
    { name: "Seven of Pentacles", koreanName: "펜타클 7", arcana: "minor", suit: "pentacles", number: 7, imageFile: 'pentacles_07.jpg' },
    { name: "Eight of Pentacles", koreanName: "펜타클 8", arcana: "minor", suit: "pentacles", number: 8, imageFile: 'pentacles_08.jpg' },
    { name: "Nine of Pentacles", koreanName: "펜타클 9", arcana: "minor", suit: "pentacles", number: 9, imageFile: 'pentacles_09.jpg' },
    { name: "Ten of Pentacles", koreanName: "펜타클 10", arcana: "minor", suit: "pentacles", number: 10, imageFile: 'pentacles_10.jpg' },
    { name: "Page of Pentacles", koreanName: "펜타클 페이지", arcana: "minor", suit: "pentacles", number: 11, imageFile: 'pentacles_11.jpg' },
    { name: "Knight of Pentacles", koreanName: "펜타클 나이트", arcana: "minor", suit: "pentacles", number: 12, imageFile: 'pentacles_12.jpg' },
    { name: "Queen of Pentacles", koreanName: "펜타클 퀸", arcana: "minor", suit: "pentacles", number: 13, imageFile: 'pentacles_13.jpg' },
    { name: "King of Pentacles", koreanName: "펜타클 킹", arcana: "minor", suit: "pentacles", number: 14, imageFile: 'pentacles_14.jpg' },

    // Swords (14 cards)
    { name: "Ace of Swords", koreanName: "검 에이스", arcana: "minor", suit: "swords", number: 1, imageFile: 'swords_01.jpg' },
    { name: "Two of Swords", koreanName: "검 2", arcana: "minor", suit: "swords", number: 2, imageFile: 'swords_02.jpg' },
    { name: "Three of Swords", koreanName: "검 3", arcana: "minor", suit: "swords", number: 3, imageFile: 'swords_03.jpg' },
    { name: "Four of Swords", koreanName: "검 4", arcana: "minor", suit: "swords", number: 4, imageFile: 'swords_04.jpg' },
    { name: "Five of Swords", koreanName: "검 5", arcana: "minor", suit: "swords", number: 5, imageFile: 'swords_05.jpg' },
    { name: "Six of Swords", koreanName: "검 6", arcana: "minor", suit: "swords", number: 6, imageFile: 'swords_06.jpg' },
    { name: "Seven of Swords", koreanName: "검 7", arcana: "minor", suit: "swords", number: 7, imageFile: 'swords_07.jpg' },
    { name: "Eight of Swords", koreanName: "검 8", arcana: "minor", suit: "swords", number: 8, imageFile: 'swords_08.jpg' },
    { name: "Nine of Swords", koreanName: "검 9", arcana: "minor", suit: "swords", number: 9, imageFile: 'swords_09.jpg' },
    { name: "Ten of Swords", koreanName: "검 10", arcana: "minor", suit: "swords", number: 10, imageFile: 'swords_10.jpg' },
    { name: "Page of Swords", koreanName: "검 페이지", arcana: "minor", suit: "swords", number: 11, imageFile: 'swords_11.jpg' },
    { name: "Knight of Swords", koreanName: "검 나이트", arcana: "minor", suit: "swords", number: 12, imageFile: 'swords_12.jpg' },
    { name: "Queen of Swords", koreanName: "검 퀸", arcana: "minor", suit: "swords", number: 13, imageFile: 'swords_13.jpg' },
    { name: "King of Swords", koreanName: "검 킹", arcana: "minor", suit: "swords", number: 14, imageFile: 'swords_14.jpg' },

    // Wands (14 cards)
    { name: "Ace of Wands", koreanName: "지팡이 에이스", arcana: "minor", suit: "wands", number: 1, imageFile: 'wands_01.jpg' },
    { name: "Two of Wands", koreanName: "지팡이 2", arcana: "minor", suit: "wands", number: 2, imageFile: 'wands_02.jpg' },
    { name: "Three of Wands", koreanName: "지팡이 3", arcana: "minor", suit: "wands", number: 3, imageFile: 'wands_03.jpg' },
    { name: "Four of Wands", koreanName: "지팡이 4", arcana: "minor", suit: "wands", number: 4, imageFile: 'wands_04.jpg' },
    { name: "Five of Wands", koreanName: "지팡이 5", arcana: "minor", suit: "wands", number: 5, imageFile: 'wands_05.jpg' },
    { name: "Six of Wands", koreanName: "지팡이 6", arcana: "minor", suit: "wands", number: 6, imageFile: 'wands_06.jpg' },
    { name: "Seven of Wands", koreanName: "지팡이 7", arcana: "minor", suit: "wands", number: 7, imageFile: 'wands_07.jpg' },
    { name: "Eight of Wands", koreanName: "지팡이 8", arcana: "minor", suit: "wands", number: 8, imageFile: 'wands_08.jpg' },
    { name: "Nine of Wands", koreanName: "지팡이 9", arcana: "minor", suit: "wands", number: 9, imageFile: 'wands_09.jpg' },
    { name: "Ten of Wands", koreanName: "지팡이 10", arcana: "minor", suit: "wands", number: 10, imageFile: 'wands_10.jpg' },
    { name: "Page of Wands", koreanName: "지팡이 페이지", arcana: "minor", suit: "wands", number: 11, imageFile: 'wands_11.jpg' },
    { name: "Knight of Wands", koreanName: "지팡이 나이트", arcana: "minor", suit: "wands", number: 12, imageFile: 'wands_12.jpg' },
    { name: "Queen of Wands", koreanName: "지팡이 퀸", arcana: "minor", suit: "wands", number: 13, imageFile: 'wands_13.jpg' },
    { name: "King of Wands", koreanName: "지팡이 킹", arcana: "minor", suit: "wands", number: 14, imageFile: 'wands_14.jpg' },
];

export const TAROT_CARDS: TarotCardData[] = RAW_CARDS.map(card => {
    let id = '';
    if (card.arcana === 'major') {
        id = `major_${String(card.number).padStart(2, '0')}`;
    } else {
        id = `${card.suit}_${String(card.number).padStart(2, '0')}`;
    }

    return {
        ...card,
        id,
        image: ASSETS.getCardImage(card.imageFile)
    } as TarotCardData;
});

export function getRandomCards(count: number): { card: TarotCardData; isReversed: boolean }[] {
    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(card => ({
        card,
        isReversed: Math.random() < 0.3 // 30% chance of reversal
    }));
}

// Temporary compatibility fix: alias getWeightedCards to getRandomCards
// TODO: Implement actual weighted randomization if needed
export function getWeightedCards(count: number, weights?: any): { card: TarotCardData; isReversed: boolean }[] {
    return getRandomCards(count);
}

export function getCardInterpretation(card: TarotCardData, isReversed: boolean, question?: string): string {
    const status = isReversed ? '역방향' : '정방향';
    /* 
     * In a real app, this would query a database or use AI. 
     * For now, return a placeholder to prevent crashes.
     */
    return `${card.koreanName} (${status}) - 오늘의 운세 카드입니다.`;
}

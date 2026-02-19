// React Native Tarot Data - Simple and Direct
import { ASSETS } from './assets';

export interface TarotCardData {
    name: string;
    koreanName: string;
    arcana: 'major' | 'minor';
    suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
    number: number;
    image: any;
}

// All 78 tarot cards with images serve via HTTP for AppInToss compatibility
export const TAROT_CARDS: TarotCardData[] = [
    // Major Arcana (22 cards)
    { name: "The Fool", koreanName: "광대", arcana: "major", number: 0, image: ASSETS.getCardImage('major_00.jpg') },
    { name: "The Magician", koreanName: "마법사", arcana: "major", number: 1, image: ASSETS.getCardImage('major_01.jpg') },
    { name: "The High Priestess", koreanName: "고위 여사제", arcana: "major", number: 2, image: ASSETS.getCardImage('major_02.jpg') },
    { name: "The Empress", koreanName: "여황제", arcana: "major", number: 3, image: ASSETS.getCardImage('major_03.jpg') },
    { name: "The Emperor", koreanName: "황제", arcana: "major", number: 4, image: ASSETS.getCardImage('major_04.jpg') },
    { name: "The Hierophant", koreanName: "교황", arcana: "major", number: 5, image: ASSETS.getCardImage('major_05.jpg') },
    { name: "The Lovers", koreanName: "연인", arcana: "major", number: 6, image: ASSETS.getCardImage('major_06.jpg') },
    { name: "The Chariot", koreanName: "전차", arcana: "major", number: 7, image: ASSETS.getCardImage('major_07.jpg') },
    { name: "Strength", koreanName: "힘", arcana: "major", number: 8, image: ASSETS.getCardImage('major_08.jpg') },
    { name: "The Hermit", koreanName: "은둔자", arcana: "major", number: 9, image: ASSETS.getCardImage('major_09.jpg') },
    { name: "Wheel of Fortune", koreanName: "운명의 수레바퀴", arcana: "major", number: 10, image: ASSETS.getCardImage('major_10.jpg') },
    { name: "Justice", koreanName: "정의", arcana: "major", number: 11, image: ASSETS.getCardImage('major_11.jpg') },
    { name: "The Hanged Man", koreanName: "매달린 사람", arcana: "major", number: 12, image: ASSETS.getCardImage('major_12.jpg') },
    { name: "Death", koreanName: "죽음", arcana: "major", number: 13, image: ASSETS.getCardImage('major_13.jpg') },
    { name: "Temperance", koreanName: "절제", arcana: "major", number: 14, image: ASSETS.getCardImage('major_14.jpg') },
    { name: "The Devil", koreanName: "악마", arcana: "major", number: 15, image: ASSETS.getCardImage('major_15.jpg') },
    { name: "The Tower", koreanName: "탑", arcana: "major", number: 16, image: ASSETS.getCardImage('major_16.jpg') },
    { name: "The Star", koreanName: "별", arcana: "major", number: 17, image: ASSETS.getCardImage('major_17.jpg') },
    { name: "The Moon", koreanName: "달", arcana: "major", number: 18, image: ASSETS.getCardImage('major_18.jpg') },
    { name: "The Sun", koreanName: "태양", arcana: "major", number: 19, image: ASSETS.getCardImage('major_19.jpg') },
    { name: "Judgement", koreanName: "심판", arcana: "major", number: 20, image: ASSETS.getCardImage('major_20.jpg') },
    { name: "The World", koreanName: "세계", arcana: "major", number: 21, image: ASSETS.getCardImage('major_21.jpg') },

    // Cups (14 cards)
    { name: "Ace of Cups", koreanName: "컵 에이스", arcana: "minor", suit: "cups", number: 1, image: ASSETS.getCardImage('cups_01.jpg') },
    { name: "Two of Cups", koreanName: "컵 2", arcana: "minor", suit: "cups", number: 2, image: ASSETS.getCardImage('cups_02.jpg') },
    { name: "Three of Cups", koreanName: "컵 3", arcana: "minor", suit: "cups", number: 3, image: ASSETS.getCardImage('cups_03.jpg') },
    { name: "Four of Cups", koreanName: "컵 4", arcana: "minor", suit: "cups", number: 4, image: ASSETS.getCardImage('cups_04.jpg') },
    { name: "Five of Cups", koreanName: "컵 5", arcana: "minor", suit: "cups", number: 5, image: ASSETS.getCardImage('cups_05.jpg') },
    { name: "Six of Cups", koreanName: "컵 6", arcana: "minor", suit: "cups", number: 6, image: ASSETS.getCardImage('cups_06.jpg') },
    { name: "Seven of Cups", koreanName: "컵 7", arcana: "minor", suit: "cups", number: 7, image: ASSETS.getCardImage('cups_07.jpg') },
    { name: "Eight of Cups", koreanName: "컵 8", arcana: "minor", suit: "cups", number: 8, image: ASSETS.getCardImage('cups_08.jpg') },
    { name: "Nine of Cups", koreanName: "컵 9", arcana: "minor", suit: "cups", number: 9, image: ASSETS.getCardImage('cups_09.jpg') },
    { name: "Ten of Cups", koreanName: "컵 10", arcana: "minor", suit: "cups", number: 10, image: ASSETS.getCardImage('cups_10.jpg') },
    { name: "Page of Cups", koreanName: "컵 페이지", arcana: "minor", suit: "cups", number: 11, image: ASSETS.getCardImage('cups_11.jpg') },
    { name: "Knight of Cups", koreanName: "컵 나이트", arcana: "minor", suit: "cups", number: 12, image: ASSETS.getCardImage('cups_12.jpg') },
    { name: "Queen of Cups", koreanName: "컵 퀸", arcana: "minor", suit: "cups", number: 13, image: ASSETS.getCardImage('cups_13.jpg') },
    { name: "King of Cups", koreanName: "컵 킹", arcana: "minor", suit: "cups", number: 14, image: ASSETS.getCardImage('cups_14.jpg') },

    // Pentacles (14 cards)
    { name: "Ace of Pentacles", koreanName: "펜타클 에이스", arcana: "minor", suit: "pentacles", number: 1, image: ASSETS.getCardImage('pentacles_01.jpg') },
    { name: "Two of Pentacles", koreanName: "펜타클 2", arcana: "minor", suit: "pentacles", number: 2, image: ASSETS.getCardImage('pentacles_02.jpg') },
    { name: "Three of Pentacles", koreanName: "펜타클 3", arcana: "minor", suit: "pentacles", number: 3, image: ASSETS.getCardImage('pentacles_03.jpg') },
    { name: "Four of Pentacles", koreanName: "펜타클 4", arcana: "minor", suit: "pentacles", number: 4, image: ASSETS.getCardImage('pentacles_04.jpg') },
    { name: "Five of Pentacles", koreanName: "펜타클 5", arcana: "minor", suit: "pentacles", number: 5, image: ASSETS.getCardImage('pentacles_05.jpg') },
    { name: "Six of Pentacles", koreanName: "펜타클 6", arcana: "minor", suit: "pentacles", number: 6, image: ASSETS.getCardImage('pentacles_06.jpg') },
    { name: "Seven of Pentacles", koreanName: "펜타클 7", arcana: "minor", suit: "pentacles", number: 7, image: ASSETS.getCardImage('pentacles_07.jpg') },
    { name: "Eight of Pentacles", koreanName: "펜타클 8", arcana: "minor", suit: "pentacles", number: 8, image: ASSETS.getCardImage('pentacles_08.jpg') },
    { name: "Nine of Pentacles", koreanName: "펜타클 9", arcana: "minor", suit: "pentacles", number: 9, image: ASSETS.getCardImage('pentacles_09.jpg') },
    { name: "Ten of Pentacles", koreanName: "펜타클 10", arcana: "minor", suit: "pentacles", number: 10, image: ASSETS.getCardImage('pentacles_10.jpg') },
    { name: "Page of Pentacles", koreanName: "펜타클 페이지", arcana: "minor", suit: "pentacles", number: 11, image: ASSETS.getCardImage('pentacles_11.jpg') },
    { name: "Knight of Pentacles", koreanName: "펜타클 나이트", arcana: "minor", suit: "pentacles", number: 12, image: ASSETS.getCardImage('pentacles_12.jpg') },
    { name: "Queen of Pentacles", koreanName: "펜타클 퀸", arcana: "minor", suit: "pentacles", number: 13, image: ASSETS.getCardImage('pentacles_13.jpg') },
    { name: "King of Pentacles", koreanName: "펜타클 킹", arcana: "minor", suit: "pentacles", number: 14, image: ASSETS.getCardImage('pentacles_14.jpg') },

    // Swords (14 cards)
    { name: "Ace of Swords", koreanName: "검 에이스", arcana: "minor", suit: "swords", number: 1, image: ASSETS.getCardImage('swords_01.jpg') },
    { name: "Two of Swords", koreanName: "검 2", arcana: "minor", suit: "swords", number: 2, image: ASSETS.getCardImage('swords_02.jpg') },
    { name: "Three of Swords", koreanName: "검 3", arcana: "minor", suit: "swords", number: 3, image: ASSETS.getCardImage('swords_03.jpg') },
    { name: "Four of Swords", koreanName: "검 4", arcana: "minor", suit: "swords", number: 4, image: ASSETS.getCardImage('swords_04.jpg') },
    { name: "Five of Swords", koreanName: "검 5", arcana: "minor", suit: "swords", number: 5, image: ASSETS.getCardImage('swords_05.jpg') },
    { name: "Six of Swords", koreanName: "검 6", arcana: "minor", suit: "swords", number: 6, image: ASSETS.getCardImage('swords_06.jpg') },
    { name: "Seven of Swords", koreanName: "검 7", arcana: "minor", suit: "swords", number: 7, image: ASSETS.getCardImage('swords_07.jpg') },
    { name: "Eight of Swords", koreanName: "검 8", arcana: "minor", suit: "swords", number: 8, image: ASSETS.getCardImage('swords_08.jpg') },
    { name: "Nine of Swords", koreanName: "검 9", arcana: "minor", suit: "swords", number: 9, image: ASSETS.getCardImage('swords_09.jpg') },
    { name: "Ten of Swords", koreanName: "검 10", arcana: "minor", suit: "swords", number: 10, image: ASSETS.getCardImage('swords_10.jpg') },
    { name: "Page of Swords", koreanName: "검 페이지", arcana: "minor", suit: "swords", number: 11, image: ASSETS.getCardImage('swords_11.jpg') },
    { name: "Knight of Swords", koreanName: "검 나이트", arcana: "minor", suit: "swords", number: 12, image: ASSETS.getCardImage('swords_12.jpg') },
    { name: "Queen of Swords", koreanName: "검 퀸", arcana: "minor", suit: "swords", number: 13, image: ASSETS.getCardImage('swords_13.jpg') },
    { name: "King of Swords", koreanName: "검 킹", arcana: "minor", suit: "swords", number: 14, image: ASSETS.getCardImage('swords_14.jpg') },

    // Wands (14 cards)
    { name: "Ace of Wands", koreanName: "지팡이 에이스", arcana: "minor", suit: "wands", number: 1, image: ASSETS.getCardImage('wands_01.jpg') },
    { name: "Two of Wands", koreanName: "지팡이 2", arcana: "minor", suit: "wands", number: 2, image: ASSETS.getCardImage('wands_02.jpg') },
    { name: "Three of Wands", koreanName: "지팡이 3", arcana: "minor", suit: "wands", number: 3, image: ASSETS.getCardImage('wands_03.jpg') },
    { name: "Four of Wands", koreanName: "지팡이 4", arcana: "minor", suit: "wands", number: 4, image: ASSETS.getCardImage('wands_04.jpg') },
    { name: "Five of Wands", koreanName: "지팡이 5", arcana: "minor", suit: "wands", number: 5, image: ASSETS.getCardImage('wands_05.jpg') },
    { name: "Six of Wands", koreanName: "지팡이 6", arcana: "minor", suit: "wands", number: 6, image: ASSETS.getCardImage('wands_06.jpg') },
    { name: "Seven of Wands", koreanName: "지팡이 7", arcana: "minor", suit: "wands", number: 7, image: ASSETS.getCardImage('wands_07.jpg') },
    { name: "Eight of Wands", koreanName: "지팡이 8", arcana: "minor", suit: "wands", number: 8, image: ASSETS.getCardImage('wands_08.jpg') },
    { name: "Nine of Wands", koreanName: "지팡이 9", arcana: "minor", suit: "wands", number: 9, image: ASSETS.getCardImage('wands_09.jpg') },
    { name: "Ten of Wands", koreanName: "지팡이 10", arcana: "minor", suit: "wands", number: 10, image: ASSETS.getCardImage('wands_10.jpg') },
    { name: "Page of Wands", koreanName: "지팡이 페이지", arcana: "minor", suit: "wands", number: 11, image: ASSETS.getCardImage('wands_11.jpg') },
    { name: "Knight of Wands", koreanName: "지팡이 나이트", arcana: "minor", suit: "wands", number: 12, image: ASSETS.getCardImage('wands_12.jpg') },
    { name: "Queen of Wands", koreanName: "지팡이 퀸", arcana: "minor", suit: "wands", number: 13, image: ASSETS.getCardImage('wands_13.jpg') },
    { name: "King of Wands", koreanName: "지팡이 킹", arcana: "minor", suit: "wands", number: 14, image: ASSETS.getCardImage('wands_14.jpg') },
];

export function getRandomCards(count: number): { card: TarotCardData; isReversed: boolean }[] {
    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(card => ({
        card,
        isReversed: Math.random() < 0.3 // 30% chance of reversal
    }));
}

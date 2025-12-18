export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  nickname: string;
  interests: string[];
  created_at: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  daily_draws_remaining: number;
  total_draws: number;
}

export const INTEREST_CATEGORIES = [
  { id: 'love', label: '연애운', icon: '💕' },
  { id: 'compatibility', label: '궁합', icon: '💑' },
  { id: 'reunion', label: '재회확률', icon: '💔' },
  { id: 'newyear', label: '신년운세', icon: '🎊' },
  { id: 'zodiac', label: '별자리 운세', icon: '⭐' },
  { id: 'career', label: '직업운', icon: '💼' },
  { id: 'wealth', label: '재물운', icon: '💰' },
  { id: 'health', label: '건강운', icon: '🏥' },
  { id: 'study', label: '학업운', icon: '📚' },
  { id: 'family', label: '가족운', icon: '👨‍👩‍👧‍👦' },
] as const;

export type InterestCategory = typeof INTEREST_CATEGORIES[number]['id'];

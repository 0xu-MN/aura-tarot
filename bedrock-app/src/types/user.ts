export interface User {
    id: string;
    email: string;
    nickname: string;
    full_name?: string;
    avatar_url?: string;
    interests?: string[];
}

export const INTEREST_CATEGORIES = [
    { id: 'love', label: '연애/결혼', icon: '❤️' },
    { id: 'money', label: '금전/사업', icon: '💰' },
    { id: 'career', label: '직장/취업', icon: '💼' },
    { id: 'study', label: '학업/시험', icon: '📚' },
    { id: 'health', label: '건강', icon: '💪' },
    { id: 'relationship', label: '대인관계', icon: '🤝' },
];

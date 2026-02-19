import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe AsyncStorage wrapper
const safeAsyncStorage = {
    async getItem(key: string): Promise<string | null> {
        try {
            if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') return null;
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.warn(`AsyncStorage getItem failed for key ${key}:`, error);
            return null;
        }
    },
    async setItem(key: string, value: string): Promise<void> {
        try {
            if (!AsyncStorage || typeof AsyncStorage.setItem !== 'function') return;
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.warn(`AsyncStorage setItem failed for key ${key}:`, error);
        }
    },
    async removeItem(key: string): Promise<void> {
        try {
            if (!AsyncStorage || typeof AsyncStorage.removeItem !== 'function') return;
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.warn(`AsyncStorage removeItem failed for key ${key}:`, error);
        }
    },
    async multiGet(keys: string[]): Promise<[string, string | null][]> {
        try {
            if (!AsyncStorage || typeof (AsyncStorage as any).multiGet !== 'function') {
                const results: [string, string | null][] = [];
                for (const key of keys) {
                    results.push([key, await this.getItem(key)]);
                }
                return results;
            }
            return await (AsyncStorage as any).multiGet(keys);
        } catch (error) {
            console.error('AsyncStorage multiGet failed:', error);
            return keys.map(k => [k, null]);
        }
    },
    async multiSet(keyValuePairs: [string, string][]): Promise<void> {
        try {
            if (!AsyncStorage || typeof (AsyncStorage as any).multiSet !== 'function') {
                for (const [key, value] of keyValuePairs) {
                    await this.setItem(key, value);
                }
                return;
            }
            await (AsyncStorage as any).multiSet(keyValuePairs);
        } catch (error) {
            console.error('AsyncStorage multiSet failed:', error);
        }
    }
};

// Storage keys
const KEYS = {
    DAILY_DRAWS: 'daily_draws_count',
    READING_HISTORY: 'reading_history',
    USER_PREFERENCES: 'user_preferences',
};

// Daily draw counter
export const getDailyDrawCount = async (): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const stored = await safeAsyncStorage.getItem(KEYS.DAILY_DRAWS);

        if (!stored) return 0;

        const data = JSON.parse(stored);
        if (data.date !== today) return 0;

        return data.count || 0;
    } catch (error) {
        console.error('Error getting daily draw count:', error);
        return 0;
    }
};

export const incrementDailyDrawCount = async (): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentCount = await getDailyDrawCount();
        const newCount = currentCount + 1;

        await safeAsyncStorage.setItem(
            KEYS.DAILY_DRAWS,
            JSON.stringify({ date: today, count: newCount })
        );

        return newCount;
    } catch (error) {
        console.error('Error incrementing draw count:', error);
        return 0;
    }
};

export const getRemainingDraws = async (maxDraws: number = 3): Promise<number> => {
    const count = await getDailyDrawCount();
    return Math.max(0, maxDraws - count);
};

// Reading history
export interface ReadingRecord {
    id: string;
    date: string;
    question: string;
    cards: any[];
    interpretation: string;
}

export const saveReading = async (reading: Omit<ReadingRecord, 'id' | 'date'>): Promise<void> => {
    try {
        const history = await getReadingHistory();
        const newReading: ReadingRecord = {
            ...reading,
            id: Date.now().toString(),
            date: new Date().toISOString(),
        };

        history.unshift(newReading);

        // Keep only last 50 readings
        const trimmedHistory = history.slice(0, 50);

        await safeAsyncStorage.setItem(KEYS.READING_HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error('Error saving reading:', error);
    }
};

export const getReadingHistory = async (): Promise<ReadingRecord[]> => {
    try {
        const stored = await safeAsyncStorage.getItem(KEYS.READING_HISTORY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error getting reading history:', error);
        return [];
    }
};

export const clearReadingHistory = async (): Promise<void> => {
    try {
        await safeAsyncStorage.removeItem(KEYS.READING_HISTORY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};

// User preferences
export interface UserPreferences {
    notifications: boolean;
    theme: 'dark' | 'light';
    language: 'ko' | 'en';
}

export const getUserPreferences = async (): Promise<UserPreferences> => {
    try {
        const stored = await safeAsyncStorage.getItem(KEYS.USER_PREFERENCES);
        return stored ? JSON.parse(stored) : {
            notifications: true,
            theme: 'dark',
            language: 'ko',
        };
    } catch (error) {
        console.error('Error getting preferences:', error);
        return {
            notifications: true,
            theme: 'dark',
            language: 'ko',
        };
    }
};

export const setUserPreferences = async (prefs: Partial<UserPreferences>): Promise<void> => {
    try {
        const current = await getUserPreferences();
        const updated = { ...current, ...prefs };
        await safeAsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
        console.error('Error setting preferences:', error);
    }
};

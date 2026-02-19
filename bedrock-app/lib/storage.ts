
// Safe Storage Wrapper for AppInToss Compliance
// Switches between localStorage (Web) and In-Memory (Fallback)
// completely removing native AsyncStorage dependency to prevent crashes.

const memoryStorage = new Map<string, string>();

const safeStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key);
            }
            return memoryStorage.get(key) || null;
        } catch {
            return memoryStorage.get(key) || null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } catch {
            // Ignore error
        }
        memoryStorage.set(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } catch {
            // Ignore
        }
        memoryStorage.delete(key);
    },
    multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
        const results: [string, string | null][] = [];
        for (const key of keys) {
            const value = await safeStorage.getItem(key);
            results.push([key, value]);
        }
        return results;
    },
    multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
        for (const [key, value] of keyValuePairs) {
            await safeStorage.setItem(key, value);
        }
    }
};

// --- Original Logic Preserved Below ---

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
        const stored = await safeStorage.getItem(KEYS.DAILY_DRAWS);

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

        await safeStorage.setItem(
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

        await safeStorage.setItem(KEYS.READING_HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error('Error saving reading:', error);
    }
};

export const getReadingHistory = async (): Promise<ReadingRecord[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.READING_HISTORY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error getting reading history:', error);
        return [];
    }
};

export const clearReadingHistory = async (): Promise<void> => {
    try {
        await safeStorage.removeItem(KEYS.READING_HISTORY);
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
        const stored = await safeStorage.getItem(KEYS.USER_PREFERENCES);
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
        await safeStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
        console.error('Error setting preferences:', error);
    }
};

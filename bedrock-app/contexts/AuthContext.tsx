import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Safe storage wrapper - falls back to in-memory if AsyncStorage is unavailable
const inMemoryStore: Record<string, string> = {};
const safeStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
                return await AsyncStorage.getItem(key);
            }
        } catch (_) { /* ignore */ }
        return inMemoryStore[key] ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        inMemoryStore[key] = value;
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
                await AsyncStorage.setItem(key, value);
            }
        } catch (_) { /* ignore */ }
    },
    removeItem: async (key: string): Promise<void> => {
        delete inMemoryStore[key];
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
                await AsyncStorage.removeItem(key);
            }
        } catch (_) { /* ignore */ }
    },
};

interface User {
    id: string;
    email: string;
    nickname: string;
    name?: string;
    birthDate?: string;
    isGuest: boolean;
}

interface AuthContextType {
    user: User | null;
    isGuest: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

interface SignUpData {
    email: string;
    password: string;
    nickname: string;
    name?: string;
    birthDate?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await safeStorage.getItem(STORAGE_KEY);
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setIsGuest(parsedUser.isGuest);
            } else {
                // Create guest user
                const guestUser: User = {
                    id: 'guest_' + Date.now(),
                    email: '',
                    nickname: '방문자',
                    isGuest: true,
                };
                setUser(guestUser);
                setIsGuest(true);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    };

    const signIn = async (email: string, password: string) => {
        // In real app, this would call Supabase
        // For now, just create a mock user
        const mockUser: User = {
            id: 'user_' + Date.now(),
            email,
            nickname: email.split('@')[0],
            name: email.split('@')[0],
            isGuest: false,
        };

        await safeStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        setIsGuest(false);
    };

    const signUp = async (data: SignUpData) => {
        // In real app, this would call Supabase
        const newUser: User = {
            id: 'user_' + Date.now(),
            email: data.email,
            nickname: data.nickname,
            name: data.name ?? '',
            birthDate: data.birthDate,
            isGuest: false,
        };

        await safeStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setUser(newUser);
        setIsGuest(false);
    };

    const signOut = async () => {
        await safeStorage.removeItem(STORAGE_KEY);
        // Create new guest user
        const guestUser: User = {
            id: 'guest_' + Date.now(),
            email: '',
            nickname: '방문자',
            isGuest: true,
        };
        setUser(guestUser);
        setIsGuest(true);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...data };
        await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isGuest,
                signIn,
                signUp,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

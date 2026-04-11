// 전역 인증 Context
import React, { createContext, useContext, type PropsWithChildren } from 'react';
import { useAuth, type TossUser } from '../lib/useAuth';

interface AuthContextValue {
    user: TossUser | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    login: () => Promise<TossUser | null>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isLoading: true,
    isLoggedIn: false,
    login: async () => null,
    logout: async () => { },
});

export function AuthProvider({ children }: PropsWithChildren) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
}

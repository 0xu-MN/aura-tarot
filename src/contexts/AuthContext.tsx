import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserProfile } from '@/types/user';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signIn: (username: string, password: string) => Promise<{ error?: string }>;
    signUp: (data: {
        username: string;
        password: string;
        name: string;
        nickname: string;
        interests: string[];
    }) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            // Get today's draw count from daily_readings
            const today = new Date().toISOString().split('T')[0];
            const { count } = await supabase
                .from('daily_readings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', `${today}T00:00:00`)
                .lte('created_at', `${today}T23:59:59`);

            const drawsToday = count || 0;
            const dailyLimit = 3;

            const userData: User = {
                id: data.id,
                username: data.username,
                name: data.nickname, // Using nickname as name
                nickname: data.nickname,
                interests: data.interests || [],
                created_at: data.created_at,
                updated_at: data.updated_at,
            };

            const profile: UserProfile = {
                ...userData,
                daily_draws_remaining: Math.max(0, dailyLimit - drawsToday),
                total_draws: 0,
            };

            setUser(userData);
            setUserProfile(profile);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
            setUserProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (session?.user?.id) {
            await fetchUserProfile(session.user.id);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user?.id) {
                fetchUserProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user?.id) {
                fetchUserProfile(session.user.id);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (username: string, password: string) => {
        try {
            // First get the user_id from username in profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('user_id, username')
                .eq('username', username)
                .single();

            if (profileError || !profileData) {
                return { error: '사용자를 찾을 수 없습니다.' };
            }

            // Create email from username for Supabase auth
            const email = `${username}@aura-tarot.app`;

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
            }

            return {};
        } catch (error) {
            console.error('Sign in error:', error);
            return { error: '로그인 중 오류가 발생했습니다.' };
        }
    };

    const signUp = async (data: {
        username: string;
        password: string;
        name: string;
        nickname: string;
        interests: string[];
    }) => {
        try {
            // Create email from username (for Supabase auth)
            const email = `${data.username}@aura-tarot.app`;

            // Check if username already exists
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', data.username)
                .maybeSingle();

            if (existingUser) {
                return { error: '이미 사용 중인 아이디입니다.' };
            }

            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: data.password,
            });

            if (authError) {
                return { error: '회원가입 중 오류가 발생했습니다.' };
            }

            if (!authData.user) {
                return { error: '사용자 생성에 실패했습니다.' };
            }

            // Create user profile in profiles table
            const { error: profileError } = await supabase.from('profiles').insert({
                user_id: authData.user.id,
                username: data.username,
                nickname: data.nickname,
                interests: data.interests as any,
            });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                return { error: '프로필 생성에 실패했습니다.' };
            }

            return {};
        } catch (error) {
            console.error('Sign up error:', error);
            return { error: '회원가입 중 오류가 발생했습니다.' };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserProfile(null);
        setSession(null);
    };

    const value = {
        user,
        userProfile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

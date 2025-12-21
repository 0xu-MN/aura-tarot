import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserProfile } from '@/types/user';
import type { Session } from '@supabase/supabase-js';


const normalizeInterests = (raw: unknown): Interest[] => {
    if (Array.isArray(raw)) return raw as Interest[];
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw) as Interest[];
        } catch {
            return [];
        }
    }
    return [];
};



/* =========================
   Interest Type (DB ENUM)
========================= */

export const INTERESTS = [
    'love',
    'compatibility',
    'reunion',
    'yearly',
    'zodiac',
    'career',
    'health',
    'money',
] as const;

export type Interest = typeof INTERESTS[number];

/* =========================
   Context Types
========================= */

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
        interests: Interest[];
    }) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

interface AuthProviderProps {
    children: ReactNode;
}

/* =========================
   Provider
========================= */

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    /* =========================
       Fetch User Profile (SAFE)
    ========================= */

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;

            // 프로필 없는 경우 (에러 아님)
            if (!data) {
                setUser(null);
                setUserProfile(null);
                return;
            }

            // 오늘 사용 횟수
            const today = new Date().toISOString().split('T')[0];
            const { count } = await supabase
                .from('daily_readings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', `${today}T00:00:00`)
                .lte('created_at', `${today}T23:59:59`);

            const dailyLimit = 3;
            const drawsToday = count ?? 0;

            const userData: User = {
                id: data.id,
                username: data.username,
                name: data.nickname,
                nickname: data.nickname,
                interests: normalizeInterests(data.interests),
                created_at: data.created_at,
                updated_at: data.updated_at,
            };

            const profileData: UserProfile = {
                ...userData,
                daily_draws_remaining: Math.max(0, dailyLimit - drawsToday),
                total_draws: 0,
            };

            setUser(userData);
            setUserProfile(profileData);
        } catch (err) {
            console.error('fetchUserProfile error:', err);
            setUser(null);
            setUserProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (session?.user?.id) {
            await fetchUserProfile(session.user.id);
        }
    };

    /* =========================
       Auth Lifecycle
    ========================= */

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return;
            setSession(data.session);
            if (data.session?.user?.id) {
                fetchUserProfile(data.session.user.id);
            }
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            setSession(session);

            if (session?.user?.id) {
                fetchUserProfile(session.user.id);
            } else {
                setUser(null);
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    /* =========================
       Sign In
    ========================= */

    const signIn = async (username: string, password: string) => {
        try {
            const email = `${username}`;

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
            }

            return {};
        } catch (err) {
            console.error('signIn error:', err);
            return { error: '로그인 중 오류가 발생했습니다.' };
        }
    };

    /* =========================
       Sign Up
    ========================= */

    const signUp = async (data: {
        username: string;
        password: string;
        name: string;
        nickname: string;
        interests: Interest[];
    }) => {
        try {
            const email = `${data.username}`;

            // 아이디 중복 체크
            const { data: exists } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', data.username)
                .maybeSingle();

            if (exists) {
                return { error: '이미 사용 중인 아이디입니다.' };
            }

            const { data: authData, error } = await supabase.auth.signUp({
                email,
                password: data.password,
            });

            if (error || !authData.user) {
                return { error: '회원가입 중 오류가 발생했습니다.' };
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: authData.user.id,
                    username: data.username,
                    nickname: data.nickname,
                    interests: data.interests,
                });

            if (profileError) {
                return { error: '프로필 생성에 실패했습니다.' };
            }

            return {};
        } catch (err) {
            console.error('signUp error:', err);
            return { error: '회원가입 중 오류가 발생했습니다.' };
        }
    };

    /* =========================
       Sign Out
    ========================= */

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserProfile(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

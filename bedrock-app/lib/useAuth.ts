// 토스 로그인 훅
// appLogin() → 인가 코드 → Edge Function(mTLS) → accessToken → 유저 정보
import { useState, useEffect, useCallback } from 'react';
import { appLogin, Storage } from '@apps-in-toss/framework';
import { supabase } from './supabase';

export interface TossUser {
    accessToken: string;
    refreshToken?: string;
    name?: string;
    userId?: string;
    scope?: string;
    raw?: any; // 전체 유저 정보 원본
}

const AUTH_STORAGE_KEY = 'toss_auth_user';

export function useAuth() {
    const [user, setUser] = useState<TossUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 캐시된 로그인 정보 복원 → 없으면 자동 로그인 시도
    useEffect(() => {
        (async () => {
            try {
                const cached = await Storage.getItem(AUTH_STORAGE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached) as TossUser;
                    setUser(parsed);
                    setIsLoggedIn(true);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.warn('Auth cache read failed:', e);
            }

            // 캐시 없음 → 게스트 모드로 시작 (자동 로그인 시도 안 함)
            try {
                // 토스 심사 반려 사유(즉시 로그인 유도) 해결을 위해
                // 자동 로그인을 제거하고 명시적 로그인 액션이 있을 때만 동작하도록 함
                console.log('No auth cache - Starting as guest mode');
            } catch (e) {
                console.warn('Init auth failed:', e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // 토스 로그인 실행
    const login = useCallback(async (): Promise<TossUser | null> => {
        try {
            setIsLoading(true);

            // 1단계: SDK로 토스 로그인 → 인가 코드 획득
            // SDK 미지원 환경(샌드박스 등)에서는 에러 발생 가능
            let authResult: { authorizationCode: string; referrer: 'DEFAULT' | 'SANDBOX' };

            if (typeof appLogin === 'function') {
                authResult = await appLogin();
            } else {
                console.warn('appLogin not available in this environment');
                setIsLoading(false);
                return null;
            }

            const { authorizationCode, referrer } = authResult;

            // 2단계: Edge Function에 인가 코드 전달 → accessToken + 유저 정보
            const { data, error } = await supabase.functions.invoke('toss-auth', {
                body: { authorizationCode, referrer },
            });

            if (error) throw error;

            if (!data?.success) {
                throw new Error(data?.error || '로그인 실패');
            }

            const tossUser: TossUser = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                name: data.user?.name || data.user?.userName || undefined,
                userId: data.user?.userId || data.user?.ci || undefined,
                scope: data.scope,
                raw: data.user,
            };

            // DB에 사용자 정보 누적 저장 (유저 식별자 기준)
            if (tossUser.userId) {
                try {
                    const { error: upsertErr } = await supabase.from('users').upsert({
                        id: tossUser.userId,
                        name: tossUser.name || '방문자',
                        last_login: new Date().toISOString(),
                        raw_data: tossUser.raw
                    }, { onConflict: 'id' });

                    if (upsertErr) {
                        console.warn('User DB upsert failed:', upsertErr);
                    }
                } catch (dbErr) {
                    console.warn('User DB upsert catch error:', dbErr);
                }
            }

            // 캐싱
            await Storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tossUser));

            setUser(tossUser);
            setIsLoggedIn(true);
            setIsLoading(false);

            return tossUser;
        } catch (e) {
            console.error('Toss login failed:', e);
            setIsLoading(false);
            return null;
        }
    }, []);

    // 로그아웃
    const logout = useCallback(async () => {
        try {
            await Storage.removeItem(AUTH_STORAGE_KEY);
        } catch (e) {
            console.warn('Auth cache clear failed:', e);
        }
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    return {
        user,
        isLoading,
        isLoggedIn,
        login,
        logout,
    };
}

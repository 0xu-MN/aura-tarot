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
    const [isBanned, setIsBanned] = useState(false);

    // ── 토스 로그인 실행 (동기화 포함) ──
    const login = useCallback(async (isAuto = false): Promise<TossUser | null> => {
        try {
            // 수동 로그인일 때만 UI 로딩 표시
            if (!isAuto) setIsLoading(true);

            // 1단계: SDK로 토스 로그인 → 인가 코드 획득
            let authResult: { authorizationCode: string; referrer: 'DEFAULT' | 'SANDBOX' };

            if (typeof appLogin === 'function') {
                authResult = await appLogin();
            } else {
                console.warn('appLogin not available in this environment');
                if (!isAuto) setIsLoading(false);
                return null;
            }

            const { authorizationCode, referrer } = authResult;

            // 2단계: Edge Function에 인가 코드 전달
            const { data, error } = await supabase.functions.invoke('toss-auth', {
                body: { authorizationCode, referrer },
            });

            if (error) throw error;
            if (!data?.success) throw new Error(data?.error || '로그인 실패');

            const tossUser: TossUser = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                name: data.user?.name || data.user?.userName || undefined,
                userId: data.user?.userId || data.user?.ci || undefined,
                scope: data.scope,
                raw: data.user,
            };

            // DB에 사용자 정보 누적 저장 및 차단 여부 확인
            if (tossUser.userId) {
                try {
                    // 차단 여부 확인 (에러 발생 시 무시하고 다음 진행 - DB 설정 미비 대비)
                    const { data: profile } = await supabase
                        .from('users')
                        .select('is_banned')
                        .eq('id', tossUser.userId)
                        .maybeSingle();

                    if (profile?.is_banned) {
                        setIsBanned(true);
                        if (!isAuto) setIsLoading(false);
                        throw new Error('이 계정은 이용이 영구 제한되었습니다.');
                    }

                    // 정보 업데이트
                    await supabase.from('users').upsert({
                        id: tossUser.userId,
                        name: tossUser.name || '방문자',
                        last_login: new Date().toISOString(),
                        raw_data: tossUser.raw
                    }, { onConflict: 'id' });

                } catch (dbErr: any) {
                    console.warn('User DB Sync error (Safe ignore):', dbErr.message);
                    if (dbErr.message === '이 계정은 이용이 영구 제한되었습니다.') {
                        throw dbErr;
                    }
                }
            }

            // 캐싱 및 상태 반영
            await Storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tossUser));
            setUser(tossUser);
            setIsLoggedIn(true);
            if (!isAuto) setIsLoading(false);

            return tossUser;
        } catch (e) {
            console.error('Toss login failed:', e);
            if (!isAuto) setIsLoading(false);
            return null;
        }
    }, []);

    // 캐시된 로그인 정보 복원 → 앱 시작 시 실행
    useEffect(() => {
        (async () => {
            try {
                const cached = await Storage.getItem(AUTH_STORAGE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached) as TossUser;
                    setUser(parsed);
                    setIsLoggedIn(true);
                    
                    // 캐시가 있더라도 백그라운드에서 정보 최신화(차단 체크 등) 시도
                    login(true); 
                } else {
                    // 캐시 없음 → 백그라운드에서 자동 로그인/동기화 시도 (화면 차단 안 함)
                    login(true);
                }
            } catch (e) {
                console.warn('Auth init failed:', e);
            } finally {
                // 어떤 경우든 초기 부팅 로딩은 해제하여 화면을 먼저 띄움
                setIsLoading(false);
            }
        })();
    }, [login]);

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
        isBanned,
        login,
        logout,
    };
}

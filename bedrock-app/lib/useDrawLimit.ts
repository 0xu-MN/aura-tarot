// 뽑기 제한 커스텀 훅 (전역 다이아 기반)
// ──────────────────────────────────────────
// 전역 다이아 풀 사용. userTokens >= tokenCost 이면 뽑기 가능.
// 다이아가 부족하면 어떤 컨텐츠든 결제 필요.
// ──────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserTokens, consumeMultipleTokens } from './storage';

export function useDrawLimit(
    _contentId: string,      // 하위 호환용으로 유지 (사용하지 않음)
    tokenCost: number = 1,   // 이 컨텐츠를 열 때 차감할 다이아 수
) {
    const [canDraw, setCanDraw] = useState(false);
    const [userTokens, setUserTokens] = useState(0);
    const [isChecking, setIsChecking] = useState(true);
    const hasRecordedRef = useRef(false); // 중복 recordDraw 방지

    const checkLimit = useCallback(async () => {
        setIsChecking(true);
        try {
            const tokens = await getUserTokens();
            setUserTokens(tokens);
            setCanDraw(tokens >= tokenCost);
        } catch {
            setCanDraw(false);
        } finally {
            setIsChecking(false);
        }
    }, [tokenCost]);

    useEffect(() => {
        checkLimit();
    }, [checkLimit]);

    /** 뽑기 기록 = 다이아 차감 (중복 호출 방지 포함) */
    const recordDraw = useCallback(async () => {
        // 이미 이번 세션에서 차감했으면 무시
        if (hasRecordedRef.current) {
            console.log('[useDrawLimit] recordDraw skipped (already recorded)');
            return 0;
        }
        try {
            const success = await consumeMultipleTokens(tokenCost);
            if (success) {
                hasRecordedRef.current = true;
                const tokens = await getUserTokens();
                setUserTokens(tokens);
                setCanDraw(tokens >= tokenCost);
                return tokenCost;
            }
            return 0;
        } catch {
            return 0;
        }
    }, [tokenCost]);

    /** 추가 뽑기 허용 = 다이아 소진 후 구입/광고 완료 콜백에서 호출.
     *  DrawAgainModal 이 이미 consumeMultipleTokens 를 호출하므로
     *  여기서는 상태만 다시 읽어 갱신하고, guard를 리셋합니다. */
    const grantExtraDraw = useCallback(async () => {
        hasRecordedRef.current = false; // 다음 뽑기 허용
        try {
            const tokens = await getUserTokens();
            setUserTokens(tokens);
            setCanDraw(tokens >= tokenCost);
        } catch {
            setCanDraw(false);
        }
    }, [tokenCost]);

    /** 리셋 시 guard도 초기화 */
    const resetDrawRecord = useCallback(() => {
        hasRecordedRef.current = false;
    }, []);

    return {
        canDraw,
        drawCount: 0,
        userTokens,
        isChecking,
        recordDraw,
        grantExtraDraw,
        checkLimit,
        resetDrawRecord,
        remainingDraws: canDraw ? 1 : 0,
    };
}

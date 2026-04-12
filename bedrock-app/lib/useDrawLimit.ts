// 뽑기 제한 커스텀 훅 (전역 다이아 기반)
// ──────────────────────────────────────────
// 전역 다이아 풀 사용. userTokens >= tokenCost 이면 뽑기 가능.
// 다이아가 부족하면 어떤 컨텐츠든 결제 필요.
// ──────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserTokens, consumeMultipleTokens, getFreeDrawUsage, incrementFreeDrawUsage } from './storage';

export function useDrawLimit(
    contentId: string,      
    tokenCost: number = 1,   // 다이아 소모 시 차감할 다이아 수
    freeLimit: number = 0,   // 일일 무료 이용 가능 횟수
) {
    const [canDraw, setCanDraw] = useState(false);
    const [userTokens, setUserTokens] = useState(0);
    const [freeUsage, setFreeUsage] = useState(0);
    const [isChecking, setIsChecking] = useState(true);
    const hasRecordedRef = useRef(false); 

    const checkLimit = useCallback(async () => {
        setIsChecking(true);
        try {
            const tokens = await getUserTokens();
            const usage = await getFreeDrawUsage(contentId);
            setUserTokens(tokens);
            setFreeUsage(usage);
            
            // 무료 횟수가 남았거나, 다이아가 충분하면 가능
            const hasFree = usage < freeLimit;
            setCanDraw(hasFree || tokens >= tokenCost);
        } catch {
            setCanDraw(false);
        } finally {
            setIsChecking(false);
        }
    }, [contentId, tokenCost, freeLimit]);

    useEffect(() => {
        checkLimit();
    }, [checkLimit]);

    /** 뽑기 기록 = 무료 횟수 차감 또는 다이아 차감 */
    const recordDraw = useCallback(async () => {
        if (hasRecordedRef.current) return 0;
        
        try {
            const usage = await getFreeDrawUsage(contentId);
            const hasFree = usage < freeLimit;

            if (hasFree) {
                // 무료 횟수 소진
                await incrementFreeDrawUsage(contentId);
                hasRecordedRef.current = true;
                await checkLimit();
                return -1; // -1은 무료 소진을 의미 (하위 호환이나 구분용)
            } else {
                // 다이아 소모
                const success = await consumeMultipleTokens(tokenCost);
                if (success) {
                    hasRecordedRef.current = true;
                    await checkLimit();
                    return tokenCost;
                }
            }
            return 0;
        } catch {
            return 0;
        }
    }, [contentId, tokenCost, freeLimit, checkLimit]);

    /** 추가 뽑기 허용 */
    const grantExtraDraw = useCallback(async () => {
        hasRecordedRef.current = false; 
        await checkLimit();
    }, [checkLimit]);

    const resetDrawRecord = useCallback(() => {
        hasRecordedRef.current = false;
    }, []);

    return {
        canDraw,
        drawCount: freeUsage,
        userTokens,
        freeUsage,
        isChecking,
        recordDraw,
        grantExtraDraw,
        checkLimit,
        resetDrawRecord,
        remainingFree: Math.max(0, freeLimit - freeUsage),
    };
}

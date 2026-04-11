import { Alert } from 'react-native';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';

// ─── 광고 ID ──────────────────────────────────────────────────
export const INTERSTITIAL_AD_ID = 'ait.v2.live.774ae17e35bf4740'; // 전면 광고
export const BANNER_AD_ID = 'ait.v2.live.b0a7628b7d8f4f06';       // 배너 광고
export const REWARD_AD_ID = 'ait.v2.live.958d0988987d436a';        // 리워드 광고 (사용자 확인 완료)
// ──────────────────────────────────────────────────────────────

export const shouldShowAd = () => Math.random() < 0.8;

/**
 * 전면 광고 표시
 */
export const showInterstitialAd = (): Promise<void> => {
    return new Promise((resolve) => {
        let loadCleanup: (() => void) | null = null;
        let showCleanup: (() => void) | null = null;
        let resolved = false;

        const cleanup = () => {
            try { loadCleanup?.(); } catch (e) {}
            try { showCleanup?.(); } catch (e) {}
        };

        const safeResolve = () => {
            if (!resolved) {
                resolved = true;
                cleanup();
                resolve();
            }
        };

        try {
            if (!loadFullScreenAd.isSupported || !loadFullScreenAd.isSupported()) {
                resolve(); return;
            }

            const loadTimeout = setTimeout(safeResolve, 15000);

            loadCleanup = loadFullScreenAd({
                options: { adGroupId: INTERSTITIAL_AD_ID },
                onEvent: (event) => {
                    if (event.type === 'loaded') {
                        clearTimeout(loadTimeout);
                        try {
                            const showTimeout = setTimeout(safeResolve, 10000);
                            showCleanup = showFullScreenAd({
                                options: { adGroupId: INTERSTITIAL_AD_ID },
                                onEvent: (e) => {
                                    if (e.type === 'dismissed' || e.type === 'failedToShow') safeResolve();
                                },
                                onError: safeResolve,
                            });
                        } catch (e) { safeResolve(); }
                    }
                },
                onError: safeResolve,
            });
        } catch (e) { resolve(); }
    });
};

/**
 * 보상형 광고 표시
 */
export const showRewardedAd = (): Promise<boolean> => {
    return new Promise((resolve) => {
        let rewardEarned = false;
        let resolved = false;
        let loadCleanup: (() => void) | null = null;
        let showCleanup: (() => void) | null = null;

        const cleanup = () => {
            try { loadCleanup?.(); } catch (e) {}
            try { showCleanup?.(); } catch (e) {}
        };

        const safeResolve = (val: boolean) => {
            if (!resolved) {
                resolved = true;
                cleanup();
                resolve(val);
            }
        };

        try {
            // 로드 대기 시간 20초로 대폭 연장
            const loadTimeout = setTimeout(() => {
                safeResolve(false);
            }, 20000);

            loadCleanup = loadFullScreenAd({
                options: { adGroupId: REWARD_AD_ID },
                onEvent: (event) => {
                    if (event.type === 'loaded') {
                        clearTimeout(loadTimeout);
                        try {
                            const showTimeout = setTimeout(() => safeResolve(false), 15000);

                            showCleanup = showFullScreenAd({
                                options: { adGroupId: REWARD_AD_ID },
                                onEvent: (showEvent) => {
                                    if (showEvent.type === 'show' || showEvent.type === 'impression') {
                                        clearTimeout(showTimeout);
                                    } else if (showEvent.type === 'userEarnedReward') {
                                        rewardEarned = true;
                                    } else if (showEvent.type === 'dismissed') {
                                        safeResolve(rewardEarned);
                                    } else if (showEvent.type === 'failedToShow') {
                                        safeResolve(false);
                                    }
                                },
                                onError: () => safeResolve(false),
                            });
                        } catch (e) { safeResolve(false); }
                    }
                },
                onError: () => safeResolve(false),
            });
        } catch (e) { safeResolve(false); }
    });
};
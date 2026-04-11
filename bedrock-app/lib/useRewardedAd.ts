import { useEffect, useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { REWARD_AD_ID } from './adUtils';

/**
 * 페이지 레벨에서 리워드 광고를 관리하는 훅
 * ✅ 공식 문서 패턴: 컴포넌트 마운트 시 미리 로드, 버튼 클릭 시 show만 호출
 */
export function useRewardedAd() {
    const [isAdReady, setIsAdReady] = useState(false);
    const unregisterRef = useRef<(() => void) | null>(null);

    // 광고 로드
    const loadAd = useCallback(() => {
        // 이전 리스너 정리
        if (unregisterRef.current) {
            try { unregisterRef.current(); } catch (e) {}
            unregisterRef.current = null;
        }

        setIsAdReady(false);

        if (!loadFullScreenAd.isSupported || !loadFullScreenAd.isSupported()) {
            return;
        }

        unregisterRef.current = loadFullScreenAd({
            options: { adGroupId: REWARD_AD_ID },
            onEvent: (event) => {
                if (event.type === 'loaded') {
                    setIsAdReady(true);
                }
            },
            onError: (error) => {
                console.warn('리워드 광고 로드 실패:', error);
                setIsAdReady(false);
            },
        });
    }, []);

    // 컴포넌트 마운트 시 광고 로드
    useEffect(() => {
        loadAd();
        return () => {
            if (unregisterRef.current) {
                try { unregisterRef.current(); } catch (e) {}
            }
        };
    }, [loadAd]);

    // 광고 표시 (페이지 레벨에서 호출 — overlay 없는 상태에서)
    const showAd = useCallback((onSuccess: () => void) => {
        if (!isAdReady) {
            // 광고 미준비 시 바로 로드 시도하고 알림
            loadAd();
            Alert.alert('알림', '광고가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        showFullScreenAd({
            options: { adGroupId: REWARD_AD_ID },
            onEvent: (event) => {
                if (event.type === 'userEarnedReward') {
                    onSuccess();
                } else if (event.type === 'dismissed') {
                    // 광고 닫힌 후 다음 광고 미리 로드
                    setIsAdReady(false);
                    loadAd();
                } else if (event.type === 'failedToShow') {
                    setIsAdReady(false);
                    loadAd();
                    Alert.alert('알림', '광고 표시에 실패했습니다. 다시 시도해주세요.');
                }
            },
            onError: (error) => {
                console.error('광고 표시 에러:', error);
                setIsAdReady(false);
                loadAd();
                Alert.alert('알림', '광고를 표시하는 중 오류가 발생했습니다.');
            },
        });
    }, [isAdReady, loadAd]);

    return { isAdReady, showAd, reloadAd: loadAd };
}

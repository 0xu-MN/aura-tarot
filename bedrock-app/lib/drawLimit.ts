// 뽑기 횟수 제한 유틸리티
// 하루 1회 무료, 추가 뽑기는 광고/결제 필요
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAW_KEY_PREFIX = 'tarot_draw_';

function getTodayKey(contentId: string): string {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    return `${DRAW_KEY_PREFIX}${contentId}_${dateStr}`;
}

/** 오늘 해당 컨텐츠의 뽑기 횟수를 가져옴 */
export async function getDrawCount(contentId: string): Promise<number> {
    try {
        const key = getTodayKey(contentId);
        const val = await AsyncStorage.getItem(key);
        return val ? parseInt(val, 10) : 0;
    } catch {
        return 0;
    }
}

/** 뽑기 횟수를 1 증가시킴 */
export async function incrementDrawCount(contentId: string): Promise<number> {
    try {
        const key = getTodayKey(contentId);
        const current = await getDrawCount(contentId);
        const next = current + 1;
        await AsyncStorage.setItem(key, String(next));
        return next;
    } catch {
        return 1;
    }
}

/** 오늘 무료 뽑기가 가능한지 (첫 번째 뽑기만 무료) */
export async function canDrawFree(contentId: string): Promise<boolean> {
    const count = await getDrawCount(contentId);
    return count < 1;
}

/** 예전 키들 정리 (옵션) */
export async function cleanOldDrawKeys(): Promise<void> {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const oldKeys = allKeys.filter(
            (k: string) => k.startsWith(DRAW_KEY_PREFIX) && !k.endsWith(todayStr)
        );
        if (oldKeys.length > 0) {
            await AsyncStorage.multiRemove(oldKeys);
        }
    } catch {
        // 삭제 실패해도 무시
    }
}

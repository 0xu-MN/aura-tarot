import { Storage } from '@apps-in-toss/framework';
import { supabase } from './supabase';

const safeStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            const val = await Storage.getItem(key);
            return val ?? null;
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await Storage.setItem(key, value);
        } catch (e) {
            console.error(`[Storage] setItem 실패 (key: "${key}"):`, e);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            await Storage.removeItem(key);
        } catch {
            // 삭제 실패 시 무시
        }
    },
};

// --- Original Logic Preserved Below ---

// Storage keys
const KEYS = {
    DAILY_DRAWS: 'daily_draws_count',
    READING_HISTORY: 'reading_history',
    USER_PREFERENCES: 'user_preferences',
    USER_TOKENS: 'user_total_tokens',
    LAST_TOKEN_GRANT_DATE: 'last_token_grant_date', // 마지막으로 일일 토큰 받은 날짜
    MY_PROFILE: 'my_lounge_profile',
    LOUNGE_POSTS: 'my_lounge_posts',
    CHAT_RECORDS: 'my_chat_records',
    UNLOCKED_POSTS: 'my_unlocked_posts',
    UNLOCKED_CHATS: 'my_unlocked_chats',
    LOUNGE_COMMENTS: 'my_lounge_comments',
    FREE_USAGE_COUNT: 'daily_free_usage_count', 
    CHAT_MESSAGES: 'my_chat_full_history', // 세션별 대화 원본 저장용
    DIAMOND_LOG: 'my_diamond_transaction_log', // 소모 내역 로그용
};

export const CHATBOT_FREE_LIMIT = 3; // 챗봇 일일 무료 메시지 수

export const DAILY_FREE_TOKENS = 2; // 매일 무료 지급 토큰 수

// Daily draw counter
export const getDailyDrawCount = async (): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const stored = await safeStorage.getItem(KEYS.DAILY_DRAWS);

        if (!stored) return 0;

        const data = JSON.parse(stored);
        if (data.date !== today) return 0;

        return data.count || 0;
    } catch (error) {
        console.error('Error getting daily draw count:', error);
        return 0;
    }
};

export const incrementDailyDrawCount = async (): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentCount = await getDailyDrawCount();
        const newCount = currentCount + 1;

        await safeStorage.setItem(
            KEYS.DAILY_DRAWS,
            JSON.stringify({ date: today, count: newCount })
        );

        return newCount;
    } catch (error) {
        console.error('Error incrementing draw count:', error);
        return 0;
    }
};

/** 콘텐츠별 일일 무료 이용 횟수 조회 */
export const getFreeDrawUsage = async (contentId: string): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const stored = await safeStorage.getItem(KEYS.FREE_USAGE_COUNT);

        if (!stored) return 0;

        const data = JSON.parse(stored);
        if (data.date !== today) return 0;

        return data[contentId] || 0;
    } catch (error) {
        console.error('Error getting free draw usage:', error);
        return 0;
    }
};

/** 콘텐츠별 일일 무료 이용 횟수 1 증가 */
export const incrementFreeDrawUsage = async (contentId: string): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const stored = await safeStorage.getItem(KEYS.FREE_USAGE_COUNT);
        
        let data: any = { date: today };
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.date === today) {
                data = parsed;
            }
        }
        
        const currentCount = data[contentId] || 0;
        const newCount = currentCount + 1;
        
        data[contentId] = newCount;
        data.date = today;

        await safeStorage.setItem(KEYS.FREE_USAGE_COUNT, JSON.stringify(data));
        return newCount;
    } catch (error) {
        console.error('Error incrementing free draw usage:', error);
        return 0;
    }
};

export const getRemainingDraws = async (maxDraws: number = 3): Promise<number> => {
    const count = await getDailyDrawCount();
    return Math.max(0, maxDraws - count);
};

// Reading history
export interface ReadingRecord {
    id: string;
    date: string;
    question: string;
    cards: any[];
    interpretation: string;
}

export const saveReadingToSupabase = async (
    userId: string,
    record: Omit<ReadingRecord, 'id' | 'date'>
): Promise<boolean> => {
    try {
        const firstCard = Array.isArray(record.cards) && record.cards[0];
        
        const { error } = await supabase.from('daily_readings').insert({
            user_id: userId,
            question: record.question,
            card_name: firstCard ? (firstCard.card?.koreanName || firstCard.name || 'Unknown') : 'Unknown',
            card_image: firstCard ? (firstCard.card?.image || firstCard.image || null) : null,
            is_reversed: firstCard ? !!firstCard.isReversed : false,
            interpretation: record.interpretation,
            advice: '', 
            created_at: new Date().toISOString()
        });

        if (error) {
            console.warn('Supabase save error (likely ignored for UX):', error);
            return false;
        }
        return true;
    } catch (e) {
        console.warn('Supabase sync catch error:', e);
        return false;
    }
};

export const saveReading = async (
    reading: Omit<ReadingRecord, 'id' | 'date'>,
    userId?: string
): Promise<void> => {
    try {
        const history = await getReadingHistory();
        const newReading: ReadingRecord = {
            ...reading,
            id: Date.now().toString(),
            date: new Date().toISOString(),
        };

        history.unshift(newReading);
        const trimmedHistory = history.slice(0, 50);
        await safeStorage.setItem(KEYS.READING_HISTORY, JSON.stringify(trimmedHistory));

        // 서버 동기화 시도 (userId가 있을 때)
        if (userId) {
            await saveReadingToSupabase(userId, reading);
        }
    } catch (error) {
        console.error('Error saving reading:', error);
    }
};

export const getReadingHistory = async (): Promise<ReadingRecord[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.READING_HISTORY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error getting reading history:', error);
        return [];
    }
};

export const clearReadingHistory = async (): Promise<void> => {
    try {
        await safeStorage.removeItem(KEYS.READING_HISTORY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};

// User preferences
export interface UserPreferences {
    notifications: boolean;
    theme: 'dark' | 'light';
    language: 'ko' | 'en';
}

export const getUserPreferences = async (): Promise<UserPreferences> => {
    try {
        const stored = await safeStorage.getItem(KEYS.USER_PREFERENCES);
        return stored ? JSON.parse(stored) : {
            notifications: true,
            theme: 'dark',
            language: 'ko',
        };
    } catch (error) {
        console.error('Error getting preferences:', error);
        return {
            notifications: true,
            theme: 'dark',
            language: 'ko',
        };
    }
};

export const setUserPreferences = async (prefs: Partial<UserPreferences>): Promise<void> => {
    try {
        const current = await getUserPreferences();
        const updated = { ...current, ...prefs };
        await safeStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
        console.error('Error setting preferences:', error);
    }
};

// Token Management
export const getUserTokens = async (): Promise<number> => {
    try {
        const stored = await safeStorage.getItem(KEYS.USER_TOKENS);
        return stored ? parseInt(stored, 10) : 0;
    } catch {
        return 0;
    }
};

export const addUserTokens = async (amount: number): Promise<number> => {
    try {
        const current = await getUserTokens();
        const next = current + amount;
        await safeStorage.setItem(KEYS.USER_TOKENS, String(next));
        return next;
    } catch {
        return await getUserTokens();
    }
};

export const saveUserTokens = async (amount: number): Promise<void> => {
    await safeStorage.setItem(KEYS.USER_TOKENS, String(amount));
};

export const getDiamondLogs = async (): Promise<any[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.DIAMOND_LOG);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const addDiamondLog = async (reason: string, amount: number) => {
    try {
        const logs = await getDiamondLogs();
        logs.unshift({
            id: `log_${Date.now()}`,
            date: new Date().toISOString(),
            reason,
            amount,
        });
        await safeStorage.setItem(KEYS.DIAMOND_LOG, JSON.stringify(logs.slice(0, 100))); // 최근 100개 보관
    } catch (e) {
        console.error('Failed to add diamond log:', e);
    }
};

export const consumeUserToken = async (reason: string = '상담 이용'): Promise<boolean> => {
    try {
        const current = await getUserTokens();
        if (current > 0) {
            await saveUserTokens(current - 1);
            await addDiamondLog(reason, 1);
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const consumeMultipleTokens = async (amount: number, reason: string = '심층 상담 이용'): Promise<boolean> => {
    try {
        const current = await getUserTokens();
        if (current >= amount) {
            await saveUserTokens(current - amount);
            await addDiamondLog(reason, amount);
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * 토큰 추가 후 즉시 차감하는 원자적 연산.
 * addUserTokens → consumeMultipleTokens 를 연속 호출할 때
 * 스토리지 캐시 지연으로 인한 잔액 불일치 방지.
 */
export const addAndConsumeTokens = async (
    addAmount: number,
    consumeAmount: number,
): Promise<{ success: boolean; remaining: number }> => {
    try {
        const current = await getUserTokens();
        const afterAdd = current + addAmount;
        if (afterAdd >= consumeAmount) {
            const remaining = afterAdd - consumeAmount;
            await safeStorage.setItem(KEYS.USER_TOKENS, String(remaining));
            return { success: true, remaining };
        }
        // 추가해도 부족 — 추가만 기록
        await safeStorage.setItem(KEYS.USER_TOKENS, String(afterAdd));
        return { success: false, remaining: afterAdd };
    } catch {
        const total = await getUserTokens();
        return { success: false, remaining: total };
    }
};

/**
 * 오늘 날짜 문자열 반환 (YYYY-MM-DD)
 */
const getTodayStr = (): string => new Date().toISOString().split('T')[0] ?? '';

/**
 * 하루 1회 무료 토큰 지급.
 * - 오늘 처음 접속 시에만 DAILY_FREE_TOKENS(2개) 지급
 * - 기존 보유 토큰에 누적 (만료 없음)
 * @returns { granted: boolean; newTotal: number }
 *   granted = true  → 오늘 처음 접속해서 토큰이 지급됨
 *   granted = false → 오늘 이미 지급받음 (중복 지급 없음)
 */
export const grantDailyTokensIfNeeded = async (): Promise<{ granted: boolean; newTotal: number }> => {
    try {
        const today = getTodayStr();
        const lastDate = await safeStorage.getItem(KEYS.LAST_TOKEN_GRANT_DATE);

        if (lastDate !== null && lastDate === today) {
            // 오늘 이미 지급받음
            const total = await getUserTokens();
            return { granted: false, newTotal: total };
        }

        // 오늘 처음 접속 → 토큰 누적 지급
        const current = await getUserTokens();
        const next = current + DAILY_FREE_TOKENS;
        await safeStorage.setItem(KEYS.USER_TOKENS, String(next));
        await safeStorage.setItem(KEYS.LAST_TOKEN_GRANT_DATE, today);

        return { granted: true, newTotal: next };
    } catch (error) {
        console.error('Error granting daily tokens:', error);
        return { granted: false, newTotal: 0 };
    }
};

// ── Profile, Lounge & Chat Storage ──

export interface MyProfile {
    nickname: string;
    gender: 'M' | 'F';
    intro: string;
    profileImage?: string;
    lat?: number;
    lng?: number;
}

export const getMyProfile = async (): Promise<MyProfile> => {
    try {
        const stored = await safeStorage.getItem(KEYS.MY_PROFILE);
        return stored ? JSON.parse(stored) : { nickname: '', gender: 'F', intro: '', profileImage: '' };
    } catch {
        return { nickname: '', gender: 'F', intro: '', profileImage: '' };
    }
};

export const setMyProfile = async (profile: MyProfile): Promise<void> => {
    try {
        await safeStorage.setItem(KEYS.MY_PROFILE, JSON.stringify(profile));
    } catch (e) {
        console.error(e);
    }
};

export interface LoungePostRecord {
    id: string;
    content: string;
    date: string;
    author: string;
    authorId: string;
    gender: 'M' | 'F';
    profileImage?: string;
    lat?: number;
    lng?: number;
}

export const getLoungePosts = async (): Promise<LoungePostRecord[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.LOUNGE_POSTS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const saveLoungePost = async (post: LoungePostRecord): Promise<void> => {
    try {
        const posts = await getLoungePosts();
        posts.unshift(post);
        await safeStorage.setItem(KEYS.LOUNGE_POSTS, JSON.stringify(posts));
    } catch (e) {
        console.error(e);
    }
};

export const deleteLoungePost = async (id: string): Promise<void> => {
    try {
        const posts = await getLoungePosts();
        const updated = posts.filter(p => p.id !== id);
        await safeStorage.setItem(KEYS.LOUNGE_POSTS, JSON.stringify(updated));
    } catch (e) {
        console.error(e);
    }
};

export interface ChatRecord {
    id: string;
    partnerName: string;
    topic: string;
    date: string;
    summary: string;
}

export const getChatRecords = async (): Promise<ChatRecord[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.CHAT_RECORDS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

/**
 * 세션별 상세 대화 내역을 저장합니다. (개별 키 사용으로 데이터 안정성 확보)
 */
export const saveChatMessageHistory = async (sessionId: string, messages: any[]): Promise<void> => {
    try {
        const key = `${KEYS.CHAT_MESSAGES}_${sessionId}`;
        await safeStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
        console.error('Failed to save message history:', e);
    }
};

/**
 * 세션별 상세 대화 내역을 불러옵니다. (하이브리드 모드: 신규 저장소 + 과거 기록 복구)
 */
export const getChatMessageHistory = async (sessionId: string): Promise<any[]> => {
    try {
        // 1. 우선순위: 신규 개별 저장소 확인
        const key = `${KEYS.CHAT_MESSAGES}_${sessionId}`;
        const stored = await safeStorage.getItem(key);
        if (stored) return JSON.parse(stored);

        // 2. 차선책: 과거 ChatRecord 리스트 내부에 저장된 데이터가 있는지 확인 (마이그레이션 지원)
        const records = await getChatRecords();
        const found = records.find(r => r.id === sessionId);
        if (found && (found as any).messages) {
            const oldMsgs = (found as any).messages;
            // 찾은 김에 신규 저장소로 마이그레이션 (선택적)
            await saveChatMessageHistory(sessionId, oldMsgs);
            return oldMsgs;
        }

        return [];
    } catch {
        return [];
    }
};

export const saveChatRecord = async (record: ChatRecord): Promise<void> => {
    try {
        const records = await getChatRecords();
        const existingIdx = records.findIndex((r: ChatRecord) => r.id === record.id);
        if (existingIdx !== -1) {
            records[existingIdx] = record;
        } else {
            records.unshift(record);
        }
        await safeStorage.setItem(KEYS.CHAT_RECORDS, JSON.stringify(records));
    } catch (e) {
        console.error(e);
    }
};

export const deleteChatRecord = async (id: string): Promise<void> => {
    try {
        const records = await getChatRecords();
        const updated = records.filter((r: ChatRecord) => r.id !== id);
        await safeStorage.setItem(KEYS.CHAT_RECORDS, JSON.stringify(updated));
    } catch (e) {
        console.error(e);
    }
};


// ── Unlocks Tracking ──

export const getUnlockedPosts = async (): Promise<string[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.UNLOCKED_POSTS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const unlockPost = async (postId: string): Promise<void> => {
    try {
        const posts = await getUnlockedPosts();
        if (!posts.includes(postId)) {
            posts.push(postId);
            await safeStorage.setItem(KEYS.UNLOCKED_POSTS, JSON.stringify(posts));
        }
    } catch (e) {
        console.error(e);
    }
};

export const getUnlockedChats = async (): Promise<string[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.UNLOCKED_CHATS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const unlockChat = async (authorId: string): Promise<void> => {
    try {
        const chats = await getUnlockedChats();
        if (!chats.includes(authorId)) {
            chats.push(authorId);
            await safeStorage.setItem(KEYS.UNLOCKED_CHATS, JSON.stringify(chats));
        }
    } catch (e) {
        console.error(e);
    }
};

// ── Lounge Comments ──

export interface LoungeComment {
    id: string;
    postId: string;
    content: string;
    author: string;
    authorId: string;
    date: string;
    gender: 'M' | 'F';
}

export const getLoungeComments = async (postId: string): Promise<LoungeComment[]> => {
    try {
        const stored = await safeStorage.getItem(KEYS.LOUNGE_COMMENTS);
        const allComments = stored ? JSON.parse(stored) : {};
        return allComments[postId] || [];
    } catch {
        return [];
    }
};

export const saveLoungeComment = async (postId: string, comment: LoungeComment): Promise<void> => {
    try {
        const stored = await safeStorage.getItem(KEYS.LOUNGE_COMMENTS);
        const allComments = stored ? JSON.parse(stored) : {};
        if (!allComments[postId]) allComments[postId] = [];
        allComments[postId].push(comment);
        await safeStorage.setItem(KEYS.LOUNGE_COMMENTS, JSON.stringify(allComments));
    } catch (e) {
        console.error(e);
    }
};

export const deleteLoungeComment = async (postId: string, commentId: string): Promise<void> => {
    try {
        const stored = await safeStorage.getItem(KEYS.LOUNGE_COMMENTS);
        const allComments = stored ? JSON.parse(stored) : {};
        if (allComments[postId]) {
            allComments[postId] = allComments[postId].filter((c: LoungeComment) => c.id !== commentId);
            await safeStorage.setItem(KEYS.LOUNGE_COMMENTS, JSON.stringify(allComments));
        }
    } catch (e) {
        console.error(e);
    }
};



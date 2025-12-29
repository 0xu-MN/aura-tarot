export const IS_BETA_ACTIVE = true;

export const BETA_LOCK_MESSAGE = "베타 종료 후 프리미엄에서 오픈 예정입니다 ✨";
export const BETA_BANNER_MESSAGE = "베타 기간 무료 오픈 중! (종료 후 프리미엄 전환 예정)";

// List of features that are allowed in Beta (Free)
// Note: This list is for reference or centralized checking if needed.
// Currently, we will implement locks directly in components for finer control.
export const ALLOWED_FEATURES = [
    'daily-fortune',
    'weekly-fortune',
    'monthly-fortune',
    'student-tarot',
    'work-tarot',
    'chatbot'
];

export const MAX_CHATBOT_DAILY_LIMIT = 5;

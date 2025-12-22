/**
 * Auth Storage Utilities
 * Manages remembered credentials and auto-login preferences
 */

const STORAGE_KEYS = {
    REMEMBERED_EMAIL: 'aura_tarot_remembered_email',
    AUTO_LOGIN: 'aura_tarot_auto_login',
} as const;

export interface AuthPreferences {
    rememberedEmail: string | null;
    autoLogin: boolean;
}

/**
 * Save remembered email to localStorage
 */
export const saveRememberedEmail = (email: string): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    } catch (error) {
        console.error('Failed to save remembered email:', error);
    }
};

/**
 * Get remembered email from localStorage
 */
export const getRememberedEmail = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    } catch (error) {
        console.error('Failed to get remembered email:', error);
        return null;
    }
};

/**
 * Clear remembered email from localStorage
 */
export const clearRememberedEmail = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    } catch (error) {
        console.error('Failed to clear remembered email:', error);
    }
};

/**
 * Save auto-login preference
 */
export const saveAutoLoginPreference = (enabled: boolean): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.AUTO_LOGIN, enabled.toString());
    } catch (error) {
        console.error('Failed to save auto-login preference:', error);
    }
};

/**
 * Get auto-login preference
 */
export const getAutoLoginPreference = (): boolean => {
    try {
        const value = localStorage.getItem(STORAGE_KEYS.AUTO_LOGIN);
        return value === 'true';
    } catch (error) {
        console.error('Failed to get auto-login preference:', error);
        return false;
    }
};

/**
 * Clear auto-login preference
 */
export const clearAutoLoginPreference = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.AUTO_LOGIN);
    } catch (error) {
        console.error('Failed to clear auto-login preference:', error);
    }
};

/**
 * Get all auth preferences
 */
export const getAuthPreferences = (): AuthPreferences => {
    return {
        rememberedEmail: getRememberedEmail(),
        autoLogin: getAutoLoginPreference(),
    };
};

/**
 * Clear all auth preferences
 */
export const clearAuthPreferences = (): void => {
    clearRememberedEmail();
    clearAutoLoginPreference();
};

/**
 * Premium Store Utility
 * Manages persistence for premium feature payments and reading states
 * using localStorage to prevent double-charging and allow session recovery.
 */

const STORAGE_KEY_PREFIX = 'aura_premium_';

export interface PremiumState {
    hasPaid: boolean;
    lastPaidAt?: string; // ISO string to check for expiry (e.g., 1 day)
    readingState?: any;  // Feature-specific state (step, inputs, cards)
}

export const premiumStore = {
    /**
     * Set a feature as paid
     */
    setPaid: (featureId: string) => {
        const state = premiumStore.getFeatureState(featureId);
        const newState: PremiumState = {
            ...state,
            hasPaid: true,
            lastPaidAt: new Date().toISOString()
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${featureId}`, JSON.stringify(newState));
    },

    /**
     * Check if a feature is currently paid (valid for 24h)
     */
    isPaid: (featureId: string): boolean => {
        const state = premiumStore.getFeatureState(featureId);
        if (!state.hasPaid || !state.lastPaidAt) return false;

        // Simple 24h expiry check
        const paidAt = new Date(state.lastPaidAt).getTime();
        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        return now - paidAt < twentyFourHours;
    },

    /**
     * Save current reading progress for a feature
     */
    saveReadingState: (featureId: string, readingState: any) => {
        const state = premiumStore.getFeatureState(featureId);
        const newState: PremiumState = {
            ...state,
            readingState
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${featureId}`, JSON.stringify(newState));
    },

    /**
     * Get the full state for a feature
     */
    getFeatureState: (featureId: string): PremiumState => {
        const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${featureId}`);
        if (!raw) return { hasPaid: false };
        try {
            return JSON.parse(raw);
        } catch (e) {
            return { hasPaid: false };
        }
    },

    /**
     * Clear reading state (but keep paid status)
     */
    clearReadingState: (featureId: string) => {
        const state = premiumStore.getFeatureState(featureId);
        const newState: PremiumState = {
            ...state,
            readingState: undefined
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${featureId}`, JSON.stringify(newState));
    },

    /**
     * Completely reset Feature
     */
    resetFeature: (featureId: string) => {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${featureId}`);
    }
};

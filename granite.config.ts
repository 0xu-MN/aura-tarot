
// @ts-check

/**
 * Granite Configuration for Aura Tarot (App in Toss)
 * 
 * Note: specific types from @apps-in-toss/framework would be used here 
 * if the package were available in this environment.
 */
export default {
    appName: 'aura-tarot',

    // 'brand' configuration determines how the app appears in the Toss app bridge.
    brand: {
        displayName: 'Aura Tarot',
        // TODO: Replace with actual icon URL after hosting assets
        icon: 'https://placehold.co/200x200?text=Aura+Tarot',
        primaryColor: '#1a1b1e', // Dark theme primary color
    },

    // 'game' type allows for custom UI and full-screen control, 
    // bypassing the mandatory Toss Design System (TDS) for services.
    webViewProps: {
        type: 'app',
        // Additional viewport/security settings can go here
    },

    // Development and Build configurations
    web: {
        host: '0.0.0.0',
        port: 5173,
        commands: {
            dev: 'npm run dev',
            build: 'npm run build',
        },
    },
};

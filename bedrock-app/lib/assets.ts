
// Local development server URL
// Must use exact IP address for Android/Physical devices
const DEV_SERVER_URL = 'http://172.30.1.72:8082';

export const ASSETS = {
    // Helper to get remote URL for tarot cards
    getCardImage: (filename: string) => {
        return { uri: `${DEV_SERVER_URL}/assets/tarot-cards/${filename}` };
    },

    // Remote assets (HTTP URI) for AppInToss compatibility
    heroBgOriginal: { uri: `${DEV_SERVER_URL}/assets/hero-bg-original.png` },
    heroBg: { uri: `${DEV_SERVER_URL}/assets/hero-bg.png` },
    tarotBack: { uri: `${DEV_SERVER_URL}/assets/tarot-back.png` },
    logo: { uri: `${DEV_SERVER_URL}/assets/logo.png` },

    // Thumbnails
    yearlyFortune: { uri: `${DEV_SERVER_URL}/assets/thumbnails/yearly-fortune.png` },
    weeklyThumb: { uri: `${DEV_SERVER_URL}/assets/weekly-thumb.jpg` },
    monthlyThumb: { uri: `${DEV_SERVER_URL}/assets/monthly-thumb.jpg` },
    loveTarot: { uri: `${DEV_SERVER_URL}/assets/thumbnails/love-tarot.png` },
    reunionTarot: { uri: `${DEV_SERVER_URL}/assets/thumbnails/reunion-tarot.png` },
    compatibilityTarot: { uri: `${DEV_SERVER_URL}/assets/thumbnails/compatibility-tarot.png` },

    // Zodiac Icons (Generated)
    zodiac: {
        aries: { uri: `${DEV_SERVER_URL}/assets/zodiac/aries.png` },
        taurus: { uri: `${DEV_SERVER_URL}/assets/zodiac/taurus.png` },
        gemini: { uri: `${DEV_SERVER_URL}/assets/zodiac/gemini.png` },
        cancer: { uri: `${DEV_SERVER_URL}/assets/zodiac/cancer.png` },
        leo: { uri: `${DEV_SERVER_URL}/assets/zodiac/leo.png` },
        // Placeholders for remaining icons (will be generated)
        virgo: { uri: `${DEV_SERVER_URL}/assets/zodiac/virgo.png` },
        libra: { uri: `${DEV_SERVER_URL}/assets/zodiac/libra.png` },
        scorpio: { uri: `${DEV_SERVER_URL}/assets/zodiac/scorpio.png` },
        sagittarius: { uri: `${DEV_SERVER_URL}/assets/zodiac/sagittarius.png` },
        capricorn: { uri: `${DEV_SERVER_URL}/assets/zodiac/capricorn.png` },
        aquarius: { uri: `${DEV_SERVER_URL}/assets/zodiac/aquarius.png` },
        pisces: { uri: `${DEV_SERVER_URL}/assets/zodiac/pisces.png` },
    },
};

export const cardUri = ASSETS.getCardImage;

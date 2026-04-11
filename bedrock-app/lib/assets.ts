
// Supabase Storage URL for AppInToss compatibility
const DEV_SERVER_URL = 'https://mhdshmkhiysgmlslfmlf.supabase.co/storage/v1/object/public/app-assets';

// Remote assets (HTTP URI) for AppInToss compatibility
export const ASSETS = {
    // Helper to get remote URL for tarot cards
    getCardImage: (filename: string) => {
        return { uri: `${DEV_SERVER_URL}/assets/tarot-cards/${filename}` };
    },

    // Backgrounds & Logo
    heroBgOriginal: { uri: `${DEV_SERVER_URL}/assets/hero-bg-original.png` },
    heroBg: { uri: `${DEV_SERVER_URL}/assets/hero-bg.png` },
    tarotBack: { uri: `${DEV_SERVER_URL}/assets/tarot-back.png` },
    logo: { uri: `${DEV_SERVER_URL}/assets/logo.png` },

    // Thumbnails
    yearlyFortune: { uri: `${DEV_SERVER_URL}/assets/yearly-fortune.png` },
    weeklyThumb: { uri: `${DEV_SERVER_URL}/assets/weekly-thumb.jpg` },
    monthlyThumb: { uri: `${DEV_SERVER_URL}/assets/monthly-thumb.jpg` },
    loveTarot: { uri: `${DEV_SERVER_URL}/assets/love-tarot.png` },
    reunionTarot: { uri: `${DEV_SERVER_URL}/assets/reunion-tarot.png` },
    compatibilityTarot: { uri: `${DEV_SERVER_URL}/assets/compatibility-tarot.png` },
    aiTarotThumb: { uri: `${DEV_SERVER_URL}/assets/tarot-save-bg.jpg` },
    dailyFortune: { uri: `${DEV_SERVER_URL}/assets/daily-fortune.png` },
    moneyLuck: { uri: `${DEV_SERVER_URL}/assets/money-luck.jpg` },
    horoscope: { uri: `${DEV_SERVER_URL}/assets/horoscope.png` },
    palmReading: { uri: `${DEV_SERVER_URL}/assets/palm-reading.jpg` },
    studentTarot: { uri: `${DEV_SERVER_URL}/assets/student-tarot.jpg` },
    workTarot: { uri: `${DEV_SERVER_URL}/assets/work-tarot.jpg` },

    // Zodiac Icons
    zodiac: {
        aries: { uri: `${DEV_SERVER_URL}/assets/zodiac/aries.png` },
        taurus: { uri: `${DEV_SERVER_URL}/assets/zodiac/taurus.png` },
        gemini: { uri: `${DEV_SERVER_URL}/assets/zodiac/gemini.png` },
        cancer: { uri: `${DEV_SERVER_URL}/assets/zodiac/cancer.png` },
        leo: { uri: `${DEV_SERVER_URL}/assets/zodiac/leo.png` },
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

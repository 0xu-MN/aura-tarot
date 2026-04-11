import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { PressableEffect } from '@toss/tds-react-native';
import { ASSETS } from '../lib/assets';

import { BannerAd } from './BannerAd';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2; // 좌우패딩16+16, gap 12

interface RecommendedContentProps {
    onNavigate: (route: string) => void;
}

const ALL_ITEMS = [
    {
        id: 'love',
        icon: '💕',
        title: '연애운 타로',
        description: '연애·썸·짝사랑 심층 분석',
        badge: '인기',
        route: '/tarot/love',
        image: ASSETS.loveTarot,
        accentColor: '#f472b6',
    },
    {
        id: 'daily',
        icon: '✨',
        title: '오늘의 운세',
        description: '하루를 여는 특별한 메시지',
        badge: '인기',
        route: '/home',
        image: ASSETS.dailyFortune,
        accentColor: '#a78bfa',
    },
    {
        id: 'money',
        icon: '💰',
        title: '금전·재물운',
        description: '재물운을 뚫는 비책 분석',
        route: '/tarot/money',
        image: ASSETS.moneyLuck,
        accentColor: '#DAA520',
    },
    {
        id: 'compatibility',
        icon: '💞',
        title: '커플 궁합',
        description: '두 사람의 궁합 점수 확인',
        route: '/tarot/compatibility',
        image: ASSETS.compatibilityTarot,
        accentColor: '#ec4899',
    },
    {
        id: 'weekly',
        icon: '📅',
        title: '이번 주 운세',
        description: '이번 주 흐름을 미리 파악',
        badge: '주간',
        route: '/tarot/weekly',
        image: ASSETS.weeklyThumb,
        accentColor: '#DAA520',
    },
    {
        id: 'monthly',
        icon: '🌕',
        title: '이번 달 운세',
        description: '이달의 전체 흐름 분석',
        badge: '월간',
        route: '/tarot/monthly',
        image: ASSETS.monthlyThumb,
        accentColor: '#DAA520',
    },
    {
        id: 'reunion',
        icon: '🌙',
        title: '재회 확률',
        description: '그 사람의 속마음과 재회 가능성',
        route: '/tarot/reunion',
        image: ASSETS.reunionTarot,
        accentColor: '#818cf8',
    },
    {
        id: 'work',
        icon: '💼',
        title: '직장운 타로',
        description: '취업·승진·이직 기회 확인',
        route: '/tarot/work',
        image: ASSETS.workTarot,
        accentColor: '#DAA520',
    },
    {
        id: 'student',
        icon: '📚',
        title: '수험생 타로',
        description: '합격 에너지와 응원 메시지',
        route: '/tarot/student',
        image: ASSETS.studentTarot,
        accentColor: '#34d399',
    },
    {
        id: 'horoscope',
        icon: '♒',
        title: '별자리 운세',
        description: '12별자리 오늘·주간·월간 운세',
        route: '/tarot/horoscope',
        image: ASSETS.horoscope,
        accentColor: '#818cf8',
    },
    {
        id: 'new-year',
        icon: '🎇',
        title: '2026 신년운세',
        description: '1년의 흐름을 미리 확인',
        route: '/tarot/new-year',
        image: ASSETS.yearlyFortune,
        accentColor: '#DAA520',
    },
    {
        id: 'chatbot',
        icon: '💬',
        title: 'AI 타로 상담',
        description: '솜이와 1:1 고민 상담',
        route: '/chatbot',
        image: ASSETS.aiTarotThumb,
        accentColor: '#a78bfa',
    },
];
export const RecommendedContent: React.FC<RecommendedContentProps> = ({ onNavigate }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.icon}>🔮</Text>
                <Text style={styles.title}>전체 서비스</Text>
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {ALL_ITEMS.map((item) => (
                    <PressableEffect
                        key={item.id}
                        style={styles.card}
                        onPress={() => onNavigate(item.route)}
                    >
                        {/* Thumbnail */}
                        <View style={styles.thumbContainer}>
                            {item.image ? (
                                <>
                                    <Image
                                        source={item.image}
                                        style={StyleSheet.absoluteFill as any}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.thumbOverlay} />
                                </>
                            ) : (
                                <View style={[styles.thumbFallback, { backgroundColor: 'rgba(218,165,32,0.1)' }]}>
                                    <Text style={styles.fallbackIcon}>{item.icon}</Text>
                                </View>
                            )}
                            {item.badge && (
                                <View style={[styles.badge, { backgroundColor: item.accentColor }]}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
                                </View>
                            )}
                        </View>

                        {/* Content */}
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle]} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                        </View>
                    </PressableEffect>
                ))}
            </View>

            {/* Banner Ad */}
            <View style={{ marginTop: 24, alignItems: 'center' }}>
                <BannerAd />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    icon: {
        fontSize: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#DAA520',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#1a1b1e',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(218,165,32,0.2)',
        overflow: 'hidden',
    },
    thumbContainer: {
        width: '100%',
        height: 110,
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    thumbOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    thumbFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackIcon: {
        fontSize: 36,
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
    cardContent: {
        padding: 10,
        gap: 3,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#fff',
    },
    cardDesc: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
});

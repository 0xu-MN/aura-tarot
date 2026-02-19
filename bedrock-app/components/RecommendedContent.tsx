import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MenuCard } from './MenuCard';

interface RecommendedContentProps {
    onNavigate: (route: string) => void;
}

const RECOMMENDED_ITEMS = [
    {
        id: 'yearly',
        icon: '🎊',
        title: '2026 신년운세',
        description: '새해 12개월의 운세를 상세히 풀이',
        badge: 'HOT',
        route: '/tarot/new-year',
    },
    {
        id: 'love',
        icon: '💕',
        title: '연애운 타로',
        description: '연애, 썸, 짝사랑에 대한 깊은 통찰',
        route: '/tarot/love',
    },
    {
        id: 'reunion',
        icon: '🌙',
        title: '재회 확률',
        description: '그 사람의 속마음과 재회 가능성',
        badge: '인기',
        route: '/tarot/reunion',
    },
    {
        id: 'more',
        icon: '➡️',
        title: '더 알아보기',
        description: '다양한 타로 주제를 확인해보세요',
        route: '/contents',
    },
];

export const RecommendedContent: React.FC<RecommendedContentProps> = ({ onNavigate }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.icon}>📈</Text>
                <Text style={styles.title}>맞춤 추천 콘텐츠</Text>
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {RECOMMENDED_ITEMS.map((item) => (
                    <View key={item.id} style={styles.gridItem}>
                        <MenuCard
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            badge={item.badge}
                            onPress={() => onNavigate(item.route)}
                        />
                    </View>
                ))}
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
    gridItem: {
        width: '48%',
    },
});

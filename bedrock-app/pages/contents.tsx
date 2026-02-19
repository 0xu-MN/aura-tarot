import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { ASSETS } from '../lib/assets';

export const Route = createRoute('/contents', {
  component: ContentsPage,
});

interface ContentItem {
  title: string;
  description: string;
  categories: string[];
  displayCategory: string;
  icon: string;
  link?: string;
  image?: { uri: string };
  pinned?: boolean;
  badge?: string;
}

const contentItems: ContentItem[] = [
  {
    title: "2026 신년운세",
    description: "새해 12개월의 운세를 상세히 풀이해드립니다",
    categories: ["신년운세", "전체"],
    displayCategory: "신년",
    icon: "📅",
    link: "/tarot/new-year",
    image: ASSETS.yearlyFortune,
    pinned: true,
  },
  {
    title: "오늘의 운세",
    description: "하루를 시작하는 특별한 메시지를 받아보세요",
    categories: ["운세", "전체"],
    displayCategory: "운세",
    icon: "✨",
    link: "/home",
    image: ASSETS.yearlyFortune,
    pinned: true,
  },
  {
    title: "이번 주 나의 운세",
    description: "이번 주 흐름을 미리 확인해보세요",
    categories: ["주간", "전체"],
    displayCategory: "주간운세",
    icon: "📅",
    link: "/tarot/weekly",
    image: ASSETS.weeklyThumb,
    pinned: true,
  },
  {
    title: "이번 달 나의 운세",
    description: "이번 달의 전체 흐름을 확인하세요",
    categories: ["월간", "전체"],
    displayCategory: "월간운세",
    icon: "🌕",
    link: "/tarot/monthly",
    image: ASSETS.monthlyThumb,
    pinned: true,
  },
  {
    title: "2026년 신년 총운",
    description: "봄・여름・가을・겨울 사계절 4장 운세 리포트",
    categories: ["신년운세", "전체"],
    displayCategory: "신년 총운",
    icon: "🗓️",
    link: "/tarot/yearly",
    image: ASSETS.yearlyFortune,
  },
  {
    title: "연애운 타로",
    description: "연애, 썸, 짝사랑에 대한 깊은 통찰을 제공합니다",
    categories: ["연애운", "전체"],
    displayCategory: "연애운",
    icon: "💕",
    link: "/tarot/love",
    image: ASSETS.loveTarot,
  },
  {
    title: "재회 확률",
    description: "그 사람의 속마음과 재회 가능성을 알아보세요",
    categories: ["연애운", "재회확률", "전체"],
    displayCategory: "연애운",
    icon: "🌙",
    link: "/tarot/reunion",
    image: ASSETS.reunionTarot,
  },
  {
    title: "커플 궁합",
    description: "두 사람의 궁합을 타로로 점쳐보세요",
    categories: ["궁합", "연애운", "전체"],
    displayCategory: "궁합",
    icon: "👩‍❤️‍👨",
    link: "/tarot/compatibility",
    image: ASSETS.compatibilityTarot,
  },
  {
    title: "금전·재물운",
    description: "막힌 금전운을 뚫고 재물을 불러들이는 비책",
    categories: ["재물운", "전체"],
    displayCategory: "재물운",
    icon: "💰",
    link: "/tarot/money",
  },
  {
    title: "직장운 타로",
    description: "취업・승진・이직, 직장에서의 기회를 알아보세요",
    categories: ["직장운", "전체"],
    displayCategory: "직장운",
    icon: "💼",
    link: "/tarot/work",
  },
  {
    title: "수험생 타로",
    description: "합격 가능성과 최선을 다할 수 있는 에너지 확인",
    categories: ["수험", "전체"],
    displayCategory: "수험운",
    icon: "📚",
    link: "/tarot/student",
  },
  {
    title: "별자리 운세",
    description: "12개 별자리별 오늘・주간・월간・연간 운세",
    categories: ["별자리", "전체"],
    displayCategory: "별자리",
    icon: "♒",
    link: "/tarot/horoscope",
  },
  {
    title: "AI 손금 분석",
    description: "생명선・두뇌선・감정선을 AI로 정밀 분석",
    categories: ["손금", "전체"],
    displayCategory: "손금",
    icon: "🤚",
    link: "/tarot/palm",
  },
];

function ContentsPage() {
  const navigation = Route.useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');

  const categories = ['전체', '연애운', '궁합', '재회확률', '재물운', '직장운', '수험', '별자리', '손금', '신년운세', '주간', '월간'];

  const filteredItems = contentItems.filter(item => {
    const matchesCategory = activeCategory === '전체' || item.categories.includes(activeCategory);
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contents</Text>
        <Text style={styles.subtitle}>당신의 운명을 점쳐보세요</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="콘텐츠 검색..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setActiveCategory(category)}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.categoryButtonActive
            ]}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content Grid */}
      <View style={styles.grid}>
        {filteredItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              item.pinned && styles.cardPinned
            ]}
            onPress={() => {
              if (item.link) {
                navigation.push(item.link as any);
              }
            }}
            activeOpacity={0.9}
          >
            <View style={styles.cardImageContainer}>
              {item.image ? (
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={item.image}
                    style={StyleSheet.absoluteFill as any}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay} />
                </View>
              ) : (
                <View style={styles.cardIconContainer}>
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardCategory}>{item.displayCategory}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#DAA520',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 27, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.3)',
    backgroundColor: '#1a1b1e',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    borderColor: '#DAA520',
  },
  categoryText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#DAA520',
    fontWeight: '700',
  },
  grid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#1a1b1e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.2)',
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
  },
  cardPinned: {
    borderColor: 'rgba(218, 165, 32, 0.4)',
    elevation: 6,
  },
  cardImageContainer: {
    width: '100%',
    height: 180,
  },
  cardImageWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardIconContainer: {
    flex: 1,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 48,
  },
  cardContent: {
    padding: 16,
  },
  cardCategory: {
    fontSize: 11,
    color: '#DAA520',
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
});

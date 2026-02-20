import { createRoute } from '@granite-js/react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { PageNavbar, Txt, PressableEffect } from '@toss/tds-react-native';
import { RecommendedContent } from '../components/RecommendedContent';
import { DailyCardModal } from '../components/DailyCardModal';
import { CardDrawing } from '../components/CardDrawing';
import { getRandomCards } from '../lib/tarot-data';
import { ASSETS } from '../lib/assets';

export const Route = createRoute('/home', {
  component: HomePage,
});

function HomePage() {
  const navigation = Route.useNavigation();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [drawnCard, setDrawnCard] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 6) setWelcomeMessage('별들이 당신에게 전하는 오늘의 메시지입니다.');
    else if (hours < 12) setWelcomeMessage('기분 좋은 아침, 오늘 당신을 위한 특별한 에너지가 있어요.');
    else if (hours < 18) setWelcomeMessage('나른한 오후, 잠시 쉬어가며 마음의 소리를 들어보세요.');
    else setWelcomeMessage('하루의 끝, 오늘도 정말 수고 많았어요. 따뜻한 위로를 드릴게요.');
  }, []);

  const handleDrawCard = (question: string) => {
    const drawn = getRandomCards(1)[0];
    setDrawnCard(drawn);
    setCurrentQuestion(question);
    setShowCardModal(true);
  };

  const handleNavigate = (route: string) => {
    navigation.push(route as any);
  };

  return (
    <View style={styles.container}>
      <PageNavbar>
        <PageNavbar.Title>오늘의 한장 타로</PageNavbar.Title>
      </PageNavbar>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Txt style={styles.sparkle}>✨</Txt>
            <Txt style={styles.greeting}>안녕하세요, 방문자님</Txt>
          </View>
          <Txt style={styles.welcomeMessage}>{welcomeMessage}</Txt>
        </View>

        <View style={styles.content}>
          {/* Card Drawing Section */}
          <CardDrawing onDrawCard={handleDrawCard} />

          {/* New Year Banner */}
          <PressableEffect onPress={() => navigation.push('/tarot/new-year')}>
            <View style={styles.newYearBanner}>
              <Image
                source={ASSETS.yearlyFortune}
                style={StyleSheet.absoluteFill as any}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerContent}>
                <View style={styles.specialBadge}>
                  <Txt style={styles.badgeText}>2026 SPECIAL</Txt>
                </View>
                <Txt style={styles.bannerTitle}>2026년 신년운세</Txt>
                <Txt style={styles.bannerSubtitle}>
                  새로운 한 해, 당신의 운명을 미리 확인해보세요 ✨
                </Txt>
              </View>
            </View>
          </PressableEffect>

          {/* Weekly & Monthly Fortune Grid */}
          <View style={styles.fortuneGrid}>
            {/* 이번 주 운세 */}
            <PressableEffect
              style={{ flex: 1 }}
              onPress={() => navigation.push('/tarot/weekly')}
            >
              <View style={styles.fortuneCard}>
                <Image
                  source={ASSETS.weeklyThumb}
                  style={StyleSheet.absoluteFill as any}
                  resizeMode="cover"
                />
                <View style={styles.fortuneOverlay} />
                <View style={styles.fortuneContent}>
                  <View style={styles.fortuneBadge}>
                    <Txt style={styles.fortuneBadgeText}>WEEKLY</Txt>
                  </View>
                  <View>
                    <Txt style={styles.fortuneTitle}>이번 주{'\n'}운세</Txt>
                    <Txt style={styles.fortuneDesc}>이번 주 흐름</Txt>
                  </View>
                </View>
              </View>
            </PressableEffect>

            {/* 이번 달 운세 */}
            <PressableEffect
              style={{ flex: 1 }}
              onPress={() => navigation.push('/tarot/monthly')}
            >
              <View style={styles.fortuneCard}>
                <Image
                  source={ASSETS.monthlyThumb}
                  style={StyleSheet.absoluteFill as any}
                  resizeMode="cover"
                />
                <View style={styles.fortuneOverlay} />
                <View style={styles.fortuneContent}>
                  <View style={styles.fortuneBadge}>
                    <Txt style={styles.fortuneBadgeText}>MONTHLY</Txt>
                  </View>
                  <View>
                    <Txt style={styles.fortuneTitle}>이번 달{'\n'}운세</Txt>
                    <Txt style={styles.fortuneDesc}>이달의 흐름</Txt>
                  </View>
                </View>
              </View>
            </PressableEffect>

            {/* AI 타로 상담 */}
            <PressableEffect
              style={{ flex: 1 }}
              onPress={() => navigation.push('/chatbot')}
            >
              <View style={styles.fortuneCard}>
                <Image
                  source={ASSETS.aiTarotThumb}
                  style={StyleSheet.absoluteFill as any}
                  resizeMode="cover"
                />
                <View style={[styles.fortuneOverlay, { backgroundColor: 'rgba(139, 92, 246, 0.25)' }]} />
                <View style={styles.fortuneContent}>
                  <View style={[styles.fortuneBadge, { borderColor: 'rgba(139,92,246,0.4)' }]}>
                    <Txt style={[styles.fortuneBadgeText, { color: '#a78bfa' }]}>AI</Txt>
                  </View>
                  <View>
                    <Txt style={styles.fortuneTitle}>AI 타로{'\n'}상담</Txt>
                    <Txt style={styles.fortuneDesc}>고민 상담</Txt>
                  </View>
                </View>
              </View>
            </PressableEffect>
          </View>

          {/* Recommended Content */}
          <RecommendedContent onNavigate={handleNavigate} />
        </View>

        {/* Daily Card Modal */}
        {drawnCard && (
          <DailyCardModal
            isOpen={showCardModal}
            onClose={() => setShowCardModal(false)}
            card={drawnCard.card}
            isReversed={drawnCard.isReversed}
            question={currentQuestion}
            onConsult={() => {
              setShowCardModal(false);
              navigation.navigate('/chatbot', {
                consultation: {
                  card: drawnCard.card,
                  isReversed: drawnCard.isReversed,
                  question: currentQuestion,
                }
              });
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sparkle: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DAA520',
  },
  welcomeMessage: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  newYearBanner: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.3)',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  specialBadge: {
    backgroundColor: '#DAA520',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#DAA520',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  fortuneGrid: {
    flexDirection: 'row',
    gap: 8,               // 12 → 8로 줄여서 카드 너비 확보
    marginBottom: 24,
  },
  fortuneCard: {
    flex: 1,
    height: 148,          // 128 → 148로 높여서 텍스트 공간 확보
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fortuneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  fortuneContent: {
    flex: 1,
    padding: 10,          // 14 → 12로 줄여서 내부 공간 확보
    justifyContent: 'space-between',
  },
  fortuneBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  fortuneBadgeText: {
    fontSize: 9,          // 10 → 9로 줄임
    fontWeight: '800',
    color: '#DAA520',
  },
  fortuneTitle: {
    fontSize: 12,         // 16 → 14로 줄여서 줄바꿈 여유 확보
    fontWeight: '800',
    color: '#fff',
    lineHeight: 20,
  },
  fortuneDesc: {
    fontSize: 10,         // 11 → 10으로 줄임
    color: '#d1d5db',
    marginTop: 2,
  },
  betaBadge: {
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    borderColor: 'rgba(218, 165, 32, 0.3)',
  },
});
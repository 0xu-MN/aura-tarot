import { createRoute } from '@granite-js/react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { ASSETS } from '../lib/assets';

export const Route = createRoute('/', {
  component: IndexPage,
});

const { width, height } = Dimensions.get('window');

function IndexPage() {
  const navigation = Route.useNavigation();
  const [isEntering, setIsEntering] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cardFloatAnim = useRef(new Animated.Value(0)).current;

  // Card floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cardFloatAnim, {
          toValue: -15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(cardFloatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleCardPress = () => {
    setIsEntering(true);

    // Animate card scale and fade
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.push('/home');
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={ASSETS.heroBg}
        style={styles.background}
        resizeMode="cover"
      />
      {/* Dark gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeStar}>⭐</Text>
          <Text style={styles.badgeText}>AI가 해석하는 나만의 타로</Text>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>오늘의 한 장</Text>

        {/* Subtitle / Service Description */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>당신의 다양한 고민을 위로하고</Text>
          <Text style={styles.subtitle}>조언을 건네는 AI 타로 운세 서비스</Text>
          <Text style={styles.subtitle}>가볍게 확인하는 오늘의 한 장부터</Text>
          <Text style={styles.subtitle}>10가지 이상의 상황별 리딩을 제공합니다</Text>
        </View>

        {/* Animated Tarot Card Back and CTA */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateY: cardFloatAnim },
                { scale: scaleAnim }
              ],
              opacity: fadeAnim
            }
          ]}
        >
          {/* Card image via HTTP URI — AppInToss doesn't support local require() */}
          <View style={styles.cardShadowWrapper}>
            <Image
              source={ASSETS.tarotBack}
              style={styles.cardBack}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleCardPress}
          activeOpacity={0.9}
          disabled={isEntering}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>무료로 즐기는 나만의 AI 타로 운세</Text>
      </Animated.View>

      {/* Entry Overlay */}
      {isEntering && (
        <Animated.View
          style={[
            styles.entryOverlay,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0]
              })
            }
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  background: {
    position: 'absolute',
    width: width,
    height: height + 80,
    top: -80,
  },
  gradientOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(10, 10, 11, 0.55)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    // paddingTop: 60,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 27, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.5)',
    marginBottom: 20,
  },
  badgeStar: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: '#DAA520',
    marginBottom: 16,
    textAlign: 'center',
    // textShadowColor: 'rgba(218, 165, 32, 0.6)',
    // textShadowOffset: { width: 0, height: 4 },
    // textShadowRadius: 16,
    letterSpacing: 2,
  },
  subtitleContainer: {
    marginBottom: 40,
    gap: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#c9a870',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
  },
  cardContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  // Shadow on a View wrapper instead of directly on Image
  cardShadowWrapper: {
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    borderRadius: 16,
  },
  cardBack: {
    width: 140,
    height: 240,
    borderRadius: 16,
  },
  startButton: {
    marginTop: 10,
    backgroundColor: '#DAA520',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    color: '#0a0a0b',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 13,
    color: '#8b7355',
    marginTop: 20,
  },
  entryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0b',
    zIndex: 10,
  },
});

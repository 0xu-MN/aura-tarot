import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View, ScrollView, TextInput,
  StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { PageNavbar, Button, BottomInfo, Txt, PressableEffect } from '@toss/tds-react-native';
import { getRandomCards, TarotCardData } from '../../lib/tarot-data';
import { ASSETS } from '../../lib/assets';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/compatibility', { component: TarotCompatibility });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'input' | 'spread' | 'result';

function TarotCompatibility() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('intro');
  const [partnerName, setPartnerName] = useState('');
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [reading, setReading] = useState('');
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 2) {
      const cards = getRandomCards(2);
      setDrawnCards(cards);
      setStep('result');
      generateReading(cards);
    }
  };

  const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    setIsLoading(true);
    try {
      const [c1, c2] = cards;
      if (!c1 || !c2) return;
      const prompt = `당신은 연애 전문 타로 리더 '솜이'입니다.
나와 상대방(${partnerName})의 궁합을 판단해주세요.

1. 나의 마음: ${c1.card.koreanName}
2. 상대방의 마음: ${c2.card.koreanName}

다음 형식으로 답변:
- 궁합 점수: 0~100점 (SCORE: [점수] 형식으로 마지막에 포함)
- 서로의 속마음 분석
- 앞으로의 관계 조언
- 말투: 친근하고 설레는 톤

SCORE: [점수]`;
      const result = await callGemini(prompt);
      const match = result.match(/SCORE:\s*(\d+)/i);
      const s = match ? parseInt(match[1] || '0', 10) : Math.floor(Math.random() * 40) + 60;
      setScore(s);
      setReading(result.replace(/SCORE:\s*\d+/i, '').trim());
    } catch {
      setReading('별들이 잠시 수줍어하고 있어요. 다시 시도해주세요.');
      setScore(50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReveal = (idx: number) => {
    if (!revealedCards.includes(idx)) setRevealedCards([...revealedCards, idx]);
  };

  const reset = () => { setStep('intro'); setPartnerName(''); setDrawnCards([]); setRevealedCards([]); setReading(''); setSelectedCards([]); setScore(0); };

  return (
    <View style={s.container}>
      <PageNavbar>
        <PageNavbar.Title>커플 궁합 타로</PageNavbar.Title>
        <PageNavbar.AccessoryButtons>
          <PageNavbar.AccessoryTextButton onPress={() => navigation.goBack()}>
            뒤로
          </PageNavbar.AccessoryTextButton>
        </PageNavbar.AccessoryButtons>
      </PageNavbar>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Txt style={{ fontSize: 48 }}>💞</Txt></View>
            <Txt style={s.title}>우리 둘의 궁합은?</Txt>
            <Txt style={s.desc}>그 사람과 나의 인연, 얼마나 깊을까요?{'\n'}두 장의 카드로 설레는 답을 찾아보세요.</Txt>
          </View>
        )}

        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.title}>상대방의 이름(별명)을{'\n'}알려주세요</Txt>
            <TextInput
              style={s.input}
              value={partnerName}
              onChangeText={setPartnerName}
              placeholder="예: 민수, 곰돌이, 짝남"
              placeholderTextColor="rgba(236,72,153,0.5)"
            />
            <Button
              size="large"
              type="primary"
              style="fill"
              disabled={!partnerName.trim()}
              containerStyle={{ backgroundColor: '#ec4899', borderRadius: 30, height: 56, width: '100%', opacity: !partnerName.trim() ? 0.5 : 1, alignItems: 'center', justifyContent: 'center' }}
              textStyle={{ color: '#fff', fontSize: 17, fontWeight: '800' }}
              onPress={() => setStep('spread')}
            >
              카드 뽑으러 가기
            </Button>
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <Txt style={s.title}>두 분을 생각하며{'\n'}2장을 선택해주세요</Txt>
            <Txt style={s.subText}>{selectedCards.length === 0 ? '첫 번째: 나의 마음' : '두 번째: 그 사람의 마음'}</Txt>
            <View style={s.cardGrid}>
              {[...Array(8)].map((_, idx) => (
                <PressableEffect key={idx}
                  style={[s.cardBack, selectedCards.includes(idx) && s.cardSelected]}
                  onPress={() => handleCardSelect(idx)}>
                  <Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                </PressableEffect>
              ))}
            </View>
          </View>
        )}

        {step === 'result' && (
          <View style={s.section}>
            <View style={s.cardsRow}>
              {drawnCards.map((c, i) => (
                <PressableEffect key={i} style={{ alignItems: 'center', flex: 1 }} onPress={() => handleReveal(i)}>
                  <Txt style={s.posLabel}>{i === 0 ? '나의 마음' : `${partnerName}의 마음`}</Txt>
                  {revealedCards.includes(i) ? (
                    <Image source={c.card.image} style={[s.resultCard, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  ) : (
                    <View style={s.resultCardBack}><Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" /></View>
                  )}
                  {revealedCards.includes(i) && <Txt style={s.cardName}>{c.card.koreanName}</Txt>}
                </PressableEffect>
              ))}
            </View>

            {revealedCards.length === 2 && (
              <View style={s.resultBox}>
                {isLoading ? (
                  <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color="#ec4899" />
                    <Txt style={s.loadingText}>두 분의 운명을 점치고 있어요... 💞</Txt>
                  </View>
                ) : (
                  <>
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                      <Txt style={s.scoreLabel}>궁합 점수</Txt>
                      <Txt style={s.scoreValue}>{score}점</Txt>
                    </View>
                    <Txt style={s.readingText}>{reading}</Txt>
                    <Button
                      size="medium"
                      type="primary"
                      style="weak"
                      containerStyle={{ borderColor: 'rgba(236,72,153,0.5)', borderWidth: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                      textStyle={{ color: '#ec4899' }}
                      onPress={reset}
                    >
                      다른 사람과 보기
                    </Button>
                  </>
                )}
              </View>
            )}
            {revealedCards.length < 2 && <Txt style={s.subText}>카드를 터치해서 확인해보세요</Txt>}
          </View>
        )}
        <BottomInfo style={{ backgroundColor: BG, paddingBottom: 40 }}>
          <Txt style={[s.subText, { marginTop: 20 }]}>이 운세는 재미로만 봐주세요. 맹신하지 마세요.</Txt>
        </BottomInfo>

      </ScrollView>

      {
        step === 'intro' && (
          <View style={s.fixedBottom}>
            <PressableEffect
              style={{
                backgroundColor: '#ec4899',
                borderRadius: 30,
                height: 56,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => setStep('input')}
            >
              <Txt style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>궁합 보기 시작</Txt>
            </PressableEffect>
          </View>
        )
      }
    </View >
  );
}

const PINK = '#ec4899';
const BG = '#fff0f5'; // Light Pink BG for compatibility
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#db2777' },
  scroll: { padding: 20, paddingBottom: 120 },
  center: { alignItems: 'center', paddingTop: 40, gap: 20 },
  section: { gap: 16 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(236,72,153,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)' },
  title: { fontSize: 26, fontWeight: '800', color: '#831843', textAlign: 'center' },
  desc: { fontSize: 15, color: '#9d174d', textAlign: 'center', lineHeight: 24 },
  subText: { fontSize: 13, color: '#be185d', textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 12, padding: 16, fontSize: 16, color: '#831843' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  cardBack: { width: (width - 80) / 3, aspectRatio: 0.65, borderRadius: 8, backgroundColor: 'rgba(236,72,153,0.1)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)', justifyContent: 'center', alignItems: 'center' },
  cardSelected: { backgroundColor: 'rgba(236,72,153,0.3)', borderColor: PINK },
  cardsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  resultCard: { width: (width - 60) / 2, height: ((width - 60) / 2) * 1.5, borderRadius: 10 },
  resultCardBack: { width: (width - 60) / 2, height: ((width - 60) / 2) * 1.5, borderRadius: 10, backgroundColor: 'rgba(236,72,153,0.1)', justifyContent: 'center', alignItems: 'center' },
  posLabel: { fontSize: 14, fontWeight: '700', color: '#db2777', marginBottom: 8 },
  cardName: { fontSize: 12, color: '#9d174d', marginTop: 8, fontWeight: '600' },
  resultBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#fbcfe8', marginTop: 20 },
  loadingBox: { alignItems: 'center', gap: 16, padding: 20 },
  loadingText: { color: '#db2777', fontSize: 14 },
  readingText: { fontSize: 15, color: '#4a044e', lineHeight: 26, marginBottom: 20 },
  scoreLabel: { fontSize: 14, color: '#db2777', fontWeight: '600' },
  scoreValue: { fontSize: 48, fontWeight: '800', color: PINK },
  fixedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(255,240,245,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(236,72,153,0.2)' },
});

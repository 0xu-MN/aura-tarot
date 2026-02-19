import { createRoute } from '@granite-js/react-native';
import React, { useState, useEffect } from 'react';
import {
  View, ScrollView,
  StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { PageNavbar, Button, BottomInfo, Txt, PressableEffect } from '@toss/tds-react-native';
import { getRandomCards, TarotCardData } from '../../lib/tarot-data';
import { ASSETS } from '../../lib/assets';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/weekly', { component: WeeklyFortune });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'spread' | 'reading';

function getWeeklyDateRange() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;
  return `${fmt(monday)} ~ ${fmt(sunday)}`;
}

function WeeklyFortune() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('intro');
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const weeklyDate = getWeeklyDateRange();

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 5) {
      const cards = getRandomCards(5);
      setDrawnCards(cards);
      setStep('reading');
    }
  };

  useEffect(() => {
    if (step === 'reading' && drawnCards.length > 0 && !reading && !isLoading) {
      generateReading();
    }
  }, [step, drawnCards]);

  const generateReading = async () => {
    if (drawnCards.length < 5) return;
    setIsLoading(true);
    try {
      const [c1, c2, c3, c4, c5] = drawnCards;
      if (!c1 || !c2 || !c3 || !c4 || !c5) return;
      const prompt = `당신은 전문적인 타로 리더 '솜이'입니다.
사용자의 [${weeklyDate}] 주간 운세를 5장의 카드로 해석해주세요.

1. 전체 테마: ${c1.card.koreanName} (${c1.isReversed ? '역방향' : '정방향'})
2. 주초 (월~수): ${c2.card.koreanName} (${c2.isReversed ? '역방향' : '정방향'})
3. 주중 (목~금): ${c3.card.koreanName} (${c3.isReversed ? '역방향' : '정방향'})
4. 주말 (토~일): ${c4.card.koreanName} (${c4.isReversed ? '역방향' : '정방향'})
5. 조언: ${c5.card.koreanName} (${c5.isReversed ? '역방향' : '정방향'})

- 이모지 적절히 사용
- 시작 멘트: "안녕하세요! 타로전문가 솜이입니다! 이번 주 운세 흐름을 읽어드릴게요."

## 🔮 이번 주 테마
(전체 요약)

## 📅 주간 흐름
* **월~수 (초반)**: (해석)
* **목~금 (중반)**: (해석)
* **토~일 (말미)**: (해석)

## ✨ 이번 주 조언
(조언)
**🎯 실천 액션**: (한 문장)`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('## 🔮 이번 주 테마\n별들의 신호를 수신하는 중에 잠시 방해가 있었나 봐요. 하지만 이번 주는 당신에게 긍정적인 에너지가 함께합니다.\n\n## 📅 주간 흐름\n* **월~수**: 차분하게 계획을 점검해보세요.\n* **목~금**: 흐름을 타는 시기입니다. 자신감을 가지세요.\n* **토~일**: 휴식과 재충전이 필요한 시기입니다.\n\n## ✨ 이번 주 조언\n당신은 이미 충분한 능력을 가지고 있습니다.\n**🎯 실천 액션**: 잠시 눈을 감고 심호흡하며 나 자신을 믿어주기');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => { setStep('intro'); setDrawnCards([]); setReading(''); setSelectedCards([]); };

  return (
    <View style={s.container}>
      <PageNavbar>
        <PageNavbar.Title>이번 주 나의 운세</PageNavbar.Title>
        <PageNavbar.AccessoryButtons>
          <PageNavbar.AccessoryTextButton onPress={() => navigation.goBack()}>
            뒤로
          </PageNavbar.AccessoryTextButton>
        </PageNavbar.AccessoryButtons>
      </PageNavbar>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Txt style={{ fontSize: 48 }}>📅</Txt></View>
            <Txt style={s.title}>이번 주{'\n'}나의 운세</Txt>
            <Txt style={s.desc}>새로운 한 주, 어떤 에너지가 기다릴까요?{'\n'}함께 뽑아볼게요 ✨</Txt>
            <Txt style={s.dateText}>{weeklyDate}</Txt>
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <Txt style={s.spreadLabel}>5 CARDS SPREAD</Txt>
            <Txt style={s.title}>이번 주를 위한 5장의 카드</Txt>
            <Txt style={s.subText}>신중하게 5장을 선택해주세요 ({selectedCards.length}/5)</Txt>
            <View style={s.cardGrid}>
              {[...Array(15)].map((_, idx) => (
                <PressableEffect key={idx}
                  style={[s.cardBack, selectedCards.includes(idx) && s.cardSelected]}
                  onPress={() => handleCardSelect(idx)}>
                  <Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 6 }} resizeMode="cover" />
                </PressableEffect>
              ))}
            </View>
          </View>
        )}

        {step === 'reading' && (
          <View style={s.section}>
            {/* Theme card (center big) */}
            {drawnCards[0] && (
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Txt style={s.cardLabel}>전체 테마</Txt>
                <Image source={drawnCards[0].card.image}
                  style={[s.themeCard, drawnCards[0].isReversed && { transform: [{ rotate: '180deg' }] }]} />
                <Txt style={s.cardName}>{drawnCards[0].card.koreanName}</Txt>
              </View>
            )}

            {/* Flow cards row */}
            <View style={s.flowRow}>
              {drawnCards.slice(1, 4).map((c, i) => (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Txt style={s.cardLabel}>{['월~수', '목~금', '토~일'][i]}</Txt>
                  <Image source={c.card.image}
                    style={[s.flowCard, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  <Txt style={[s.cardName, { fontSize: 9 }]}>{c.card.koreanName}</Txt>
                </View>
              ))}
            </View>

            {/* Advice card */}
            {drawnCards[4] && (
              <View style={{ alignItems: 'center' }}>
                <Txt style={[s.cardLabel, { color: '#DAA520' }]}>✨ 조언</Txt>
                <Image source={drawnCards[4].card.image}
                  style={[s.themeCard, { borderColor: '#DAA520' }, drawnCards[4].isReversed && { transform: [{ rotate: '180deg' }] }]} />
                <Txt style={[s.cardName, { color: '#DAA520' }]}>{drawnCards[4].card.koreanName}</Txt>
              </View>
            )}

            <View style={s.resultBox}>
              {isLoading ? (
                <View style={s.loadingBox}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Txt style={s.loadingText}>운세 데이터를 분석중입니다...</Txt>
                </View>
              ) : (
                <Txt style={s.readingText}>{reading}</Txt>
              )}
            </View>

            {!isLoading && (
              <Button
                size="medium"
                type="primary"
                style="weak"
                containerStyle={{ borderColor: 'rgba(218,165,32,0.5)', borderWidth: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                textStyle={{ color: '#DAA520' }}
                onPress={reset}
              >
                한번 더 뽑기
              </Button>
            )}
          </View>
        )}
        <BottomInfo style={{ backgroundColor: BG, paddingBottom: 40 }}>
          <Txt style={[s.subText, { marginTop: 20 }]}>이 운세는 재미로만 봐주세요. 맹신하지 마세요.</Txt>
        </BottomInfo>
      </ScrollView>

      {step === 'intro' && (
        <View style={s.fixedBottom}>
          <PressableEffect
            style={{
              backgroundColor: '#DAA520',
              borderRadius: 30,
              height: 56,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => setStep('spread')}
          >
            <Txt style={{ color: '#000', fontSize: 17, fontWeight: '800' }}>이번 주 운세 뽑기</Txt>
          </PressableEffect>
        </View>
      )}
    </View>
  );
}

const BG = '#0a0a0a';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  scroll: { padding: 20, paddingBottom: 120 },
  center: { alignItems: 'center', paddingTop: 30, gap: 16 },
  section: { gap: 16 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(218,165,32,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 40 },
  desc: { fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 24 },
  dateText: { fontSize: 12, color: 'rgba(218,165,32,0.6)', fontWeight: '600' },
  spreadLabel: { fontSize: 12, color: '#DAA520', fontWeight: '800', letterSpacing: 3, textAlign: 'center' },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  cardBack: { width: (width - 80) / 5, aspectRatio: 0.65, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  cardSelected: { backgroundColor: 'rgba(218,165,32,0.2)', borderColor: '#DAA520' },
  themeCard: { width: 90, height: 135, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(139,92,246,0.5)', marginVertical: 6 },
  flowCard: { width: 64, height: 96, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  flowRow: { flexDirection: 'row', justifyContent: 'space-around' },
  cardLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(139,92,246,0.8)', letterSpacing: 1 },
  cardName: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  fixedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(10,10,10,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(218,165,32,0.2)' },
});

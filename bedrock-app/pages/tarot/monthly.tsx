import { createRoute } from '@granite-js/react-native';
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { getRandomCards, TarotCardData } from '../../lib/tarot-data';
import { ASSETS } from '../../lib/assets';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/monthly', { component: MonthlyFortune });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'spread' | 'reading';

function getMonthlyDate() {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
}

function MonthlyFortune() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('intro');
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const monthlyDate = getMonthlyDate();

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
    setIsLoading(true);
    try {
      const prompt = `당신은 전문적인 타로 리더 '솜이'입니다.
사용자의 [${monthlyDate}] 월간 운세를 5장의 카드로 해석해주세요.

1. 전체 테마: ${drawnCards[0].card.koreanName} (${drawnCards[0].isReversed ? '역방향' : '정방향'})
2. 월초 (1~10일): ${drawnCards[1].card.koreanName} (${drawnCards[1].isReversed ? '역방향' : '정방향'})
3. 월중 (11~20일): ${drawnCards[2].card.koreanName} (${drawnCards[2].isReversed ? '역방향' : '정방향'})
4. 월말 (21~말일): ${drawnCards[3].card.koreanName} (${drawnCards[3].isReversed ? '역방향' : '정방향'})
5. 이번 달 조언: ${drawnCards[4].card.koreanName} (${drawnCards[4].isReversed ? '역방향' : '정방향'})

- 시작 멘트: "안녕하세요! 타로전문가 솜이입니다! 이번 달 운세 흐름을 읽어드릴게요."
- 이모지 적절히 사용

## 🌕 이번 달 테마
(전체 요약)

## 📅 월간 흐름
* **월초 (1~10일)**: (해석)
* **월중 (11~20일)**: (해석)
* **월말 (21~말)**: (해석)

## ✨ 이번 달 조언
(조언)
**🎯 실천 액션**: (한 문장)`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('## 🌕 이번 달 테마\n별들의 메시지를 받지 못했어요. 하지만 이번 달은 당신에게 긍정적인 에너지가 함께합니다.\n\n## 📅 월간 흐름\n* **월초**: 차분하게 목표를 설정하는 시간입니다.\n* **월중**: 본격적인 실행의 시기입니다.\n* **월말**: 결실을 맺는 시간이 다가옵니다.\n\n## ✨ 이번 달 조언\n한 걸음씩 꾸준히 나아가세요.\n**🎯 실천 액션**: 매일 작은 목표를 달성하며 성취감을 느껴보세요');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => { setStep('intro'); setDrawnCards([]); setReading(''); setSelectedCards([]); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.headerSub}>{monthlyDate} MONTHLY</Text>
          <Text style={s.headerTitle}>이번 달 나의 운세</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Text style={{ fontSize: 48 }}>🌕</Text></View>
            <Text style={s.title}>이번 달{'\n'}나의 운세</Text>
            <Text style={s.desc}>새로운 한 달, 어떤 흐름이 이어질까요?{'\n'}당신의 한 달을 미리 확인해보세요.</Text>
            <Text style={s.dateText}>{monthlyDate}</Text>
            <TouchableOpacity style={s.mainBtn} onPress={() => setStep('spread')}>
              <Text style={s.mainBtnText}>이번 달 운세 뽑기</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <Text style={s.spreadLabel}>MONTHLY SPREAD</Text>
            <Text style={s.title}>이번 달을 위한 5장의 카드</Text>
            <Text style={s.subText}>깊게 심호흡하고 5장을 선택해주세요 ({selectedCards.length}/5)</Text>
            <View style={s.cardGrid}>
              {[...Array(15)].map((_, idx) => (
                <TouchableOpacity key={idx}
                  style={[s.cardBack, selectedCards.includes(idx) && s.cardSelected]}
                  onPress={() => handleCardSelect(idx)}>
                  <Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 6 }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'reading' && (
          <View style={s.section}>
            {drawnCards[0] && (
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text style={s.cardLabel}>전체 테마</Text>
                <Image source={drawnCards[0].card.image}
                  style={[s.themeCard, drawnCards[0].isReversed && { transform: [{ rotate: '180deg' }] }]} />
                <Text style={s.cardName}>{drawnCards[0].card.koreanName}</Text>
              </View>
            )}

            <View style={s.flowRow}>
              {drawnCards.slice(1, 4).map((c, i) => (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={s.cardLabel}>{['월초', '월중', '월말'][i]}</Text>
                  <Image source={c.card.image}
                    style={[s.flowCard, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  <Text style={[s.cardName, { fontSize: 9 }]}>{c.card.koreanName}</Text>
                </View>
              ))}
            </View>

            {drawnCards[4] && (
              <View style={{ alignItems: 'center' }}>
                <Text style={[s.cardLabel, { color: '#a78bfa' }]}>✨ 조언</Text>
                <Image source={drawnCards[4].card.image}
                  style={[s.themeCard, { borderColor: '#a78bfa' }, drawnCards[4].isReversed && { transform: [{ rotate: '180deg' }] }]} />
                <Text style={[s.cardName, { color: '#a78bfa' }]}>{drawnCards[4].card.koreanName}</Text>
              </View>
            )}

            <View style={s.resultBox}>
              {isLoading ? (
                <View style={s.loadingBox}>
                  <ActivityIndicator size="large" color="#a78bfa" />
                  <Text style={s.loadingText}>월간 운세 데이터를 분석중입니다...</Text>
                </View>
              ) : (
                <Text style={s.readingText}>{reading}</Text>
              )}
            </View>

            {!isLoading && (
              <TouchableOpacity style={s.mainBtn} onPress={reset}>
                <Text style={[s.mainBtnText, { color: '#fff' }]}>한번 더 뽑기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const BG = '#05050f';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 22, color: '#fff' },
  headerSub: { fontSize: 10, color: 'rgba(167,139,250,0.7)', letterSpacing: 2, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  scroll: { padding: 20, paddingBottom: 60 },
  center: { alignItems: 'center', paddingTop: 30, gap: 16 },
  section: { gap: 16 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(167,139,250,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 38 },
  desc: { fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 24 },
  dateText: { fontSize: 12, color: 'rgba(167,139,250,0.7)', fontWeight: '600' },
  mainBtn: { backgroundColor: 'linear-gradient(#7c3aed, #4f46e5)', borderRadius: 30, paddingVertical: 16, alignItems: 'center', width: '100%', backgroundColor: '#7c3aed' },
  mainBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  spreadLabel: { fontSize: 12, color: '#a78bfa', fontWeight: '800', letterSpacing: 3, textAlign: 'center' },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  cardBack: { width: (width - 80) / 5, aspectRatio: 0.65, borderRadius: 6, backgroundColor: 'rgba(167,139,250,0.05)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', justifyContent: 'center', alignItems: 'center' },
  cardSelected: { backgroundColor: 'rgba(124,58,237,0.3)', borderColor: '#a78bfa' },
  themeCard: { width: 90, height: 135, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(99,102,241,0.5)', marginVertical: 6 },
  flowCard: { width: 64, height: 96, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', marginVertical: 4 },
  flowRow: { flexDirection: 'row', justifyContent: 'space-around' },
  cardLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(99,102,241,0.8)', letterSpacing: 1 },
  cardName: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.1)' },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { color: 'rgba(167,139,250,0.7)', fontSize: 13 },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
});

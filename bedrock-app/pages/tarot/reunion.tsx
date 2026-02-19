import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { getWeightedCards, TarotCardData } from '../../lib/tarot-data';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/reunion', { component: ReunionTarot });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'question' | 'spread' | 'reading';

const SAMPLE_QUESTIONS = [
  '전 연인과 재회 가능성 있을까?', '상대가 나를 아직 좋아할까?',
  '재회 타이밍은 언제?', '상대 속마음이 뭐야?',
  '재회할지 말지 조언해줘',
];

function ReunionTarot() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('intro');
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [reunionChance, setReunionChance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 4) {
      const cards = getWeightedCards(4, { cups: 4, major: 3, swords: 2, wands: 1, pentacles: 1 });
      setDrawnCards(cards);
      setStep('reading');
      generateReading(cards);
    }
  };

  const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    setIsLoading(true);
    try {
      const prompt = `당신은 솔직하면서도 공감 능력이 뛰어난 전문 타로 리더 '솜이'입니다.
사용자의 재회 관련 질문에 대해 [나의 감정, 상대방 속마음, 방해물, 재회 가능성] 4장으로 해석해주세요.

질문: ${question}

1. 나의 감정: ${cards[0].card.koreanName} (${cards[0].isReversed ? '역방향' : '정방향'})
2. 상대방 속마음: ${cards[1].card.koreanName} (${cards[1].isReversed ? '역방향' : '정방향'})
3. 방해물: ${cards[2].card.koreanName} (${cards[2].isReversed ? '역방향' : '정방향'})
4. 재회 가능성: ${cards[3].card.koreanName} (${cards[3].isReversed ? '역방향' : '정방향'})

- 재회 확률을 0~100 사이 숫자로 맨 마지막 줄에 "CHANCE: [숫자]" 형식으로 꼭 포함하세요.

## 💭 나의 마음 vs 상대의 마음
(1, 2번 카드 통합 해석)

## 🚧 우리 사이의 벽
(3번 카드 해석)

## 🌙 재회 가능성
(4번 카드 해석)

## 💡 달의 조언
(구체적인 행동 지침)

CHANCE: [숫자]`;
      const result = await callGemini(prompt);
      const match = result.match(/CHANCE:\s*(\d+)/i);
      const chance = match ? parseInt(match[1], 10) : Math.floor(Math.random() * 60) + 20;
      setReunionChance(Math.min(100, Math.max(0, chance)));
      setReading(result.replace(/CHANCE:\s*\d+/i, '').trim());
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
      setReunionChance(50);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => { setStep('intro'); setQuestion(''); setDrawnCards([]); setReading(''); setSelectedCards([]); setReunionChance(0); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>재회 확률 타로</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Text style={{ fontSize: 48 }}>🌙</Text></View>
            <Text style={s.title}>재회 확률 타로</Text>
            <Text style={s.desc}>상대방의 진심, 그리고 다시 만날 가능성.{'\n'}마주할 준비가 되셨나요? 💭</Text>
            <TouchableOpacity style={s.mainBtn} onPress={() => setStep('question')}>
              <Text style={s.mainBtnText}>속마음 알아보기</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'question' && (
          <View style={s.section}>
            <Text style={s.title}>무엇이 가장 궁금한가요?</Text>
            <Text style={s.subText}>솔직한 질문이 가장 정확한 답을 줍니다</Text>
            <View style={s.tagRow}>
              {SAMPLE_QUESTIONS.map((q, i) => (
                <TouchableOpacity key={i} style={s.tag} onPress={() => setQuestion(q)}>
                  <Text style={s.tagText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.input} value={question} onChangeText={setQuestion}
              placeholder="직접 입력하거나 위에서 선택하세요"
              placeholderTextColor="rgba(165,180,252,0.4)" multiline />
            <TouchableOpacity style={[s.mainBtn, !question.trim() && { opacity: 0.5 }]}
              onPress={() => { if (question.trim()) setStep('spread'); }}>
              <Text style={s.mainBtnText}>카드 뽑기</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <Text style={s.title}>당신의 마음을 담아</Text>
            <Text style={s.subText}>4장을 선택해주세요 ({selectedCards.length}/4)</Text>
            <View style={s.cardGrid}>
              {[...Array(12)].map((_, idx) => (
                <TouchableOpacity key={idx}
                  style={[s.cardBack, selectedCards.includes(idx) && s.cardSelected]}
                  onPress={() => handleCardSelect(idx)}>
                  <Text style={{ fontSize: 24 }}>🃏</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'reading' && (
          <View style={s.section}>
            <View style={s.drawnRow}>
              {drawnCards.map((c, i) => (
                <View key={i} style={s.drawnCard}>
                  <Text style={s.posLabel}>{['나', '상대', '장애', '결과'][i]}</Text>
                  <Image source={c.card.image} style={[s.cardImg, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  <Text style={s.cardName}>{c.card.koreanName}</Text>
                </View>
              ))}
            </View>

            {/* Chance Gauge */}
            <View style={s.gaugeBox}>
              <Text style={s.gaugeTitle}>REUNION PROBABILITY</Text>
              {isLoading ? (
                <View style={s.gaugeBar}><View style={[s.gaugeFill, { width: '100%', opacity: 0.3 }]} /></View>
              ) : (
                <>
                  <View style={s.gaugeBar}>
                    <View style={[s.gaugeFill, { width: `${reunionChance}%` }]} />
                  </View>
                  <View style={s.gaugeLabels}>
                    <Text style={s.gaugeLabel}>0%</Text>
                    <Text style={s.gaugeBig}>{reunionChance}%</Text>
                    <Text style={s.gaugeLabel}>100%</Text>
                  </View>
                </>
              )}
            </View>

            <View style={s.resultBox}>
              {isLoading ? (
                <View style={s.loadingBox}>
                  <ActivityIndicator size="large" color="#818cf8" />
                  <Text style={s.loadingText}>별들이 운명을 계산하고 있습니다... 🌙</Text>
                </View>
              ) : (
                <Text style={s.readingText}>{reading}</Text>
              )}
            </View>
            {!isLoading && (
              <TouchableOpacity style={s.secondaryBtn} onPress={reset}>
                <Text style={s.secondaryBtnText}>다시 하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const INDIGO = '#818cf8';
const BG = '#0f172a';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 22, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#e0e7ff' },
  scroll: { padding: 20, paddingBottom: 60 },
  center: { alignItems: 'center', paddingTop: 40, gap: 20 },
  section: { gap: 16 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(129,140,248,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)' },
  title: { fontSize: 26, fontWeight: '800', color: '#e0e7ff', textAlign: 'center' },
  desc: { fontSize: 15, color: 'rgba(129,140,248,0.7)', textAlign: 'center', lineHeight: 24 },
  subText: { fontSize: 13, color: 'rgba(129,140,248,0.6)', textAlign: 'center' },
  mainBtn: { backgroundColor: '#4f46e5', borderRadius: 30, paddingVertical: 16, alignItems: 'center', width: '100%' },
  mainBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', backgroundColor: 'rgba(129,140,248,0.05)' },
  tagText: { fontSize: 12, color: 'rgba(165,180,252,0.8)' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', borderRadius: 12, padding: 14, fontSize: 15, color: '#e0e7ff', minHeight: 60 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  cardBack: { width: (width - 80) / 4, aspectRatio: 0.65, borderRadius: 8, backgroundColor: 'rgba(129,140,248,0.1)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', justifyContent: 'center', alignItems: 'center' },
  cardSelected: { backgroundColor: 'rgba(79,70,229,0.4)', borderColor: INDIGO },
  drawnRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  drawnCard: { alignItems: 'center', gap: 4 },
  posLabel: { fontSize: 10, fontWeight: '800', color: INDIGO, letterSpacing: 1 },
  cardImg: { width: 64, height: 96, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)' },
  cardName: { fontSize: 9, color: 'rgba(224,231,255,0.7)', textAlign: 'center', maxWidth: 64 },
  gaugeBox: { backgroundColor: 'rgba(30,27,75,0.5)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  gaugeTitle: { fontSize: 11, fontWeight: '800', color: INDIGO, textAlign: 'center', marginBottom: 12, letterSpacing: 2 },
  gaugeBar: { height: 14, backgroundColor: 'rgba(51,65,85,1)', borderRadius: 7, overflow: 'hidden' },
  gaugeFill: { height: '100%', backgroundColor: INDIGO, borderRadius: 7 },
  gaugeLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  gaugeLabel: { fontSize: 11, color: 'rgba(129,140,248,0.7)', fontFamily: 'monospace' },
  gaugeBig: { fontSize: 24, fontWeight: '800', color: '#fff' },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(129,140,248,0.1)' },
  loadingBox: { alignItems: 'center', gap: 16, paddingVertical: 30 },
  loadingText: { color: 'rgba(129,140,248,0.7)', fontSize: 14 },
  readingText: { fontSize: 14, color: '#e0e7ff', lineHeight: 24 },
  secondaryBtn: { borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { fontSize: 15, color: INDIGO, fontWeight: '700' },
});

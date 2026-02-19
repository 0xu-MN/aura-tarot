import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { getRandomCards, TarotCardData } from '../../lib/tarot-data';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/money', { component: MoneyTarot });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'input' | 'spread' | 'result';
const LABELS = ['현재의 재물운', '금전적 장애물', '미래의 결실'];

function MoneyTarot() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('intro');
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [aiReading, setAiReading] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 3) {
      const cards = getRandomCards(3);
      setDrawnCards(cards);
      setStep('result');
      fetchReading(cards);
    }
  };

  const fetchReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    setIsAnalyzing(true);
    try {
      const prompt = `당신은 전문 타로 마스터입니다. 금전·재물운 타로를 3장으로 해석해주세요.

질문: ${question}

1. 현재의 재물운: ${cards[0].card.koreanName} (${cards[0].isReversed ? '역방향' : '정방향'})
2. 금전적 장애물: ${cards[1].card.koreanName} (${cards[1].isReversed ? '역방향' : '정방향'})
3. 미래의 결실: ${cards[2].card.koreanName} (${cards[2].isReversed ? '역방향' : '정방향'})

- 현재의 자금 흐름, 장애물, 미래 결실을 중점으로 해석
- 구체적인 재물 관련 조언 제공
- 이모지 적절히 사용
- 부정적 카드도 긍정적으로 전환하여 해석`;
      const result = await callGemini(prompt);
      setAiReading(result);
    } catch {
      setAiReading('AI 마스터와의 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReveal = (idx: number) => {
    if (!revealedCards.includes(idx)) setRevealedCards([...revealedCards, idx]);
  };

  const reset = () => { setStep('input'); setDrawnCards([]); setRevealedCards([]); setAiReading(''); setSelectedCards([]); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>금전·재물운 타로</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Text style={{ fontSize: 48 }}>💰</Text></View>
            <Text style={s.title}>흐르는 재물의 길목</Text>
            <Text style={s.desc}>막힌 금전운을 뚫고 재물을 불러들이는 비책이 필요하신가요?{'\n'}현재의 자금 흐름과 앞으로의 투자, 횡재수까지{'\n'}3장의 카드로 당신의 재물 지도를 완성해 드립니다.</Text>
            <TouchableOpacity style={s.mainBtn} onPress={() => setStep('input')}>
              <Text style={s.mainBtnText}>금전운 분석 시작</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'input' && (
          <View style={s.section}>
            <Text style={s.title}>구체적인 금전 고민을 입력해주세요</Text>
            <TextInput style={[s.input, { minHeight: 100, textAlignVertical: 'top' }]}
              value={question} onChangeText={setQuestion} multiline
              placeholder="예: 이번 달은 지출이 많을까요? 새로운 투자를 시작해도 될까요?"
              placeholderTextColor="rgba(218,165,32,0.4)" />
            <TouchableOpacity style={[s.mainBtn, question.trim().length < 5 && { opacity: 0.5 }]}
              onPress={() => { if (question.trim().length >= 5) setStep('spread'); }}>
              <Text style={s.mainBtnText}>황금 카드 뽑기</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <Text style={s.title}>나의 재물운을 생각하며{'\n'}3장의 카드를 골라주세요</Text>
            <Text style={s.subText}>선택됨: {selectedCards.length}/3</Text>
            <View style={s.cardGrid}>
              {[...Array(9)].map((_, idx) => (
                <TouchableOpacity key={idx}
                  style={[s.cardBack, selectedCards.includes(idx) && s.cardSelected]}
                  onPress={() => handleCardSelect(idx)}>
                  <Text style={{ fontSize: 28 }}>🃏</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'result' && (
          <View style={s.section}>
            <Text style={s.questionBox}>Q. {question}</Text>
            <View style={s.cardsRow}>
              {drawnCards.map((c, i) => (
                <TouchableOpacity key={i} style={{ alignItems: 'center', flex: 1 }} onPress={() => handleReveal(i)}>
                  <Text style={s.posLabel}>{LABELS[i]}</Text>
                  {revealedCards.includes(i) ? (
                    <Image source={c.card.image} style={[s.resultCard, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  ) : (
                    <View style={s.resultCardBack}><Text style={{ fontSize: 28 }}>🃏</Text></View>
                  )}
                  {revealedCards.includes(i) && (
                    <>
                      <Text style={s.cardName}>{c.card.koreanName}</Text>
                      {c.isReversed && <Text style={[s.cardName, { fontSize: 9 }]}>(역방향)</Text>}
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {revealedCards.length === 3 ? (
              <View style={s.resultBox}>
                <Text style={s.resultTitle}>✨ AI 재물운 리딩 결과</Text>
                {isAnalyzing ? (
                  <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color="#DAA520" />
                    <Text style={s.loadingText}>AI 마스터가 금전의 흐름을 분석하고 있습니다...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={s.readingText}>{aiReading}</Text>
                    <TouchableOpacity style={s.resetBtn} onPress={reset}>
                      <Text style={s.resetText}>한번 더 뽑기</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <Text style={s.subText}>카드를 터치해서 하나씩 뒤집어보세요</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const BG = '#080810';
const GOLD = '#DAA520';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 22, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fef3c7' },
  scroll: { padding: 20, paddingBottom: 60 },
  center: { alignItems: 'center', paddingTop: 30, gap: 16 },
  section: { gap: 14 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(218,165,32,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center' },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22 },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  mainBtn: { backgroundColor: GOLD, borderRadius: 30, paddingVertical: 16, alignItems: 'center', width: '100%' },
  mainBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  cardBack: { width: (width - 80) / 3, aspectRatio: 0.65, borderRadius: 10, backgroundColor: 'rgba(218,165,32,0.05)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.25)', justifyContent: 'center', alignItems: 'center' },
  cardSelected: { backgroundColor: 'rgba(218,165,32,0.25)', borderColor: GOLD },
  questionBox: { fontSize: 13, color: 'rgba(218,165,32,0.8)', backgroundColor: 'rgba(218,165,32,0.05)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)' },
  cardsRow: { flexDirection: 'row', gap: 8 },
  posLabel: { fontSize: 10, color: 'rgba(218,165,32,0.8)', fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  resultCard: { width: (width - 80) / 3, height: ((width - 80) / 3) * 1.5, borderRadius: 8 },
  resultCardBack: { width: (width - 80) / 3, height: ((width - 80) / 3) * 1.5, borderRadius: 8, backgroundColor: 'rgba(218,165,32,0.08)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)', justifyContent: 'center', alignItems: 'center' },
  cardName: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)', gap: 14 },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#fef3c7' },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { color: 'rgba(218,165,32,0.7)', fontSize: 13, textAlign: 'center' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  resetBtn: { borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  resetText: { fontSize: 15, color: GOLD, fontWeight: '700' },
});

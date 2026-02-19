import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { getWeightedCards, TarotCardData } from '../../lib/tarot-data';
import { ASSETS } from '../../lib/assets';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/new-year', { component: NewYearTarot });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'theme' | 'spread' | 'result';

const THEMES = [
  { id: 'general', label: '전체 운세', emoji: '✨', weights: {} },
  { id: 'love', label: '연애운', emoji: '💕', weights: { cups: 2 } },
  { id: 'wealth', label: '재물운', emoji: '💰', weights: { pentacles: 2 } },
  { id: 'career', label: '커리어/승진', emoji: '💼', weights: { wands: 2, swords: 2 } },
  { id: 'health', label: '건강운', emoji: '🌿', weights: {} },
  { id: 'relationship', label: '인간관계', emoji: '🤝', weights: { cups: 2 } },
  { id: 'growth', label: '자기계발', emoji: '📚', weights: {} },
];

function NewYearTarot() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('intro');
  const [theme, setTheme] = useState(THEMES[0]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [aiReading, setAiReading] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleThemeSelect = (t: typeof THEMES[0]) => {
    setTheme(t);
    setStep('spread');
  };

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 4) {
      const cards = getWeightedCards(4, theme.weights as any);
      setDrawnCards(cards);
      setStep('result');
      fetchReading(cards, theme);
    }
  };

  const fetchReading = async (cards: { card: TarotCardData; isReversed: boolean }[], t: typeof THEMES[0]) => {
    setIsAnalyzing(true);
    try {
      const prompt = `당신은 신비로운 타로 마스터입니다.
사용자의 2026년 신년 운세를 '${t.label}' 테마 중심으로 해석해주세요.

1. 초반 (1~4월): ${cards[0].card.koreanName} (${cards[0].isReversed ? '역방향' : '정방향'})
2. 중반 (5~8월): ${cards[1].card.koreanName} (${cards[1].isReversed ? '역방향' : '정방향'})
3. 후반 (9~12월): ${cards[2].card.koreanName} (${cards[2].isReversed ? '역방향' : '정방향'})
4. 전체 조언: ${cards[3].card.koreanName} (${cards[3].isReversed ? '역방향' : '정방향'})

- ${t.label} 관점에서 구체적으로 해석해주세요.
- 희망차고 긍정적인 톤을 유지하되, 조심할 점은 부드럽게 조언해주세요.
- 각 시기별 및 종합 조언을 포함해주세요.
- 이모지 적절히 사용`;
      const result = await callGemini(prompt);
      setAiReading(result);
    } catch {
      setAiReading('죄송합니다. AI 마스터와의 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReveal = (idx: number) => {
    if (!revealedCards.includes(idx)) setRevealedCards([...revealedCards, idx]);
  };

  const reset = () => { setStep('intro'); setDrawnCards([]); setRevealedCards([]); setAiReading(''); setSelectedCards([]); };

  const LABELS = ['초반 (1~4월)', '중반 (5~8월)', '후반 (9~12월)', '✨ 전체 조언'];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>2026년 신년운세</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Text style={{ fontSize: 48 }}>🎇</Text></View>
            <Text style={s.title}>2026년 신년운세</Text>
            <Text style={s.desc}>당신의 2026년은 어떤 모습일까요?{'\n'}연애, 재물, 커리어... 가장 궁금한 테마를 선택해 집중적으로 알아보세요. 4장의 카드가 1년의 흐름을 명확히 보여드립니다.</Text>
            <TouchableOpacity style={s.mainBtn} onPress={() => setStep('theme')}>
              <Text style={s.mainBtnText}>2026년 운세보기</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'theme' && (
          <View style={s.section}>
            <Text style={s.title}>보고 싶은 테마를 선택하세요</Text>
            <Text style={s.subText}>한 해 운세를 알려줄게요 🎇</Text>
            {THEMES.map((t) => (
              <TouchableOpacity key={t.id} style={s.themeBtn} onPress={() => handleThemeSelect(t)}>
                <Text style={{ fontSize: 24 }}>{t.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.themeName}>{t.label}</Text>
                  <Text style={s.themeDesc}>{t.label}을 중심으로 2026년을 미리봅니다.</Text>
                </View>
                <Text style={{ color: 'rgba(218,165,32,0.5)', fontSize: 20 }}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <View style={s.themeTag}>
              <Text style={s.themeTagText}>{theme.emoji} {theme.label}</Text>
            </View>
            <Text style={s.title}>4장을 하나씩 선택해주세요</Text>
            <Text style={s.subText}>선택됨: {selectedCards.length}/4</Text>
            <View style={s.cardGrid}>
              {[...Array(12)].map((_, idx) => (
                <TouchableOpacity key={idx}
                  style={[s.cardBack, selectedCards.includes(idx) && s.cardSelected]}
                  onPress={() => handleCardSelect(idx)}>
                  <Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'result' && (
          <View style={s.section}>
            <Text style={[s.subText, { color: '#DAA520' }]}>{theme.emoji} 2026년 {theme.label} 리포트</Text>
            <View style={s.resultCardGrid}>
              {drawnCards.map((c, i) => (
                <TouchableOpacity key={i} style={{ alignItems: 'center', width: (width - 60) / 2 - 6 }} onPress={() => handleReveal(i)}>
                  <Text style={s.posLabel}>{LABELS[i]}</Text>
                  {revealedCards.includes(i) ? (
                    <Image source={c.card.image} style={[s.resultCard, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  ) : (
                    <View style={s.resultCardBack}><Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 10 }} resizeMode="cover" /></View>
                  )}
                  {revealedCards.includes(i) && <Text style={s.cardName}>{c.card.koreanName}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {revealedCards.length === 4 && (
              <View style={s.resultBox}>
                {isAnalyzing ? (
                  <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color="#818cf8" />
                    <Text style={s.loadingText}>{theme.label} 흐름을 읽고 있습니다...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={s.readingText}>{aiReading}</Text>
                    <TouchableOpacity style={s.mainBtn} onPress={reset}>
                      <Text style={s.mainBtnText}>한번 더 뽑기</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
            {revealedCards.length < 4 && (
              <Text style={s.subText}>카드를 터치해서 하나씩 뒤집어보세요 ✨</Text>
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
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)', borderRadius: 16, padding: 16 },
  themeName: { fontSize: 15, fontWeight: '700', color: '#fef3c7', marginBottom: 2 },
  themeDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  themeTag: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(218,165,32,0.1)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)' },
  themeTagText: { fontSize: 13, color: GOLD, fontWeight: '700' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  cardBack: { width: (width - 80) / 4, aspectRatio: 0.65, borderRadius: 8, backgroundColor: 'rgba(218,165,32,0.08)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.25)', justifyContent: 'center', alignItems: 'center' },
  cardSelected: { backgroundColor: 'rgba(218,165,32,0.25)', borderColor: GOLD },
  resultCardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  posLabel: { fontSize: 10, color: 'rgba(218,165,32,0.8)', fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  resultCard: { width: (width - 60) / 2 - 6, height: ((width - 60) / 2 - 6) * 1.5, borderRadius: 10 },
  resultCardBack: { width: (width - 60) / 2 - 6, height: ((width - 60) / 2 - 6) * 1.5, borderRadius: 10, backgroundColor: 'rgba(218,165,32,0.1)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', justifyContent: 'center', alignItems: 'center' },
  cardName: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)', gap: 16 },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { color: 'rgba(218,165,32,0.7)', fontSize: 13 },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
});

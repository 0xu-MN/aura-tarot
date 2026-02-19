import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View, ScrollView,
  StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { PageNavbar, Button, BottomInfo, Txt, Badge, PressableEffect } from '@toss/tds-react-native';
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
  const [selectedThemeId, setSelectedThemeId] = useState(THEMES[0]!.id);
  const theme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0]!;
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [aiReading, setAiReading] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleThemeSelect = (t: typeof THEMES[0]) => {
    setSelectedThemeId(t.id);
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
      const [c1, c2, c3, c4] = cards;
      if (!c1 || !c2 || !c3 || !c4) throw new Error('Invalid cards');
      const prompt = `당신은 신비로운 타로 마스터입니다.
사용자의 2026년 신년 운세를 '${t.label}' 테마 중심으로 해석해주세요.

1. 초반 (1~4월): ${c1.card.koreanName} (${c1.isReversed ? '역방향' : '정방향'})
2. 중반 (5~8월): ${c2.card.koreanName} (${c2.isReversed ? '역방향' : '정방향'})
3. 후반 (9~12월): ${c3.card.koreanName} (${c3.isReversed ? '역방향' : '정방향'})
4. 전체 조언: ${c4.card.koreanName} (${c4.isReversed ? '역방향' : '정방향'})

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
      <PageNavbar>
        <PageNavbar.Title>2026년 신년운세</PageNavbar.Title>
        <PageNavbar.AccessoryButtons>
          <PageNavbar.AccessoryTextButton onPress={() => navigation.goBack()}>
            뒤로
          </PageNavbar.AccessoryTextButton>
        </PageNavbar.AccessoryButtons>
      </PageNavbar>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Txt style={{ fontSize: 48 }}>🎇</Txt></View>
            <Txt style={s.title}>2026년 신년운세</Txt>
            <Txt style={s.desc}>당신의 2026년은 어떤 모습일까요?{'\n'}연애, 재물, 커리어... 가장 궁금한 테마를 선택해 집중적으로 알아보세요. 4장의 카드가 1년의 흐름을 명확히 보여드립니다.</Txt>
          </View>
        )}

        {step === 'theme' && (
          <View style={s.section}>
            <Txt style={s.title}>보고 싶은 테마를 선택하세요</Txt>
            <Txt style={s.subText}>한 해 운세를 알려줄게요 🎇</Txt>
            {THEMES.map((t) => (
              <PressableEffect key={t.id} style={s.themeBtn} onPress={() => handleThemeSelect(t)}>
                <Txt style={{ fontSize: 24 }}>{t.emoji}</Txt>
                <View style={{ flex: 1 }}>
                  <Txt style={s.themeName}>{t.label}</Txt>
                  <Txt style={s.themeDesc}>{t.label}을 중심으로 2026년을 미리봅니다.</Txt>
                </View>
                <Txt style={{ color: 'rgba(218,165,32,0.5)', fontSize: 20 }}>→</Txt>
              </PressableEffect>
            ))}
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <View style={s.themeTag}>
              <Badge type="yellow" badgeStyle="fill" size="large">{theme.emoji} {theme.label}</Badge>
            </View>
            <Txt style={s.title}>4장을 하나씩 선택해주세요</Txt>
            <Txt style={s.subText}>선택됨: {selectedCards.length}/4</Txt>
            <View style={s.cardGrid}>
              {[...Array(12)].map((_, idx) => (
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
            <Txt style={[s.subText, { color: '#DAA520' }]}>{theme.emoji} 2026년 {theme.label} 리포트</Txt>
            <View style={s.resultCardGrid}>
              {drawnCards.map((c, i) => (
                <PressableEffect key={i} style={{ alignItems: 'center', width: (width - 60) / 2 - 6 }} onPress={() => handleReveal(i)}>
                  <Txt style={s.posLabel}>{LABELS[i]}</Txt>
                  {revealedCards.includes(i) ? (
                    <Image source={c.card.image} style={[s.resultCard, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  ) : (
                    <View style={s.resultCardBack}><Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 10 }} resizeMode="cover" /></View>
                  )}
                  {revealedCards.includes(i) && <Txt style={s.cardName}>{c.card.koreanName}</Txt>}
                </PressableEffect>
              ))}
            </View>

            {revealedCards.length === 4 && (
              <View style={s.resultBox}>
                {isAnalyzing ? (
                  <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color="#818cf8" />
                    <Txt style={s.loadingText}>{theme.label} 흐름을 읽고 있습니다...</Txt>
                  </View>
                ) : (
                  <>
                    <Txt style={s.readingText}>{aiReading}</Txt>
                    <PressableEffect style={s.mainBtn} onPress={reset}>
                      <Txt style={s.mainBtnText}>한번 더 뽑기</Txt>
                    </PressableEffect>
                  </>
                )}
              </View>
            )}
            {revealedCards.length < 4 && (
              <Txt style={s.subText}>카드를 터치해서 하나씩 뒤집어보세요 ✨</Txt>
            )}
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
                backgroundColor: '#DAA520',
                borderRadius: 16,
                height: 56,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => setStep('theme')}
            >
              <Txt style={{ color: '#000', fontSize: 17, fontWeight: '800' }}>2026년 운세보기</Txt>
            </PressableEffect>
          </View>
        )
      }
    </View >
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
  fixedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(8,8,16,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
});

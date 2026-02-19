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

export const Route = createRoute('/tarot/yearly', { component: YearlyFortune });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'input' | 'spread' | 'result';
const SEASONS = ['🌸 봄 (1-3월)', '☀️ 여름 (4-6월)', '🍂 가을 (7-9월)', '❄️ 겨울 (10-12월)'];

function YearlyFortune() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('intro');
  const [name, setName] = useState('');
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [aiReading, setAiReading] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 4) {
      const cards = getRandomCards(4);
      setDrawnCards(cards);
      setStep('result');
      // Auto-reveal sequentially
      [0, 1, 2, 3].forEach((i) => {
        setTimeout(() => {
          setRevealedCards(prev => prev.includes(i) ? prev : [...prev, i]);
        }, i * 700 + 400);
      });
      fetchReading(cards);
    }
  };

  const fetchReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    setIsAnalyzing(true);
    try {
      const prompt = `당신은 전문 타로 마스터입니다.
${name || '방문자'}님의 2026년 신년 운세를 사계절 4장의 카드로 해석해주세요.

🌸 봄 (1~3월): ${cards[0]?.card.koreanName ?? '?'} (${cards[0]?.isReversed ? '역방향' : '정방향'})
☀️ 여름 (4~6월): ${cards[1]?.card.koreanName ?? '?'} (${cards[1]?.isReversed ? '역방향' : '정방향'})
🍂 가을 (7~9월): ${cards[2]?.card.koreanName ?? '?'} (${cards[2]?.isReversed ? '역방향' : '정방향'})
❄️ 겨울 (10~12월): ${cards[3]?.card.koreanName ?? '?'} (${cards[3]?.isReversed ? '역방향' : '정방향'})

요청사항:
- 각 계절별 핵심 흐름과 기회를 설명해주세요.
- 종합 한 해 운세와 가장 주의할 시기 언급.
- 희망차고 구체적인 실행 조언 포함.
- 이모지 적절히 사용.`;
      const result = await callGemini(prompt);
      setAiReading(result);
    } catch {
      setAiReading('AI 마스터와의 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => { setStep('input'); setDrawnCards([]); setRevealedCards([]); setAiReading(''); setSelectedCards([]); };

  return (
    <View style={s.container}>
      <PageNavbar>
        <PageNavbar.Title>2026년 운명의 흐름</PageNavbar.Title>
        <PageNavbar.AccessoryButtons>
          <PageNavbar.AccessoryTextButton onPress={() => navigation.goBack()}>
            뒤로
          </PageNavbar.AccessoryTextButton>
        </PageNavbar.AccessoryButtons>
      </PageNavbar>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {step === 'intro' && (
          <View style={s.center}>
            <View style={s.iconCircle}><Txt style={{ fontSize: 48 }}>🗓️</Txt></View>
            <Txt style={s.title}>2026년{'\n'}운명의 흐름</Txt>
            <Txt style={s.desc}>다가오는 한 해, 당신에게는 어떤 일들이 기다리고 있을까요?{'\n'}봄, 여름, 가을, 겨울 사계절의 흐름을 4장의 카드로 분석하여{'\n'}성공과 행복을 위한 종합 가이드를 제시해 드립니다.</Txt>
          </View>
        )}

        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.title}>이름을 입력해주세요</Txt>
            <TextInput style={s.input} value={name} onChangeText={setName}
              placeholder="홍길동" placeholderTextColor="rgba(52,211,153,0.4)" />
            <Button
              size="large"
              type="primary"
              style="fill"
              disabled={name.trim().length < 2}
              containerStyle={{ backgroundColor: '#34d399', borderRadius: 30, height: 56, width: '100%', opacity: name.trim().length < 2 ? 0.5 : 1, alignItems: 'center', justifyContent: 'center' }}
              textStyle={{ color: '#000', fontSize: 17, fontWeight: '800' }}
              onPress={() => { if (name.trim().length >= 2) setStep('spread'); }}
            >
              운세 카드 뽑기
            </Button>
          </View>
        )}

        {step === 'spread' && (
          <View style={s.section}>
            <Txt style={s.title}>나의 2026년을 상상하며{'\n'}4장의 카드를 골라주세요</Txt>
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
            <Txt style={s.resultNameTitle}>{name}님의 2026년 운세 리포트</Txt>
            <View style={s.seasonGrid}>
              {drawnCards.map((c, i) => (
                <View key={i} style={{ alignItems: 'center', width: (width - 60) / 2 - 6 }}>
                  <Txt style={s.seasonLabel}>{SEASONS[i]}</Txt>
                  {revealedCards.includes(i) ? (
                    <Image source={c.card.image}
                      style={[s.seasonCard, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                  ) : (
                    <View style={[s.seasonCard, s.cardBack]}><Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" /></View>
                  )}
                  {revealedCards.includes(i) && <Txt style={s.cardName}>{c.card.koreanName}</Txt>}
                </View>
              ))}
            </View>

            {revealedCards.length === 4 && (
              <View style={s.resultBox}>
                <Txt style={s.resultBoxTitle}>✨ 종합 분석</Txt>
                {isAnalyzing ? (
                  <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color="#34d399" />
                    <Txt style={s.loadingText}>AI 마스터가 한 해의 운명을 엮고 있습니다...</Txt>
                  </View>
                ) : (
                  <>
                    <Txt style={s.readingText}>{aiReading}</Txt>
                    <Button
                      size="medium"
                      type="primary"
                      style="weak"
                      containerStyle={{ borderColor: 'rgba(52,211,153,0.3)', borderWidth: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                      textStyle={{ color: '#34d399' }}
                      onPress={reset}
                    >
                      한번 더 뽑기
                    </Button>
                  </>
                )}
              </View>
            )}
            {revealedCards.length < 4 && (
              <Txt style={s.subText}>카드가 자동으로 뒤집히고 있습니다... ✨</Txt>
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
                backgroundColor: '#34d399',
                borderRadius: 30,
                height: 56,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => setStep('input')}
            >
              <Txt style={{ color: '#000', fontSize: 17, fontWeight: '800' }}>신년운세 시작하기</Txt>
            </PressableEffect>
          </View>
        )
      }
    </View >
  );
}

const BG = '#031008';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#a7f3d0' },
  scroll: { padding: 20, paddingBottom: 120 },
  center: { alignItems: 'center', paddingTop: 20, gap: 16 },
  section: { gap: 14 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(52,211,153,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 32 },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22 },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', borderRadius: 12, padding: 14, fontSize: 16, color: '#fff' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  cardBack: { width: (width - 80) / 4, aspectRatio: 0.65, borderRadius: 8, backgroundColor: 'rgba(52,211,153,0.05)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)', justifyContent: 'center', alignItems: 'center' },
  cardSelected: { backgroundColor: 'rgba(52,211,153,0.25)', borderColor: '#34d399' },
  resultNameTitle: { fontSize: 18, fontWeight: '800', color: '#a7f3d0', textAlign: 'center' },
  seasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  seasonLabel: { fontSize: 11, color: 'rgba(52,211,153,0.8)', fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  seasonCard: { width: (width - 60) / 2 - 6, height: ((width - 60) / 2 - 6) * 1.5, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
  cardName: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(52,211,153,0.15)', gap: 14 },
  resultBoxTitle: { fontSize: 16, fontWeight: '700', color: '#6ee7b7' },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { color: 'rgba(52,211,153,0.7)', fontSize: 13, textAlign: 'center' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
  fixedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(3,16,8,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.2)' },
});

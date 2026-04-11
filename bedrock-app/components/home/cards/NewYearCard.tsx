import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { getWeightedCards, TarotCardData } from '../../../lib/tarot-data';
import { callGemini } from '../../../lib/gemini';
import { useDrawLimit } from '../../../lib/useDrawLimit';
import { shareTarotResult } from '../../../lib/useTossShare';
import { PaymentInductionModal } from '../../PaymentInductionModal';
import { CardFanSpread } from '../../CardFanSpread';
import { TarotResultCard } from '../../TarotResultCard';

const ACCENT = '#DAA520';
const BG = '#14141a';

const NEW_YEAR_GOALS = ['💰 자산 형성', '❤️ 운명적 만용', '💼 커리어 점프', '🌿 건강과 힐링', '🎓 자기계발'];

type Step = 'input' | 'spread' | 'result';

interface NewYearCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const NewYearCard: React.FC<NewYearCardProps> = ({ onOpenChat, onTokenChange }) => {
  const [step, setStep] = useState<Step>('input');
  const [goal, setGoal] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('newYear', 1);

  const nextYear = new Date().getFullYear() + 1;

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 5) {
      setTimeout(() => {
        const cards = getWeightedCards(5, { major: 2 });
        setDrawnCards(cards);
        setStep('result');
        generateReading(cards);
      }, 600);
    }
  };

  const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    if (!canDraw) { setShowDrawModal(true); return; }
    recordDraw();
    setIsLoading(true);
    try {
      const [all, love, money, work, health] = cards;
      const prompt = `당신은 한 해의 커다란 흐름을 짚어주는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 위엄 있으면서도 따뜻한 편지 형식으로 작성하세요.

${nextYear}년의 목표: ${goal}

1. 전체적인 흐름: ${all?.card.koreanName} (${all?.isReversed ? '역방향' : '정방향'})
2. 사랑과 관계: ${love?.card.koreanName} (${love?.isReversed ? '역방향' : '정방향'})
3. 풍요와 재물: ${money?.card.koreanName} (${money?.isReversed ? '역방향' : '정방향'})
4. 일과 커리어: ${work?.card.koreanName} (${work?.isReversed ? '역방향' : '정방향'})
5. 활력과 건강: ${health?.card.koreanName} (${health?.isReversed ? '역방향' : '정방향'})

🎇 **${nextYear}년, 당신을 기다리는 운명의 파동**
💰 **재물과 커리어의 기회**
❤️ **사랑과 인연의 흐름**
🌿 **심신의 평화와 건강**
✨ **${nextYear}년을 승리로 이끌 당신만의 한 줄** "[감성 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setGoal('');
    setSelectedCards([]); setDrawnCards([]); setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>🎇</Txt>
        <Txt style={s.headerTitle}>{nextYear}년 신년운세</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>🎯 {nextYear}년 가장 이루고 싶은 목표</Txt>
            <View style={s.chipRow}>
              {NEW_YEAR_GOALS.map(v => (
                <PressableEffect key={v} style={[s.chip, goal === v && s.chipActive]} onPress={() => setGoal(v)}>
                  <Txt style={[s.chipText, goal === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <TextInput
              style={s.textInput} value={goal} onChangeText={setGoal}
              placeholder="직접 입력..." placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <Txt style={s.aiNotice}>✨ 매년 찾아오는 신년 운세를 미리 확인해보세요.</Txt>
          </View>
        )}

        {step === 'spread' && (
          <CardFanSpread
            cardCount={18} maxSelect={5}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            accentColor={ACCENT} compact
          />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cardRow}>
              {drawnCards.map((c, i) => (
                <TarotResultCard key={i} card={c.card} isReversed={c.isReversed}
                  isRevealed label={['전체', '연애', '금전', '직장', '건강'][i] || ''} onFlip={() => {}}
                  cardWidth={70} cardHeight={110} />
              ))}
            </ScrollView>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={[s.loadingText, { color: ACCENT }]}>솜이가 새해의 지도를 그리고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={[s.shareBtn, { backgroundColor: ACCENT }]}
                onPress={() => shareTarotResult(`${nextYear}년 신년운세`, reading.slice(0, 60) + '...')}>
                <Txt style={s.shareBtnText}>💌 결과 공유하기</Txt>
              </PressableEffect>
            )}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={[s.drawBtn, { backgroundColor: ACCENT }, !goal.trim() && s.btnDisabled]}
            disabled={!goal.trim()} onPress={() => setStep('spread')}>
            <Txt style={s.drawBtnText}>✨ 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="신년 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(218,165,32,0.2)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(218,165,32,0.35)' },
  resetText: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 16, paddingBottom: 120, gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', backgroundColor: 'rgba(218,165,32,0.06)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, color: 'rgba(218,165,32,0.85)', fontWeight: '600' },
  chipTextActive: { color: '#000' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.25)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff' },
  cardRow: { flexDirection: 'row', marginBottom: 12 },
  aiNotice: { fontSize: 11, color: 'rgba(218,165,32,0.45)', textAlign: 'center', marginTop: 4 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(218,165,32,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 24 },
  shareBtn: { borderRadius: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: Platform.OS === "ios" ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(218,165,32,0.15)' },
  drawBtn: { borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.35 },
  drawBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

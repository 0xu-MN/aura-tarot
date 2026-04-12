import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { getWeightedCards, TarotCardData } from '../../../lib/tarot-data';
import { callGemini } from '../../../lib/gemini';
import { useDrawLimit } from '../../../lib/useDrawLimit';
import { shareTarotResult } from '../../../lib/useTossShare';
import { PaymentInductionModal } from '../../PaymentInductionModal';
import { CardFanSpread } from '../../CardFanSpread';
import { TarotResultCard } from '../../TarotResultCard';
import { Haptic } from '../../../lib/haptic';

const ACCENT = '#DAA520';
const BG = '#14141a';

const FOCUS_AREAS = ['💕 연애·관계', '💰 금전·재물', '💼 직장·커리어', '📚 학업·시험', '🌿 건강·일상', '✨ 이달 전반'];
const MOOD_OPTIONS = ['😊 기대돼요', '😐 평범해요', '😰 걱정돼요', '💫 설레요', '😔 우울해요'];
const MONTH_PHASES = ['이달의 흐름', '상반기 핵심', '하반기 핵심', '이달의 기회', '이달의 주의'];

type Step = 'input' | 'spread' | 'result';

interface MonthlyCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
  tokenBalance?: number;
}

export const MonthlyCard: React.FC<MonthlyCardProps> = ({ onOpenChat, onTokenChange, tokenBalance }) => {
  const [step, setStep] = useState<Step>('input');
  const [focus, setFocus] = useState('');
  const [mood, setMood] = useState('');
  const [customFocus, setCustomFocus] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, isChecking, checkLimit, freeUsage, userTokens } = useDrawLimit('monthly', 2, 0);

  React.useEffect(() => {
    checkLimit();
  }, [tokenBalance, checkLimit]);

  const now = new Date();
  const monthStr = `${now.getMonth() + 1}월`;

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    Haptic.impact();
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 5) {
      setTimeout(() => {
        const cards = getWeightedCards(5, {});
        setDrawnCards(cards);
        setStep('result');
        generateReading(cards);
      }, 600);
    }
  };

  const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    if (!canDraw) { setShowDrawModal(true); return; }
    const consumed = await recordDraw();
    if (consumed > 0) onTokenChange?.();
    setIsLoading(true);
    try {
      const cardDesc = cards.map((c, i) => `${MONTH_PHASES[i]}: ${c.card.koreanName} (${c.isReversed ? '역방향' : '정방향'})`).join('\n');
      const prompt = `당신은 한 달의 에너지 흐름을 읽는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 자연스러운 편지 형식으로 작성하세요.

이달 집중 분야: ${focus || '전반'}
이달 시작 기분: ${mood || '평범해요'}

${monthStr} 타로 배열:
${cardDesc}

🌕 **${monthStr}의 전체 흐름과 주요 테마**
📆 **상반기·하반기 핵심 포인트**
🌟 **이달의 기회와 주의 사항**
🎁 **${monthStr} 행운 키트** • 행운의 컬러: ... • 행운의 행동: ...
✨ **${monthStr}을 함께할 한 줄** "[감성 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setFocus(''); setMood(''); setCustomFocus('');
    setSelectedCards([]); setDrawnCards([]); setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>🌕</Txt>
        <Txt style={s.headerTitle}>{monthStr} 운세</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}
            style={s.section}
          >
            <Txt style={s.label}>🔍 이달 집중 분야</Txt>
            <View style={s.chipRow}>
              {FOCUS_AREAS.map(v => (
                <PressableEffect key={v} style={[s.chip, focus === v && s.chipActive]} onPress={() => setFocus(v)}>
                  <Txt style={[s.chipText, focus === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>😊 이달 시작하는 기분</Txt>
            <View style={s.chipRow}>
              {MOOD_OPTIONS.map(v => (
                <PressableEffect key={v} style={[s.chip, mood === v && s.chipActive]} onPress={() => setMood(v)}>
                  <Txt style={[s.chipText, mood === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>

            <Txt style={s.label}>✨ 한 달 동안 특별히 바라는 점</Txt>
            <TextInput
              style={s.textInput} value={customFocus} onChangeText={setCustomFocus}
              placeholder="이번 달에 꼭 이루고 싶은 일이나 고민을 적어주세요..." placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
            />

            <Txt style={s.aiNotice}>✨ 생성형 AI 기술을 기반으로 한 분석입니다.</Txt>
          </KeyboardAvoidingView>
        )}

        {step === 'spread' && (
          <CardFanSpread cardCount={15} maxSelect={5} selectedCards={selectedCards}
            onCardSelect={handleCardSelect} accentColor={ACCENT} compact />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {drawnCards.map((c, i) => (
                  <TarotResultCard key={i} card={c.card} isReversed={c.isReversed}
                    isRevealed label={MONTH_PHASES[i] || ''} onFlip={() => { }}
                    cardWidth={72} cardHeight={112} />
                ))}
              </View>
            </ScrollView>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={s.loadingText}>솜이가 이달 흐름을 읽고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={s.shareBtn}
                onPress={() => shareTarotResult(`${monthStr} 운세`, reading.slice(0, 60) + '...')}>
                <Txt style={s.shareBtnText}>💌 결과 공유하기</Txt>
              </PressableEffect>
            )}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={s.drawBtn} onPress={() => setStep('spread')}>
            <Txt style={s.drawBtnText}>🌕 5장 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="월간 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(218,165,32,0.15)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(218,165,32,0.35)' },
  resetText: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 12, paddingBottom: 80, gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', backgroundColor: 'rgba(218,165,32,0.06)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, color: 'rgba(218,165,32,0.8)', fontWeight: '600' },
  chipTextActive: { color: '#000' },
  aiNotice: { fontSize: 11, color: 'rgba(218,165,32,0.45)', textAlign: 'center', marginTop: 4 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.25)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff', marginTop: 4 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, color: 'rgba(218,165,32,0.7)', textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(218,165,32,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 24 },
  shareBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  footer: { padding: 12, paddingBottom: Platform.OS === "ios" ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(218,165,32,0.15)' },
  drawBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
  drawBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

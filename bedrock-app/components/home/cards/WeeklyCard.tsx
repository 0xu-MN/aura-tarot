import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform } from 'react-native';
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

const FOCUS_AREAS = ['💕 연애·관계', '💰 금전·재물', '💼 직장·커리어', '📚 학업·시험', '🌿 건강·일상', '✨ 전반적 운세'];
const MOOD_OPTIONS = ['😊 기대돼요', '😐 평범해요', '😰 걱정돼요', '💫 설레요', '😔 우울해요'];
const CARD_LABELS = ['월', '화', '수', '목', '금·주말'];

type Step = 'input' | 'spread' | 'result';

interface WeeklyCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const WeeklyCard: React.FC<WeeklyCardProps> = ({ onOpenChat, onTokenChange }) => {
  const [step, setStep] = useState<Step>('input');
  const [focus, setFocus] = useState('');
  const [mood, setMood] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('weekly', 2);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
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
    recordDraw();
    setIsLoading(true);
    try {
      const cardDesc = cards.map((c, i) => `${CARD_LABELS[i]}: ${c.card.koreanName} (${c.isReversed ? '역방향' : '정방향'})`).join('\n');
      const prompt = `당신은 이번 주의 에너지 흐름을 읽는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 자연스러운 편지 형식으로 작성하세요.

집중 분야: ${focus || '전반적 운세'}
이번 주 출발 기분: ${mood || '평범해요'}

이번 주 카드:
${cardDesc}

📅 **이번 주 전체 에너지 흐름**
🌟 **요일별 핵심 포인트** (각 요일별로 1~2줄씩)
💡 **이번 주 가장 중요한 날과 그 이유**
🎁 **이번 주 행운 키트** • 행운의 컬러: ... • 행운의 행동: ...
✨ **이번 주 책상에 붙여둘 한 줄** "[감성 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setFocus(''); setMood('');
    setSelectedCards([]); setDrawnCards([]); setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>📅</Txt>
        <Txt style={s.headerTitle}>주간 운세</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>🔍 이번 주 집중 분야</Txt>
            <View style={s.chipRow}>
              {FOCUS_AREAS.map(v => (
                <PressableEffect key={v} style={[s.chip, focus === v && s.chipActive]} onPress={() => setFocus(v)}>
                  <Txt style={[s.chipText, focus === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>😊 이번 주 시작하는 기분</Txt>
            <View style={s.chipRow}>
              {MOOD_OPTIONS.map(v => (
                <PressableEffect key={v} style={[s.chip, mood === v && s.chipActive]} onPress={() => setMood(v)}>
                  <Txt style={[s.chipText, mood === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.aiNotice}>✨ 생성형 AI 기술을 기반으로 한 분석입니다.</Txt>
          </View>
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
                    isRevealed label={CARD_LABELS[i] || ''} onFlip={() => {}}
                    cardWidth={72} cardHeight={112} />
                ))}
              </View>
            </ScrollView>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={s.loadingText}>솜이가 이번 주 흐름을 읽고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={s.shareBtn}
                onPress={() => shareTarotResult('주간 운세', reading.slice(0, 60) + '...')}>
                <Txt style={s.shareBtnText}>💌 결과 공유하기</Txt>
              </PressableEffect>
            )}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={s.drawBtn} onPress={() => setStep('spread')}>
            <Txt style={s.drawBtnText}>📅 5장 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="주간 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(218,165,32,0.15)' },
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
  chipText: { fontSize: 12, color: 'rgba(218,165,32,0.8)', fontWeight: '600' },
  chipTextActive: { color: '#000' },
  aiNotice: { fontSize: 11, color: 'rgba(218,165,32,0.45)', textAlign: 'center', marginTop: 4 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, color: 'rgba(218,165,32,0.7)', textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(218,165,32,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 24 },
  shareBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: Platform.OS === "ios" ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(218,165,32,0.15)' },
  drawBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
  drawBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

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

const ACCENT = '#34d399';
const BG = '#14141a';

const YEAR_FOCUS = ['🚀 커리어 성장', '💰 자산 증식', '💑 인연과 결혼', '🎓 합격과 학업', '🌿 평온한 일상'];

type Step = 'input' | 'spread' | 'result';

interface YearlyCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const YearlyCard: React.FC<YearlyCardProps> = ({ onOpenChat, onTokenChange }) => {
  const [step, setStep] = useState<Step>('input');
  const [focus, setFocus] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('yearly', 1);

  const currentYear = new Date().getFullYear();

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 12) {
      setTimeout(() => {
        const cards = getWeightedCards(12, {});
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
      const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
      const cardDesc = cards.map((c, i) => `${monthNames[i]}: ${c.card.koreanName} (${c.isReversed ? '역방향' : '정방향'})`).join('\n');

      const prompt = `당신은 1년의 방대한 운명을 조율하는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 서사적이고 아름다운 편지 형식으로 작성하세요.

${currentYear}년의 메인 포커스: ${focus}

12개월의 타로 배치:
${cardDesc}

📅 **${currentYear}년, 당신의 12달 여정**
📆 **상반기(1~6월)의 핵심 흐름**
📆 **하반기(7~12월)의 핵심 흐름**
🌟 **당신의 키워드에 따른 최고의 기회의 달**
✨ **1년을 통과할 당신을 위한 단 하나의 문장** "[감성 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setFocus('');
    setSelectedCards([]); setDrawnCards([]); setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>🗓️</Txt>
        <Txt style={s.headerTitle}>{currentYear}년 연간 운세</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>🎯 올해 가장 집중하고 싶은 에너지</Txt>
            <View style={s.chipRow}>
              {YEAR_FOCUS.map(v => (
                <PressableEffect key={v} style={[s.chip, focus === v && s.chipActive]} onPress={() => setFocus(v)}>
                  <Txt style={[s.chipText, focus === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <TextInput
              style={s.textInput} value={focus} onChangeText={setFocus}
              placeholder="직접 입력..." placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <Txt style={s.aiNotice}>✨ 12장의 카드로 1년의 흐름을 한눈에 살펴보세요.</Txt>
          </View>
        )}

        {step === 'spread' && (
          <CardFanSpread
            cardCount={24} maxSelect={12}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            accentColor={ACCENT} compact
          />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cardRow}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {drawnCards.map((c, i) => (
                  <TarotResultCard key={i} card={c.card} isReversed={c.isReversed}
                    isRevealed label={`${i + 1}월`} onFlip={() => { }}
                    cardWidth={60} cardHeight={96} />
                ))}
              </View>
            </ScrollView>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={[s.loadingText, { color: ACCENT }]}>솜이가 1년의 지도를 그리고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={[s.shareBtn, { backgroundColor: ACCENT }]}
                onPress={() => shareTarotResult(`${currentYear}년 연간 운세`, reading.slice(0, 60) + '...')}>
                <Txt style={[s.shareBtnText, { color: '#000' }]}>💌 결과 공유하기</Txt>
              </PressableEffect>
            )}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={[s.drawBtn, { backgroundColor: ACCENT }, !focus.trim() && s.btnDisabled]}
            disabled={!focus.trim()} onPress={() => setStep('spread')}>
            <Txt style={[s.drawBtnText, { color: '#000' }]}>🗓️ 12장 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="연간 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.2)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(52,211,153,0.35)' },
  resetText: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 16, paddingBottom: 120, gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.06)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, color: 'rgba(52,211,153,0.85)', fontWeight: '600' },
  chipTextActive: { color: '#000' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff' },
  cardRow: { flexDirection: 'row', marginBottom: 12 },
  aiNotice: { fontSize: 11, color: 'rgba(52,211,153,0.45)', textAlign: 'center', marginTop: 4 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(52,211,153,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 24 },
  shareBtn: { borderRadius: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { fontSize: 14, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: Platform.OS === "ios" ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.15)' },
  drawBtn: { borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.35 },
  drawBtnText: { fontSize: 16, fontWeight: '800' },
});

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

import { useAuthContext } from '../../../context/AuthContext';
import { saveReading } from '../../../lib/storage';

const ACCENT = '#a78bfa';
const ACCENT2 = '#7c3aed';
const BG = '#0e0b1a';       // 보라 계열 어두운 배경
const BG_CARD = '#130f23';
const HEADER_BG = '#1a1230';

type Step = 'input' | 'spread' | 'result';

interface DailyCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const DailyCard: React.FC<DailyCardProps> = ({ onOpenChat, onTokenChange }) => {
  const { user } = useAuthContext();
  const [step, setStep] = useState<Step>('input');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);

  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('daily', 1);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);

    if (next.length === 1) {
      setTimeout(() => {
        const cards = getWeightedCards(1);
        setDrawnCards(cards);
        setStep('result');
        generateReading(cards);
      }, 600);
    }
  };

  const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    if (!canDraw) {
      setShowDrawModal(true);
      return;
    }

    recordDraw();
    setIsLoading(true);
    try {
      const card = cards[0];
      const finalQuestion = question.trim() || '오늘 나의 운세는 어떨까?';
      const prompt = `당신은 다정한 타로 상담사 '솜이'입니다. 오늘 하루의 운세를 읽어주세요.

[절대 규칙]
- 마크다운 기호(**, ##, * 등) 절대 사용 금지
- 번호 목록(1. 2. 3.) 형식 금지
- AI처럼 딱딱하거나 구조화된 답변 금지
- 반드시 친구에게 보내는 따뜻하고 자연스러운 편지체로 작성

질문: ${finalQuestion}
뽑은 카드: ${card?.card.koreanName} (${card?.isReversed ? '역방향' : '정방향'})

카드의 에너지와 상징을 바탕으로, 오늘 하루 이 사람에게 필요한 메시지를 3~4문단의 자연스러운 흐름으로 전해주세요. 마지막엔 따뜻한 응원 한 마디로 마무리.
`;
      
      const result = await callGemini(prompt);
      setReading(result);

      // 기록 저장
      saveReading({ question: finalQuestion, cards, interpretation: result }, user?.userId);
    } catch (e) {
      setReading('별의 메시지를 불러오지 못했어요. 잠시 후 다시 시도해볼까요? ✨');
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 부족 여부와 상관없이 먼저 뽑게 하고, 결과창에서 모달 표시
  const handleCardSelectLazy = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);

    if (next.length === 1) {
      const cards = getWeightedCards(1);
      setDrawnCards(cards);
      setStep('result');

      if (!canDraw) {
        // 토큰 없으면 결과창 진입 후 모달 표시
        setTimeout(() => setShowDrawModal(true), 400);
      } else {
        generateReading(cards);
      }
    }
  };

  const handleReset = () => {
    setStep('input');
    setQuestion('');
    setSelectedCards([]);
    setDrawnCards([]);
    setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>✨</Txt>
        <Txt style={s.headerTitle}>오늘의 운세</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>오늘 무엇이 궁금하신가요?</Txt>
            <View style={s.chipRow}>
              {['오늘 전체 운세', '오늘의 행운 키워드', '오늘 조심할 점', '오늘 연애 기운', '오늘 직장/학업 에너지'].map(q => (
                <PressableEffect key={q} style={[s.chip, question === q && s.chipActive]} onPress={() => setQuestion(q)}>
                  <Txt style={[s.chipText, question === q && s.chipTextActive]}>{q}</Txt>
                </PressableEffect>
              ))}
            </View>
            <TextInput
              style={s.textInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="또는 오늘의 고민을 직접 입력해보세요..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
            />
            <Txt style={s.aiNotice}>✨ 생성형 AI 기반 분석이에요.</Txt>
          </View>
        )}

        {step === 'spread' && (
          <CardFanSpread
            cardCount={10}
            maxSelect={1}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelectLazy}
            accentColor={ACCENT}
            compact
          />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <View style={s.resultCardRow}>
              {drawnCards.map((c, i) => (
                <TarotResultCard
                  key={i}
                  card={c.card}
                  isReversed={c.isReversed}
                  isRevealed
                  label="오늘의 카드"
                  onFlip={() => {}}
                  cardWidth={120}
                  cardHeight={180}
                />
              ))}
            </View>

            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={s.loadingText}>솜이가 카드를 해석하고 있어요...</Txt>
              </View>
            ) : reading ? (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            ) : null}

            {!isLoading && reading ? (
              <View style={s.actionBtns}>
                <PressableEffect
                  style={s.shareBtn}
                  onPress={() => shareTarotResult('오늘의 운세', reading.slice(0, 50) + '...')}
                >
                  <Txt style={s.shareBtnText}>💌 오늘의 운세 공유하기</Txt>
                </PressableEffect>
                <PressableEffect style={s.reDrawBtn} onPress={handleReset}>
                  <Txt style={s.reDrawBtnText}>🔮 한 번 더 뽑기</Txt>
                </PressableEffect>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect
            style={s.drawBtn}
            onPress={() => setStep('spread')}
          >
            <Txt style={s.drawBtnText}>✨ 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="오늘의 운세"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: HEADER_BG, borderBottomWidth: 1, borderBottomColor: 'rgba(167,139,250,0.1)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  resetText: { fontSize: 11, color: 'rgba(167,139,250,0.7)', fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 16, paddingBottom: 120, gap: 12 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)', backgroundColor: 'rgba(167,139,250,0.05)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 11, color: 'rgba(167,139,250,0.7)', fontWeight: '600' },
  chipTextActive: { color: '#180f2e' },
  textInput: { backgroundColor: 'rgba(167,139,250,0.06)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff', minHeight: 48 },
  aiNotice: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 4 },
  resultCardRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 30 },
  loadingText: { fontSize: 14, color: 'rgba(167,139,250,0.7)', textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(167,139,250,0.06)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 26 },
  actionBtns: { gap: 10, marginTop: 4 },
  shareBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 48, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#180f2e', fontSize: 14, fontWeight: '800' },
  reDrawBtn: { backgroundColor: 'rgba(167,139,250,0.12)', borderRadius: 30, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  reDrawBtnText: { color: ACCENT, fontSize: 14, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(167,139,250,0.08)' },
  drawBtn: { backgroundColor: ACCENT2, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center' },
  drawBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

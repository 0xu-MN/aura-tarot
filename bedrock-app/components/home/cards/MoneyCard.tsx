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

// 골드/앰버 테마 - 금전/재물 컨셉
const ACCENT = '#F59E0B';
const ACCENT2 = '#92400E';
const BG = '#0f0e06';
const HEADER_BG = '#1a1700';

const MONEY_SITUATIONS = ['💰 수입/지출 관리', '📈 투자/재테크', '💸 빚/채무 해결', '🏠 부동산 운', '✨ 사업/창업 자금'];
const AI_QUESTIONS = [
  '지금 내 금전운 흐름은 어떤가요?',
  '이 투자, 해도 괜찮을까요?',
  '언제쯤 돈이 들어올까요?',
  '재물을 부르려면 어떻게 해야 할까요?',
  '돈 나갈 일이 있을까요? 조심할 게 있나요?',
];

type Step = 'input' | 'spread' | 'result';

interface MoneyCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const MoneyCard: React.FC<MoneyCardProps> = ({ onOpenChat, onTokenChange }) => {
  const { user } = useAuthContext();
  const [step, setStep] = useState<Step>('input');
  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('money', 2);

  const handleCardSelectLazy = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 3) {
      const cards = getWeightedCards(3, { pentacles: 4, major: 2, swords: 1 });
      setDrawnCards(cards);
      setStep('result');
      if (!canDraw) {
        setTimeout(() => setShowDrawModal(true), 400);
      } else {
        generateReading(cards);
      }
    }
  };

  const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
    recordDraw();
    setIsLoading(true);
    try {
      const [c1, c2, c3] = cards;
      const prompt = `당신은 재물과 풍요의 에너지를 읽는 타로 리더 '솜이'입니다.

[절대 규칙]
- 마크다운 기호(**, ##, __ 등) 절대 사용 금지
- 번호 목록(1. 2. 3.) 형식 금지
- 섹션 제목이나 구조화된 포맷 금지
- 따뜻하고 현실적인 조언을 담아, 자연스러운 대화체로만 작성

상황: ${situation || '금전 전반'}
고민: ${question || '지금 나의 금전 흐름은 어떤가요?'}

카드 배치:
- 현재 금전 흐름: ${c1?.card.koreanName} (${c1?.isReversed ? '역방향' : '정방향'})
- 기회와 위기: ${c2?.card.koreanName} (${c2?.isReversed ? '역방향' : '정방향'})
- 결과 및 조언: ${c3?.card.koreanName} (${c3?.isReversed ? '역방향' : '정방향'})

세 장의 카드가 말하는 금전 에너지를 이어지는 이야기처럼 4~5문단으로 자연스럽게 써주세요. 마지막엔 실용적인 한 마디 조언으로 마무리.`;
      const result = await callGemini(prompt);
      setReading(result);
      saveReading({ question: question || situation || '재물운 타로', cards, interpretation: result }, user?.userId);
    } catch {
      setReading('황금빛 기운이 잠시 흩어졌어요. 다시 시도해주세요. ✨');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setQuestion(''); setSituation('');
    setSelectedCards([]); setDrawnCards([]); setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>💰</Txt>
        <Txt style={s.headerTitle}>금전·재물운</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>지금 금전 상황은?</Txt>
            <View style={s.chipRow}>
              {MONEY_SITUATIONS.map(v => (
                <PressableEffect key={v} style={[s.chip, situation === v && s.chipActive]} onPress={() => setSituation(v)}>
                  <Txt style={[s.chipText, situation === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>솜이에게 물어볼 것</Txt>
            {AI_QUESTIONS.map((q, i) => (
              <PressableEffect key={i} style={[s.qChip, question === q && s.qChipActive]} onPress={() => setQuestion(q)}>
                <Txt style={[s.qChipText, question === q && s.qChipTextActive]}>{q}</Txt>
              </PressableEffect>
            ))}
            <TextInput
              style={s.textInput} value={question} onChangeText={setQuestion}
              placeholder="또는 금전 고민을 직접 써주세요..." placeholderTextColor="rgba(255,255,255,0.25)" multiline
            />
            <Txt style={s.aiNotice}>✨ 생성형 AI 기반 분석이에요.</Txt>
          </View>
        )}

        {step === 'spread' && (
          <CardFanSpread cardCount={15} maxSelect={3} selectedCards={selectedCards}
            onCardSelect={handleCardSelectLazy} accentColor={ACCENT} compact />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <View style={s.resultCardRow}>
              {drawnCards.map((c, i) => (
                <TarotResultCard key={i} card={c.card} isReversed={c.isReversed}
                  isRevealed label={['현재', '기회', '결과'][i] || ''} onFlip={() => {}}
                  cardWidth={90} cardHeight={140} />
              ))}
            </View>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={s.loadingText}>금전 에너지를 해석하고 있어요...</Txt>
              </View>
            ) : reading ? (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            ) : null}
            {!isLoading && reading ? (
              <View style={s.actionBtns}>
                <PressableEffect style={s.shareBtn}
                  onPress={() => shareTarotResult('금전운 타로', reading.slice(0, 50) + '...')}>
                  <Txt style={s.shareBtnText}>💌 금전운 결과 공유하기</Txt>
                </PressableEffect>
                <PressableEffect style={s.reDrawBtn} onPress={handleReset}>
                  <Txt style={s.reDrawBtnText}>💰 한 번 더 뽑기</Txt>
                </PressableEffect>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={[s.drawBtn, !(situation || question).trim() && s.btnDisabled]}
            disabled={!(situation || question).trim()} onPress={() => setStep('spread')}>
            <Txt style={s.drawBtnText}>💰 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="금전 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: HEADER_BG, borderBottomWidth: 1, borderBottomColor: 'rgba(245,158,11,0.1)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  resetText: { fontSize: 11, color: 'rgba(245,158,11,0.7)', fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 16, paddingBottom: 120, gap: 12 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', backgroundColor: 'rgba(245,158,11,0.05)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 11, color: 'rgba(245,158,11,0.8)', fontWeight: '600' },
  chipTextActive: { color: '#1a0e00' },
  qChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', backgroundColor: 'rgba(245,158,11,0.04)' },
  qChipActive: { borderColor: ACCENT, backgroundColor: 'rgba(245,158,11,0.12)' },
  qChipText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  qChipTextActive: { color: ACCENT, fontWeight: '700' },
  textInput: { backgroundColor: 'rgba(245,158,11,0.05)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff', minHeight: 48 },
  aiNotice: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 4 },
  resultCardRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 30 },
  loadingText: { fontSize: 14, color: 'rgba(245,158,11,0.7)', textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(245,158,11,0.05)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 26 },
  actionBtns: { gap: 10, marginTop: 4 },
  shareBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 48, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#1a0e00', fontSize: 14, fontWeight: '800' },
  reDrawBtn: { backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 30, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  reDrawBtnText: { color: ACCENT, fontSize: 14, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(245,158,11,0.08)' },
  drawBtn: { backgroundColor: ACCENT2, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.3 },
  drawBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

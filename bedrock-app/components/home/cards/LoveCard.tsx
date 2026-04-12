import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { getWeightedCards, TarotCardData } from '../../../lib/tarot-data';
import { callGemini } from '../../../lib/gemini';
import { useDrawLimit } from '../../../lib/useDrawLimit';
import { shareTarotResult } from '../../../lib/useTossShare';
import { PaymentInductionModal } from '../../PaymentInductionModal';
import { CardFanSpread } from '../../CardFanSpread';
import { TarotResultCard } from '../../TarotResultCard';
import { useAuthContext } from '../../../context/AuthContext';
import { saveReading, getFreeDrawUsage, incrementFreeDrawUsage } from '../../../lib/storage';
import { Haptic } from '../../../lib/haptic';

// 분홍/로즈 테마 - 사랑/연애 컨셉
const ACCENT = '#f472b6';
const ACCENT2 = '#be185d';
const BG = '#130a12';
const HEADER_BG = '#1f0f1c';

const LOVE_SITUATIONS = ['❤️ 썸/짝사랑', '👩‍❤️‍👨 커플/연애 중', '💔 이별/재회 고민', '💍 결혼/미래 고민', '✨ 솔로/새로운 만남'];
const AI_QUESTIONS = [
  '상대방 지금 어떤 마음일까요?',
  '우리 사이 앞으로 어떻게 될까요?',
  '새로운 인연이 오고 있을까요?',
  '재회 가능성이 있을까요?',
  '이 사람이 나에게 진심일까요?',
];

type Step = 'input' | 'spread' | 'result';

interface LoveCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
  tokenBalance?: number;
}

export const LoveCard: React.FC<LoveCardProps> = ({ onOpenChat, onTokenChange, tokenBalance }) => {
  const { user } = useAuthContext();
  const [step, setStep] = useState<Step>('input');
  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, isChecking, checkLimit, freeUsage, userTokens } = useDrawLimit('love', 2, 0);

  React.useEffect(() => {
    checkLimit();
  }, [tokenBalance, checkLimit]);

  const handleCardSelectLazy = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    Haptic.impact();
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 3) {
      const cards = getWeightedCards(3, { cups: 3, major: 3, swords: 1 });
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
    const consumed = await recordDraw();
    if (consumed > 0) onTokenChange?.();
    setIsLoading(true);
    try {
      const [c1, c2, c3] = cards;
      const prompt = `당신은 사랑의 에너지를 읽는 타로 리더 '솜이'입니다.

[절대 규칙]
- 마크다운 기호(**, ##, __ 등) 절대 사용 금지
- 번호 목록(1. 2. 3.) 형식 금지
- 섹션 제목이나 구조화된 포맷 금지
- 친구에게 속삭이듯, 진심이 담긴 자연스러운 편지체로만 작성

상황: ${situation || '연애 전반'}
고민: ${question || '지금 내 사랑은 어디에 있을까요?'}

카드 배치:
- 현재 마음/상황: ${c1?.card.koreanName} (${c1?.isReversed ? '역방향' : '정방향'})
- 장애물과 조언: ${c2?.card.koreanName} (${c2?.isReversed ? '역방향' : '정방향'})
- 앞으로의 흐름: ${c3?.card.koreanName} (${c3?.isReversed ? '역방향' : '정방향'})

세 장의 카드가 전하는 이야기를 자연스럽게 연결해서, 따뜻하고 솔직하게 4~5문단으로 써주세요.`;
      const result = await callGemini(prompt);
      setReading(result);
      saveReading({ question: question || situation || '연애운 타로', cards, interpretation: result }, user?.userId);
    } catch {
      setReading('사랑의 별자리가 잠시 가려졌어요. 다시 시도해주세요. 💖');
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
        <Txt style={s.headerEmoji}>💕</Txt>
        <Txt style={s.headerTitle}>연애운 타로</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
            style={s.section}
          >
            <Txt style={s.label}>솜이에게 물어볼 것</Txt>
            <TextInput
              style={s.textInput} value={question} onChangeText={setQuestion}
              placeholder="또는 지금 마음속 고민을 직접 써주세요..." placeholderTextColor="rgba(255,255,255,0.25)" multiline
            />
            {AI_QUESTIONS.map((q, i) => (
              <PressableEffect key={i} style={[s.qChip, question === q && s.qChipActive]} onPress={() => setQuestion(q)}>
                <Txt style={[s.qChipText, question === q && s.qChipTextActive]}>{q}</Txt>
              </PressableEffect>
            ))}
            <Txt style={s.label}>지금 나의 상황은?</Txt>
            <View style={s.chipRow}>
              {LOVE_SITUATIONS.map(v => (
                <PressableEffect key={v} style={[s.chip, situation === v && s.chipActive]} onPress={() => setSituation(v)}>
                  <Txt style={[s.chipText, situation === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.aiNotice}>✨ 생성형 AI 기반 분석이에요.</Txt>
          </KeyboardAvoidingView>
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
                  isRevealed label={['지금', '조언', '미래'][i] || ''} onFlip={() => {}}
                  cardWidth={90} cardHeight={140} />
              ))}
            </View>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={s.loadingText}>사랑의 에너지를 해석하고 있어요...</Txt>
              </View>
            ) : reading ? (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            ) : null}
            {!isLoading && reading ? (
              <View style={s.actionBtns}>
                <PressableEffect style={s.shareBtn}
                  onPress={() => shareTarotResult('연애운 타로', reading.slice(0, 50) + '...')}>
                  <Txt style={s.shareBtnText}>💌 결과 공유하기</Txt>
                </PressableEffect>
                <PressableEffect style={s.reDrawBtn} onPress={handleReset}>
                  <Txt style={s.reDrawBtnText}>💕 한 번 더 뽑기</Txt>
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
            <Txt style={s.drawBtnText}>💕 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="인연 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: HEADER_BG, borderBottomWidth: 1, borderBottomColor: 'rgba(244,114,182,0.1)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244,114,182,0.2)' },
  resetText: { fontSize: 11, color: 'rgba(244,114,182,0.7)', fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 12, paddingBottom: 80, gap: 12 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(244,114,182,0.25)', backgroundColor: 'rgba(244,114,182,0.05)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 11, color: 'rgba(244,114,182,0.8)', fontWeight: '600' },
  chipTextActive: { color: '#1a0014' },
  qChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244,114,182,0.15)', backgroundColor: 'rgba(244,114,182,0.05)' },
  qChipActive: { borderColor: ACCENT, backgroundColor: 'rgba(244,114,182,0.15)' },
  qChipText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  qChipTextActive: { color: ACCENT, fontWeight: '700' },
  textInput: { backgroundColor: 'rgba(244,114,182,0.06)', borderWidth: 1, borderColor: 'rgba(244,114,182,0.15)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff', minHeight: 48 },
  aiNotice: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 4 },
  resultCardRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 30 },
  loadingText: { fontSize: 14, color: 'rgba(244,114,182,0.7)', textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(244,114,182,0.05)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(244,114,182,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 26 },
  actionBtns: { gap: 10, marginTop: 4 },
  shareBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 48, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#1a0014', fontSize: 14, fontWeight: '800' },
  reDrawBtn: { backgroundColor: 'rgba(244,114,182,0.1)', borderRadius: 30, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,114,182,0.2)' },
  reDrawBtnText: { color: ACCENT, fontSize: 14, fontWeight: '700' },
  footer: { padding: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(244,114,182,0.08)' },
  drawBtn: { backgroundColor: ACCENT2, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.3 },
  drawBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

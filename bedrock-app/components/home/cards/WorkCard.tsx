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
import { Haptic } from '../../../lib/haptic';

const ACCENT = '#DAA520';
const BG = '#14141a';

const WORK_SITUATIONS = ['📊 승진/평가 고민', '🔄 이직 준비 중', '🔍 취업 준비 중', '😰 직장 내 갈등', '💡 새 프로젝트', '🏁 창업 고민'];
const WORK_TYPES = ['💼 대기업/공기업', '🏢 중소기업', '🏪 자영업', '💻 프리랜서', '🎓 취준생'];
const AI_QUESTIONS = ['지금 내 직장운은?', '이직 타이밍이 맞나요?', '승진 가능성은?', '직장 내 갈등 해결법은?'];

type Step = 'input' | 'spread' | 'result';

interface WorkCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
  tokenBalance?: number;
}

export const WorkCard: React.FC<WorkCardProps> = ({ onOpenChat, onTokenChange, tokenBalance }) => {
  const [step, setStep] = useState<Step>('input');
  const [workType, setWorkType] = useState('');
  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, isChecking, checkLimit, freeUsage, userTokens } = useDrawLimit('work', 2, 0);

  React.useEffect(() => {
    checkLimit();
  }, [tokenBalance, checkLimit]);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    Haptic.impact();
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 3) {
      setTimeout(() => {
        const cards = getWeightedCards(3, { wands: 2, swords: 2, major: 2 });
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
      const [c1, c2, c3] = cards;
      const prompt = `당신은 커리어와 직장 에너지를 읽는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 자연스러운 편지 형식으로 작성하세요.

직업 유형: ${workType || '직업 전반'}
현재 상황: ${situation || '직장운 전반'}
질문: ${question}

1. 현재 직장 에너지: ${c1?.card.koreanName} (${c1?.isReversed ? '역방향' : '정방향'})
2. 도전/기회: ${c2?.card.koreanName} (${c2?.isReversed ? '역방향' : '정방향'})
3. 나아갈 방향: ${c3?.card.koreanName} (${c3?.isReversed ? '역방향' : '정방향'})

💼 **지금 당신의 커리어 에너지**
⚔️ **도전 요소와 숨겨진 기회**
🚀 **나아갈 방향과 솜이의 조언**
✨ **오늘 직장에서 기억할 한 줄** "[감성 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setQuestion(''); setWorkType(''); setSituation('');
    setSelectedCards([]); setDrawnCards([]); setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>💼</Txt>
        <Txt style={s.headerTitle}>직장운 타로</Txt>
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
            <Txt style={s.label}>🏢 직업 유형</Txt>
            <View style={s.chipRow}>
              {WORK_TYPES.map(v => (
                <PressableEffect key={v} style={[s.chip, workType === v && s.chipActive]} onPress={() => setWorkType(v)}>
                  <Txt style={[s.chipText, workType === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>😰 현재 상황</Txt>
            <View style={s.chipRow}>
              {WORK_SITUATIONS.map(v => (
                <PressableEffect key={v} style={[s.chip, situation === v && s.chipActive]} onPress={() => setSituation(situation === v ? '' : v)}>
                  <Txt style={[s.chipText, situation === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>💬 질문</Txt>
            {AI_QUESTIONS.map((q, i) => (
              <PressableEffect key={i} style={[s.qChip, question === q && s.qChipActive]} onPress={() => setQuestion(q)}>
                <Txt style={[s.qChipText, question === q && s.qChipTextActive]}>{q}</Txt>
              </PressableEffect>
            ))}
            <TextInput
              style={s.textInput} value={question} onChangeText={setQuestion}
              placeholder="직접 입력..." placeholderTextColor="rgba(255,255,255,0.3)" multiline
            />
            <Txt style={s.aiNotice}>✨ 생성형 AI 기술을 기반으로 한 분석입니다.</Txt>
          </KeyboardAvoidingView>
        )}

        {step === 'spread' && (
          <CardFanSpread cardCount={15} maxSelect={3} selectedCards={selectedCards}
            onCardSelect={handleCardSelect} accentColor={ACCENT} compact />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <View style={s.resultCardRow}>
              {drawnCards.map((c, i) => (
                <TarotResultCard key={i} card={c.card} isReversed={c.isReversed}
                  isRevealed label={['현재 에너지', '도전/기회', '나아갈 방향'][i] || ''} onFlip={() => {}}
                  cardWidth={90} cardHeight={140} />
              ))}
            </View>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={s.loadingText}>솜이가 커리어 에너지를 읽고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={s.shareBtn}
                onPress={() => shareTarotResult('직장운 타로', reading.slice(0, 60) + '...')}>
                <Txt style={s.shareBtnText}>💌 결과 공유하기</Txt>
              </PressableEffect>
            )}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={[s.drawBtn, !question.trim() && s.btnDisabled]}
            disabled={!question.trim()} onPress={() => setStep('spread')}>
            <Txt style={s.drawBtnText}>💼 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="직장/이직 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)' },
  resetText: { fontSize: 11, color: ACCENT, fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 12, paddingBottom: 80, gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(218,165,32,0.25)', backgroundColor: 'rgba(218,165,32,0.05)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 11, color: 'rgba(218,165,32,0.7)', fontWeight: '600' },
  chipTextActive: { color: '#000' },
  qChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 2 },
  qChipActive: { borderColor: ACCENT, backgroundColor: 'rgba(218,165,32,0.1)' },
  qChipText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  qChipTextActive: { color: ACCENT, fontWeight: '700' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff', minHeight: 48 },
  aiNotice: { fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 4 },
  resultCardRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, color: 'rgba(218,165,32,0.7)', textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  shareBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  shareBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  footer: { padding: 12, paddingBottom: Platform.OS === "ios" ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  drawBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.3 },
  drawBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

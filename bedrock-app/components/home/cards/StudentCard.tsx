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

const STUDY_TYPES = ['📝 수능 준비', '🎓 편입/대학원', '📚 자격증/공무원', '🏫 내신/중간고사', '🌏 유학 준비', '💼 취업 시험'];
const STUDY_CONCERNS = ['😓 집중력 저하', '📉 성적 하락', '😴 체력 고갈', '💭 불안/슬럼프', '🤔 진로 고민', '⏰ 시간 부족'];
const AI_QUESTIONS = ['합격 가능성이 있을까?', '지금 내 공부 에너지는?', '슬럼프 극복 방법은?', '무엇에 집중해야 할까?'];

type Step = 'input' | 'spread' | 'result';

interface StudentCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ onOpenChat, onTokenChange }) => {
  const [step, setStep] = useState<Step>('input');
  const [studyType, setStudyType] = useState('');
  const [concern, setConcern] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('student', 2);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 3) {
      setTimeout(() => {
        const cards = getWeightedCards(3, { swords: 2, wands: 2, major: 2 });
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
      const [c1, c2, c3] = cards;
      const prompt = `당신은 수험생과 학생의 마음을 깊이 이해하는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 응원하는 편지 형식으로 작성하세요.

학업 유형: ${studyType || '학업 전반'}
현재 고민: ${concern || '학업 전반'}
질문: ${question}

1. 현재 학업 에너지: ${c1?.card.koreanName} (${c1?.isReversed ? '역방향' : '정방향'})
2. 나를 막는 것: ${c2?.card.koreanName} (${c2?.isReversed ? '역방향' : '정방향'})
3. 합격 가능성: ${c3?.card.koreanName} (${c3?.isReversed ? '역방향' : '정방향'})

📚 **지금 당신의 학업 에너지**
🚧 **방해물과 극복 힌트**
🏆 **합격을 향한 솜이의 응원 메시지**
✨ **오늘 책상에 붙여둘 한 줄** "[응원 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setQuestion(''); setStudyType(''); setConcern('');
    setSelectedCards([]); setDrawnCards([]); setReading('');
    onTokenChange?.();
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>📚</Txt>
        <Txt style={s.headerTitle}>학업·수험생 타로</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>📝 학업 유형</Txt>
            <View style={s.chipRow}>
              {STUDY_TYPES.map(v => (
                <PressableEffect key={v} style={[s.chip, studyType === v && s.chipActive]} onPress={() => setStudyType(v)}>
                  <Txt style={[s.chipText, studyType === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>😓 현재 고민</Txt>
            <View style={s.chipRow}>
              {STUDY_CONCERNS.map(v => (
                <PressableEffect key={v} style={[s.chip, concern === v && s.chipActive]} onPress={() => setConcern(concern === v ? '' : v)}>
                  <Txt style={[s.chipText, concern === v && s.chipTextActive]}>{v}</Txt>
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
          </View>
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
                  isRevealed label={['현재 에너지', '나를 막는 것', '합격 가능성'][i] || ''} onFlip={() => {}}
                  cardWidth={90} cardHeight={140} />
              ))}
            </View>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={[s.loadingText, { color: ACCENT }]}>솜이가 학업 에너지를 읽고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={[s.shareBtn, { backgroundColor: ACCENT }]}
                onPress={() => shareTarotResult('학업·수험생 타로', reading.slice(0, 60) + '...')}>
                <Txt style={[s.shareBtnText, { color: '#000' }]}>💌 결과 공유하기</Txt>
              </PressableEffect>
            )}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={[s.drawBtn, { backgroundColor: ACCENT }, !question.trim() && s.btnDisabled]}
            disabled={!question.trim()} onPress={() => setStep('spread')}>
            <Txt style={[s.drawBtnText, { color: '#000' }]}>📚 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="학업/시험 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.18)' },
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
  qChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 4 },
  qChipActive: { borderColor: ACCENT, backgroundColor: 'rgba(52,211,153,0.1)' },
  qChipText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  qChipTextActive: { color: ACCENT, fontWeight: '700' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff', minHeight: 56 },
  aiNotice: { fontSize: 11, color: 'rgba(52,211,153,0.45)', textAlign: 'center', marginTop: 4 },
  resultCardRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
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

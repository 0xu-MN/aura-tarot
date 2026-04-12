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

const ACCENT = '#818cf8';
const BG = '#14141a';

const SEPARATION_PERIODS = ['1개월 미만', '1~3개월', '3~6개월', '6개월 이상'];
const RELATIONSHIP_TYPES = ['연인', '썸', '짝사랑'];
const AI_QUESTIONS = ['그 사람도 제 생각을 할까요?', '다시 연락이 올까요?', '지금 제가 먼저 연락해도 될까요?', '재회 가능성이 있을까요?'];

type Step = 'input' | 'spread' | 'result';

interface ReunionCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
  tokenBalance?: number;
}

export const ReunionCard: React.FC<ReunionCardProps> = ({ onOpenChat, onTokenChange, tokenBalance }) => {
  const [step, setStep] = useState<Step>('input');
  const [period, setPeriod] = useState('');
  const [relType, setRelType] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [probability, setProbability] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, isChecking, checkLimit, freeUsage, userTokens } = useDrawLimit('reunion', 2, 0);

  React.useEffect(() => {
    checkLimit();
  }, [tokenBalance, checkLimit]);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    Haptic.impact();
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 4) {
      setTimeout(() => {
        const cards = getWeightedCards(4, { cups: 2, swords: 1, major: 1 });
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
      const [cpast, cpres, cobst, cfut] = cards;
      const prompt = `당신은 이별의 아픔과 그리움을 깊이 공감하는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 따뜻하고 섬세한 편지 형식으로 작성하세요.

이별 기간: ${period}
관계 유형: ${relType}
질문: ${question}

1. 과거의 인연: ${cpast?.card.koreanName} (${cpast?.isReversed ? '역방향' : '정방향'})
2. 현재의 마음: ${cpres?.card.koreanName} (${cpres?.isReversed ? '역방향' : '정방향'})
3. 재회의 장애물: ${cobst?.card.koreanName} (${cobst?.isReversed ? '역방향' : '정방향'})
4. 미래의 가능성: ${cfut?.card.koreanName} (${cfut?.isReversed ? '역방향' : '정방향'})

🌙 **두 분의 재회 확률** (0~100% 중 하나를 선택해 그 이유와 함께 설명)
🧩 **상대방의 현재 속마음과 당신에 대한 생각**
🚧 **재회를 가로막는 것과 극복할 방법**
🌱 **당신을 위한 솜이의 조언**
✨ **이별 끝에 마주할 당신을 위한 문장** "[감성 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
      
      const probMatch = result.match(/(\d+)%/);
      setProbability(probMatch?.[1] ? parseInt(probMatch[1], 10) : Math.floor(Math.random() * 41) + 30);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setPeriod(''); setRelType(''); setQuestion('');
    setSelectedCards([]); setDrawnCards([]); setReading(''); setProbability(0);
    onTokenChange?.();
  };

  const canProceed = !!period && !!relType && !!question.trim();

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>🌙</Txt>
        <Txt style={s.headerTitle}>재회 확률</Txt>
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
            <Txt style={s.label}>⏳ 헤어진 기간</Txt>
            <View style={s.chipRow}>
              {SEPARATION_PERIODS.map(v => (
                <PressableEffect key={v} style={[s.chip, period === v && s.chipActive]} onPress={() => setPeriod(v)}>
                  <Txt style={[s.chipText, period === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>❤️ 관계 유형</Txt>
            <View style={s.chipRow}>
              {RELATIONSHIP_TYPES.map(v => (
                <PressableEffect key={v} style={[s.chip, relType === v && s.chipActive]} onPress={() => setRelType(v)}>
                  <Txt style={[s.chipText, relType === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>💬 카드에게 물어볼 질문</Txt>
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
          <CardFanSpread
            cardCount={16} maxSelect={4}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            accentColor={ACCENT} compact
          />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <View style={s.probBox}>
              <Txt style={s.probLabel}>재회 확률</Txt>
              <Txt style={s.probValue}>{probability}%</Txt>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cardRow}>
              {drawnCards.map((c, i) => (
                <TarotResultCard key={i} card={c.card} isReversed={c.isReversed}
                  isRevealed label={['과거', '현재', '장애물', '미래'][i] || ''} onFlip={() => {}}
                  cardWidth={75} cardHeight={120} />
              ))}
            </ScrollView>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={[s.loadingText, { color: ACCENT }]}>솜이가 두 사람의 그리움을 읽고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={[s.shareBtn, { backgroundColor: ACCENT }]}
                onPress={() => shareTarotResult('재회 확률', reading.slice(0, 60) + '...')}>
                <Txt style={s.shareBtnText}>💌 결과 공유하기</Txt>
              </PressableEffect>
            )}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={[s.drawBtn, { backgroundColor: ACCENT }, !canProceed && s.btnDisabled]}
            disabled={!canProceed} onPress={() => setStep('spread')}>
            <Txt style={s.drawBtnText}>🌙 카드 선택하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="재회 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(129,140,248,0.2)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(129,140,248,0.35)' },
  resetText: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 12, paddingBottom: 80, gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', backgroundColor: 'rgba(129,140,248,0.06)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, color: 'rgba(129,140,248,0.85)', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  qChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 4 },
  qChipActive: { borderColor: ACCENT, backgroundColor: 'rgba(129,140,248,0.1)' },
  qChipText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  qChipTextActive: { color: ACCENT, fontWeight: '700' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.25)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff', minHeight: 56 },
  probBox: { alignItems: 'center', padding: 12, backgroundColor: 'rgba(129,140,248,0.08)', borderRadius: 16, marginBottom: 10 },
  probLabel: { fontSize: 12, color: ACCENT, fontWeight: '700' },
  probValue: { fontSize: 32, fontWeight: '900', color: ACCENT },
  cardRow: { flexDirection: 'row', marginBottom: 12 },
  aiNotice: { fontSize: 11, color: 'rgba(129,140,248,0.45)', textAlign: 'center', marginTop: 4 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(129,140,248,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 24 },
  shareBtn: { borderRadius: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: { padding: 12, paddingBottom: Platform.OS === "ios" ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(129,140,248,0.15)' },
  drawBtn: { borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.35 },
  drawBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

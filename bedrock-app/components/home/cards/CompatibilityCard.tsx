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

const ACCENT = '#ec4899';
const BG = '#14141a';

const RELATIONSHIP_TYPES = ['❤️ 썸 타는 사이', '👩‍❤️‍👨 연인', '💍 부부', '💔 헤어진 사이', '🤝 친구/동업자'];

type Step = 'input' | 'spread' | 'result';

interface CompatibilityCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const CompatibilityCard: React.FC<CompatibilityCardProps> = ({ onOpenChat, onTokenChange }) => {
  const [step, setStep] = useState<Step>('input');
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [relType, setRelType] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [reading, setReading] = useState('');
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('compatibility', 2);

  const handleCardSelect = (idx: number) => {
    if (selectedCards.includes(idx)) return;
    const next = [...selectedCards, idx];
    setSelectedCards(next);
    if (next.length === 2) {
      setTimeout(() => {
        const cards = getWeightedCards(2, { cups: 2, major: 1 });
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
      const [c1, c2] = cards;
      const prompt = `당신은 두 사람의 인연의 끈을 읽는 타로 리더 '솜이'입니다.
[금지] "##", AI 어투, 마크다운 헤더 금지. 이모지+볼드로 따뜻한 편지 형식으로 작성하세요.

본인 이름: ${myName}
상대 이름: ${partnerName}
관계: ${relType}

1. ${myName}님의 에너지: ${c1?.card.koreanName} (${c1?.isReversed ? '역방향' : '정방향'})
2. ${partnerName}님의 에너지: ${c2?.card.koreanName} (${c2?.isReversed ? '역방향' : '정방향'})

💞 **두 분의 현재 인연 지수** (0~100점 중 하나를 선택해 이유와 함께 설명)
🧩 **서로가 서로에게 어떤 의미인지**
🌱 **더 깊은 관계로 나아가기 위한 솜이의 팁**
✨ **두 분을 위한 오늘의 문장** "[감성 문장]"`;
      const result = await callGemini(prompt);
      setReading(result);
      
      // 추출된 점수가 있다면 설정 (없으면 랜덤 70~95)
      const probMatch = result.match(/(\d+)%/);
      setScore(probMatch?.[1] ? parseInt(probMatch[1], 10) : Math.floor(Math.random() * 41) + 30);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setMyName(''); setPartnerName(''); setRelType('');
    setSelectedCards([]); setDrawnCards([]); setReading(''); setScore(0);
    onTokenChange?.();
  };

  const canProceed = !!myName.trim() && !!partnerName.trim() && !!relType;

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>💞</Txt>
        <Txt style={s.headerTitle}>커플 궁합</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>👤 내 이름</Txt>
            <TextInput
              style={s.textInput} value={myName} onChangeText={setMyName}
              placeholder="이름 입력..." placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <Txt style={s.label}>👤 상대방 이름</Txt>
            <TextInput
              style={s.textInput} value={partnerName} onChangeText={setPartnerName}
              placeholder="상대 이름 입력..." placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <Txt style={s.label}>❤️ 두 사람의 관계</Txt>
            <View style={s.chipRow}>
              {RELATIONSHIP_TYPES.map(v => (
                <PressableEffect key={v} style={[s.chip, relType === v && s.chipActive]} onPress={() => setRelType(v)}>
                  <Txt style={[s.chipText, relType === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.aiNotice}>✨ 생성형 AI 기술을 기반으로 한 분석입니다.</Txt>
          </View>
        )}

        {step === 'spread' && (
          <CardFanSpread
            cardCount={12} maxSelect={2}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            accentColor={ACCENT} compact
          />
        )}

        {step === 'result' && (
          <View style={s.section}>
            <View style={s.scoreBox}>
              <Txt style={s.scoreLabel}>궁합 지수</Txt>
              <Txt style={s.scoreValue}>{score}%</Txt>
            </View>
            <View style={s.resultCardRow}>
              {drawnCards.map((c, i) => (
                <TarotResultCard key={i} card={c.card} isReversed={c.isReversed}
                  isRevealed label={[myName, partnerName][i] || ''} onFlip={() => {}}
                  cardWidth={100} cardHeight={160} />
              ))}
            </View>
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={[s.loadingText, { color: ACCENT }]}>솜이가 두 분의 인연을 읽고 있어요...</Txt>
              </View>
            ) : (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            )}
            {!isLoading && (
              <PressableEffect style={[s.shareBtn, { backgroundColor: ACCENT }]}
                onPress={() => shareTarotResult('커플 궁합', reading.slice(0, 60) + '...')}>
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
            <Txt style={s.drawBtnText}>💞 인연 확인하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="궁합 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(236,72,153,0.2)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(236,72,153,0.35)' },
  resetText: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 16, paddingBottom: 120, gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)', backgroundColor: 'rgba(236,72,153,0.06)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, color: 'rgba(236,72,153,0.85)', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)', borderRadius: 12, padding: 12, fontSize: 14, color: '#fff' },
  scoreBox: { alignItems: 'center', padding: 12, backgroundColor: 'rgba(236,72,153,0.08)', borderRadius: 16, marginBottom: 10 },
  scoreLabel: { fontSize: 12, color: ACCENT, fontWeight: '700' },
  scoreValue: { fontSize: 32, fontWeight: '900', color: ACCENT },
  aiNotice: { fontSize: 11, color: 'rgba(236,72,153,0.45)', textAlign: 'center', marginTop: 4 },
  resultCardRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 12 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, textAlign: 'center' },
  readingBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(236,72,153,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 24 },
  shareBtn: { borderRadius: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: Platform.OS === "ios" ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(236,72,153,0.15)' },
  drawBtn: { borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.35 },
  drawBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { callGemini } from '../../../lib/gemini';
import { useDrawLimit } from '../../../lib/useDrawLimit';
import { shareTarotResult } from '../../../lib/useTossShare';
import { PaymentInductionModal } from '../../PaymentInductionModal';
import { useAuthContext } from '../../../context/AuthContext';
import { saveReading } from '../../../lib/storage';

// 인디고/보라 별자리 테마
const ACCENT = '#818cf8';
const ACCENT2 = '#3730a3';
const BG = '#07080f';
const HEADER_BG = '#0f1020';

const ZODIAC_SIGNS = [
  { sign: '♈ 양자리', dates: '3.21–4.19' },
  { sign: '♉ 황소자리', dates: '4.20–5.20' },
  { sign: '♊ 쌍둥이자리', dates: '5.21–6.20' },
  { sign: '♋ 게자리', dates: '6.21–7.22' },
  { sign: '♌ 사자자리', dates: '7.23–8.22' },
  { sign: '♍ 처녀자리', dates: '8.23–9.22' },
  { sign: '♎ 천칭자리', dates: '9.23–10.22' },
  { sign: '♏ 전갈자리', dates: '10.23–11.21' },
  { sign: '♐ 사수자리', dates: '11.22–12.21' },
  { sign: '♑ 염소자리', dates: '12.22–1.19' },
  { sign: '♒ 물병자리', dates: '1.20–2.18' },
  { sign: '♓ 물고기자리', dates: '2.19–3.20' },
];
const FOCUS_AREAS = ['💕 연애·관계', '💰 금전·재물', '💼 직장·커리어', '📚 학업·시험', '🌿 건강·일상'];
const TIME_FRAMES = ['🌅 오늘 하루', '📅 이번 주', '🌕 이번 달'];

type Step = 'input' | 'result';

interface HoroscopeCardProps {
  onOpenChat?: (consultation: any) => void;
  onTokenChange?: () => void;
}

export const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ onOpenChat, onTokenChange }) => {
  const { user } = useAuthContext();
  const [step, setStep] = useState<Step>('input');
  const [zodiac, setZodiac] = useState('');
  const [focus, setFocus] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { canDraw, recordDraw, grantExtraDraw } = useDrawLimit('horoscope', 3);

  const handleDraw = async () => {
    if (!zodiac) return;
    setStep('result');
    if (!canDraw) { 
      setTimeout(() => setShowDrawModal(true), 400);
      return;
    }
    recordDraw();
    setIsLoading(true);
    try {
      const sign = zodiac;
      const prompt = `당신은 별자리의 에너지를 감성적으로 전달하는 타로 리더 '솜이'입니다.

[절대 규칙]
- 마크다운 기호(**, ##, __ 등) 절대 사용 금지
- 제목이나 섬션 헤더 금지
- AI 별 구조화 답변 금지
- 비먀을 나누는 듯, 자연스러운 대화체로만 작성

별자리: ${sign}
집중 분야: ${focus || '전반적 운세'}
기간: ${timeframe || '오늘 하루'}

${sign} 의 ${timeframe || '오늘'} 에너지를 3~4문단으로 자연스러박게 쓰세요. ${focus ? `${focus} 분야를 중점적으로 다뤄주고,` : ''} 마지막엔 오늘의 행운 키워드(켼러, 시간대, 장소 중 한 가지)를 자연스럽게 넣어 표현하세요.`;
      const result = await callGemini(prompt);
      setReading(result);
      saveReading({ question: `별자리 운세: ${zodiac}`, cards: [], interpretation: result }, user?.userId);
    } catch {
      setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input'); setZodiac(''); setFocus(''); setTimeframe(''); setReading('');
    onTokenChange?.();
  };

  const selectedZodiacItem = ZODIAC_SIGNS.find(z => z.sign === zodiac);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Txt style={s.headerEmoji}>♒</Txt>
        <Txt style={s.headerTitle}>별자리 운세</Txt>
        {step !== 'input' && (
          <PressableEffect onPress={handleReset} style={s.resetBtn}>
            <Txt style={s.resetText}>↺ 다시</Txt>
          </PressableEffect>
        )}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {step === 'input' && (
          <View style={s.section}>
            <Txt style={s.label}>⭐ 내 별자리 선택</Txt>
            <View style={s.zodiacGrid}>
              {ZODIAC_SIGNS.map(z => (
                <PressableEffect key={z.sign} style={[s.zodiacChip, zodiac === z.sign && s.chipActive]}
                  onPress={() => setZodiac(z.sign)}>
                  <Txt style={[s.zodiacSign, zodiac === z.sign && s.chipTextActive]}>{z.sign.split(' ')[0]}</Txt>
                  <Txt style={[s.zodiacLabel, zodiac === z.sign && s.chipTextActive]} numberOfLines={1}>
                    {z.sign.split(' ')[1]}
                  </Txt>
                  <Txt style={[s.zodiacDates, zodiac === z.sign && s.chipDateActive]}>{z.dates}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>🔍 집중 분야 (선택)</Txt>
            <View style={s.chipRow}>
              {FOCUS_AREAS.map(v => (
                <PressableEffect key={v} style={[s.chip, focus === v && s.chipActive]} onPress={() => setFocus(focus === v ? '' : v)}>
                  <Txt style={[s.chipText, focus === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.label}>⏱️ 기간</Txt>
            <View style={s.chipRow}>
              {TIME_FRAMES.map(v => (
                <PressableEffect key={v} style={[s.chip, timeframe === v && s.chipActive]} onPress={() => setTimeframe(v)}>
                  <Txt style={[s.chipText, timeframe === v && s.chipTextActive]}>{v}</Txt>
                </PressableEffect>
              ))}
            </View>
            <Txt style={s.aiNotice}>✨ 생성형 AI 기술을 기반으로 한 분석입니다.</Txt>
          </View>
        )}

        {step === 'result' && (
          <View style={s.section}>
            {zodiac && (
              <View style={s.zodiacDisplayBox}>
                <Txt style={s.zodiacDisplaySign}>{zodiac.split(' ')[0]}</Txt>
                <View>
                  <Txt style={s.zodiacDisplayLabel}>{zodiac.split(' ')[1]}</Txt>
                  {selectedZodiacItem && (
                    <Txt style={s.zodiacDisplayDates}>{selectedZodiacItem.dates}</Txt>
                  )}
                </View>
              </View>
            )}
            {isLoading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={ACCENT} size="large" />
                <Txt style={s.loadingText}>솜이가 별자리 에너지를 읽고 있어요...</Txt>
              </View>
            ) : reading ? (
              <View style={s.readingBox}>
                <Txt style={s.readingText}>{reading}</Txt>
              </View>
            ) : null}
            {!isLoading && reading ? (
              <View style={s.actionBtns}>
                <PressableEffect style={s.shareBtn}
                  onPress={() => shareTarotResult('별자리 운세', reading.slice(0, 60) + '...')}>
                  <Txt style={s.shareBtnText}>💌 결과 공유하기</Txt>
                </PressableEffect>
                <PressableEffect style={s.reDrawBtn} onPress={handleReset}>
                  <Txt style={s.reDrawBtnText}>⭐ 한 번 더 뽑기</Txt>
                </PressableEffect>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={s.footer}>
          <PressableEffect style={[s.drawBtn, { backgroundColor: ACCENT }, !zodiac && s.btnDisabled]}
            disabled={!zodiac} onPress={handleDraw}>
            <Txt style={s.drawBtnText}>♒ 운세 확인하기</Txt>
          </PressableEffect>
        </View>
      )}

      <PaymentInductionModal
        visible={showDrawModal}
        onClose={() => { setShowDrawModal(false); setStep('input'); }}
        contentName="점성술 타로"
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: BG },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: HEADER_BG, borderBottomWidth: 1, borderBottomColor: 'rgba(129,140,248,0.12)' },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT, flex: 1 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)' },
  resetText: { fontSize: 12, color: 'rgba(129,140,248,0.8)', fontWeight: '600' },
  body: { flex: 1 },
  section: { padding: 14, paddingBottom: 120, gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  zodiacGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  zodiacChip: { width: '22%', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)', backgroundColor: 'rgba(129,140,248,0.05)', padding: 6, alignItems: 'center', gap: 2 },
  zodiacSign: { fontSize: 18 },
  zodiacLabel: { fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  zodiacDates: { fontSize: 8, color: 'rgba(255,255,255,0.3)' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipTextActive: { color: '#fff' },
  chipDateActive: { color: 'rgba(255,255,255,0.7)' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)', backgroundColor: 'rgba(129,140,248,0.05)' },
  chipText: { fontSize: 12, color: 'rgba(129,140,248,0.9)', fontWeight: '600' },
  aiNotice: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 4 },
  zodiacDisplayBox: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: 'rgba(129,140,248,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(129,140,248,0.15)' },
  zodiacDisplaySign: { fontSize: 44 },
  zodiacDisplayLabel: { fontSize: 18, fontWeight: '800', color: '#fff' },
  zodiacDisplayDates: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 30 },
  loadingText: { fontSize: 14, textAlign: 'center', color: 'rgba(129,140,248,0.7)' },
  readingBox: { backgroundColor: 'rgba(129,140,248,0.05)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(129,140,248,0.12)' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 26 },
  actionBtns: { gap: 10, marginTop: 4 },
  shareBtn: { backgroundColor: ACCENT, borderRadius: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  reDrawBtn: { backgroundColor: 'rgba(129,140,248,0.08)', borderRadius: 30, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)' },
  reDrawBtnText: { color: ACCENT, fontSize: 14, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: 'rgba(129,140,248,0.1)' },
  drawBtn: { backgroundColor: ACCENT2, borderRadius: 30, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.35 },
  drawBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

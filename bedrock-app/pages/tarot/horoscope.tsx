import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Image
} from 'react-native';
import { ASSETS } from '../../lib/assets';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/horoscope', { component: Horoscope });
const { width } = Dimensions.get('window');
type Step = 'select-sign' | 'select-timeframe' | 'result';

const ZODIAC_SIGNS = [
  { name: '물병자리', date: '1.20~2.18', image: ASSETS.zodiac.aquarius },
  { name: '물고기자리', date: '2.19~3.20', image: ASSETS.zodiac.pisces },
  { name: '양자리', date: '3.21~4.19', image: ASSETS.zodiac.aries },
  { name: '황소자리', date: '4.20~5.20', image: ASSETS.zodiac.taurus },
  { name: '쌍둥이자리', date: '5.21~6.21', image: ASSETS.zodiac.gemini },
  { name: '게자리', date: '6.22~7.22', image: ASSETS.zodiac.cancer },
  { name: '사자자리', date: '7.23~8.22', image: ASSETS.zodiac.leo },
  { name: '처녀자리', date: '8.23~9.23', image: ASSETS.zodiac.virgo },
  { name: '천칭자리', date: '9.24~10.22', image: ASSETS.zodiac.libra },
  { name: '전갈자리', date: '10.23~11.22', image: ASSETS.zodiac.scorpio },
  { name: '사수자리', date: '11.23~12.24', image: ASSETS.zodiac.sagittarius },
  { name: '염소자리', date: '12.25~1.19', image: ASSETS.zodiac.capricorn },
];

const TIMEFRAMES = [
  { id: 'daily', label: '오늘의 운세' },
  { id: 'weekly', label: '주간 운세' },
  { id: 'monthly', label: '월간 운세' },
  { id: 'yearly', label: '2026년 총운' },
];

function Horoscope() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<Step>('select-sign');
  const [selectedSign, setSelectedSign] = useState<typeof ZODIAC_SIGNS[0] | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<typeof TIMEFRAMES[0] | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSignSelect = (sign: typeof ZODIAC_SIGNS[0]) => {
    setSelectedSign(sign);
    setStep('select-timeframe');
  };

  const handleTimeframeSelect = async (tf: typeof TIMEFRAMES[0]) => {
    setSelectedTimeframe(tf);
    setStep('result');
    setIsAnalyzing(true);
    try {
      const prompt = `당신은 전문 점성술사입니다.
${selectedSign!.name}의 ${tf.label}를 상세하게 분석해주세요.

- 연애운, 직업운, 금전운, 건강운 각각 포함
- 이모지 적절히 사용
- 오늘/이번 주/이번 달/올해의 핵심 메시지 1가지 제시
- 행운의 색상, 숫자, 방향 포함
- 전반적으로 희망차고 구체적인 조언 위주로`;
      const result = await callGemini(prompt);
      setAiReading(result);
    } catch {
      setAiReading('별들의 메시지를 받지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => { setStep('select-sign'); setSelectedSign(null); setSelectedTimeframe(null); setAiReading(''); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={step === 'select-sign' ? () => navigation.goBack() : () => setStep(step === 'result' ? 'select-timeframe' : 'select-sign')} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.headerSub}>별자리 운세</Text>
          <Text style={s.headerTitle}>별들이 말하는 당신의 운명</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 'select-sign' && (
          <View style={s.section}>
            <Text style={s.title}>본인의 별자리를 선택해주세요</Text>
            <View style={s.signGrid}>
              {ZODIAC_SIGNS.map((sign) => (
                <TouchableOpacity key={sign.name} style={s.signCard} onPress={() => handleSignSelect(sign)}>
                  <Image source={sign.image} style={s.signIcon} resizeMode="contain" />
                  <Text style={s.signName}>{sign.name}</Text>
                  <Text style={s.signDate}>{sign.date}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'select-timeframe' && selectedSign && (
          <View style={s.section}>
            <View style={s.selectedSignCard}>
              <Image source={selectedSign.image} style={s.selSignIcon} resizeMode="contain" />
              <View>
                <Text style={s.selSignName}>{selectedSign.name}</Text>
                <Text style={s.signDate}>{selectedSign.date}</Text>
              </View>
              <TouchableOpacity onPress={() => setStep('select-sign')} style={s.changeBtn}>
                <Text style={s.changeText}>변경</Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.title, { fontSize: 18 }]}>어떤 운세가 궁금하신가요?</Text>
            {TIMEFRAMES.map((tf) => (
              <TouchableOpacity key={tf.id} style={s.tfCard} onPress={() => handleTimeframeSelect(tf)}>
                <Text style={s.tfLabel}>{tf.label}</Text>
                <Text style={{ color: 'rgba(218,165,32,0.5)', fontSize: 18 }}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'result' && selectedSign && selectedTimeframe && (
          <View style={s.section}>
            <View style={s.resultHeader}>
              <Image source={selectedSign.image} style={s.resultSignIcon} resizeMode="contain" />
              <Text style={s.resultTitle}>{selectedSign.name} {selectedTimeframe.label}</Text>
              <Text style={s.dateText}>{new Date().toLocaleDateString()} 기준</Text>
            </View>

            <View style={s.resultBox}>
              <Text style={s.resultBoxTitle}>✨ AI 심층 분석</Text>
              {isAnalyzing ? (
                <View style={s.loadingBox}>
                  <ActivityIndicator size="large" color="#818cf8" />
                  <Text style={s.loadingText}>별들의 움직임을 읽고 있습니다...</Text>
                </View>
              ) : (
                <Text style={s.readingText}>{aiReading}</Text>
              )}
            </View>

            {!isAnalyzing && (
              <TouchableOpacity style={s.resetBtn} onPress={reset}>
                <Text style={s.resetText}>다른 별자리 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const BG = '#060815';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 22, color: '#fff' },
  headerSub: { fontSize: 10, color: 'rgba(129,140,248,0.7)', letterSpacing: 2, fontWeight: '700' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#c7d2fe' },
  scroll: { padding: 20, paddingBottom: 60 },
  section: { gap: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  signGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  signCard: { width: (width - 80) / 3, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)', borderRadius: 14, padding: 14, gap: 6 },
  signName: { fontSize: 12, fontWeight: '700', color: '#c7d2fe', textAlign: 'center' },
  signDate: { fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
  selectedSignCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(129,140,248,0.08)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.25)', borderRadius: 16, padding: 16 },
  selSignName: { fontSize: 18, fontWeight: '700', color: '#DAA520' },
  changeBtn: { marginLeft: 'auto' as any, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  changeText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  tfCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.15)', borderRadius: 14, padding: 18 },
  tfLabel: { fontSize: 16, fontWeight: '600', color: '#e0e7ff' },
  resultHeader: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: '#DAA520' },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(129,140,248,0.15)', gap: 12 },
  resultBoxTitle: { fontSize: 16, fontWeight: '700', color: '#818cf8' },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { color: 'rgba(129,140,248,0.7)', fontSize: 13, textAlign: 'center' },
  readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
  resetBtn: { borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  resetText: { fontSize: 15, color: '#818cf8', fontWeight: '700' },
  signIcon: { width: 40, height: 40, marginBottom: 4 },
  selSignIcon: { width: 60, height: 60 },
  resultSignIcon: { width: 80, height: 80, marginBottom: 10 },
});

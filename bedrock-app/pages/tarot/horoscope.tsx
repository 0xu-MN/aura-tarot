import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View, ScrollView,
  StyleSheet, ActivityIndicator, Dimensions, Image
} from 'react-native';
import { PageNavbar, Button, BottomInfo, Txt, PressableEffect } from '@toss/tds-react-native';
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
      <PageNavbar>
        <PageNavbar.Title>별들이 말하는 운명</PageNavbar.Title>
        <PageNavbar.AccessoryButtons>
          <PageNavbar.AccessoryTextButton onPress={step === 'select-sign' ? () => navigation.goBack() : () => setStep(step === 'result' ? 'select-timeframe' : 'select-sign')}>
            뒤로
          </PageNavbar.AccessoryTextButton>
        </PageNavbar.AccessoryButtons>
      </PageNavbar>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 'select-sign' && (
          <View style={s.section}>
            <Txt style={s.title}>본인의 별자리를 선택해주세요</Txt>
            <View style={s.signGrid}>
              {ZODIAC_SIGNS.map((sign) => (
                <PressableEffect key={sign.name} style={s.signCard} onPress={() => handleSignSelect(sign)}>
                  <Image source={sign.image} style={s.signIcon} resizeMode="contain" />
                  <Txt style={s.signName}>{sign.name}</Txt>
                  <Txt style={s.signDate}>{sign.date}</Txt>
                </PressableEffect>
              ))}
            </View>
          </View>
        )}

        {step === 'select-timeframe' && selectedSign && (
          <View style={s.section}>
            <View style={s.selectedSignCard}>
              <Image source={selectedSign.image} style={s.selSignIcon} resizeMode="contain" />
              <View>
                <Txt style={s.selSignName}>{selectedSign.name}</Txt>
                <Txt style={s.signDate}>{selectedSign.date}</Txt>
              </View>
              <Button
                size="tiny"
                type="light"
                style="weak"
                containerStyle={{ marginLeft: 'auto', borderRadius: 20 }}
                onPress={() => setStep('select-sign')}
              >
                변경
              </Button>
            </View>
            <Txt style={[s.title, { fontSize: 18 }]}>어떤 운세가 궁금하신가요?</Txt>
            {TIMEFRAMES.map((tf) => (
              <PressableEffect key={tf.id} style={s.tfCard} onPress={() => handleTimeframeSelect(tf)}>
                <Txt style={s.tfLabel}>{tf.label}</Txt>
                <Txt style={{ color: 'rgba(218,165,32,0.5)', fontSize: 18 }}>→</Txt>
              </PressableEffect>
            ))}
          </View>
        )}

        {step === 'result' && selectedSign && selectedTimeframe && (
          <View style={s.section}>
            <View style={s.resultHeader}>
              <Image source={selectedSign.image} style={s.resultSignIcon} resizeMode="contain" />
              <Txt style={s.resultTitle}>{selectedSign.name} {selectedTimeframe.label}</Txt>
              <Txt style={s.dateText}>{new Date().toLocaleDateString()} 기준</Txt>
            </View>

            <View style={s.resultBox}>
              <Txt style={s.resultBoxTitle}>✨ AI 심층 분석</Txt>
              {isAnalyzing ? (
                <View style={s.loadingBox}>
                  <ActivityIndicator size="large" color="#818cf8" />
                  <Txt style={s.loadingText}>별들의 움직임을 읽고 있습니다...</Txt>
                </View>
              ) : (
                <Txt style={s.readingText}>{aiReading}</Txt>
              )}
            </View>

            {!isAnalyzing && (
              <Button
                size="medium"
                type="primary"
                style="weak"
                containerStyle={{ borderColor: 'rgba(129,140,248,0.3)', borderWidth: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                textStyle={{ color: '#818cf8' }}
                onPress={reset}
              >
                다른 별자리 보기
              </Button>
            )}
          </View>
        )}
        <BottomInfo style={{ backgroundColor: BG, paddingBottom: 40 }}>
          <Txt style={[s.subText, { marginTop: 20 }]}>이 운세는 재미로만 봐주세요. 맹신하지 마세요.</Txt>
        </BottomInfo>
      </ScrollView>
    </View>
  );
}

const BG = '#060815';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#c7d2fe' },
  scroll: { padding: 20, paddingBottom: 60 },
  section: { gap: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  signGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  signCard: { width: (width - 80) / 3, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)', borderRadius: 14, padding: 14, gap: 6 },
  signName: { fontSize: 12, fontWeight: '700', color: '#c7d2fe', textAlign: 'center' },
  signDate: { fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
  selectedSignCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(129,140,248,0.08)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.25)', borderRadius: 16, padding: 16 },
  selSignName: { fontSize: 18, fontWeight: '700', color: '#DAA520' },
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
  signIcon: { width: 40, height: 40, marginBottom: 4 },
  selSignIcon: { width: 60, height: 60 },
  resultSignIcon: { width: 80, height: 80, marginBottom: 10 },
});

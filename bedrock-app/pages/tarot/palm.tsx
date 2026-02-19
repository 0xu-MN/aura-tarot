import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
    View, ScrollView,
    StyleSheet, ActivityIndicator
} from 'react-native';
import { PageNavbar, Button, BottomInfo, Txt } from '@toss/tds-react-native';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/palm', { component: PalmReading });
type Step = 'intro' | 'analyzing' | 'result';

function PalmReading() {
    const navigation = Route.useNavigation();
    const [step, setStep] = useState<Step>('intro');
    const [aiReading, setAiReading] = useState('');

    const startReading = async () => {
        setStep('analyzing');
        try {
            const prompt = `당신은 30년 경력의 전문 손금술사입니다.
AI 손금 분석 서비스를 제공합니다. 사용자의 왼손을 분석한다고 가정하고, 아래 항목별로 창의적이고 개인화된 손금 분석 결과를 작성해주세요:

1. 🌿 생명선 (생명력, 건강, 활력)
2. 🧠 두뇌선 (사고방식, 재능, 창의성)
3. 💕 감정선 (사랑, 인간관계, 감수성)
4. ☀️ 태양선 (성공, 명성, 행운)
5. 💰 운명선 (직업운, 재물운)
6. ✨ 종합 분석 및 오늘의 행운 포인트

각 항목을 2-3문장으로 작성하고, 따뜻하고 희망적인 톤을 유지해주세요. 이모지 적절히 사용.`;
            const result = await callGemini(prompt);
            setAiReading(result);
            setStep('result');
        } catch {
            setAiReading('AI 마스터와의 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
            setStep('result');
        }
    };

    const reset = () => { setStep('intro'); setAiReading(''); };

    return (
        <View style={s.container}>
            <PageNavbar>
                <PageNavbar.Title>AI 손금 분석</PageNavbar.Title>
                <PageNavbar.AccessoryButtons>
                    <PageNavbar.AccessoryTextButton onPress={() => navigation.goBack()}>
                        뒤로
                    </PageNavbar.AccessoryTextButton>
                </PageNavbar.AccessoryButtons>
            </PageNavbar>

            <ScrollView contentContainerStyle={s.scroll}>
                {step === 'intro' && (
                    <View style={s.center}>
                        <View style={s.iconCircle}><Txt style={{ fontSize: 52 }}>🤚</Txt></View>
                        <Txt style={s.title}>손안에 담긴{'\n'}운명의 지도</Txt>
                        <Txt style={s.desc}>손금은 단순한 선이 아니라 당신이 살아온 흔적과{'\n'}나아가야 할 길을 보여주는 고유한 지도입니다.{'\n'}AI 기술을 통해 손금의 깊이와 모양을 정밀 분석해 드립니다.</Txt>

                        <View style={s.featureGrid}>
                            {['🌿 생명선과 건강', '🧠 두뇌선과 재능', '💕 감정선과 인연', '☀️ 태양선과 성공', '💰 운명선과 재물', '✨ 행운 포인트'].map((f, i) => (
                                <View key={i} style={s.featureCard}>
                                    <Txt style={s.featureText}>{f}</Txt>
                                </View>
                            ))}
                        </View>

                    </View>
                )}

                {step === 'analyzing' && (
                    <View style={s.center}>
                        <View style={[s.iconCircle, { width: 120, height: 120, borderRadius: 60 }]}>
                            <Txt style={{ fontSize: 60 }}>🤚</Txt>
                        </View>
                        <ActivityIndicator size="large" color="#DAA520" style={{ marginTop: 20 }} />
                        <Txt style={s.loadingText}>AI가 손금의 결을 분석하는 중입니다...</Txt>
                        <Txt style={[s.desc, { marginTop: 8 }]}>생명선, 두뇌선, 감정선을 확인하고 있어요</Txt>
                    </View>
                )}

                {step === 'result' && (
                    <View style={s.section}>
                        <View style={s.handDisplay}>
                            <Txt style={{ fontSize: 64 }}>🤚</Txt>
                            <Txt style={s.handLabel}>AI 손금 분석 완료</Txt>
                        </View>

                        <View style={s.resultBox}>
                            <Txt style={s.resultTitle}>✨ AI 마스터의 통찰</Txt>
                            <Txt style={s.readingText}>{aiReading}</Txt>
                        </View>

                        <Button
                            size="medium"
                            type="primary"
                            style="weak"
                            containerStyle={{ borderColor: 'rgba(218,165,32,0.3)', borderWidth: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                            textStyle={{ color: GOLD }}
                            onPress={reset}
                        >
                            다시 분석하기
                        </Button>
                    </View>
                )}
                <BottomInfo style={{ backgroundColor: BG, paddingBottom: 40 }}>
                    <Txt style={[s.subText, { marginTop: 20 }]}>이 운세는 재미로만 봐주세요. 맹신하지 마세요.</Txt>
                </BottomInfo>

            </ScrollView>

            {
                step === 'intro' && (
                    <View style={s.fixedBottom}>
                        <PressableEffect
                            style={{
                                backgroundColor: GOLD,
                                borderRadius: 30,
                                height: 56,
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={startReading}
                        >
                            <Txt style={{ color: '#000', fontSize: 17, fontWeight: '800' }}>손금 분석 시작하기</Txt>
                        </PressableEffect>
                    </View>
                )
            }
        </View >
    );
}

const BG = '#040812';
const GOLD = '#DAA520';
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#a5f3fc' },
    scroll: { padding: 20, paddingBottom: 120 },
    center: { alignItems: 'center', paddingTop: 20, gap: 16 },
    section: { gap: 16 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(6,182,212,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)' },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 36 },
    desc: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22 },
    subText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
    featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    featureCard: { backgroundColor: 'rgba(218,165,32,0.07)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    featureText: { fontSize: 13, color: '#fef3c7', fontWeight: '600' },
    loadingText: { fontSize: 16, color: '#a5f3fc', fontWeight: '600', textAlign: 'center', marginTop: 12 },
    handDisplay: { alignItems: 'center', paddingVertical: 20, backgroundColor: 'rgba(218,165,32,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)' },
    handLabel: { fontSize: 14, color: GOLD, fontWeight: '700', marginTop: 8 },
    resultBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)', gap: 12 },
    resultTitle: { fontSize: 16, fontWeight: '700', color: '#fef3c7' },
    readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
    fixedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(4,8,18,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(218,165,32,0.2)' },
});

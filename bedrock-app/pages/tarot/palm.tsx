import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator
} from 'react-native';
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
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
                <Text style={s.headerTitle}>AI 손금 분석</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                {step === 'intro' && (
                    <View style={s.center}>
                        <View style={s.iconCircle}><Text style={{ fontSize: 52 }}>🤚</Text></View>
                        <Text style={s.title}>손안에 담긴{'\n'}운명의 지도</Text>
                        <Text style={s.desc}>손금은 단순한 선이 아니라 당신이 살아온 흔적과{'\n'}나아가야 할 길을 보여주는 고유한 지도입니다.{'\n'}AI 기술을 통해 손금의 깊이와 모양을 정밀 분석해 드립니다.</Text>

                        <View style={s.featureGrid}>
                            {['🌿 생명선과 건강', '🧠 두뇌선과 재능', '💕 감정선과 인연', '☀️ 태양선과 성공', '💰 운명선과 재물', '✨ 행운 포인트'].map((f, i) => (
                                <View key={i} style={s.featureCard}>
                                    <Text style={s.featureText}>{f}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity style={s.mainBtn} onPress={startReading}>
                            <Text style={s.mainBtnText}>손금 분석 시작하기</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 'analyzing' && (
                    <View style={s.center}>
                        <View style={[s.iconCircle, { width: 120, height: 120, borderRadius: 60 }]}>
                            <Text style={{ fontSize: 60 }}>🤚</Text>
                        </View>
                        <ActivityIndicator size="large" color="#DAA520" style={{ marginTop: 20 }} />
                        <Text style={s.loadingText}>AI가 손금의 결을 분석하는 중입니다...</Text>
                        <Text style={[s.desc, { marginTop: 8 }]}>생명선, 두뇌선, 감정선을 확인하고 있어요</Text>
                    </View>
                )}

                {step === 'result' && (
                    <View style={s.section}>
                        <View style={s.handDisplay}>
                            <Text style={{ fontSize: 64 }}>🤚</Text>
                            <Text style={s.handLabel}>AI 손금 분석 완료</Text>
                        </View>

                        <View style={s.resultBox}>
                            <Text style={s.resultTitle}>✨ AI 마스터의 통찰</Text>
                            <Text style={s.readingText}>{aiReading}</Text>
                        </View>

                        <TouchableOpacity style={s.resetBtn} onPress={reset}>
                            <Text style={s.resetText}>다시 분석하기</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const BG = '#040812';
const GOLD = '#DAA520';
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    backIcon: { fontSize: 22, color: '#fff' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#a5f3fc' },
    scroll: { padding: 20, paddingBottom: 60 },
    center: { alignItems: 'center', paddingTop: 20, gap: 16 },
    section: { gap: 16 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(6,182,212,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)' },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 36 },
    desc: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22 },
    featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    featureCard: { backgroundColor: 'rgba(218,165,32,0.07)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    featureText: { fontSize: 13, color: '#fef3c7', fontWeight: '600' },
    mainBtn: { backgroundColor: GOLD, borderRadius: 30, paddingVertical: 16, alignItems: 'center', width: '100%' },
    mainBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
    loadingText: { fontSize: 16, color: '#a5f3fc', fontWeight: '600', textAlign: 'center', marginTop: 12 },
    handDisplay: { alignItems: 'center', paddingVertical: 20, backgroundColor: 'rgba(218,165,32,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)' },
    handLabel: { fontSize: 14, color: GOLD, fontWeight: '700', marginTop: 8 },
    resultBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)', gap: 12 },
    resultTitle: { fontSize: 16, fontWeight: '700', color: '#fef3c7' },
    readingText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
    resetBtn: { borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
    resetText: { fontSize: 15, color: GOLD, fontWeight: '700' },
});

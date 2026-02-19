import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { getRandomCards, TarotCardData } from '../../lib/tarot-data';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/student', { component: StudentSupportTarot });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'question' | 'spread' | 'result';

const QUESTIONS = ['오늘의 학업운은?', '시험 합격할 수 있을까?', '공부 집중이 안 될 때 조언', '친구 관계 조언', '불안한 마음 다스리기'];

function StudentSupportTarot() {
    const navigation = Route.useNavigation();
    const [step, setStep] = useState<Step>('intro');
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [customQuestion, setCustomQuestion] = useState('');
    const [drawnCard, setDrawnCard] = useState<{ card: TarotCardData; isReversed: boolean } | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [aiReading, setAiReading] = useState('');
    const [healingTip, setHealingTip] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleQuestionSelect = (q: string) => { setSelectedQuestion(q); setStep('spread'); };
    const handleCustomSubmit = () => { if (customQuestion.trim()) { setSelectedQuestion(customQuestion); setStep('spread'); } };

    const handleCardPick = async () => {
        const cards = getRandomCards(1);
        setDrawnCard(cards[0]);
        setStep('result');
        fetchReading(cards[0], selectedQuestion || customQuestion);
    };

    const fetchReading = async (card: { card: TarotCardData; isReversed: boolean }, q: string) => {
        setIsAnalyzing(true);
        try {
            const prompt = `질문: ${q}
(학생/수험생을 위한 응원 타로입니다. 말투는 따뜻하고 부드럽게 해요.)
카드: ${card.card.koreanName} (${card.isReversed ? '역방향' : '정방향'})

다음 구조로 해석해주세요:
1. 공감 (1문장 - "지친 마음이 느껴져요..." 같은 공감)
2. 카드 의미 (긍정적으로 해석) (1문장)
3. 동기부여 메시지 (2문장)
[TIP] 구체적인 힐링 행동 팁 (1문장)`;
            const result = await callGemini(prompt);
            const parts = result.split('[TIP]');
            if (parts.length > 1) {
                setAiReading(parts[0].trim());
                setHealingTip(parts[1].trim());
            } else {
                setAiReading(result);
                setHealingTip('잠시 눈을 감고 1분만 명상을 해보세요.');
            }
        } catch {
            setAiReading('오늘도 정말 수고 많았어요. 당신의 노력은 반드시 빛을 발할 거예요!');
            setHealingTip('잠깐 스트레칭하고 물 한 잔 마시며 쉬어가세요.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => { setStep('intro'); setSelectedQuestion(''); setCustomQuestion(''); setDrawnCard(null); setIsRevealed(false); setAiReading(''); setHealingTip(''); };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backIcon}>←</Text></TouchableOpacity>
                <Text style={s.headerTitle}>수험생 응원 타로</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
                {step === 'intro' && (
                    <View style={s.center}>
                        <View style={s.iconCircle}><Text style={{ fontSize: 48 }}>📚</Text></View>
                        <Text style={s.title}>오늘도 수고한 너에게</Text>
                        <Text style={s.desc}>공부하느라 힘든 하루였죠?{'\n'}타로가 작은 응원 보낼게요 ✨</Text>
                        <TouchableOpacity style={s.mainBtn} onPress={() => setStep('question')}><Text style={s.mainBtnText}>오늘의 응원 카드 뽑기</Text></TouchableOpacity>
                    </View>
                )}

                {step === 'question' && (
                    <View style={s.section}>
                        <Text style={s.title}>가장 듣고 싶은 응원이나{'\n'}고민이 있나요?</Text>
                        <View style={s.inputRow}>
                            <TextInput style={[s.input, { flex: 1 }]} value={customQuestion} onChangeText={setCustomQuestion}
                                placeholder="직접 고민이나 질문을 입력해보세요" placeholderTextColor="rgba(52,211,153,0.4)" />
                            <TouchableOpacity style={[s.sendBtn, !customQuestion.trim() && { opacity: 0.5 }]} onPress={handleCustomSubmit}>
                                <Text style={{ color: '#000', fontSize: 18, fontWeight: '700' }}>→</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={s.orText}>또는 추천 질문 선택</Text>
                        {QUESTIONS.map((q, i) => (
                            <TouchableOpacity key={i} style={s.qBtn} onPress={() => handleQuestionSelect(q)}>
                                <Text style={s.qBtnText}>{q}</Text>
                                <Text style={s.qArrow}>→</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {step === 'spread' && (
                    <View style={s.section}>
                        <Text style={s.title}>마음을 가라앉히고{'\n'}한 장을 선택해주세요</Text>
                        <View style={s.cardGrid}>
                            {[...Array(9)].map((_, idx) => (
                                <TouchableOpacity key={idx} style={s.cardBack} onPress={handleCardPick}>
                                    <Text style={{ fontSize: 30 }}>🃏</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {step === 'result' && drawnCard && (
                    <View style={s.section}>
                        <TouchableOpacity onPress={() => setIsRevealed(true)} style={s.cardFront} activeOpacity={0.8}>
                            {isRevealed ? (
                                <Image source={drawnCard.card.image} style={[s.bigCard, drawnCard.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                            ) : (
                                <View style={s.cardBackFront}><Text style={{ fontSize: 48 }}>🃏</Text></View>
                            )}
                        </TouchableOpacity>

                        {!isRevealed ? (
                            <Text style={[s.subText, { color: '#DAA520' }]}>카드를 터치해서 뒤집어보세요</Text>
                        ) : (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <Text style={s.cardBigName}>{drawnCard.card.koreanName}{drawnCard.isReversed ? ' (역방향)' : ''}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{drawnCard.card.name}</Text>
                            </View>
                        )}

                        {isRevealed && (
                            <View style={s.resultBox}>
                                <Text style={s.resultTo}>TO. 빛나는 너에게 ✨</Text>
                                <Text style={s.questionText}>Q. {selectedQuestion || customQuestion}</Text>
                                {isAnalyzing ? (
                                    <View style={s.loadingBox}>
                                        <ActivityIndicator size="large" color="#34d399" />
                                        <Text style={s.loadingText}>따뜻한 응원의 메시지를 적고 있어요...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={s.readingText}>{aiReading}</Text>
                                        <View style={s.tipBox}>
                                            <Text style={{ fontSize: 20 }}>🌿</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.tipTitle}>오늘의 힐링 팁</Text>
                                                <Text style={s.tipText}>{healingTip}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={s.resetBtn} onPress={reset}>
                                            <Text style={s.resetText}>처음으로 돌아가기</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const GREEN = '#34d399';
const BG = '#0a0a12';
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    backIcon: { fontSize: 22, color: '#fff' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#6ee7b7' },
    scroll: { padding: 20, paddingBottom: 60 },
    center: { alignItems: 'center', paddingTop: 40, gap: 20 },
    section: { gap: 16 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(52,211,153,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
    title: { fontSize: 24, fontWeight: '800', color: '#ecfdf5', textAlign: 'center' },
    desc: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 24 },
    subText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
    mainBtn: { backgroundColor: GREEN, borderRadius: 30, paddingVertical: 16, alignItems: 'center', width: '100%' },
    mainBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
    inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff' },
    sendBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
    orText: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginVertical: 4 },
    qBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.15)', borderRadius: 12, padding: 14 },
    qBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    qArrow: { fontSize: 14, color: 'rgba(52,211,153,0.6)' },
    cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    cardBack: { width: (width - 80) / 3, aspectRatio: 0.65, borderRadius: 10, backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', justifyContent: 'center', alignItems: 'center' },
    cardFront: { alignItems: 'center' },
    bigCard: { width: 140, height: 210, borderRadius: 12 },
    cardBackFront: { width: 140, height: 210, borderRadius: 12, backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', justifyContent: 'center', alignItems: 'center' },
    cardBigName: { fontSize: 22, fontWeight: '800', color: '#34d399' },
    resultBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(52,211,153,0.1)', gap: 16 },
    resultTo: { fontSize: 16, fontWeight: '700', color: '#fff' },
    questionText: { fontSize: 13, color: 'rgba(52,211,153,0.7)' },
    loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
    loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
    readingText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
    tipBox: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 12, padding: 14 },
    tipTitle: { fontSize: 13, fontWeight: '700', color: GREEN, marginBottom: 4 },
    tipText: { fontSize: 13, color: 'rgba(209,250,229,0.8)' },
    resetBtn: { alignItems: 'center', paddingVertical: 12 },
    resetText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
});

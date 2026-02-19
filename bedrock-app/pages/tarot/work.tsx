import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
    View, ScrollView, TextInput,
    StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { PageNavbar, BottomInfo, Txt, PressableEffect } from '@toss/tds-react-native';
import { getRandomCards, TarotCardData } from '../../lib/tarot-data';
import { ASSETS } from '../../lib/assets';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/work', { component: WorkLuck });
const { width } = Dimensions.get('window');
type Step = 'intro' | 'question' | 'spread' | 'result';

const QUESTIONS = ['오늘 직장운 어때?', '내일 회의 잘 될까?', '이직 타이밍은?', '상사/동료 관계 조언'];

function WorkLuck() {
    const navigation = Route.useNavigation();
    const [step, setStep] = useState<Step>('intro');
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [customQuestion, setCustomQuestion] = useState('');
    const [drawnCard, setDrawnCard] = useState<{ card: TarotCardData; isReversed: boolean } | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [aiReading, setAiReading] = useState('');
    const [workMission, setWorkMission] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleQuestionSelect = (questionText: string) => { setSelectedQuestion(questionText); setStep('spread'); };
    const handleCustomSubmit = () => { if (customQuestion.trim()) { setSelectedQuestion(customQuestion); setStep('spread'); } };

    const handleCardSelect = async () => {
        const cards = getRandomCards(1);
        if (cards && cards[0]) {
            setDrawnCard(cards[0]);
            setStep('result');
            fetchReading(cards[0], selectedQuestion || customQuestion);
        }
    };

    const fetchReading = async (card: { card: TarotCardData; isReversed: boolean }, q: string) => {
        setIsAnalyzing(true);
        try {
            const prompt = `질문: ${q}
(직장인을 위한 하루 한 장 위로 타로입니다. 힐링과 실질적인 조언 위주로 편안하게 해주세요.)
카드: ${card.card.koreanName} (${card.isReversed ? '역방향' : '정방향'})

다음 구조로 해석해주세요:
1. 공감/도입 (1문장)
2. 카드 해석 (2문장)
3. 실질적인 조언 (2문장)
[MISSION] 오늘의 퇴근 미션 (1문장)`;
            const result = await callGemini(prompt);
            const parts = result.split('[MISSION]');
            const [readingPart, missionPart] = parts;
            if (parts.length > 1 && readingPart && missionPart) {
                setAiReading(readingPart.trim());
                setWorkMission(missionPart.trim());
            } else {
                setAiReading(result);
                setWorkMission('오늘은 야근 금지! 일찍 퇴근해서 좋아하는 것을 하며 푹 쉬세요.');
            }
        } catch {
            setAiReading('오늘도 치열한 하루 수고 많으셨어요. 내일은 더 좋은 기운이 함께할 거예요.');
            setWorkMission('좋아하는 음악을 들으며 퇴근길 산책하기');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => { setStep('intro'); setSelectedQuestion(''); setCustomQuestion(''); setDrawnCard(null); setIsRevealed(false); setAiReading(''); setWorkMission(''); };

    return (
        <View style={s.container}>
            <PageNavbar>
                <PageNavbar.Title>직장인 힐링 타로</PageNavbar.Title>
                <PageNavbar.AccessoryButtons>
                    <PageNavbar.AccessoryTextButton onPress={() => navigation.goBack()}>
                        뒤로
                    </PageNavbar.AccessoryTextButton>
                </PageNavbar.AccessoryButtons>
            </PageNavbar>

            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
                {step === 'intro' && (
                    <View style={s.center}>
                        <View style={s.iconCircle}><Txt style={{ fontSize: 48 }}>☕</Txt></View>
                        <Txt style={s.title}>오늘도 수고한 직장인에게</Txt>
                        <Txt style={s.desc}>회사에서 힘든 하루였죠?{'\n'}타로가 작은 위로와 내일 힘을 줄게요 🌙</Txt>
                    </View>
                )}

                {step === 'question' && (
                    <View style={s.section}>
                        <Txt style={s.title}>가장 듣고 싶은 위로나{'\n'}고민이 있나요?</Txt>
                        <View style={s.inputRow}>
                            <TextInput style={[s.input, { flex: 1 }]} value={customQuestion} onChangeText={setCustomQuestion}
                                placeholder="직접 고민이나 질문을 입력해보세요" placeholderTextColor="rgba(255,215,0,0.4)" />
                            <PressableEffect style={[s.sendBtn, !customQuestion.trim() && { opacity: 0.5 }]} onPress={handleCustomSubmit}>
                                <Txt style={{ color: '#000', fontSize: 18, fontWeight: '700' }}>→</Txt>
                            </PressableEffect>
                        </View>
                        <Txt style={s.orText}>또는 추천 질문 선택</Txt>
                        {QUESTIONS.map((q, i) => (
                            <PressableEffect key={i} style={s.qBtn} onPress={() => handleQuestionSelect(q)}>
                                <Txt style={s.qBtnText}>{q}</Txt>
                                <Txt style={s.qArrow}>→</Txt>
                            </PressableEffect>
                        ))}
                    </View>
                )}

                {step === 'spread' && (
                    <View style={s.section}>
                        <Txt style={s.title}>마음을 가라앉히고{'\n'}한 장을 선택해주세요</Txt>
                        <View style={s.cardGrid}>
                            {[...Array(9)].map((_, idx) => (
                                <PressableEffect key={idx} style={s.cardBack} onPress={handleCardSelect}>
                                    <Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 10 }} resizeMode="cover" />
                                </PressableEffect>
                            ))}
                        </View>
                    </View>
                )}

                {step === 'result' && drawnCard && (
                    <View style={s.section}>
                        <PressableEffect onPress={() => setIsRevealed(true)} style={s.cardFront}>
                            {isRevealed ? (
                                <Image source={drawnCard.card.image}
                                    style={[s.bigCard, drawnCard.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                            ) : (
                                <View style={s.cardBackFront}><Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" /></View>
                            )}
                        </PressableEffect>

                        {!isRevealed ? (
                            <Txt style={[s.subText, { color: '#DAA520' }]}>카드를 터치해서 뒤집어보세요</Txt>
                        ) : (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <Txt style={s.cardBigName}>{drawnCard.card.koreanName}{drawnCard.isReversed ? ' (역방향)' : ''}</Txt>
                                <Txt style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{drawnCard.card.name}</Txt>
                            </View>
                        )}

                        {isRevealed && (
                            <View style={s.resultBox}>
                                <Txt style={s.resultTo}>TO. 묵묵히 빛나는 당신에게 ✨</Txt>
                                <Txt style={s.questionText}>Q. {selectedQuestion || customQuestion}</Txt>
                                {isAnalyzing ? (
                                    <View style={s.loadingBox}>
                                        <ActivityIndicator size="large" color="#DAA520" />
                                        <Txt style={s.loadingText}>당신을 위한 위로와 조언을 적고 있어요...</Txt>
                                    </View>
                                ) : (
                                    <>
                                        <Txt style={s.readingText}>{aiReading}</Txt>
                                        <View style={s.missionBox}>
                                            <Txt style={{ fontSize: 20 }}>☕</Txt>
                                            <View style={{ flex: 1 }}>
                                                <Txt style={s.missionTitle}>오늘의 퇴근 미션</Txt>
                                                <Txt style={s.missionText}>{workMission}</Txt>
                                            </View>
                                        </View>
                                        <PressableEffect
                                            style={{
                                                borderColor: 'rgba(218,165,32,0.5)',
                                                borderWidth: 1,
                                                borderRadius: 30,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 48,
                                                width: '100%'
                                            }}
                                            onPress={reset}
                                        >
                                            <Txt style={{ color: '#DAA520', fontSize: 15, fontWeight: '600' }}>처음으로 돌아가기</Txt>
                                        </PressableEffect>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                )}
                <BottomInfo style={{ backgroundColor: BG, paddingBottom: 40 }}>
                    <Txt style={[s.subText, { marginTop: 20 }]}>이 운세는 재미로만 봐주세요. 맹신하지 마세요.</Txt>
                </BottomInfo>
            </ScrollView>

            {step === 'intro' && (
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
                        onPress={() => setStep('question')}
                    >
                        <Txt style={{ color: '#000', fontSize: 17, fontWeight: '800' }}>오늘의 직장운 보기</Txt>
                    </PressableEffect>
                </View>
            )}
        </View>
    );
}

const GOLD = '#DAA520';
const BG = '#0a0a12';
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fcd34d' },
    scroll: { padding: 20, paddingBottom: 120 },
    center: { alignItems: 'center', paddingTop: 40, gap: 20 },
    section: { gap: 16 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(218,165,32,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)' },
    title: { fontSize: 24, fontWeight: '800', color: '#fef3c7', textAlign: 'center' },
    desc: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 24 },
    subText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
    inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff' },
    sendBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center' },
    orText: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginVertical: 4 },
    qBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.15)', borderRadius: 12, padding: 14 },
    qBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    qArrow: { fontSize: 14, color: 'rgba(218,165,32,0.6)' },
    cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    cardBack: { width: (width - 80) / 3, aspectRatio: 0.65, borderRadius: 10, backgroundColor: 'rgba(218,165,32,0.1)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', justifyContent: 'center', alignItems: 'center' },
    cardFront: { alignItems: 'center' },
    bigCard: { width: 140, height: 210, borderRadius: 12 },
    cardBackFront: { width: 140, height: 210, borderRadius: 12, backgroundColor: 'rgba(218,165,32,0.1)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)', justifyContent: 'center', alignItems: 'center' },
    cardBigName: { fontSize: 22, fontWeight: '800', color: GOLD },
    resultBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(218,165,32,0.1)', gap: 16 },
    resultTo: { fontSize: 16, fontWeight: '700', color: '#fff' },
    questionText: { fontSize: 13, color: 'rgba(218,165,32,0.7)' },
    loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
    loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
    readingText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
    missionBox: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', borderRadius: 12, padding: 14 },
    missionTitle: { fontSize: 13, fontWeight: '700', color: '#60a5fa', marginBottom: 4 },
    missionText: { fontSize: 13, color: 'rgba(219,234,254,0.8)' },
    fixedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(10,10,18,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(218,165,32,0.2)' },
});

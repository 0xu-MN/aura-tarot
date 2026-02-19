import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
    View, ScrollView, TextInput,
    StyleSheet, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { PageNavbar, Button, BottomInfo, Txt, PressableEffect } from '@toss/tds-react-native';
import { getWeightedCards, TarotCardData } from '../../lib/tarot-data';
import { ASSETS } from '../../lib/assets';
import { callGemini } from '../../lib/gemini';

export const Route = createRoute('/tarot/love', { component: LoveTarot });

const { width } = Dimensions.get('window');
type Step = 'intro' | 'question' | 'spread' | 'reading';

const SAMPLE_QUESTIONS = [
    '오늘 연애운은 어때?', '썸 상대가 나를 좋아할까?',
    '짝사랑 성공 가능성 있어?', '데이트 운세 봐줘',
    '이상형 만날 타이밍은?', '현재 연애 상황 분석해줘',
];

function LoveTarot() {
    const navigation = Route.useNavigation();
    const [step, setStep] = useState<Step>('intro');
    const [question, setQuestion] = useState('');
    const [drawnCards, setDrawnCards] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
    const [reading, setReading] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);

    const cardPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const handleCardSelect = (idx: number) => {
        if (selectedCards.includes(idx)) return;
        const next = [...selectedCards, idx];
        setSelectedCards(next);
        if (next.length === 3) {
            setIsLoading(true);
            const cards = getWeightedCards(3, { cups: 5, major: 2, wands: 1, swords: 1, pentacles: 1 });
            setDrawnCards(cards);
            setStep('reading');
            generateReading(cards);
        }
    };

    const generateReading = async (cards: { card: TarotCardData; isReversed: boolean }[]) => {
        if (cards.length < 3) return;
        try {
            const prompt = `당신은 로맨틱하고 감성적인 타로 리더 '로즈'입니다.
사용자의 연애 고민에 대해 [과거-현재-미래] 3장으로 해석해주세요.

질문: ${question}

1. 과거: ${cards[0].card.koreanName} (${cards[0].isReversed ? '역방향' : '정방향'})
2. 현재: ${cards[1].card.koreanName} (${cards[1].isReversed ? '역방향' : '정방향'})
3. 미래: ${cards[2].card.koreanName} (${cards[2].isReversed ? '역방향' : '정방향'})

요청사항:
- 말투: 부드럽고 다정하게 (해요체), 이모지 많이 사용 🌹💖
- 부정적인 카드가 나와도 "이 시련이 더 깊은 사랑을 위한 과정"처럼 긍정적으로 승화해주세요.
- 300자 내외로 핵심만 임팩트 있게.

출력 형식:
## 💖 과거의 흐름
(해석)

## 🌹 현재의 마음
(해석)

## ✨ 우리의 미래
(해석)

## 💌 로즈의 조언
(한 마디 조언)`;
            const result = await callGemini(prompt);
            setReading(result);
        } catch {
            setReading('별들의 연결이 잠시 끊어졌어요. 다시 시도해주세요. 💫');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setStep('intro'); setQuestion(''); setDrawnCards([]);
        setReading(''); setSelectedCards([]);
    };

    return (
        <View style={s.container}>
            <PageNavbar>
                <PageNavbar.Title>연애운 타로</PageNavbar.Title>
                <PageNavbar.AccessoryButtons>
                    <PageNavbar.AccessoryTextButton onPress={() => navigation.goBack()}>
                        뒤로
                    </PageNavbar.AccessoryTextButton>
                </PageNavbar.AccessoryButtons>
            </PageNavbar>

            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

                {step === 'intro' && (
                    <View style={s.center}>
                        <View style={s.iconCircle}>
                            <Txt style={{ fontSize: 48 }}>🌹</Txt>
                        </View>
                        <Txt style={s.title}>연애운 타로</Txt>
                        <Txt style={s.desc}>
                            썸, 짝사랑, 연애 고민...{'\n'}
                            복잡한 마음의 답을 찾아줄게요 🌹
                        </Txt>
                    </View>
                )}

                {step === 'question' && (
                    <View style={s.section}>
                        <Txt style={s.title}>가장 궁금한 것은?</Txt>
                        <Txt style={s.subText}>구체적으로 물어볼수록 정확해요</Txt>
                        <View style={s.tagRow}>
                            {SAMPLE_QUESTIONS.map((q, i) => (
                                <PressableEffect key={i} style={s.tag} onPress={() => setQuestion(q)}>
                                    <Txt style={s.tagText}>{q}</Txt>
                                </PressableEffect>
                            ))}
                        </View>
                        <TextInput
                            style={s.input} value={question}
                            onChangeText={setQuestion}
                            placeholder="직접 입력하거나 위에서 선택하세요"
                            placeholderTextColor="rgba(244,114,182,0.4)"
                            multiline
                        />
                        <Button
                            size="large"
                            type="primary"
                            style="fill"
                            disabled={!question.trim()}
                            containerStyle={{ backgroundColor: PINK, borderRadius: 30, height: 56, width: '100%', opacity: !question.trim() ? 0.5 : 1, alignItems: 'center', justifyContent: 'center' }}
                            textStyle={{ color: '#fff', fontSize: 17, fontWeight: '800' }}
                            onPress={() => { if (question.trim()) setStep('spread'); }}
                        >
                            카드 뽑기
                        </Button>
                    </View>
                )}

                {step === 'spread' && (
                    <View style={s.section}>
                        <Txt style={s.title}>과거, 현재, 미래를</Txt>
                        <Txt style={s.subText}>생각하며 3장을 선택해주세요</Txt>
                        <Txt style={s.subText}>({selectedCards.length}/3 선택됨)</Txt>
                        <View style={s.cardGrid}>
                            {cardPositions.map((idx) => (
                                <PressableEffect
                                    key={idx}
                                    style={[s.cardBack, selectedCards.includes(idx) && s.cardSelected]}
                                    onPress={() => handleCardSelect(idx)}
                                >
                                    <Image source={ASSETS.tarotBack} style={{ width: '100%', height: '100%', borderRadius: 6 }} resizeMode="cover" />
                                </PressableEffect>
                            ))}
                        </View>
                    </View>
                )}

                {step === 'reading' && (
                    <View style={s.section}>
                        <View style={s.drawnRow}>
                            {drawnCards.map((c, i) => (
                                <View key={i} style={s.drawnCard}>
                                    <Txt style={s.posLabel}>{i === 0 ? 'PAST' : i === 1 ? 'PRESENT' : 'FUTURE'}</Txt>
                                    <Image
                                        source={c.card.image}
                                        style={[s.cardImg, c.isReversed && { transform: [{ rotate: '180deg' }] }]}
                                    />
                                    <Txt style={s.cardName}>{c.card.koreanName}</Txt>
                                </View>
                            ))}
                        </View>

                        <View style={s.resultBox}>
                            {isLoading ? (
                                <View style={s.loadingBox}>
                                    <ActivityIndicator size="large" color="#f472b6" />
                                    <Txt style={s.loadingText}>장미빛 미래를 읽고 있어요... 🌹</Txt>
                                </View>
                            ) : (
                                <Txt style={s.readingText}>{reading}</Txt>
                            )}
                        </View>

                        {!isLoading && (
                            <Button
                                size="medium"
                                type="primary"
                                style="weak"
                                containerStyle={{ borderColor: 'rgba(244,114,182,0.3)', borderWidth: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                                textStyle={{ color: PINK }}
                                onPress={reset}
                            >
                                다시 뽑기
                            </Button>
                        )}
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
                                backgroundColor: PINK,
                                borderRadius: 30,
                                height: 56,
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => setStep('question')}
                        >
                            <Txt style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>지금 확인하기</Txt>
                        </PressableEffect>
                    </View>
                )
            }
        </View >
    );
}

const PINK = '#f472b6';
const BG = '#1a0b2e';
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#f9d0e7' },
    scroll: { padding: 20, paddingBottom: 120 },
    center: { alignItems: 'center', paddingTop: 40, gap: 20 },
    section: { gap: 16 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(244,114,182,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(244,114,182,0.2)' },
    title: { fontSize: 28, fontWeight: '800', color: '#f9d0e7', textAlign: 'center' },
    desc: { fontSize: 15, color: 'rgba(244,114,182,0.7)', textAlign: 'center', lineHeight: 24 },
    subText: { fontSize: 13, color: 'rgba(244,114,182,0.6)', textAlign: 'center' },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)', backgroundColor: 'rgba(244,114,182,0.05)' },
    tagText: { fontSize: 12, color: 'rgba(244,114,182,0.8)' },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)', borderRadius: 12, padding: 14, fontSize: 15, color: '#f9d0e7', minHeight: 60 },
    cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    cardBack: { width: (width - 80) / 4, aspectRatio: 0.65, borderRadius: 8, backgroundColor: 'rgba(244,114,182,0.15)', borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)', justifyContent: 'center', alignItems: 'center' },
    cardSelected: { backgroundColor: 'rgba(244,114,182,0.4)', borderColor: PINK },
    drawnRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
    drawnCard: { alignItems: 'center', gap: 6 },
    posLabel: { fontSize: 10, fontWeight: '800', color: PINK, letterSpacing: 1 },
    cardImg: { width: 80, height: 120, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)' },
    cardName: { fontSize: 10, color: 'rgba(249,208,231,0.8)', textAlign: 'center', maxWidth: 80 },
    resultBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(244,114,182,0.2)' },
    loadingBox: { alignItems: 'center', gap: 16, paddingVertical: 30 },
    loadingText: { color: 'rgba(244,114,182,0.7)', fontSize: 14 },
    readingText: { fontSize: 14, color: '#f9d0e7', lineHeight: 24 },
    fixedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(26,11,46,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(244,114,182,0.2)' },
});

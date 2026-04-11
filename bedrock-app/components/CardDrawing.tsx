import { GlobalAlert } from "../components/AlertProvider";
import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
    Text,
} from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { getRemainingDraws, incrementDailyDrawCount } from '../lib/storage';

interface CardDrawingProps {
    onDrawCard: (question: string) => void;
}

const AI_SUGGESTED_QUESTIONS = [
    '오늘 나에게 필요한 조언은?',
    '현재 나의 연애운은?',
    '새로운 시작에 대한 조언',
    '지금 집중해야 할 것은?',
];

// ─── 광고 ID ─────────────────────────────────────────────────
// 테스트 중에는 아래 테스트 ID를 사용해야 합니다 (정책 준수)
const REWARDED_AD_ID = 'ait-ad-test-rewarded-id';
const BANNER_AD_ID = 'ait-ad-test-banner-id';
// 실제 ID (운영 시 교체): 
// REWARDED: ait.v2.live.958d0988987d436a
// BANNER: ait.v2.live.b0a7628b7d8f4f06
// ─────────────────────────────────────────────────────────────

// 리워드 광고 호출
const showRewardedAd = (onRewardSuccess: () => void): void => {
    // 1. 광고 먼저 로드 (실제 기기 테스트 권장)
    loadFullScreenAd({
        options: { adGroupId: REWARDED_AD_ID },
        onEvent: (event) => {
            if (event.type === 'loaded') {
                // 2. 로드 완료 후 노출
                showFullScreenAd({
                    options: { adGroupId: REWARDED_AD_ID },
                    onEvent: (showEvent) => {
                        if (showEvent.type === 'userEarnedReward') {
                            onRewardSuccess();
                        } else if (showEvent.type === 'dismissed') {
                            console.log('Ad Dismissed');
                        }
                    },
                    onError: (err) => {
                        console.error('Show Ad Error:', err);
                        GlobalAlert.alert?.('알림', '광고를 표시하는 중 오류가 발생했습니다.');
                    }
                });
            }
        },
        onError: (err) => {
            console.error('Load Ad Error:', err);
            GlobalAlert.alert?.('알림', '광고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
    });
};

export const CardDrawing: React.FC<CardDrawingProps> = ({ onDrawCard }) => {
    const [question, setQuestion] = useState('');
    const [remainingDraws, setRemainingDraws] = useState(3);
    const [isAdLoading, setIsAdLoading] = useState(false);

    React.useEffect(() => {
        loadRemainingDraws();
    }, []);

    const loadRemainingDraws = async () => {
        const remaining = await getRemainingDraws(3);
        setRemainingDraws(remaining);
    };

    const handleDraw = async () => {
        if (!question.trim()) {
            GlobalAlert.alert?.('질문 필요', '질문을 입력해주세요');
            return;
        }
        if (remainingDraws <= 0) return;

        await incrementDailyDrawCount();
        await loadRemainingDraws();
        onDrawCard(question);
        setQuestion('');
    };

    const handleWatchAd = async () => {
        if (!question.trim()) {
            GlobalAlert.alert?.('질문 필요', '광고 시청 전에 질문을 먼저 입력해주세요');
            return;
        }

        setIsAdLoading(true);
        try {
            showRewardedAd(() => {
                // 보상 획득 시 콜백
                onDrawCard(question);
                setQuestion('');
            });
        } finally {
            setIsAdLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Txt style={styles.icon}>✨</Txt>
                <Txt style={styles.title}>오늘의 카드 뽑기</Txt>
            </View>

            {/* Question Input */}
            <View style={styles.inputSection}>
                <Txt style={styles.label}>카드에게 물어볼 질문</Txt>
                <TextInput
                    style={styles.textInput}
                    placeholder="예: 오늘 나에게 필요한 조언은 무엇인가요?"
                    placeholderTextColor="#666"
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                    numberOfLines={3}
                />
            </View>

            {/* AI Suggestions */}
            <View style={styles.suggestionsSection}>
                <View style={styles.suggestionHeader}>
                    <Txt style={styles.lightbulb}>💡</Txt>
                    <Txt style={styles.suggestionLabel}>AI 추천 질문</Txt>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {AI_SUGGESTED_QUESTIONS.map((suggested, index) => (
                        <PressableEffect
                            key={index}
                            style={styles.suggestionButton}
                            onPress={() => setQuestion(suggested)}
                        >
                            <Txt style={styles.suggestionText}>{suggested}</Txt>
                        </PressableEffect>
                    ))}
                </ScrollView>
            </View>

            {/* 카드 뽑기 버튼 */}
            <PressableEffect onPress={handleDraw}>
                <View style={styles.drawButton}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <Text style={styles.sparkleIcon}>✨</Text>
                        <Text style={styles.drawButtonText}>카드 뽑기</Text>
                    </View>
                </View>
            </PressableEffect>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1b1e',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.3)',
        padding: 20,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    icon: { fontSize: 24 },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#DAA520',
    },
    inputSection: { marginBottom: 16 },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#0f0f10',
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.2)',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    suggestionsSection: { marginBottom: 20 },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    lightbulb: { fontSize: 16 },
    suggestionLabel: {
        fontSize: 13,
        color: '#9ca3af',
    },
    suggestionButton: {
        backgroundColor: '#0f0f10',
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 13,
        color: '#fff',
    },
    drawButton: {
        backgroundColor: '#DAA520',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 12,
        width: '100%',
    },
    sparkleIcon: {
        fontSize: 20,
        marginRight: 8,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    drawButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    adSection: {
        gap: 10,
        marginBottom: 12,
    },
    usedUpBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    usedUpText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    adButton: {
        backgroundColor: 'rgba(99, 102, 241, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    buttonLoading: { opacity: 0.6 },
    adButtonIcon: { fontSize: 20 },
    adButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    adInfoText: {
        fontSize: 11,
        color: '#6b7280',
        textAlign: 'center',
    },
    infoText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 12,
    },
});
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
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

export const CardDrawing: React.FC<CardDrawingProps> = ({ onDrawCard }) => {
    const [question, setQuestion] = useState('');
    const [remainingDraws, setRemainingDraws] = useState(3);

    // Load remaining draws on mount
    React.useEffect(() => {
        loadRemainingDraws();
    }, []);

    const loadRemainingDraws = async () => {
        const remaining = await getRemainingDraws(3);
        setRemainingDraws(remaining);
    };

    const handleDraw = async () => {
        if (!question.trim()) {
            Alert.alert('질문 필요', '질문을 입력해주세요');
            return;
        }

        if (remainingDraws <= 0) {
            Alert.alert('사용 완료', '오늘의 무료 카드 뽑기를 모두 사용했습니다.\n내일 다시 이용해주세요! ✨');
            return;
        }

        await incrementDailyDrawCount();
        await loadRemainingDraws();
        onDrawCard(question);
        setQuestion('');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.icon}>✨</Text>
                <Text style={styles.title}>오늘의 카드 뽑기</Text>
            </View>

            {/* Daily Limit Badge */}
            <View style={styles.limitBadge}>
                <Text style={styles.limitText}>
                    오늘 남은 횟수: {remainingDraws}/3
                </Text>
            </View>

            {/* Question Input */}
            <View style={styles.inputSection}>
                <Text style={styles.label}>카드에게 물어볼 질문</Text>
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
                    <Text style={styles.lightbulb}>💡</Text>
                    <Text style={styles.suggestionLabel}>AI 추천 질문</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {AI_SUGGESTED_QUESTIONS.map((suggested, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionButton}
                            onPress={() => setQuestion(suggested)}
                        >
                            <Text style={styles.suggestionText}>{suggested}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Draw Button */}
            <TouchableOpacity
                style={[styles.drawButton, remainingDraws <= 0 && styles.drawButtonDisabled]}
                onPress={handleDraw}
                disabled={remainingDraws <= 0}
            >
                <Text style={styles.sparkleIcon}>✨</Text>
                <Text style={styles.drawButtonText}>
                    {remainingDraws > 0 ? '카드 뽑기' : '오늘 사용 완료'}
                </Text>
            </TouchableOpacity>

            {/* Info Text */}
            <Text style={styles.infoText}>
                베타 기간 동안 하루 3회 무료 이용 가능
            </Text>
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
    icon: {
        fontSize: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#DAA520',
    },
    limitBadge: {
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    limitText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#DAA520',
    },
    inputSection: {
        marginBottom: 16,
    },
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
    suggestionsSection: {
        marginBottom: 20,
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    lightbulb: {
        fontSize: 16,
    },
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
        gap: 8,
        marginBottom: 12,
    },
    drawButtonDisabled: {
        backgroundColor: '#666',
        opacity: 0.5,
    },
    sparkleIcon: {
        fontSize: 20,
    },
    drawButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    infoText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});

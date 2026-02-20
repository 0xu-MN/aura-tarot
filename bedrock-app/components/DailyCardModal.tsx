import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { TarotCard } from './TarotCard';
import { TarotCardData, getCardInterpretation } from '../lib/tarot-data';
import { saveReading } from '../lib/storage';

interface DailyCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: TarotCardData;
    isReversed: boolean;
    question: string;
    onConsult?: () => void;
}

export const DailyCardModal: React.FC<DailyCardModalProps> = ({
    isOpen,
    onClose,
    card,
    isReversed,
    question,
    onConsult,
}) => {
    const [isFlipped, setIsFlipped] = useState(true); // Start flipped to show card front
    const interpretation = getCardInterpretation(card, isReversed, question);

    // Auto-save reading when modal opens
    React.useEffect(() => {
        if (isOpen) {
            saveReading({
                question,
                cards: [{ card, isReversed }],
                interpretation,
            });
        }
    }, [isOpen]);

    const handleCardPress = () => {
        // Card is already flipped, do nothing or allow re-flip
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            visible={isOpen}
            animationType="fade"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>오늘의 카드</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {/* Question */}
                        <View style={styles.questionSection}>
                            <Text style={styles.questionLabel}>질문</Text>
                            <Text style={styles.questionText}>"{question}"</Text>
                        </View>

                        {/* Card */}
                        <View style={styles.cardSection}>
                            <TarotCard
                                card={card}
                                isFlipped={isFlipped}
                                isReversed={isReversed}
                                onPress={handleCardPress}
                                size="large"
                            />
                        </View>

                        {/* Interpretation - Always show since card is flipped */}
                        <View style={styles.interpretationSection}>
                            <Text style={styles.interpretationTitle}>해석</Text>
                            <Text style={styles.interpretationText}>{interpretation}</Text>
                        </View>

                        {/* Actions - Always show */}
                        <View style={styles.actionsSection}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    Alert.alert(
                                        '공유 기능',
                                        '공유 기능은 Development Build에서만 사용 가능합니다.\n\nExpo Go는 네이티브 모듈을 지원하지 않습니다.',
                                        [{ text: '확인' }]
                                    );
                                }}
                            >
                                <Text style={styles.actionIcon}>📤</Text>
                                <Text style={styles.actionText}>공유하기 (준비중)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={onConsult}
                            >
                                <Text style={styles.actionIcon}>💬</Text>
                                <Text style={styles.actionText}>상담하기</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                        <Text style={styles.doneButtonText}>완료</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: 500,
        maxHeight: '90%',
        backgroundColor: '#1a1b1e',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#DAA520',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(218, 165, 32, 0.3)',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#DAA520',
    },
    closeButton: {
        padding: 4,
    },
    closeIcon: {
        fontSize: 24,
        color: '#9ca3af',
    },
    content: {
        padding: 20,
    },
    questionSection: {
        marginBottom: 24,
    },
    questionLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 6,
    },
    questionText: {
        fontSize: 16,
        color: '#fff',
        fontStyle: 'italic',
    },
    cardSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    tapHint: {
        fontSize: 14,
        color: '#DAA520',
        marginBottom: 16,
        textAlign: 'center',
    },
    interpretationSection: {
        backgroundColor: '#0f0f10',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.2)',
        marginBottom: 20,
    },
    interpretationTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#DAA520',
        marginBottom: 12,
    },
    interpretationText: {
        fontSize: 14,
        color: '#e5e7eb',
        lineHeight: 22,
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.3)',
    },
    actionIcon: {
        fontSize: 16,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#DAA520',
    },
    doneButton: {
        backgroundColor: '#DAA520',
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
});

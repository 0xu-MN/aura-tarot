import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Txt, PressableEffect, Badge } from '@toss/tds-react-native';
import { share, getTossShareLink } from '@apps-in-toss/framework';
import { TarotCard } from './TarotCard';
import { TarotCardData } from '../lib/tarot-data';
import { saveReading } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useDrawLimit } from '../lib/useDrawLimit';
import { DrawAgainModal } from './DrawAgainModal';

interface DailyCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: TarotCardData;
    isReversed: boolean;
    question: string;
    onConsult?: () => void;
    onDrawAgain?: () => void;
}

export const DailyCardModal: React.FC<DailyCardModalProps> = ({
    isOpen,
    onClose,
    card,
    isReversed,
    question,
    onConsult,
    onDrawAgain,
}) => {
    const [isFlipped, setIsFlipped] = useState(true);
    const [interpretation, setInterpretation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    // 결제/광고 모달 표시 여부
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    // 결과를 실제로 보여줄 수 있는 상태인지
    const [resultUnlocked, setResultUnlocked] = useState(false);
    const { canDraw, isChecking, recordDraw, grantExtraDraw } = useDrawLimit('daily', 1);
    const [hasChecked, setHasChecked] = useState(false);

    // 모달이 닫힐 때 상태 초기화
    React.useEffect(() => {
        if (!isOpen) {
            setHasChecked(false);
            setResultUnlocked(false);
            setShowPaymentModal(false);
        }
    }, [isOpen]);

    // 모달 열림 시 한도 체크
    React.useEffect(() => {
        if (isOpen && card && !isChecking && !hasChecked) {
            setHasChecked(true);
            setInterpretation('');

            if (!canDraw) {
                setShowPaymentModal(true);
            } else {
                recordDraw();
                setResultUnlocked(true);
                fetchAIInterpretation();
            }
        }
    }, [isOpen, card, isChecking, hasChecked]);

    const fetchAIInterpretation = async () => {
        setIsLoading(true);
        setInterpretation('솜이가 카드를 신중하게 분석하고 있습니다...');

        try {
            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                body: {
                    type: 'reading',
                    context: {
                        question,
                        cards: [{ name: card.koreanName, isReversed }],
                        username: '방문자'
                    }
                }
            });

            if (error) throw error;

            const aiResult = data.message || '해석을 불러오는 중에 문제가 발생했습니다.';
            setInterpretation(aiResult);

            await saveReading({
                question,
                cards: [{ card, isReversed }],
                interpretation: aiResult,
            });
        } catch (err) {
            console.error('AI Interpretation Error:', err);
            setInterpretation('죄송합니다. 솜이와의 연결이 잠시 원활하지 않습니다. 다시 시도해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlocked = async () => {
        setShowPaymentModal(false);
        await grantExtraDraw();
        setResultUnlocked(true);
        fetchAIInterpretation();
    };

    const handlePaymentCancelled = () => {
        setShowPaymentModal(false);
        onClose();
    };

    const handleShare = async () => {
        try {
            // 주의: OG 이미지는 반드시 https:// 형태의 웹 주소여야 합니다.
            // 로컬 파일 경로는 사용할 수 없으므로, 향후 assets/tarot-save-bg.jpg 이미지를 
            // AWS S3나 Supabase Storage 등 퍼블릭 클라우드에 업로드한 뒤 URL을 교체해야 정상 노출됩니다.
            const ogImageUrl = 'https://i.imgur.com/IuK1vAi.jpg'; // TODO: 교체 필요
            
            const tossLink = await getTossShareLink('intoss://ai-today-one-card/home', ogImageUrl);
            await share({
                message: `[아우라 타로] 오늘의 무료 타로 운세!\n당신의 결과는 '${card.koreanName}' 카드입니다 🔮\n\n앱에서 바로 내 운세 결과 전체를 확인해 보세요.\n${tossLink}`
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <View style={styles.fullscreenOverlay}>
            <View style={styles.container}>
                {/* 상단 헤더 */}
                <View style={styles.header}>
                    <Txt style={styles.headerTitle}>오늘의 타로 결과</Txt>
                    <PressableEffect onPress={onClose} style={styles.closeBtn}>
                        <Txt style={styles.closeBtnText}>닫기</Txt>
                    </PressableEffect>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Question */}
                    <View style={styles.section}>
                        <Txt typography="t7" color="#9ca3af" style={styles.label}>질문</Txt>
                        <Txt typography="t4" color="#fff">"{question}"</Txt>
                    </View>

                    {/* Card Exhibit */}
                    <View style={styles.cardExhibit}>
                        <TarotCard
                            card={card}
                            isFlipped={isFlipped}
                            isReversed={isReversed}
                            size="large"
                        />
                        <Txt typography="t5" color="#DAA520" style={styles.cardName}>
                            {card.koreanName} {isReversed ? '(역방향)' : ''}
                        </Txt>
                    </View>

                    {/* AI Interpretation */}
                    {resultUnlocked && (
                        <View style={styles.interpretationBox}>
                            <View style={styles.interpretationHeader}>
                                <Txt typography="t5" color="#DAA520">솜이의 해석</Txt>
                            </View>

                            <Txt typography="t6" color="#e5e7eb" style={[styles.bodyText, isLoading && styles.loadingText]}>
                                {interpretation}
                            </Txt>
                        </View>
                    )}

                    {/* Actions */}
                    {resultUnlocked && (
                        <>
                            <View style={[styles.buttonRow, { marginBottom: 10 }]}>
                                <PressableEffect style={styles.consultBtn} onPress={onConsult}>
                                    <Txt style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>💬 상담하기</Txt>
                                </PressableEffect>

                                {onDrawAgain && (
                                    <PressableEffect style={styles.drawAgainBtn} onPress={onDrawAgain}>
                                        <Txt style={{ color: '#DAA520', fontSize: 14, fontWeight: '600' }}>🔄 한장 더 뽑기</Txt>
                                    </PressableEffect>
                                )}
                            </View>

                            <PressableEffect style={styles.shareResultBtn} onPress={handleShare}>
                                <Txt style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>💌 결과 공유하기</Txt>
                            </PressableEffect>
                        </>
                    )}

                    <View style={{ width: '100%', marginBottom: 30 }}>
                        <PressableEffect style={styles.exitBtn} onPress={onClose}>
                            <Txt style={{ color: '#6b7280', fontSize: 13, fontWeight: '600' }}>🚪 나가기</Txt>
                        </PressableEffect>
                    </View>
                </ScrollView>
            </View>

            {/* 결제/광고 모달 오버레이 */}
            <DrawAgainModal
                visible={showPaymentModal}
                onClose={handlePaymentCancelled}
                onDrawAgain={handleUnlocked}
                onGoBack={handlePaymentCancelled}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    fullscreenOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#0a0a0b',
        zIndex: 1000,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    closeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    closeBtnText: {
        fontSize: 14,
        color: '#DAA520',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginTop: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    label: {
        marginBottom: 8,
    },
    cardExhibit: {
        alignItems: 'center',
        marginBottom: 32,
    },
    cardName: {
        marginTop: 16,
    },
    interpretationBox: {
        backgroundColor: '#1a1b1e',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.2)',
        marginBottom: 32,
    },
    interpretationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    aiBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    bodyText: {
        lineHeight: 26,
    },
    loadingText: {
        color: '#DAA520',
        opacity: 0.7,
        fontStyle: 'italic',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
        marginBottom: 12,
    },
    consultBtn: {
        flex: 1,
        height: 50,
        backgroundColor: '#DAA520',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawAgainBtn: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.4)',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareResultBtn: {
        width: '100%',
        height: 50,
        backgroundColor: '#DAA520',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    exitBtn: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});

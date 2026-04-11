// 카드 부채꼴(팬) 펼침 애니메이션 컴포넌트
// ★ 설계 원칙:
//   - 팬은 항상 상단 고정 (선택해도 절대 움직이지 않음)
//   - 선택된 카드 슬롯은 팬 아래에 고정 표시
//   - 카드 장수(maxSelect)에 따라 슬롯 크기가 동적 조정됨
import React, { useEffect, useRef } from 'react';
import {
    View,
    Animated,
    StyleSheet,
    Dimensions,
    Image,
} from 'react-native';
import { PressableEffect, Txt } from '@toss/tds-react-native';
import { ASSETS } from '../lib/assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardFanSpreadProps {
    cardCount: number;
    maxSelect: number;
    selectedCards: number[];
    onCardSelect: (index: number) => void;
    accentColor?: string;
    compact?: boolean; // 카드 내부 축소 모드
}

// ─── 팬 카드 사이즈 (크게) ─────────────────────────────────────
const CARD_WIDTH_FULL = 72;
const CARD_HEIGHT_FULL = 115;
const CARD_WIDTH_COMPACT = 48;
const CARD_HEIGHT_COMPACT = 76;
const FAN_HEIGHT_FULL = 260;
const FAN_HEIGHT_COMPACT = 180;
const FAN_RADIUS = SCREEN_WIDTH * 0.9;

// ─── 선택 슬롯 사이즈 (maxSelect에 따라 동적 계산) ─────────────
const getSlotSize = (maxSelect: number, compact?: boolean) => {
    const scale = compact ? 0.65 : 1;
    if (maxSelect === 1) return { w: Math.round(72 * scale), h: Math.round(112 * scale) };
    if (maxSelect === 2) return { w: Math.round(68 * scale), h: Math.round(106 * scale) };
    if (maxSelect === 3) return { w: Math.round(62 * scale), h: Math.round(98 * scale) };
    if (maxSelect === 4) return { w: Math.round(58 * scale), h: Math.round(92 * scale) };
    return { w: Math.round(50 * scale), h: Math.round(80 * scale) }; // 5장
};

export const CardFanSpread: React.FC<CardFanSpreadProps> = ({
    cardCount,
    maxSelect,
    selectedCards,
    onCardSelect,
    accentColor = '#DAA520',
    compact = false,
}) => {
    const cardAnims = useRef<Animated.Value[]>([]);
    const selectedScaleAnims = useRef<Animated.Value[]>(
        Array.from({ length: maxSelect }, () => new Animated.Value(0))
    );

    if (cardAnims.current.length !== cardCount) {
        cardAnims.current = Array.from({ length: cardCount }, () => new Animated.Value(0));
    }

    // 팬 펼침 애니메이션 (마운트 시 1회)
    useEffect(() => {
        const anims = cardAnims.current.map((anim, i) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 450,
                delay: i * 50,
                useNativeDriver: true,
            })
        );
        Animated.stagger(35, anims).start();
    }, []);

    // 선택 시 슬롯 등장 spring 애니메이션
    useEffect(() => {
        const idx = selectedCards.length - 1;
        if (idx >= 0 && idx < selectedScaleAnims.current.length) {
            selectedScaleAnims.current[idx]!.setValue(0);
            Animated.spring(selectedScaleAnims.current[idx]!, {
                toValue: 1,
                useNativeDriver: true,
                tension: 140,
                friction: 9,
            }).start();
        }
    }, [selectedCards.length]);

    // 팬 각도 계산
    const totalAngle = Math.min(cardCount * 5, 80);
    const startAngle = -totalAngle / 2;

    const slotSize = getSlotSize(maxSelect, compact);
    const CARD_W = compact ? CARD_WIDTH_COMPACT : CARD_WIDTH_FULL;
    const CARD_H = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT_FULL;
    const FAN_H = compact ? FAN_HEIGHT_COMPACT : FAN_HEIGHT_FULL;

    return (
        <View style={styles.container}>
            {/* ① 안내 문구 (팬 위, 고정) */}
            <Txt style={[styles.guideText, { color: accentColor }]}>
                {selectedCards.length < maxSelect
                    ? `마음을 집중하고 카드를 선택해 주세요`
                    : `✨ 선택 완료! 결과를 확인하세요`}
            </Txt>

            {/* ② 팬 영역 (고정 높이 — 선택해도 절대 안 움직임) */}
            <View style={[styles.fanContainer, { height: FAN_H }]}>
                {Array.from({ length: cardCount }).map((_, origIdx) => {
                    const angle = cardCount > 1
                        ? startAngle + (totalAngle / (cardCount - 1)) * origIdx
                        : 0;
                    const radian = (angle * Math.PI) / 180;
                    const cardAnim = cardAnims.current[origIdx];
                    const isSelected = selectedCards.includes(origIdx);
                    const isDone = selectedCards.length >= maxSelect;

                    if (!cardAnim) return null;

                    const translateX = cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin(radian) * FAN_RADIUS * 0.22],
                    });
                    const translateY = cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [200, -Math.cos(radian) * FAN_RADIUS * 0.05],
                    });
                    const rotate = cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${angle}deg`],
                    });
                    const scale = cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.4, 1],
                    });

                    return (
                        <Animated.View
                            key={origIdx}
                            style={[
                                styles.cardWrapper,
                                { zIndex: isSelected ? 1 : origIdx + 2 },
                                { transform: [{ translateX }, { translateY }, { rotate }, { scale }] },
                            ]}
                        >
                            <PressableEffect
                                style={[
                                    styles.card,
                                    isSelected && styles.cardSelected,
                                    isSelected && { borderColor: accentColor },
                                ]}
                                onPress={() => {
                                    if (!isDone && !isSelected) {
                                        onCardSelect(origIdx);
                                    }
                                }}
                                disabled={isDone || isSelected}
                            >
                                <Image
                                    source={ASSETS.tarotBack}
                                    style={styles.cardImage}
                                    resizeMode="cover"
                                />
                                {/* 선택된 카드 위에 glow overlay */}
                                {isSelected && (
                                    <View style={[styles.selectedGlow, { backgroundColor: accentColor }]} />
                                )}
                            </PressableEffect>
                        </Animated.View>
                    );
                })}
            </View>

            {/* ③ 선택된 카드 슬롯 (팬 아래 고정) */}
            <View style={styles.selectedRow}>
                {Array.from({ length: maxSelect }).map((_, slotIdx) => {
                    const filled = slotIdx < selectedCards.length;
                    const scaleAnim = selectedScaleAnims.current[slotIdx];
                    return (
                        <Animated.View
                            key={slotIdx}
                            style={[
                                styles.selectedSlot,
                                {
                                    width: slotSize.w,
                                    height: slotSize.h,
                                    borderColor: filled ? accentColor : 'rgba(255,255,255,0.12)',
                                    borderStyle: filled ? 'solid' : 'dashed',
                                },
                                filled && scaleAnim
                                    ? { transform: [{ scale: scaleAnim }] }
                                    : {},
                            ]}
                        >
                            {filled ? (
                                <>
                                    <Image
                                        source={ASSETS.tarotBack}
                                        style={styles.slotImage}
                                        resizeMode="cover"
                                    />
                                    <View style={[styles.slotBadge, { backgroundColor: accentColor }]}>
                                        <Txt style={styles.slotBadgeText}>{slotIdx + 1}</Txt>
                                    </View>
                                </>
                            ) : (
                                <Txt style={styles.slotEmpty}>{slotIdx + 1}</Txt>
                            )}
                        </Animated.View>
                    );
                })}
            </View>

            {/* ④ 카운터 */}
            <Txt style={[styles.countText, { color: accentColor }]}>
                {selectedCards.length} / {maxSelect} 선택됨
            </Txt>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 16,
    },

    guideText: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },

    // ── 팬 ─────────────────────────────────────────────────────
    fanContainer: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cardWrapper: {
        position: 'absolute',
        width: CARD_WIDTH_FULL,
        height: CARD_HEIGHT_FULL,
    },
    card: {
        width: CARD_WIDTH_FULL,
        height: CARD_HEIGHT_FULL,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    cardSelected: {
        borderWidth: 2,
        opacity: 0.4,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    selectedGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.15,
        borderRadius: 10,
    },

    // ── 선택 슬롯 (팬 아래 고정) ───────────────────────────────
    selectedRow: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 6,
    },
    selectedSlot: {
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
        position: 'relative',
    },
    slotImage: {
        width: '100%',
        height: '100%',
    },
    slotBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotBadgeText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '900',
    },
    slotEmpty: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.2)',
        fontWeight: '700',
    },

    // ── 카운터 ───────────────────────────────────────────────────
    countText: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 4,
    },
});

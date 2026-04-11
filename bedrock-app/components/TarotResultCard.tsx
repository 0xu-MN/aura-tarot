import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { TarotCardData } from '../lib/tarot-data';
import { ASSETS } from '../lib/assets';

interface TarotResultCardProps {
    card: TarotCardData;
    isReversed: boolean;
    isRevealed: boolean;
    label: string;
    onFlip: () => void;
    showTutorial?: boolean;
    cardWidth: number;
    cardHeight: number;
}

export const TarotResultCard: React.FC<TarotResultCardProps> = ({
    card,
    isReversed,
    isRevealed,
    label,
    onFlip,
    showTutorial = false,
    cardWidth,
    cardHeight,
}) => {
    const flipAnim = useRef(new Animated.Value(isRevealed ? 1 : 0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(flipAnim, {
            toValue: isRevealed ? 1 : 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [isRevealed]);

    useEffect(() => {
        if (showTutorial && !isRevealed) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, { toValue: -15, duration: 600, useNativeDriver: true }),
                    Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            bounceAnim.stopAnimation();
        }
    }, [showTutorial, isRevealed]);

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['180deg', '90deg', '0deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '-90deg', '-180deg'],
    });

    return (
        <View style={{ alignItems: 'center', width: cardWidth }}>
            <Txt style={styles.label}>{label}</Txt>

            <View style={{ width: cardWidth, height: cardHeight }}>
                {/* 뒷면 (터치 전) */}
                <Animated.View
                    style={[
                        styles.cardContainer,
                        { transform: [{ rotateY: backInterpolate }] },
                        !isRevealed ? { zIndex: 2 } : { zIndex: 1 },
                    ]}
                >
                    <PressableEffect style={styles.cardPressable} onPress={!isRevealed ? onFlip : undefined}>
                        <Image source={ASSETS.tarotBack} style={styles.cardImage} resizeMode="cover" />
                        {showTutorial && !isRevealed && (
                            <Animated.View style={[styles.tutorialOverlay, { transform: [{ translateY: bounceAnim }] }]}>
                                <View style={styles.tutorialBadge}>
                                    <Txt style={styles.tutorialIcon}>👆</Txt>
                                    <Txt style={styles.tutorialText}>터치</Txt>
                                </View>
                            </Animated.View>
                        )}
                    </PressableEffect>
                </Animated.View>

                {/* 앞면 (터치 후) */}
                <Animated.View
                    style={[
                        styles.cardContainer,
                        styles.cardFront,
                        { transform: [{ rotateY: frontInterpolate }] },
                        isRevealed ? { zIndex: 2 } : { zIndex: 1 },
                    ]}
                >
                    <Image
                        source={card.image}
                        style={[styles.cardImage, isReversed && { transform: [{ rotate: '180deg' }] }]}
                        resizeMode="cover"
                    />
                </Animated.View>
            </View>

            <View style={styles.nameContainer}>
                {isRevealed ? <Txt style={styles.cardName}>{card.koreanName}</Txt> : <Txt style={styles.cardNameSecret}>???</Txt>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(52,211,153,0.3)',
        overflow: 'hidden',
    },
    cardFront: {
        backgroundColor: '#000',
    },
    cardPressable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    label: {
        fontSize: 12,
        color: 'rgba(52,211,153,0.9)',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    nameContainer: {
        height: 24,
        marginTop: 6,
        justifyContent: 'center',
    },
    cardName: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontWeight: '600',
    },
    cardNameSecret: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.2)',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 2,
    },
    tutorialOverlay: {
        position: 'absolute',
        zIndex: 10,
    },
    tutorialBadge: {
        backgroundColor: 'rgba(52,211,153,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 8,
    },
    tutorialText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
        marginLeft: 4,
    },
    tutorialIcon: {
        fontSize: 14,
    },
});

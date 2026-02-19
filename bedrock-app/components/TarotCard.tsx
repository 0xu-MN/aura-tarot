import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { TarotCardData } from '../lib/tarot-data';
import { cardUri } from '../lib/assets';

interface TarotCardProps {
    card: TarotCardData;
    isFlipped?: boolean;
    isReversed?: boolean;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
}

export const TarotCard: React.FC<TarotCardProps> = ({
    card,
    isReversed = false,
    size = 'medium',
}) => {
    const sizeStyles = {
        small: { width: 100, height: 170 },
        medium: { width: 140, height: 240 },
        large: { width: 180, height: 310 },
    };

    return (
        <View style={[styles.cardContainer, sizeStyles[size], isReversed && styles.reversed]}>
            <Image
                source={cardUri(card.imageFile)}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardOverlay}>
                <Text style={styles.cardName}>{card.koreanName}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        borderWidth: 3,
        borderColor: '#DAA520',
        elevation: 8,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    reversed: {
        transform: [{ rotate: '180deg' }],
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    cardName: {
        color: '#DAA520',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
});

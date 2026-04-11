import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const BetaBanner: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.badge}>BETA</Text>
                <Text style={styles.text}>
                    베타 서비스 기간입니다. 하루 1회 무료 이용 가능
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.3)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        backgroundColor: '#DAA520',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 11,
        fontWeight: '800',
        color: '#000',
    },
    text: {
        flex: 1,
        fontSize: 13,
        color: '#DAA520',
    },
});

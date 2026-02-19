import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MenuCardProps {
    icon: string;
    title: string;
    description: string;
    badge?: string;
    onPress: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    icon,
    title,
    description,
    badge,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{icon}</Text>
                </View>

                {/* Badge */}
                {badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Description */}
                <Text style={styles.description}>{description}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1b1e',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.3)',
        padding: 16,
        minHeight: 160,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 24,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#DAA520',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#000',
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 13,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 18,
    },
});

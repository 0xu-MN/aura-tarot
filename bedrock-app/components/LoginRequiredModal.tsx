import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';

interface LoginRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
    onRegister: () => void;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
    isOpen,
    onClose,
    onLogin,
    onRegister,
}) => {
    return (
        <Modal visible={isOpen} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🔐</Text>
                    </View>

                    {/* Content */}
                    <Text style={styles.title}>로그인이 필요합니다</Text>
                    <Text style={styles.message}>
                        AI 타로 해석 기능은{'\n'}로그인 후 이용하실 수 있습니다.
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={() => {
                                onClose();
                                onLogin();
                            }}
                        >
                            <Text style={styles.primaryButtonText}>로그인</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={() => {
                                onClose();
                                onRegister();
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>회원가입</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                            <Text style={styles.skipButtonText}>나중에</Text>
                        </TouchableOpacity>
                    </View>
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
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1a1b1e',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.3)',
        padding: 32,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    icon: {
        fontSize: 48,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#DAA520',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttons: {
        width: '100%',
        gap: 12,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#DAA520',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.5)',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#DAA520',
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 14,
        color: '#666',
    },
});

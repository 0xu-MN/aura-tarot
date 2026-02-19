import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
    isOpen,
    onClose,
    onSwitchToRegister,
}) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            Alert.alert('성공', '로그인되었습니다.');
            onClose();
            setEmail('');
            setPassword('');
        } catch (error) {
            Alert.alert('오류', '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        Alert.alert('게스트 모드', '게스트로 계속 이용하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '확인',
                onPress: () => {
                    onClose();
                },
            },
        ]);
    };

    return (
        <Modal visible={isOpen} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>로그인</Text>
                        <Text style={styles.subtitle}>오늘의 운세를 확인하세요</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email */}
                        <View style={styles.field}>
                            <Text style={styles.label}>이메일</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="이메일을 입력하세요"
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.field}>
                            <Text style={styles.label}>비밀번호</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="비밀번호를 입력하세요"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.primaryButtonText}>
                                {loading ? '로그인 중...' : '로그인'}
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>또는</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Guest Mode */}
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleGuestMode}
                        >
                            <Text style={styles.secondaryButtonText}>게스트로 계속하기</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>계정이 없으신가요? </Text>
                        <TouchableOpacity onPress={onSwitchToRegister}>
                            <Text style={styles.link}>회원가입</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeIcon}>✕</Text>
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
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1a1b1e',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.3)',
        padding: 24,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#DAA520',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    form: {
        gap: 16,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e5e7eb',
    },
    input: {
        backgroundColor: '#0f0f10',
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.2)',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        fontSize: 14,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
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
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e5e7eb',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
        fontSize: 12,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 13,
        color: '#9ca3af',
    },
    link: {
        fontSize: 13,
        fontWeight: '700',
        color: '#DAA520',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 18,
        color: '#9ca3af',
    },
});

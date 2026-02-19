import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
    isOpen,
    onClose,
    onSwitchToLogin,
}) => {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!email || !password || !nickname) {
            Alert.alert('오류', '필수 항목을 모두 입력해주세요.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        try {
            await signUp({
                email,
                password,
                nickname,
                name,
                birthDate,
            });
            Alert.alert('성공', '회원가입이 완료되었습니다!');
            onClose();
            resetForm();
        } catch (error) {
            Alert.alert('오류', '회원가입에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNickname('');
        setName('');
        setBirthDate('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={isOpen} animationType="fade" transparent>
            <View style={styles.overlay}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>회원가입</Text>
                            <Text style={styles.subtitle}>기본 정보를 입력해주세요</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Email */}
                            <View style={styles.field}>
                                <Text style={styles.label}>이메일 *</Text>
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
                                <Text style={styles.label}>비밀번호 *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="비밀번호 (최소 6자)"
                                    placeholderTextColor="#666"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.field}>
                                <Text style={styles.label}>비밀번호 확인 *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    placeholderTextColor="#666"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>

                            {/* Nickname */}
                            <View style={styles.field}>
                                <Text style={styles.label}>닉네임 *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="닉네임을 입력하세요"
                                    placeholderTextColor="#666"
                                    value={nickname}
                                    onChangeText={setNickname}
                                />
                                <Text style={styles.hint}>앱에서 이 이름으로 표시됩니다</Text>
                            </View>

                            {/* Name (Optional) */}
                            <View style={styles.field}>
                                <Text style={styles.label}>이름 (선택)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="이름을 입력하세요"
                                    placeholderTextColor="#666"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* Birth Date (Optional) */}
                            <View style={styles.field}>
                                <Text style={styles.label}>생년월일 (선택)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="예: 1990-01-01"
                                    placeholderTextColor="#666"
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                />
                                <Text style={styles.hint}>맞춤 운세 제공에 활용됩니다</Text>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {loading ? '가입 중...' : '가입 완료'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
                            <TouchableOpacity onPress={onSwitchToLogin}>
                                <Text style={styles.link}>로그인</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
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
        alignSelf: 'center',
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
        gap: 6,
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
    hint: {
        fontSize: 11,
        color: '#666',
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

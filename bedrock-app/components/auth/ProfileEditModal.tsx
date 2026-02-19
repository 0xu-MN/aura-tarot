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

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { user, updateProfile } = useAuth();
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [name, setName] = useState(user?.name || '');
    const [birthDate, setBirthDate] = useState(user?.birthDate || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!nickname) {
            Alert.alert('오류', '닉네임을 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                nickname,
                name,
                birthDate,
            });
            Alert.alert('성공', '프로필이 업데이트되었습니다.');
            onClose();
        } catch (error) {
            Alert.alert('오류', '프로필 업데이트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
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
                            <Text style={styles.title}>프로필 수정</Text>
                            <Text style={styles.subtitle}>정보를 업데이트하세요</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Email (Read-only) */}
                            <View style={styles.field}>
                                <Text style={styles.label}>이메일</Text>
                                <View style={styles.readOnlyField}>
                                    <Text style={styles.readOnlyText}>{user?.email || '게스트'}</Text>
                                </View>
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
                            </View>

                            {/* Name */}
                            <View style={styles.field}>
                                <Text style={styles.label}>이름</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="이름을 입력하세요"
                                    placeholderTextColor="#666"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* Birth Date */}
                            <View style={styles.field}>
                                <Text style={styles.label}>생년월일</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="예: 1990-01-01"
                                    placeholderTextColor="#666"
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                />
                                <Text style={styles.hint}>맞춤 운세 제공에 활용됩니다</Text>
                            </View>

                            {/* Buttons */}
                            <View style={styles.buttons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.secondaryButton]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.secondaryButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.primaryButton]}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {loading ? '저장 중...' : '저장'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
    readOnlyField: {
        backgroundColor: '#0a0a0b',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 12,
    },
    readOnlyText: {
        color: '#666',
        fontSize: 14,
    },
    hint: {
        fontSize: 11,
        color: '#666',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
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
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e5e7eb',
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

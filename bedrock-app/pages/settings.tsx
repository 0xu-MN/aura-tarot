import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/auth/LoginModal';
import { RegisterModal } from '../components/auth/RegisterModal';
import { ProfileEditModal } from '../components/auth/ProfileEditModal';
import { getDailyDrawCount } from '../lib/storage';

export const Route = createRoute('/settings', {
  component: SettingsPage,
});

function SettingsPage() {
  const navigation = Route.useNavigation();
  const { user, isGuest, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [dailyDraws, setDailyDraws] = useState(0);

  // Load daily draws
  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const count = await getDailyDrawCount();
    setDailyDraws(count);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            Alert.alert('로그아웃', '게스트 모드로 전환되었습니다.');
          },
        },
      ]
    );
  };

  const handleProfilePress = () => {
    if (isGuest) {
      setShowLogin(true);
    } else {
      setShowProfileEdit(true);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>설정</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity style={styles.section} onPress={handleProfilePress}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.nickname?.substring(0, 1) || '방'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.nickname}님</Text>
              <Text style={styles.profileUsername}>
                {isGuest ? '게스트 모드' : user?.email || '@user'}
              </Text>
            </View>
            <Text style={styles.editHint}>
              {isGuest ? '로그인 >' : '수정 >'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Guest Login Prompt */}
        {isGuest && (
          <View style={styles.guestBanner}>
            <View style={styles.guestContent}>
              <Text style={styles.guestIcon}>✨</Text>
              <View style={styles.guestText}>
                <Text style={styles.guestTitle}>로그인하고 더 많은 기능을</Text>
                <Text style={styles.guestSubtitle}>AI 해석, 기록 저장 등</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setShowLogin(true)}
            >
              <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={styles.sectionTitle}>사용 통계</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dailyDraws}/3</Text>
              <Text style={styles.statLabel}>오늘 사용한 카드</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {isGuest ? '-' : '0'}
              </Text>
              <Text style={styles.statLabel}>총 카드 뽑기</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔔</Text>
            <Text style={styles.sectionTitle}>앱 설정</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>알림 받기</Text>
            <View style={styles.switchPlaceholder} />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>매일 운세 알림</Text>
            <View style={styles.switchPlaceholder} />
          </View>
        </View>

        {/* Logout/Login Buttons */}
        {!isGuest ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => setShowLogin(true)}
            >
              <Text style={styles.authButtonText}>로그인</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authButton, styles.registerButton]}
              onPress={() => setShowRegister(true)}
            >
              <Text style={styles.registerButtonText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#DAA520',
    textShadowColor: 'rgba(218, 165, 32, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  section: {
    backgroundColor: '#1a1b1e',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.2)',
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#DAA520',
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DAA520',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 13,
    color: '#9ca3af',
  },
  editHint: {
    fontSize: 14,
    color: '#666',
  },
  guestBanner: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.3)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  guestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  guestIcon: {
    fontSize: 32,
  },
  guestText: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DAA520',
    marginBottom: 4,
  },
  guestSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  loginButton: {
    backgroundColor: '#DAA520',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#DAA520',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#fff',
  },
  switchPlaceholder: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#444',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1b1e',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  authButton: {
    flex: 1,
    backgroundColor: '#DAA520',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  authButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.5)',
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DAA520',
  },
  version: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
  },
});

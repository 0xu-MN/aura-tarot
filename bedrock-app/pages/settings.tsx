import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { getDailyDrawCount } from '../lib/storage';

export const Route = createRoute('/settings', {
  component: SettingsPage,
});

function SettingsPage() {
  const navigation = Route.useNavigation();
  const [dailyDraws, setDailyDraws] = useState(0);

  // Load daily draws
  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const count = await getDailyDrawCount();
    setDailyDraws(count);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>설정</Text>
        </View>

        {/* Guest Banner (Simplified for now) */}
        <View style={styles.guestBanner}>
          <View style={styles.guestContent}>
            <Text style={styles.guestIcon}>✨</Text>
            <View style={styles.guestText}>
              <Text style={styles.guestTitle}>운세 기록은 기기에 저장됩니다</Text>
              <Text style={styles.guestSubtitle}>앱을 삭제하면 기록이 사라질 수 있어요</Text>
            </View>
          </View>
        </View>

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
              <Text style={styles.statValue}>-</Text>
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

        {/* Legal Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>법적 정보</Text>
          </View>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('/privacy')}
          >
            <Text style={styles.settingLabel}>개인정보처리방침</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  chevron: {
    fontSize: 22,
    color: '#9ca3af',
  },
});

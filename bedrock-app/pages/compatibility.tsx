import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ASSETS } from '../lib/assets';

export const Route = createRoute('/compatibility', {
  component: CompatibilityPage,
});

function CompatibilityPage() {
  const navigation = Route.useNavigation();

  return (
    <View style={styles.container}>
      <Image
        source={ASSETS.compatibilityTarot}
        style={[StyleSheet.absoluteFill as any, { opacity: 0.3 }]}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMPATIBILITY</Text>
        </View>
        <Text style={styles.title}>궁합 타로</Text>
        <Text style={styles.desc}>우리는 잘 맞는 사이일까요?</Text>
        <TouchableOpacity style={styles.startBtn}>
          <Text style={styles.startText}>💕 시작하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // 배경색 추가 (이미지 로딩 전이나 투명도 뒤에 보일 색)
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  header: { paddingTop: 60, paddingHorizontal: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backIcon: { fontSize: 24, color: '#fff' },
  content: { padding: 20, alignItems: 'center' },
  badge: {
    backgroundColor: '#DAA520',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#000' },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#DAA520',
    marginBottom: 12,
    textAlign: 'center'
  },
  desc: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 32
  },
  startBtn: {
    backgroundColor: '#DAA520',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16
  },
  startText: { fontSize: 18, fontWeight: '800', color: '#000' },
});

import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export const Route = createRoute('/contents/work', {
  component: WorkLuck,
});

function WorkLuck() {
  const navigation = Route.useNavigation();

  return (
    <ImageBackground
      source={require('../../assets/work-thumb.jpg')}
      style={styles.container}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}><Text style={styles.badgeText}>WORK</Text></View>
        <Text style={styles.title}>직장운</Text>
        <Text style={styles.desc}>커리어와 직장 생활 운세</Text>
        <TouchableOpacity style={styles.startBtn}><Text style={styles.startText}>💼 시작하기</Text></TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, bgImage: { opacity: 0.3 }, overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  header: { paddingTop: 60, paddingHorizontal: 20 }, backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#fff' }, content: { padding: 20, alignItems: 'center' }, badge: { backgroundColor: '#2980b9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#fff' }, title: { fontSize: 36, fontWeight: '900', color: '#2980b9', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 16, color: '#e5e7eb', textAlign: 'center', marginBottom: 32 }, startBtn: { backgroundColor: '#2980b9', paddingVertical: 18, paddingHorizontal: 48, borderRadius: 16 },
  startText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});

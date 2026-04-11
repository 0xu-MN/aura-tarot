import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Txt } from '@toss/tds-react-native';

const GOLD = '#DAA520';

interface LoungeHeaderProps {
  onMyActivityPress: () => void;
  onComposePress?: () => void;
}

export const LoungeHeader: React.FC<LoungeHeaderProps> = ({ onMyActivityPress, onComposePress }) => {
  return (
    <View style={s.header}>
      <View style={s.titleBox}>
        <Txt style={s.title}>Mystic Lounge</Txt>
        <Txt style={s.subtitle}>지금 내 주변의 인연</Txt>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={s.manageBtn} onPress={onMyActivityPress} activeOpacity={0.7}>
          <Txt style={s.manageEmoji}>📝</Txt>
          <Txt style={s.manageText}>내 활동</Txt>
        </TouchableOpacity>
        {onComposePress && (
          <TouchableOpacity style={[s.manageBtn, { backgroundColor: 'rgba(218,165,32,0.12)', borderColor: 'rgba(218,165,32,0.25)' }]} onPress={onComposePress} activeOpacity={0.7}>
            <Txt style={s.manageEmoji}>✨</Txt>
            <Txt style={[s.manageText, { color: GOLD }]}>글쓰기</Txt>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0a0a0b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBox: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  manageEmoji: { fontSize: 13 },
  manageText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
});

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Txt } from '@toss/tds-react-native';

const GOLD = '#DAA520';

export const CONTENT_CARDS = [
  { id: 'daily',         emoji: '✨', label: '오늘의 운세' },
  { id: 'love',          emoji: '💕', label: '연애운 타로' },
  { id: 'money',         emoji: '💰', label: '금전·재물운' },
  { id: 'work',          emoji: '💼', label: '직장운' },
  { id: 'student',       emoji: '📚', label: '학업·수험생' },
  { id: 'weekly',        emoji: '📅', label: '주간 운세' },
  { id: 'monthly',       emoji: '🌕', label: '월간 운세' },
  { id: 'horoscope',     emoji: '♒', label: '별자리 운세' },
  { id: 'compatibility', emoji: '💞', label: '커플 궁합' },
  { id: 'reunion',       emoji: '🌙', label: '재회 확률' },
  { id: 'yearly',        emoji: '🗓️', label: '연간 운세' },
  { id: 'chat',          emoji: '💬', label: 'AI 심층 상담' },
] as const;

export type ContentId = typeof CONTENT_CARDS[number]['id'];

interface ContentDropdownProps {
  onSelect: (index: number) => void;
  currentIndex?: number;
}

export const ContentDropdown: React.FC<ContentDropdownProps> = ({ onSelect, currentIndex = 0 }) => {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const current = CONTENT_CARDS[currentIndex];

  const openMenu = () => {
    slideAnim.setValue(600);
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 70,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = (cb?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      cb?.();
    });
  };

  const handleSelect = (idx: number) => closeMenu(() => onSelect(idx));

  return (
    <View>
      {/* ── 트리거 버튼: TouchableOpacity 로 flexDirection:'row' 보장 */}
      <TouchableOpacity style={s.trigger} onPress={openMenu} activeOpacity={0.75}>
        <Txt style={s.triggerEmoji}>{current?.emoji}</Txt>
        <Txt style={s.triggerText}>{current?.label || '운세 선택'}</Txt>
        <Txt style={s.triggerChevron}>⌄</Txt>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => closeMenu()}
        statusBarTranslucent
      >
        {/* 전체 컨테이너: 어두운 배경 + 하단 정렬 */}
        <View style={s.modalRoot}>
          {/* 배경 터치 영역 (absolute, 시트보다 낮은 z-order) */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => closeMenu()}
          />

          {/* 슬라이드업 시트 (나중에 렌더 → 높은 z-order) */}
          <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* 핸들 바 */}
            <View style={s.handleBar} />

            {/* 타이틀 */}
            <View style={s.sheetHeader}>
              <Txt style={s.sheetTitle}>운세 선택</Txt>
            </View>

            {/* 메뉴 리스트 */}
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {CONTENT_CARDS.map((card, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[s.item, isActive && s.itemActive]}
                    onPress={() => handleSelect(idx)}
                    activeOpacity={0.6}
                  >
                    <Txt style={s.itemEmoji}>{card.emoji}</Txt>
                    <Txt style={[s.itemLabel, isActive && s.itemLabelActive]}>
                      {card.label}
                    </Txt>
                    {isActive && <Txt style={s.checkIcon}>✓</Txt>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 닫기 버튼 */}
            <TouchableOpacity
              style={s.closeBtn}
              onPress={() => closeMenu()}
              activeOpacity={0.7}
            >
              <Txt style={s.closeBtnText}>닫기</Txt>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  // ── 트리거
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(218,165,32,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(218,165,32,0.35)',
  },
  triggerEmoji: { fontSize: 13 },
  triggerText: { fontSize: 12, fontWeight: '700', color: GOLD },
  triggerChevron: {
    fontSize: 12,
    color: 'rgba(218,165,32,0.7)',
    fontWeight: '900',
    marginTop: 1,
  },

  // ── 모달 루트 (어두운 배경 + 하단 정렬)
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  // ── 바텀 시트
  sheet: {
    backgroundColor: '#111113',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '78%',
    overflow: 'hidden',
  },

  // ── 핸들 바
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // ── 시트 헤더
  sheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },

  // ── 아이템
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  itemActive: {
    backgroundColor: 'rgba(218,165,32,0.07)',
  },
  itemEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
  itemLabelActive: {
    color: GOLD,
    fontWeight: '700',
  },
  checkIcon: {
    fontSize: 15,
    color: GOLD,
    fontWeight: '800',
  },

  // ── 닫기 버튼
  closeBtn: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 13,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
});

import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Animated, Platform, Image } from 'react-native';
import { Txt } from '@toss/tds-react-native';

const GOLD = '#DAA520';

interface ProfilePopupProps {
  visible: boolean;
  onClose: () => void;
  nickname: string;
  distance: string;
  gender?: 'M' | 'F';
  profileImage?: string;
  isAlreadyRevealed?: boolean;
  isChatUnlocked?: boolean;
  onReveal: () => Promise<boolean>;
  onChatStart: () => Promise<boolean>;
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  visible,
  onClose,
  nickname,
  distance,
  gender,
  profileImage,
  isAlreadyRevealed = false,
  isChatUnlocked = false,
  onReveal,
  onChatStart,
}) => {
  const [isRevealed, setIsRevealed] = React.useState(isAlreadyRevealed);
  const [isLoading, setIsLoading] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(400)).current;

  React.useEffect(() => {
    if (visible) {
      setIsRevealed(isAlreadyRevealed);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        
        <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={s.handle} />
          
          <View style={s.content}>
            <View style={[s.avatarLarge, gender === 'M' ? s.avatarM : gender === 'F' ? s.avatarF : {}]}>
              {(isRevealed && profileImage) ? (
                <View style={{ width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden' }}>
                  {/* @ts-ignore - Image missing import added globally if needed or inline */}
                  <React.Fragment>
                    <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                  </React.Fragment>
                </View>
              ) : (
                <Txt style={{ fontSize: 40 }}>👤</Txt>
              )}
            </View>
            
            <View style={s.infoBox}>
              <Txt style={s.nickname}>{isRevealed ? nickname : '???'}</Txt>
              <Txt style={s.distanceText}>{distance} 거리에 있는 이웃</Txt>
            </View>

            <View style={s.introBox}>
              {!isRevealed ? (
                <View style={s.blurOverlay}>
                  <Txt style={s.blurText}>프로필이 가려져 있어요 🔒</Txt>
                </View>
              ) : (
                <Txt style={s.introText}>"안녕하세요, 요즘 연애 고민이 많아 타로를 보게 되었습니다. 비슷한 고민이 있으신 분들과 대화 나누고 싶어요."</Txt>
              )}
            </View>

            {!isRevealed ? (
              <TouchableOpacity style={s.chatBtn} onPress={async () => {
                setIsLoading(true);
                const success = await onReveal();
                if (success) setIsRevealed(true);
                setIsLoading(false);
              }} disabled={isLoading}>
                <Txt style={s.chatBtnText}>{isLoading ? '...' : '💎 다이아 1개로 프로필 확인하기'}</Txt>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[s.chatBtn, { backgroundColor: '#6b4ce6', borderColor: '#6b4ce6' }]} onPress={onChatStart} disabled={isLoading}>
                <Txt style={[s.chatBtnText, { color: '#fff' }]}>
                  {isChatUnlocked ? '대화 이어서 하기 (무료)' : '💎 다이아 2개로 대화 시작하기'}
                </Txt>
              </TouchableOpacity>
            )}
            
            <Txt style={s.privacyNotice}>* 상대방이 수락할 때까지 익명이 유지됩니다.</Txt>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#16161a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 10,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  blurText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    fontSize: 14,
  },
  avatarM: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.15)'
  },
  avatarF: {
    borderColor: '#f43f5e',
    borderWidth: 2,
    backgroundColor: 'rgba(244, 63, 94, 0.15)'
  },
  infoBox: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  distanceText: {
    fontSize: 13,
    color: GOLD,
    fontWeight: '700',
  },
  introBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  introText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  chatBtn: {
    width: '100%',
    height: 54,
    backgroundColor: GOLD,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  chatBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  privacyNotice: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 16,
  },
});

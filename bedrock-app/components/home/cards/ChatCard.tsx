import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { useDrawLimit } from '../../../lib/useDrawLimit';
import { PaymentInductionModal } from '../../PaymentInductionModal';
import { Haptic } from '../../../lib/haptic';

const GOLD = '#DAA520';

interface ChatCardProps {
  onOpenChat: (consultation: any) => void;
  onTokenChange: () => void;
  tokenBalance?: number;
}

export const ChatCard: React.FC<ChatCardProps> = ({ onOpenChat, onTokenChange, tokenBalance }) => {
  const [query, setQuery] = useState('');
  const [showDrawAgain, setShowDrawAgain] = useState(false);
  const cost = 2; // 다이아 2개 소모
  const { canDraw, recordDraw, isChecking, checkLimit, remainingFree, userTokens } = useDrawLimit('chat_direct', cost, 3);

  // 다이아 잔액이 외부에서 변경되면(예: 일일 지급) 다시 체크
  React.useEffect(() => {
    checkLimit();
  }, [tokenBalance, checkLimit]);

  const startChat = async () => {
    if (!query.trim()) {
      Alert.alert('고민을 조금 더 자세히 적어주세요.');
      return;
    }
    if (!canDraw) {
      setShowDrawAgain(true);
      return;
    }
    
    // 무료 소진(-1) 또는 다이아 소모(cost) 기록
    const consumed = await recordDraw();
    if (consumed !== 0) {
      Haptic.success();
      onOpenChat({
        contentTitle: 'AI 심층 상담',
        question: query,
        reading: '회원님의 고민을 진지하게 들여다보고 있습니다.',
      });
      // 토큰 잔액 변화 알림 (무료 소진 시에도 UI 갱신을 위해 필요할 수 있음)
      if (consumed > 0) onTokenChange?.();
    } else {
      setShowDrawAgain(true);
    }
  };

  // 버튼 문구 결정
  let buttonLabel = '상담 시작하기';
  if (remainingFree > 0) {
    buttonLabel = `상담 시작하기 (오늘 무료 ${remainingFree}회)`;
  } else if (userTokens >= cost) {
    buttonLabel = `대화 시작하기 (💎 ${cost}개 소모)`;
  } else {
    buttonLabel = `💎 다이아 충전 후 상담하기`;
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Txt style={s.headerTitle}>💬 직접 고민 묻기</Txt>
        <Txt style={s.subtitle}>
          정해진 양식 없이 원하는 질문을 타로 마스터에게 직접 터놓고 이야기해 보세요.
        </Txt>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        style={s.inputContainer}
      >
        <ScrollView contentContainerStyle={s.scrollArea} keyboardShouldPersistTaps="handled">
          <View style={s.textAreaWrapper}>
            <TextInput
              style={s.textArea}
              placeholder="예: 이번에 이직을 고민 중인데 결정을 내리지 못하겠어요. 어떻게 하는게 좋을까요?"
              placeholderTextColor="rgba(255,255,255,0.2)"
              multiline
              value={query}
              onChangeText={setQuery}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.footer}>
        <PressableEffect 
          style={[s.button, (!query.trim() || isChecking) && s.buttonDisabled]} 
          onPress={startChat}
          disabled={!query.trim() || isChecking}
        >
          <Txt style={s.buttonText}>{buttonLabel}</Txt>
        </PressableEffect>
      </View>

      <PaymentInductionModal
        visible={showDrawAgain}
        onClose={() => setShowDrawAgain(false)}
        contentName="AI 챗봇 상담"
      />
    </View>
  );
};

const BG_CARD = '#130f23';

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_CARD,
    padding: 24,
    justifyContent: 'space-between',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 },
  inputContainer: { flex: 1 },
  scrollArea: { flexGrow: 1, justifyContent: 'center' },
  textAreaWrapper: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 180,
    padding: 18,
  },
  textArea: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    lineHeight: 24,
  },
  footer: { marginTop: 24 },
  button: {
    backgroundColor: '#6b4ce6',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#6b4ce6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

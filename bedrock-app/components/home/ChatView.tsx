/**
 * ChatView – 챗봇 UI 컴포넌트 (홈 화면 내 인라인 모드용)
 * 기존 chatbot.tsx에서 핵심 UI/로직을 추출하여 재사용 가능하게 만든 컴포넌트
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, ScrollView, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { BottomInfo, Txt, PressableEffect } from '@toss/tds-react-native';
import { callGeminiChat, ChatMessage } from '../../lib/gemini';

import {
  getUserTokens, consumeUserToken, saveChatRecord, deleteChatRecord,
  getFreeDrawUsage, incrementFreeDrawUsage, CHATBOT_FREE_LIMIT,
  saveChatMessageHistory, getChatMessageHistory,
} from '../../lib/storage';
import { PaymentInductionModal } from '../PaymentInductionModal';

const BG = '#17171b';
const CARD_BG = '#2c2c35';
const GOLD = '#D4AF37';
const TEXT_MAIN = '#ffffff';
const TEXT_SUB = '#8b95a1';

interface ChatViewProps {
  /** 타로 결과 기반 상담 컨텍스트 (선택) */
  consultation?: {
    id?: string;            // 히스토리에서 이어하기 시 세션 ID
    contentTitle?: string;
    question?: string;
    cards?: any[];
    reading?: string;
    card?: { koreanName: string };
    isReversed?: boolean;
    initialMessages?: ChatMessage[];
  };
}

export const ChatView: React.FC<ChatViewProps> = ({ consultation }) => {
  const buildTarotContext = () => {
    if (!consultation?.reading) return '';
    const { contentTitle, question, cards, reading } = consultation;
    const cardNames = Array.isArray(cards)
      ? cards.map((c: any, i: number) => {
        const labels = ['과거', '현재', '미래', '전체조언'];
        const label = labels[i] || `카드${i + 1}`;
        return `${label}: ${c?.card?.koreanName || c?.name || ''}${c?.isReversed ? '(역방향)' : ''}`;
      }).join(', ')
      : '';
    return `[${contentTitle || '타로 상담'} 결과]\n질문: ${question || ''}\n카드: ${cardNames}\nAI 해석: ${reading}\n\n위 타로 결과를 바탕으로 이어서 상담해 주세요.`;
  };

  const getInitialMessage = () => {
    if (consultation?.reading) {
      const title = consultation.contentTitle || '타로';
      return `방금 보신 ${title} 결과에 대해 더 깊이 이야기 나눠볼까요? 궁금한 점이나 더 알고 싶은 부분이 있다면 편하게 물어보세요. 🔮`;
    }
    if (consultation?.card) {
      const { card, isReversed } = consultation;
      return `방금 뽑으신 '${card.koreanName}${isReversed ? '(역방향)' : ''}' 카드에 대해 더 궁금한 점이 있으신가요? 솜이가 정성껏 상담해 드릴게요. 🔮`;
    }
    return '안녕하세요! 타로 리더 솜이 입니다.\n오늘의 운세나 고민이 있다면 편하게 말씀해 주세요. 🔮';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const triggerAIResponse = async (history: ChatMessage[], userMessage: string, currentSessionId: string, isPaid: boolean = false) => {
    setIsLoading(true);

    const tarotCtx = buildTarotContext();
    const messageToSend = tarotCtx && history.length <= 2 
      ? `${tarotCtx}\n\n사용자 질문: ${userMessage}`
      : userMessage;

    try {
      if (isPaid) {
        // 다이아 소모 사유 명시
        const success = await consumeUserToken('챗봇 대화 메시지 전송');
        if (!success) {
          setMessages([
            ...history,
            { role: 'model', parts: [{ text: '다이아 소모 중 문제가 발생했습니다. 충전 상태를 확인해 주세요.' }] },
          ]);
          setIsLoading(false);
          return;
        }
      }

      const reply = await callGeminiChat(history, messageToSend);
      const nextMessages: ChatMessage[] = [...history, { role: 'model', parts: [{ text: reply }] }];
      setMessages(nextMessages);
      
      let partnerName = '타로 리더 솜이';
      if (consultation?.contentTitle && consultation.contentTitle.includes('님의')) {
        partnerName = consultation.contentTitle.split('님')[0] || consultation.contentTitle;
      } else if (consultation?.contentTitle) {
        partnerName = consultation.contentTitle;
      }
      
      // 메타데이터 및 전문 독립 저장
      await saveChatRecord({
        id: currentSessionId,
        partnerName,
        topic: consultation?.question || userMessage,
        date: new Date().toISOString(),
        summary: reply.substring(0, 40).replace(/\n/g, ' ') + '...',
      });
      await saveChatMessageHistory(currentSessionId, nextMessages);
    } catch (apiErr) {
      console.error('AI Response Trigger Failed:', apiErr);
      const errorMessages: ChatMessage[] = [
        ...history,
        { role: 'model', parts: [{ text: '죄송해요, 잠시 연결이 원활하지 않아 답변을 드리지 못했어요. 다이아는 소모되지 않았으니 잠시 후 다시 시도해 주세요. 💦' }] },
      ];
      setMessages(errorMessages);
      // API 실패 시에도 지금까지의 대화는 저장 (히스토리 소실 방지)
      await saveChatMessageHistory(currentSessionId, errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        const usage = await getFreeDrawUsage('chatbot_msg');
        if (!isMounted) return;
        setDailyUsage(usage);

        // 1. 히스토리에서 이어하기 로드
        if (consultation?.id && !consultation.question) {
          const sid = consultation.id;
          setSessionId(sid);
          const historyData = await getChatMessageHistory(sid);
          if (!isMounted) return;

          if (historyData && historyData.length > 0) {
            setMessages(historyData);
            setIsLoading(false);
            return;
          }
          // 히스토리가 없는 경우 (저장 실패 등) → 안내 메시지와 함께 재시작
          const fallbackMessages: ChatMessage[] = [
            { role: 'model', parts: [{ text: '이전 대화 기록을 불러오지 못했어요. 새로운 대화를 시작해 주세요. 🔮' }] },
          ];
          setMessages(fallbackMessages);
          setIsLoading(false);
          return;
        }

        // 2. 새로운 상담 시작
        const newSid = consultation?.id || `chat_${Date.now()}`;
        setSessionId(newSid);
        
        const greeting = getInitialMessage();
        const initialHistory: ChatMessage[] = [{ role: 'model', parts: [{ text: greeting }] }];
        
        if (consultation?.question) {
          const initialUserMsg = consultation.question.trim();
          const augmentedHistory: ChatMessage[] = [
            ...initialHistory,
            { role: 'user', parts: [{ text: initialUserMsg }] }
          ];
          setMessages(augmentedHistory);
          // 초기 메시지(인사 + 사용자 질문)를 즉시 저장 → AI 응답 전에 앱 종료해도 히스토리 보존
          await saveChatMessageHistory(newSid, augmentedHistory);
          setIsLoading(false);
          // 초기 AI 응답은 항상 무료 (다이아 소모 없음) — 사용자가 직접 보낸 메시지부터 과금
          triggerAIResponse(augmentedHistory, initialUserMsg, newSid, false);
        } else {
          setMessages(initialHistory);
          await saveChatMessageHistory(newSid, initialHistory);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Init fail:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    initializeChat();
    return () => { isMounted = false; };
  }, [consultation]);

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async () => {
    // isLoading이 true라도 사용자가 입력하는 도중이면 전송 가능하도록 (내부적으로 triggerAIResponse가 isLoading 관리)
    if (!input.trim() || !sessionId) return;
    if (isLoading) return; // 이미 AI 응답 대기 중이면 중복 전송 방지

    let isPaid = false;
    if (dailyUsage >= CHATBOT_FREE_LIMIT) {
      const tokens = await getUserTokens();
      if (tokens < 1) {
        setShowPayModal(true);
        return;
      }
      isPaid = true;
    }

    const userMessage = input.trim();
    setInput('');

    const newHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', parts: [{ text: userMessage }] },
    ];
    setMessages(newHistory);
    
    try {
      await saveChatMessageHistory(sessionId, newHistory);
      await triggerAIResponse(newHistory, userMessage, sessionId, isPaid);
      
      await incrementFreeDrawUsage('chatbot_msg');
      const newUsage = await getFreeDrawUsage('chatbot_msg');
      setDailyUsage(newUsage);
    } catch (e) {
      console.error('Send fail:', e);
      // 이미 triggerAIResponse에서 개별 에러 처리를 하므로 여기는 최소한의 방어
    }
  };

  const handleReport = () => {
    Alert.alert('신고 접수', '해당 유저에 대한 신고가 접수되었습니다. 운영팀에서 신속히 검토하겠습니다.', [{ text: '확인' }]);
  };

  const handleExit = () => {
    if (!sessionId) return;
    Alert.alert('채팅방 나가기', '이 채팅방을 나가 시겠습니까? 대화 기록이 모두 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      { 
        text: '나가기', 
        style: 'destructive',
        onPress: async () => {
          await deleteChatRecord(sessionId);
          Alert.alert('처리 완료', '채팅 기록이 삭제되었습니다.');
        }
      }
    ]);
  };

  return (
    <View style={s.container}>
      {/* 상단 배너 + 에너지 표시 */}
      <View style={s.banner}>
        <Txt style={s.bannerEmoji}>🔮</Txt>
        <View style={{ flex: 1 }}>
          <Txt style={s.bannerTitle}>솜이와 타로 상담</Txt>
          <Txt style={s.bannerSub}>고민을 편하게 털어놓아 보세요</Txt>
        </View>
        <View style={s.energyBox}>
          <Txt style={s.energyLabel}>상담 에너지</Txt>
          <View style={s.dotsRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[s.dot, i <= (CHATBOT_FREE_LIMIT - dailyUsage) ? s.dotActive : s.dotInactive]} />
            ))}
            {dailyUsage >= CHATBOT_FREE_LIMIT && (
              <Txt style={s.plusText}>+💎</Txt>
            )}
          </View>
        </View>
        
        {/* 관리 메뉴 */}
        <TouchableOpacity onPress={() => {
          Alert.alert('채팅 관리', '원하시는 작업을 선택해주세요.', [
            { text: '신고하기', onPress: handleReport },
            { text: '채팅방 나가기', onPress: handleExit, style: 'destructive' },
            { text: '취소', style: 'cancel' },
          ]);
        }} style={s.menuBtn}>
          <Txt style={s.menuIcon}>⋮</Txt>
        </TouchableOpacity>
      </View>

      {/* 메시지 리스트 */}

      {/* 메시지 리스트 */}
      <ScrollView
        ref={scrollViewRef}
        style={s.messageList}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <View
              key={idx}
              style={[
                s.bubble,
                isUser ? s.bubbleUser : s.bubbleBot,
              ]}
            >
              <Txt style={[s.bubbleText, isUser && s.bubbleTextUser]}>
                {msg.parts[0]?.text || ''}
              </Txt>
            </View>
          );
        })}
        {isLoading && (
          <View style={s.loadingBubble}>
            <ActivityIndicator color={GOLD} size="small" />
          </View>
        )}
      </ScrollView>

      {/* 입력창 + 하단 정보 통합 KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (Platform.isPad ? 100 : 154) : 0}
        style={{ backgroundColor: BG }}
      >
        <View style={s.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="고민을 입력해보세요..."
            placeholderTextColor={TEXT_SUB}
            style={s.textInput}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <PressableEffect
            onPress={handleSend}
            style={[s.sendBtn, input.trim() ? s.sendBtnActive : s.sendBtnInactive]}
          >
            <Txt style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>↑</Txt>
          </PressableEffect>
        </View>
        <BottomInfo style={{ backgroundColor: BG }} />
      </KeyboardAvoidingView>

      <PaymentInductionModal
        visible={showPayModal}
        onClose={() => setShowPayModal(false)}
        contentName="AI 타로 상담"
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218,165,32,0.15)',
    backgroundColor: 'rgba(218,165,32,0.05)',
  },
  bannerEmoji: { fontSize: 28 },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: GOLD },
  bannerSub: { fontSize: 12, color: TEXT_SUB, marginTop: 2 },
  messageList: { flex: 1 },
  bubble: {
    maxWidth: '82%',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: GOLD,
    borderTopRightRadius: 4,
  },
  bubbleText: { color: TEXT_MAIN, fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#17171b' },
  loadingBubble: { alignSelf: 'flex-start', marginLeft: 10, marginBottom: 16 },
  inputRow: {
    padding: 12,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#232328',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: TEXT_MAIN,
    fontSize: 15,
    height: 48,
  },
  sendBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: GOLD },
  sendBtnInactive: { backgroundColor: '#333' },
  energyBox: { alignItems: 'flex-end', gap: 4 },
  energyLabel: { fontSize: 10, color: TEXT_SUB, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: GOLD },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  plusText: { fontSize: 12, fontWeight: '800', color: GOLD, marginLeft: 2 },
  menuBtn: {
    padding: 8,
    marginLeft: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: GOLD,
    fontWeight: '800',
  },
});

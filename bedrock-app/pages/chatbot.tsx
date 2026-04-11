import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { createRoute } from '@granite-js/react-native';
import { BottomInfo, Txt, PressableEffect } from '@toss/tds-react-native';
import { callGeminiChat, ChatMessage } from '../lib/gemini';

export const Route = createRoute('/chatbot', {
  component: Chatbot,
});

const BG = '#17171b';
const CARD_BG = '#2c2c35';
const GOLD = '#D4AF37';
const TEXT_Main = '#ffffff';
const TEXT_Sub = '#8b95a1';

function Chatbot() {
  const navigation = Route.useNavigation();
  const params = Route.useParams() as any;
  const consultationData = params?.consultation;

  const buildTarotContext = () => {
    if (!consultationData?.reading) return '';
    const { contentTitle, question, cards, reading } = consultationData;
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
    if (consultationData?.reading) {
      const title = consultationData.contentTitle || '타로';
      return `방금 보신 ${title} 결과에 대해 더 깊이 이야기 나눠볼까요? 궁금한 점이나 더 알고 싶은 부분이 있다면 편하게 물어보세요. 🔮`;
    }
    if (consultationData?.card) {
      const { card, isReversed } = consultationData;
      return `방금 뽑으신 '${card.koreanName}${isReversed ? '(역방향)' : ''}' 카드에 대해 더 궁금한 점이 있으신가요? 솜이가 정성껏 상담해 드릴게요. 🔮`;
    }
    return '안녕하세요! AI 타로 마스터 솜이 입니다. \n오늘의 운세나 고민이 있다면 편하게 물어보세요. 🔮';
  };


  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 초기 메시지 설정
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        parts: [{ text: getInitialMessage() }]
      }
    ]);
  }, [consultationData]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const newHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    setMessages(newHistory);
    setIsLoading(true);

    // 타로 결과 컨텍스트가 있고 아직 첫 메시지인 경우 컨텍스트를 포함
    const tarotCtx = buildTarotContext();
    const messageToSend = (tarotCtx && messages.length <= 1)
      ? `${tarotCtx}\n\n사용자 질문: ${userMessage}`
      : userMessage;

    try {
      const reply = await callGeminiChat(messages, messageToSend);

      setMessages([
        ...newHistory,
        { role: 'model', parts: [{ text: reply }] }
      ]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages([
        ...newHistory,
        { role: 'model', parts: [{ text: '죄송해요, 잠시 연결이 원활하지 않아요. 잠시 후 다시 말씀해 주세요. 💦' }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages]);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <View
                key={index}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  marginBottom: 16,
                  backgroundColor: isUser ? GOLD : CARD_BG,
                  borderRadius: 20,
                  borderTopRightRadius: isUser ? 4 : 20,
                  borderTopLeftRadius: isUser ? 20 : 4,
                  padding: 14,
                }}
              >
                <Txt style={{
                  color: isUser ? '#17171b' : TEXT_Main,
                  fontSize: 15,
                  lineHeight: 22
                }}>
                  {msg.parts[0]?.text || ''}
                </Txt>
              </View>
            );
          })}
          {isLoading && (
            <View style={{ alignSelf: 'flex-start', marginLeft: 10, marginBottom: 16 }}>
              <ActivityIndicator color={GOLD} size="small" />
            </View>
          )}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={{
          padding: 16,
          backgroundColor: BG,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="고민을 입력해보세요..."
            placeholderTextColor={TEXT_Sub}
            style={{
              flex: 1,
              backgroundColor: '#232328',
              borderRadius: 24,
              paddingHorizontal: 20,
              paddingVertical: 12,
              color: TEXT_Main,
              fontSize: 15,
              marginRight: 10,
              height: 48
            }}
            onSubmitEditing={handleSend}
          />
          <PressableEffect
            onPress={handleSend}
            style={{
              width: 48,
              height: 48,
              backgroundColor: input.trim() ? GOLD : '#333',
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Txt style={{ fontSize: 18 }}>✈️</Txt>
          </PressableEffect>
        </View>
      </KeyboardAvoidingView>
      <BottomInfo />
    </View>
  );
}

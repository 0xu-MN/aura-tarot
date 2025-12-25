import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Send, Sparkles, Loader2, History } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatHistoryModal } from '@/components/chat/ChatHistoryModal';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedPrompts = [
    '오늘의 운세가 궁금해요',
    '연애운을 봐주세요',
    '직장에서 고민이 있어요',
    '새로운 시작에 대한 조언',
    '재물운이 궁금합니다',
];

const Chatbot = () => {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '안녕하세요! 당신의 꿈속을 여행하는 행운의 길잡이, 솜이입니다. 오늘 당신의 마음엔 어떤 별이 뜨고 있나요? ☁️✨',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const location = useLocation();

    // Check for consultation context on mount
    useEffect(() => {
        const state = location.state as { consultation?: { card: any, reading: string, question?: string, isReversed: boolean } };

        if (state?.consultation && messages.length === 1) { // Only if valid state and initial chat
            const { card, reading, question, isReversed } = state.consultation;
            const contextMessage = `방금 뽑은 카드는 '${card.koreanName}'(${card.name})이고, ${isReversed ? '역방향' : '정방향'}이 나왔어.
질문은 "${question || '오늘의 운세'}"였고, 
리딩 결과는 다음과 같았어:
"${reading}"

이 결과에 대해 좀 더 자세히 이야기해줄래?`;

            sendMessage(contextMessage);

            // Clear state to prevent re-triggering on refresh (optional but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location.state]); // Dependency on location.state

    // Scroll to bottom on messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);


    // Check for goodbye keywords
    useEffect(() => {
        if (messages.length > 2) {
            const lastMessage = messages[messages.length - 1];
            const goodbyeKeywords = ['종료', '그만', '끝낼게', '수고했어', '고마워', '안녕'];

            // Only trigger if user says goodbye and matched keywords
            if (lastMessage.role === 'user' && goodbyeKeywords.some(keyword => lastMessage.content.includes(keyword))) {
                toast({
                    title: "대화를 종료하시겠습니까?",
                    description: "우측 상단의 종료 버튼을 눌러 대화를 저장하고 새 상담을 시작할 수 있습니다.",
                    action: <Button variant="outline" size="sm" onClick={handleEndChat}>종료하기</Button>,
                });
            }
        }
    }, [messages]);

    const saveChatSession = async () => {
        if (messages.length <= 1) return; // Don't save empty/initial chats

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const summary = messages.find(m => m.role === 'user')?.content.slice(0, 30) + '...' || '새로운 상담';

            await (supabase as any).from('chat_sessions').insert({
                user_id: user.id,
                title: summary,
                messages: messages,
            });

            toast({
                title: "상담 기록 저장 완료",
                description: "나의 상담 내역에 저장되었습니다.",
            });
        } catch (error) {
            console.error('Failed to save chat:', error);
        }
    };

    const handleEndChat = async () => {
        await saveChatSession();
        setMessages([
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: '안녕하세요! 당신의 꿈속을 여행하는 행운의 길잡이, 솜이입니다. 오늘 당신의 마음엔 어떤 별이 뜨고 있나요? ☁️✨',
                timestamp: new Date(),
            },
        ]);
        setInput('');
    };

    const handleLoadSession = (loadedMessages: any[]) => {
        // Convert string timestamps back to Date objects if needed
        const parsedMessages = loadedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
        setShowHistory(false);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const messageHistory = [...messages, userMessage]
                .filter(msg => msg.role === 'user' || msg.role === 'assistant')
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            const { data, error } = await supabase.functions.invoke('tarot-chat', {
                method: 'POST',
                body: { messages: messageHistory }
            });

            if (error) {
                throw error;
            }

            if (data.error) {
                throw new Error(data.error);
            }

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: '오류 발생',
                description: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => sendMessage(input);

    const handleSuggestedPrompt = (prompt: string) => {
        sendMessage(prompt);
    };

    return (
        <AppLayout>
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                {/* Header */}
                <div className="container mx-auto px-4 py-4 border-b border-gold/20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-gold" />
                        <h1 className="font-display text-2xl text-gold-gradient">
                            솜이한테 물어봐!
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} className="text-muted-foreground hover:text-gold">
                            <History className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleEndChat} className="text-muted-foreground hover:text-destructive">
                            상담 종료
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 container mx-auto px-4">
                    <div className="py-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar className="w-10 h-10 border border-gold/20 flex-shrink-0 mt-1">
                                        <AvatarImage src="/som-i.jpg" alt="솜이" className="object-cover" />
                                        <AvatarFallback>Som</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-gold text-background'
                                        : 'bg-card border border-gold/20'
                                        }`}
                                >
                                    {message.role === 'assistant' && (
                                        <p className="text-xs text-gold mb-1 font-bold">솜이 ☁️</p>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                                    <span className="text-xs opacity-70 mt-1 block">
                                        {message.timestamp.toLocaleTimeString('ko-KR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start gap-3">
                                <Avatar className="w-10 h-10 border border-gold/20 flex-shrink-0 mt-1">
                                    <AvatarImage src="/som-i.jpg" alt="솜이" className="object-cover" />
                                    <AvatarFallback>Som</AvatarFallback>
                                </Avatar>
                                <div className="bg-card border border-gold/20 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-gold" />
                                        <span className="text-sm text-muted-foreground">답변을 생성하고 있습니다...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Suggested Prompts */}
                {messages.length === 1 && (
                    <div className="container mx-auto px-4 py-3">
                        <p className="text-sm text-muted-foreground mb-2">추천 질문:</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {suggestedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSuggestedPrompt(prompt)}
                                    className="px-3 py-1.5 rounded-full bg-card border border-gold/30 text-sm whitespace-nowrap hover:bg-gold/10 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="container mx-auto px-4 py-4 border-t border-gold/20">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 bg-card/50"
                            disabled={isLoading}
                        />
                        <Button onClick={handleSend} variant="gold" size="icon" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <ChatHistoryModal
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                    onSelectSession={handleLoadSession}
                />
            </div>
        </AppLayout>
    );
};

export default Chatbot;

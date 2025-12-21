import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
            content: '안녕하세요! AI 타로 마스터입니다. 어떤 고민이나 궁금한 점이 있으신가요? 편하게 말씀해 주세요.',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare message history for API (exclude system messages, only user and assistant)
            const messageHistory = [...messages, userMessage]
                .filter(msg => msg.role === 'user' || msg.role === 'assistant')
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            const { data, error } = await supabase.functions.invoke('tarot-chat', {
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

    const handleSuggestedPrompt = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <AppLayout>
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                {/* Header */}
                <div className="container mx-auto px-4 py-4 border-b border-gold/20">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-gold" />
                        <h1 className="font-display text-2xl text-gold-gradient">
                            AI 타로 상담
                        </h1>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 container mx-auto px-4">
                    <div className="py-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-gold text-background'
                                            : 'bg-card border border-gold/20'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
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
                            <div className="flex justify-start">
                                <div className="bg-card border border-gold/20 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-gold" />
                                        <span className="text-sm text-muted-foreground">답변을 생성하고 있습니다...</span>
                                    </div>
                                </div>
                            </div>
                        )}
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
            </div>
        </AppLayout>
    );
};

export default Chatbot;

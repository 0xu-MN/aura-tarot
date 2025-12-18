import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '안녕하세요! AI 타로 마스터입니다. 어떤 고민이나 궁금한 점이 있으신가요? 편하게 말씀해 주세요.',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '죄송합니다. AI 챗봇 기능은 API 설정 후 사용 가능합니다. 관리자에게 문의해주세요.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1000);
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
                        />
                        <Button onClick={handleSend} variant="gold" size="icon">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Chatbot;

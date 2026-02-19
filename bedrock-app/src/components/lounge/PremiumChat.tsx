import { useState, useRef, useEffect } from 'react';
import { Send, User, ChevronLeft, Info, Search, MoreVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
    id: number;
    sender: string;
    avatar: string;
    content: string;
    timestamp: string;
    isMe: boolean;
}

interface PremiumChatProps {
    roomName: string;
    onBack: () => void;
}

export const PremiumChat = ({ roomName, onBack }: PremiumChatProps) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: '재테크왕',
            avatar: '재',
            content: '오늘 용산 임장 다녀왔는데 분위기가 심상치 않네요.',
            timestamp: '오후 2:30',
            isMe: false
        },
        {
            id: 2,
            sender: '한강뷰는내꺼',
            avatar: '한',
            content: '오, 어떤 단지 위주로 보셨나요?',
            timestamp: '오후 2:31',
            isMe: false
        },
        {
            id: 3,
            sender: '나',
            avatar: 'N',
            content: '저도 관심있는데 정보 공유 부탁드려요!',
            timestamp: '오후 2:35',
            isMe: true
        }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: '나',
            avatar: 'N',
            content: input,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages([...messages, newMessage]);
        setInput('');

        // Mock response
        setTimeout(() => {
            const botMessage: Message = {
                id: Date.now() + 1,
                sender: '재테크왕',
                avatar: '재',
                content: '반갑습니다! 용산 센트럴파크 해링턴 스퀘어 위주로 봤습니다. 매물이 거의 없네요.',
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                isMe: false
            };
            setMessages(prev => [...prev, botMessage]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[600px] bg-card/50 backdrop-blur-xl rounded-[2.5rem] border border-gold/20 overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-gold/10 flex items-center justify-between bg-gold/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-gold/10 transition-colors text-gold"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="font-display text-xl text-white flex items-center gap-2">
                            {roomName}
                            <Sparkles className="w-4 h-4 text-gold" />
                        </h2>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            892명 참여 중
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-muted-foreground hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex items-start gap-3",
                            msg.isMe ? "flex-row-reverse" : "flex-row"
                        )}>
                            {!msg.isMe && (
                                <Avatar className="w-10 h-10 border border-gold/20">
                                    <AvatarFallback className="bg-gold/10 text-gold text-xs">
                                        {msg.avatar}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "flex flex-col",
                                msg.isMe ? "items-end" : "items-start"
                            )}>
                                {!msg.isMe && <span className="text-[10px] text-muted-foreground mb-1 ml-1">{msg.sender}</span>}
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl text-sm max-w-[240px] leading-relaxed",
                                    msg.isMe
                                        ? "bg-gold text-background rounded-tr-none font-medium"
                                        : "bg-card border border-gold/10 text-white rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 mx-1">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-6 bg-background/50 border-t border-gold/10">
                <form onSubmit={handleSendMessage} className="relative flex items-end gap-3">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="매너 있는 대화를 나눠주세요..."
                        className="flex-1 min-h-[50px] max-h-[120px] bg-card/80 border-gold/20 focus:border-gold/50 rounded-2xl resize-none pr-12 p-3 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        variant="gold"
                        disabled={!input.trim()}
                        className="absolute bottom-2 right-2 w-10 h-10 rounded-xl"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

import { AppLayout } from '@/layouts/AppLayout';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Contents = () => {
    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-6">
                    컨텐츠
                </h1>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="컨텐츠 검색..."
                        className="pl-10 bg-card/50"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
                    {['전체', '연애운', '궁합', '재회확률', '신년운세', '별자리 운세', '직업운', '재물운'].map((category) => (
                        <button
                            key={category}
                            className="px-4 py-2 rounded-lg bg-card border border-gold/30 text-sm whitespace-nowrap hover:bg-gold/10 transition-colors"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="bg-card rounded-2xl border border-gold/20 overflow-hidden hover:border-gold/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            <div className="aspect-video bg-gradient-to-br from-gold/20 to-mystic-purple/20" />
                            <div className="p-4">
                                <span className="text-xs text-gold font-medium">연애운</span>
                                <h3 className="font-display text-lg mt-1 mb-2">
                                    오늘의 연애운세
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    당신의 사랑은 어떤 운명을 맞이할까요? 타로 카드가 알려주는 오늘의 연애 운세를 확인해보세요.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};

export default Contents;

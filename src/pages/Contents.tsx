import { AppLayout } from '@/layouts/AppLayout';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import weeklyThumb from '@/assets/weekly-thumb.jpg';
import monthlyThumb from '@/assets/monthly-thumb.jpg';

interface ContentItem {
    title: string;
    description: string;
    categories: string[];
    displayCategory: string;
    icon: string;
    link?: string;
    image?: string;
    imageClass?: string;
    bgClass?: string;
}

const Contents = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('전체');

    const categories = ['전체', '연애운', '궁합', '재회확률', '신년운세', '별자리 운세', '직업운', '재물운', '학생/수험생', '직장인', '주간', '월간'];

    const contentItems: ContentItem[] = [
        {
            title: "오늘의 운세",
            description: "하루를 시작하는 특별한 메시지를 받아보세요",
            categories: ["운세", "신년운세"], // 신년운세에도 포함시켜줌 (넓은 의미)
            displayCategory: "운세",
            icon: "✨",
            link: "/home",
            image: "/thumbnails/daily-fortune.png"
        },
        {
            title: "이번 달 나의 운세",
            description: "Beta Free Open! 이번 달의 전체 흐름을 확인하세요",
            categories: ["운세", "월간"],
            displayCategory: "월간운세",
            icon: "🌕",
            link: "/tarot/monthly",
            image: monthlyThumb,
            imageClass: "object-cover w-full h-full scale-125",
        },
        {
            title: "이번 주 나의 운세",
            description: "Beta Free Open! 이번 주 흐름을 미리 확인해보세요",
            categories: ["운세", "주간"],
            displayCategory: "주간운세",
            icon: "📅",
            link: "/tarot/weekly",
            image: weeklyThumb,
            imageClass: "object-cover w-full h-full scale-110",
        },
        {
            title: "오늘도 수고한 너에게",
            description: "공부하느라 지친 수험생을 위한 하루 한 장 응원 타로",
            categories: ["학생/수험생", "운세"],
            displayCategory: "학생/수험생",
            icon: "🎓",
            link: "/tarot/student"
        },
        {
            title: "오늘도 수고한 직장인에게",
            description: "회사에서 힘든 하루였죠? 타로가 작은 위로와 내일 힘을 줄게요",
            categories: ["직업운", "운세", "직장인"],
            displayCategory: "직장인",
            icon: "💼",
            link: "/contents/work"
        },
        {
            title: "연애운 타로",
            description: "연애, 썸, 짝사랑에 대한 깊은 통찰을 제공합니다",
            categories: ["연애운"],
            displayCategory: "연애운",
            icon: "💕",
            link: "/tarot/love",
            image: "/thumbnails/love-tarot.png"
        },
        {
            title: "재회 확률",
            description: "그 사람의 속마음과 재회 가능성을 알아보세요",
            categories: ["연애운", "재회확률"],
            displayCategory: "연애운",
            icon: "🌙",
            link: "/tarot/reunion",
            image: "/thumbnails/reunion-tarot.png"
        },
        {
            title: "커플 궁합",
            description: "두 사람의 궁합을 타로로 점쳐보세요",
            categories: ["연애운", "궁합"],
            displayCategory: "궁합",
            icon: "👩‍❤️‍👨",
            link: "/compatibility",
            image: "/thumbnails/compatibility-tarot.png"
        },
        {
            title: "2026 신년운세",
            description: "새해 12개월의 운세를 상세히 풀이해드립니다",
            categories: ["신년운세"],
            displayCategory: "신년",
            icon: "📅",
            link: "/tarot/new-year",
            image: "/thumbnails/yearly-fortune.png"
        },
        {
            title: "금전운",
            description: "재물을 끌어당기는 흐름과 조언을 확인하세요",
            categories: ["재물운", "직업운"],
            displayCategory: "재물운",
            icon: "💰",
            link: "/tarot/money",
            image: "/thumbnails/money-luck.jpg"
        },
        {
            title: "별자리 운세",
            description: "오늘의 운세부터 2025년 총운까지 별자리로 확인하세요",
            categories: ["별자리 운세", "신년운세"],
            displayCategory: "운세",
            icon: "🔮",
            link: "/tarot/horoscope",
            image: "/thumbnails/horoscope.png"
        },
        {
            title: "손금 분석",
            description: "손바닥 사진으로 알아보는 나의 운명선",
            categories: ["운세", "관상/손금", "직업운", "재물운"], // 관련된 곳에 넓게 포함
            displayCategory: "관상/손금",
            icon: "✋",
            link: "/tarot/palm",
            image: "/thumbnails/palm-reading.jpg"
        },
        {
            title: "꿈 해몽",
            description: "어젯밤 꿈의 의미를 AI가 해석해드려요",
            categories: ["해몽", "운세"],
            displayCategory: "해몽",
            icon: "⭐",
            // No link yet, shows alert
        },
        {
            title: "1:1 전문가 타로 상담",
            description: "검증된 타로 마스터와 1:1로 깊이 있는 상담을 나눠보세요",
            categories: ["전문가 상담", "연애운", "궁합", "재회확률", "직업운", "재물운"], // 모든 고민 해결 가능
            displayCategory: "전문가 상담",
            icon: "💬"
            // No link, specific alert
        },
    ];

    const filteredItems = contentItems.filter(item => {
        // Filter by category
        const matchesCategory = activeCategory === '전체' || item.categories.includes(activeCategory);

        // Filter by search query
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        Contents
                    </h1>
                    <p className="text-muted-foreground">
                        당신의 운명을 점쳐보세요
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="컨텐츠 검색..."
                        className="pl-10 bg-card/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors ${activeCategory === category
                                ? 'bg-gold/20 border-gold text-gold font-medium'
                                : 'bg-card border-gold/30 text-muted-foreground hover:bg-gold/10 hover:text-foreground'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-card rounded-2xl border border-gold/20 overflow-hidden hover:border-gold/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                            onClick={() => {
                                if (item.link) {
                                    navigate(item.link);
                                } else if (item.title === "1:1 전문가 타로 상담") {
                                    alert("현재 전문가 영입 중입니다! 곧 오픈될 예정이니 조금만 기다려주세요.");
                                } else {
                                    alert(`${item.title} 컨텐츠는 준비 중입니다!`);
                                }
                            }}
                        >
                            <div className={`aspect-video flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 relative overflow-hidden ${item.bgClass || 'bg-gradient-to-br from-gold/20 to-mystic-purple/20'}`}>
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className={`w-full h-full ${item.imageClass || 'object-cover'}`}
                                    />
                                ) : (
                                    item.icon
                                )}
                            </div>
                            <div className="p-4">
                                <span className="text-xs text-gold font-medium">{item.displayCategory}</span>
                                <h3 className="font-display text-lg mt-1 mb-2 group-hover:text-gold transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.description}
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

import { MenuCard } from "./MenuCard";
import {
    Heart,
    Sparkles,
    Moon,
    Users,
    Calendar,
    MessageCircle,
    Eye,
    Star,
    ArrowRight,
    TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RecommendedContent = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const handleFeatureClick = (title: string) => {
        if (title === "오늘의 운세") {
            navigate('/'); // Navigate to home
            return;
        }

        if (title === "1:1 전문가 타로 상담") {
            alert("현재 전문가 영입 중입니다! 곧 오픈될 예정이니 조금만 기다려주세요.");
            return;
        }

        // Feature not ready yet
        alert(`${title} 컨텐츠는 준비 중입니다!`);
    };

    const handleMoreClick = () => {
        navigate("/contents");
    };

    const allFeatures = [
        {
            id: "daily",
            icon: Sparkles,
            title: "오늘의 운세",
            description: "하루를 시작하는 특별한 메시지를 받아보세요",
            badge: "무료",
            category: "daily",
        },
        {
            id: "love",
            icon: Heart,
            title: "연애운 타로",
            description: "연애, 썸, 짝사랑에 대한 깊은 통찰",
            category: "love",
        },
        {
            id: "reunion",
            icon: Moon,
            title: "재회 확률",
            description: "그 사람의 속마음과 재회 가능성을 알아보세요",
            badge: "인기",
            category: "love",
        },
        {
            id: "compatibility",
            icon: Users,
            title: "커플 궁합",
            description: "두 사람의 궁합을 타로로 점쳐보세요",
            category: "relationships",
        },
        {
            id: "yearly",
            icon: Calendar,
            title: "2025 신년운세",
            description: "새해 12개월의 운세를 상세히 풀이",
            badge: "NEW",
            category: "fortune",
        },
        {
            id: "chat",
            icon: MessageCircle,
            title: "1:1 전문가 타로 상담",
            description: "검증된 타로 마스터와 1:1 상담",
            category: "counseling",
        },
        {
            id: "money",
            icon: Eye,
            title: "금전운",
            description: "재물을 끌어당기는 흐름을 확인하세요",
            category: "wealth",
        },
        {
            id: "career",
            icon: Star,
            title: "직업운",
            description: "성공적인 커리어를 위한 조언",
            category: "career",
        },
    ];

    // Logic to filter recommendations based on user interests
    const getRecommendedFeatures = () => {
        if (!userProfile?.interests || userProfile.interests.length === 0) {
            // Default recommendations if no profile or interests
            return allFeatures.slice(0, 3);
        }

        // Filter features that match user interests
        const interestedFeatures = allFeatures.filter(feature =>
            userProfile.interests.includes(feature.category)
        );

        // If we have enough interested features, return top 3
        if (interestedFeatures.length >= 3) {
            return interestedFeatures.slice(0, 3);
        }

        // If not enough, fill with other popular features (excluding already selected)
        const otherFeatures = allFeatures.filter(feature =>
            !interestedFeatures.includes(feature)
        );

        return [...interestedFeatures, ...otherFeatures].slice(0, 3);
    };

    const displayFeatures = getRecommendedFeatures();

    return (
        <section className="py-8">
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-gold" />
                    <h2 className="font-display text-2xl text-gold-gradient">
                        {userProfile?.nickname ? `${userProfile.nickname}님을 위한 추천` : "맞춤 추천 컨텐츠"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {displayFeatures.map((feature, index) => (
                        <div
                            key={feature.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <MenuCard
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                badge={feature.badge}
                                onClick={() => handleFeatureClick(feature.title)}
                                className="h-full"
                            />
                        </div>
                    ))}

                    {/* View More Card */}
                    <div
                        className="animate-fade-in"
                        style={{ animationDelay: "0.3s" }}
                    >
                        <MenuCard
                            icon={ArrowRight}
                            title="더 알아보기"
                            description="다양한 타로 주제를 확인해보세요"
                            onClick={handleMoreClick}
                            className="h-full bg-gold/5 border-gold/40 hover:bg-gold/10"
                        />
                    </div>
                </div>

                {userProfile && userProfile.interests.length > 0 && (
                    <p className="text-xs text-center text-muted-foreground mt-6">
                        회원님의 관심사를 기반으로 추천되었습니다
                    </p>
                )}
            </div>
        </section>
    );
};

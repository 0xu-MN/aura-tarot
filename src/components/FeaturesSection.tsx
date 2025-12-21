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
} from "lucide-react";

interface FeaturesSectionProps {
  onFeatureClick?: (feature: string) => void;
}

const features = [
  {
    id: "daily",
    icon: Sparkles,
    title: "오늘의 운세",
    description: "하루를 시작하는 특별한 메시지를 받아보세요",
    badge: "무료",
  },
  {
    id: "love",
    icon: Heart,
    title: "연애운 타로",
    description: "연애, 썸, 짝사랑에 대한 깊은 통찰",
  },
  {
    id: "reunion",
    icon: Moon,
    title: "재회 확률",
    description: "그 사람의 속마음과 재회 가능성을 알아보세요",
    badge: "인기",
  },
  {
    id: "compatibility",
    icon: Users,
    title: "커플 궁합",
    description: "두 사람의 궁합을 타로로 점쳐보세요",
  },
  {
    id: "yearly",
    icon: Calendar,
    title: "2026 신년운세",
    description: "새해 12개월의 운세를 상세히 풀이",
    badge: "NEW",
  },
  {
    id: "chat",
    icon: MessageCircle,
    title: "AI 타로 상담",
    description: "타로 마스터와 1:1 깊이 있는 상담",
  },
  {
    id: "palm",
    icon: Eye,
    title: "손금 분석",
    description: "손바닥 사진으로 알아보는 나의 운명선",
  },
  {
    id: "dream",
    icon: Star,
    title: "꿈 해몽",
    description: "어젯밤 꿈의 의미를 AI가 해석해드려요",
  },
];

export const FeaturesSection = ({ onFeatureClick }: FeaturesSectionProps) => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl text-gold-gradient mb-3">
            나에게 맞는 타로 선택하기
          </h2>
          <p className="text-muted-foreground">
            다양한 주제의 타로 리딩으로 삶의 방향을 찾아보세요
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <MenuCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                badge={feature.badge}
                onClick={() => onFeatureClick?.(feature.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

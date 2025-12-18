import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MenuCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
  badge?: string;
}

export const MenuCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  className,
  badge,
}: MenuCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-gold/20",
        "hover:border-gold/50 hover:bg-card transition-all duration-300",
        "hover:shadow-[0_0_30px_hsl(43_74%_49%_/_0.15)]",
        "text-left",
        className
      )}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium bg-mystic-orange text-primary-foreground rounded-full">
          {badge}
        </span>
      )}
      
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-mystic-purple/20 flex items-center justify-center group-hover:from-gold/30 group-hover:to-mystic-purple/30 transition-colors">
          <Icon className="w-6 h-6 text-gold" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-foreground group-hover:text-gold transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-2xl animate-shimmer" />
      </div>
    </button>
  );
};

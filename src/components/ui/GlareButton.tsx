import React from 'react';
import { GlareCard } from './GlareCard';
import { cn } from '@/lib/utils';

interface GlareButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    disabled?: boolean;
}

export const GlareButton = ({
    children,
    onClick,
    className,
    variant = 'default',
    disabled
}: GlareButtonProps) => {
    let bgClasses = "bg-white text-black"; // default
    if (variant === 'outline') {
        bgClasses = "bg-transparent border border-white/20 text-white";
    } else if (variant === 'secondary') {
        bgClasses = "bg-gray-800 text-white";
    } else if (variant === 'ghost') {
        bgClasses = "bg-transparent text-white";
    }

    // If disabled, we might want to disable the glare or click
    // For now, simpler implementation

    return (
        <GlareCard
            onClick={!disabled ? onClick : undefined}
            borderRadius="12px"
            className={cn(
                "cursor-pointer h-12 font-bold text-lg shadow-lg active:scale-95 transition-all",
                bgClasses,
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                className
            )}
            glareColor={variant === 'outline' ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.5)"}
        >
            <div className="flex items-center justify-center gap-2 w-full h-full px-4">
                {children}
            </div>
        </GlareCard>
    );
};

import { ComponentType } from 'react';
import { Sparkles } from 'lucide-react';
import { BETA_BANNER_MESSAGE, IS_BETA_ACTIVE } from '@/lib/beta-config';

export const BetaBanner = () => {
    if (!IS_BETA_ACTIVE) return null;

    return (
        <div className="w-full bg-gradient-to-r from-gold/10 via-purple-500/10 to-gold/10 border-b border-gold/20 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-center text-center gap-2">
                <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />
                <span className="text-sm md:text-base font-medium text-gold/90 drop-shadow-sm">
                    {BETA_BANNER_MESSAGE}
                </span>
                <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />
            </div>
        </div>
    );
};

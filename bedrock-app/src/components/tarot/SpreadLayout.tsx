import { useState, useEffect } from "react";
import tarotBack from "@/assets/tarot-back.png";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpreadLayoutProps {
    cardCount: number;
    onSpreadComplete: (selectedIndices: number[]) => void;
    instruction?: string;
    isRevealing?: boolean;
    onProgress?: (count: number) => void;
}

export const SpreadLayout = ({
    cardCount,
    onSpreadComplete,
    instruction = "카드를 선택해주세요",
    isRevealing = false,
    onProgress,
}: SpreadLayoutProps) => {
    const [phase, setPhase] = useState<"shuffle" | "spread" | "complete">("shuffle");
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        // Listener
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Auto start shuffle phase
        const timer = setTimeout(() => {
            setPhase("spread");
        }, 2000); // 2s shuffle animation

        return () => clearTimeout(timer);
    }, []);

    const handleCardClick = (index: number) => {
        if (phase !== "spread" || selectedCards.includes(index) || selectedCards.length >= cardCount) return;

        const newSelected = [...selectedCards, index];
        setSelectedCards(newSelected);
        if (onProgress) onProgress(newSelected.length);

        // If all cards selected, finish
        if (newSelected.length === cardCount) {
            setTimeout(() => {
                setPhase("complete");
                onSpreadComplete(newSelected);
            }, 500);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">

            {/* Instructions */}
            <div className="text-center mb-8 animate-fade-in">
                {phase === "shuffle" && (
                    <p className="text-lg text-gold animate-pulse">카드를 섞고 있습니다...</p>
                )}
                {phase === "spread" && (
                    <div>
                        <h3 className="font-display text-2xl text-gold-gradient mb-2">{instruction}</h3>
                        <p className="text-muted-foreground">({selectedCards.length}/{cardCount})</p>
                    </div>
                )}
            </div>

            {/* Card Area */}
            {phase === "shuffle" ? (
                <div className="relative w-full max-w-md h-60 flex items-center justify-center">
                    {/* Shuffle Animation Stack */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-32 h-48 bg-card rounded-xl border border-gold/30 shadow-lg"
                            style={{
                                top: `50%`,
                                left: `50%`,
                                transform: `translate(-50%, -50%) rotate(${i * 5 - 10}deg)`,
                                zIndex: i,
                                animation: `shuffleStack 0.8s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate`,
                                animationDelay: `${i * 0.05}s`
                            }}
                        >
                            <img src={tarotBack} alt="" className="w-full h-full object-cover rounded-xl opacity-90" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative w-full max-w-5xl h-[360px] flex items-center justify-center px-4 md:px-12">
                    {/* Fanned out cards - Auto fit single line */}
                    {/* We use specific positioning to ensure 22 cards fit in any width */}
                    <div className="relative w-full h-full flex items-center">
                        {[...Array(22)].map((_, i) => {
                            const isSelected = selectedCards.includes(i);

                            // Desktop Layout (Standard Arc)
                            let leftPos = `${(i / 21) * 100}%`;
                            let rotation = (i - 10.5) * 3;
                            let yOffset = Math.abs(i - 10.5) * 3;
                            let topPos = '50%';

                            // Mobile Layout (2 Rows)
                            if (isMobile) {
                                const isTopRow = i < 11;
                                const rowIdx = isTopRow ? i : i - 11;
                                // Distribute 11 cards across width (using slightly less edge margin)
                                const spreadWidth = 90; // use 90% of width
                                const startOffset = 5; // start at 5%

                                leftPos = `${startOffset + (rowIdx / 10) * spreadWidth}%`;

                                // Add arc effect
                                // Center index is 5. Max difference is 5.
                                rotation = (rowIdx - 5) * 4; // Fanning angle
                                yOffset = Math.abs(rowIdx - 5) * 4; // Curve offset

                                topPos = isTopRow ? '30%' : '65%'; // Adjust spacing slightly
                            }

                            return (
                                <div
                                    key={i}
                                    onClick={() => handleCardClick(i)}
                                    className={cn(
                                        "absolute w-20 h-32 md:w-24 md:h-40 rounded-lg bg-card border border-gold/30 shadow-xl cursor-pointer transition-all duration-300 origin-bottom group",
                                        "hover:!z-50 hover:shadow-gold/40 border-gold/50",
                                        isSelected ? "opacity-0 pointer-events-none" : "block"
                                    )}
                                    style={{
                                        left: leftPos,
                                        top: topPos,
                                        zIndex: i,
                                        // Ensure rotation is preserved
                                        transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(${yOffset}px)`,
                                    }}
                                >
                                    {/* Child handles the lift motion relative to the rotated parent */}
                                    <div className="w-full h-full transition-transform duration-200 ease-out group-hover:-translate-y-14">
                                        <img src={tarotBack} alt="" className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Selected Slots Visualization */}
            <div className="mt-4 flex gap-4 overflow-x-auto py-2 px-2 max-w-full justify-center">
                {[...Array(cardCount)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-16 h-24 flex-shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center transition-all",
                            i < selectedCards.length
                                ? "border-gold bg-gold/10 shadow-[0_0_15px_rgba(218,165,32,0.3)]"
                                : "border-muted-foreground/30"
                        )}
                    >
                        {i < selectedCards.length ? (
                            <img src={tarotBack} alt="" className="w-full h-full object-cover rounded-lg animate-scale-in" />
                        ) : (
                            <span className="text-muted-foreground text-xs">{i + 1}</span>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes shuffleStack {
                    0% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateX(0); }
                    50% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateX(-20px) rotateY(10deg); }
                    100% { transform: translate(-50%, -50%) rotate(var(--rotation)) translateX(20px) rotateY(-10deg); }
                }
            `}</style>
        </div>
    );
};

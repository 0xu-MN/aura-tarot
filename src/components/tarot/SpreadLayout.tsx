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
}

export const SpreadLayout = ({
    cardCount,
    onSpreadComplete,
    instruction = "카드를 선택해주세요",
    isRevealing = false,
}: SpreadLayoutProps) => {
    const [phase, setPhase] = useState<"shuffle" | "spread" | "complete">("shuffle");
    const [selectedCards, setSelectedCards] = useState<number[]>([]);

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
                            // Calculate position: 0% to 100% across the container
                            const leftPos = `${(i / 21) * 100}%`;
                            const rotation = (i - 10.5) * 3;
                            const yOffset = Math.abs(i - 10.5) * 3;

                            return (
                                <div
                                    key={i}
                                    onClick={() => handleCardClick(i)}
                                    className={cn(
                                        "absolute top-1/2 w-20 h-32 md:w-24 md:h-40 rounded-lg bg-card border border-gold/30 shadow-xl cursor-pointer transition-all duration-300 origin-bottom",
                                        "hover:z-30 hover:scale-110 hover:border-gold hover:shadow-gold/20",
                                        isSelected ? "opacity-0 pointer-events-none" : "block"
                                    )}
                                    style={{
                                        left: leftPos,
                                        zIndex: i,
                                        transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(${yOffset}px)`,
                                        // We use a data attribute or just inline styles. 
                                        // To handle hover 'push up', we can't easily rely on Tailwind 'hover:-translate-y' conflicting with this translate.
                                        // But we can use a child element for the image that handles the hover lift.
                                    }}
                                >
                                    <div className="w-full h-full transition-transform duration-300 hover:-translate-y-8">
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
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

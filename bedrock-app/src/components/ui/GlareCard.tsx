import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlareCardProps {
    children: React.ReactNode;
    className?: string;
    glareColor?: string;
    borderRadius?: string;
    onClick?: () => void;
}

export const GlareCard = ({
    children,
    className,
    glareColor = "rgba(255, 255, 255, 0.5)",
    borderRadius = "12px",
    onClick
}: GlareCardProps) => {
    const isPointerInside = useRef(false);
    const refElement = useRef<HTMLDivElement>(null);
    const [state, setState] = useState({
        glare: {
            x: 50,
            y: 50,
            o: 0,
        },
        background: {
            x: 50,
            y: 50,
        },
        rotate: {
            x: 0,
            y: 0,
        },
    });

    // Calculate rotation based on pointer position for 3D tilt effect (optional but adds to "glare")
    // For this button specifically, we might want a simpler glare without heavy 3D tilt if it affects accessibility/clickability too much,
    // but "glare hover" usually implies tilt. Let's implement a subtle version.

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const rotateFactor = 0.4; // Sensitivity
        const rect = refElement.current?.getBoundingClientRect();
        if (rect) {
            const position = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
            const percentage = {
                x: (100 / rect.width) * position.x,
                y: (100 / rect.height) * position.y,
            };
            const delta = {
                x: percentage.x - 50,
                y: percentage.y - 50,
            };

            const { background, rotate, glare } = state;
            background.x = 50 + percentage.x / 4 - 12.5;
            background.y = 50 + percentage.y / 3 - 16.67;
            rotate.x = -(delta.y / 3.5);
            rotate.y = delta.x / 3.5;
            rotate.x *= rotateFactor;
            rotate.y *= rotateFactor;
            glare.x = percentage.x;
            glare.y = percentage.y;
            glare.o = 1;

            setState({ ...state, background, rotate, glare });
        }
    };

    const handlePointerEnter = () => {
        isPointerInside.current = true;
        setTimeout(() => {
            if (isPointerInside.current) {
                setState((s) => ({ ...s, glare: { ...s.glare, o: 1 } }));
            }
        }, 100);
    };

    const handlePointerLeave = () => {
        isPointerInside.current = false;
        setState((s) => ({
            ...s,
            glare: { ...s.glare, o: 0 },
            rotate: { x: 0, y: 0 }, // Reset tilt
        }));
    };

    return (
        <div
            ref={refElement}
            className={cn(
                "relative isolate transition-transform will-change-transform  duration-200 ease-out select-none",
                "flex items-center justify-center", // Default centering
                className
            )}
            style={{
                perspective: "600px",
                borderRadius,
            }}
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={onClick}
        >
            <div
                className="h-full w-full relative overflow-hidden transition-transform duration-200 ease-out"
                style={{
                    transform: `rotateX(${state.rotate.x}deg) rotateY(${state.rotate.y}deg)`,
                    borderRadius,
                }}
            >
                {/* Helper for gradient bg or whatever is passed */}
                <div className="w-full h-full relative z-[1]">
                    {children}
                </div>

                {/* Glare Layer */}
                <div
                    className="absolute inset-0 w-full h-full pointer-events-none z-[2] mix-blend-soft-light"
                    style={{
                        background: `radial-gradient(circle at ${state.glare.x}% ${state.glare.y}%, ${glareColor}, transparent 50%)`,
                        opacity: state.glare.o,
                        transition: "opacity 300ms ease",
                        borderRadius,
                    }}
                />

                {/* Specular Glare Layer - Sharp white highlight */}
                <div
                    className="absolute inset-0 w-full h-full pointer-events-none z-[3] mix-blend-color-dodge transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at ${state.glare.x}% ${state.glare.y}%, rgba(255,255,255,0.3) 0%, transparent 40%)`,
                        opacity: state.glare.o * 0.8,
                        borderRadius,
                    }}
                />
            </div>
        </div>
    );
};

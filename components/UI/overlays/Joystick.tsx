/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Joystick - виртуальный джойстик для мобильного управления
 */

import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';
import { mobileUtils } from '../../System/MobileUtils';

export const Joystick: React.FC = () => {
    const { openInventory, closeInventory, status } = useStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const currentX = useRef(0);
    const currentY = useRef(0);
    const [activeDirection, setActiveDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
    const animationRef = useRef<number | null>(null);
    const [isLandscape, setIsLandscape] = useState(mobileUtils.isLandscape);

    // Hold-down timer for inventory (1 second hold)
    const holdDownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inventoryOpenedRef = useRef(false);
    const HOLD_DOWN_DURATION = 1000;

    // Subscribe to orientation changes
    useEffect(() => {
        const unsubscribe = mobileUtils.onOrientationChange((landscape) => {
            setIsLandscape(landscape);
        });
        return unsubscribe;
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (holdDownTimerRef.current) {
                clearTimeout(holdDownTimerRef.current);
            }
        };
    }, []);

    const THRESHOLD = 25;
    const JUMP_THRESHOLD = 30;
    const INVENTORY_THRESHOLD = 30;

    // Smaller joystick in landscape for more game view
    const joystickSize = isLandscape ? 'w-24 h-24' : 'w-[7.5rem] h-[7.5rem]';
    const knobSize = isLandscape ? 'w-10 h-10' : 'w-12 h-12';
    const innerKnobSize = isLandscape ? 'w-6 h-6' : 'w-8 h-8';

    const handlePointerDown = (e: React.PointerEvent) => {
        // Cancel any ongoing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        setIsAnimating(false);
        setIsActive(true);
        startX.current = e.clientX;
        startY.current = e.clientY;
        currentX.current = e.clientX;
        currentY.current = e.clientY;
        setOffset({ x: 0, y: 0 });
        if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isActive) return;
        currentX.current = e.clientX;
        currentY.current = e.clientY;
        let deltaX = currentX.current - startX.current;
        let deltaY = currentY.current - startY.current;

        const MAX_VISUAL_OFFSET = 35;

        const visualX = Math.max(Math.min(deltaX, MAX_VISUAL_OFFSET), -MAX_VISUAL_OFFSET);
        const visualY = Math.max(Math.min(deltaY, MAX_VISUAL_OFFSET), -MAX_VISUAL_OFFSET);

        setOffset({ x: visualX, y: visualY });

        if (deltaX > THRESHOLD) {
            window.dispatchEvent(new CustomEvent('joystick-move', { detail: { direction: 'right' } }));
            startX.current = currentX.current;
            setActiveDirection('right');
            setTimeout(() => setActiveDirection(null), 200);
        } else if (deltaX < -THRESHOLD) {
            window.dispatchEvent(new CustomEvent('joystick-move', { detail: { direction: 'left' } }));
            startX.current = currentX.current;
            setActiveDirection('left');
            setTimeout(() => setActiveDirection(null), 200);
        }

        if (deltaY < -JUMP_THRESHOLD) {
            // Cancel hold timer when jumping
            if (holdDownTimerRef.current) {
                clearTimeout(holdDownTimerRef.current);
                holdDownTimerRef.current = null;
            }
            window.dispatchEvent(new Event('player-jump'));
            startY.current = currentY.current;
            setActiveDirection('up');
            setTimeout(() => setActiveDirection(null), 200);
        } else if (deltaY > INVENTORY_THRESHOLD) {
            // If inventory is open, single down gesture closes it
            if (status === GameStatus.INVENTORY) {
                closeInventory();
                startY.current = currentY.current;
                setActiveDirection('down');
                setTimeout(() => setActiveDirection(null), 200);
            } else {
                // Start hold timer for inventory (1 second hold required to open)
                if (!holdDownTimerRef.current && !inventoryOpenedRef.current) {
                    setActiveDirection('down');
                    holdDownTimerRef.current = setTimeout(() => {
                        openInventory();
                        inventoryOpenedRef.current = true;
                        holdDownTimerRef.current = null;
                    }, HOLD_DOWN_DURATION);
                }
            }
        } else {
            // Cancel hold timer if moved away from down position
            if (holdDownTimerRef.current) {
                clearTimeout(holdDownTimerRef.current);
                holdDownTimerRef.current = null;
                if (activeDirection === 'down') {
                    setActiveDirection(null);
                }
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsActive(false);
        setActiveDirection(null);
        // Cancel hold timer and reset flag
        if (holdDownTimerRef.current) {
            clearTimeout(holdDownTimerRef.current);
            holdDownTimerRef.current = null;
        }
        inventoryOpenedRef.current = false;
        if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);

        // Animate back to center with spring-like effect
        const startOffset = { ...offset };
        const startTime = performance.now();
        const duration = 150;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setOffset({
                x: startOffset.x * (1 - easeOut),
                y: startOffset.y * (1 - easeOut)
            });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setOffset({ x: 0, y: 0 });
                setIsAnimating(false);
                animationRef.current = null;
            }
        };

        setIsAnimating(true);
        animationRef.current = requestAnimationFrame(animate);
    };

    return (
        <div className={`relative ${joystickSize}`}>
            <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative w-full h-full rounded-full flex items-center justify-center touch-none select-none transition-all"
            >
                <div className={`absolute top-1 left-1/2 -translate-x-1/2 transition-all duration-200 ${activeDirection === 'up' ? 'text-blue-400 scale-125 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 'text-blue-600 drop-shadow-[0_0_4px_rgba(96,165,250,0.4)]'}`}>
                    <ArrowUp className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} />
                </div>
                <div className={`absolute left-1 top-1/2 -translate-y-1/2 transition-all duration-200 ${activeDirection === 'left' ? 'text-blue-400 scale-125 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 'text-blue-600 drop-shadow-[0_0_4px_rgba(96,165,250,0.4)]'}`}>
                    <ChevronLeft className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} />
                </div>
                <div className={`absolute right-1 top-1/2 -translate-y-1/2 transition-all duration-200 ${activeDirection === 'right' ? 'text-blue-400 scale-125 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 'text-blue-600 drop-shadow-[0_0_4px_rgba(96,165,250,0.4)]'}`}>
                    <ChevronRight className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} />
                </div>
                <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 transition-all duration-200 ${activeDirection === 'down' ? 'text-blue-300 scale-125 drop-shadow-[0_0_10px_rgba(147,197,253,0.8)]' : 'text-blue-500 drop-shadow-[0_0_4px_rgba(147,197,253,0.4)]'}`}>
                    <Briefcase className={isLandscape ? 'w-4 h-4' : 'w-5 h-5'} />
                </div>

                <div
                    className={`relative z-10 ${knobSize} rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-cyan-200/40 flex items-center justify-center transition-transform duration-75 cursor-pointer opacity-50 ${isActive ? 'scale-95 bg-cyan-600/50' : 'bg-cyan-500/50'}`}
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 60%)'
                    }}
                >
                    <div className={`${innerKnobSize} rounded-full bg-gradient-to-br from-cyan-300/10 to-transparent border border-white/10`}></div>
                </div>
            </div>
        </div>
    );
};

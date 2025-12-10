/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TouchZoneHints - подсказки для touch-зон управления
 * Левая половина = стрельба (tap), Правая половина = joystick (свайпы)
 * Только для мобильных устройств с touch
 */

import React, { useState, useEffect } from 'react';
import { Crosshair, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';

export const TouchZoneHints: React.FC = () => {
    const { status } = useStore();
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showHints, setShowHints] = useState(true);

    useEffect(() => {
        // Проверяем, это touch-устройство
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth < 1024;
        setIsTouchDevice(isTouch && isSmallScreen);
    }, []);

    // Скрываем подсказки через 5 секунд игры
    useEffect(() => {
        if (status === GameStatus.PLAYING) {
            const timer = setTimeout(() => setShowHints(false), 5000);
            return () => clearTimeout(timer);
        } else {
            setShowHints(true);
        }
    }, [status]);

    // Показываем только на touch-устройствах и только во время игры
    if (!isTouchDevice || status !== GameStatus.PLAYING || !showHints) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[25vh] pointer-events-none z-[45] flex">
            {/* Левая зона - TAP для стрельбы (35%) */}
            <div className="w-[35%] border-r-2 border-dashed border-white/40 flex flex-col items-center justify-center bg-gradient-to-t from-red-900/20 to-transparent">
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="p-3 rounded-full bg-red-500/30 border-2 border-red-400/50">
                        <Crosshair className="w-10 h-10 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                    </div>
                    <span className="text-white text-sm font-black uppercase tracking-wider drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">TAP</span>
                </div>
            </div>
            {/* Правая зона - SWIPE для управления (65%) */}
            <div className="w-[65%] flex flex-col items-center justify-center bg-gradient-to-t from-blue-900/20 to-transparent">
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="flex items-center gap-3 p-3 rounded-full bg-blue-500/30 border-2 border-blue-400/50">
                        <ChevronLeft className="w-7 h-7 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                        <ArrowUp className="w-8 h-8 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                        <ChevronRight className="w-7 h-7 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                    </div>
                    <span className="text-white text-sm font-black uppercase tracking-wider drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">SWIPE</span>
                </div>
            </div>
        </div>
    );
};

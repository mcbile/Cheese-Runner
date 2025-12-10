/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TouchFPSCounter - Компактный FPS счётчик для тач-устройств
 * Показывается только на мобильных устройствах во время игры
 * Тап для переключения видимости, долгий тап для подробной статистики
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';

export const TouchFPSCounter: React.FC = () => {
    const { status } = useStore();
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [fps, setFps] = useState(60);
    const [avgFps, setAvgFps] = useState(60);
    const [minFps, setMinFps] = useState(60);
    const [maxFps, setMaxFps] = useState(60);
    const [frameTime, setFrameTime] = useState(16.67);

    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const fpsHistoryRef = useRef<number[]>([]);
    const frameIdRef = useRef<number>(0);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef(false);

    // Проверка тач-устройства
    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth < 1024;
        setIsTouchDevice(isTouch && isSmallScreen);
    }, []);

    // FPS измерение
    useEffect(() => {
        if (!isTouchDevice) return;

        let lastFrameTime = performance.now();
        const maxHistoryLength = 60;

        const updateFPS = () => {
            const now = performance.now();
            const delta = now - lastFrameTime;
            lastFrameTime = now;
            frameCountRef.current++;

            const elapsed = now - lastTimeRef.current;
            if (elapsed >= 500) {
                const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);

                fpsHistoryRef.current.push(currentFps);
                if (fpsHistoryRef.current.length > maxHistoryLength) {
                    fpsHistoryRef.current.shift();
                }

                const history = fpsHistoryRef.current;
                const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
                const min = Math.min(...history);
                const max = Math.max(...history);

                setFps(currentFps);
                setAvgFps(avg);
                setMinFps(min === Infinity ? currentFps : min);
                setMaxFps(max === -Infinity ? currentFps : max);
                setFrameTime(Math.round(delta * 10) / 10);

                frameCountRef.current = 0;
                lastTimeRef.current = now;
            }

            frameIdRef.current = requestAnimationFrame(updateFPS);
        };

        frameIdRef.current = requestAnimationFrame(updateFPS);

        return () => {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
        };
    }, [isTouchDevice]);

    // Обработчики тач-событий
    const handleTouchStart = useCallback(() => {
        isLongPressRef.current = false;
        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setIsExpanded(prev => !prev);
        }, 500);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
        }
        if (!isLongPressRef.current) {
            setIsVisible(prev => !prev);
        }
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, []);

    // Показываем только на тач-устройствах во время игры
    if (!isTouchDevice || (status !== GameStatus.PLAYING && status !== GameStatus.COUNTDOWN)) {
        return null;
    }

    // Цвет в зависимости от FPS
    const getFpsColor = (value: number) => {
        if (value >= 55) return 'text-green-400';
        if (value >= 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getBgColor = (value: number) => {
        if (value >= 55) return 'bg-green-500/20 border-green-500/40';
        if (value >= 30) return 'bg-yellow-500/20 border-yellow-500/40';
        return 'bg-red-500/20 border-red-500/40';
    };

    return (
        <div
            className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {isVisible ? (
                isExpanded ? (
                    // Расширенный вид
                    <div className={`rounded-lg px-2 py-1.5 font-mono text-[10px] border backdrop-blur-sm ${getBgColor(fps)}`}>
                        <div className="flex items-center gap-2">
                            <span className={`font-black text-sm ${getFpsColor(fps)}`}>{fps}</span>
                            <span className="text-gray-400">FPS</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px]">
                            <span className="text-gray-500">avg:</span>
                            <span className={getFpsColor(avgFps)}>{avgFps}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-500">min:</span>
                            <span className={getFpsColor(minFps)}>{minFps}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-500">max:</span>
                            <span className="text-green-300">{maxFps}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px]">
                            <span className="text-gray-500">frame:</span>
                            <span className="text-cyan-300">{frameTime}ms</span>
                        </div>
                    </div>
                ) : (
                    // Компактный вид
                    <div className={`rounded-lg px-2 py-1 font-mono text-xs border backdrop-blur-sm ${getBgColor(fps)}`}>
                        <span className={`font-black ${getFpsColor(fps)}`}>{fps}</span>
                        <span className="text-gray-400 ml-1">FPS</span>
                    </div>
                )
            ) : (
                // Скрытый режим - маленькая точка
                <div className={`w-3 h-3 rounded-full ${fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'} opacity-50`} />
            )}
        </div>
    );
};

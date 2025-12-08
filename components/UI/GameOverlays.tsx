
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Trophy, Play, Crosshair, RotateCcw, Home, Flame, Volume2, VolumeX, Briefcase, ShoppingCart, Skull, Zap, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, DIFFICULTY_CONFIG, RUN_SPEED_BASE } from '../../types';
import { audio } from '../System/Audio';
import { mobileUtils } from '../System/MobileUtils';

/**
 * TouchFPSCounter - Компактный FPS счётчик для тач-устройств
 * Показывается только на мобильных устройствах во время игры
 * Тап для переключения видимости, долгий тап для подробной статистики
 */
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

// Exit confirmation modal
const ExitConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    return (
        <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[90%] max-w-sm bg-[#0F172A] rounded-2xl border-4 border-white shadow-[0_0_30px_rgba(174,28,40,0.5)] p-5 flex flex-col items-center">
                {/* Warning icon */}
                <div className="w-16 h-16 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-9 h-9 text-red-400" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-red-400 uppercase tracking-wider mb-2">
                    EXIT GAME?
                </h2>

                {/* Warning text */}
                <p className="text-center text-gray-300 text-sm mb-4 leading-relaxed">
                    All your progress will be <span className="text-red-400 font-bold">LOST</span>!
                    <br />
                    Cheese points, earnings, and level progress will not be saved.
                </p>

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#1E4785] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                    >
                        NO
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                    >
                        YES
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CountdownOverlay: React.FC = () => {
    const { setStatus } = useStore();
    const [count, setCount] = useState(3);
    useEffect(() => {
        audio.playCountdownBeep();
        const timer = setInterval(() => {
            setCount(prev => {
                if (prev === 1) { audio.playCountdownGo(); return 0; }
                if (prev <= 0) { clearInterval(timer); setStatus(GameStatus.PLAYING); return 0; }
                audio.playCountdownBeep(); return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [setStatus]);
    return (
        <div className="absolute inset-0 flex items-center justify-center z-[200] pointer-events-none">
            <div className="flex flex-col items-center"><h1 key={count} className="text-8xl md:text-9xl font-black font-cyber text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-in zoom-in-50 duration-300">{count > 0 ? count : "RUN!"}</h1></div>
        </div>
    );
};

export const BossHealthBar: React.FC = () => {
    const { isBossActive, bossHealth, bossMaxHealth } = useStore();
    if (!isBossActive) return null;
    const pct = Math.max(0, (bossHealth / bossMaxHealth) * 100);
    return (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-64 md:w-96 flex flex-col items-center animate-in fade-in zoom-in duration-500 z-40">
            <div className="w-full h-5 bg-black/60 border-2 border-red-900 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,0,0,0.5)] mb-1 relative">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
                <span className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {bossHealth}/{bossMaxHealth}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">👨🏻‍🔬</span>
                <span className="text-red-500 font-black font-cyber text-sm tracking-widest drop-shadow-md">THE SCIENTIST</span>
            </div>
        </div>
    );
};

export const FeverTimer: React.FC = () => {
    const { isCheeseFeverActive, cheeseFeverEndTime } = useStore();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isCheeseFeverActive) return;
        const DURATION = 20000;
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, cheeseFeverEndTime - now);
            setProgress((remaining / DURATION) * 100);
        }, 50);
        return () => clearInterval(interval);
    }, [isCheeseFeverActive, cheeseFeverEndTime]);

    if (!isCheeseFeverActive) return null;

    return (
        <div className="flex flex-col items-center animate-pulse mt-2">
            <div className="flex items-center gap-2 mb-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest">FEVER MODE</span>
            </div>
            <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-orange-500/50">
                <div className="h-full bg-orange-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
};

interface ActiveEffect {
    key: string;
    label: string;
    emoji: string;
    endTime: number;
    color: string;
    duration: number;
}

interface ActivePerk {
    key: string;
    label: string;
    emoji: string;
    color: string;
}

export const ActiveEffectsDisplay: React.FC = () => {
    const {
        isFirewallActive, firewallEndTime,
        isSpeedBoostActive, speedBoostEndTime,
        isCheeseFeverActive, cheeseFeverEndTime,
        isSlowMotionActive, slowMotionEndTime,
        chasingSnakesActive,
        isGodMode,
        isDevMode,
        isFirstPersonMode
    } = useStore();

    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => forceUpdate(n => n + 1), 100);
        return () => clearInterval(interval);
    }, []);

    const effects: ActiveEffect[] = [];
    const perks: ActivePerk[] = [];
    const modes: ActivePerk[] = []; // Special modes (God, Dev)
    const now = Date.now();

    // Dev/God/FPS modes (show first, most important)
    if (isFirstPersonMode) {
        modes.push({ key: 'fps-mode', label: 'FPS', emoji: '👁️', color: 'text-cyan-400 border-cyan-400/50' });
    }
    if (isDevMode) {
        modes.push({ key: 'dev-mode', label: 'DEV', emoji: '👑', color: 'text-green-400 border-green-400/50' });
    }
    if (isGodMode) {
        modes.push({ key: 'god-mode', label: 'GOD', emoji: '⭐', color: 'text-purple-400 border-purple-400/50' });
    }

    // Timed effects
    if (isFirewallActive && firewallEndTime > now) {
        effects.push({ key: 'firewall', label: 'FIREWALL', emoji: '🔥', endTime: firewallEndTime, color: 'text-red-500 border-red-500/50', duration: 10000 });
    }
    if (isSpeedBoostActive && speedBoostEndTime > now) {
        effects.push({ key: 'speedboost', label: 'SPEED', emoji: '⚡', endTime: speedBoostEndTime, color: 'text-yellow-400 border-yellow-400/50', duration: 5000 });
    }
    if (isCheeseFeverActive && cheeseFeverEndTime > now) {
        effects.push({ key: 'fever', label: 'FEVER', emoji: '🧀', endTime: cheeseFeverEndTime, color: 'text-orange-500 border-orange-500/50', duration: 20000 });
    }
    if (isSlowMotionActive && slowMotionEndTime > now) {
        effects.push({ key: 'slowmo', label: 'SLOW', emoji: '🐢', endTime: slowMotionEndTime, color: 'text-cyan-400 border-cyan-400/50', duration: 15000 });
    }

    // Permanent perks (shop purchases)
    if (chasingSnakesActive) {
        perks.push({ key: 'chasing-snakes', label: 'SNAKES', emoji: '🐍', color: 'text-green-500 border-green-500/50' });
    }

    // Sort timed effects by remaining time (less time = higher position)
    effects.sort((a, b) => (a.endTime - now) - (b.endTime - now));

    if (effects.length === 0 && perks.length === 0 && modes.length === 0) return null;

    return (
        <div className="flex flex-col items-center gap-1.5 mb-2">
            {/* Dev/God modes first (most important) */}
            {modes.map(mode => (
                <div key={mode.key} className={`flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded-lg border ${mode.color.split(' ')[1]} animate-pulse`}>
                    <span className="text-base">{mode.emoji}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${mode.color.split(' ')[0]}`}>{mode.label}</span>
                </div>
            ))}
            {/* Permanent perks */}
            {perks.map(perk => (
                <div key={perk.key} className={`flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg border ${perk.color.split(' ')[1]}`}>
                    <span className="text-base">{perk.emoji}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${perk.color.split(' ')[0]}`}>{perk.label}</span>
                </div>
            ))}
            {/* Timed effects */}
            {effects.map(effect => {
                const remaining = Math.max(0, effect.endTime - now);
                const progress = (remaining / effect.duration) * 100;
                return (
                    <div key={effect.key} className={`flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg border ${effect.color.split(' ')[1]}`}>
                        <span className="text-base">{effect.emoji}</span>
                        <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div className={`h-full ${effect.color.split(' ')[0].replace('text-', 'bg-')} transition-all duration-100`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className={`text-[9px] font-bold ${effect.color.split(' ')[0]}`}>{Math.ceil(remaining / 1000)}s</span>
                    </div>
                );
            })}
        </div>
    );
};

export const StatisticsCard: React.FC<{ variant?: 'default' | 'victory' }> = ({ variant = 'default' }) => {
    const { levelStats, bossDefeated, betAmount, bossMaxHealth, balance, isDevMode } = useStore();

    const showBoss = bossDefeated || isDevMode;
    const bossReward = (bossDefeated || isDevMode) ? (Math.floor(bossMaxHealth * 1.2) * betAmount) : 0;

    return (
        <div className={`w-full rounded-xl border p-3 mb-2 font-mono shadow-xl ${variant === 'victory' ? 'bg-green-900/20 border-green-500/30' : 'bg-black/40 border-white/10'}`}>
            {/* Enemy Cards 3x2 Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Row 1: Trap & Snake */}
                <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center border border-amber-600/30">
                    <span className="text-[38px] leading-none mr-3">🪤</span>
                    <div className="flex flex-col">
                        <span className="text-[24px] font-black text-gray-300 leading-tight">×{levelStats.trapsDestroyed}</span>
                        <span className="text-green-400 font-bold text-[14px]">€{levelStats.trapsEarnings.toFixed(2)}</span>
                    </div>
                </div>
                <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center border border-green-500/30">
                    <span className="text-[38px] leading-none mr-3">🐍</span>
                    <div className="flex flex-col">
                        <span className="text-[24px] font-black text-gray-300 leading-tight">×{levelStats.snakesDestroyed}</span>
                        <span className="text-green-400 font-bold text-[14px]">€{levelStats.snakesEarnings.toFixed(2)}</span>
                    </div>
                </div>
                {/* Row 2: Cat & Owl 🦉 */}
                <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center border border-purple-400/30">
                    <span className="text-[38px] leading-none mr-3">😾</span>
                    <div className="flex flex-col">
                        <span className="text-[24px] font-black text-gray-300 leading-tight">×{levelStats.catsDestroyed}</span>
                        <span className="text-green-400 font-bold text-[14px]">€{levelStats.catsEarnings.toFixed(2)}</span>
                    </div>
                </div>
                <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center border border-amber-700/30">
                    <span className="text-[38px] leading-none mr-3">🦉</span>
                    <div className="flex flex-col">
                        <span className="text-[24px] font-black text-gray-300 leading-tight">×{levelStats.eaglesDestroyed}</span>
                        <span className="text-green-400 font-bold text-[14px]">€{levelStats.eaglesEarnings.toFixed(2)}</span>
                    </div>
                </div>
                {/* Row 3: Syringe & Boss */}
                <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center border border-cyan-400/30">
                    <span className="text-[38px] leading-none mr-3">💉</span>
                    <div className="flex flex-col">
                        <span className="text-[24px] font-black text-gray-300 leading-tight">×{levelStats.syringesDestroyed}</span>
                        <span className="text-green-400 font-bold text-[14px]">€{levelStats.syringesEarnings.toFixed(2)}</span>
                    </div>
                </div>
                {showBoss && (
                    <div className="bg-white/10 rounded-xl p-2 flex items-center justify-center border border-red-500/30">
                        <span className="text-[38px] leading-none mr-3">👨🏻‍🔬</span>
                        <div className="flex flex-col">
                            <span className="text-[24px] font-black text-gray-300 leading-tight">×1</span>
                            <span className="text-green-400 font-bold text-[14px]">€{bossReward.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="border-t border-white/10 pt-3 grid grid-cols-3 gap-2">
                <div className="text-center">
                    <div className="text-xl font-black text-green-400">€{balance.toFixed(0)}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Balance</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-black text-red-400">🎯 {levelStats.shotsFired}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Shots</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-black text-yellow-400">🧀 {levelStats.cheeseCollected}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Cheese</div>
                </div>
            </div>
        </div>
    );
};

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
    const HOLD_DOWN_DURATION = 1000; // 1 second

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
        const duration = 150; // ms

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

export const PausedScreen: React.FC = () => {
    const { resumeGame, restartGame, quitToMenu } = useStore();
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const handleQuitClick = () => {
        setShowExitConfirm(true);
    };

    const handleExitConfirm = () => {
        setShowExitConfirm(false);
        quitToMenu();
    };

    const handleExitCancel = () => {
        setShowExitConfirm(false);
    };

    return (
        <div className="absolute inset-0 bg-black/25 z-[100] flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 pointer-events-auto">

            <div className="bg-[#0F172A] p-8 rounded-3xl border-4 border-white shadow-2xl flex flex-col items-center w-full max-w-md max-h-full shrink min-h-0 overflow-y-auto">
                <h1 className="text-4xl font-black text-white font-cyber mb-8 tracking-widest uppercase">PAUSED</h1>
                <button onClick={resumeGame} className="w-full flex items-center justify-center px-6 py-4 mb-4 rounded-xl bg-[#AE1C28] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#D32F2F] transition-all"><Play className="mr-2 w-5 h-5 fill-current" /> RESUME</button>
                <button onClick={() => { resumeGame(); restartGame(); }} className="w-full flex items-center justify-center px-6 py-4 mb-4 rounded-xl bg-white text-[#21468B] font-black tracking-widest uppercase border-2 border-[#21468B] shadow-lg hover:bg-gray-100 transition-all"><RotateCcw className="mr-2 w-5 h-5" /> RESTART</button>
                <button onClick={handleQuitClick} className="w-full flex items-center justify-center px-6 py-4 rounded-xl bg-[#21468B] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#2B5BA7] transition-all"><Home className="mr-2 w-5 h-5" /> QUIT</button>
            </div>

            <div className="w-full shrink basis-4 min-h-4" />

            {/* Exit confirmation modal */}
            {showExitConfirm && (
                <ExitConfirmModal
                    onConfirm={handleExitConfirm}
                    onCancel={handleExitCancel}
                />
            )}
        </div>
    );
};

export const LevelCompleteScreen: React.FC = () => {
    const { openShop, startNextLevel, quitToMenu, level, levelStats, bossDefeated, bossMaxHealth, betAmount } = useStore();
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const bossReward = bossDefeated ? (Math.floor(bossMaxHealth * 1.2) * betAmount) : 0;
    const totalEarnings = levelStats.trapsEarnings + levelStats.snakesEarnings + levelStats.catsEarnings + levelStats.eaglesEarnings + levelStats.syringesEarnings + bossReward;

    const handleHomeClick = () => {
        setShowExitConfirm(true);
    };

    const handleExitConfirm = () => {
        setShowExitConfirm(false);
        quitToMenu();
    };

    const handleExitCancel = () => {
        setShowExitConfirm(false);
    };

    return (
        <div className="absolute inset-0 bg-blue-900/60 z-[100] text-white pointer-events-auto backdrop-blur-sm flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4">

            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-4 px-5 overflow-y-auto">
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0"><span className="text-yellow-400">LEVEL {level}</span> <span className="text-white">DONE</span></h1>

                {/* Two scoreboards above the card */}
                <div className="flex gap-3 text-center mb-3 w-full shrink-0">
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-green-500/50 shadow-inner">
                        <div className="text-[30px] font-black text-green-400 drop-shadow-sm">{totalEarnings.toFixed(2)}</div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">💰 Rewarded</div>
                    </div>
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-yellow-500/50 shadow-inner flex flex-col items-center justify-center">
                        <div className="text-[30px] font-black text-yellow-400 drop-shadow-sm">{levelStats.cheesePoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">🧀 Points</div>
                    </div>
                </div>

                <StatisticsCard variant="victory" />

                {/* Navigation buttons - Shop (Blue) / Home (White) / Run (Red) - like ShopScreen */}
                <div className="flex items-center gap-2 w-full shrink-0">
                    <button
                        onClick={openShop}
                        className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#21468B] text-white border-white hover:bg-[#2a5ab0] active:scale-95"
                    >
                        <ShoppingCart className="w-4 h-4" /> SHOP
                    </button>
                    <button
                        onClick={handleHomeClick}
                        className="w-12 shrink-0 py-2.5 rounded-xl bg-white text-[#21468B] font-black border-2 border-[#21468B] hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
                        title="Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <button
                        onClick={startNextLevel}
                        className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#AE1C28] text-white border-white hover:bg-[#D32F2F] active:scale-95"
                    >
                        RUN <Play className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Exit confirmation modal */}
            {showExitConfirm && (
                <ExitConfirmModal
                    onConfirm={handleExitConfirm}
                    onCancel={handleExitCancel}
                />
            )}
        </div>
    );
};

export const GameOverScreen: React.FC = () => {
    const { restartLevel, quitToMenu, levelStats, bossDefeated, bossMaxHealth, betAmount, level } = useStore();
    const bossReward = bossDefeated ? (Math.floor(bossMaxHealth * 1.2) * betAmount) : 0;
    const totalEarnings = levelStats.trapsEarnings + levelStats.snakesEarnings + levelStats.catsEarnings + levelStats.eaglesEarnings + levelStats.syringesEarnings + bossReward;

    // Trigger game over haptic on mount
    useEffect(() => {
        mobileUtils.gameOver();
    }, []);

    return (
        <div className="absolute inset-0 bg-blue-900/60 z-[100] text-white pointer-events-auto backdrop-blur-sm flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4">

            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-4 px-5 overflow-y-auto">
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0"><span className="text-yellow-400">GAME</span> <span className="text-white">OVER</span></h1>

                {/* Two scoreboards above the card */}
                <div className="flex gap-3 text-center mb-3 w-full shrink-0">
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-green-500/50 shadow-inner">
                        <div className="text-[30px] font-black text-green-400 drop-shadow-sm">{totalEarnings.toFixed(2)}</div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">💰 Rewarded</div>
                    </div>
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-yellow-500/50 shadow-inner flex flex-col items-center justify-center">
                        <div className="text-[30px] font-black text-yellow-400 drop-shadow-sm">{levelStats.cheesePoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">🧀 Points</div>
                    </div>
                </div>

                <StatisticsCard variant="victory" />

                <div className="flex gap-2 w-full shrink-0">
                    <button onClick={quitToMenu} className="flex-1 py-3 text-sm rounded-xl bg-[#1E4785] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#2B5BA7] active:scale-95 transition-all">MAIN MENU</button>
                    <button onClick={() => { audio.startMusic(); restartLevel(); }} className="flex-1 py-3 text-sm rounded-xl bg-[#FF6B00] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#FF8C00] active:scale-95 transition-all">RESTART LVL {level}</button>
                </div>
            </div>
        </div>
    );
};

/**
 * Touch Control Zone Hints - показывает подсказки для невидимых touch-зон
 * Левая половина = стрельба (tap), Правая половина = joystick (свайпы)
 * Только для мобильных устройств с touch
 */
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

export const VictoryScreen: React.FC = () => {
    const { startAgainFromVictory, quitToMenuFromVictory, levelStats, bossDefeated, bossMaxHealth, betAmount } = useStore();
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const bossReward = bossDefeated ? (Math.floor(bossMaxHealth * 1.2) * betAmount) : 0;
    const totalEarnings = levelStats.trapsEarnings + levelStats.snakesEarnings + levelStats.catsEarnings + levelStats.eaglesEarnings + levelStats.syringesEarnings + bossReward;

    const handleMenuClick = () => {
        setShowExitConfirm(true);
    };

    const handleExitConfirm = () => {
        setShowExitConfirm(false);
        quitToMenuFromVictory();
    };

    const handleExitCancel = () => {
        setShowExitConfirm(false);
    };

    return (
        <div className="absolute inset-0 bg-blue-900/60 z-[100] text-white pointer-events-auto backdrop-blur-sm flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4">

            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-4 px-5 overflow-y-auto">
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0"><span className="text-yellow-400">YOU'VE</span> <span className="text-white">WON</span></h1>

                {/* Two scoreboards above the card */}
                <div className="flex gap-3 text-center mb-3 w-full shrink-0">
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-green-500/50 shadow-inner">
                        <div className="text-[30px] font-black text-green-400 drop-shadow-sm">{totalEarnings.toFixed(2)}</div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">💰 Rewarded</div>
                    </div>
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-yellow-500/50 shadow-inner flex flex-col items-center justify-center">
                        <div className="text-[30px] font-black text-yellow-400 drop-shadow-sm">{levelStats.cheesePoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">🧀 Points</div>
                    </div>
                </div>

                <StatisticsCard variant="victory" />

                <div className="flex gap-2 w-full shrink-0">
                    <button onClick={handleMenuClick} className="flex-1 py-3 text-sm rounded-xl bg-[#1E4785] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#2B5BA7] active:scale-95 transition-all">MAIN MENU</button>
                    <button onClick={() => { audio.startMusic(); startAgainFromVictory(); }} className="flex-1 py-3 text-sm rounded-xl bg-[#FF6B00] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#FF8C00] active:scale-95 transition-all">START AGAIN</button>
                </div>
            </div>

            {/* Exit confirmation modal */}
            {showExitConfirm && (
                <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-[90%] max-w-sm bg-[#0F172A] rounded-2xl border-4 border-white shadow-[0_0_30px_rgba(33,70,139,0.5)] p-5 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-900/50 border-2 border-blue-500 flex items-center justify-center mb-4">
                            <Home className="w-9 h-9 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-black text-blue-400 uppercase tracking-wider mb-2">
                            MAIN MENU?
                        </h2>
                        <p className="text-center text-gray-300 text-sm mb-4 leading-relaxed">
                            Your <span className="text-yellow-400 font-bold">score</span>, <span className="text-green-400 font-bold">balance</span>, and <span className="text-purple-400 font-bold">inventory</span> will be saved.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleExitCancel}
                                className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#1E4785] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleExitConfirm}
                                className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                            >
                                YES
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

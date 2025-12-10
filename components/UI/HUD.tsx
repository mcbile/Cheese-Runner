
import React, { useEffect, useState, useRef, useMemo } from 'react';
// Volume and Pause icons removed - using emojis instead
import { useStore } from '../../store';
import { useShallow } from 'zustand/react/shallow';
import { GameStatus } from '../../types';
import { audio } from '../System/Audio';
import { LevelPreloadScreen } from '../World/Preloader';
import { mobileUtils } from '../System/MobileUtils';

// Import modular components
import { ShopScreen } from './ShopScreen';
import { InventoryScreen } from './InventoryScreen';
import { MenuScreen, BetControl, DifficultySelector } from './MenuScreen';
import {
    CountdownOverlay,
    BossHealthBar,
    FeverTimer,
    SettingsScreen,
    LevelCompleteScreen,
    GameOverScreen,
    VictoryScreen,
    ActiveEffectsDisplay,
    TouchZoneHints
} from './GameOverlays';

const LEVEL_PRELOAD_TIME = 3; // 3 seconds for level preloader

interface HUDProps {
    onStartRun?: () => void;
    hideMenu?: boolean;
}

export const HUD: React.FC<HUDProps> = ({ onStartRun, hideMenu }) => {
    // Use shallow comparison to prevent unnecessary re-renders
    // Split into logical groups for better granularity
    const { status, level } = useStore(
        useShallow(state => ({
            status: state.status,
            level: state.level
        }))
    );

    const { lives, maxLives, speed, collectedLetters } = useStore(
        useShallow(state => ({
            lives: state.lives,
            maxLives: state.maxLives,
            speed: state.speed,
            collectedLetters: state.collectedLetters
        }))
    );

    const { balance, betAmount, cheeseCollected } = useStore(
        useShallow(state => ({
            balance: state.balance,
            betAmount: state.betAmount,
            cheeseCollected: state.levelStats.cheeseCollected
        }))
    );

    // Actions don't need shallow - they're stable references
    const pauseGame = useStore(state => state.pauseGame);
    const resumeGame = useStore(state => state.resumeGame);
    const toggleMute = useStore(state => state.toggleMute);
    const startLevelFromPreload = useStore(state => state.startLevelFromPreload);
    const toggleFirstPersonMode = useStore(state => state.toggleFirstPersonMode);

    const speedMs = useMemo(() => speed.toFixed(1).replace('.', ','), [speed]);
    const shotsRemaining = useMemo(() => betAmount > 0 ? Math.floor(balance / betAmount) : 0, [balance, betAmount]);

    // Level preload countdown state
    const [levelPreloadCountdown, setLevelPreloadCountdown] = useState(LEVEL_PRELOAD_TIME);
    const countdownRef = useRef(LEVEL_PRELOAD_TIME);

    // Track orientation for adaptive layout
    const [isLandscape, setIsLandscape] = useState(mobileUtils.isLandscape);

    useEffect(() => {
        const unsubscribe = mobileUtils.onOrientationChange((landscape) => {
            setIsLandscape(landscape);
        });
        return unsubscribe;
    }, []);

    // Adaptive padding based on orientation
    // Enable pointer events when in MENU status so START RUN button works
    const pointerEvents = status === GameStatus.MENU ? 'pointer-events-auto' : 'pointer-events-none';
    const containerClass = `fixed inset-0 ${pointerEvents} flex flex-col justify-between ${isLandscape ? 'p-1 md:p-3' : 'p-2 md:p-6'} z-50 overflow-hidden safe-area-all`;

    useEffect(() => {
        if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY || status === GameStatus.LEVEL_COMPLETE) {
            audio.stopMusic();
        }
    }, [status]);

    // Level preload countdown timer
    useEffect(() => {
        if (status !== GameStatus.LEVEL_PRELOAD) {
            // Reset countdown when entering a new preload
            countdownRef.current = LEVEL_PRELOAD_TIME;
            setLevelPreloadCountdown(LEVEL_PRELOAD_TIME);
            return;
        }

        const interval = setInterval(() => {
            countdownRef.current -= 1;
            setLevelPreloadCountdown(countdownRef.current);
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    // Handle start level from preload
    const handleStartLevelFromPreload = () => {
        startLevelFromPreload();
    };

    // Keyboard shortcuts: M=mute, ESC=settings, V=view mode
    // D key handled globally in App.tsx
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // M - toggle mute
            if (e.key === 'm' || e.key === 'M') {
                toggleMute();
            }
            // ESC - open/close settings
            if (e.key === 'Escape') {
                if (status === GameStatus.PLAYING || status === GameStatus.COUNTDOWN) pauseGame();
                else if (status === GameStatus.PAUSED) resumeGame();
            }
            // V - toggle view mode (camera)
            if (e.key === 'v' || e.key === 'V') {
                toggleFirstPersonMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, pauseGame, resumeGame, toggleMute, toggleFirstPersonMode]);

    return (
        <div className={containerClass}>
            {/* DevConsole moved to App.tsx for global access */}
            <BossHealthBar />

            {status === GameStatus.SHOP && <ShopScreen />}
            {status === GameStatus.INVENTORY && <InventoryScreen />}
            {status === GameStatus.COUNTDOWN && <CountdownOverlay />}
            {status === GameStatus.LEVEL_PRELOAD && (
                <LevelPreloadScreen
                    level={level}
                    countdown={levelPreloadCountdown}
                    visible={true}
                    onStart={handleStartLevelFromPreload}
                />
            )}
            {status === GameStatus.PAUSED && <SettingsScreen />}
            {status === GameStatus.LEVEL_COMPLETE && <LevelCompleteScreen />}
            {status === GameStatus.MENU && !hideMenu && <MenuScreen onStartRun={onStartRun} />}
            {status === GameStatus.GAME_OVER && <GameOverScreen />}
            {status === GameStatus.VICTORY && <VictoryScreen />}

            {/* Touch Zone Hints - показываем только на мобильных */}
            <TouchZoneHints />

            {/* TOP BAR - only FeverTimer, no buttons (all controls in Settings) */}
            <div className="flex flex-col w-full gap-2 pointer-events-none">
                <div className="flex justify-between items-start w-full">
                    {/* LEFT: Fever Timer only */}
                    <div className="flex flex-col items-start">
                        <FeverTimer />
                    </div>
                    {/* RIGHT: empty - all controls moved to Settings */}
                </div>
            </div>

            {/* CENTER: KAASINO Logo - letter-by-letter coloring from left to right */}
            <div className={`absolute ${isLandscape ? 'top-2' : 'top-6'} left-1/2 -translate-x-1/2 pointer-events-auto`}>
                {/* Each collected letter (by order 0-6) lights up corresponding position in logo */}
                {(() => {
                    // Count how many letters collected in order (0,1,2,3,4,5,6)
                    // Letters light up left-to-right based on collection order
                    const litCount = collectedLetters.length;
                    const isComplete = litCount === 7;
                    // Calculate percentage of logo to show as bright (each letter = ~14.3%)
                    const litPercent = (litCount / 7) * 100;

                    return (
                        <div className={`relative ${isLandscape ? 'h-[36px]' : 'h-[48px]'} md:h-[56px]`}>
                            {/* Base: dim logo (always visible) */}
                            <img
                                src="/kaas_logo_start.png"
                                alt="KAASINO"
                                className="h-full w-auto object-contain"
                            />
                            {/* Overlay: bright logo clipped to show only collected portion */}
                            <img
                                src="/kaas_logo_end.png"
                                alt="KAASINO"
                                className="absolute top-0 left-0 h-full w-auto object-contain"
                                style={{
                                    clipPath: `inset(0 ${100 - litPercent}% 0 0)`,
                                    filter: isComplete
                                        ? 'drop-shadow(0 0 12px rgba(255,215,0,0.9)) drop-shadow(0 0 6px rgba(255,200,0,0.7))'
                                        : 'none',
                                    transition: 'clip-path 0.4s ease-out, filter 0.4s ease-out',
                                }}
                            />
                        </div>
                    );
                })()}
            </div>

            {/* BOTTOM: Info blocks - unified layout for all devices (no visible buttons/joystick) */}
            <div className={`w-full flex justify-between items-end ${isLandscape ? 'pb-2' : 'pb-4'} relative`}>
                {/* LEFT: Info blocks */}
                <div className={`${isLandscape ? 'pl-3' : 'pl-4'} flex flex-col items-start gap-1 pointer-events-none`}>
                    {/* Cheese */}
                    <div className="flex items-center px-2 py-1 bg-[#0F172A]/60 border border-yellow-900/30 rounded-lg backdrop-blur-sm">
                        <span className="text-yellow-400 mr-1 text-sm">🧀</span>
                        <span className="text-yellow-400 font-mono font-black text-xs">{cheeseCollected}</span>
                    </div>
                    {/* Lives */}
                    <div className="flex items-center px-2 py-1 bg-[#0F172A]/60 border border-red-900/30 rounded-lg backdrop-blur-sm">
                        <span className="mr-1 text-sm">❤️</span>
                        <span className="text-white font-mono font-black text-xs">{lives}/{maxLives}</span>
                    </div>
                    {/* Shots */}
                    <div className="flex items-center px-2 py-1 bg-[#0F172A]/60 border border-green-900/30 rounded-lg backdrop-blur-sm">
                        <span className="text-green-400 mr-1 text-sm">🎯</span>
                        <span className="text-green-400 font-mono font-black text-xs">{shotsRemaining}</span>
                    </div>
                </div>

                {/* RIGHT: Level, Speed, Active Effects + Settings button */}
                <div className={`${isLandscape ? 'pr-3' : 'pr-4'} flex flex-col items-end gap-1`}>
                    <div className="pointer-events-none">
                        <ActiveEffectsDisplay />
                    </div>
                    {/* Speed */}
                    <div className="flex items-center px-2 py-1 bg-[#0F172A]/60 border border-cyan-900/30 rounded-lg backdrop-blur-sm pointer-events-none">
                        <span className="text-cyan-400 mr-1 text-sm">🏃‍♂️</span>
                        <span className="text-cyan-400 font-mono font-black text-xs">{speedMs}</span>
                    </div>
                    {/* Level */}
                    <div className="flex items-center px-2 py-1 bg-[#0F172A]/60 border border-yellow-900/30 rounded-lg backdrop-blur-sm pointer-events-none">
                        <span className="text-yellow-400 mr-1 text-sm">🏁</span>
                        <span className="text-yellow-400 font-mono font-black text-xs">{level}</span>
                    </div>
                    {/* Settings button - opens settings/pause screen */}
                    <button
                        onClick={(e) => { e.currentTarget.blur(); pauseGame(); }}
                        tabIndex={-1}
                        className="pointer-events-auto opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center bg-[#0F172A]/60 border border-yellow-900/30 rounded-lg backdrop-blur-sm px-3 py-3 mt-1"
                    >
                        <span className="text-2xl">⚙️</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Re-export for backwards compatibility
export { BetControl, DifficultySelector };

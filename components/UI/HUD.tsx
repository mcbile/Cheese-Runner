
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Volume2, VolumeX, Pause } from 'lucide-react';
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
    PausedScreen,
    LevelCompleteScreen,
    GameOverScreen,
    VictoryScreen,
    ActiveEffectsDisplay,
    TouchZoneHints,
    TouchFPSCounter
} from './GameOverlays';

const LEVEL_PRELOAD_TIME = 3; // 3 seconds for level preloader

interface HUDProps {
    onStartRun?: () => void;
    hideMenu?: boolean;
}

export const HUD: React.FC<HUDProps> = ({ onStartRun, hideMenu }) => {
    // Use shallow comparison to prevent unnecessary re-renders
    // Split into logical groups for better granularity
    const { status, level, isMuted } = useStore(
        useShallow(state => ({
            status: state.status,
            level: state.level,
            isMuted: state.isMuted
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
    const openInventory = useStore(state => state.openInventory);
    const closeInventory = useStore(state => state.closeInventory);
    const startLevelFromPreload = useStore(state => state.startLevelFromPreload);

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

    // Double-tap ArrowDown to open inventory (max 1.5s between taps)
    const lastArrowDownRef = useRef<number>(0);
    const DOUBLE_TAP_THRESHOLD = 1500; // 1.5 seconds

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // D key handled globally in App.tsx
            if (e.key === 'm' || e.key === 'M') toggleMute();
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                if (status === GameStatus.PLAYING || status === GameStatus.COUNTDOWN) pauseGame();
                else if (status === GameStatus.PAUSED) resumeGame();
            }
            if (e.key === 'ArrowDown') {
                if (status === GameStatus.INVENTORY) {
                    // Single tap closes inventory
                    closeInventory();
                } else if (status === GameStatus.PLAYING) {
                    // Double-tap opens inventory
                    const now = Date.now();
                    if (now - lastArrowDownRef.current < DOUBLE_TAP_THRESHOLD) {
                        openInventory();
                        lastArrowDownRef.current = 0; // Reset
                    } else {
                        lastArrowDownRef.current = now;
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, pauseGame, resumeGame, toggleMute, openInventory, closeInventory]);

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
            {status === GameStatus.PAUSED && <PausedScreen />}
            {status === GameStatus.LEVEL_COMPLETE && <LevelCompleteScreen />}
            {status === GameStatus.MENU && !hideMenu && <MenuScreen onStartRun={onStartRun} />}
            {status === GameStatus.GAME_OVER && <GameOverScreen />}
            {status === GameStatus.VICTORY && <VictoryScreen />}

            {/* Touch Zone Hints - показываем только на мобильных */}
            <TouchZoneHints />

            {/* FPS Counter для мобильных устройств */}
            <TouchFPSCounter />

            {/* TOP BAR */}
            <div className="flex flex-col w-full gap-2 pointer-events-auto">
                <div className="flex justify-between items-start w-full">
                    {/* LEFT: Fever Timer + Mute (mute 30% below fever) */}
                    <div className="flex flex-col items-start">
                        <FeverTimer />
                        {/* Mute button - 30% screen height below fever timer */}
                        <button onClick={(e) => { e.currentTarget.blur(); toggleMute(); }} tabIndex={-1} className="opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center bg-blue-900/50 rounded-lg min-w-[44px] min-h-[44px] md:min-w-[48px] md:min-h-[48px] border border-white/10 mt-[30vh]">
                            {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                        </button>
                    </div>

                    {/* RIGHT: Pause (30% below top) */}
                    <div className="flex flex-col items-end">
                        {/* Pause button - 30% screen height below top */}
                        <button onClick={(e) => { e.currentTarget.blur(); pauseGame(); }} tabIndex={-1} className="opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center bg-blue-900/50 rounded-lg min-w-[44px] min-h-[44px] md:min-w-[48px] md:min-h-[48px] border border-white/10 mt-[30vh]">
                            <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* CENTER: KAASINO Logo with letter highlighting - no background */}
            <div className={`absolute ${isLandscape ? 'top-2' : 'top-6'} left-1/2 -translate-x-1/2 pointer-events-auto`}>
                <div className={`relative ${isLandscape ? 'w-[150px] h-[45px]' : 'w-[200px] h-[60px]'} md:w-[240px] md:h-[70px]`}>
                    {/* Base dimmed logo */}
                    <img
                        src="/kaasino_logo_full.png"
                        alt="KAASINO"
                        className="absolute inset-0 w-full h-full object-contain opacity-30 brightness-50"
                    />
                    {/* Individual letter overlays - bright with glow when collected */}
                    {/* Letter positions adjusted for KAASINO logo proportions */}
                    {[
                        { start: 0, end: 13 },      // K - wider
                        { start: 13, end: 27 },     // A - wider
                        { start: 27, end: 41 },     // A - wider
                        { start: 41, end: 55 },     // S - medium
                        { start: 55, end: 63 },     // I - narrow
                        { start: 63, end: 80 },     // N - wider
                        { start: 80, end: 100 },    // O - wider
                    ].map((pos, idx) => {
                        const isCollected = collectedLetters.includes(idx);
                        if (!isCollected) return null;
                        return (
                            <img
                                key={idx}
                                src="/kaasino_logo_full.png"
                                alt=""
                                className="absolute inset-0 w-full h-full object-contain"
                                style={{
                                    clipPath: `inset(0 ${100 - pos.end}% 0 ${pos.start}%)`,
                                    filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.6)) drop-shadow(0 0 1px rgba(255,215,0,0.4))',
                                }}
                            />
                        );
                    })}
                </div>
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

                {/* RIGHT: Level, Speed, Active Effects + Bag button */}
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
                    {/* Bag button - height x2 of info block */}
                    <button
                        onClick={(e) => { e.currentTarget.blur(); openInventory(); }}
                        tabIndex={-1}
                        className="pointer-events-auto opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center bg-[#0F172A]/60 border border-amber-900/30 rounded-lg backdrop-blur-sm px-3 py-3 mt-1"
                    >
                        <span className="text-2xl">💼</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Re-export for backwards compatibility
export { BetControl, DifficultySelector };

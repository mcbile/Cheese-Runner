/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SettingsScreen - экран настроек вместо паузы
 * Золотая тема, 2x2 карточки с тумблерами, кнопки Restart/Home/Resume
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { RotateCcw, Home, Play, AlertTriangle, Settings, Briefcase, Heart } from 'lucide-react';
import { useStore } from '../../../store';
import { audio } from '../../System/Audio';
import { RAW_SHOP_ITEMS } from '../shopData';

const USE_COOLDOWN_MS = 330;

/**
 * Toggle Switch компонент с эмодзи
 * @param colorScheme - 'blue' для синего (NL футбол), 'orange' для оранжевого (NL футбол)
 */
interface ToggleSwitchProps {
    isOn: boolean;
    onToggle: () => void;
    leftEmoji: string;
    rightEmoji: string;
    leftLabel: string;
    rightLabel: string;
    colorScheme: 'blue' | 'orange';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, leftEmoji, rightEmoji, leftLabel, rightLabel, colorScheme }) => {
    // NL Football colors: Blue #21468B, Orange #FF6B00
    const colors = colorScheme === 'blue'
        ? {
            border: 'border-[#21468B]/60',
            activeText: 'text-[#21468B]',
            gradient: 'from-[#21468B] to-[#2B5BA7]',
            inactiveText: 'text-gray-500'
        }
        : {
            border: 'border-[#FF6B00]/60',
            activeText: 'text-[#FF6B00]',
            gradient: 'from-[#FF6B00] to-[#FF8C00]',
            inactiveText: 'text-gray-500'
        };

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            {/* Labels row */}
            <div className="flex items-center justify-between w-full px-1">
                <span className={`text-xs font-bold transition-colors ${!isOn ? colors.activeText : colors.inactiveText}`}>
                    {leftLabel}
                </span>
                <span className={`text-xs font-bold transition-colors ${isOn ? colors.activeText : colors.inactiveText}`}>
                    {rightLabel}
                </span>
            </div>
            {/* Toggle button */}
            <button
                onClick={onToggle}
                className={`relative w-full h-12 bg-[#1a1a2e] rounded-full border-2 ${colors.border} overflow-hidden transition-all active:scale-95`}
            >
                {/* Background emojis */}
                <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className={`text-2xl transition-opacity ${!isOn ? 'opacity-100' : 'opacity-30'}`}>{leftEmoji}</span>
                    <span className={`text-2xl transition-opacity ${isOn ? 'opacity-100' : 'opacity-30'}`}>{rightEmoji}</span>
                </div>
                {/* Sliding indicator */}
                <div
                    className={`absolute top-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-gradient-to-r ${colors.gradient} rounded-full shadow-lg transition-all duration-300 ${
                        isOn ? 'left-[calc(50%+2px)]' : 'left-1'
                    }`}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">{isOn ? rightEmoji : leftEmoji}</span>
                    </div>
                </div>
            </button>
        </div>
    );
};

/**
 * Карточка настройки
 */
interface SettingCardProps {
    title: string;
    children: React.ReactNode;
    isPlaceholder?: boolean;
    colorScheme?: 'gold' | 'blue' | 'orange';
}

const SettingCard: React.FC<SettingCardProps> = ({ title, children, isPlaceholder, colorScheme = 'gold' }) => {
    const borderColor = isPlaceholder
        ? 'border-gray-600/30'
        : colorScheme === 'blue'
            ? 'border-[#21468B]/50'
            : colorScheme === 'orange'
                ? 'border-[#FF6B00]/50'
                : 'border-yellow-500/40';

    const titleColor = isPlaceholder
        ? 'text-gray-500'
        : colorScheme === 'blue'
            ? 'text-[#5B8AD8]'
            : colorScheme === 'orange'
                ? 'text-[#FF8C00]'
                : 'text-yellow-400';

    return (
        <div className={`bg-white/5 rounded-xl border ${borderColor} p-3 flex flex-col`}>
            <h3 className={`text-sm font-black uppercase tracking-wider mb-2 text-center ${titleColor}`}>
                {title}
            </h3>
            {children}
        </div>
    );
};

/**
 * Модальное окно подтверждения
 */
interface ConfirmModalProps {
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="absolute inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[90%] max-w-sm bg-[#0F172A] rounded-2xl border-4 border-white shadow-[0_0_30px_rgba(174,28,40,0.5)] p-5 flex flex-col items-center">
                {/* Warning icon */}
                <div className="w-16 h-16 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-9 h-9 text-red-400" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-red-400 uppercase tracking-wider mb-2">
                    {title}
                </h2>

                {/* Warning text */}
                <div className="text-center text-gray-300 text-sm mb-4 leading-relaxed">
                    {message}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#21468B] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
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

/**
 * Bag Overlay - показывается поверх Settings
 */
interface BagOverlayProps {
    onClose: () => void;
    onPlay: () => void;
}

const BagOverlay: React.FC<BagOverlayProps> = ({ onClose, onPlay }) => {
    const { inventory, consumeItem, lives, maxLives, isSlowMotionActive, isCheeseFeverActive } = useStore();
    const isEmpty = Object.keys(inventory).length === 0;
    const lastUseTimeRef = useRef<number>(0);

    // Check if an item is disabled
    const isItemDisabled = useMemo(() => (id: string): boolean => {
        if (id === 'FULL_HEAL' && lives >= maxLives) return true;
        if (id === 'SLOW_MOTION' && isSlowMotionActive) return true;
        if (id === 'CHEESE_FEVER' && isCheeseFeverActive) return true;
        return false;
    }, [lives, maxLives, isSlowMotionActive, isCheeseFeverActive]);

    /** Use item with cooldown protection */
    const handleUseItem = useCallback((id: string) => {
        const now = Date.now();
        if (now - lastUseTimeRef.current < USE_COOLDOWN_MS) {
            return;
        }
        lastUseTimeRef.current = now;
        consumeItem(id);
    }, [consumeItem]);

    return (
        <div className="absolute inset-0 z-[130] flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-4 px-5 overflow-hidden">
                {/* Header */}
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0">
                    <span className="text-emerald-400">BACK</span> <span className="text-white">PACK</span>
                </h1>

                {/* Lives indicator */}
                <div className="flex gap-3 text-center mb-3 w-full shrink-0">
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-red-500/50 shadow-inner flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                            <span className="text-[30px] font-black text-red-400 drop-shadow-sm">{lives}/{maxLives}</span>
                        </div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">Lives</div>
                    </div>
                </div>

                {/* Items list */}
                <div className="w-full rounded-xl border border-white/10 p-3 mb-4 bg-black/40 flex-1 overflow-y-auto min-h-0">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <Briefcase className="w-12 h-12 text-gray-600 mb-2" />
                            <div className="text-gray-400 font-mono text-sm">Your backpack is empty.<br/>Visit the Shop to buy items!</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(inventory).map(([id, count]) => {
                                const itemDef = RAW_SHOP_ITEMS.find(i => i.id === id);
                                if (!itemDef) return null;
                                const Icon = itemDef.icon;
                                const disabled = isItemDisabled(id);
                                return (
                                    <div key={id} className={`bg-white/10 rounded-xl p-3 flex flex-col items-center border border-white/5 ${disabled ? 'opacity-50' : ''}`}>
                                        <div className="bg-black/40 p-2 rounded-lg text-white border border-white/5 mb-2">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="font-bold text-white text-sm text-center leading-tight mb-1">{itemDef.name}</div>
                                        <div className="text-xs text-emerald-400 font-mono font-bold mb-2">x{count}</div>
                                        <button
                                            onClick={() => !disabled && handleUseItem(id)}
                                            disabled={disabled}
                                            className={`w-full py-2 font-bold rounded-lg text-xs tracking-wider shadow-lg transition-all ${
                                                disabled
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-500 text-white active:scale-95'
                                            }`}
                                        >
                                            {disabled ? (id === 'FULL_HEAL' ? 'FULL' : 'ACTIVE') : 'USE'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Buttons: SETTINGS (blue) + PLAY (orange) */}
                <div className="flex gap-3 w-full shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-2 text-sm bg-[#21468B] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                    >
                        <Settings className="w-5 h-5" /> SETTINGS
                    </button>
                    <button
                        onClick={onPlay}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-2 text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                    >
                        <Play className="w-5 h-5 fill-current" /> PLAY
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SettingsScreen: React.FC = () => {
    const { resumeGame, restartLevel, quitToMenu, isMuted, toggleMute, isFirstPersonMode, toggleFirstPersonMode } = useStore();
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);
    const [showHomeConfirm, setShowHomeConfirm] = useState(false);
    const [showBag, setShowBag] = useState(false);

    // Handlers for camera toggle
    const handleCameraToggle = () => {
        toggleFirstPersonMode();
    };

    // Handlers for sound toggle
    const handleSoundToggle = () => {
        toggleMute();
        // Audio sync handled by useAudioSync hook
    };

    // Restart handlers
    const handleRestartClick = () => {
        setShowRestartConfirm(true);
    };

    const handleRestartConfirm = () => {
        setShowRestartConfirm(false);
        resumeGame();
        restartLevel();
    };

    const handleRestartCancel = () => {
        setShowRestartConfirm(false);
    };

    // Home handlers
    const handleHomeClick = () => {
        setShowHomeConfirm(true);
    };

    const handleHomeConfirm = () => {
        setShowHomeConfirm(false);
        quitToMenu();
    };

    const handleHomeCancel = () => {
        setShowHomeConfirm(false);
    };

    // Bag handlers
    const handleBagOpen = () => {
        setShowBag(true);
    };

    const handleBagClose = () => {
        setShowBag(false);
    };

    const handleBagPlay = () => {
        setShowBag(false);
        resumeGame();
    };

    return (
        <div className="absolute inset-0 bg-black/25 z-[100] flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 pointer-events-auto">
            <div className="relative w-full max-w-md max-h-full min-h-[340px] bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(255,193,7,0.3)] border-4 border-white flex flex-col overflow-hidden">

                {/* Header - золотой стиль */}
                <div className="px-4 py-4 border-b border-white/10 bg-black/20 flex items-center justify-center shrink-0">
                    <h1 className="text-2xl font-black text-yellow-400 font-cyber tracking-widest uppercase">SETTINGS</h1>
                </div>

                {/* Content - 2x2 Grid */}
                <div className="flex-1 p-4 overflow-y-auto min-h-0">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Row 1: Camera (blue) + Sound (orange) */}

                        {/* Camera Toggle - NL Blue */}
                        <SettingCard title="CAMERA" colorScheme="blue">
                            <ToggleSwitch
                                isOn={isFirstPersonMode}
                                onToggle={handleCameraToggle}
                                leftEmoji="🐁"
                                rightEmoji="🐭"
                                leftLabel="3RD"
                                rightLabel="FPS"
                                colorScheme="blue"
                            />
                        </SettingCard>

                        {/* Sound Toggle - NL Orange */}
                        <SettingCard title="SOUND" colorScheme="orange">
                            <ToggleSwitch
                                isOn={!isMuted}
                                onToggle={handleSoundToggle}
                                leftEmoji="🔇"
                                rightEmoji="🔉"
                                leftLabel="OFF"
                                rightLabel="ON"
                                colorScheme="orange"
                            />
                        </SettingCard>

                        {/* Row 2: BAG + Placeholder */}

                        {/* BAG Card - clickable */}
                        <button
                            onClick={handleBagOpen}
                            className="bg-white/5 rounded-xl border border-emerald-500/40 p-3 flex flex-col items-center hover:bg-white/10 transition-colors active:scale-95"
                        >
                            <h3 className="text-sm font-black uppercase tracking-wider mb-2 text-center text-emerald-400">
                                BAG
                            </h3>
                            <div className="flex-1 flex items-center justify-center min-h-[60px]">
                                <span className="text-4xl">💼</span>
                            </div>
                        </button>

                        {/* Placeholder */}
                        <SettingCard title="COMING SOON" isPlaceholder>
                            <div className="flex-1 flex items-center justify-center min-h-[60px]">
                                <span className="text-4xl opacity-30">⚙️</span>
                            </div>
                        </SettingCard>
                    </div>
                </div>

                {/* Navigation buttons - Restart / Home / Resume (как в Shop) */}
                <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-black/20 shrink-0">
                    <button
                        onClick={handleRestartClick}
                        className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#21468B] text-white border-white hover:bg-[#2a5ab0] active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" /> RESTART
                    </button>
                    <button
                        onClick={handleHomeClick}
                        className="w-12 shrink-0 py-2.5 rounded-xl bg-white text-[#21468B] font-black border-2 border-[#21468B] hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
                        title="Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <button
                        onClick={resumeGame}
                        className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                    >
                        RESUME <Play className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Bag Overlay - shows on top of settings */}
            {showBag && (
                <BagOverlay
                    onClose={handleBagClose}
                    onPlay={handleBagPlay}
                />
            )}

            {/* Restart confirmation modal */}
            {showRestartConfirm && (
                <ConfirmModal
                    title="RESTART LEVEL?"
                    message={
                        <>
                            Your level progress will be <span className="text-red-400 font-bold">LOST</span>!
                            <br />
                            Score and inventory will be kept.
                        </>
                    }
                    onConfirm={handleRestartConfirm}
                    onCancel={handleRestartCancel}
                />
            )}

            {/* Home confirmation modal */}
            {showHomeConfirm && (
                <ConfirmModal
                    title="EXIT GAME?"
                    message={
                        <>
                            All your progress will be <span className="text-red-400 font-bold">LOST</span>!
                            <br />
                            Cheese points, earnings, and level progress will not be saved.
                        </>
                    }
                    onConfirm={handleHomeConfirm}
                    onCancel={handleHomeCancel}
                />
            )}
        </div>
    );
};

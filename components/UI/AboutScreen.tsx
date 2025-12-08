
import React, { useState } from 'react';
import {
    Trophy, ShoppingCart, Home, ChevronLeft, ChevronRight, Gamepad2, Skull, AlertTriangle, Zap, DollarSign
} from 'lucide-react';
import { useStore } from '../../store';

// Tutorial page definitions - order: Mission, Controls, Enemies, Boss, Power-Ups, Shop
const TUTORIAL_PAGES = [
    'mission',
    'controls',
    'enemies',
    'boss',
    'powerups',
    'shop'
] as const;

type TutorialPage = typeof TUTORIAL_PAGES[number];

const PAGE_TITLES: Record<TutorialPage, { icon: React.ReactNode; title: string; color: string; bgColor: string }> = {
    mission: { icon: <Trophy className="w-6 h-6" />, title: 'MISSION', color: 'text-emerald-400', bgColor: 'bg-emerald-400' },
    controls: { icon: <Gamepad2 className="w-6 h-6" />, title: 'CONTROLS', color: 'text-cyan-400', bgColor: 'bg-cyan-400' },
    enemies: { icon: <Skull className="w-6 h-6" />, title: 'ENEMIES', color: 'text-red-400', bgColor: 'bg-red-400' },
    boss: { icon: <AlertTriangle className="w-6 h-6" />, title: 'BOSS', color: 'text-orange-400', bgColor: 'bg-orange-400' },
    powerups: { icon: <Zap className="w-6 h-6" />, title: 'POWER-UPS', color: 'text-purple-400', bgColor: 'bg-purple-400' },
    shop: { icon: <ShoppingCart className="w-6 h-6" />, title: 'CHEESE SHOP', color: 'text-yellow-400', bgColor: 'bg-yellow-400' },
};

// Page 1: Mission
const MissionPage: React.FC = () => (
    <div className="flex flex-col gap-1.5 h-full">
        {/* Logo - centered between header and banner */}
        <div className="flex justify-center items-center py-2">
            <img
                src="/kaasino_logo_full.png"
                alt="KAASINO"
                className="w-36 h-auto object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"
            />
        </div>

        {/* Main objective banner - emerald theme, white text */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-green-800/40 rounded-lg p-2 border-2 border-emerald-500/60 text-center">
            <span className="text-lg font-black text-white">🎯 Collect 7 Letters</span>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-1.5">
            {/* Shoot */}
            <div className="bg-white/5 rounded-lg border border-green-500/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-4xl">💰</span>
                <span className="font-black text-green-400 text-base">SHOOT</span>
                <span className="text-sm text-gray-300">Hit enemies</span>
                <span className="text-xs text-green-400 font-bold">WIN MONEY</span>
            </div>

            {/* Cheese */}
            <div className="bg-white/5 rounded-lg border border-yellow-500/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-4xl">🧀</span>
                <span className="font-black text-yellow-400 text-base">CHEESE</span>
                <span className="text-sm text-gray-300">Buy upgrades</span>
                <span className="text-xs text-yellow-400 font-bold">+100 pts (MED)</span>
            </div>

            {/* Levels */}
            <div className="bg-white/5 rounded-lg border border-blue-500/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-4xl">📈</span>
                <span className="font-black text-blue-400 text-base">LEVELS</span>
                <span className="text-sm text-gray-300">3→4→5 lanes</span>
                <span className="text-xs text-gray-400">Speed increases</span>
            </div>

            {/* Lives */}
            <div className="bg-white/5 rounded-lg border border-red-500/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-4xl">❤️</span>
                <span className="font-black text-red-400 text-base">LIVES</span>
                <span className="text-sm text-gray-300">Start with 5</span>
                <span className="text-xs text-red-400 font-bold">0 = GAME OVER</span>
            </div>
        </div>
    </div>
);

// Page 2: Enemies
const EnemiesPage: React.FC = () => (
    <div className="flex flex-col gap-1.5 h-full">
        {/* Combat Economy - Prominent Banner - red theme */}
        <div className="bg-gradient-to-r from-red-900/50 to-rose-800/40 rounded-lg p-2 border-2 border-red-500/60">
            <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5 text-red-400" />
                <span className="text-base font-black text-red-400 uppercase">SHOOT = MONEY</span>
            </div>
        </div>

        {/* 2x2 Grid of Enemies */}
        <div className="grid grid-cols-2 gap-1.5 flex-1">
            {/* Mousetrap */}
            <div className="bg-white/5 rounded-lg border border-amber-600/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">🪤</span>
                <span className="font-black text-amber-400 text-lg">TRAP</span>
                <span className="text-xs text-gray-400">Jump or shoot</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-400 font-mono text-sm font-bold">1 HP</span>
                    <span className="text-green-400 font-mono text-sm font-black">+1x BET</span>
                </div>
            </div>

            {/* Snake */}
            <div className="bg-white/5 rounded-lg border border-green-500/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">🐍</span>
                <span className="font-black text-green-400 text-lg">SNAKE</span>
                <span className="text-xs text-gray-400">Changes lanes</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-400 font-mono text-sm font-bold">1 HP</span>
                    <span className="text-green-400 font-mono text-sm font-black">+2x BET</span>
                </div>
            </div>

            {/* Cat */}
            <div className="bg-white/5 rounded-lg border border-purple-400/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">😾</span>
                <span className="font-black text-purple-400 text-lg">CAT</span>
                <span className="text-xs text-gray-400">Hunts you!</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-400 font-mono text-sm font-bold">2 HP</span>
                    <span className="text-green-400 font-mono text-sm font-black">+3x BET</span>
                </div>
            </div>

            {/* Owl */}
            <div className="bg-white/5 rounded-lg border border-amber-500/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">🦉</span>
                <span className="font-black text-amber-500 text-lg">OWL</span>
                <span className="text-xs text-gray-400">Triple attack!</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-400 font-mono text-sm font-bold">3 HP</span>
                    <span className="text-green-400 font-mono text-sm font-black">+5x BET</span>
                </div>
            </div>
        </div>
    </div>
);

// Page 3: Boss
const BossPage: React.FC = () => (
    <div className="flex flex-col gap-1.5 h-full">
        {/* 2 blocks side by side */}
        <div className="grid grid-cols-2 gap-1.5">
            {/* Boss - main info */}
            <div className="bg-gradient-to-br from-red-900/40 to-purple-900/30 rounded-lg border-2 border-red-500/50 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">👨🏻‍🔬</span>
                <span className="font-black text-red-400 text-lg">SCIENTIST</span>
                <span className="text-sm text-gray-300">Rams into you!</span>
                <div className="bg-red-900/40 rounded px-2 py-0.5 mt-1">
                    <span className="text-sm text-red-300 font-mono font-bold">HP: 20+</span>
                </div>
            </div>

            {/* Attack */}
            <div className="bg-white/5 rounded-lg border border-cyan-500/40 p-1.5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">💉</span>
                <span className="font-black text-cyan-400 text-lg">SYRINGES</span>
                <span className="text-sm text-gray-300">Dodge or shoot!</span>
                <span className="text-green-400 font-mono text-base font-black mt-1">+1x BET</span>
            </div>
        </div>

        {/* How to fight - steps inside a block - orange theme */}
        <div className="bg-gradient-to-r from-orange-900/30 to-amber-900/20 rounded-lg p-2 border border-orange-500/40">
            <h4 className="text-orange-400 font-bold text-base mb-1 text-center">HOW TO FIGHT</h4>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black font-black text-xs flex items-center justify-center shrink-0">1</span>
                    <span className="text-sm text-gray-200">Collect 7 letters → Boss!</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black font-black text-xs flex items-center justify-center shrink-0">2</span>
                    <span className="text-sm text-gray-200">Each level <span className="text-red-400 font-bold">+10 HP</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black font-black text-xs flex items-center justify-center shrink-0">3</span>
                    <span className="text-sm text-gray-200">Rams up to <span className="text-red-400 font-bold">3 lanes</span>!</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black font-black text-xs flex items-center justify-center shrink-0">4</span>
                    <span className="text-sm text-gray-200">Shoot boss, dodge syringes</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black font-black text-xs flex items-center justify-center shrink-0">5</span>
                    <span className="text-sm text-gray-200">Win → <span className="text-green-400 font-bold">120% HP × BET</span></span>
                </div>
            </div>
        </div>
    </div>
);

// Page 4: Power-ups
const PowerupsPage: React.FC = () => (
    <div className="flex flex-col gap-1.5 h-full">
        {/* Main banner - purple theme */}
        <div className="bg-gradient-to-r from-purple-900/50 to-violet-800/40 rounded-lg p-2 border-2 border-purple-500/60 text-center">
            <span className="text-lg font-black text-white">🎁 Collect on the Road!</span>
        </div>

        {/* 2x2 Grid like Mission */}
        <div className="grid grid-cols-2 gap-1.5">
            {/* Slow Motion */}
            <div className="bg-white/5 rounded-lg border border-green-500/40 px-1.5 py-2 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">⏳</span>
                <span className="font-black text-green-400 text-lg">SLOW</span>
                <span className="text-base text-gray-300">-50% speed</span>
                <span className="text-sm text-green-400 font-bold">5 sec</span>
            </div>

            {/* Speed Boost */}
            <div className="bg-white/5 rounded-lg border border-amber-500/40 px-1.5 py-2 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">🌪</span>
                <span className="font-black text-amber-400 text-lg">SPEED</span>
                <span className="text-base text-gray-300">+50% speed</span>
                <span className="text-sm text-amber-400 font-bold">5 sec (risky!)</span>
            </div>

            {/* Firewall */}
            <div className="bg-white/5 rounded-lg border border-orange-500/40 px-1.5 py-2 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">🔥</span>
                <span className="font-black text-orange-400 text-lg">FIREWALL</span>
                <span className="text-base text-gray-300">2 projectiles</span>
                <span className="text-sm text-orange-400 font-bold">10 sec</span>
            </div>

            {/* Heart */}
            <div className="bg-white/5 rounded-lg border border-green-500/40 px-1.5 py-2 flex flex-col items-center justify-center text-center">
                <span className="text-5xl">💊</span>
                <span className="font-black text-green-400 text-lg">HEART</span>
                <span className="text-base text-gray-300">+1 Life</span>
                <span className="text-sm text-green-400 font-bold">Only at 1 life</span>
            </div>
        </div>
    </div>
);

// Page 5: Shop
const ShopPage: React.FC = () => (
    <div className="flex flex-col gap-1.5 h-full">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-yellow-900/40 to-amber-800/30 rounded-lg p-2 border-2 border-yellow-500/50 text-center">
            <span className="text-base font-black text-yellow-400">🛒 SHOP • After each level!</span>
        </div>

        {/* Row 1: HEAL POTION (1000 pts) + EXTRA HEART (10x BET) */}
        <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded-lg border border-red-500/40 px-2 py-3 flex items-center gap-2">
                <span className="text-3xl">💊</span>
                <div className="flex flex-col">
                    <span className="font-black text-red-400 text-sm">HEAL POTION</span>
                    <span className="text-[10px] text-gray-400">+1 ❤️</span>
                    <span className="text-yellow-400 font-mono text-xs font-bold">1000 pts</span>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-pink-500/40 px-2 py-3 flex items-center gap-2">
                <span className="text-3xl">❤️</span>
                <div className="flex flex-col">
                    <span className="font-black text-pink-400 text-sm">EXTRA HEART</span>
                    <span className="text-[10px] text-gray-400">Max +1</span>
                    <span className="text-green-400 font-mono text-xs font-bold">10x BET</span>
                </div>
            </div>
        </div>

        {/* Row 2: TIME WARP (2000 pts) + CHEESE MAGIC (20x BET) */}
        <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded-lg border border-blue-500/40 px-2 py-3 flex items-center gap-2">
                <span className="text-3xl">⌛️</span>
                <div className="flex flex-col">
                    <span className="font-black text-blue-400 text-sm">TIME WARP</span>
                    <span className="text-[10px] text-gray-400">Slow 15s</span>
                    <span className="text-yellow-400 font-mono text-xs font-bold">2000 pts</span>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-orange-500/40 px-2 py-3 flex items-center gap-2">
                <span className="text-3xl">🪄</span>
                <div className="flex flex-col">
                    <span className="font-black text-orange-400 text-sm">CHEESE MAGIC</span>
                    <span className="text-[10px] text-gray-400">Enemies = 🧀 20s</span>
                    <span className="text-green-400 font-mono text-xs font-bold">20x BET</span>
                </div>
            </div>
        </div>

        {/* Row 3: ENEMY RUSH (3000 pts) + MORE CHEESE (30x BET) */}
        <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded-lg border border-purple-500/40 px-2 py-3 flex items-center gap-2">
                <span className="text-3xl">⚡️</span>
                <div className="flex flex-col">
                    <span className="font-black text-purple-400 text-sm">ENEMY RUSH</span>
                    <span className="text-[10px] text-gray-400">🐍😾🦉 spawn!</span>
                    <span className="text-yellow-400 font-mono text-xs font-bold">3000 pts</span>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-yellow-500/40 px-2 py-3 flex items-center gap-2">
                <span className="text-3xl">🏦</span>
                <div className="flex flex-col">
                    <span className="font-black text-yellow-400 text-sm">MORE CHEESE</span>
                    <span className="text-[10px] text-gray-400">+5000 pts</span>
                    <span className="text-green-400 font-mono text-xs font-bold">30x BET</span>
                </div>
            </div>
        </div>
    </div>
);

// Page 6: Controls - Swipe gestures + keyboard
const ControlsPage: React.FC = () => (
    <div className="flex flex-col gap-1.5 h-full">
        {/* Smartphone / Touch banner */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-1.5 border border-cyan-500/50 text-center">
            <span className="text-sm font-black text-cyan-400 uppercase tracking-wider">📱 Mobile / Touch</span>
        </div>

        {/* Touch controls - 2x2 grid */}
        <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded-lg border border-red-500/40 p-2 flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                <div>
                    <span className="text-sm font-black text-red-400">TAP</span>
                    <div className="text-xs text-gray-300">Shoot</div>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-cyan-500/40 p-2 flex items-center gap-2">
                <span className="text-2xl">👈 👉</span>
                <div>
                    <span className="text-sm font-black text-cyan-400">SWIPE L/R</span>
                    <div className="text-xs text-gray-300">Move</div>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-green-500/40 p-2 flex items-center gap-2">
                <span className="text-3xl">👆</span>
                <div>
                    <span className="text-sm font-black text-green-400">SWIPE UP</span>
                    <div className="text-xs text-gray-300">Jump</div>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-amber-500/40 p-2 flex items-center gap-2">
                <span className="text-3xl">💼</span>
                <div>
                    <span className="text-sm font-black text-amber-400">BAG BTN</span>
                    <div className="text-xs text-gray-300">Inventory</div>
                </div>
            </div>
        </div>

        {/* Desktop / Keyboard banner */}
        <div className="mt-1 bg-gradient-to-r from-purple-900/50 to-violet-800/40 rounded-lg p-1.5 border border-purple-500/50 text-center">
            <span className="text-sm font-black text-purple-400 uppercase tracking-wider">🖥️ Desktop / Keyboard</span>
        </div>

        {/* Keyboard controls - row 1 (3 cards) */}
        <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                <span className="text-base font-black text-cyan-400">←→</span>
                <div className="text-xs font-bold text-white">Move</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                <span className="text-base font-black text-cyan-400">↑</span>
                <div className="text-xs font-bold text-white">Jump</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                <span className="text-base font-black text-cyan-400">SPACE</span>
                <div className="text-xs font-bold text-white">Shoot</div>
            </div>
        </div>

        {/* Keyboard controls - row 2 (3 cards) */}
        <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                <span className="text-base font-black text-cyan-400">2×↓</span>
                <div className="text-xs font-bold text-white">💼 Bag</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                <span className="text-base font-black text-cyan-400">ESC</span>
                <div className="text-xs font-bold text-white">⏸️ Pause</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                <span className="text-base font-black text-cyan-400">M</span>
                <div className="text-xs font-bold text-white">🔇 Mute</div>
            </div>
        </div>
    </div>
);

// Page renderer
const renderPage = (page: TutorialPage): React.ReactNode => {
    switch (page) {
        case 'mission': return <MissionPage />;
        case 'enemies': return <EnemiesPage />;
        case 'boss': return <BossPage />;
        case 'powerups': return <PowerupsPage />;
        case 'shop': return <ShopPage />;
        case 'controls': return <ControlsPage />;
    }
};

export const AboutScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [currentPage, setCurrentPage] = useState<number>(0);

    const page = TUTORIAL_PAGES[currentPage];
    const { icon, title, color } = PAGE_TITLES[page];
    const isFirst = currentPage === 0;
    const isLast = currentPage === TUTORIAL_PAGES.length - 1;

    const goNext = () => {
        if (!isLast) setCurrentPage(p => p + 1);
    };

    const goBack = () => {
        if (!isFirst) setCurrentPage(p => p - 1);
    };

    return (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-[120] flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 text-white pointer-events-auto">
            <div className="relative w-full max-w-md max-h-full min-h-[340px] bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col overflow-hidden">

                {/* Header with page indicator */}
                <div className="px-4 py-5 border-b border-white/10 bg-black/20 flex items-center justify-between shrink-0">
                    <div className={`flex items-center gap-2 ${color}`}>
                        {icon}
                        <h2 className="text-lg font-black font-cyber tracking-wider uppercase">{title}</h2>
                    </div>
                    {/* Page indicator dots - color matches current page title */}
                    <div className="flex gap-1.5">
                        {TUTORIAL_PAGES.map((p, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPage(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentPage
                                        ? `${PAGE_TITLES[p].bgColor} w-5`
                                        : 'bg-white/30 hover:bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content - flex-1 to fill available space */}
                <div className="p-4 flex-1">
                    {renderPage(page)}
                </div>

                {/* Navigation buttons - changes based on page position */}
                <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-black/20 shrink-0">
                    {isFirst ? (
                        /* First page: MENU (blue) + NEXT (red) */
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#21468B] text-white border-white hover:bg-[#2a5ab0] active:scale-95"
                            >
                                <ChevronLeft className="w-4 h-4" /> MENU
                            </button>
                            <button
                                onClick={goNext}
                                className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#AE1C28] text-white border-white hover:bg-[#D32F2F] active:scale-95"
                            >
                                NEXT <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    ) : isLast ? (
                        /* Last page: BACK (blue) + DONE (orange) - Dutch colors */
                        <>
                            <button
                                onClick={goBack}
                                className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#1E4785] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                            >
                                <ChevronLeft className="w-4 h-4" /> BACK
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                            >
                                DONE <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        /* Middle pages: BACK (blue) + Home (white) + NEXT (red) */
                        <>
                            <button
                                onClick={goBack}
                                className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#21468B] text-white border-white hover:bg-[#2a5ab0] active:scale-95"
                            >
                                <ChevronLeft className="w-4 h-4" /> BACK
                            </button>
                            <button
                                onClick={onClose}
                                className="w-12 shrink-0 py-2.5 rounded-xl bg-white text-[#21468B] font-black border-2 border-[#21468B] hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
                                title="Home"
                            >
                                <Home className="w-5 h-5" />
                            </button>
                            <button
                                onClick={goNext}
                                className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#AE1C28] text-white border-white hover:bg-[#D32F2F] active:scale-95"
                            >
                                NEXT <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

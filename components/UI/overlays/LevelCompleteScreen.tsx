/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LevelCompleteScreen - экран завершения уровня
 */

import React, { useState } from 'react';
import { Play, Home, ShoppingCart } from 'lucide-react';
import { useStore } from '../../../store';
import { ExitConfirmModal } from './ExitConfirmModal';
import { StatisticsCard } from './StatisticsCard';

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
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0">
                    <span className="text-yellow-400">LEVEL {level}</span> <span className="text-white">DONE</span>
                </h1>

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

                {/* Navigation buttons - Shop (Blue) / Home (White) / Run (Red) */}
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

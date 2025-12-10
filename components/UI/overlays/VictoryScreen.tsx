/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * VictoryScreen - экран победы
 */

import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { useStore } from '../../../store';
import { audio } from '../../System/Audio';
import { StatisticsCard } from './StatisticsCard';

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
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0">
                    <span className="text-yellow-400">YOU'VE</span> <span className="text-white">WON</span>
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

                <div className="flex gap-2 w-full shrink-0">
                    <button
                        onClick={handleMenuClick}
                        className="flex-1 py-3 text-sm rounded-xl bg-[#1E4785] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#2B5BA7] active:scale-95 transition-all"
                    >
                        MAIN MENU
                    </button>
                    <button
                        onClick={() => { audio.startMusic(); startAgainFromVictory(); }}
                        className="flex-1 py-3 text-sm rounded-xl bg-[#FF6B00] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#FF8C00] active:scale-95 transition-all"
                    >
                        START AGAIN
                    </button>
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

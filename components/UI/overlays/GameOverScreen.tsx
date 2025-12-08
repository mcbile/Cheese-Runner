/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GameOverScreen - экран проигрыша
 */

import React, { useEffect } from 'react';
import { useStore } from '../../../store';
import { audio } from '../../System/Audio';
import { mobileUtils } from '../../System/MobileUtils';
import { StatisticsCard } from './StatisticsCard';

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
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0">
                    <span className="text-yellow-400">GAME</span> <span className="text-white">OVER</span>
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
                        onClick={quitToMenu}
                        className="flex-1 py-3 text-sm rounded-xl bg-[#1E4785] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#2B5BA7] active:scale-95 transition-all"
                    >
                        MAIN MENU
                    </button>
                    <button
                        onClick={() => { audio.startMusic(); restartLevel(); }}
                        className="flex-1 py-3 text-sm rounded-xl bg-[#FF6B00] text-white font-black tracking-wider uppercase border-2 border-white shadow-lg hover:bg-[#FF8C00] active:scale-95 transition-all"
                    >
                        RESTART LVL {level}
                    </button>
                </div>
            </div>
        </div>
    );
};

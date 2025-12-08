/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * StatisticsCard - карточка статистики уровня
 */

import React from 'react';
import { useStore } from '../../../store';

interface StatisticsCardProps {
    variant?: 'default' | 'victory';
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ variant = 'default' }) => {
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
                {/* Row 2: Cat & Owl */}
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

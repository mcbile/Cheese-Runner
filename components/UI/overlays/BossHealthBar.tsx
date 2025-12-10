/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BossHealthBar - полоска здоровья босса
 */

import React from 'react';
import { useStore } from '../../../store';

export const BossHealthBar: React.FC = () => {
    const { isBossActive, bossHealth, bossMaxHealth } = useStore();

    if (!isBossActive) return null;

    const pct = Math.max(0, (bossHealth / bossMaxHealth) * 100);

    return (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-64 md:w-96 flex flex-col items-center animate-in fade-in zoom-in duration-500 z-40">
            <div className="w-full h-5 bg-black/60 border-2 border-red-900 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,0,0,0.5)] mb-1 relative">
                <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out"
                    style={{ width: `${pct}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {bossHealth}/{bossMaxHealth}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">👨🏻‍🔬</span>
                <span className="text-red-500 font-black font-cyber text-sm tracking-widest drop-shadow-md">
                    THE SCIENTIST
                </span>
            </div>
        </div>
    );
};

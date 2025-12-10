/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Economy Slice - Balance, betting, rewards
 */

import { StateCreator } from 'zustand';
import { DIFFICULTY_CONFIG } from '../../types';
import { GameStore, EconomySlice } from '../types';
import { INITIAL_STATS } from '../utils';

export const createEconomySlice: StateCreator<GameStore, [], [], EconomySlice> = (set, get) => ({
    balance: 100.00,
    betAmount: 1.00,
    levelStats: { ...INITIAL_STATS },

    setBetAmount: (amount) => {
        const clamped = Math.max(0.1, Math.min(50, amount));
        set({ betAmount: clamped });
    },

    attemptShoot: () => {
        const { balance, betAmount, levelStats } = get();
        if (balance >= betAmount) {
            set({
                balance: balance - betAmount,
                levelStats: { ...levelStats, shotsFired: levelStats.shotsFired + 1 }
            });
            return true;
        }
        return false;
    },

    applyReward: (multiplier) => {
        const { balance, betAmount } = get();
        const profit = betAmount * multiplier;
        set({ balance: balance + profit });
    },

    recordKill: (type, reward) => {
        const { levelStats } = get();
        const newStats = { ...levelStats };

        let multiplier = 0;
        if (type === 'TRAP') {
            multiplier = 1;
            newStats.trapsDestroyed++;
            newStats.trapsEarnings += reward;
        } else if (type === 'SNAKE') {
            multiplier = 2;
            newStats.snakesDestroyed++;
            newStats.snakesEarnings += reward;
        } else if (type === 'CAT') {
            multiplier = 3;
            newStats.catsDestroyed++;
            newStats.catsEarnings += reward;
        } else if (type === 'EAGLE') {
            multiplier = 5;
            newStats.eaglesDestroyed++;
            newStats.eaglesEarnings += reward;
        } else if (type === 'SYRINGE') {
            multiplier = 1;
            newStats.syringesDestroyed++;
            newStats.syringesEarnings += reward;
        }
        newStats.totalRewards += multiplier;
        set({ levelStats: newStats });
    },

    collectGem: (value) => {
        const { difficulty, levelStats } = get();
        const config = DIFFICULTY_CONFIG[difficulty];
        const points = Math.floor(value * config.scoreMultiplier);

        set((state) => ({
            score: state.score + points,
            gemsCollected: state.gemsCollected + 1,
            levelStats: {
                ...levelStats,
                cheeseCollected: levelStats.cheeseCollected + 1,
                cheesePoints: levelStats.cheesePoints + points
            }
        }));
    }
});

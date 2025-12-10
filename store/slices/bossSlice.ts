/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Boss Slice - Boss fight state and actions
 */

import { StateCreator } from 'zustand';
import { GameStore, BossSlice } from '../types';

export const createBossSlice: StateCreator<GameStore, [], [], BossSlice> = (set, get) => ({
    wordCompleted: false,
    bossDefeated: false,
    bossDying: false,
    bossDeathComplete: false,
    isBossActive: false,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossSpawnId: 0,
    bossChargePhase: 0,
    bossChargeLane: 0,
    bossChargeWidth: 1,

    setBossActive: (active, maxHp) => set({
        isBossActive: active,
        bossHealth: maxHp,
        bossMaxHealth: maxHp,
        bossChargePhase: 0,
        bossChargeLane: 0,
        bossChargeWidth: 1
    }),

    updateBossHealth: (hp) => set({ bossHealth: hp }),

    defeatBoss: () => {
        const { balance, bossMaxHealth, betAmount } = get();
        // Reward Formula: 100% HP + 20% HP = 120% of Boss HP * BetAmount
        const rewardMultiplier = Math.floor(bossMaxHealth * 1.2);
        const reward = rewardMultiplier * betAmount;

        // Start death animation instead of immediate defeat
        set({
            isBossActive: false,
            bossDying: true,
            bossDefeated: true,
            balance: balance + reward
        });
    },

    completeBossDeath: () => {
        // Called when death animation finishes - portal can now spawn
        set({
            bossDying: false,
            bossDeathComplete: true
        });
    },

    updateBossChargeState: (phase, lane, width) => set({
        bossChargePhase: phase,
        bossChargeLane: lane,
        bossChargeWidth: width
    })
});

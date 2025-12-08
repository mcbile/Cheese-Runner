/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Debug Slice - Developer mode and debug actions
 */

import { StateCreator } from 'zustand';
import { GameStatus, getLevelStartSpeed } from '../../types';
import { GameStore, DebugSlice } from '../types';
import { INITIAL_STATS, getLaneCountForLevel } from '../utils';

// Dev password
const DEV_PASSWORD = 'Ch3353';

export const createDebugSlice: StateCreator<GameStore, [], [], DebugSlice> = (set, get) => ({
    isDevMode: false,
    isDevAuthenticated: false,
    isGodMode: false,
    isFirstPersonMode: false,
    debugEnemySpawnId: 0,

    toggleDevMode: () => {
        const { isDevMode, isDevAuthenticated, status } = get();

        // If not authenticated, just toggle to show password prompt
        if (!isDevAuthenticated && !isDevMode) {
            set({ isDevMode: true });
            return;
        }

        const newDevMode = !isDevMode;

        set({ isDevMode: newDevMode });
        // Note: Dev console doesn't pause audio - game continues running
    },

    authenticateDev: (password: string) => {
        if (password === DEV_PASSWORD) {
            set({ isDevAuthenticated: true });
            return true;
        }
        return false;
    },

    toggleFirstPersonMode: () => set((state) => ({ isFirstPersonMode: !state.isFirstPersonMode })),

    debugSetStatus: (status) => set({ status }),

    debugAddScore: (amount) => set((state) => ({ score: state.score + amount })),

    debugAddBalance: (amount) => set((state) => ({ balance: state.balance + amount })),

    debugAddLife: () => set((state) => ({ lives: state.lives + 1, maxLives: Math.max(state.maxLives, state.lives + 1) })),

    debugFillInventory: () => set({
        inventory: {
            'FULL_HEAL': 5,
            'CHEESE_FEVER': 5,
            'SLOW_MOTION': 5
        }
    }),

    toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),

    setGodMode: (enabled) => set({ isGodMode: enabled }),

    debugSpawnBoss: () => {
        set((state) => ({
            wordCompleted: true,
            bossDefeated: false,
            isBossActive: false,
            bossSpawnId: state.bossSpawnId + 1
        }));
    },

    debugJumpToLevel: (targetLevel: number) => {
        const { difficulty } = get();

        const newSpeed = getLevelStartSpeed(targetLevel, difficulty);
        const lanes = getLaneCountForLevel(targetLevel);

        // Use LEVEL_PRELOAD for all levels (same as normal game flow)
        set({
            level: targetLevel,
            laneCount: lanes,
            status: GameStatus.LEVEL_PRELOAD,
            speed: newSpeed,
            lives: 5,
            maxLives: 5,
            score: 0,
            collectedLetters: [],
            levelStats: { ...INITIAL_STATS },
            wordCompleted: false,
            bossDefeated: false,
            isBossActive: false,
            bossSpawnId: 0
        });
    },

    debugSetBossDefeated: (defeated) => set({ bossDefeated: defeated }),

    debugSpawnEnemies: () => {
        set((state) => ({
            debugEnemySpawnId: state.debugEnemySpawnId + 1
        }));
    },

    debugSpawnPortal: () => {
        set({
            wordCompleted: true,
            bossDefeated: true,
            bossDying: false,
            bossDeathComplete: true,
            isBossActive: false
        });
    },

    debugCollectLetters: () => {
        // Collect all letters except O (indices 0-5)
        // K=0, A=1, A=2, S=3, I=4, N=5, O=6
        set({ collectedLetters: [0, 1, 2, 3, 4, 5] });
    },

    debugSetSpeed: (speed: number) => {
        const clampedSpeed = Math.max(0.1, Math.min(999, speed));
        set({ speed: clampedSpeed });
    },

    debugStartGame: (targetLevel: number, targetSpeed: number, godMode: boolean) => {
        const { difficulty, balance, inventory, chasingSnakesActive, maxLives, lives } = get();

        // Calculate speed - use targetSpeed if provided, otherwise get from level table
        const finalSpeed = targetSpeed > 0
            ? targetSpeed
            : getLevelStartSpeed(targetLevel, difficulty);
        const lanes = getLaneCountForLevel(targetLevel);

        // Preserve lives from shop purchases (maxLives >= 5 means extra lives were bought)
        // Start with full health (lives = maxLives)
        const preservedMaxLives = Math.max(5, maxLives);
        const preservedLives = Math.max(lives, preservedMaxLives);
        // Audio sync handled by useAudioSync hook (starts music on COUNTDOWN)

        // Set game state - preserve balance, inventory, lives, and shop purchases
        set({
            status: GameStatus.COUNTDOWN,
            level: targetLevel,
            laneCount: lanes,
            speed: finalSpeed,
            lives: preservedLives,
            maxLives: preservedMaxLives,
            score: 0,
            collectedLetters: [],
            levelStats: { ...INITIAL_STATS },
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0,
            isGodMode: godMode,
            isDevMode: false,
            // Preserve these from dev console
            balance: balance,
            inventory: inventory,
            chasingSnakesActive: chasingSnakesActive
        });
    },

    debugApplyToCurrentGame: (targetSpeed: number, godMode: boolean) => {
        // Apply changes to currently running game without resetting
        const clampedSpeed = Math.max(0.1, Math.min(999, targetSpeed));
        set({
            speed: clampedSpeed,
            isGodMode: godMode,
            isDevMode: false
        });
    }
});

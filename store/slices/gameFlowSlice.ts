/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Game Flow Slice - Game status, difficulty, mute, pause/resume
 */

import { StateCreator } from 'zustand';
import { GameStatus, Difficulty } from '../../types';
import { GameStore, GameFlowSlice } from '../types';
import { clearAllTimers } from '../utils';

export const createGameFlowSlice: StateCreator<GameStore, [], [], GameFlowSlice> = (set, get) => ({
    status: GameStatus.MENU,
    lastGameStatus: GameStatus.MENU,
    difficulty: Difficulty.MEDIUM,
    isMuted: false,

    setStatus: (status) => set({ status }),

    setDifficulty: (diff) => set({ difficulty: diff }),

    toggleMute: () => {
        const newState = !get().isMuted;
        set({ isMuted: newState });
        // Audio sync handled by useAudioSync hook
    },

    pauseGame: () => {
        set({ status: GameStatus.PAUSED });
        // Audio sync handled by useAudioSync hook
    },

    resumeGame: () => {
        set({ status: GameStatus.PLAYING });
        // Audio sync handled by useAudioSync hook
    },

    quitToMenu: () => {
        clearAllTimers();
        // Audio sync handled by useAudioSync hook

        set({
            status: GameStatus.MENU,
            level: 1,
            laneCount: 3,
            speed: 0,
            score: 0,
            lives: 5,
            maxLives: 5,
            collectedLetters: [],
            chasingSnakesActive: false,
            enemyRushProgress: { snake: false, cat: false, owl: false },
            inventory: {},
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0,
            isFirewallActive: false,
            isSpeedBoostActive: false,
            isCheeseFeverActive: false,
            isImmortalityActive: false,
            isGodMode: false,
            isDevMode: false
        });
    },

    quitToMenuFromVictory: () => {
        const { maxLives } = get();
        clearAllTimers();
        // Audio sync handled by useAudioSync hook

        // Keeps: score, inventory, balance, chasingSnakesActive, maxLives
        set({
            status: GameStatus.MENU,
            level: 1,
            laneCount: 3,
            speed: 0,
            lives: maxLives,
            collectedLetters: [],
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0,
            isFirewallActive: false,
            isSpeedBoostActive: false,
            isCheeseFeverActive: false,
            isImmortalityActive: false,
            isGodMode: false,
            isDevMode: false
            // Preserved: score, inventory, balance, betAmount, chasingSnakesActive, maxLives
        });
    }
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Game State Slice - Core game status, lives, score
 */

import { StateCreator } from 'zustand';
import { GameStatus, Difficulty } from '../../types';
import { audio } from '../../components/System/Audio';
import { GameStore, GameStateSlice } from '../types';
import { clearAllTimers } from '../utils';

export const createGameStateSlice: StateCreator<GameStore, [], [], GameStateSlice> = (set, get) => ({
    status: GameStatus.MENU,
    lastGameStatus: GameStatus.MENU,
    score: 0,
    lives: 5,
    maxLives: 5,
    speed: 0,
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    difficulty: Difficulty.MEDIUM,
    isMuted: false,

    setStatus: (status) => set({ status }),

    setDifficulty: (diff) => set({ difficulty: diff }),

    addScore: (amount) => set((state) => ({ score: state.score + amount })),

    setDistance: (dist) => set({ distance: dist }),

    takeDamage: () => {
        const { lives, isImmortalityActive, isCheeseFeverActive, isGodMode } = get();
        if (isImmortalityActive || isCheeseFeverActive || isGodMode) return;

        if (lives > 1) {
            set({ lives: lives - 1 });
        } else {
            set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
        }
    },

    toggleMute: () => {
        const newState = !get().isMuted;
        audio.toggleMute(newState);
        set({ isMuted: newState });
    },

    pauseGame: () => {
        audio.pauseAudio();
        set({ status: GameStatus.PAUSED });
    },

    resumeGame: () => {
        audio.resumeAudio();
        set({ status: GameStatus.PLAYING });
    },

    quitToMenu: () => {
        audio.stopMusic();
        audio.resumeAudio();
        clearAllTimers();

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
        audio.stopMusic();
        audio.resumeAudio();
        clearAllTimers();

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
    },

    setSpeed: (speed) => set({ speed: Math.max(0, speed) })
});

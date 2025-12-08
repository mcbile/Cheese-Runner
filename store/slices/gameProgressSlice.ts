/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Game Progress Slice - Score, lives, speed, level, distance
 */

import { StateCreator } from 'zustand';
import { GameStatus } from '../../types';
import { GameStore, GameProgressSlice } from '../types';

export const createGameProgressSlice: StateCreator<GameStore, [], [], GameProgressSlice> = (set, get) => ({
    score: 0,
    lives: 5,
    maxLives: 5,
    speed: 0,
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,

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

    setSpeed: (speed) => set({ speed: Math.max(0, speed) })
});

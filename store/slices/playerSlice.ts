/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Player State Slice - Player position, letters, abilities
 */

import { StateCreator } from 'zustand';
import { getLetterSpeedIncrease } from '../../types';
import { GameStore, PlayerStateSlice } from '../types';
import { TARGET_WORD, safeSetTimeout } from '../utils';

export const createPlayerSlice: StateCreator<GameStore, [], [], PlayerStateSlice> = (set, get) => ({
    playerLane: 0,
    playerY: 0,
    collectedLetters: [],
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,

    setPlayerLane: (lane) => set({ playerLane: lane }),
    setPlayerY: (y) => set({ playerY: y }),

    collectLetter: (index) => {
        const { collectedLetters, speed, difficulty, level } = get();

        if (!collectedLetters.includes(index)) {
            const newLetters = [...collectedLetters, index];

            // Speed increase per letter depends on level and difficulty
            const speedIncrease = getLetterSpeedIncrease(level, difficulty);
            const nextSpeed = speed + speedIncrease;

            set({
                collectedLetters: newLetters,
                speed: nextSpeed
            });

            // Check if full word collected - trigger boss fight on all levels
            if (newLetters.length === TARGET_WORD.length) {
                set({ wordCompleted: true });
            }
        }
    },

    activateImmortality: () => {
        const { hasImmortality, isImmortalityActive } = get();
        if (hasImmortality && !isImmortalityActive) {
            set({ isImmortalityActive: true });

            safeSetTimeout(() => {
                set({ isImmortalityActive: false });
            }, 5000);
        }
    }
});

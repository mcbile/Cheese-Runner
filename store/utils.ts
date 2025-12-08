/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Store utilities - Timer management and constants
 */

import { LevelStats } from '../types';

// Target word for level completion
export const TARGET_WORD = ['K', 'A', 'A', 'S', 'I', 'N', 'O'];
export const MAX_LEVEL = 5;

// Initial stats template
export const INITIAL_STATS: LevelStats = {
    shotsFired: 0,
    totalRewards: 0,
    trapsDestroyed: 0,
    trapsEarnings: 0,
    snakesDestroyed: 0,
    snakesEarnings: 0,
    catsDestroyed: 0,
    catsEarnings: 0,
    eaglesDestroyed: 0,
    eaglesEarnings: 0,
    syringesDestroyed: 0,
    syringesEarnings: 0,
    cheeseCollected: 0,
    cheesePoints: 0
};

// Timer management to prevent memory leaks
const activeTimers: Set<ReturnType<typeof setTimeout>> = new Set();

export const safeSetTimeout = (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    const timerId = setTimeout(() => {
        activeTimers.delete(timerId);
        callback();
    }, delay);
    activeTimers.add(timerId);
    return timerId;
};

export const clearAllTimers = () => {
    activeTimers.forEach(timerId => clearTimeout(timerId));
    activeTimers.clear();
};

/**
 * Get lane count for a specific level
 * Level 1: 3 lanes, Levels 2-4: 4 lanes, Level 5: 5 lanes
 */
export const getLaneCountForLevel = (level: number): number => {
    if (level === 1) return 3;
    if (level >= 5) return 5;
    return 4;
};

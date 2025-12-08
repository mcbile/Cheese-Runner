/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Level Slice - Level management and game flow actions
 */

import { StateCreator } from 'zustand';
import { GameStatus, getLevelStartSpeed } from '../../types';
import { audio } from '../../components/System/Audio';
import { GameStore, LevelSlice } from '../types';
import { INITIAL_STATS, clearAllTimers, MAX_LEVEL, getLaneCountForLevel } from '../utils';

export const createLevelSlice: StateCreator<GameStore, [], [], LevelSlice> = (set, get) => ({
    startGame: () => {
        const { difficulty, chasingSnakesActive, inventory, level: currentLevel, laneCount: currentLaneCount, speed: currentSpeed } = get();

        // If level > 1, we're starting from dev console - preserve level/lanes/speed
        const isDevStart = currentLevel > 1;
        const startLevel = isDevStart ? currentLevel : 1;
        const startLaneCount = isDevStart ? currentLaneCount : 3;
        const startSpeed = isDevStart ? currentSpeed : getLevelStartSpeed(1, difficulty);

        set({
            status: GameStatus.COUNTDOWN,
            score: 0,
            lives: 5,
            maxLives: 5,
            speed: startSpeed,
            collectedLetters: [],
            level: startLevel,
            laneCount: startLaneCount,
            gemsCollected: 0,
            distance: 0,
            hasDoubleJump: false,
            hasImmortality: false,
            isImmortalityActive: false,
            isCheeseFeverActive: false,
            isFirewallActive: false,
            isSpeedBoostActive: false,
            chasingSnakesActive: chasingSnakesActive,
            cheeseFeverEndTime: 0,
            levelStats: { ...INITIAL_STATS },
            inventory: inventory,
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0
        });
    },

    restartGame: () => {
        const { difficulty } = get();

        clearAllTimers();

        set({
            status: GameStatus.COUNTDOWN,
            score: 0,
            lives: 5,
            maxLives: 5,
            speed: getLevelStartSpeed(1, difficulty),
            collectedLetters: [],
            level: 1,
            laneCount: 3,
            gemsCollected: 0,
            distance: 0,
            hasDoubleJump: false,
            hasImmortality: false,
            isImmortalityActive: false,
            isCheeseFeverActive: false,
            isFirewallActive: false,
            isSpeedBoostActive: false,
            chasingSnakesActive: false,
            cheeseFeverEndTime: 0,
            levelStats: { ...INITIAL_STATS },
            inventory: {},
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0
        });
    },

    restartLevel: () => {
        const { difficulty, level, laneCount, maxLives } = get();

        clearAllTimers();

        // Restart current level - keeps score, inventory, chasingSnakesActive, balance, betAmount
        set({
            status: GameStatus.COUNTDOWN,
            lives: maxLives,
            speed: getLevelStartSpeed(level, difficulty),
            collectedLetters: [],
            gemsCollected: 0,
            distance: 0,
            hasDoubleJump: false,
            hasImmortality: false,
            isImmortalityActive: false,
            isCheeseFeverActive: false,
            isFirewallActive: false,
            isSpeedBoostActive: false,
            cheeseFeverEndTime: 0,
            levelStats: { ...INITIAL_STATS },
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0
            // Preserved: level, laneCount, score, inventory, chasingSnakesActive, maxLives, betAmount, balance
        });
    },

    startAgainFromVictory: () => {
        const { difficulty, maxLives } = get();

        clearAllTimers();

        // Start from level 1 after victory - keeps score, inventory, balance, betAmount, chasingSnakes, maxLives (min 5)
        const newMaxLives = Math.max(5, maxLives);

        set({
            status: GameStatus.COUNTDOWN,
            level: 1,
            laneCount: 3,
            lives: newMaxLives,
            maxLives: newMaxLives,
            speed: getLevelStartSpeed(1, difficulty),
            collectedLetters: [],
            gemsCollected: 0,
            distance: 0,
            hasDoubleJump: false,
            hasImmortality: false,
            isImmortalityActive: false,
            isCheeseFeverActive: false,
            isFirewallActive: false,
            isSpeedBoostActive: false,
            cheeseFeverEndTime: 0,
            levelStats: { ...INITIAL_STATS },
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0
            // Preserved: score, inventory, chasingSnakesActive, betAmount, balance
        });
    },

    triggerLevelComplete: () => {
        const { level, score } = get();
        audio.pauseAudio();

        // On final level, trigger victory instead of level complete
        if (level >= MAX_LEVEL) {
            set({
                status: GameStatus.VICTORY,
                score: score + 5000
            });
        } else {
            set({ status: GameStatus.LEVEL_COMPLETE });
        }
    },

    startNextLevel: () => {
        const { level, difficulty, maxLives } = get();
        const nextLevel = level + 1;

        // Get starting speed for next level from table
        const newSpeed = getLevelStartSpeed(nextLevel, difficulty);

        audio.resumeAudio();
        audio.startMusic();

        const nextLaneCount = getLaneCountForLevel(nextLevel);
        const newMaxLives = maxLives + 1;

        set({
            level: nextLevel,
            maxLives: newMaxLives,
            laneCount: nextLaneCount,
            status: GameStatus.LEVEL_PRELOAD,
            speed: newSpeed,
            collectedLetters: [],
            levelStats: { ...INITIAL_STATS },
            wordCompleted: false,
            bossDefeated: false,
            bossDying: false,
            bossDeathComplete: false,
            isBossActive: false,
            bossSpawnId: 0
        });
    },

    startLevelFromPreload: () => {
        set({ status: GameStatus.COUNTDOWN });
    },

    openShop: () => set((state) => ({
        status: GameStatus.SHOP,
        lastGameStatus: state.status
    })),

    closeShop: () => {
        const { lastGameStatus, startNextLevel } = get();
        if (lastGameStatus === GameStatus.LEVEL_COMPLETE) {
            startNextLevel();
        } else {
            set({ status: lastGameStatus || GameStatus.PLAYING });
        }
    },

    backToStats: () => {
        set({ status: GameStatus.LEVEL_COMPLETE });
    }
});

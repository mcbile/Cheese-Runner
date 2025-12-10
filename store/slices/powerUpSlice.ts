/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PowerUp Slice - Active power-ups during gameplay
 */

import { StateCreator } from 'zustand';
import { GameStatus, PowerUpType } from '../../types';
import { GameStore, PowerUpSlice } from '../types';
import { safeSetTimeout } from '../utils';

export const createPowerUpSlice: StateCreator<GameStore, [], [], PowerUpSlice> = (set, get) => ({
    isFirewallActive: false,
    firewallEndTime: 0,
    isSpeedBoostActive: false,
    speedBoostEndTime: 0,
    isCheeseFeverActive: false,
    cheeseFeverEndTime: 0,
    isSlowMotionActive: false,
    slowMotionEndTime: 0,
    chasingSnakesActive: false,
    enemyRushProgress: { snake: false, cat: false, owl: false },

    deactivateEnemyRush: () => {
        set({
            chasingSnakesActive: false,
            enemyRushProgress: { snake: false, cat: false, owl: false }
        });
    },

    markEnemyRushSpawned: (enemy) => {
        const { enemyRushProgress, chasingSnakesActive } = get();
        if (!chasingSnakesActive) return;

        const newProgress = { ...enemyRushProgress, [enemy]: true };
        set({ enemyRushProgress: newProgress });

        // Check if all enemies spawned - deactivate
        if (newProgress.snake && newProgress.cat && newProgress.owl) {
            set({
                chasingSnakesActive: false,
                enemyRushProgress: { snake: false, cat: false, owl: false }
            });
        }
    },

    collectPowerUp: (type) => {
        if (type === PowerUpType.FIREWALL) {
            const duration = 10000;
            const { isFirewallActive, firewallEndTime } = get();

            // Cumulative: add duration to remaining time if already active
            const now = Date.now();
            const remainingTime = isFirewallActive ? Math.max(0, firewallEndTime - now) : 0;
            const newEndTime = now + remainingTime + duration;

            set({
                isFirewallActive: true,
                firewallEndTime: newEndTime
            });

            safeSetTimeout(() => {
                const current = get();
                // Only deactivate if this timeout matches current end time
                if (current.status === GameStatus.PLAYING && Math.abs(current.firewallEndTime - newEndTime) < 100) {
                    set({ isFirewallActive: false });
                }
            }, remainingTime + duration);

        } else if (type === PowerUpType.SPEED_BOOST) {
            const { speed, isSpeedBoostActive, isSlowMotionActive, speedBoostEndTime } = get();

            const duration = 5000;
            const boostMultiplier = 1.5;
            const slowMultiplier = 0.5;

            // If Slow Motion is active, cancel it first (restore speed)
            let baseSpeed = speed;
            if (isSlowMotionActive) {
                baseSpeed = speed / slowMultiplier;
                set({ isSlowMotionActive: false, slowMotionEndTime: 0 });
            }

            // Cumulative: add duration to remaining time if already active
            const now = Date.now();
            const remainingTime = isSpeedBoostActive ? Math.max(0, speedBoostEndTime - now) : 0;
            const newEndTime = now + remainingTime + duration;

            // Apply boost only if not already boosted
            const newSpeed = isSpeedBoostActive ? speed : baseSpeed * boostMultiplier;

            set({
                isSpeedBoostActive: true,
                speed: newSpeed,
                speedBoostEndTime: newEndTime
            });

            safeSetTimeout(() => {
                const current = get();
                // Only deactivate if this timeout matches current end time
                if (current.status === GameStatus.PLAYING && current.isSpeedBoostActive && Math.abs(current.speedBoostEndTime - newEndTime) < 100) {
                    set({ isSpeedBoostActive: false, speed: current.speed / boostMultiplier });
                }
            }, remainingTime + duration);

        } else if (type === PowerUpType.HEART) {
            const { lives, maxLives } = get();
            set({ lives: Math.min(lives + 1, maxLives) });

        } else if (type === PowerUpType.SLOW_MOTION) {
            const { speed, isSlowMotionActive, isSpeedBoostActive, slowMotionEndTime } = get();

            const duration = 5000;
            const slowMultiplier = 0.5;
            const boostMultiplier = 1.5;

            // If Speed Boost is active, cancel it first (restore speed)
            let baseSpeed = speed;
            if (isSpeedBoostActive) {
                baseSpeed = speed / boostMultiplier;
                set({ isSpeedBoostActive: false, speedBoostEndTime: 0 });
            }

            // Cumulative: add duration to remaining time if already active
            const now = Date.now();
            const remainingTime = isSlowMotionActive ? Math.max(0, slowMotionEndTime - now) : 0;
            const newEndTime = now + remainingTime + duration;

            // Apply slow only if not already slowed
            const newSpeed = isSlowMotionActive ? speed : baseSpeed * slowMultiplier;

            set({
                isSlowMotionActive: true,
                speed: newSpeed,
                slowMotionEndTime: newEndTime
            });

            safeSetTimeout(() => {
                const current = get();
                // Only deactivate if this timeout matches current end time
                if (current.status === GameStatus.PLAYING && current.isSlowMotionActive && Math.abs(current.slowMotionEndTime - newEndTime) < 100) {
                    set({ isSlowMotionActive: false, speed: current.speed / slowMultiplier });
                }
            }, remainingTime + duration);
        }
    }
});

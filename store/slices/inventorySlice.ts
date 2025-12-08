/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Inventory Slice - Items, shop purchases
 */

import { StateCreator } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, DIFFICULTY_CONFIG } from '../../types';
import { GameStore, InventorySlice } from '../types';
import { safeSetTimeout } from '../utils';

export const createInventorySlice: StateCreator<GameStore, [], [], InventorySlice> = (set, get) => ({
    inventory: {},

    buyItem: (type, cost, currency) => {
        const { score, balance, inventory, maxLives, lives } = get();

        let canAfford = false;
        if (currency === 'EURO') {
            canAfford = balance >= cost;
        } else {
            canAfford = score >= cost;
        }

        if (canAfford) {
            // Deduct cost
            if (currency === 'EURO') {
                set({ balance: balance - cost });
            } else {
                set({ score: score - cost });
            }

            // Immediate effects
            if (type === 'MAX_LIFE') {
                set({
                    maxLives: maxLives + 1,
                    lives: lives + 1
                });
                return true;
            }

            if (type === 'INSTANT_CHEESE') {
                set({ score: score + 5000 });
                return true;
            }

            if (type === 'CHASING_SNAKES') {
                set({ chasingSnakesActive: true });
                return true;
            }

            // Auto-use heal if injured
            if (type === 'FULL_HEAL') {
                if (lives < maxLives) {
                    set({ lives: lives + 1 });
                    return true;
                }
            }

            // Add to inventory
            const currentCount = inventory[type] || 0;
            set({
                inventory: { ...inventory, [type]: currentCount + 1 }
            });
            return true;
        }
        return false;
    },

    consumeItem: (type) => {
        const { inventory, maxLives, lives, speed, difficulty } = get();
        const count = inventory[type] || 0;

        if (count > 0) {
            // Decrement inventory
            const newInventory = { ...inventory, [type]: count - 1 };
            if (newInventory[type] === 0) delete newInventory[type];

            set({ inventory: newInventory });

            // Apply effects
            switch (type) {
                case 'FULL_HEAL':
                    set({ lives: Math.min(lives + 1, maxLives) });
                    break;

                case 'CHEESE_FEVER':
                    const feverDuration = 20000;
                    set({
                        isCheeseFeverActive: true,
                        cheeseFeverEndTime: Date.now() + feverDuration
                    });
                    safeSetTimeout(() => {
                        set({ isCheeseFeverActive: false });
                    }, feverDuration);
                    break;

                case 'SLOW_MOTION':
                    const originalSpeed = speed;
                    const config = DIFFICULTY_CONFIG[difficulty];
                    const slowDuration = 15000;
                    set({
                        speed: RUN_SPEED_BASE * config.speedMultiplier,
                        isSlowMotionActive: true,
                        slowMotionEndTime: Date.now() + slowDuration
                    });

                    safeSetTimeout(() => {
                        const currentStatus = get().status;
                        if (currentStatus !== GameStatus.GAME_OVER) {
                            set({ speed: originalSpeed, isSlowMotionActive: false });
                        }
                    }, slowDuration);
                    break;

                case 'ENEMY_RUSH':
                    // Trigger enemy spawn via debugEnemySpawnId increment
                    set((state) => ({ debugEnemySpawnId: state.debugEnemySpawnId + 1 }));
                    break;
            }
            // Note: Inventory stays open - player closes manually
        }
    },

    openInventory: () => {
        set({ status: GameStatus.INVENTORY });
        // Audio sync handled by useAudioSync hook
    },

    closeInventory: () => {
        set({ status: GameStatus.PLAYING });
        // Audio sync handled by useAudioSync hook
    }
});

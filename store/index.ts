/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Main Store - Combines all slices into unified Zustand store
 */

import { create } from 'zustand';
import { GameStore } from './types';
import {
    createGameStateSlice,
    createPlayerSlice,
    createEconomySlice,
    createInventorySlice,
    createPowerUpSlice,
    createBossSlice,
    createLevelSlice,
    createDebugSlice
} from './slices';

export const useStore = create<GameStore>()((...args) => ({
    ...createGameStateSlice(...args),
    ...createPlayerSlice(...args),
    ...createEconomySlice(...args),
    ...createInventorySlice(...args),
    ...createPowerUpSlice(...args),
    ...createBossSlice(...args),
    ...createLevelSlice(...args),
    ...createDebugSlice(...args)
}));

// Re-export types for convenience
export type { GameStore } from './types';

// Re-export utilities
export { getLaneCountForLevel } from './utils';

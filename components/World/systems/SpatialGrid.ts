/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Spatial Grid - Optimizes collision detection by partitioning space
 * into cells for O(1) neighbor lookup instead of O(n²) comparisons.
 */

import { GameObject, ObjectType } from '../../../types';

// Grid configuration
const CELL_SIZE_X = 5;  // Covers ~2 lanes
const CELL_SIZE_Z = 10; // 10 units depth per cell
const GRID_MIN_X = -20;
const GRID_MAX_X = 20;
const GRID_MIN_Z = -150;
const GRID_MAX_Z = 30;

// Calculate grid dimensions
const GRID_WIDTH = Math.ceil((GRID_MAX_X - GRID_MIN_X) / CELL_SIZE_X);
const GRID_DEPTH = Math.ceil((GRID_MAX_Z - GRID_MIN_Z) / CELL_SIZE_Z);

// Use numeric keys for better performance (avoid string allocation)
const KEY_MULTIPLIER = 1000; // Supports grid up to 1000x1000

export interface SpatialCell {
    objects: GameObject[];
}

export class SpatialGrid {
    private cells: Map<number, SpatialCell>; // numeric key for performance
    private objectCells: Map<string, number>; // object.id -> cell key
    private projectiles: GameObject[] = []; // Cached projectile list for hot path

    constructor() {
        this.cells = new Map();
        this.objectCells = new Map();
    }

    /**
     * Get cell key from world position (numeric to avoid string allocation)
     */
    private getCellKey(x: number, z: number): number {
        const cellX = Math.floor((x - GRID_MIN_X) / CELL_SIZE_X);
        const cellZ = Math.floor((z - GRID_MIN_Z) / CELL_SIZE_Z);
        return cellX * KEY_MULTIPLIER + cellZ;
    }

    /**
     * Get cell coordinates from position (for neighbor iteration)
     */
    private getCellCoords(x: number, z: number): [number, number] {
        return [
            Math.floor((x - GRID_MIN_X) / CELL_SIZE_X),
            Math.floor((z - GRID_MIN_Z) / CELL_SIZE_Z)
        ];
    }

    /**
     * Get or create a cell
     */
    private getOrCreateCell(key: number): SpatialCell {
        let cell = this.cells.get(key);
        if (!cell) {
            cell = { objects: [] };
            this.cells.set(key, cell);
        }
        return cell;
    }

    /**
     * Clear the entire grid
     */
    clear(): void {
        this.cells.clear();
        this.objectCells.clear();
        this.projectiles.length = 0;
    }

    /**
     * Insert an object into the grid
     */
    insert(obj: GameObject): void {
        const key = this.getCellKey(obj.position[0], obj.position[2]);
        const cell = this.getOrCreateCell(key);
        cell.objects.push(obj);
        this.objectCells.set(obj.id, key);

        // Track projectiles separately for fast access
        if (obj.type === ObjectType.PROJECTILE) {
            this.projectiles.push(obj);
        }
    }

    /**
     * Remove an object from the grid
     */
    remove(obj: GameObject): void {
        const key = this.objectCells.get(obj.id);
        if (key) {
            const cell = this.cells.get(key);
            if (cell) {
                const idx = cell.objects.indexOf(obj);
                if (idx !== -1) {
                    cell.objects.splice(idx, 1);
                }
            }
            this.objectCells.delete(obj.id);
        }
    }

    /**
     * Update object position in grid
     */
    update(obj: GameObject): void {
        const oldKey = this.objectCells.get(obj.id);
        const newKey = this.getCellKey(obj.position[0], obj.position[2]);

        if (oldKey !== newKey) {
            // Object moved to different cell
            if (oldKey) {
                const oldCell = this.cells.get(oldKey);
                if (oldCell) {
                    const idx = oldCell.objects.indexOf(obj);
                    if (idx !== -1) {
                        oldCell.objects.splice(idx, 1);
                    }
                }
            }
            const newCell = this.getOrCreateCell(newKey);
            newCell.objects.push(obj);
            this.objectCells.set(obj.id, newKey);
        }
    }

    /**
     * Get all objects in the same cell and neighboring cells
     */
    getNearby(x: number, z: number, radius: number = 1): GameObject[] {
        const result: GameObject[] = [];
        const [centerCellX, centerCellZ] = this.getCellCoords(x, z);

        // Check cells in radius
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                const key = (centerCellX + dx) * KEY_MULTIPLIER + (centerCellZ + dz);
                const cell = this.cells.get(key);
                if (cell) {
                    result.push(...cell.objects);
                }
            }
        }

        return result;
    }

    /**
     * Get objects of specific types near a position
     */
    getNearbyOfTypes(x: number, z: number, types: ObjectType[], radius: number = 1): GameObject[] {
        return this.getNearby(x, z, radius).filter(obj => types.includes(obj.type));
    }

    /**
     * Get potential collision candidates for player
     * Only returns objects that could collide (enemies, pickups)
     */
    getPlayerCollisionCandidates(playerX: number, playerZ: number): GameObject[] {
        const collisionTypes = [
            ObjectType.MOUSETRAP,
            ObjectType.SNAKE,
            ObjectType.CAT,
            ObjectType.EAGLE,
            ObjectType.CHEESE,
            ObjectType.LETTER,
            ObjectType.POWERUP,
            ObjectType.SHOP_PORTAL,
            ObjectType.BOSS,
            ObjectType.BOSS_AMMO
        ];
        return this.getNearbyOfTypes(playerX, playerZ, collisionTypes, 1);
    }

    /**
     * Get enemies near a projectile for hit detection
     */
    getProjectileTargets(projX: number, projZ: number): GameObject[] {
        const targetTypes = [
            ObjectType.MOUSETRAP,
            ObjectType.SNAKE,
            ObjectType.CAT,
            ObjectType.EAGLE,
            ObjectType.BOSS,
            ObjectType.BOSS_AMMO
        ];
        return this.getNearbyOfTypes(projX, projZ, targetTypes, 1);
    }

    /**
     * Rebuild grid from object array
     */
    rebuild(objects: GameObject[]): void {
        this.clear();
        for (const obj of objects) {
            if (obj.active) {
                this.insert(obj);
            }
        }
    }

    /**
     * Get cached projectiles list (avoids filtering in hot path)
     */
    getActiveProjectiles(): GameObject[] {
        return this.projectiles;
    }

    /**
     * Get grid statistics for debugging
     */
    getStats(): { totalCells: number; totalObjects: number; maxPerCell: number } {
        let totalObjects = 0;
        let maxPerCell = 0;

        this.cells.forEach(cell => {
            totalObjects += cell.objects.length;
            maxPerCell = Math.max(maxPerCell, cell.objects.length);
        });

        return {
            totalCells: this.cells.size,
            totalObjects,
            maxPerCell
        };
    }
}

// Singleton instance for use across the game
export const spatialGrid = new SpatialGrid();

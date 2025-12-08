/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Spawning system for game objects.
 * Handles spawning of enemies, pickups, boss, and portal.
 */

import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, PowerUpType, GEMINI_COLORS, SPAWN_THRESHOLD, EAGLE_MOVEMENT, getLaneBounds } from '../../../types';
import {
    createMousetrap,
    createSnake,
    createCat,
    createEagle,
    createCheese,
    createLetter,
    createPortal,
    createPowerUp,
    createBoss
} from './ObjectPool';

export interface SpawningRefs {
    mousetrapsSinceLastSnake: number;
    mousetrapsSinceLastCat: number;   // For base cat spawn interval
    mousetrapsSinceLastEagle: number; // For base eagle spawn interval
    catsSpawnedCount: number;
    cheeseSpawnedCount: number;
    lastHeartSpawnTime: number;
    distanceTraveled: number;
    nextLetterDistance: number;
    snakesCrossedZero: number;  // Snakes that crossed z=0
    catsCrossedZero: number;    // Cats that crossed z=0
    lastFirewallRewardCount: number;  // Reward points when last FIREWALL spawned
    pendingCatSpawns: number;   // Cats waiting to spawn (from snake kills)
    pendingEagleSpawns: number; // Eagles waiting to spawn (from cat kills)
    lastSnakesKilled: number;   // Track snake kills for instant cat spawn
    lastCatsKilled: number;     // Track cat kills for instant eagle spawn
}

export interface SpawningState {
    level: number;
    laneCount: number;
    lives: number;
    collectedLetters: number[];
    wordCompleted: boolean;
    bossDefeated: boolean;
    bossDeathComplete: boolean;
    chasingSnakesActive: boolean;
    bossSpawned: boolean;
    portalSpawned: boolean;
    snakesCrossedZero: number;  // From refs - for spawn logic
    catsCrossedZero: number;    // From refs - for spawn logic
    snakesKilled: number;       // From levelStats - for unlock logic
    catsKilled: number;         // From levelStats - for unlock logic
    totalRewards: number;       // For FIREWALL spawn (every 50 reward points)
}

export interface SpawningCallbacks {
    onSetBossActive: (active: boolean, health: number) => void;
}

export interface SpawnResult {
    newObjects: GameObject[];
    updatedRefs: Partial<SpawningRefs>;
    bossSpawned?: boolean;
    portalSpawned?: boolean;
}

const TARGET_WORD = ['K', 'A', 'A', 'S', 'I', 'N', 'O'];

/**
 * Calculate letter spawn interval based on level
 */
export function getLetterInterval(level: number): number {
    const BASE_LETTER_INTERVAL = 150;
    return BASE_LETTER_INTERVAL * Math.pow(1.5, Math.max(0, level - 1));
}

/**
 * Get a random lane within the current lane count
 */
export function getRandomLane(laneCount: number): number {
    const { min, max } = getLaneBounds(laneCount);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Spawn boss when word is completed (uses Object Pool)
 */
export function spawnBoss(
    level: number,
    callbacks: SpawningCallbacks
): GameObject {
    const bossHP = 20 + ((level - 1) * 10);
    callbacks.onSetBossActive(true, bossHP);
    return createBoss(bossHP);
}

/**
 * Spawn portal after boss death (uses Object Pool)
 */
export function spawnPortal(): GameObject {
    return createPortal();
}

/**
 * Spawn a letter pickup (uses Object Pool)
 */
export function spawnLetter(
    lane: number,
    spawnZ: number,
    collectedLetters: number[]
): GameObject | null {
    const availableIndices = TARGET_WORD.map((_, i) => i).filter(i => !collectedLetters.includes(i));
    if (availableIndices.length === 0) return null;

    const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    return createLetter(lane, spawnZ, TARGET_WORD[chosenIndex], GEMINI_COLORS[chosenIndex], chosenIndex);
}

/**
 * Spawn a cheese pickup (uses Object Pool)
 */
export function spawnCheese(lane: number, spawnZ: number, points: number = 50, yPos: number = 1.2): GameObject {
    return createCheese(lane, spawnZ, points, yPos);
}

/**
 * Spawn a powerup (uses Object Pool)
 */
export function spawnPowerUp(lane: number, spawnZ: number, powerUpType: PowerUpType): GameObject {
    return createPowerUp(lane, spawnZ, powerUpType);
}

/**
 * Spawn a mousetrap (uses Object Pool)
 */
export function spawnMousetrap(laneX: number, spawnZ: number): GameObject {
    return createMousetrap(laneX, spawnZ);
}

/**
 * Spawn a cat enemy (uses Object Pool)
 */
export function spawnCat(laneX: number, lane: number, spawnZ: number, canSpawnEagle: boolean): GameObject {
    return createCat(laneX, lane, spawnZ, canSpawnEagle);
}

/**
 * Spawn a snake enemy (uses Object Pool)
 */
export function spawnSnake(laneX: number, lane: number, spawnZ: number, laneCount: number): GameObject {
    const { min: minLane, max: maxLane } = getLaneBounds(laneCount);
    const startFromLeft = Math.random() > 0.5;
    const startLane = startFromLeft ? minLane : maxLane;
    const direction = startFromLeft ? 1 : -1;

    return createSnake(startLane * LANE_WIDTH, spawnZ, direction, startLane);
}

/**
 * Spawn an eagle enemy directly (uses Object Pool)
 */
export function spawnEagle(lane: number, spawnZ: number): GameObject {
    const laneX = lane * LANE_WIDTH;
    return createEagle(laneX, EAGLE_MOVEMENT.HIGH_HEIGHT, spawnZ);
}

/**
 * Process regular spawning (enemies, pickups, powerups)
 */
export function processRegularSpawning(
    spawnZ: number,
    state: SpawningState,
    refs: SpawningRefs,
    existingObjects: GameObject[]
): SpawnResult {
    const newObjects: GameObject[] = [];
    const updatedRefs: Partial<SpawningRefs> = {};

    const { level, laneCount, lives, collectedLetters, chasingSnakesActive, totalRewards } = state;
    const { distanceTraveled, nextLetterDistance, mousetrapsSinceLastSnake, catsSpawnedCount, cheeseSpawnedCount, lastHeartSpawnTime, lastFirewallRewardCount, pendingCatSpawns, pendingEagleSpawns } = refs;

    // Use pending spawns from refs (already calculated in processSpawning)
    let currentPendingCats = pendingCatSpawns;
    let currentPendingEagles = pendingEagleSpawns;

    // Check if cat or eagle already exists on road - only ONE cat OR ONE eagle allowed at a time
    const existingCat = existingObjects.find(o => o.type === ObjectType.CAT && o.active);
    const existingEagle = existingObjects.find(o => o.type === ObjectType.EAGLE && o.active);
    const hasCatOrEagle = !!existingCat || !!existingEagle;

    const isLetterDue = distanceTraveled >= nextLetterDistance;

    if (isLetterDue) {
        const lane = getRandomLane(laneCount);
        const letter = spawnLetter(lane, spawnZ, collectedLetters);

        if (letter) {
            newObjects.push(letter);
            updatedRefs.nextLetterDistance = nextLetterDistance + getLetterInterval(level);
        } else {
            // Fallback - spawn cheese if all letters collected
            updatedRefs.cheeseSpawnedCount = cheeseSpawnedCount + 1;
            newObjects.push(spawnCheese(lane, spawnZ, 50));
        }
    } else if (lives === 1 && (Date.now() - lastHeartSpawnTime) > SPAWN_THRESHOLD.HEART_COOLDOWN_MS) {
        // Heart powerup - only when player has 1 life, max once per cooldown
        const lane = getRandomLane(laneCount);
        newObjects.push(spawnPowerUp(lane, spawnZ, PowerUpType.HEART));
        updatedRefs.lastHeartSpawnTime = Date.now();
    } else if (Math.random() < SPAWN_THRESHOLD.SPEED_BOOST_CHANCE) {
        // Speed boost powerup
        const lane = getRandomLane(laneCount);
        newObjects.push(spawnPowerUp(lane, spawnZ, PowerUpType.SPEED_BOOST));
    } else if (Math.random() < SPAWN_THRESHOLD.SLOW_MOTION_CHANCE) {
        // Slow motion powerup (half as frequent as speed boost)
        const lane = getRandomLane(laneCount);
        newObjects.push(spawnPowerUp(lane, spawnZ, PowerUpType.SLOW_MOTION));
    } else if (Math.random() > 0.1) {
        // Enemy or cheese spawn
        const isObstacle = Math.random() > 0.20;

        if (isObstacle) {
            // Get available lanes
            const { min: minLane, max: maxLane } = getLaneBounds(laneCount);
            const availableLanes: number[] = [];
            for (let i = minLane; i <= maxLane; i++) availableLanes.push(i);
            availableLanes.sort(() => Math.random() - 0.5);

            let currentMousetrapsSinceLastSnake = mousetrapsSinceLastSnake;
            let currentCatsSpawnedCount = catsSpawnedCount;
            let currentCheeseSpawnedCount = cheeseSpawnedCount;

            // Snake threshold varies based on chasing snakes perk
            const snakeThreshold = chasingSnakesActive
                ? SPAWN_THRESHOLD.SNAKE_INTERVAL_CHASING
                : SPAWN_THRESHOLD.SNAKE_INTERVAL;

            // Priority 1: Spawn pending eagles (instant after cat kill)
            // BUT only if no cat or eagle already exists
            if (currentPendingEagles > 0 && !hasCatOrEagle) {
                const lane = availableLanes[0];
                newObjects.push(spawnEagle(lane, spawnZ));
                currentPendingEagles -= 1;
            }
            // Priority 2: Spawn pending cats (instant after every 2 snake kills)
            // BUT only if no cat or eagle already exists
            else if (currentPendingCats > 0 && !hasCatOrEagle) {
                const lane = availableLanes[0];
                const laneX = lane * LANE_WIDTH;
                currentCatsSpawnedCount += 1;
                newObjects.push(spawnCat(laneX, lane, spawnZ, false)); // canSpawnEagle = false (we control eagle spawns now)
                currentPendingCats -= 1;
            }
            // Priority 3: Regular snake spawn (every N mousetraps)
            else if (currentMousetrapsSinceLastSnake >= snakeThreshold) {
                currentMousetrapsSinceLastSnake = 0;
                const lane = availableLanes[0];
                newObjects.push(spawnSnake(lane * LANE_WIDTH, lane, spawnZ, laneCount));
            } else {
                // Spawn mousetraps (1-3 based on probability)
                let countToSpawn = 1;
                const p = Math.random();
                if (p > 0.80) countToSpawn = Math.min(3, availableLanes.length);
                else if (p > 0.50) countToSpawn = Math.min(2, availableLanes.length);

                for (let i = 0; i < countToSpawn; i++) {
                    const lane = availableLanes[i];
                    const laneX = lane * LANE_WIDTH;
                    currentMousetrapsSinceLastSnake += 1;
                    newObjects.push(spawnMousetrap(laneX, spawnZ));
                    // 80% chance for low cheese on top of mousetrap (соотношение 4:1)
                    if (Math.random() < 0.80) {
                        currentCheeseSpawnedCount += 1;
                        newObjects.push(spawnCheese(lane, spawnZ, 100, 1.2));
                    }
                }
            }

            updatedRefs.mousetrapsSinceLastSnake = currentMousetrapsSinceLastSnake;
            updatedRefs.catsSpawnedCount = currentCatsSpawnedCount;
            updatedRefs.cheeseSpawnedCount = currentCheeseSpawnedCount;
            updatedRefs.pendingCatSpawns = currentPendingCats;
            updatedRefs.pendingEagleSpawns = currentPendingEagles;
        } else {
            // Only high cheese here (низкий сыр только на мышеловке)
            const lane = getRandomLane(laneCount);
            updatedRefs.cheeseSpawnedCount = cheeseSpawnedCount + 1;
            newObjects.push(spawnCheese(lane, spawnZ, 50, 3.15));
        }
    }

    // FIREWALL powerup - spawns at regular reward intervals
    if (totalRewards >= lastFirewallRewardCount + SPAWN_THRESHOLD.FIREWALL_REWARD_INTERVAL) {
        const lane = getRandomLane(laneCount);
        newObjects.push(spawnPowerUp(lane, spawnZ - 8, PowerUpType.FIREWALL));
        updatedRefs.lastFirewallRewardCount = totalRewards;
    }

    return { newObjects, updatedRefs };
}

/**
 * Main spawning processor
 */
export function processSpawning(
    keptObjects: GameObject[],
    speed: number,
    state: SpawningState,
    refs: SpawningRefs,
    callbacks: SpawningCallbacks
): SpawnResult {
    const result: SpawnResult = {
        newObjects: [],
        updatedRefs: {}
    };

    const { wordCompleted, bossDefeated, bossDeathComplete, bossSpawned, portalSpawned, level } = state;
    const isBossFight = wordCompleted && !bossDefeated;

    // Calculate furthest Z position
    let furthestZ = 0;
    const staticObjects = keptObjects.filter(o =>
        o.type !== ObjectType.EAGLE &&
        o.type !== ObjectType.PROJECTILE &&
        o.type !== ObjectType.BOSS_AMMO &&
        o.type !== ObjectType.BOSS
    );
    if (staticObjects.length > 0) {
        furthestZ = Math.min(...staticObjects.map(o => o.position[2]));
    } else {
        furthestZ = -20;
    }

    // Boss spawn
    if (wordCompleted && !bossSpawned && !bossDefeated) {
        result.newObjects.push(spawnBoss(level, callbacks));
        result.bossSpawned = true;
    }

    // Portal spawn - after boss death animation
    if (bossDeathComplete && !portalSpawned) {
        result.newObjects.push(spawnPortal());
        result.portalSpawned = true;
    }

    // Always track kills for pending spawns, even when not spawning
    const { snakesKilled, catsKilled } = state;
    const { pendingCatSpawns, pendingEagleSpawns, lastSnakesKilled, lastCatsKilled } = refs;

    // Calculate pending spawns based on TOTAL kills, not incremental
    // Total cats that should have spawned from snake kills = floor(snakesKilled / 2)
    // Cats already accounted for = floor(lastSnakesKilled / 2)
    // New cats to add = difference
    const totalCatsFromSnakes = Math.floor(snakesKilled / SPAWN_THRESHOLD.SNAKES_PER_CAT);
    const previousCatsFromSnakes = Math.floor(lastSnakesKilled / SPAWN_THRESHOLD.SNAKES_PER_CAT);
    const newCatSpawnsFromKills = totalCatsFromSnakes - previousCatsFromSnakes;

    // Same logic for eagles from cat kills (1 eagle per cat)
    const newEagleSpawnsFromKills = catsKilled - lastCatsKilled;

    // Always update kill tracking
    result.updatedRefs.lastSnakesKilled = snakesKilled;
    result.updatedRefs.lastCatsKilled = catsKilled;
    result.updatedRefs.pendingCatSpawns = pendingCatSpawns + newCatSpawnsFromKills;
    result.updatedRefs.pendingEagleSpawns = pendingEagleSpawns + newEagleSpawnsFromKills;

    // Regular spawning (only if no boss/portal phase)
    if (furthestZ > -SPAWN_DISTANCE && !wordCompleted && !isBossFight) {
        const minGap = 12 + (speed * 0.4);
        const spawnZ = Math.min(furthestZ - minGap, -SPAWN_DISTANCE);

        // Create updated refs with new pending values for processRegularSpawning
        const updatedRefs: SpawningRefs = {
            ...refs,
            pendingCatSpawns: result.updatedRefs.pendingCatSpawns!,
            pendingEagleSpawns: result.updatedRefs.pendingEagleSpawns!,
            lastSnakesKilled: result.updatedRefs.lastSnakesKilled!,
            lastCatsKilled: result.updatedRefs.lastCatsKilled!
        };

        const regularResult = processRegularSpawning(spawnZ, state, updatedRefs, keptObjects);
        result.newObjects.push(...regularResult.newObjects);
        // Merge regular result (it may update pendingCatSpawns if a cat was spawned)
        Object.assign(result.updatedRefs, regularResult.updatedRefs);
    }

    return result;
}

/**
 * Reset spawning refs for new game/level
 */
export function resetSpawningRefs(level: number = 1): SpawningRefs {
    return {
        mousetrapsSinceLastSnake: 0,
        mousetrapsSinceLastCat: 0,
        mousetrapsSinceLastEagle: 0,
        catsSpawnedCount: 0,
        cheeseSpawnedCount: 0,
        lastHeartSpawnTime: 0,
        distanceTraveled: 0,
        nextLetterDistance: getLetterInterval(level),
        snakesCrossedZero: 0,
        catsCrossedZero: 0,
        lastFirewallRewardCount: 0,
        pendingCatSpawns: 0,
        pendingEagleSpawns: 0,
        lastSnakesKilled: 0,
        lastCatsKilled: 0
    };
}

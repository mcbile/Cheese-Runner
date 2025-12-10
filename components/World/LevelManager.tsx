/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Level Manager - Orchestrates game objects, movement, collision, and spawning.
 * Refactored to use modular systems and entity components.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, PowerUpType, PlayerShootEvent, GameEvents, getLaneBounds, Difficulty, MoneyEffectObject, BOSS_DEATH_CONFIG, COLLISION_CONFIG, DEFAULT_SPAWN_Z } from '../../types';
import { mobileUtils } from '../System/MobileUtils';

// Import modular systems
import { ParticleSystem } from './systems/ParticleSystem';
import {
    processEagleMovement,
    processCatMovement,
    processSnakeMovement,
    processBossMovement,
    getBaseMovementAmount,
    createMovementContext
} from './systems/MovementSystem';
import {
    processPlayerCollisions,
    processProjectileCollisions,
    CollisionCallbacks
} from './systems/CollisionSystem';
import { spatialGrid } from './systems/SpatialGrid';
import {
    processSpawning,
    getLetterInterval,
    resetSpawningRefs,
    SpawningState,
    SpawningRefs,
    SpawningCallbacks
} from './systems/SpawningSystem';
import { createProjectile, createEagle, createSnake, createCat, createBoss, createPortal, returnToPool, clearPools } from './systems/ObjectPool';

// Import unified entity component
import { GameEntity } from './entities';

/**
 * Dispatch particle burst event helper
 */
function emitParticleBurst(position: [number, number, number], color: string, amount?: number, intensity?: number): void {
    window.dispatchEvent(new CustomEvent(GameEvents.PARTICLE_BURST, { detail: { position, color, amount, intensity } }));
}

// Counter for unique money effect IDs
let moneyEffectIdCounter = 0;

/**
 * Create money effect objects at position with count
 * Spreads them horizontally with slight randomness
 */
function createMoneyEffects(position: [number, number, number], count: number): MoneyEffectObject[] {
    const effects: MoneyEffectObject[] = [];
    const spread = 0.4; // Horizontal spread between $ signs
    const startX = position[0] - (spread * (count - 1)) / 2;

    for (let i = 0; i < count; i++) {
        const offsetX = startX + i * spread + (Math.random() - 0.5) * 0.2;
        const offsetZ = position[2] + (Math.random() - 0.5) * 0.3;

        effects.push({
            id: `money_${moneyEffectIdCounter++}`,
            type: ObjectType.MONEY_EFFECT,
            position: [offsetX, position[1] + 0.5, offsetZ],
            active: true,
            velocityY: 3 + Math.random() * 1.5, // Upward speed with variance
            lifetime: 0.8,
            startTime: Date.now()
        });
    }

    return effects;
}

/**
 * Convert Difficulty enum to numeric index for MovementSystem
 */
function difficultyToNumber(diff: Difficulty): number {
    switch (diff) {
        case Difficulty.EASY: return 0;
        case Difficulty.MEDIUM: return 1;
        case Difficulty.HARD: return 2;
        default: return 1;
    }
}

/**
 * Main LevelManager component
 */
export const LevelManager: React.FC = () => {
    // Store state
    const {
        status, speed, collectGem, collectLetter, collectedLetters, laneCount,
        setDistance, level, addScore, applyReward, betAmount, recordKill,
        wordCompleted, triggerLevelComplete, chasingSnakesActive, enemyRushProgress,
        markEnemyRushSpawned, collectPowerUp,
        bossDefeated, bossDying, bossDeathComplete, setBossActive, updateBossHealth,
        defeatBoss, completeBossDeath, bossSpawnId, lives, debugEnemySpawnId, isDevMode,
        playerLane, playerY, setSpeed, updateBossChargeState, difficulty
    } = useStore();

    // Game objects state
    const objectsRef = useRef<GameObject[]>([]);
    const [renderTrigger, setRenderTrigger] = useState(0);

    // Previous state tracking
    const prevStatus = useRef(status);
    const prevLevel = useRef(level);

    // Spawning refs
    const spawningRefs = useRef<SpawningRefs>(resetSpawningRefs(1));
    const portalSpawnedRef = useRef(false);
    const bossSpawnedRef = useRef(false);

    // Speed slowdown after boss death
    const speedBeforeBossDeathRef = useRef<number | null>(null);
    const portalRef = useRef<GameObject | null>(null); // Cached portal reference for slowdown

    // Reusable temp object to avoid GC pressure in useFrame
    const tempPlayerPos = useRef(new THREE.Vector3());

    // Listen for debug boss spawn
    useEffect(() => {
        if (bossSpawnId > 0) {
            bossSpawnedRef.current = false;
            portalSpawnedRef.current = false;
        }
    }, [bossSpawnId]);

    // Listen for debug enemy spawn (snake, cat, owl)
    useEffect(() => {
        if (debugEnemySpawnId > 0 && status === GameStatus.PLAYING) {
            const spawnZ = -60; // Spawn ahead of player
            const { min: minLane, max: maxLane } = getLaneBounds(laneCount);

            // Spawn snake on left lane
            const snakeLane = minLane;
            const snake = createSnake(snakeLane * LANE_WIDTH, spawnZ, 1, snakeLane);
            objectsRef.current.push(snake);

            // Spawn cat in center lane
            const catLane = 0;
            const cat = createCat(catLane * LANE_WIDTH, catLane, spawnZ - 15, true);
            objectsRef.current.push(cat);

            // Spawn owl on right lane
            const owlLane = maxLane;
            const owl = createEagle(owlLane * LANE_WIDTH, 5.0, spawnZ - 30);
            objectsRef.current.push(owl);

            setRenderTrigger(t => t + 1);
        }
    }, [debugEnemySpawnId, status, laneCount]);

    // Handle game state transitions (restart, level up, etc.)
    useEffect(() => {
        const isRestart = status === GameStatus.COUNTDOWN && prevStatus.current === GameStatus.GAME_OVER;
        const isMenuReset = status === GameStatus.MENU;
        const isLevelUp = level !== prevLevel.current && (status === GameStatus.COUNTDOWN || status === GameStatus.LEVEL_PRELOAD);
        const isVictoryReset = status === GameStatus.COUNTDOWN && prevStatus.current === GameStatus.VICTORY;

        if (isMenuReset || isRestart || isVictoryReset) {
            // Return all objects to pool before clearing
            objectsRef.current.forEach(obj => returnToPool(obj));
            objectsRef.current = [];
            clearPools(); // Clear pools on full reset
            setRenderTrigger(t => t + 1);
            spawningRefs.current = resetSpawningRefs(1);
            portalSpawnedRef.current = false;
            bossSpawnedRef.current = false;
            speedBeforeBossDeathRef.current = null;
            portalRef.current = null; // Clear cached portal reference
        } else if (isLevelUp && level > 1) {
            // Clear all objects when starting new level
            objectsRef.current = [];
            spawningRefs.current = resetSpawningRefs(level);
            portalSpawnedRef.current = false;
            bossSpawnedRef.current = false;
            speedBeforeBossDeathRef.current = null;
            portalRef.current = null; // Clear cached portal reference
            setRenderTrigger(t => t + 1);
        } else if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
            setDistance(Math.floor(spawningRefs.current.distanceTraveled));
        }

        prevStatus.current = status;
        prevLevel.current = level;
    }, [status, level, setDistance]);

    // Handle player shooting
    useEffect(() => {
        const handleShoot = (e: PlayerShootEvent) => {
            if (status !== GameStatus.PLAYING) return;
            const { position } = e.detail;
            // Single getState() call instead of multiple
            const { isFirewallActive: isFirewall, isBossActive: isBossFight } = useStore.getState();

            // Snap projectile to exact lane center for reliable collision detection
            const currentLane = Math.round(position[0] / LANE_WIDTH);
            const snappedX = currentLane * LANE_WIDTH;

            // Enable arc trajectory during boss fight (projectiles curve up towards boss)
            const arcEnabled = isBossFight;

            if (isFirewall) {
                // FIREWALL: two separate fire wall parts (main lane + adjacent lane)
                const { min: minLane, max: maxLane } = getLaneBounds(laneCount);
                let adjacentLane = currentLane + 1;
                if (adjacentLane > maxLane) adjacentLane = currentLane - 1;
                if (adjacentLane < minLane) adjacentLane = currentLane + 1;

                // First part of firewall (current lane) - uses Object Pool
                objectsRef.current.push(createProjectile(snappedX, 0.5, position[2], true, arcEnabled));

                // Second part of firewall (adjacent lane) - uses Object Pool
                objectsRef.current.push(createProjectile(adjacentLane * LANE_WIDTH, 0.5, position[2], true, arcEnabled));
            } else {
                // Normal projectile - uses Object Pool (snapped to lane center)
                objectsRef.current.push(createProjectile(snappedX, position[1], position[2], false, arcEnabled));
            }
            setRenderTrigger(t => t + 1);
        };

        const handler = handleShoot as EventListener;
        window.addEventListener(GameEvents.PLAYER_SHOOT, handler);
        return () => window.removeEventListener(GameEvents.PLAYER_SHOOT, handler);
    }, [status, laneCount]);

    // Main game loop
    useFrame((state, delta) => {
        if (status !== GameStatus.PLAYING || isDevMode) return;

        try {
            // Single getState() call for all needed values (performance optimization)
            const storeSnapshot = useStore.getState();
            const isFever = storeSnapshot.isCheeseFeverActive;
            const isBossFight = storeSnapshot.isBossActive;
            const safeDelta = Math.min(delta, COLLISION_CONFIG.DELTA_CAP);
            const dist = speed * safeDelta;
            const time = state.clock.elapsedTime;

            spawningRefs.current.distanceTraveled += dist;

        // Speed slowdown after boss death - gradually reduce to 10 m/s as portal approaches
        if (bossDying || bossDeathComplete) {
            // Store initial speed when boss starts dying
            if (speedBeforeBossDeathRef.current === null) {
                speedBeforeBossDeathRef.current = speed;
            }

            // Use cached portal reference (avoid find() every frame)
            // Only search if we don't have a cached reference yet
            if (!portalRef.current) {
                portalRef.current = objectsRef.current.find(o => o.type === ObjectType.SHOP_PORTAL && o.active) || null;
            }
            const portal = portalRef.current;
            const portalZ = portal ? portal.position[2] : BOSS_DEATH_CONFIG.SLOWDOWN_START_Z; // Default to portal spawn position (-60)

            // Calculate slowdown based on portal position using constants
            const { SLOWDOWN_START_Z, SLOWDOWN_END_Z, TARGET_SPEED } = BOSS_DEATH_CONFIG;
            const initialSpeed = speedBeforeBossDeathRef.current;

            if (portalZ >= SLOWDOWN_END_Z) {
                // Portal reached target, set final speed
                if (speed !== TARGET_SPEED) {
                    setSpeed(TARGET_SPEED);
                }
            } else if (portalZ > SLOWDOWN_START_Z) {
                // Interpolate speed based on portal position
                const progress = (portalZ - SLOWDOWN_START_Z) / (SLOWDOWN_END_Z - SLOWDOWN_START_Z);
                const newSpeed = initialSpeed - (initialSpeed - TARGET_SPEED) * progress;
                setSpeed(Math.max(TARGET_SPEED, newSpeed));
            } else if (bossDying && !portal) {
                // Boss is dying but portal not spawned yet - start slowing down
                const bossDeathProgress = Math.min(1, safeDelta * 2); // Gradual slowdown
                const newSpeed = speed - (speed - TARGET_SPEED) * bossDeathProgress * 0.1;
                if (newSpeed > TARGET_SPEED) {
                    setSpeed(newSpeed);
                }
            }
        }

        let hasChanges = false;
        // Use store values for reliable player position (works in all camera modes)
        const playerX = playerLane * LANE_WIDTH;
        // Reuse temp vector to avoid GC pressure
        const playerPos = tempPlayerPos.current.set(playerX, playerY, 0);

        const currentObjects = objectsRef.current;
        const keptObjects: GameObject[] = [];
        const newSpawns: GameObject[] = [];

        // Movement context for systems (with precomputed values)
        const movementCtx = createMovementContext(
            speed,
            safeDelta,
            time,
            laneCount,
            playerPos,
            level,
            isBossFight,
            difficultyToNumber(difficulty)
        );

        // Collision callbacks
        const collisionCallbacks: CollisionCallbacks = {
            onPlayerHit: () => window.dispatchEvent(new Event('player-hit')),
            onCollectGem: (points) => { mobileUtils.collect(); collectGem(points); },
            onCollectLetter: (targetIndex) => { mobileUtils.collect(); collectLetter(targetIndex); },
            onCollectPowerUp: (powerUpType) => { mobileUtils.collect(); collectPowerUp(powerUpType); },
            onTriggerLevelComplete: () => { mobileUtils.success(); triggerLevelComplete(); },
            onAddScore: (score) => addScore(score),
            onApplyReward: (multiplier) => applyReward(multiplier),
            onRecordKill: (type, earnings) => recordKill(type, earnings),
            onDefeatBoss: () => { mobileUtils.success(); defeatBoss(); },
            onUpdateBossHealth: (health) => { mobileUtils.bossHit(); updateBossHealth(health); },
            onParticleBurst: (position, color, amount, intensity) => emitParticleBurst(position, color, amount, intensity),
            onSpawnMoneyEffect: (position, count) => {
                const effects = createMoneyEffects(position, count);
                keptObjects.push(...effects);
                hasChanges = true;
            }
        };

        // Process each object
        for (const obj of currentObjects) {
            // Clean up inactive objects and return to pool
            if (!obj.active) {
                returnToPool(obj);
                hasChanges = true;
                continue;
            }

            // Remove boss ammo if boss is inactive
            if (obj.type === ObjectType.BOSS_AMMO && !isBossFight) {
                obj.active = false;
                hasChanges = true;
                emitParticleBurst(obj.position, '#FF4400');
                continue;
            }

            // Calculate movement amount based on object type
            let moveAmount = getBaseMovementAmount(obj, dist, safeDelta, speed);
            const prevZ = obj.position[2];

            // Track snakes/cats crossing z=0
            if (obj.type === ObjectType.SNAKE && prevZ < 0 && obj.position[2] + moveAmount >= 0) {
                spawningRefs.current.snakesCrossedZero += 1;
            }
            if (obj.type === ObjectType.CAT && prevZ < 0 && obj.position[2] + moveAmount >= 0) {
                spawningRefs.current.catsCrossedZero += 1;
            }

            // Type-specific movement
            if (obj.type === ObjectType.EAGLE) {
                const eagleResult = processEagleMovement(obj, movementCtx);
                moveAmount = eagleResult.moveAmount;
                if (eagleResult.hasChanges) hasChanges = true;
            } else if (obj.type === ObjectType.CAT && obj.active) {
                const catResult = processCatMovement(obj, movementCtx, keptObjects);
                if (catResult.hasChanges) hasChanges = true;
                newSpawns.push(...catResult.newSpawns);
            } else if (obj.type === ObjectType.SNAKE && obj.active) {
                processSnakeMovement(obj, movementCtx, keptObjects);
            } else if (obj.type === ObjectType.BOSS) {
                const bossResult = processBossMovement(obj, movementCtx, completeBossDeath);
                if (bossResult.hasChanges) hasChanges = true;
                newSpawns.push(...bossResult.newSpawns);
                // Sync boss charge state to store for lane warning display
                updateBossChargeState(
                    obj.chargePhase || 0,
                    obj.chargeLane || 0,
                    obj.chargeWidth || 1
                );
            }

            // Apply movement (except for boss which handles its own position)
            if (obj.type !== ObjectType.BOSS) {
                // Store previous Z for projectile sweep collision before updating position
                if (obj.type === ObjectType.PROJECTILE) {
                    (obj as any).prevZ = obj.position[2];
                }
                obj.position[2] += moveAmount;
            }

            // Projectile fading animation when reaching max distance
            if (obj.type === ObjectType.PROJECTILE) {
                const projObj = obj as any;
                if (projObj.isFading) {
                    // Countdown fade timer, stop movement
                    projObj.fadeTimer = (projObj.fadeTimer || 0) - safeDelta;
                    // Stop forward movement when fading
                    obj.position[2] -= moveAmount; // Cancel the movement we just applied
                }
            }

            // Money effect animation - float upward and expire
            if (obj.type === ObjectType.MONEY_EFFECT) {
                const moneyObj = obj as MoneyEffectObject;
                // Move upward
                moneyObj.position[1] += moneyObj.velocityY * safeDelta;
                // Cancel Z movement (money stays in place horizontally)
                obj.position[2] -= moveAmount;
                // Check lifetime
                const elapsed = (Date.now() - moneyObj.startTime) / 1000;
                if (elapsed >= moneyObj.lifetime) {
                    obj.active = false;
                    hasChanges = true;
                    continue; // Skip to next object
                }
            }

            // Process collisions
            let keep = true;

            if (obj.active) {
                const collisionResult = processPlayerCollisions(
                    obj, prevZ,
                    { x: playerPos.x, y: playerPos.y, z: playerPos.z },
                    isFever, collisionCallbacks
                );
                keep = collisionResult.keep;
                if (collisionResult.hasChanges) hasChanges = true;
            }

            // Cleanup objects behind player
            const isProjectile = obj.type === ObjectType.PROJECTILE;
            if (!isProjectile && obj.type !== ObjectType.BOSS && obj.position[2] > REMOVE_DISTANCE) {
                keep = false;
                returnToPool(obj);
                hasChanges = true;
            }

            if (keep) keptObjects.push(obj);
        }

        // Add new spawns from movement systems
        if (newSpawns.length > 0) {
            keptObjects.push(...newSpawns);
            hasChanges = true;
        }

        // Rebuild spatial grid for O(1) collision lookups
        spatialGrid.rebuild(keptObjects);

        // Process projectile collisions (pass isFever for HP=1 effect)
        if (processProjectileCollisions(keptObjects, betAmount, collisionCallbacks, spatialGrid, isFever)) {
            hasChanges = true;
        }

        // --- SPAWNING ---
        // Use cached storeSnapshot from top of useFrame
        const levelStats = storeSnapshot.levelStats;
        const spawningState: SpawningState = {
            level,
            laneCount,
            speed,
            lives,
            collectedLetters,
            wordCompleted,
            bossDefeated,
            bossDeathComplete,
            chasingSnakesActive,
            enemyRushProgress,
            markEnemyRushSpawned,
            bossSpawned: bossSpawnedRef.current,
            portalSpawned: portalSpawnedRef.current,
            snakesCrossedZero: spawningRefs.current.snakesCrossedZero,
            catsCrossedZero: spawningRefs.current.catsCrossedZero,
            snakesKilled: levelStats.snakesDestroyed,
            catsKilled: levelStats.catsDestroyed,
            totalRewards: levelStats.totalRewards
        };

        const spawningCallbacks: SpawningCallbacks = {
            onSetBossActive: (active, health) => setBossActive(active, health)
        };

        // Boss spawn - wait for road to clear, then spawn boss
        // IMPORTANT: Set flag FIRST to prevent race condition on multiple frames
        if (wordCompleted && !bossSpawnedRef.current && !bossDefeated) {
            // Check if road is clear of enemies, traps, cheese, letters
            // Only allow powerups and projectiles to remain
            const blockingObjects = keptObjects.filter(o => {
                const isBlockingType =
                    o.type === ObjectType.MOUSETRAP ||
                    o.type === ObjectType.SNAKE ||
                    o.type === ObjectType.CAT ||
                    o.type === ObjectType.EAGLE ||
                    o.type === ObjectType.CHEESE ||
                    o.type === ObjectType.LETTER;
                // Object blocks boss spawn if it's ahead of player (z < 0)
                return isBlockingType && o.position[2] < 0;
            });

            const isRoadClear = blockingObjects.length === 0;

            if (isRoadClear) {
                // Immediately set flag to prevent duplicate spawns
                bossSpawnedRef.current = true;

                const bossHP = 20 + ((level - 1) * 10);
                keptObjects.push(createBoss(bossHP, speed));

                setBossActive(true, bossHP);
                hasChanges = true;
            }
            // If road not clear, boss will spawn on next frame when objects pass z=0
        }

        // Portal spawn - after boss death animation
        // IMPORTANT: Set flag FIRST to prevent race condition
        if (bossDeathComplete && !portalSpawnedRef.current) {
            // Immediately set flag to prevent duplicate spawns
            portalSpawnedRef.current = true;

            keptObjects.push(createPortal());
            hasChanges = true;
        }

        // Regular spawning (only if no boss/portal phase)
        if (!wordCompleted && !isBossFight) {
            // Single pass to find furthest static object Z (optimization: O(n) instead of O(2n))
            let furthestZ = DEFAULT_SPAWN_Z; // Default if no static objects
            let hasStaticObjects = false;
            for (const o of keptObjects) {
                // Skip dynamic objects (eagle, projectile, boss_ammo, boss)
                if (o.type === ObjectType.EAGLE ||
                    o.type === ObjectType.PROJECTILE ||
                    o.type === ObjectType.BOSS_AMMO ||
                    o.type === ObjectType.BOSS) {
                    continue;
                }
                hasStaticObjects = true;
                if (o.position[2] < furthestZ) {
                    furthestZ = o.position[2];
                }
            }
            if (!hasStaticObjects) {
                furthestZ = DEFAULT_SPAWN_Z;
            }

            if (furthestZ > -SPAWN_DISTANCE) {
                const spawnResult = processSpawning(
                    keptObjects, speed, spawningState, spawningRefs.current, spawningCallbacks
                );

                if (spawnResult.newObjects.length > 0) {
                    keptObjects.push(...spawnResult.newObjects);
                    hasChanges = true;
                }

                // Update spawning refs
                Object.assign(spawningRefs.current, spawnResult.updatedRefs);
            }
        }

        // Update state if changes occurred
        if (hasChanges) {
            objectsRef.current = keptObjects;
            setRenderTrigger(t => t + 1);
        }
        } catch (error) {
            console.error('[LevelManager] Error in game loop:', error);
        }
    });

    return (
        <group>
            <ParticleSystem />
            {objectsRef.current.map(obj => {
                if (!obj.active) return null;
                return <GameEntity key={obj.id} data={obj} />;
            })}
        </group>
    );
};

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
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, PowerUpType, PlayerShootEvent, GameEvents, getLaneBounds } from '../../types';
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

/**
 * Main LevelManager component
 */
export const LevelManager: React.FC = () => {
    // Store state
    const {
        status, speed, collectGem, collectLetter, collectedLetters, laneCount,
        setDistance, level, addScore, applyReward, betAmount, recordKill,
        wordCompleted, triggerLevelComplete, chasingSnakesActive, collectPowerUp,
        bossDefeated, bossDying, bossDeathComplete, setBossActive, updateBossHealth,
        defeatBoss, completeBossDeath, bossSpawnId, lives, debugEnemySpawnId, isDevMode,
        playerLane, playerY, setSpeed
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

            // 🦉 Spawn owl on right lane
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
            const isFirewall = useStore.getState().isFirewallActive;

            // Snap projectile to exact lane center for reliable collision detection
            const currentLane = Math.round(position[0] / LANE_WIDTH);
            const snappedX = currentLane * LANE_WIDTH;

            if (isFirewall) {
                // FIREWALL: two separate fire wall parts (main lane + adjacent lane)
                const { min: minLane, max: maxLane } = getLaneBounds(laneCount);
                let adjacentLane = currentLane + 1;
                if (adjacentLane > maxLane) adjacentLane = currentLane - 1;
                if (adjacentLane < minLane) adjacentLane = currentLane + 1;

                // First part of firewall (current lane) - uses Object Pool
                objectsRef.current.push(createProjectile(snappedX, 0.5, position[2], true));

                // Second part of firewall (adjacent lane) - uses Object Pool
                objectsRef.current.push(createProjectile(adjacentLane * LANE_WIDTH, 0.5, position[2], true));
            } else {
                // Normal projectile - uses Object Pool (snapped to lane center)
                objectsRef.current.push(createProjectile(snappedX, position[1], position[2], false));
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
            const isFever = useStore.getState().isCheeseFeverActive;
            const isBossFight = useStore.getState().isBossActive;
            const safeDelta = Math.min(delta, 0.05);
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
            const portalZ = portal ? portal.position[2] : -50; // Default to spawn position

            // Calculate slowdown based on portal position
            // Portal spawns at z=-50, target slowdown complete at z=-15
            // Interpolate speed from initial to 10 m/s
            const SLOWDOWN_START_Z = -50;
            const SLOWDOWN_END_Z = -15;
            const TARGET_SPEED = 10;
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
            isBossFight
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
            onParticleBurst: (position, color, amount, intensity) => emitParticleBurst(position, color, amount, intensity)
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
            }

            // Apply movement (except for boss which handles its own position)
            if (obj.type !== ObjectType.BOSS) {
                obj.position[2] += moveAmount;
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
        const levelStats = useStore.getState().levelStats;
        const spawningState: SpawningState = {
            level,
            laneCount,
            lives,
            collectedLetters,
            wordCompleted,
            bossDefeated,
            bossDeathComplete,
            chasingSnakesActive,
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

        // Boss spawn - clear zone and spawn boss
        // IMPORTANT: Set flag FIRST to prevent race condition on multiple frames
        if (wordCompleted && !bossSpawnedRef.current && !bossDefeated) {
            // Immediately set flag to prevent duplicate spawns
            bossSpawnedRef.current = true;

            const clearZoneObjects = keptObjects.filter(o => o.position[2] > -80);
            objectsRef.current = clearZoneObjects;

            const bossHP = 20 + ((level - 1) * 10);
            keptObjects.push(createBoss(bossHP));

            setBossActive(true, bossHP);
            hasChanges = true;
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

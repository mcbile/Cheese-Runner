/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Collision detection system for game objects.
 * Handles player-object and projectile-object collisions.
 */

import * as THREE from 'three';
import { GameObject, ObjectType, LANE_WIDTH, REMOVE_DISTANCE, HITBOX, REWARD_MULTIPLIER, CHEESE_FEVER_REWARD } from '../../../types';
import { audio } from '../../System/Audio';
import { SpatialGrid } from './SpatialGrid';

export interface PlayerPosition {
    x: number;
    y: number;
    z: number;
}

export interface CollisionCallbacks {
    onPlayerHit: () => void;
    onCollectGem: (points: number) => void;
    onCollectLetter: (targetIndex: number) => void;
    onCollectPowerUp: (powerUpType: any) => void;
    onTriggerLevelComplete: () => void;
    onAddScore: (score: number) => void;
    onApplyReward: (multiplier: number) => void;
    onRecordKill: (type: 'TRAP' | 'SNAKE' | 'CAT' | 'EAGLE' | 'BOSS' | 'SYRINGE', earnings: number) => void;
    onDefeatBoss: () => void;
    onUpdateBossHealth: (health: number) => void;
    onParticleBurst: (position: [number, number, number], color: string, amount?: number, intensity?: number) => void;
    onSpawnMoneyEffect: (position: [number, number, number], count: number) => void;
}

export interface CollisionResult {
    hasChanges: boolean;
    keptObjects: GameObject[];
}

/**
 * Check boss charge attack collision with player
 */
export function checkBossChargeCollision(
    obj: GameObject,
    playerPos: PlayerPosition,
    callbacks: Pick<CollisionCallbacks, 'onPlayerHit' | 'onParticleBurst'>
): boolean {
    if (obj.type !== ObjectType.BOSS || !obj.isCharging || obj.chargePhase !== 2 || obj.chargeHitPlayer) {
        return false;
    }

    const playerLane = Math.round(playerPos.x / LANE_WIDTH);
    const chargeLane = obj.chargeLane ?? 0;
    const chargeWidth = obj.chargeWidth || 1;

    // chargeLane = CENTER of attack zone (consistent across all widths)
    // Width 1: integer lane, zone = [chargeLane]
    // Width 2: half lane (0.5, 1.5...), zone = [floor, ceil]
    // Width 3: integer lane, zone = [chargeLane-1, chargeLane, chargeLane+1]
    let inChargeWidth = false;
    if (chargeWidth === 1) {
        inChargeWidth = playerLane === chargeLane;
    } else if (chargeWidth === 2) {
        // chargeLane is between two lanes (e.g., 0.5 = lanes 0 and 1)
        inChargeWidth = playerLane === Math.floor(chargeLane) || playerLane === Math.ceil(chargeLane);
    } else {
        inChargeWidth = Math.abs(playerLane - chargeLane) <= 1;
    }

    const dz = Math.abs(obj.position[2] - playerPos.z);

    if (inChargeWidth && dz < 3.0) {
        obj.chargeHitPlayer = true;
        callbacks.onPlayerHit();
        // Reduced particles for boss charge hit
        callbacks.onParticleBurst([playerPos.x, playerPos.y, playerPos.z], '#ff0000', 15, 1.0);
        return true;
    }

    return false;
}

/**
 * Check player collision with damage sources (traps, enemies)
 */
export function checkDamageCollision(
    obj: GameObject,
    playerPos: PlayerPosition,
    isFever: boolean,
    callbacks: Pick<CollisionCallbacks, 'onPlayerHit' | 'onAddScore' | 'onCollectGem' | 'onParticleBurst'>
): boolean {
    const playerBottom = playerPos.y;
    const playerTop = playerPos.y + HITBOX.PLAYER_HEIGHT;
    let objBottom = obj.position[1] - 0.5;
    let objTop = obj.position[1] + 0.5;

    // Set hitbox based on object type (using constants)
    if (obj.type === ObjectType.MOUSETRAP) {
        objBottom = HITBOX.MOUSETRAP.bottom;
        objTop = HITBOX.MOUSETRAP.top;
    } else if (obj.type === ObjectType.SNAKE) {
        objBottom = HITBOX.SNAKE.bottom;
        objTop = HITBOX.SNAKE.top;
    } else if (obj.type === ObjectType.EAGLE) {
        objBottom = HITBOX.EAGLE.bottom;
        objTop = HITBOX.EAGLE.top;
    } else if (obj.type === ObjectType.CAT) {
        objBottom = HITBOX.CAT.bottom;
        objTop = HITBOX.CAT.top;
    } else if (obj.type === ObjectType.BOSS_AMMO) {
        objBottom = HITBOX.BOSS_AMMO.bottom;
        objTop = HITBOX.BOSS_AMMO.top;
    }

    if (isFever && obj.type !== ObjectType.BOSS_AMMO) {
        objBottom = 0; objTop = HITBOX.CHEESE_FEVER_HITBOX_TOP; // Giant cheese hitbox
    }

    const isHit = (playerBottom < objTop) && (playerTop > objBottom);

    if (isHit) {
        if (isFever && obj.type !== ObjectType.BOSS_AMMO) {
            // Cheese Fever: award cheese pieces based on enemy type
            let cheeseReward: number = CHEESE_FEVER_REWARD.TRAP;
            if (obj.type === ObjectType.SNAKE) {
                cheeseReward = CHEESE_FEVER_REWARD.SNAKE;
            } else if (obj.type === ObjectType.CAT) {
                cheeseReward = CHEESE_FEVER_REWARD.CAT;
            } else if (obj.type === ObjectType.EAGLE) {
                cheeseReward = CHEESE_FEVER_REWARD.EAGLE;
            }
            // Collect cheese pieces (reward = number of pieces, 0 points each - just counting pieces)
            for (let i = 0; i < cheeseReward; i++) {
                callbacks.onCollectGem(0);
            }
            audio.playGemCollect();
            // Reduced particles for cheese fever kills
            callbacks.onParticleBurst(obj.position, '#FFD700', 12, 0.8);
        } else {
            callbacks.onPlayerHit();
            if (obj.type === ObjectType.EAGLE || obj.type === ObjectType.BOSS_AMMO) {
                // Reduced particles for player hit
                callbacks.onParticleBurst(obj.position, '#ff4400', 10, 0.7);
            }
        }
        obj.active = false;
        return true;
    }

    return false;
}

/**
 * Check player collision with pickups (cheese, letters, powerups)
 * Note: No particle burst for cheese/powerups to reduce performance load
 */
export function checkPickupCollision(
    obj: GameObject,
    playerPos: PlayerPosition,
    callbacks: Pick<CollisionCallbacks, 'onCollectGem' | 'onCollectLetter' | 'onCollectPowerUp' | 'onParticleBurst'>
): boolean {
    const dy = Math.abs(obj.position[1] - playerPos.y);
    if (dy >= HITBOX.PICKUP_Y_THRESHOLD) return false;

    if (obj.type === ObjectType.CHEESE) {
        callbacks.onCollectGem(obj.points || 50);
        audio.playGemCollect();
        // No particles for cheese - performance optimization
    } else if (obj.type === ObjectType.LETTER && obj.targetIndex !== undefined) {
        callbacks.onCollectLetter(obj.targetIndex);
        audio.playLetterCollect();
        // Letters keep particles - important visual feedback
        callbacks.onParticleBurst(obj.position, obj.color || '#FFD700', 20, 0.8);
    } else if (obj.type === ObjectType.POWERUP && obj.powerUpType) {
        callbacks.onCollectPowerUp(obj.powerUpType);
        audio.playGemCollect();
        // No particles for powerups - performance optimization
    }

    obj.active = false;
    return true;
}

/**
 * Check portal collision
 * Portal triggers level complete when player enters it
 */
export function checkPortalCollision(
    obj: GameObject,
    playerPos: PlayerPosition,
    callbacks: Pick<CollisionCallbacks, 'onTriggerLevelComplete'>
): boolean {
    if (obj.type !== ObjectType.SHOP_PORTAL) return false;

    // Check if player is within portal Z range
    const dz = Math.abs(obj.position[2] - playerPos.z);
    if (dz < 2) {
        callbacks.onTriggerLevelComplete();
        obj.active = false;
        return true;
    }
    return false;
}

/**
 * Process player collisions with all objects
 */
export function processPlayerCollisions(
    obj: GameObject,
    prevZ: number,
    playerPos: PlayerPosition,
    isFever: boolean,
    callbacks: CollisionCallbacks
): { keep: boolean; hasChanges: boolean } {
    let keep = true;
    let hasChanges = false;
    const isProjectile = obj.type === ObjectType.PROJECTILE;

    if (!obj.active) {
        return { keep, hasChanges };
    }

    // Boss charge attack collision
    if (checkBossChargeCollision(obj, playerPos, callbacks)) {
        hasChanges = true;
    }

    if (!isProjectile) {
        const zThreshold = HITBOX.PLAYER_COLLISION_Z_THRESHOLD;
        const inZZone = (prevZ < 0 + zThreshold) && (obj.position[2] > 0 - zThreshold);

        // Portal collision - portal stays active after triggering
        if (checkPortalCollision(obj, playerPos, callbacks)) {
            hasChanges = true;
            // Don't set keep = false - portal remains visible
        }
        // Other collisions (not boss - handled separately)
        else if (inZZone && obj.type !== ObjectType.BOSS) {
            const dx = Math.abs(obj.position[0] - playerPos.x);
            if (dx < HITBOX.PLAYER_COLLISION_X_THRESHOLD) {
                const isDamageSource = obj.type === ObjectType.MOUSETRAP ||
                                       obj.type === ObjectType.SNAKE ||
                                       obj.type === ObjectType.CAT ||
                                       obj.type === ObjectType.EAGLE ||
                                       obj.type === ObjectType.BOSS_AMMO;

                if (isDamageSource) {
                    if (checkDamageCollision(obj, playerPos, isFever, callbacks)) {
                        hasChanges = true;
                    }
                } else {
                    if (checkPickupCollision(obj, playerPos, callbacks)) {
                        hasChanges = true;
                    }
                }
            }
        }
    } else {
        // Projectile bounds check - start fading when reaching max Z (only if no hit)
        const projObj = obj as any;
        const maxZ = projObj.isFirewall ? HITBOX.FIREWALL_MAX_Z : HITBOX.PROJECTILE_MAX_Z;

        if (obj.position[2] < maxZ && !projObj.isFading && !projObj.hasHit) {
            // Start fading animation - show $ symbol for 0.3 sec (only for missed shots)
            projObj.isFading = true;
            projObj.fadeTimer = 0.3;
        }

        // Remove when fade timer expires OR projectile hit something
        if ((projObj.isFading && projObj.fadeTimer <= 0) || projObj.hasHit) {
            keep = false;
        }
    }

    // Cleanup objects behind player
    if (!isProjectile && obj.type !== ObjectType.BOSS && obj.position[2] > REMOVE_DISTANCE) {
        keep = false;
        hasChanges = true;
    }

    return { keep, hasChanges };
}

/**
 * Process projectile collisions with targets
 * Uses SpatialGrid for optimized neighbor lookup when available
 * When isFever is true, all enemies have HP=1 (instant kill)
 */
export function processProjectileCollisions(
    keptObjects: GameObject[],
    betAmount: number,
    callbacks: CollisionCallbacks,
    spatialGrid?: SpatialGrid,
    isFever: boolean = false
): boolean {
    let hasChanges = false;

    // Use cached projectiles from spatial grid if available, otherwise filter
    const projectiles = spatialGrid
        ? spatialGrid.getActiveProjectiles()
        : keptObjects.filter(o => o.type === ObjectType.PROJECTILE && o.active);

    for (const proj of projectiles) {
        if (!proj.active) continue;

        // Get potential targets - use spatial grid if available, otherwise full list
        // Use prevZ (middle of sweep) for spatial lookup to catch targets in sweep path
        const projPrevZ = (proj as any).prevZ ?? proj.position[2];
        const lookupZ = (proj.position[2] + projPrevZ) / 2; // Middle of sweep range
        const potentialTargets = spatialGrid
            ? spatialGrid.getProjectileTargets(proj.position[0], lookupZ)
            : keptObjects;

        for (const target of potentialTargets) {
            if (!target.active) continue;
            // Skip boss if already dying or still entering (invulnerable during approach)
            if (target.type === ObjectType.BOSS && (target.isDying || target.isEntering)) continue;

            const isTarget = target.type === ObjectType.MOUSETRAP ||
                             target.type === ObjectType.SNAKE ||
                             target.type === ObjectType.CAT ||
                             target.type === ObjectType.EAGLE ||
                             target.type === ObjectType.BOSS ||
                             target.type === ObjectType.BOSS_AMMO;

            if (!isTarget) continue;

            // Check if projectile and target are in the same lane
            const projLane = Math.round(proj.position[0] / LANE_WIDTH);
            const targetLane = Math.round(target.position[0] / LANE_WIDTH);

            // Boss spans multiple lanes, others are single lane
            if (target.type === ObjectType.BOSS) {
                // chargeLane = CENTER of attack zone (consistent across all widths)
                // Width 1: integer lane, zone = [chargeLane]
                // Width 2: half lane (0.5, 1.5...), zone = [floor, ceil]
                // Width 3: integer lane, zone = [chargeLane-1, chargeLane, chargeLane+1]
                const chargeLane = target.chargeLane ?? 0;
                const chargeWidth = target.chargeWidth || 1;
                let inBossZone = false;
                if (chargeWidth === 1) {
                    inBossZone = projLane === chargeLane;
                } else if (chargeWidth === 2) {
                    // chargeLane is between two lanes (e.g., 0.5 = lanes 0 and 1)
                    inBossZone = projLane === Math.floor(chargeLane) || projLane === Math.ceil(chargeLane);
                } else {
                    inBossZone = Math.abs(projLane - chargeLane) <= 1;
                }
                if (!inBossZone) continue;
            } else {
                // Must be in same lane
                if (projLane !== targetLane) continue;
            }

            // Sweep collision: check if projectile path crossed through target
            // This prevents tunneling when projectile moves faster than hitbox per frame
            const projZ = proj.position[2];
            const projPrevZ2 = (proj as any).prevZ ?? projZ; // Use current if no previous
            const targetZ = target.position[2];
            const hitboxZ = target.type === ObjectType.BOSS ? HITBOX.BOSS_Z : HITBOX.DEFAULT_Z;

            // Check if target Z is within the swept path (prevZ to currentZ) + hitbox
            // Projectiles move in -Z direction, so prevZ > projZ
            const sweepMinZ = projZ - hitboxZ;
            const sweepMaxZ = projPrevZ2 + hitboxZ;

            // Target is hit if its Z is within the sweep range
            const targetInSweep = targetZ >= sweepMinZ && targetZ <= sweepMaxZ;
            if (!targetInSweep) continue;

            // Height check only for Eagle (owl) - projectile at 1.75m can't reach owl at 5m altitude
            // Owl at DIVE_HEIGHT (1.5m) is hittable, but at HIGH_HEIGHT (5m) is not
            if (target.type === ObjectType.EAGLE) {
                const projectileReach = 1.75; // Max height projectile can hit
                if (target.position[1] > projectileReach + 0.5) continue; // +0.5 tolerance
            }

            // Hit detected - mark as hit, deactivate projectile
            (proj as any).hasHit = true;
            proj.active = false;

            // During Cheese Fever, all enemies (except Boss) have HP=1 (instant kill)
            if (isFever && target.type !== ObjectType.BOSS) {
                target.health = 0;
            } else {
                target.health = (target.health || 1) - 1;
            }

            // Boss specifics
            if (target.type === ObjectType.BOSS) {
                callbacks.onUpdateBossHealth(target.health);
                target.lastHitTime = Date.now();
            }

            hasChanges = true;

            if (target.health <= 0) {
                audio.playExplosion();

                // New kill effect system: $ signs + blood particles
                // Trap/Syringe: 1$ no blood | Snake: 2$ + 5 blood | Cat: 3$ + 5 blood | Eagle: 5$ + 5 blood
                let moneyCount = 0;
                let bloodAmount = 0;
                const bloodColor = '#DC143C'; // Scarlet

                if (target.type === ObjectType.MOUSETRAP) {
                    moneyCount = 1;
                    bloodAmount = 0;
                } else if (target.type === ObjectType.SNAKE) {
                    moneyCount = 2;
                    bloodAmount = 5;
                } else if (target.type === ObjectType.CAT) {
                    moneyCount = 3;
                    bloodAmount = 5;
                } else if (target.type === ObjectType.EAGLE) {
                    moneyCount = 5;
                    bloodAmount = 5;
                } else if (target.type === ObjectType.BOSS) {
                    // Boss keeps original particle system + money
                    moneyCount = 20;
                    bloodAmount = 30;
                } else if (target.type === ObjectType.BOSS_AMMO) {
                    moneyCount = 1;
                    bloodAmount = 0;
                }

                // Spawn money effects
                if (moneyCount > 0) {
                    callbacks.onSpawnMoneyEffect(target.position, moneyCount);
                }

                // Spawn blood particles (only for living enemies)
                if (bloodAmount > 0) {
                    callbacks.onParticleBurst(target.position, bloodColor, bloodAmount, 1.0);
                }

                if (target.type === ObjectType.BOSS) {
                    callbacks.onDefeatBoss();
                    // Start death animation
                    target.isDying = true;
                    target.deathTimer = 0;
                    target.deathPhase = 0;
                    target.deathStartZ = target.position[2];
                    target.deathLane = Math.round(target.position[0] / LANE_WIDTH);
                    // Remove all active boss ammo (reduced particles)
                    keptObjects.forEach(o => {
                        if (o.type === ObjectType.BOSS_AMMO && o.active) {
                            o.active = false;
                            callbacks.onParticleBurst(o.position, '#FF4400', 8, 0.6);
                        }
                    });
                } else {
                    // Non-boss targets deactivated immediately
                    target.active = false;
                    let multiplier = 0;
                    let type: 'TRAP' | 'SNAKE' | 'CAT' | 'EAGLE' | 'SYRINGE' = 'TRAP';

                    // Use REWARD_MULTIPLIER constants
                    if (target.type === ObjectType.MOUSETRAP) {
                        multiplier = REWARD_MULTIPLIER.TRAP;
                        type = 'TRAP';
                    } else if (target.type === ObjectType.SNAKE) {
                        multiplier = REWARD_MULTIPLIER.SNAKE;
                        type = 'SNAKE';
                    } else if (target.type === ObjectType.CAT) {
                        multiplier = REWARD_MULTIPLIER.CAT;
                        type = 'CAT';
                    } else if (target.type === ObjectType.EAGLE) {
                        multiplier = REWARD_MULTIPLIER.EAGLE;
                        type = 'EAGLE';
                    } else if (target.type === ObjectType.BOSS_AMMO) {
                        multiplier = REWARD_MULTIPLIER.SYRINGE;
                        type = 'SYRINGE';
                    }

                    if (multiplier > 0) {
                        callbacks.onApplyReward(multiplier);
                        callbacks.onRecordKill(type, betAmount * multiplier);
                    }
                }
            } else {
                // Hit feedback (reduced particles)
                callbacks.onParticleBurst(target.position, '#34D399', 8, 0.7);
            }
            break;
        }
    }

    return hasChanges;
}

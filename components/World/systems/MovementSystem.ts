/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Movement system for game entities.
 * Handles movement logic for eagles, cats, snakes, boss, projectiles, and fireballs.
 */

import * as THREE from 'three';
import {
    GameObject,
    ObjectType,
    LANE_WIDTH,
    getLaneBounds,
    SPEED_MULTIPLIERS,
    EAGLE_MOVEMENT,
    CAT_MOVEMENT,
    SNAKE_MOVEMENT,
    BOSS_MOVEMENT,
    isBoss,
    isProjectile,
    EagleObject,
    CatObject,
    SnakeObject,
    BossObject
} from '../../../types';
import { createEagle, createBossAmmo } from './ObjectPool';
import { audio } from '../../System/Audio';

export interface MovementContext {
    speed: number;
    safeDelta: number;
    time: number;
    laneCount: number;
    playerPos: THREE.Vector3;
    level: number;
    isBossFight: boolean;
    difficulty: number; // 0 = EASY, 1 = MEDIUM, 2 = HARD
    // Precomputed values to avoid recalculation per-entity
    minLane: number;
    maxLane: number;
    playerLane: number;
    // Precomputed speeds
    eagleSlowSpeed: number;
    eagleFastSpeed: number;
    eagleRetreatSpeed: number;
}

/**
 * Create movement context with precomputed values
 */
export function createMovementContext(
    speed: number,
    safeDelta: number,
    time: number,
    laneCount: number,
    playerPos: THREE.Vector3,
    level: number,
    isBossFight: boolean,
    difficulty: number = 1 // 0 = EASY, 1 = MEDIUM, 2 = HARD
): MovementContext {
    const { min: minLane, max: maxLane } = getLaneBounds(laneCount);
    return {
        speed,
        safeDelta,
        time,
        laneCount,
        playerPos,
        level,
        isBossFight,
        difficulty,
        minLane,
        maxLane,
        playerLane: Math.round(playerPos.x / LANE_WIDTH),
        eagleSlowSpeed: speed * EAGLE_MOVEMENT.SLOW_SPEED_MULT,
        eagleFastSpeed: speed * EAGLE_MOVEMENT.FAST_SPEED_MULT,
        eagleRetreatSpeed: speed * EAGLE_MOVEMENT.RETREAT_SPEED_MULT
    };
}

export interface MovementResult {
    hasChanges: boolean;
    newSpawns: GameObject[];
}

/**
 * Process eagle movement with three phases: approaching, diving, retreating
 */
export function processEagleMovement(
    obj: EagleObject,
    ctx: MovementContext
): { moveAmount: number; hasChanges: boolean } {
    const { speed, safeDelta, playerPos, minLane, maxLane, playerLane, eagleSlowSpeed, eagleFastSpeed, eagleRetreatSpeed } = ctx;
    let hasChanges = false;
    let moveAmount = 0;

    // Initialize eagle state
    if (obj.eaglePhase === undefined) obj.eaglePhase = 0;
    if (obj.eagleDiveCount === undefined) obj.eagleDiveCount = 0;
    if (obj.laneChangeTimer === undefined) obj.laneChangeTimer = 0;

    const eagleLane = Math.round(obj.position[0] / LANE_WIDTH);

    if (obj.eaglePhase === 0) {
        // APPROACHING - Eagle flies to descent start at high altitude
        moveAmount = 0;
        obj.position[1] = THREE.MathUtils.lerp(obj.position[1], EAGLE_MOVEMENT.HIGH_HEIGHT, safeDelta * 3);

        if (obj.position[2] > EAGLE_MOVEMENT.DESCENT_START_Z) {
            obj.position[2] = THREE.MathUtils.lerp(obj.position[2], EAGLE_MOVEMENT.DESCENT_START_Z, safeDelta * 2);
        } else {
            obj.eaglePhase = 1;
            obj.laneChangeTimer = 0;
            hasChanges = true;
        }
    } else if (obj.eaglePhase === 1) {
        // DIVING - Eagle moves towards player
        if (obj.position[2] < EAGLE_MOVEMENT.DIVE_Z) {
            moveAmount = eagleSlowSpeed * safeDelta;
        } else {
            moveAmount = eagleFastSpeed * safeDelta;
        }

        // Height calculation
        if (obj.position[2] < EAGLE_MOVEMENT.REACHABLE_Z) {
            const descentProgress = (obj.position[2] - EAGLE_MOVEMENT.DESCENT_START_Z) / (EAGLE_MOVEMENT.REACHABLE_Z - EAGLE_MOVEMENT.DESCENT_START_Z);
            obj.position[1] = EAGLE_MOVEMENT.HIGH_HEIGHT - (EAGLE_MOVEMENT.HIGH_HEIGHT - EAGLE_MOVEMENT.DIVE_HEIGHT) * descentProgress;
        } else {
            obj.position[1] = EAGLE_MOVEMENT.DIVE_HEIGHT;
        }

        // Dodging behavior
        if (obj.position[2] >= EAGLE_MOVEMENT.REACHABLE_Z && obj.position[2] < EAGLE_MOVEMENT.DIVE_Z) {
            obj.laneChangeTimer = (obj.laneChangeTimer || 0) + safeDelta;
            if (obj.laneChangeTimer >= EAGLE_MOVEMENT.DODGE_INTERVAL) {
                obj.laneChangeTimer = 0;
                const dodgeDir = Math.random() < 0.5 ? -1 : 1;
                let newLane = eagleLane + dodgeDir;
                if (newLane < minLane) newLane = eagleLane + 1;
                if (newLane > maxLane) newLane = eagleLane - 1;
                obj.targetLane = THREE.MathUtils.clamp(newLane, minLane, maxLane);
                hasChanges = true;
            }

            const eagleLateralSpeed = speed * EAGLE_MOVEMENT.LATERAL_SPEED_MULT;
            const targetX = (obj.targetLane ?? eagleLane) * LANE_WIDTH;
            const eagleLaneDir = Math.sign(targetX - obj.position[0]);
            const eagleLaneDist = Math.abs(targetX - obj.position[0]);
            if (eagleLaneDist > 0.05) {
                obj.position[0] += eagleLaneDir * Math.min(eagleLateralSpeed * safeDelta, eagleLaneDist);
            }
        } else if (obj.position[2] >= EAGLE_MOVEMENT.DIVE_Z) {
            // Lock onto player
            const eagleDiveLateralSpeed = speed * EAGLE_MOVEMENT.DIVE_LATERAL_SPEED_MULT;
            obj.targetLane = playerLane;
            const targetX = playerLane * LANE_WIDTH;
            const eagleDiveDir = Math.sign(targetX - obj.position[0]);
            const eagleDiveDist = Math.abs(targetX - obj.position[0]);
            if (eagleDiveDist > 0.05) {
                obj.position[0] += eagleDiveDir * Math.min(eagleDiveLateralSpeed * safeDelta, eagleDiveDist);
            }
        }

        // Check if passed player
        if (obj.position[2] > playerPos.z + 5) {
            obj.eagleDiveCount = (obj.eagleDiveCount || 0) + 1;

            if ((obj.eagleDiveCount || 0) >= EAGLE_MOVEMENT.MAX_DIVES) {
                obj.active = false;
                hasChanges = true;
                window.dispatchEvent(new CustomEvent('particle-burst', { detail: { position: obj.position, color: '#8B4513' } }));
            } else {
                obj.eaglePhase = 2;
                hasChanges = true;
            }
        }
    } else if (obj.eaglePhase === 2) {
        // RETREATING
        moveAmount = -eagleRetreatSpeed * safeDelta;
        obj.position[1] = THREE.MathUtils.lerp(obj.position[1], EAGLE_MOVEMENT.HIGH_HEIGHT, safeDelta * 3);

        if (obj.position[2] <= EAGLE_MOVEMENT.RETREAT_Z) {
            obj.eaglePhase = 1;
            obj.laneChangeTimer = 0;
            hasChanges = true;
        }
    }

    return { moveAmount, hasChanges };
}

/**
 * Process cat movement with diagonal edge-to-edge pattern + jump at end
 * Cat moves diagonally across lanes, then jumps to player's lane
 */
export function processCatMovement(
    obj: CatObject,
    ctx: MovementContext,
    keptObjects: GameObject[]
): { hasChanges: boolean; newSpawns: GameObject[] } {
    const { speed, safeDelta, playerPos, minLane, maxLane, playerLane } = ctx;
    let hasChanges = false;
    const newSpawns: GameObject[] = [];

    // Use centralized constants
    const catLateralSpeed = speed * CAT_MOVEMENT.LATERAL_SPEED_MULT;
    const minX = minLane * LANE_WIDTH;
    const maxX = maxLane * LANE_WIDTH;

    // Initialize direction if not set (start from edge, go opposite)
    if (obj.snakeDirection === undefined) {
        obj.snakeDirection = obj.position[0] <= 0 ? 1 : -1;
    }

    const catBehindPlayer = obj.position[2] > playerPos.z;

    // Handle jumping animation
    if (obj.isJumping) {
        obj.jumpProgress = (obj.jumpProgress || 0) + safeDelta / CAT_MOVEMENT.JUMP_DURATION;

        if (obj.jumpProgress >= 1) {
            obj.isJumping = false;
            obj.jumpProgress = 0;
            obj.position[1] = 0;
            // Snap to target lane after jump
            obj.position[0] = (obj.jumpTargetLane || 0) * LANE_WIDTH;
        } else {
            // Parabolic jump
            obj.position[1] = Math.sin(obj.jumpProgress * Math.PI) * CAT_MOVEMENT.JUMP_HEIGHT;
            // Move towards target lane during jump
            const targetX = (obj.jumpTargetLane || 0) * LANE_WIDTH;
            const jumpLateralSpeed = catLateralSpeed * 2;
            const dir = Math.sign(targetX - obj.position[0]);
            const dist = Math.abs(targetX - obj.position[0]);
            if (dist > 0.1) {
                obj.position[0] += dir * Math.min(jumpLateralSpeed * safeDelta, dist);
            }
        }
    } else {
        obj.position[1] = 0;

        // Phase 1: Diagonal movement (before jump trigger)
        if (obj.position[2] < CAT_MOVEMENT.JUMP_TRIGGER_Z && !catBehindPlayer) {
            // Move diagonally
            const direction = obj.snakeDirection || 1;
            obj.position[0] += direction * catLateralSpeed * safeDelta;

            // Bounce off edges
            if (obj.position[0] >= maxX) {
                obj.position[0] = maxX;
                obj.snakeDirection = -1;
            } else if (obj.position[0] <= minX) {
                obj.position[0] = minX;
                obj.snakeDirection = 1;
            }
        }
        // Phase 2: At trigger zone, jump to player's lane
        else if (obj.position[2] >= CAT_MOVEMENT.JUMP_TRIGGER_Z && !catBehindPlayer && !obj.hasFired) {
            // Mark that we've initiated jump sequence
            obj.hasFired = true;
            obj.isJumping = true;
            obj.jumpProgress = 0;
            obj.jumpStartY = obj.position[1];
            obj.jumpTargetLane = playerLane;
            hasChanges = true;
        }
    }

    // Cat no longer spawns eagles directly - eagles spawn via pendingEagleSpawns after cat kill
    // This ensures only one cat OR one eagle on road at a time

    return { hasChanges, newSpawns };
}

/**
 * Process snake movement with lane changing pattern (no jump)
 * Snake moves forward and changes lanes periodically
 */
export function processSnakeMovement(
    obj: SnakeObject,
    ctx: MovementContext,
    keptObjects: GameObject[]
): void {
    const { speed, safeDelta, minLane, maxLane } = ctx;

    // Use centralized constants
    const snakeLateralSpeed = speed * SNAKE_MOVEMENT.LATERAL_SPEED_MULT;
    const currentLane = Math.round(obj.position[0] / LANE_WIDTH);

    // Initialize target lane if not set
    if (obj.targetLane === undefined) {
        obj.targetLane = obj.snakeStartLane ?? currentLane;
    }

    // Update lane change timer
    obj.laneChangeTimer = (obj.laneChangeTimer || 0) + safeDelta;

    // Change lane periodically
    if (obj.laneChangeTimer >= SNAKE_MOVEMENT.LANE_CHANGE_INTERVAL) {
        obj.laneChangeTimer = 0;

        // Pick a random adjacent lane
        const possible: number[] = [];
        if (currentLane > minLane) possible.push(currentLane - 1);
        if (currentLane < maxLane) possible.push(currentLane + 1);

        if (possible.length > 0) {
            const candidateLane = possible[Math.floor(Math.random() * possible.length)];
            let laneBlocked = false;

            // Check if lane is blocked by another object
            for (const other of keptObjects) {
                if (other.id === obj.id || !other.active) continue;
                const otherLane = Math.round(other.position[0] / LANE_WIDTH);
                const zDist = Math.abs(other.position[2] - obj.position[2]);
                if (otherLane === candidateLane && zDist < 4) {
                    laneBlocked = true;
                    break;
                }
            }

            if (!laneBlocked) {
                obj.targetLane = candidateLane;
            }
        }
    }

    // Move towards target lane
    const targetX = (obj.targetLane || 0) * LANE_WIDTH;
    const dir = Math.sign(targetX - obj.position[0]);
    const dist = Math.abs(targetX - obj.position[0]);
    if (dist > 0.05) {
        obj.position[0] += dir * Math.min(snakeLateralSpeed * safeDelta, dist);
    } else {
        obj.position[0] = targetX;
    }
}

/**
 * Process boss movement and attack patterns
 */
export function processBossMovement(
    obj: BossObject,
    ctx: MovementContext,
    completeBossDeath: () => void
): { hasChanges: boolean; newSpawns: GameObject[] } {
    const { speed, safeDelta, time, laneCount, level, difficulty } = ctx;
    let hasChanges = false;
    const newSpawns: GameObject[] = [];

    // BOSS DEATH ANIMATION
    if (obj.isDying) {
        if (obj.deathTimer === undefined) obj.deathTimer = 0;
        if (obj.deathPhase === undefined) obj.deathPhase = 0;

        // Play death groan once at start
        if (!obj.deathGroanPlayed) {
            obj.deathGroanPlayed = true;
            audio.playBossDeathGroan();
        }

        obj.deathTimer += safeDelta;

        if (obj.deathPhase === 0) {
            const knockbackProgress = Math.min(obj.deathTimer / BOSS_MOVEMENT.KNOCKBACK_DURATION, 1);
            const startZ = obj.deathStartZ || obj.position[2];
            obj.position[2] = THREE.MathUtils.lerp(startZ, BOSS_MOVEMENT.KNOCKBACK_TARGET_Z, knockbackProgress);
            obj.position[1] = Math.sin(knockbackProgress * Math.PI) * 2;
            const targetX = (obj.deathLane || 0) * LANE_WIDTH;
            obj.position[0] = THREE.MathUtils.lerp(obj.position[0], targetX, safeDelta * 5);

            if (knockbackProgress >= 1) {
                obj.deathPhase = 1;
                obj.deathTimer = 0;
                obj.position[2] = BOSS_MOVEMENT.KNOCKBACK_TARGET_Z;
            }
        } else if (obj.deathPhase === 1) {
            const fallProgress = Math.min(obj.deathTimer / BOSS_MOVEMENT.FALL_DURATION, 1);
            obj.position[1] = (1 - fallProgress) * 2;
            obj.position[2] = BOSS_MOVEMENT.KNOCKBACK_TARGET_Z;

            if (fallProgress >= 1) {
                obj.deathPhase = 2;
                obj.deathTimer = 0;
                obj.position[1] = 0;
                completeBossDeath();
            }
        } else {
            obj.position[1] = 0;
            obj.position[2] = BOSS_MOVEMENT.KNOCKBACK_TARGET_Z;
        }

        hasChanges = true;
        return { hasChanges, newSpawns };
    }

    // ENTERING PHASE - Boss approaching from spawn position to normal position
    // During this phase: invulnerable, no shooting, moving at 100% road speed
    if (obj.isEntering) {
        const enterSpeed = speed * BOSS_MOVEMENT.ENTER_SPEED_MULT;
        obj.position[2] += enterSpeed * safeDelta;

        // Keep centered while entering
        obj.position[0] = 0;
        obj.position[1] = 0;

        // Check if reached normal position
        if (obj.position[2] >= BOSS_MOVEMENT.NORMAL_POSITION_Z) {
            obj.position[2] = BOSS_MOVEMENT.NORMAL_POSITION_Z;
            obj.isEntering = false; // Now vulnerable and can attack
            // Reset timers for normal behavior
            obj.attackTimer = 0;
            obj.chargeTimer = 0;
        }

        hasChanges = true;
        return { hasChanges, newSpawns };
    }

    // NORMAL BOSS BEHAVIOR
    if (!obj.attackTimer) obj.attackTimer = 0;
    if (obj.chargeTimer === undefined) obj.chargeTimer = 0;
    if (obj.isCharging === undefined) obj.isCharging = false;
    if (obj.chargePhase === undefined) obj.chargePhase = 0;
    if (obj.chargeLane === undefined) obj.chargeLane = 0;
    if (obj.chargeHitPlayer === undefined) obj.chargeHitPlayer = false;

    obj.attackTimer += safeDelta;
    obj.chargeTimer += safeDelta;

    // Random charge interval using centralized constants
    if (obj.nextChargeInterval === undefined) {
        const intervalRange = BOSS_MOVEMENT.MAX_CHARGE_INTERVAL - BOSS_MOVEMENT.MIN_CHARGE_INTERVAL;
        obj.nextChargeInterval = BOSS_MOVEMENT.MIN_CHARGE_INTERVAL + Math.random() * intervalRange;
    }

    // Use centralized constants
    const chargeSpeed = speed * BOSS_MOVEMENT.CHARGE_SPEED_MULT;
    const retreatSpeed = speed * BOSS_MOVEMENT.RETREAT_SPEED_MULT;
    const returnSpeed = speed * BOSS_MOVEMENT.RETURN_SPEED_MULT;
    const bossLateralSpeed = speed * BOSS_MOVEMENT.LATERAL_SPEED_MULT;

    // Boss charge distance by level and difficulty (manually tuned)
    // EASY:   [45, 46, 47, 48, 50]
    // MEDIUM: [45, 46.5, 48, 49.5, 52]
    // HARD:   [45, 47, 49, 51, 54]
    const CHARGE_DISTANCES: Record<number, number[]> = {
        0: [-45, -46, -47, -48, -50],      // EASY
        1: [-45, -46.5, -48, -49.5, -52],  // MEDIUM
        2: [-45, -47, -49, -51, -54],      // HARD
    };
    const levelIndex = Math.min(Math.max(level - 1, 0), 4);
    const dynamicBackPositionZ = CHARGE_DISTANCES[difficulty]?.[levelIndex] ?? -45;

    const chargeWidth = level >= 5 ? 3 : (level >= 2 ? 2 : 1);

    if (obj.chargeTimer >= obj.nextChargeInterval && obj.chargePhase === 0) {
        obj.chargePhase = 1;
        obj.chargeTimer = 0;
        obj.isCharging = true;
        obj.chargeHitPlayer = false;

        const { min: minLane, max: maxLane } = getLaneBounds(laneCount);

        // chargeLane = CENTER of attack zone (consistent across all widths)
        // Width 1: integer lane (0, 1, -1...), zone = [chargeLane]
        // Width 2: half lane (0.5, 1.5, -0.5...), zone = [floor, ceil] = two adjacent lanes
        // Width 3: integer lane, zone = [chargeLane-1, chargeLane, chargeLane+1]
        if (chargeWidth === 1) {
            // Any lane from minLane to maxLane
            obj.chargeLane = Math.floor(Math.random() * (maxLane - minLane + 1)) + minLane;
        } else if (chargeWidth === 2) {
            // Center between two lanes: minLane+0.5 to maxLane-0.5
            // E.g., 4 lanes (-1, 0, 1, 2): centers are -0.5, 0.5, 1.5
            const numPairs = maxLane - minLane; // number of valid pair centers
            const pairIndex = Math.floor(Math.random() * numPairs);
            obj.chargeLane = minLane + pairIndex + 0.5;
        } else {
            // Center lane for width 3: minLane+1 to maxLane-1
            const validMin = minLane + 1;
            const validMax = maxLane - 1;
            if (validMin <= validMax) {
                obj.chargeLane = Math.floor(Math.random() * (validMax - validMin + 1)) + validMin;
            } else {
                obj.chargeLane = 0;
            }
        }
    }

    // Boss X position = center of attack zone
    // chargeLane is always the center (integer for width 1/3, half for width 2)
    const chargeCenterX = obj.chargeLane * LANE_WIDTH;

    if (obj.chargePhase === 1) {
        obj.position[2] -= retreatSpeed * safeDelta;
        const bossTargetX = chargeCenterX;
        const bossLaneDir = Math.sign(bossTargetX - obj.position[0]);
        const bossLaneDist = Math.abs(bossTargetX - obj.position[0]);
        if (bossLaneDist > 0.05) {
            obj.position[0] += bossLaneDir * Math.min(bossLateralSpeed * safeDelta, bossLaneDist);
        } else {
            obj.position[0] = bossTargetX;
        }

        if (obj.position[2] <= dynamicBackPositionZ) {
            obj.chargePhase = 2;
            obj.position[2] = dynamicBackPositionZ;
            obj.position[0] = chargeCenterX;
        }
    } else if (obj.chargePhase === 2) {
        obj.position[2] += chargeSpeed * safeDelta;
        obj.position[0] = chargeCenterX;

        if (obj.position[2] >= 0) {
            obj.chargePhase = 3;
            obj.position[2] = 0;
        }
    } else if (obj.chargePhase === 3) {
        // Retreating back - stay in charge center
        obj.position[2] -= returnSpeed * safeDelta;
        obj.position[0] = chargeCenterX;

        if (obj.position[2] <= BOSS_MOVEMENT.NORMAL_POSITION_Z) {
            obj.chargePhase = 4; // New phase: hold position before resuming movement
            obj.position[2] = BOSS_MOVEMENT.NORMAL_POSITION_Z;
            obj.holdTimer = 0; // Start hold timer
        }
    } else if (obj.chargePhase === 4) {
        // Hold position in current lane before resuming normal movement
        obj.holdTimer = (obj.holdTimer || 0) + safeDelta;
        obj.position[2] = BOSS_MOVEMENT.NORMAL_POSITION_Z;
        obj.position[0] = obj.chargeLane * LANE_WIDTH; // Stay in charge lane

        const holdDurationRange = BOSS_MOVEMENT.HOLD_MAX_DURATION - BOSS_MOVEMENT.HOLD_MIN_DURATION;
        const holdDuration = BOSS_MOVEMENT.HOLD_MIN_DURATION + Math.random() * holdDurationRange;
        if (obj.holdTimer >= holdDuration) {
            obj.chargePhase = 0;
            obj.isCharging = false;
            obj.holdTimer = 0;
            // Set new random interval for next charge
            const intervalRange = BOSS_MOVEMENT.MAX_CHARGE_INTERVAL - BOSS_MOVEMENT.MIN_CHARGE_INTERVAL;
            obj.nextChargeInterval = BOSS_MOVEMENT.MIN_CHARGE_INTERVAL + Math.random() * intervalRange;
        }
    } else {
        // Idle movement - boss sways side to side
        obj.position[2] = BOSS_MOVEMENT.NORMAL_POSITION_Z;
        obj.position[0] = Math.sin(time * 0.8) * (LANE_WIDTH * ((laneCount - 1) / 2));
        // Sync chargeLane with actual position for projectile collision detection
        obj.chargeLane = Math.round(obj.position[0] / LANE_WIDTH);
    }

    obj.chargeWidth = chargeWidth;

    // Calculate damage stage based on boss health for attack speed increase
    // Stage 0: HP > 67% (no bonus)
    // Stage 1: HP <= 67% (+15% attack speed)
    // Stage 2: HP <= 34% (+30% attack speed)
    let damageStage = 0;
    if (isBoss(obj)) {
        const hpRatio = obj.health / obj.maxHealth;
        if (hpRatio <= BOSS_MOVEMENT.DAMAGE_STAGE_2_THRESHOLD) {
            damageStage = 2;
        } else if (hpRatio <= BOSS_MOVEMENT.DAMAGE_STAGE_1_THRESHOLD) {
            damageStage = 1;
        }
    }

    // Calculate dynamic attack interval: base interval / (1 + stage * 0.15)
    // Higher damage = faster attacks (shorter interval)
    const attackSpeedMultiplier = 1 + damageStage * BOSS_MOVEMENT.ATTACK_SPEED_INCREASE;
    const dynamicAttackInterval = BOSS_MOVEMENT.ATTACK_INTERVAL / attackSpeedMultiplier;

    // Boss ammo attack - fires more frequently as HP decreases
    // Stage 0: 1.0s interval, Stage 1: ~0.87s (+15%), Stage 2: ~0.77s (+30%)
    const canShoot = obj.chargePhase === 0 || obj.chargePhase === 1 || obj.chargePhase === 4;
    if (canShoot && obj.attackTimer > dynamicAttackInterval) {
        obj.attackTimer = 0;
        const ammoLane = Math.round(obj.position[0] / LANE_WIDTH);
        const ammoX = ammoLane * LANE_WIDTH;
        newSpawns.push(createBossAmmo(ammoX, 1.0, obj.position[2] + 2, ammoLane));
        hasChanges = true;
    }

    return { hasChanges, newSpawns };
}

/**
 * Get movement amount for an object based on its type
 * Uses centralized constants from types.ts
 */
export function getBaseMovementAmount(
    obj: GameObject,
    dist: number,
    safeDelta: number,
    speed: number
): number {
    switch (obj.type) {
        case ObjectType.PROJECTILE:
            // Player projectiles: 130% road speed (min 45, max 65), Firewall: 150% (min 60, max 80)
            if (isProjectile(obj) && obj.isFirewall) {
                const firewallSpeed = Math.min(Math.max(speed * SPEED_MULTIPLIERS.FIREWALL, 60), 80);
                return -firewallSpeed * safeDelta;
            }
            const projectileSpeed = Math.min(Math.max(speed * SPEED_MULTIPLIERS.PROJECTILE, 45), 65);
            return -projectileSpeed * safeDelta;
        case ObjectType.BOSS_AMMO:
            return speed * safeDelta; // Sync with road speed (100%)
        case ObjectType.SNAKE:
            return dist * SNAKE_MOVEMENT.FORWARD_SPEED_MULT;
        case ObjectType.BOSS:
            return 0;
        case ObjectType.EAGLE:
            return 0; // Handled separately
        case ObjectType.CAT:
            return dist * SPEED_MULTIPLIERS.MOUSETRAP;
        case ObjectType.LETTER:
            return speed * SPEED_MULTIPLIERS.LETTER * safeDelta;
        case ObjectType.POWERUP:
            return speed * SPEED_MULTIPLIERS.POWERUP * safeDelta;
        case ObjectType.CHEESE:
            return dist * SPEED_MULTIPLIERS.CHEESE;
        case ObjectType.MOUSETRAP:
            return dist * SPEED_MULTIPLIERS.MOUSETRAP;
        default:
            return dist * SPEED_MULTIPLIERS.MOUSETRAP;
    }
}

/**
 * Calculate height offset for projectile trajectory during boss fight
 * Projectiles fly in a straight line from bottom upward towards boss belly
 * Linear interpolation from start height to target height
 */
export function calculateProjectileArcHeight(
    currentZ: number,
    startZ: number,
    arcEnabled: boolean
): number {
    if (!arcEnabled) return 0;

    // Boss is at z=-25, projectile starts at z=0
    const BOSS_Z = BOSS_MOVEMENT.NORMAL_POSITION_Z; // -25
    const TARGET_HEIGHT = 2.5; // Boss belly height

    const totalDistance = startZ - BOSS_Z; // Total distance to travel
    const distanceTraveled = startZ - currentZ; // How far we've gone

    if (totalDistance <= 0) return 0;

    // Normalize progress (0 to 1)
    const progress = Math.min(distanceTraveled / totalDistance, 1);

    // Linear interpolation: straight line from 0 to TARGET_HEIGHT
    return TARGET_HEIGHT * progress;
}

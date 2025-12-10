/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Object Pool - Reusable game object pool to reduce GC pressure
 */

import {
    GameObject,
    ObjectType,
    PowerUpType,
    MousetrapObject,
    SnakeObject,
    CatObject,
    EagleObject,
    CheeseObject,
    LetterObject,
    ShopPortalObject,
    ProjectileObject,
    PowerUpObject,
    BossObject,
    BossAmmoObject,
    getSpawnZ
} from '../../../types';

// Pre-allocated ID counter instead of uuid
let idCounter = 0;
const generateId = (): string => `obj_${++idCounter}`;

/**
 * Reset ID counter (call on game restart)
 */
export function resetIdCounter(): void {
    idCounter = 0;
}

/**
 * Object pools for each type
 */
const pools: Map<ObjectType, GameObject[]> = new Map();

// Initialize pools
Object.values(ObjectType).forEach(type => {
    pools.set(type as ObjectType, []);
});

/**
 * Get object from pool or create new one
 * Generates a new unique ID to prevent React key collisions
 */
function getFromPool<T extends GameObject>(type: ObjectType): T | null {
    const pool = pools.get(type);
    if (pool && pool.length > 0) {
        const obj = pool.pop() as T;
        obj.id = generateId(); // Always generate new ID for reused objects
        return obj;
    }
    return null;
}

/**
 * Return object to pool for reuse
 */
export function returnToPool(obj: GameObject): void {
    obj.active = false;
    const pool = pools.get(obj.type);
    if (pool && pool.length < 50) { // Max 50 per type
        pool.push(obj);
    }
}

/**
 * Clear all pools (call on game restart)
 * Note: ID counter is NOT reset to prevent key collisions with lingering React components
 */
export function clearPools(): void {
    pools.forEach(pool => pool.length = 0);
}

/**
 * Get pool statistics for debugging
 */
export function getPoolStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    pools.forEach((pool, type) => {
        stats[type] = pool.length;
    });
    return stats;
}

// ============ Factory functions ============

/**
 * Create or reuse a Mousetrap object
 */
export function createMousetrap(x: number, z: number): MousetrapObject {
    const existing = getFromPool<MousetrapObject>(ObjectType.MOUSETRAP);

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = 0;
        existing.position[2] = z;
        existing.active = true;
        existing.health = 1; // Reset health for reused object
        existing.lastHitTime = undefined;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.MOUSETRAP,
        position: [x, 0, z],
        active: true,
        health: 1
    };
}

/**
 * Create or reuse a Snake object
 */
export function createSnake(
    x: number,
    z: number,
    direction: number,
    startLane: number
): SnakeObject {
    const existing = getFromPool<SnakeObject>(ObjectType.SNAKE);

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = 0;
        existing.position[2] = z;
        existing.active = true;
        existing.health = 1;
        existing.snakeDirection = direction;
        existing.snakeStartLane = startLane;
        existing.lastHitTime = undefined;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.SNAKE,
        position: [x, 0, z],
        active: true,
        health: 1,
        snakeDirection: direction,
        snakeStartLane: startLane
    };
}

/**
 * Create or reuse a Cat object
 */
export function createCat(
    x: number,
    lane: number,
    z: number,
    canSpawnEagle: boolean
): CatObject {
    const existing = getFromPool<CatObject>(ObjectType.CAT);

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = 0;
        existing.position[2] = z;
        existing.active = true;
        existing.health = 2;
        existing.targetLane = lane;
        existing.hasFired = false;
        existing.canSpawnEagle = canSpawnEagle;
        existing.laneChangeTimer = 0;
        existing.isJumping = false;
        existing.jumpProgress = 0;
        existing.jumpStartY = 0;
        existing.jumpTargetLane = lane;
        existing.lastHitTime = undefined;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.CAT,
        position: [x, 0, z],
        active: true,
        health: 2,
        targetLane: lane,
        hasFired: false,
        canSpawnEagle: canSpawnEagle,
        laneChangeTimer: 0,
        isJumping: false,
        jumpProgress: 0,
        jumpStartY: 0,
        jumpTargetLane: lane
    };
}

/**
 * Create or reuse an Eagle object
 */
export function createEagle(x: number, y: number, z: number): EagleObject {
    const existing = getFromPool<EagleObject>(ObjectType.EAGLE);

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = y;
        existing.position[2] = z;
        existing.active = true;
        existing.health = 3;
        existing.eaglePhase = 0;
        existing.eagleDiveCount = 0;
        existing.eagleCircleAngle = 0;
        existing.eagleBaseZ = z;
        existing.eagleDodgeTimer = 0;
        existing.lastHitTime = undefined;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.EAGLE,
        position: [x, y, z],
        active: true,
        health: 3,
        eaglePhase: 0,
        eagleDiveCount: 0,
        eagleCircleAngle: 0,
        eagleBaseZ: z,
        eagleDodgeTimer: 0
    };
}

/**
 * Create or reuse a Cheese object
 */
export function createCheese(lane: number, z: number, points: number, y: number = 1.2): CheeseObject {
    const existing = getFromPool<CheeseObject>(ObjectType.CHEESE);
    const x = lane * 2.2; // LANE_WIDTH

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = y;
        existing.position[2] = z;
        existing.active = true;
        existing.points = points;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.CHEESE,
        position: [x, y, z],
        active: true,
        points
    };
}

/**
 * Create or reuse a Letter object
 */
export function createLetter(
    lane: number,
    z: number,
    value: string,
    color: string,
    targetIndex: number
): LetterObject {
    const existing = getFromPool<LetterObject>(ObjectType.LETTER);
    const x = lane * 2.2; // LANE_WIDTH

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = 1.0;
        existing.position[2] = z;
        existing.active = true;
        existing.value = value;
        existing.color = color;
        existing.targetIndex = targetIndex;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.LETTER,
        position: [x, 1.0, z],
        active: true,
        value,
        color,
        targetIndex
    };
}

/**
 * Create or reuse a Portal object
 */
export function createPortal(): ShopPortalObject {
    const existing = getFromPool<ShopPortalObject>(ObjectType.SHOP_PORTAL);

    if (existing) {
        existing.position[0] = 0;
        existing.position[1] = 0;
        existing.position[2] = -60;
        existing.active = true;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.SHOP_PORTAL,
        position: [0, 0, -60],
        active: true
    };
}

/**
 * Create or reuse a Projectile object
 */
export function createProjectile(x: number, y: number, z: number, isFirewall: boolean = false, arcEnabled: boolean = false): ProjectileObject {
    const existing = getFromPool<ProjectileObject>(ObjectType.PROJECTILE);

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = y;
        existing.position[2] = z;
        existing.active = true;
        existing.isFirewall = isFirewall;
        existing.startZ = z;
        existing.arcEnabled = arcEnabled;
        existing.prevZ = z; // Initialize prevZ for sweep collision
        existing.hasHit = false;
        existing.isFading = false;
        existing.fadeTimer = undefined;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.PROJECTILE,
        position: [x, y, z],
        active: true,
        isFirewall,
        startZ: z,
        arcEnabled,
        prevZ: z // Initialize prevZ for sweep collision
    };
}

/**
 * Create or reuse a PowerUp object
 */
export function createPowerUp(lane: number, z: number, powerUpType: PowerUpType): PowerUpObject {
    const existing = getFromPool<PowerUpObject>(ObjectType.POWERUP);
    const x = lane * 2.2; // LANE_WIDTH

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = 1.0;
        existing.position[2] = z;
        existing.active = true;
        existing.powerUpType = powerUpType;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.POWERUP,
        position: [x, 1.0, z],
        active: true,
        powerUpType
    };
}

/**
 * Create or reuse a Boss object
 * Boss spawns at speed-based Z and moves to z=-25 (isEntering=true during approach)
 * Spawn Z increases with game speed for player reaction time
 */
export function createBoss(health: number, speed: number = 18): BossObject {
    const SPAWN_Z = getSpawnZ('BOSS', speed); // Dynamic spawn Z based on speed
    const existing = getFromPool<BossObject>(ObjectType.BOSS);

    if (existing) {
        existing.position[0] = 0;
        existing.position[1] = 0;
        existing.position[2] = SPAWN_Z;
        existing.active = true;
        existing.health = health;
        existing.maxHealth = health;
        existing.attackTimer = 0;
        existing.chargeTimer = 0;
        existing.isCharging = false;
        existing.chargePhase = 0;
        existing.chargeLane = 0;
        existing.chargeWidth = 1;
        existing.chargeHitPlayer = false;
        existing.nextChargeInterval = 5 + Math.random() * 3;
        existing.holdTimer = 0;
        existing.isDying = false;
        existing.deathTimer = 0;
        existing.deathPhase = 0;
        existing.deathStartZ = 0;
        existing.deathLane = 0;
        existing.lastHitTime = undefined;
        existing.isEntering = true; // Boss is approaching position
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.BOSS,
        position: [0, 0, SPAWN_Z],
        active: true,
        health,
        maxHealth: health,
        attackTimer: 0,
        chargeTimer: 0,
        isCharging: false,
        chargePhase: 0,
        chargeLane: 0,
        chargeWidth: 1,
        chargeHitPlayer: false,
        nextChargeInterval: 5 + Math.random() * 3,
        holdTimer: 0,
        isDying: false,
        deathTimer: 0,
        deathPhase: 0,
        deathStartZ: 0,
        deathLane: 0,
        isEntering: true // Boss is approaching position
    };
}

/**
 * Create or reuse a BossAmmo object
 */
export function createBossAmmo(x: number, y: number, z: number, targetLane: number): BossAmmoObject {
    const existing = getFromPool<BossAmmoObject>(ObjectType.BOSS_AMMO);

    if (existing) {
        existing.position[0] = x;
        existing.position[1] = y;
        existing.position[2] = z;
        existing.active = true;
        existing.targetLane = targetLane;
        existing.health = 1; // Reset health for reused object
        existing.lastHitTime = undefined;
        return existing;
    }

    return {
        id: generateId(),
        type: ObjectType.BOSS_AMMO,
        position: [x, y, z],
        active: true,
        targetLane,
        health: 1
    };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Import ThreeElements to extend JSX namespace for R3F components
import * as THREE from 'three';
import { ThreeElements } from '@react-three/fiber';
import React from 'react';

// Extend Global JSX namespace with proper R3F types
// ThreeElements already provides correct types for most Three.js elements
// We only need to extend for elements not covered by ThreeElements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      // These overrides ensure compatibility when ThreeElements types are incomplete
      // Using ThreeElements types directly when available, Object3DNode for others
      primitive: ThreeElements['primitive'];
    }
  }
}

export enum GameStatus {
  MENU = 'MENU',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  INVENTORY = 'INVENTORY',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  LEVEL_PRELOAD = 'LEVEL_PRELOAD',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  MOUSETRAP = 'MOUSETRAP',
  SNAKE = 'SNAKE',
  CHEESE = 'CHEESE',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  CAT = 'CAT',
  /** Owl enemy - named EAGLE in code for historical reasons */
  EAGLE = 'EAGLE',
  PROJECTILE = 'PROJECTILE',
  POWERUP = 'POWERUP',
  BOSS = 'BOSS',
  BOSS_AMMO = 'BOSS_AMMO',
  /** Visual effect - flying $ on enemy kill */
  MONEY_EFFECT = 'MONEY_EFFECT'
}

// Alias for clarity - Owl is represented by EAGLE in code
export const OWL = ObjectType.EAGLE;

export enum PowerUpType {
    FIREWALL = 'FIREWALL',
    SPEED_BOOST = 'SPEED_BOOST',
    HEART = 'HEART',
    SLOW_MOTION = 'SLOW_MOTION'
}

// Base interface for all game objects
interface GameObjectBase {
  id: string;
  position: [number, number, number];
  active: boolean;
}

// Mousetrap - static obstacle
export interface MousetrapObject extends GameObjectBase {
  type: ObjectType.MOUSETRAP;
  health: number;
  lastHitTime?: number;
}

// Snake - lane-changing enemy
export interface SnakeObject extends GameObjectBase {
  type: ObjectType.SNAKE;
  health: number;
  snakeDirection: number; // 1 = right, -1 = left (legacy, used for initial spawn side)
  snakeStartLane: number;
  targetLane?: number;       // Current target lane for lane-changing movement
  laneChangeTimer?: number;  // Timer for lane change interval
  lastHitTime?: number;
}

// Cat - diagonal moving enemy with jump attack
export interface CatObject extends GameObjectBase {
  type: ObjectType.CAT;
  health: number;
  targetLane: number;
  hasFired: boolean;
  canSpawnEagle: boolean;
  laneChangeTimer: number;
  isJumping: boolean;
  jumpProgress: number;
  jumpStartY: number;
  jumpTargetLane: number;
  snakeDirection?: number;  // Direction for diagonal movement (1=right, -1=left)
  lastHitTime?: number;
}

/**
 * Owl - flying enemy with dive attacks
 * Note: Named "Eagle" in code for historical reasons, but represents an Owl in the game
 */
export interface EagleObject extends GameObjectBase {
  type: ObjectType.EAGLE;
  health: number;
  eaglePhase: number; // 0=circling, 1=diving, 2=retreating
  eagleDiveCount: number;
  eagleCircleAngle: number;
  eagleBaseZ: number;
  eagleDodgeTimer: number;
  targetLane?: number;
  laneChangeTimer?: number;
  lastHitTime?: number;
}

/** Alias for EagleObject - Owl enemy type */
export type OwlObject = EagleObject;

// Cheese collectible
export interface CheeseObject extends GameObjectBase {
  type: ObjectType.CHEESE;
  points: number;
}

// Letter collectible (KAASINO)
export interface LetterObject extends GameObjectBase {
  type: ObjectType.LETTER;
  value: string;
  color: string;
  targetIndex: number;
}

// Shop portal
export interface ShopPortalObject extends GameObjectBase {
  type: ObjectType.SHOP_PORTAL;
}

// Player projectile
export interface ProjectileObject extends GameObjectBase {
  type: ObjectType.PROJECTILE;
  isFirewall?: boolean;
  color?: string;
  // Arc trajectory fields (for boss fight)
  startZ?: number;      // Z position when projectile was spawned
  arcEnabled?: boolean; // Whether arc trajectory is active
  // Fading animation when reaching max distance (only if no hit)
  isFading?: boolean;   // True when projectile reached max distance and showing $
  fadeTimer?: number;   // Time remaining before removal (0.3 sec)
  hasHit?: boolean;     // True if projectile hit any target (no $ shown)
  // Sweep collision - previous Z position for tunneling prevention
  prevZ?: number;       // Z position from previous frame
}

// PowerUp pickup
export interface PowerUpObject extends GameObjectBase {
  type: ObjectType.POWERUP;
  powerUpType: PowerUpType;
}

// Boss enemy
export interface BossObject extends GameObjectBase {
  type: ObjectType.BOSS;
  health: number;
  maxHealth: number;
  attackTimer: number;
  chargeTimer: number;
  isCharging: boolean;
  chargePhase: number; // 0=idle, 1=retreat, 2=charge, 3=return, 4=hold
  chargeLane: number;
  chargeWidth: number;
  chargeHitPlayer: boolean;
  nextChargeInterval: number;
  holdTimer: number;
  isDying: boolean;
  deathTimer: number;
  deathPhase: number; // 0=knockback, 1=falling, 2=landed
  deathStartZ: number;
  deathLane: number;
  deathGroanPlayed?: boolean;
  lastHitTime?: number;
  isEntering?: boolean; // Boss is moving from spawn to normal position (invulnerable, no shooting)
}

// Boss projectile (syringe)
export interface BossAmmoObject extends GameObjectBase {
  type: ObjectType.BOSS_AMMO;
  targetLane: number;
  health: number;
  lastHitTime?: number;
}

// Money effect - flying $ on enemy kill
export interface MoneyEffectObject extends GameObjectBase {
  type: ObjectType.MONEY_EFFECT;
  velocityY: number;    // Upward speed
  lifetime: number;     // Time before removal
  startTime: number;    // Creation timestamp for fade calculation
}

// Discriminated union of all game object types
export type GameObject =
  | MousetrapObject
  | SnakeObject
  | CatObject
  | EagleObject
  | CheeseObject
  | LetterObject
  | ShopPortalObject
  | ProjectileObject
  | PowerUpObject
  | BossObject
  | BossAmmoObject
  | MoneyEffectObject;

// Type guards for runtime type checking
export function isSnake(obj: GameObject): obj is SnakeObject {
  return obj.type === ObjectType.SNAKE;
}

export function isCat(obj: GameObject): obj is CatObject {
  return obj.type === ObjectType.CAT;
}

/** Check if object is an Owl - named isEagle for historical reasons */
export function isEagle(obj: GameObject): obj is EagleObject {
  return obj.type === ObjectType.EAGLE;
}

/** Alias for isEagle - checks if object is an Owl */
export const isOwl = isEagle;

export function isBoss(obj: GameObject): obj is BossObject {
  return obj.type === ObjectType.BOSS;
}

export function isLetter(obj: GameObject): obj is LetterObject {
  return obj.type === ObjectType.LETTER;
}

export function isCheese(obj: GameObject): obj is CheeseObject {
  return obj.type === ObjectType.CHEESE;
}

export function isPowerUp(obj: GameObject): obj is PowerUpObject {
  return obj.type === ObjectType.POWERUP;
}

export function isProjectile(obj: GameObject): obj is ProjectileObject {
  return obj.type === ObjectType.PROJECTILE;
}

export function isBossAmmo(obj: GameObject): obj is BossAmmoObject {
  return obj.type === ObjectType.BOSS_AMMO;
}

export interface LevelStats {
    shotsFired: number;
    totalRewards: number; // Total reward multipliers on this level (for FIREWALL spawn every 50 rewards)
    trapsDestroyed: number;
    trapsEarnings: number;
    snakesDestroyed: number;
    snakesEarnings: number;
    catsDestroyed: number;
    catsEarnings: number;
    eaglesDestroyed: number;
    eaglesEarnings: number;
    syringesDestroyed: number;
    syringesEarnings: number;
    cheeseCollected: number;
    cheesePoints: number; // Total value of cheese collected
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 18.0; // Reduced by 20% from 22.5
export const SPAWN_DISTANCE = 120; // Legacy - use SPAWN_DISTANCES for per-type values
export const REMOVE_DISTANCE = 20; // Behind player

// Per-object-type spawn distances (base values at RUN_SPEED_BASE)
// Closer spawn = better performance (fewer objects in scene)
export const SPAWN_DISTANCES = {
    BOSS: -90,           // Boss spawns furthest
    COLLECTIBLES: -85,   // Letters, cheese, traps, power-ups
    ENEMY: -80,          // Snakes, Cats, Owls
} as const;

// Speed-based spawn distance scaling
// Each 1 m/s above base speed = spawn X meters further
export const SPAWN_SPEED_FACTOR = 1.5;

// Helper function to get spawn Z based on current speed
export type SpawnType = 'BOSS' | 'COLLECTIBLES' | 'ENEMY';

export function getSpawnZ(type: SpawnType, speed: number): number {
    const baseZ = SPAWN_DISTANCES[type];
    const speedDelta = Math.max(0, speed - RUN_SPEED_BASE);
    return baseZ - speedDelta * SPAWN_SPEED_FACTOR;
}

// Colors for KAASINO (7 letters) - Amber 400 (#FBBF24)
export const GEMINI_COLORS = [
    '#FBBF24', // K - Amber
    '#FBBF24', // A - Amber
    '#FBBF24', // A - Amber
    '#FBBF24', // S - Amber
    '#FBBF24', // I - Amber
    '#FBBF24', // N - Amber
    '#FBBF24', // O - Amber
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    details: string; // Detailed explanation
    cost: number;
    currency: 'POINTS' | 'EURO';
    priceType: 'FIXED' | 'BET_MULTIPLIER';
    icon: React.ComponentType<{ className?: string }>; // Lucide-compatible icon component
    emoji?: string; // Optional emoji to display instead of icon
    oneTime?: boolean; // If true, remove from pool after buying
    immediate?: boolean; // If true, activates immediately on buy
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { speedMultiplier: 0.75, scoreMultiplier: 0.5, label: 'EASY' },
  [Difficulty.MEDIUM]: { speedMultiplier: 1.0, scoreMultiplier: 1.0, label: 'MEDIUM' },
  [Difficulty.HARD]: { speedMultiplier: 1.25, scoreMultiplier: 2.0, label: 'HARD' },
};

// Starting speed by level (MEDIUM base values)
// EASY: -1 from MEDIUM, HARD: +1 from MEDIUM
const LEVEL_START_SPEEDS_MEDIUM = [18, 19.5, 21, 22.5, 24]; // levels 1-5

// Speed increase per letter by level (MEDIUM base values)
// EASY: -0.5 from MEDIUM, HARD: +0.5 from MEDIUM
const LETTER_SPEED_INCREASE_MEDIUM = [1, 1.5, 2, 2.5, 3]; // levels 1-5

export function getLevelStartSpeed(level: number, difficulty: Difficulty): number {
  const levelIndex = Math.min(Math.max(level - 1, 0), 4);
  const baseSpeed = LEVEL_START_SPEEDS_MEDIUM[levelIndex];
  const difficultyOffset = difficulty === Difficulty.EASY ? -1 : (difficulty === Difficulty.HARD ? 1 : 0);
  return baseSpeed + difficultyOffset;
}

export function getLetterSpeedIncrease(level: number, difficulty: Difficulty): number {
  const levelIndex = Math.min(Math.max(level - 1, 0), 4);
  const baseIncrease = LETTER_SPEED_INCREASE_MEDIUM[levelIndex];
  const difficultyOffset = difficulty === Difficulty.EASY ? -0.5 : (difficulty === Difficulty.HARD ? 0.5 : 0);
  return baseIncrease + difficultyOffset;
}

// Custom Event Types for type-safe event handling
export interface ParticleBurstPayload {
    position: [number, number, number];
    color: string;
    amount?: number; // Optional particle count (default: 40)
    intensity?: number; // Optional velocity multiplier (default: 1)
}

export interface PlayerShootPayload {
    position: [number, number, number];
}

export interface JoystickMovePayload {
    direction: 'left' | 'right';
}

export type ParticleBurstEvent = CustomEvent<ParticleBurstPayload>;
export type PlayerShootEvent = CustomEvent<PlayerShootPayload>;
export type JoystickMoveEvent = CustomEvent<JoystickMovePayload>;
export type PlayerHitEvent = Event;
export type PlayerJumpEvent = Event;

// Event name constants
export const GameEvents = {
    PARTICLE_BURST: 'particle-burst',
    PLAYER_SHOOT: 'player-shoot',
    PLAYER_HIT: 'player-hit',
    PLAYER_JUMP: 'player-jump',
    JOYSTICK_MOVE: 'joystick-move',
    UI_SHOOT_PRESS: 'ui-shoot-press',
    UI_SHOOT_RELEASE: 'ui-shoot-release',
} as const;

// Camera constants
export const CAMERA_HEIGHT_FACTOR_MOBILE = 2.0;
export const CAMERA_HEIGHT_FACTOR_DESKTOP = 0.5;
export const CAMERA_DIST_FACTOR_MOBILE = 4.5;
export const CAMERA_DIST_FACTOR_DESKTOP = 1.0;
export const CAMERA_BASE_Y = 5.5;
export const CAMERA_BASE_Z = 8.0;
export const CAMERA_LOOK_Y = 1.2;

// Physics constants
export const GRAVITY = 50;
export const JUMP_FORCE = 16;

// Animation constants
export const SPRING_STIFFNESS = 100;
export const SPRING_DAMPING = 24;
export const MAX_LATERAL_VELOCITY = 12;
export const INVINCIBILITY_DURATION = 1500; // ms

// Spawning constants
export const BASE_LETTER_INTERVAL = 150;
export const LETTER_INTERVAL_MULTIPLIER = 1.5;

// Enemy speeds
export const EAGLE_SPEED = 13.2; // +10% from base 12
export const PROJECTILE_SPEED = 50; // Legacy fixed speed (unused - now uses road-relative)
export const BOSS_AMMO_SPEED = 15; // Legacy fixed speed (unused - now syncs with road)

// Object speed multipliers (relative to road speed)
export const SPEED_MULTIPLIERS = {
    LETTER: 0.75,           // Letters move at 75% of road speed
    POWERUP: 0.85,          // Power-ups move at 85% of road speed
    PROJECTILE: 2.50,       // Player projectiles: 250% road speed (clamped 45-65)
    FIREWALL: 3.00,         // Firewall: 300% road speed (clamped 60-80)
    CHEESE: 0.90,           // Cheese moves at 90% of road speed
    MOUSETRAP: 0.90         // Mousetrap moves at 90% of road speed (default)
} as const;

// Eagle movement constants
export const EAGLE_MOVEMENT = {
    SLOW_SPEED_MULT: 0.9,       // Multiplier of base speed during approach
    FAST_SPEED_MULT: 1.1,       // Multiplier during dive
    RETREAT_SPEED_MULT: 1.2,    // Multiplier during retreat
    HIGH_HEIGHT: 5.0,           // Circling altitude
    DIVE_HEIGHT: 1.5,           // Attack altitude
    DESCENT_START_Z: -50,       // Z where descent begins
    REACHABLE_Z: -45,           // Z where player can shoot
    DIVE_Z: -15,                // Z where final dive begins
    RETREAT_Z: -50,             // Z to retreat to
    DODGE_INTERVAL: 1.0,        // Seconds between dodges
    MAX_DIVES: 3,               // Dives before leaving
    LATERAL_SPEED_MULT: 0.20,   // Lateral movement multiplier
    DIVE_LATERAL_SPEED_MULT: 0.30  // Lateral speed during dive
} as const;

// Cat movement constants
export const CAT_MOVEMENT = {
    LATERAL_SPEED_MULT: 0.10,   // Diagonal movement speed multiplier (10% of road speed)
    JUMP_TRIGGER_Z: -7.5,       // Z position to start jump
    JUMP_HEIGHT: 2.5,           // Max jump height
    JUMP_DURATION: 0.4          // Jump duration in seconds
} as const;

// Snake movement constants
export const SNAKE_MOVEMENT = {
    LANE_CHANGE_INTERVAL: 1.0,  // Seconds between lane changes
    LATERAL_SPEED_MULT: 0.18,   // Lateral movement speed multiplier
    FORWARD_SPEED_MULT: 0.85    // Forward movement speed multiplier
} as const;

// Boss movement constants
export const BOSS_MOVEMENT = {
    SPAWN_POSITION_Z: -75,      // Z position where boss spawns (far away)
    BACK_POSITION_Z: -45,       // Z position when retreating for charge
    NORMAL_POSITION_Z: -25,     // Normal hovering Z position
    ENTER_SPEED_MULT: 1.0,      // Speed multiplier when entering (100% road speed)
    CHARGE_SPEED_MULT: 3.0,     // Speed multiplier during charge
    RETREAT_SPEED_MULT: 1.1,    // Speed multiplier when retreating
    RETURN_SPEED_MULT: 1.35,    // Speed multiplier returning to position
    LATERAL_SPEED_MULT: 0.20,   // Lateral movement speed multiplier (20% of road speed)
    KNOCKBACK_TARGET_Z: -30,    // Z position during death knockback
    KNOCKBACK_DURATION: 0.8,    // Death knockback duration
    FALL_DURATION: 1.0,         // Death fall duration
    MIN_CHARGE_INTERVAL: 10,    // Minimum seconds between charges
    MAX_CHARGE_INTERVAL: 20,    // Maximum seconds between charges
    HOLD_MIN_DURATION: 1.0,     // Min hold time after charge
    HOLD_MAX_DURATION: 2.0,     // Max hold time after charge
    ATTACK_INTERVAL: 1.15,      // Seconds between ammo shots (base, +15% slower)
    // Damage stage thresholds (HP ratio)
    DAMAGE_STAGE_1_THRESHOLD: 0.67, // First stage at 33% HP lost
    DAMAGE_STAGE_2_THRESHOLD: 0.34, // Second stage at 66% HP lost
    ATTACK_SPEED_INCREASE: 0.15     // +15% attack speed per damage stage
} as const;

// Enemy health
export const ENEMY_HEALTH = {
    MOUSETRAP: 1,
    SNAKE: 1,
    CAT: 2,
    EAGLE: 3,
    BOSS_BASE: 20,
    BOSS_PER_LEVEL: 10
} as const;

// Reward multipliers
export const REWARD_MULTIPLIER = {
    TRAP: 1,
    SNAKE: 2,
    CAT: 3,
    EAGLE: 5,
    SYRINGE: 1,
    BOSS: 1.2 // 120% of max HP
} as const;

// Cheese Fever rewards (cheese pieces for colliding with enemies)
export const CHEESE_FEVER_REWARD = {
    TRAP: 1,
    SNAKE: 2,
    CAT: 3,
    EAGLE: 5
} as const;

// Hitbox sizes and collision constants
export const HITBOX = {
    PLAYER_HEIGHT: 1.8,
    MOUSETRAP: { bottom: 0, top: 0.5 },
    SNAKE: { bottom: 0, top: 0.6 },
    CAT: { bottom: 0, top: 1.0 },
    EAGLE: { bottom: 1.0, top: 2.5 },
    BOSS_AMMO: { bottom: 0.5, top: 2.5 },
    BOSS_Z: 3.0,
    DEFAULT_Z: 2.0,
    // Collision detection thresholds
    PLAYER_COLLISION_Z_THRESHOLD: 2.0,  // Z-axis proximity for player collisions
    PLAYER_COLLISION_X_THRESHOLD: 0.9,  // X-axis (lane) proximity for player collisions
    PROJECTILE_MAX_Z: -50,              // Normal projectile disappears beyond this Z
    FIREWALL_MAX_Z: -65,                // Firewall projectile disappears beyond this Z
    PICKUP_Y_THRESHOLD: 2.5,            // Max Y distance for pickup collection
    CHEESE_FEVER_HITBOX_TOP: 4.0        // Extended hitbox during Cheese Fever
} as const;

// Spawn thresholds
export const SPAWN_THRESHOLD = {
    SNAKE_INTERVAL: 15,
    SNAKE_INTERVAL_CHASING: 10,
    CAT_INTERVAL: 100,      // Base cat spawn every 100 mousetraps (in addition to kill triggers)
    EAGLE_INTERVAL: 200,    // Base eagle spawn every 200 mousetraps (in addition to kill triggers)
    // Instant spawn triggers (all enemies available from start)
    SNAKES_PER_CAT: 2,      // 1 cat spawns instantly after every 2 snake kills
    CATS_PER_EAGLE: 1,      // 1 eagle spawns instantly after every cat kill
    FIREWALL_REWARD_INTERVAL: 50,
    HEART_COOLDOWN_MS: 45000,
    SPEED_BOOST_CHANCE: 0.03,
    SLOW_MOTION_CHANCE: 0.015  // Half of SPEED_BOOST_CHANCE
} as const;

// Power-up durations (ms)
export const POWERUP_DURATION = {
    FIREWALL: 10000,
    SPEED_BOOST: 5000,
    IMMORTALITY: 5000,
    CHEESE_FEVER: 20000,
    SLOW_MOTION: 15000
} as const;

// Level progression
export const LEVEL_CONFIG = {
    MAX_LEVEL: 5,
    INITIAL_LIVES: 5,
    INITIAL_LANES: 3,
    SPEED_INCREASE_PER_LETTER: 0.05,
    SPEED_INCREASE_PER_LEVEL: 0.30,
    INITIAL_BALANCE: 100.0,
    MIN_BET: 0.1,
    MAX_BET: 50
} as const;

// Touch/swipe input constants
export const TOUCH_CONFIG = {
    SWIPE_THRESHOLD_X: 30,      // Minimum horizontal swipe distance (px)
    SWIPE_THRESHOLD_Y: 30,      // Minimum vertical swipe distance (px)
    MAX_SWIPE_TIME: 300,        // Maximum time for a swipe gesture (ms)
    SWIPE_DOWN_THRESHOLD: 50,   // Minimum swipe down distance to close inventory (px)
    DOUBLE_TAP_THRESHOLD: 1500  // Maximum time between taps for double-tap (ms)
} as const;

// Lane bounds utility - calculates min/max lane indices for given lane count
export interface LaneBounds {
    min: number;
    max: number;
}

export function getLaneBounds(laneCount: number): LaneBounds {
    return {
        min: -Math.floor((laneCount - 1) / 2),
        max: Math.ceil((laneCount - 1) / 2)
    };
}

// Boss death slowdown constants (used in LevelManager)
export const BOSS_DEATH_CONFIG = {
    SLOWDOWN_START_Z: -50,      // Z position where slowdown begins
    SLOWDOWN_END_Z: -15,        // Z position where slowdown completes
    TARGET_SPEED: 10            // Target speed after boss death (m/s)
} as const;

// Camera configuration constants
export const CAMERA_CONFIG = {
    EYE_HEIGHT: 1.7,            // First-person camera eye height
    LERP_SPEED: 12.0,           // Camera interpolation speed
    FPS_FOV: 75,                // First-person field of view
    DEFAULT_FOV: 60             // Default third-person field of view
} as const;

// Collision detection constants (additional)
export const COLLISION_CONFIG = {
    BOSS_CHARGE_DISTANCE: 3.0,  // Z distance for boss charge hit detection
    PORTAL_TRIGGER_DISTANCE: 2, // Z distance to trigger portal entry
    DELTA_CAP: 0.05             // Max delta time to prevent physics explosions
} as const;

// Animation timing constants
export const ANIMATION_CONFIG = {
    BASE_ANIM_SPEED_RUNNING: 20,
    BASE_ANIM_SPEED_IDLE: 3,
    MIN_SPEED_MULTIPLIER: 0.5,
    MAX_SPEED_MULTIPLIER: 2.0,
    SPIN_SPEED: 15              // Double jump spin speed
} as const;

// Default spawn Z when no objects present
export const DEFAULT_SPAWN_Z = -20;
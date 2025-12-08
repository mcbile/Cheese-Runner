/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Store types and interfaces for Zustand state management
 * @module store/types
 */

import { GameStatus, Difficulty, LevelStats, PowerUpType } from '../types';

/**
 * Game flow state slice
 * Handles game status, difficulty, and audio settings
 */
export interface GameFlowSlice {
    /** Current game status (MENU, PLAYING, PAUSED, etc.) */
    status: GameStatus;
    /** Previous status for returning from shop/inventory */
    lastGameStatus: GameStatus;
    /** Selected difficulty mode */
    difficulty: Difficulty;
    /** Audio mute state */
    isMuted: boolean;

    /** Set game status directly */
    setStatus: (status: GameStatus) => void;
    /** Change difficulty setting */
    setDifficulty: (diff: Difficulty) => void;
    /** Toggle audio mute */
    toggleMute: () => void;
    /** Pause the game */
    pauseGame: () => void;
    /** Resume from pause */
    resumeGame: () => void;
    /** Return to main menu */
    quitToMenu: () => void;
    /** Return to menu from victory (keeps score, inventory, balance, chasingSnakes, maxLives) */
    quitToMenuFromVictory: () => void;
}

/**
 * Game progress state slice
 * Handles scoring, lives, speed, and level progression values
 */
export interface GameProgressSlice {
    /** Player's current score (points) */
    score: number;
    /** Current number of lives */
    lives: number;
    /** Maximum lives (increases per level) */
    maxLives: number;
    /** Current game speed (units per second) */
    speed: number;
    /** Current level (1-5) */
    level: number;
    /** Number of lanes on current level */
    laneCount: number;
    /** Total cheese collected this run */
    gemsCollected: number;
    /** Distance traveled in current run */
    distance: number;

    /** Add points to score */
    addScore: (amount: number) => void;
    /** Update distance traveled */
    setDistance: (dist: number) => void;
    /** Handle player damage (reduces lives or triggers game over) */
    takeDamage: () => void;
    /** Set game speed directly */
    setSpeed: (speed: number) => void;
}

/**
 * Player position and abilities slice
 */
export interface PlayerStateSlice {
    /** Current lane position */
    playerLane: number;
    /** Current Y position (for FPS camera) */
    playerY: number;
    /** Indices of collected KAASINO letters */
    collectedLetters: number[];
    /** Has double jump ability */
    hasDoubleJump: boolean;
    /** Has immortality skill (purchased) */
    hasImmortality: boolean;
    /** Immortality skill currently active */
    isImmortalityActive: boolean;

    /** Update player lane position */
    setPlayerLane: (lane: number) => void;
    /** Update player Y position */
    setPlayerY: (y: number) => void;
    /** Collect a letter (by target index 0-6) */
    collectLetter: (index: number) => void;
    /** Activate immortality skill (5 second duration) */
    activateImmortality: () => void;
}

/**
 * Economy and betting system slice
 * Handles player balance, bets, and kill rewards
 */
export interface EconomySlice {
    /** Current Euro balance */
    balance: number;
    /** Current bet amount per shot (0.1-50€) */
    betAmount: number;
    /** Statistics for current level */
    levelStats: LevelStats;

    /** Set bet amount (clamped to min/max) */
    setBetAmount: (amount: number) => void;
    /** Attempt to shoot (deducts bet, returns true if affordable) */
    attemptShoot: () => boolean;
    /** Apply reward multiplier to balance */
    applyReward: (multiplier: number) => void;
    /** Record enemy kill with earnings */
    recordKill: (type: 'TRAP' | 'SNAKE' | 'CAT' | 'EAGLE' | 'SYRINGE' | 'BOSS', reward: number) => void;
    /** Collect cheese/gem with point value */
    collectGem: (value: number) => void;
}

/**
 * Inventory management slice
 * Handles player's consumable items storage and usage
 */
export interface InventorySlice {
    /** Map of item type to quantity owned */
    inventory: Record<string, number>;

    /** Purchase item from shop (returns false if insufficient funds) */
    buyItem: (type: string, cost: number, currency: 'POINTS' | 'EURO') => boolean;
    /** Use one consumable item of given type */
    consumeItem: (type: string) => void;
    /** Open inventory UI overlay */
    openInventory: () => void;
    /** Close inventory UI overlay */
    closeInventory: () => void;
}

/**
 * Power-up state slice
 * Tracks active temporary abilities and perks
 */
export interface PowerUpSlice {
    /** Firewall active (shoots extra projectiles) */
    isFirewallActive: boolean;
    /** Timestamp when firewall ends */
    firewallEndTime: number;
    /** Speed boost active (faster movement) */
    isSpeedBoostActive: boolean;
    /** Timestamp when speed boost ends */
    speedBoostEndTime: number;
    /** Cheese fever active (enemies become collectible cheese) */
    isCheeseFeverActive: boolean;
    /** Timestamp when cheese fever ends */
    cheeseFeverEndTime: number;
    /** Slow motion active */
    isSlowMotionActive: boolean;
    /** Timestamp when slow motion ends */
    slowMotionEndTime: number;
    /** Enemy Rush active (spawns 1 snake, 1 cat, 1 owl then deactivates) */
    chasingSnakesActive: boolean;
    /** Enemy Rush progress: tracks which enemies have been spawned (snake, cat, owl) */
    enemyRushProgress: { snake: boolean; cat: boolean; owl: boolean };
    /** Deactivate Enemy Rush after all enemies spawned */
    deactivateEnemyRush: () => void;
    /** Mark enemy as spawned in Enemy Rush */
    markEnemyRushSpawned: (enemy: 'snake' | 'cat' | 'owl') => void;

    /** Collect and activate a power-up pickup */
    collectPowerUp: (type: PowerUpType) => void;
}

/**
 * Boss fight state slice
 * Manages boss encounters and death sequences
 */
export interface BossSlice {
    /** All KAASINO letters collected, boss phase triggered */
    wordCompleted: boolean;
    /** Boss health reduced to zero */
    bossDefeated: boolean;
    /** Boss death animation in progress */
    bossDying: boolean;
    /** Boss death animation complete, portal spawned */
    bossDeathComplete: boolean;
    /** Boss entity currently active in scene */
    isBossActive: boolean;
    /** Current boss health points */
    bossHealth: number;
    /** Maximum boss health (scales with level) */
    bossMaxHealth: number;
    /** Unique ID for current boss instance */
    bossSpawnId: number;
    /** Boss charge phase for attack warning (0=idle, 1=retreat/warning, 2=charge, 3=return, 4=hold) */
    bossChargePhase: number;
    /** Target lane for boss charge attack */
    bossChargeLane: number;
    /** Width of charge attack in lanes */
    bossChargeWidth: number;

    /** Activate boss with specified max health */
    setBossActive: (active: boolean, maxHp: number) => void;
    /** Update boss health after damage */
    updateBossHealth: (hp: number) => void;
    /** Mark boss as defeated, start death sequence */
    defeatBoss: () => void;
    /** Signal death animation complete */
    completeBossDeath: () => void;
    /** Update boss charge attack state for lane warning display */
    updateBossChargeState: (phase: number, lane: number, width: number) => void;
}

/**
 * Level progression slice
 * Controls game flow transitions and level advancement
 */
export interface LevelSlice {
    /** Start new game from menu */
    startGame: () => void;
    /** Reset and restart from level 1 */
    restartGame: () => void;
    /** Restart current level (keeps score, inventory, shots) */
    restartLevel: () => void;
    /** Start again from victory (keeps score, inventory, balance, betAmount, chasingSnakes, maxLives>=5) */
    startAgainFromVictory: () => void;
    /** Trigger level complete sequence (after portal entry) */
    triggerLevelComplete: () => void;
    /** Advance to next level (increases speed, lanes) */
    startNextLevel: () => void;
    /** Transition from LEVEL_PRELOAD to COUNTDOWN */
    startLevelFromPreload: () => void;
    /** Open shop UI overlay */
    openShop: () => void;
    /** Close shop UI overlay */
    closeShop: () => void;
    /** Back to level complete stats from shop */
    backToStats: () => void;
}

/**
 * Debug and development slice
 * Testing utilities and cheat functions (dev only)
 */
export interface DebugSlice {
    /** Developer console visible */
    isDevMode: boolean;
    /** Developer mode authenticated with password */
    isDevAuthenticated: boolean;
    /** Invincibility cheat enabled */
    isGodMode: boolean;
    /** First person camera mode (desktop only) */
    isFirstPersonMode: boolean;

    /** Toggle developer console visibility */
    toggleDevMode: () => void;
    /** Authenticate developer mode with password */
    authenticateDev: (password: string) => boolean;
    /** Toggle first person camera mode */
    toggleFirstPersonMode: () => void;
    /** Force game status change */
    debugSetStatus: (status: GameStatus) => void;
    /** Add points to score */
    debugAddScore: (amount: number) => void;
    /** Add euros to balance */
    debugAddBalance: (amount: number) => void;
    /** Add lives (+1) */
    debugAddLife: () => void;
    /** Fill inventory with all consumables */
    debugFillInventory: () => void;
    /** Toggle god mode (invincibility) */
    toggleGodMode: () => void;
    /** Set god mode state directly */
    setGodMode: (enabled: boolean) => void;
    /** Force boss spawn at current position */
    debugSpawnBoss: () => void;
    /** Jump to specific level (1-5) */
    debugJumpToLevel: (level: number) => void;
    /** Set boss defeated state */
    debugSetBossDefeated: (defeated: boolean) => void;
    /** Spawn all enemy types (snake, cat, owl) immediately */
    debugSpawnEnemies: () => void;
    /** Counter to trigger enemy spawn in LevelManager */
    debugEnemySpawnId: number;
    /** Force portal spawn (sets bossDeathComplete) */
    debugSpawnPortal: () => void;
    /** Collect all letters except O (indices 0-5) */
    debugCollectLetters: () => void;
    /** Set game speed directly (0.1 - 999 m/s) */
    debugSetSpeed: (speed: number) => void;
    /** Start game directly from dev console with current settings */
    debugStartGame: (targetLevel: number, targetSpeed: number, godMode: boolean) => void;
    /** Apply changes to currently running game (speed, godMode only) */
    debugApplyToCurrentGame: (targetSpeed: number, godMode: boolean) => void;
}

/**
 * Combined game store type
 * Intersection of all state slices for complete store access
 */
export type GameStore = GameFlowSlice &
    GameProgressSlice &
    PlayerStateSlice &
    EconomySlice &
    InventorySlice &
    PowerUpSlice &
    BossSlice &
    LevelSlice &
    DebugSlice;

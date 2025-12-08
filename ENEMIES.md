# Enemies Documentation

## Overview

This document describes all enemies in Cheese Runner, including their components, sizes, HP, rewards, spawn intervals, and movement patterns.

---

## 1. MOUSETRAP (Static Obstacle)

### Stats
| Property | Value |
|----------|-------|
| HP | 1 |
| Reward | 1x bet |
| Spawn Interval | Base spawning (1-3 per spawn) |
| Movement | Static (no movement) |

### Unlock Condition
- Available from the start

### Spawn Pattern
- 50% chance: 1 mousetrap
- 30% chance: 2 mousetraps
- 20% chance: 3 mousetraps
- 50% chance to spawn cheese on top (height 1.2)

### Geometry Components (Scale: 0.7125)
| Component | Geometry | Size |
|-----------|----------|------|
| Base | BoxGeometry | 2.0 x 0.30 x 3.0 |
| Base Top | BoxGeometry | 1.8 x 0.10 x 2.8 |
| Front Edge | CylinderGeometry | r=0.12, h=2.2 |
| Side Rails | TorusGeometry | r=1.19, tube=0.04 (15% shorter) |
| Top Bar | CylinderGeometry | r=0.04, h=1.6 |
| Kill Bar | TorusGeometry | r=0.9, tube=0.06 |
| Spring Coils | TorusGeometry | r=0.15, tube=0.025 |
| Trigger Plate | BoxGeometry | 0.6 x 0.06 x 0.8 |
| Trigger Arm | BoxGeometry | 0.08 x 0.04 x 1.2 |
| Lock Bar | BoxGeometry | 0.05 x 0.05 x 1.6 |
| Hook | TorusGeometry | r=0.08, tube=0.02 |
| Bait Pedal | CylinderGeometry | r=0.25, h=0.04 |
| Staples | TorusGeometry | r=0.1, tube=0.02 |
| Wires | CylinderGeometry | r=0.015, h=0.5 |
| Plank Lines | BoxGeometry | 1.8 x 0.02 x 0.02 |

### Materials
- Wood: #C4883A (roughness: 0.85, metalness: 0.05)
- Wood Dark: #8B5A2B (roughness: 0.9, metalness: 0.0)
- Metal: #C0C0C0 (roughness: 0.15, metalness: 0.95)
- Metal Dark: #A8A8A8 (roughness: 0.2, metalness: 0.9)

### Hitbox
- Bottom: 0
- Top: 0.5

---

## 2. SNAKE (Diagonal Moving Enemy)

### Stats
| Property | Value |
|----------|-------|
| HP | 1 |
| Reward | 2x bet |
| Spawn Interval | Every 15 mousetraps (10 with Chasing Snakes perk) |
| Movement | Diagonal (edge-to-edge bouncing) |
| Availability | Always available from start |

### Movement Pattern
- Spawns at left or right edge (random)
- Moves diagonally across lanes
- Lateral speed: 10% of game speed
- Bounces off lane boundaries
- Moves forward with game speed

### Geometry Components
| Component | Geometry | Size |
|-----------|----------|------|
| Body Segments | CapsuleGeometry | r=0.15, h=0.6 |
| Head | SphereGeometry | r=0.2 |
| Eyes | SphereGeometry | r=0.05 |
| Tongue | BoxGeometry | 0.02 x 0.01 x 0.2 |
| Tongue Fork | BoxGeometry | 0.015 x 0.01 x 0.08 |

### Hitbox
- Bottom: 0
- Top: 0.6

### Object Properties
```typescript
{
  type: ObjectType.SNAKE,
  health: number,
  snakeDirection: number,  // 1 = right, -1 = left
  snakeStartLane: number,
  lastHitTime?: number
}
```

---

## 3. CAT (Lane-Changing Enemy)

### Stats
| Property | Value |
|----------|-------|
| HP | 2 |
| Reward | 3x bet |
| Spawn Interval | Instant after each 2 snakes killed |
| Movement | Lane-changing with jump attacks |
| Availability | Always available from start |

### Spawn Pattern
- Pattern: 1-1-1-2 (every 4th spawn is double)
- Every 2nd cat can spawn an Eagle

### Movement Pattern (3 Phases)
1. **Before Z=-10**: Random lane dodging every 2 seconds
   - Lateral speed: 15% of game speed
   - Checks for lane collisions before moving

2. **At Z=-10**: Targets lane adjacent to player
   - Prepares for jump attack

3. **Jump Attack**: Jumps to player's lane
   - Jump height: 2.0 units
   - Jump duration: 0.5 seconds
   - Uses sine curve for arc

### Speed
- 1.05x game speed (5% faster than base)

### Geometry Components
| Component | Geometry | Size |
|-----------|----------|------|
| Body | CapsuleGeometry | r=0.35, h=1.0 |
| Head | SphereGeometry | r=0.4 |
| Ears | ConeGeometry | r=0.15, h=0.3 |
| Legs | CapsuleGeometry | r=0.1, h=0.5 |
| Tail | CylinderGeometry | r1=0.05, r2=0.02, h=0.8 |
| Eyes | SphereGeometry | r=0.1 |
| Jaw | CapsuleGeometry | r=0.25, h=0.4 |
| Mouth Interior | SphereGeometry | r=0.2 |

### Hitbox
- Bottom: 0
- Top: 1.0

### Object Properties
```typescript
{
  type: ObjectType.CAT,
  health: number,
  targetLane: number,
  hasFired: boolean,
  canSpawnEagle: boolean,
  laneChangeTimer: number,
  isJumping: boolean,
  jumpProgress: number,
  jumpStartY: number,
  jumpTargetLane: number,
  lastHitTime?: number
}
```

---

## 4. EAGLE (Flying Enemy)

### Stats
| Property | Value |
|----------|-------|
| HP | 3 |
| Reward | 5x bet |
| Spawn | Instant after each cat killed + Spawned by every 2nd cat |
| Movement | Dive attack pattern |
| Availability | Always available from start |

### Movement Pattern (3 Phases)

#### Phase 0: APPROACHING
- Flies to Z=-50 at high altitude (5.0 units)
- Lerps position smoothly

#### Phase 1: DIVING
- **Z < -45**: Slow speed (0.9x game speed), descends from 5.0 to 1.5 height
- **Z >= -45 and Z < -15**: Dodges left/right every 1.0 seconds
  - Lateral speed: 20% of game speed
- **Z >= -15**: Locks onto player lane
  - Lateral speed: 30% of game speed
  - Fast dive speed (1.1x game speed)

#### Phase 2: RETREATING
- Triggered after passing player (player.z + 5)
- Retreats at 1.2x game speed
- Rises back to high altitude
- Returns to Z=-50, then repeats Phase 1

### Max Dives
- 3 dives before disappearing

### Constants
```typescript
EAGLE_HIGH_HEIGHT = 5.0
EAGLE_DIVE_HEIGHT = 1.5
EAGLE_DESCENT_START_Z = -50
EAGLE_REACHABLE_Z = -45
EAGLE_DIVE_Z = -15
EAGLE_RETREAT_Z = -50
EAGLE_DODGE_INTERVAL = 1.0
MAX_DIVES = 3
```

### Geometry Components
| Component | Geometry | Size |
|-----------|----------|------|
| Body | ConeGeometry | r=0.3, h=1.2 |
| Wings | BoxGeometry | 1.5 x 0.1 x 0.5 |
| Head | SphereGeometry | r=0.25 |
| Beak | ConeGeometry | r=0.1, h=0.3 |

### Hitbox
- Bottom: 1.0
- Top: 2.5

### Object Properties
```typescript
{
  type: ObjectType.EAGLE,
  health: number,
  eaglePhase: number,      // 0=approaching, 1=diving, 2=retreating
  eagleDiveCount: number,
  eagleCircleAngle: number,
  eagleBaseZ: number,
  eagleDodgeTimer: number,
  lastHitTime?: number
}
```

---

## 5. BOSS (Scientist / Ученый)

### Stats
| Property | Value |
|----------|-------|
| Base HP | 20 + (level - 1) * 10 |
| HP by Level | L1: 20, L2: 30, L3: 40, L4: 50, L5: 60 |
| Reward | 1.2x maxHealth × bet (120% of total HP) |
| Spawn | After collecting all 7 KAASINO letters |

### Positions
```typescript
BOSS_BACK_POSITION = -45
BOSS_NORMAL_POSITION = -25
```

### Attack Patterns

#### 1. Syringe Attack
- Attack interval: Regular timer-based
- Projectile speed: 15 units/second
- Syringe reward when destroyed: 1x bet

#### 2. Charge Attack
- Interval: Random 10-20 seconds (avg ~15s = 4 per minute)
- Charge width by level:
  - Level 1: 1 lane
  - Level 2-4: 2 lanes
  - Level 5: 3 lanes

### Charge Phases
1. **Phase 1 (Retreat)**: Moves back to Z=-45 at 1.1x speed
2. **Phase 2 (Charge)**: Rushes forward at 3.0x game speed
3. **Phase 3 (Return)**: Returns to normal position at 1.35x speed
4. **Phase 4 (Hold)**: Brief pause before next attack

### Death Animation Phases
1. **Knockback**: Flies back to Z=-30 over 0.8s with arc
2. **Falling**: Falls from height 2 to 0 over 1.0s
3. **Landed**: Stays at final position

### Geometry Components
| Component | Geometry | Size |
|-----------|----------|------|
| Body | CylinderGeometry | r1=0.45, r2=0.55, h=0.55 |
| Shoulders | SphereGeometry | r=0.44 |
| Legs | CapsuleGeometry | r=0.1, h=0.7 |
| Head | SphereGeometry | r=0.48 |
| Nose | CapsuleGeometry | r=0.14, h=0.45 |
| Hair | ConeGeometry | r=0.15, h=0.4 |
| Top Hair | SphereGeometry | r=0.25 |
| Glasses | TorusGeometry | r=0.16, tube=0.05 |
| Lens | CircleGeometry | r=0.15 |
| Swirl | TorusGeometry | r=0.08, tube=0.02 |
| Shoes | BoxGeometry | 0.28 x 0.2 x 0.55 |
| Mouth | CapsuleGeometry | r=0.04, h=0.25 |
| Tie | ConeGeometry | r=0.15, h=0.6 |

### Hitbox
- Z threshold: 3.0 (larger than normal enemies)

### Object Properties
```typescript
{
  type: ObjectType.BOSS,
  health: number,
  maxHealth: number,
  attackTimer: number,
  chargeTimer: number,
  isCharging: boolean,
  chargePhase: number,     // 0=idle, 1=retreat, 2=charge, 3=return, 4=hold
  chargeLane: number,
  chargeWidth: number,
  chargeHitPlayer: boolean,
  nextChargeInterval: number,
  holdTimer: number,
  isDying: boolean,
  deathTimer: number,
  deathPhase: number,      // 0=knockback, 1=falling, 2=landed
  deathStartZ: number,
  deathLane: number,
  lastHitTime?: number
}
```

---

## 6. BOSS_AMMO (Syringe Projectile)

### Stats
| Property | Value |
|----------|-------|
| HP | 1 (can be destroyed) |
| Reward | 1x bet |
| Speed | 15 units/second |

### Geometry Components
| Component | Geometry | Size |
|-----------|----------|------|
| Barrel | CylinderGeometry | r=0.12, h=0.8 |
| Needle | CylinderGeometry | r1=0.015, r2=0.008, h=0.5 |
| Needle Hub | CylinderGeometry | r1=0.05, r2=0.03, h=0.12 |
| Plunger | CylinderGeometry | r=0.08, h=0.3 |
| Plunger Rod | CylinderGeometry | r=0.02, h=0.5 |
| Plunger Tip | CylinderGeometry | r=0.095, h=0.05 |
| Fluid | CylinderGeometry | r=0.1, h=0.6 |
| Finger Flange | CylinderGeometry | r=0.18, h=0.03 |
| Barrel Ring | TorusGeometry | r=0.12, tube=0.01 |

### Hitbox
- Bottom: 0.5
- Top: 2.5

---

## Summary Tables

### Enemy Unlock Progression
| Order | Enemy | Unlock Condition |
|-------|-------|------------------|
| 1 | Mousetrap | Always available |
| 2 | Snake | Always available |
| 3 | Cat | Always available |
| 4 | Eagle | Always available |
| 5 | Boss | After collecting KAASINO |

### Rewards Summary
| Enemy | HP | Reward Multiplier |
|-------|----|--------------------|
| Mousetrap | 1 | 1x bet |
| Snake | 1 | 2x bet |
| Cat | 2 | 3x bet |
| Eagle | 3 | 5x bet |
| Syringe | 1 | 1x bet |
| Boss | 20-60 | 1.2x maxHP × bet |

### Spawn Intervals
| Enemy | Condition |
|-------|-----------|
| Mousetrap | Every spawn cycle (1-3 per spawn) |
| Snake | Every 15 mousetraps (10 with perk) |
| Cat | Instant after each 2 snakes killed |
| Eagle | Instant after each cat killed + Spawned by every 2nd cat |
| Boss | After all 7 letters collected |

### Speed Multipliers
| Entity | Speed |
|--------|-------|
| Game base | 18.0 units/s |
| Cat | 1.05x game speed |
| Eagle (slow) | 0.9x game speed |
| Eagle (fast) | 1.1x game speed |
| Eagle (retreat) | 1.2x game speed |
| Boss charge | 3.0x game speed |
| Boss retreat | 1.1x game speed |
| Boss return | 1.35x game speed |
| Projectile | 50 units/s |
| Syringe | 15 units/s |

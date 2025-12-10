# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

**Всегда отвечай на русском языке.** All responses must be in Russian.

## Project Overview

Cheese Runner is a 3D endless runner game built with React Three Fiber (R3F) where players control a lab mouse navigating through obstacles, collecting letters to spell "KAASINO", and defeating enemies. The game features a gambling mechanic where players bet money to shoot projectiles at obstacles and enemies for rewards.

## Build and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

The dev server runs on `localhost:3000`.

## Architecture

### State Management (store.ts)

The game uses Zustand for centralized state management. All game state lives in a single store including:

- Game flow states (MENU, COUNTDOWN, PLAYING, PAUSED, SHOP, INVENTORY, LEVEL_COMPLETE, GAME_OVER, VICTORY)
- Player state (lives, lane position, power-ups, inventory)
- Level progression (level, laneCount, speed, collectedLetters)
- Economy (balance in Euros, betAmount, levelStats for tracking kills/earnings)
- Boss mechanics (isBossActive, bossHealth, wordCompleted flag)

Key store actions:
- `startGame()` / `restartGame()` - Initialize/reset game state
- `collectLetter(index)` - Progress through "KAASINO" word collection
- `triggerLevelComplete()` - Transition to boss/shop sequence
- `startNextLevel()` - Advance to next level (increases speed, adds lanes)
- `attemptShoot()` - Deduct bet amount, returns true if player can afford
- `buyItem()` / `consumeItem()` - Shop and inventory management
- Developer utilities (`debugSpawnBoss()`, `debugJumpToLevel()`, `toggleGodMode()`)

### Core Game Loop

**App.tsx** - Root component with:
- Dynamic camera that adjusts for lane count and screen aspect ratio
- Mobile touch handling (prevents scroll/bounce)
- Canvas setup with performance optimizations (`dpr: [1, 1.5]`, disabled antialiasing/stencil)

**Scene Hierarchy:**
```
Canvas
├── CameraController (smooth lerping camera)
├── Environment (lighting, fog, background)
├── PlayerGroup
│   └── Player (physics, animation, controls)
├── LevelManager (spawning, collision, game objects)
└── Effects (post-processing)
```

### Player System (components/World/Player.tsx)

The Player is a detailed 3D mouse character with:

- **Spring Physics**: Horizontal movement uses spring dynamics (stiffness: 150, damping: 18) for smooth acceleration/deceleration
- **Jump System**: Single/double jump with gravity (GRAVITY: 50, JUMP_FORCE: 16)
- **Animation**: Speed-responsive running animations that adapt to game speed
  - Running: Arm swing, leg stride, body lean, tail swish (all scale with speed)
  - Jumping: Physics-based poses that change with velocity
  - Idle: Subtle breathing, head looking around
- **Controls**:
  - Arrow Keys: Left/Right (lane change), Up/W (jump), Space (shoot)
  - Touch: Swipe up (jump), UI buttons (shoot, lane change via joystick)
  - Special: Shift/Enter (activate immortality power-up)
- **Invincibility**: 1.5 second flicker after taking damage

### Level Manager (components/World/LevelManager.tsx)

Handles all dynamic game objects via event-driven architecture:

**Object Types** (defined in types.ts):
- `MOUSETRAP` - Static hazards, pay 1x bet on destruction
- `SNAKE` - Diagonal-moving enemies (HP 1), pay 2x bet on kill
- `CAT` - Lane-changing enemies (HP 2), pay 3x bet on kill
- `EAGLE` - Flying enemies (Owls), HP 3, pay 5x bet on kill
- `CHEESE` - Collectibles for points
- `LETTER` - Spell "KAASINO" to trigger boss
- `BOSS` (Doctor) - End-of-level boss with HP system
- `PROJECTILE` (Player shots) - Fast-moving bullets
- `BOSS_AMMO` (Boss attack) - Boss projectiles (syringes)
- `POWERUP` - Temporary abilities (FIREWALL, SPEED_BOOST, HEART)

**Spawning Logic**:
- Objects spawn at dynamic distances based on type and speed (see SPAWN_DISTANCES in types.ts):
  - Boss: z=-90, Collectibles: z=-85, Enemies: z=-80 (at base speed)
  - Formula: `spawnZ = baseZ - (speed - 18) × 1.5`
- Objects removed at REMOVE_DISTANCE (20 units) behind player
- Letter spacing increases exponentially per level: `BASE_INTERVAL * 1.5^(level-1)`
- Boss sequence triggers when all 7 letters collected (wordCompleted flag)
- Enemy spawn triggers: 1 Cat spawns after every 2 Snake kills → 1 Owl spawns after every Cat kill
- Only 1 Cat OR 1 Owl allowed on road at a time
- Chasing Snakes mode (shop perk) reduces snake spawn interval from 15 to 10

**Collision Detection**:
- Z-axis proximity + lane matching for player collisions
- Projectile vs enemy hit detection with health system
- Boss has multi-hit health system

### UI System (components/UI/HUD.tsx)

React-based overlay with multiple screens:

- **Menu** - Difficulty selection, tutorial access
- **In-Game HUD** - Lives, score, balance, word progress, joystick controls
- **Shop** - 3x2 grid layout (Consumables + Upgrades), dynamic pricing based on bet amount
- **Inventory** - Consumable item management during gameplay
- **Level Complete** - Stats screen showing earnings breakdown
- **Game Over/Victory** - Final stats with restart option
- **Dev Console** - Debug panel (toggle with `D` key) for testing

### Economy System

Players bet money (0.1€ to 50€) per shot:
- Mousetraps: 1 HP, 1x bet reward
- Snakes: 1 HP, 2x bet reward
- Cats: 2 HP, 3x bet reward
- Owls: 3 HP, 5x bet reward
- Boss: 120% of MaxHP × bet reward

Shop items use two pricing models:
- Fixed Points (consumables like Heal Potion: 1000pts)
- Bet Multiplier (upgrades like Extra Life: 10× current bet in Euros)

### Audio System (components/System/Audio.ts)

Centralized audio manager handling:
- Background music loop
- Sound effects (jump, shoot, damage, collect, explosion)
- Mute state persistence
- Auto-resume on user interaction

### Level Progression

Levels scale dynamically:
- **Lane Count**: Level 1 → 3 lanes, Levels 2-4 → 4 lanes, Level 5 → 5 lanes
- **Speed Increase**: +30% of base speed per level, +5% per letter collected
- **Difficulty Modes**: EASY (0.75× speed, 0.5× points), MEDIUM (1×), HARD (1.25× speed, 2× points)
- **Max Level**: 5 (defined in store.ts)

Word collection triggers boss fight before advancing to next level.

## Important Constants (types.ts)

```typescript
LANE_WIDTH = 2.2
JUMP_HEIGHT = 2.5
JUMP_DURATION = 0.6
RUN_SPEED_BASE = 18.0
REMOVE_DISTANCE = 20

// Per-type spawn distances (at base speed 18 m/s)
SPAWN_DISTANCES = {
    BOSS: -90,
    COLLECTIBLES: -85,
    ENEMY: -80
}
// Dynamic: spawnZ = baseZ - (speed - 18) × 1.5
```

## Development Tips

### Adding New Game Objects

1. Add ObjectType enum value in `types.ts`
2. Create geometry in `LevelManager.tsx` (following existing patterns)
3. Add spawn logic in spawning section
4. Implement collision detection in collision loop
5. Add rendering in `switch(obj.type)` block

### Modifying Difficulty

Edit `DIFFICULTY_CONFIG` in `types.ts` - affects speed and score multipliers globally.

### Testing Specific Scenarios

Use Dev Console (press `D` in-game):
- Jump to specific level
- Add balance/score
- Spawn boss manually
- Toggle God Mode (invincibility)
- Fill inventory with consumables

### Performance Considerations

- Geometries are created once and reused (see all `_GEO` constants)
- Materials use `useMemo` to prevent recreation
- Canvas configured with `powerPreference: "high-performance"`
- Particle system uses instanced rendering
- Shadow calculations optimized with dynamic scaling

## Common Patterns

**Custom Events for Communication:**
```typescript
window.dispatchEvent(new CustomEvent('player-shoot', { detail: { position } }))
window.addEventListener('player-hit', handler)
```

**Store Access in Components:**
```typescript
const { status, lives, takeDamage } = useStore()
```

**Physics Updates in useFrame:**
```typescript
useFrame((state, delta) => {
  // Update positions
  obj.position.z -= speed * delta
})
```

## File Structure

```
/components
  /World
    - Player.tsx (player character with physics/animation)
    - LevelManager.tsx (game objects, spawning, collision)
    - Environment.tsx (lighting, background)
    - Effects.tsx (post-processing)
  /UI
    - HUD.tsx (all UI overlays and menus)
  /System
    - Audio.ts (audio management)
- App.tsx (root component, canvas setup)
- store.ts (Zustand state management)
- types.ts (TypeScript definitions, constants)
- index.tsx (entry point)
```

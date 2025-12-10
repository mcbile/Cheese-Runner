# Cheese Runner - Project Structure

```
Cheese Runner/
│
├── 📄 Configuration Files
│   ├── .env.local              # Environment variables
│   ├── .gitignore              # Git ignore rules
│   ├── package.json            # NPM dependencies & scripts
│   ├── package-lock.json       # Locked dependency versions
│   ├── tsconfig.json           # TypeScript configuration
│   ├── vite.config.ts          # Vite bundler configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   └── metadata.json           # Project metadata
│
├── 📄 Documentation
│   ├── README.md               # Project readme
│   ├── CLAUDE.md               # Claude Code instructions
│   ├── CHANGELOG.md            # Development history
│   └── STRUCTURE.md            # This file
│
├── 📄 Entry Points
│   ├── index.html              # HTML entry point
│   ├── index.tsx               # React entry point
│   ├── App.tsx                 # Main application component
│   └── types.ts                # Global TypeScript types & constants
│
├── 📁 src/
│   └── index.css               # Global styles (Tailwind)
│
├── 📁 public/                  # Static assets
│   ├── icon-192.svg            # PWA icon (small)
│   ├── icon-512.svg            # PWA icon (large)
│   ├── kaasino-mini.svg        # Mini logo
│   ├── kaasino_logo_full.png   # Full logo
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker
│
├── 📁 store/                   # Zustand State Management
│   ├── index.ts                # Store creation & export
│   ├── types.ts                # Store type definitions
│   ├── utils.ts                # Store utilities
│   └── 📁 slices/              # State slices
│       ├── index.ts            # Slices export
│       ├── gameStateSlice.ts   # Game flow, score, lives, audio
│       ├── playerSlice.ts      # Player position, abilities
│       ├── economySlice.ts     # Balance, bets, rewards
│       ├── inventorySlice.ts   # Items storage & usage
│       ├── powerUpSlice.ts     # Active power-ups
│       ├── bossSlice.ts        # Boss fight state
│       ├── levelSlice.ts       # Level progression
│       └── debugSlice.ts       # Developer tools
│
├── 📁 components/
│   ├── ErrorBoundary.tsx       # React error boundary
│   │
│   ├── 📁 System/              # Core systems
│   │   ├── Audio.ts            # Audio manager (facade)
│   │   ├── AudioSystem.ts      # Audio system base
│   │   ├── AudioMusic.ts       # Background music
│   │   ├── AudioSFX.ts         # Sound effects
│   │   ├── MobileUtils.ts      # Mobile device utilities
│   │   └── ServiceWorker.ts    # PWA service worker
│   │
│   ├── 📁 UI/                  # User Interface
│   │   ├── HUD.tsx             # Main HUD overlay
│   │   ├── MenuScreen.tsx      # Main menu
│   │   ├── ShopScreen.tsx      # In-game shop
│   │   ├── shopData.ts         # Shop items data
│   │   ├── InventoryScreen.tsx # Inventory management
│   │   ├── GameOverlays.tsx    # Game state overlays
│   │   ├── AboutScreen.tsx     # About/credits screen
│   │   ├── TutorialScreen.tsx  # Tutorial content
│   │   ├── DevConsole.tsx      # Developer console
│   │   └── FPSMonitor.tsx      # FPS counter
│   │
│   └── 📁 World/               # 3D Game World
│       ├── Player.tsx          # Player character (physics, controls)
│       ├── PlayerModel.tsx     # Player 3D model
│       ├── LevelManager.tsx    # Game objects, spawning, collision
│       ├── Environment.tsx     # Lighting, fog, background
│       ├── Effects.tsx         # Post-processing effects
│       ├── Preloader.tsx       # Level loading screens
│       ├── geometries.ts       # Shared 3D geometries
│       │
│       ├── 📁 entities/        # Game entities
│       │   ├── index.ts        # Entities export
│       │   ├── GameEntity.tsx  # Base entity component
│       │   ├── CheeseEntity.tsx    # Collectible cheese
│       │   ├── LetterEntity.tsx    # KAASINO letters
│       │   ├── MousetrapEntity.tsx # Mousetrap obstacles
│       │   ├── SnakeEntity.tsx     # Snake enemies
│       │   ├── CatEntity.tsx       # Cat enemies
│       │   ├── EagleEntity.tsx     # Owl enemies
│       │   ├── BossEntity.tsx      # Boss character
│       │   ├── BossAmmoEntity.tsx  # Boss projectiles
│       │   ├── PortalEntity.tsx    # Level portal
│       │   ├── PowerupEntity.tsx   # Power-up pickups
│       │   ├── ProjectileEntity.tsx # Player projectiles
│       │   │
│       │   └── 📁 sprites/     # 2D sprites for entities
│       │       ├── index.ts        # Sprites export
│       │       ├── textures.ts     # Texture generation
│       │       ├── CheeseSprite.tsx
│       │       ├── FireSprite.tsx
│       │       ├── HeartSprite.tsx
│       │       ├── HourglassSprite.tsx
│       │       └── LightningSprite.tsx
│       │
│       ├── 📁 environment/     # Scenery components
│       │   ├── index.ts        # Environment export
│       │   ├── constants.ts    # Environment constants
│       │   ├── useSceneryMovement.ts # Movement hook
│       │   ├── SceneryLayoutManager.ts # Layout management
│       │   ├── Ground.tsx      # Ground plane
│       │   ├── Road.tsx        # Road surface
│       │   ├── Grass.tsx       # Grass patches
│       │   ├── Tree.tsx        # Trees
│       │   ├── Bush.tsx        # Bushes
│       │   ├── Forest.tsx      # Forest groups
│       │   ├── Windmill.tsx    # Dutch windmills
│       │   ├── Greenhouse.tsx  # Greenhouses
│       │   ├── TulipField.tsx  # Tulip fields
│       │   ├── WheatField.tsx  # Wheat fields
│       │   ├── Cow.tsx         # Cows
│       │   ├── Guardrail.tsx   # Road guardrails
│       │   └── Countryside.tsx # Countryside scene
│       │
│       ├── 📁 systems/         # Game systems
│       │   ├── index.ts        # Systems export
│       │   ├── SpawningSystem.ts   # Object spawning
│       │   ├── MovementSystem.ts   # Object movement
│       │   ├── CollisionSystem.ts  # Collision detection
│       │   ├── ObjectPool.ts       # Object pooling
│       │   ├── SpatialGrid.ts      # Spatial partitioning
│       │   ├── ParticleSystem.tsx  # Particle effects
│       │   └── InstancedRenderer.ts # Instanced rendering
│       │
│       ├── 📁 hooks/           # Custom React hooks
│       │   ├── index.ts        # Hooks export
│       │   ├── usePlayerInput.ts   # Input handling
│       │   ├── usePlayerPhysics.ts # Physics simulation
│       │   └── usePlayerAnimation.ts # Animation control
│       │
│       └── 📁 utils/           # World utilities
│           ├── index.ts        # Utils export
│           └── fontLoader.ts   # Font loading
│
└── 📁 .claude/                 # Claude Code settings
    └── settings.local.json
```

## File Count Summary

| Category | Files |
|----------|-------|
| Configuration | 9 |
| Documentation | 4 |
| Entry Points | 4 |
| Store (State) | 12 |
| System | 6 |
| UI | 10 |
| World Core | 6 |
| Entities | 14 |
| Sprites | 7 |
| Environment | 17 |
| Systems | 8 |
| Hooks | 4 |
| Utils | 2 |
| Public Assets | 6 |
| **Total** | **~109** |

## Tech Stack

- **Framework**: React 18 + TypeScript
- **3D Engine**: Three.js + React Three Fiber (R3F)
- **State**: Zustand (modular slices)
- **Styling**: Tailwind CSS
- **Build**: Vite
- **PWA**: Service Worker + Manifest

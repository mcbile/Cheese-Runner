# Player Animation Enhancements

## Overview
The player model now features a comprehensive physics-based animation system that responds dynamically to game state, velocity, and speed.

## Key Enhancements

### 1. **Speed-Responsive Running Animations**
- **Animation Speed**: Scales with game speed (0.5x to 2x multiplier)
- **Bounce Intensity**: Increases at higher speeds for more dynamic movement
- **Forward Lean**: Player leans more forward when running faster
- **Body Sway**: More pronounced weight shift at higher speeds
- **Arm Swing**: Swing intensity increases with speed
- **Leg Stride**: Stride length extends at higher speeds
- **Head Movement**: Subtle side-to-side look during fast running

### 2. **Velocity-Based Jumping Animations**
The jump animation now has three distinct phases based on velocity:

#### Rising Phase (velocity > 0.3)
- Arms reaching upward (-2.8 radians)
- Legs tucked tightly (-1.2, -0.8 radians)
- Body leaning back slightly (-0.25 radians)
- Tail extends backward for balance

#### Apex Phase (velocity near 0)
- Arms spread slightly (-2.5 radians)
- Legs moderately tucked (-1.0, -0.5 radians)
- Body in neutral position (-0.1 radians)
- Maximum height reached

#### Falling Phase (velocity < -0.3)
- Arms forward for balance (-2.0 radians)
- Legs preparing to land (-0.3, -0.1 radians)
- Body leaning forward (0.1 radians)
- Anticipating ground contact

### 3. **Enhanced Idle Animations**
More personality and life when stationary:
- **Breathing**: Multi-layered sine waves for natural breathing motion
- **Head Movement**: Looking around with subtle nods
- **Weight Shift**: Gentle side-to-side sway
- **Arm Movement**: Subtle breathing-synchronized motion
- **Leg Position**: Slight weight shifting between legs

### 4. **Dynamic Tail Animation**
The tail now responds to different states:
- **Jumping**: Extends backward for balance with active swishing
- **Running**: Active swishing motion that scales with speed
- **Idle**: Gentle swaying motion

### 5. **Enhanced Shadow System**
- Shadow stretch now scales with running speed
- More realistic shadow behavior during movement
- Smooth transitions between states

## Technical Implementation

### Speed Multiplier Calculation
```typescript
const speedMultiplier = speed / 18.0; // Normalize to RUN_SPEED_BASE
const targetAnimSpeed = baseAnimSpeed * Math.max(0.5, Math.min(2.0, speedMultiplier));
```

### Velocity-Based Transitions
```typescript
const normalizedVelocity = velocityY.current / JUMP_FORCE; // -1 to 1 range
```

### Smooth Interpolation
All pose transitions use `THREE.MathUtils.lerp()` for smooth, natural movement.

## Physics State Integration

The animations are now fully connected to:
- **Game Speed**: From the store's `speed` value
- **Velocity**: From the physics system's `velocityY`
- **Jump State**: From `isJumping` and `jumpsPerformed`
- **Lane Position**: Affects rotation and tilt
- **Game Status**: Different behaviors for PLAYING, COUNTDOWN, and IDLE

## Visual Improvements

1. **More Realistic Movement**: Character feels alive and responsive
2. **Speed Feedback**: Player can visually see speed changes
3. **Better Jump Feel**: Clear visual feedback for jump phases
4. **Personality**: Idle animations make the character feel more alive
5. **Polish**: Smooth transitions between all animation states

## Performance Considerations

- All animations use efficient sine/cosine calculations
- No additional geometry or materials created
- Minimal performance impact
- Scales well with game speed

## Testing Recommendations

1. **Speed Variations**: Test at different difficulty levels to see speed-responsive animations
2. **Jump Phases**: Observe the smooth transitions during jumps
3. **Idle State**: Watch the character during countdown to see idle animations
4. **Lane Changes**: Notice the tilt and rotation during movement
5. **Speed Boosts**: Collect speed boost power-ups to see enhanced animations

# Spring Physics Movement Implementation

## Overview
To address the issue of "jerky" movement while maintaining high responsiveness, the player's horizontal movement logic has been upgraded from simple Linear Interpolation (Lerp) to a **Spring Physics System**.

## Why Spring Physics?
- **Lerp (Previous)**: Changes velocity instantaneously. When you press a key, the character immediately starts moving at a speed proportional to the distance. This causes infinite acceleration spikes, which feel "jerky" or "robotic".
- **Spring (New)**: Simulates a physical spring connecting the player to the target lane.
  - **Continuous Velocity**: Velocity changes smoothly over time (finite acceleration).
  - **Natural Ease-in/Ease-out**: Automatically accelerates at the start and decelerates as it settles.
  - **Overshoot Potential**: Can be tuned to have a slight, lively bounce or be perfectly critical.

## Implementation Details

### Physics Model
We use a damped harmonic oscillator model:
$$ F = -k \cdot x - c \cdot v $$
Where:
- $F$ is the force (acceleration).
- $k$ is the **Stiffness** (tension).
- $x$ is the displacement from target.
- $c$ is the **Damping** (friction).
- $v$ is the current velocity.

### Parameters Tuned
- **Stiffness (`k = 150`)**: High value ensures the movement is **fast** and responsive. The player snaps to the new lane quickly.
- **Damping (`c = 18`)**: Tuned to be slightly **underdamped** to **critically damped**. This prevents excessive oscillation (wobbling) while ensuring the player settles quickly without feeling "sluggish".

### Code Changes (`Player.tsx`)
1.  **State**: Added `velocityX` ref to track momentum across frames.
2.  **Integration**: Used Euler integration in the `useFrame` loop:
    ```typescript
    const acceleration = (stiffness * displacement) - (damping * velocityX.current);
    velocityX.current += acceleration * delta;
    groupRef.current.position.x += velocityX.current * delta;
    ```
3.  **Tilt/Banking**:
    - Previously calculated from position difference (which was jerky).
    - Now calculated from **actual physical velocity**: `targetRotation = -velocityX.current * 0.05`.
    - This results in a much smoother banking effect that naturally correlates with how fast the character is moving sideways.

## Result
The movement is now **fluid and organic**. It retains the speed required for the gameplay but eliminates the harsh mechanical starts and stops of the previous implementation.

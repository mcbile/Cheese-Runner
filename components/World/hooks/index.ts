/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Player hooks exports
 */

export { usePlayerInput } from './usePlayerInput';
export { usePlayerPhysics, updateHorizontalPhysics, updateJumpPhysics, resetPhysicsState } from './usePlayerPhysics';
export type { PhysicsState, PhysicsRefs } from './usePlayerPhysics';
export {
    usePlayerAnimation,
    updateTailAnimation,
    updateRunningAnimation,
    updateIdleAnimation,
    updateJumpingAnimation,
    updateShadow
} from './usePlayerAnimation';
export type { AnimationRefs, AnimationContext } from './usePlayerAnimation';

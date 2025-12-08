/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * World hooks exports
 */

// Player hooks
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

// Entity hooks
export { useEntityPositionSync, useSimplePositionSync } from './useEntityPositionSync';
export type { EntityPosition, UseEntityPositionSyncOptions, EntityPositionSyncResult } from './useEntityPositionSync';

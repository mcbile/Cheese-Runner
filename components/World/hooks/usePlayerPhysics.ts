/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Custom hook for player physics (spring movement, jump, gravity)
 */

import { useRef } from 'react';
import * as THREE from 'three';
import { LANE_WIDTH, GRAVITY, JUMP_FORCE, SPRING_STIFFNESS, SPRING_DAMPING, GameStatus } from '../../../types';

export interface PhysicsState {
    isJumping: React.MutableRefObject<boolean>;
    velocityY: React.MutableRefObject<number>;
    velocityX: React.MutableRefObject<number>;
    jumpsPerformed: React.MutableRefObject<number>;
    spinRotation: React.MutableRefObject<number>;
    targetX: React.MutableRefObject<number>;
}

export interface PhysicsRefs {
    groupRef: React.RefObject<THREE.Group>;
    bodyRef: React.RefObject<THREE.Group>;
}

export function usePlayerPhysics(): PhysicsState {
    const isJumping = useRef(false);
    const velocityY = useRef(0);
    const velocityX = useRef(0);
    const jumpsPerformed = useRef(0);
    const spinRotation = useRef(0);
    const targetX = useRef(0);

    return {
        isJumping,
        velocityY,
        velocityX,
        jumpsPerformed,
        spinRotation,
        targetX
    };
}

/**
 * Update horizontal spring physics
 */
export function updateHorizontalPhysics(
    groupRef: THREE.Group,
    lane: number,
    velocityX: React.MutableRefObject<number>,
    targetX: React.MutableRefObject<number>,
    delta: number
): number {
    targetX.current = lane * LANE_WIDTH;

    const currentX = groupRef.position.x;
    const displacement = targetX.current - currentX;

    // Spring Force: F = k*x - c*v
    const acceleration = (SPRING_STIFFNESS * displacement) - (SPRING_DAMPING * velocityX.current);

    // Euler Integration
    velocityX.current += acceleration * delta;
    groupRef.position.x += velocityX.current * delta;

    // Return banking tilt
    return THREE.MathUtils.clamp(-velocityX.current * 0.05, -0.6, 0.6);
}

/**
 * Update vertical jump physics
 */
export function updateJumpPhysics(
    groupRef: THREE.Group,
    bodyRef: THREE.Group | null,
    physicsState: PhysicsState,
    delta: number,
    status: GameStatus
): void {
    const { isJumping, velocityY, jumpsPerformed, spinRotation } = physicsState;

    if (status === GameStatus.PLAYING) {
        if (isJumping.current) {
            groupRef.position.y += velocityY.current * delta;
            velocityY.current -= GRAVITY * delta;

            if (groupRef.position.y <= 0) {
                groupRef.position.y = 0;
                isJumping.current = false;
                jumpsPerformed.current = 0;
                velocityY.current = 0;
                if (bodyRef) bodyRef.rotation.x = 0;
            }

            // Double jump spin
            if (jumpsPerformed.current === 2 && bodyRef) {
                spinRotation.current -= delta * 15;
                if (spinRotation.current < -Math.PI * 2) spinRotation.current = -Math.PI * 2;
                bodyRef.rotation.x = spinRotation.current;
            }
        }
    } else if (status === GameStatus.COUNTDOWN) {
        groupRef.position.y = 0;
    }

    // Keep group rotation flat for shadow
    groupRef.rotation.z = 0;
}

/**
 * Reset physics state (on game start/restart)
 */
export function resetPhysicsState(
    physicsState: PhysicsState,
    groupRef: THREE.Group | null,
    bodyRef: THREE.Group | null
): void {
    physicsState.isJumping.current = false;
    physicsState.jumpsPerformed.current = 0;
    physicsState.velocityY.current = 0;
    physicsState.spinRotation.current = 0;

    if (groupRef) groupRef.position.y = 0;
    if (bodyRef) bodyRef.rotation.x = 0;
}

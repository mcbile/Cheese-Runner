/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Custom hook for player animation (running, idle, jumping)
 */

import { useRef } from 'react';
import * as THREE from 'three';
import { GameStatus, JUMP_FORCE } from '../../../types';

export interface AnimationRefs {
    bodyRef: React.RefObject<THREE.Group>;
    headRef: React.RefObject<THREE.Group>;
    tailRef: React.RefObject<THREE.Group>;
    leftArmRef: React.RefObject<THREE.Group>;
    rightArmRef: React.RefObject<THREE.Group>;
    leftLegRef: React.RefObject<THREE.Group>;
    rightLegRef: React.RefObject<THREE.Group>;
    shadowRef: React.RefObject<THREE.Mesh>;
}

export interface AnimationContext {
    isJumping: boolean;
    isRunning: boolean;
    velocityY: number;
    jumpsPerformed: number;
    speedMultiplier: number;
    bankingTilt: number;
    groupHeight: number;
}

export function usePlayerAnimation() {
    const animTime = useRef(0);
    return { animTime };
}

/**
 * Update tail animation
 */
export function updateTailAnimation(
    tailRef: THREE.Group,
    time: number,
    isJumping: boolean,
    isRunning: boolean
): void {
    if (isJumping) {
        tailRef.rotation.y = Math.cos(time * 0.5) * 0.2;
        tailRef.rotation.x = -0.6 + Math.sin(time * 0.8) * 0.15;
    } else if (isRunning) {
        tailRef.rotation.y = Math.cos(time * 0.4) * 0.4;
        tailRef.rotation.x = -0.3 + Math.abs(Math.sin(time * 0.6)) * 0.15;
    } else {
        tailRef.rotation.y = Math.cos(time * 0.3) * 0.3;
        tailRef.rotation.x = -0.4 + Math.abs(Math.sin(time * 0.5)) * 0.1;
    }
}

/**
 * Update running animation
 */
export function updateRunningAnimation(
    refs: AnimationRefs,
    time: number,
    speedMultiplier: number,
    bankingTilt: number,
    delta: number
): void {
    const { bodyRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef } = refs;

    if (bodyRef.current) {
        // Vertical Bounce
        const bounceIntensity = 0.08 + (speedMultiplier - 1) * 0.03;
        bodyRef.current.position.y = 0.8 + Math.abs(Math.sin(time)) * bounceIntensity;

        // Forward Lean
        const leanAmount = 0.15 + (speedMultiplier - 1) * 0.08;
        bodyRef.current.rotation.x = leanAmount;

        // Z-Sway + Banking
        const swayAmount = 0.05 + (speedMultiplier - 1) * 0.02;
        const sway = Math.cos(time) * swayAmount;
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, sway + bankingTilt, delta * 10);
    }

    if (headRef.current) {
        headRef.current.rotation.x = -0.1 + Math.sin(time * 2) * 0.04;
        headRef.current.rotation.y = Math.sin(time * 0.5) * 0.05 * speedMultiplier;
    }

    // Arms swing
    const armSwingIntensity = 1.2 + (speedMultiplier - 1) * 0.3;
    if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time) * armSwingIntensity;
        leftArmRef.current.rotation.z = 0.3;
    }
    if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * armSwingIntensity;
        rightArmRef.current.rotation.z = -0.3;
    }

    // Legs stride
    const legStrideIntensity = 1.4 + (speedMultiplier - 1) * 0.4;
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * legStrideIntensity;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * legStrideIntensity;
}

/**
 * Update idle animation
 */
export function updateIdleAnimation(
    refs: AnimationRefs,
    time: number,
    bankingTilt: number,
    delta: number
): void {
    const { bodyRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef } = refs;

    if (bodyRef.current) {
        bodyRef.current.position.y = 0.8 + Math.sin(time) * 0.025 + Math.sin(time * 0.3) * 0.01;
        bodyRef.current.rotation.x = Math.sin(time * 0.4) * 0.02;
        const sway = Math.sin(time * 0.6) * 0.015;
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, sway + bankingTilt, delta * 10);
    }

    if (headRef.current) {
        headRef.current.rotation.x = Math.sin(time * 0.7) * 0.05;
        headRef.current.rotation.y = Math.sin(time * 0.5) * 0.15 + Math.cos(time * 0.3) * 0.05;
    }

    if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 0.8) * 0.08 + 0.1;
        leftArmRef.current.rotation.z = 0.1 + Math.sin(time * 0.5) * 0.03;
    }
    if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(time * 0.8 + Math.PI) * 0.08 + 0.1;
        rightArmRef.current.rotation.z = -0.1 - Math.sin(time * 0.5) * 0.03;
    }

    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * 0.6) * 0.03;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * 0.6 + Math.PI) * 0.03;
}

/**
 * Update jumping animation
 */
export function updateJumpingAnimation(
    refs: AnimationRefs,
    velocityY: number,
    jumpsPerformed: number,
    delta: number
): void {
    const { bodyRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef } = refs;
    const jumpPoseSpeed = delta * 12;
    const normalizedVelocity = velocityY / JUMP_FORCE;

    // Arms based on jump phase
    if (normalizedVelocity > 0.3) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.8, jumpPoseSpeed);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.8, jumpPoseSpeed);
    } else if (normalizedVelocity < -0.3) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.0, jumpPoseSpeed);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.0, jumpPoseSpeed);
    } else {
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
    }

    // Legs based on jump phase
    if (normalizedVelocity > 0.5) {
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -1.2, jumpPoseSpeed);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.8, jumpPoseSpeed);
    } else if (normalizedVelocity < -0.5) {
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -0.3, jumpPoseSpeed);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.1, jumpPoseSpeed);
    } else {
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -1.0, jumpPoseSpeed);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.5, jumpPoseSpeed);
    }

    // Body rotation (not during spin)
    if (bodyRef.current && jumpsPerformed !== 2) {
        bodyRef.current.position.y = 0.8;

        if (normalizedVelocity > 0.3) {
            bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -0.25, jumpPoseSpeed);
        } else if (normalizedVelocity < -0.3) {
            bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.1, jumpPoseSpeed);
        } else {
            bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -0.1, jumpPoseSpeed);
        }
    }

    // Head looks ahead
    if (headRef.current) {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.1, jumpPoseSpeed);
        headRef.current.rotation.y = 0;
    }
}

/**
 * Update shadow based on player height
 */
export function updateShadow(
    shadowRef: THREE.Mesh,
    height: number,
    time: number,
    isJumping: boolean,
    speedMultiplier: number
): void {
    shadowRef.position.y = -height + 0.02;

    const baseScale = Math.max(0.2, 1 - (height / 2.5) * 0.5);
    const runStretch = isJumping ? 1 : 1 + Math.abs(Math.sin(time)) * 0.3 * speedMultiplier;
    shadowRef.scale.set(baseScale, baseScale, baseScale * runStretch);

    const material = shadowRef.material as THREE.MeshBasicMaterial;
    if (material && !Array.isArray(material)) {
        material.opacity = Math.max(0.1, 0.3 - (height / 2.5) * 0.2);
    }
}

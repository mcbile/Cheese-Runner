/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useFlyingAnimation - Animation logic for the Flying (Owl) entity
 */

import { useRef } from 'react';
import * as THREE from 'three';
import { LANE_WIDTH } from '../../../../types';

export interface FlyingAnimationRefs {
    groupRef: React.RefObject<THREE.Group>;
    wingRef: React.RefObject<THREE.Group>;
    rightWingRef: React.RefObject<THREE.Group>;
    leftWingRef: React.RefObject<THREE.Group>;
    feetRef: React.RefObject<THREE.Group>;
}

export function useFlyingAnimationRefs(): FlyingAnimationRefs {
    return {
        groupRef: useRef<THREE.Group>(null),
        wingRef: useRef<THREE.Group>(null),
        rightWingRef: useRef<THREE.Group>(null),
        leftWingRef: useRef<THREE.Group>(null),
        feetRef: useRef<THREE.Group>(null)
    };
}

interface FlyingAnimationParams {
    time: number;
    currentZ: number;
    eaglePhase: number;
    targetLane: number;
}

/**
 * Apply wing animation based on flight phase
 */
export function applyWingAnimation(
    refs: FlyingAnimationRefs,
    params: FlyingAnimationParams
): void {
    const { wingRef, rightWingRef, leftWingRef } = refs;
    const { time, currentZ, eaglePhase } = params;

    const isDiving = eaglePhase === 1;
    const isFinalAttack = isDiving && currentZ >= -20;

    if (!wingRef.current) return;

    if (isFinalAttack) {
        // Wings spread wide to form CROSS silhouette
        wingRef.current.rotation.z = 0;
        wingRef.current.rotation.x = 0;

        if (rightWingRef.current) {
            rightWingRef.current.rotation.z = -1.75;
            rightWingRef.current.rotation.x = 0.3;
            rightWingRef.current.rotation.y = 0.4;
        }
        if (leftWingRef.current) {
            leftWingRef.current.rotation.z = 1.75;
            leftWingRef.current.rotation.x = 0.3;
            leftWingRef.current.rotation.y = -0.4;
        }
    } else if (isDiving) {
        // Diving - wings partially spread with slower flap
        const wingSpeed = 6;
        const wingAmplitude = 0.3;
        wingRef.current.rotation.z = Math.sin(time * wingSpeed) * wingAmplitude;

        if (rightWingRef.current) {
            rightWingRef.current.rotation.z = -0.6 + Math.sin(time * wingSpeed) * 0.2;
            rightWingRef.current.rotation.x = 0.15;
            rightWingRef.current.rotation.y = 0.1;
        }
        if (leftWingRef.current) {
            leftWingRef.current.rotation.z = 0.6 - Math.sin(time * wingSpeed) * 0.2;
            leftWingRef.current.rotation.x = 0.15;
            leftWingRef.current.rotation.y = -0.1;
        }
    } else {
        // Normal flapping for approaching and retreating
        const wingSpeed = 12;
        const wingAmplitude = 0.5;
        wingRef.current.rotation.z = Math.sin(time * wingSpeed) * wingAmplitude;

        if (rightWingRef.current) {
            rightWingRef.current.rotation.z = -0.2 + Math.sin(time * wingSpeed) * 0.4;
            rightWingRef.current.rotation.x = 0;
            rightWingRef.current.rotation.y = 0;
        }
        if (leftWingRef.current) {
            leftWingRef.current.rotation.z = 0.2 - Math.sin(time * wingSpeed) * 0.4;
            leftWingRef.current.rotation.x = 0;
            leftWingRef.current.rotation.y = 0;
        }
    }
}

/**
 * Apply feet animation based on flight phase
 */
export function applyFeetAnimation(
    refs: FlyingAnimationRefs,
    params: FlyingAnimationParams
): void {
    const { feetRef } = refs;
    const { currentZ, eaglePhase } = params;

    const isDiving = eaglePhase === 1;
    const isFinalAttack = isDiving && currentZ >= -20;

    if (!feetRef.current) return;

    if (isFinalAttack) {
        feetRef.current.rotation.x = -0.7;
        feetRef.current.position.z = 0.5;
        feetRef.current.position.y = -0.35;
    } else if (isDiving) {
        feetRef.current.rotation.x = -0.6;
        feetRef.current.position.z = 0.4;
        feetRef.current.position.y = -0.4;
    } else {
        feetRef.current.rotation.x = 0;
        feetRef.current.position.z = 0.2;
        feetRef.current.position.y = -0.5;
    }
}

/**
 * Apply body orientation based on flight phase
 */
export function applyBodyOrientation(
    refs: FlyingAnimationRefs,
    params: FlyingAnimationParams
): void {
    const { groupRef } = refs;
    const { currentZ, eaglePhase, targetLane } = params;

    if (!groupRef.current) return;

    const isDiving = eaglePhase === 1;
    const isApproaching = eaglePhase === 0;
    const isRetreating = eaglePhase === 2;
    const isFinalAttack = isDiving && currentZ >= -20;

    const targetX = targetLane * LANE_WIDTH;
    const diff = targetX - groupRef.current.position.x;

    if (isApproaching) {
        groupRef.current.rotation.x = 0.15;
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.z = -diff * 0.1;
    } else if (isDiving && !isFinalAttack) {
        groupRef.current.rotation.x = 0.35;
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.z = -diff * 0.12;
    } else if (isFinalAttack) {
        groupRef.current.rotation.x = -0.15;
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.z = -diff * 0.05;
    } else if (isRetreating) {
        groupRef.current.rotation.x = 0.15;
        groupRef.current.rotation.y = Math.PI;
        groupRef.current.rotation.z = diff * 0.1;
    }
}

/**
 * Apply all flying animations
 */
export function applyFlyingAnimation(
    refs: FlyingAnimationRefs,
    params: FlyingAnimationParams
): void {
    applyWingAnimation(refs, params);
    applyFeetAnimation(refs, params);
    applyBodyOrientation(refs, params);
}

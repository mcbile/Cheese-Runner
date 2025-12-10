/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useCatAnimation - Animation logic for the Cat entity
 */

import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export interface CatAnimationRefs {
    groupRef: React.RefObject<THREE.Group>;
    bodyRef: React.RefObject<THREE.Group>;
    headRef: React.RefObject<THREE.Group>;
    frontRightPawRef: React.RefObject<THREE.Group>;
    frontLeftPawRef: React.RefObject<THREE.Group>;
    backRightLegRef: React.RefObject<THREE.Group>;
    backLeftLegRef: React.RefObject<THREE.Group>;
    tailRef: React.RefObject<THREE.Group>;
    tailMidRef: React.RefObject<THREE.Group>;
    tailTipRef: React.RefObject<THREE.Group>;
    tailCurlRef: React.RefObject<THREE.Group>;
    jawRef: React.RefObject<THREE.Group>;
    rightEarRef: React.RefObject<THREE.Group>;
    leftEarRef: React.RefObject<THREE.Group>;
    prevCatX: React.MutableRefObject<number>;
}

export function useCatAnimationRefs(initialX: number): CatAnimationRefs {
    return {
        groupRef: useRef<THREE.Group>(null),
        bodyRef: useRef<THREE.Group>(null),
        headRef: useRef<THREE.Group>(null),
        frontRightPawRef: useRef<THREE.Group>(null),
        frontLeftPawRef: useRef<THREE.Group>(null),
        backRightLegRef: useRef<THREE.Group>(null),
        backLeftLegRef: useRef<THREE.Group>(null),
        tailRef: useRef<THREE.Group>(null),
        tailMidRef: useRef<THREE.Group>(null),
        tailTipRef: useRef<THREE.Group>(null),
        tailCurlRef: useRef<THREE.Group>(null),
        jawRef: useRef<THREE.Group>(null),
        rightEarRef: useRef<THREE.Group>(null),
        leftEarRef: useRef<THREE.Group>(null),
        prevCatX: useRef<number>(initialX)
    };
}

/**
 * Generate fur spike positions for bristled back effect
 */
export function useFurSpikes() {
    return useMemo(() => {
        const spikes: Array<{ x: number; y: number; z: number; rotX: number; rotZ: number; scale: number; side: number }> = [];

        // Center spine spikes (main arch)
        for (let i = 0; i < 14; i++) {
            const t = i / 13;
            const z = 0.45 - t * 1.1;
            const archHeight = Math.sin(t * Math.PI) * 0.2;
            const y = 0.68 + archHeight;
            spikes.push({
                x: 0, y, z,
                rotX: -0.4 + t * 0.5,
                rotZ: 0,
                scale: 0.09 + Math.sin(t * Math.PI) * 0.07,
                side: 0
            });
        }

        // Side spikes for volume
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const z = 0.35 - t * 0.9;
            const archHeight = Math.sin(t * Math.PI) * 0.15;
            const y = 0.62 + archHeight;
            // Left side
            spikes.push({
                x: -0.12, y, z,
                rotX: -0.3 + t * 0.4,
                rotZ: -0.4,
                scale: 0.06 + Math.sin(t * Math.PI) * 0.04,
                side: -1
            });
            // Right side
            spikes.push({
                x: 0.12, y, z,
                rotX: -0.3 + t * 0.4,
                rotZ: 0.4,
                scale: 0.06 + Math.sin(t * Math.PI) * 0.04,
                side: 1
            });
        }
        return spikes;
    }, []);
}

/**
 * Apply running animation to the cat
 */
export function applyCatAnimation(
    refs: CatAnimationRefs,
    time: number,
    currentX: number
): void {
    const {
        groupRef, bodyRef, headRef,
        frontRightPawRef, frontLeftPawRef,
        backRightLegRef, backLeftLegRef,
        tailRef, tailMidRef, tailTipRef, tailCurlRef,
        jawRef, rightEarRef, leftEarRef,
        prevCatX
    } = refs;

    const runSpeed = 14;
    const runCycle = time * runSpeed;

    // Body bounce while running
    if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.1;
        bodyRef.current.rotation.z = Math.sin(runCycle) * 0.04;
        bodyRef.current.rotation.x = Math.sin(runCycle * 2) * 0.03;
    }

    // Front paw attack animation
    if (frontRightPawRef.current) {
        const rightSwipe = Math.sin(runCycle);
        frontRightPawRef.current.rotation.x = rightSwipe * 0.7 - 0.9;
        frontRightPawRef.current.rotation.z = rightSwipe * 0.25 + 0.1;
        frontRightPawRef.current.position.y = 0.75 + Math.max(0, rightSwipe) * 0.25;
    }
    if (frontLeftPawRef.current) {
        const leftSwipe = Math.sin(runCycle + Math.PI);
        frontLeftPawRef.current.rotation.x = leftSwipe * 0.7 - 0.9;
        frontLeftPawRef.current.rotation.z = -leftSwipe * 0.25 - 0.1;
        frontLeftPawRef.current.position.y = 0.75 + Math.max(0, leftSwipe) * 0.25;
    }

    // Back legs running
    if (backRightLegRef.current) {
        backRightLegRef.current.rotation.x = Math.sin(runCycle) * 0.6;
    }
    if (backLeftLegRef.current) {
        backLeftLegRef.current.rotation.x = Math.sin(runCycle + Math.PI) * 0.6;
    }

    // Bristled tail - nervous twitching with S-curve
    if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(time * 10) * 0.35;
        tailRef.current.rotation.x = -0.1 + Math.sin(time * 5) * 0.15;
    }
    if (tailMidRef.current) {
        tailMidRef.current.rotation.z = Math.sin(time * 12 + 0.5) * 0.45;
        tailMidRef.current.rotation.x = Math.sin(time * 6) * 0.1;
    }
    if (tailTipRef.current) {
        tailTipRef.current.rotation.z = Math.sin(time * 14 + 1) * 0.5;
    }
    if (tailCurlRef.current) {
        tailCurlRef.current.rotation.z = Math.sin(time * 16 + 1.5) * 0.3 + 0.5;
    }

    // Ears twitching
    if (rightEarRef.current) {
        rightEarRef.current.rotation.z = 0.25 + Math.sin(time * 4) * 0.1;
        rightEarRef.current.rotation.x = 0.1 + Math.sin(time * 5 + 1) * 0.08;
    }
    if (leftEarRef.current) {
        leftEarRef.current.rotation.z = -0.25 + Math.sin(time * 4 + 0.5) * 0.1;
        leftEarRef.current.rotation.x = 0.1 + Math.sin(time * 5 + 2) * 0.08;
    }

    // Head tracking and hissing
    const deltaX = currentX - prevCatX.current;
    prevCatX.current = THREE.MathUtils.lerp(prevCatX.current, currentX, 0.1);

    if (headRef.current) {
        const targetLean = THREE.MathUtils.clamp(deltaX * 8, -0.4, 0.4);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetLean * 0.5, 0.1);
        headRef.current.rotation.x = Math.sin(time * 3) * 0.06 - 0.12;
    }

    // Jaw hissing animation
    if (jawRef.current) {
        const hissPhase = Math.sin(time * 2.5);
        if (hissPhase > 0.4) {
            jawRef.current.rotation.x = 0.35 + Math.abs(Math.sin(time * 18)) * 0.25;
        } else {
            jawRef.current.rotation.x = 0.18 + Math.sin(time * 8) * 0.05;
        }
    }

    // Body lean on lane change
    if (groupRef.current) {
        const targetLean = THREE.MathUtils.clamp(deltaX * 10, -0.5, 0.5);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetLean, 0.12);
    }
}

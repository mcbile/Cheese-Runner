/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useBossAnimation - Animation logic for the Boss entity
 */

import { useRef } from 'react';
import * as THREE from 'three';
import { BossObject, isBoss } from '../../../../types';

export interface BossAnimationRefs {
    groupRef: React.RefObject<THREE.Group>;
    headRef: React.RefObject<THREE.Group>;
    leftArmRef: React.RefObject<THREE.Group>;
    rightArmRef: React.RefObject<THREE.Group>;
    leftLegRef: React.RefObject<THREE.Group>;
    rightLegRef: React.RefObject<THREE.Group>;
    coatRef: React.RefObject<THREE.Mesh>;
    tieRef: React.RefObject<THREE.Mesh>;
    materialRefs: React.MutableRefObject<THREE.MeshStandardMaterial[]>;
    prevBossX: React.MutableRefObject<number>;
}

export function useBossAnimationRefs(initialX: number): BossAnimationRefs {
    return {
        groupRef: useRef<THREE.Group>(null),
        headRef: useRef<THREE.Group>(null),
        leftArmRef: useRef<THREE.Group>(null),
        rightArmRef: useRef<THREE.Group>(null),
        leftLegRef: useRef<THREE.Group>(null),
        rightLegRef: useRef<THREE.Group>(null),
        coatRef: useRef<THREE.Mesh>(null),
        tieRef: useRef<THREE.Mesh>(null),
        materialRefs: useRef<THREE.MeshStandardMaterial[]>([]),
        prevBossX: useRef<number>(initialX)
    };
}

/**
 * Apply death animation based on phase
 */
export function applyDeathAnimation(
    refs: BossAnimationRefs,
    deathPhase: number,
    deathTimer: number,
    position: [number, number, number]
): void {
    const { groupRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef } = refs;

    if (!groupRef.current) return;

    groupRef.current.position.x = position[0];
    groupRef.current.position.y = position[1];
    groupRef.current.position.z = position[2];

    if (deathPhase === 0) {
        // Knockback phase - boss flies back
        const knockbackProgress = Math.min(deathTimer / 0.8, 1);
        groupRef.current.rotation.x = -knockbackProgress * 0.5;
        groupRef.current.rotation.z = knockbackProgress * 0.3;

        // Arms flail back during knockback
        if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -knockbackProgress * 1.2;
            rightArmRef.current.rotation.z = -knockbackProgress * 0.8;
        }
        if (leftArmRef.current) {
            leftArmRef.current.rotation.x = -knockbackProgress * 1.2;
            leftArmRef.current.rotation.z = knockbackProgress * 0.8;
        }
    } else if (deathPhase === 1) {
        // Falling phase - boss falls to ground
        const fallProgress = Math.min(deathTimer / 1.0, 1);
        groupRef.current.rotation.x = -0.5 - fallProgress * (Math.PI / 2 - 0.5);
        groupRef.current.rotation.z = 0.3 * (1 - fallProgress);

        // Arms spread out as boss falls
        if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -1.2 + fallProgress * 0.5;
            rightArmRef.current.rotation.z = -0.8 - fallProgress * 0.7;
        }
        if (leftArmRef.current) {
            leftArmRef.current.rotation.x = -1.2 + fallProgress * 0.5;
            leftArmRef.current.rotation.z = 0.8 + fallProgress * 0.7;
        }
        // Legs spread slightly
        if (rightLegRef.current) {
            rightLegRef.current.rotation.z = -fallProgress * 0.3;
        }
        if (leftLegRef.current) {
            leftLegRef.current.rotation.z = fallProgress * 0.3;
        }
    } else {
        // Dead pose - lying flat on back with arms spread OUT
        groupRef.current.rotation.x = -Math.PI / 2;
        groupRef.current.rotation.z = 0;
        groupRef.current.rotation.y = 0;

        // Arms spread OUT to the sides (perpendicular to body)
        if (rightArmRef.current) {
            rightArmRef.current.rotation.x = 0;
            rightArmRef.current.rotation.z = -Math.PI / 2;
            rightArmRef.current.rotation.y = 0;
        }
        if (leftArmRef.current) {
            leftArmRef.current.rotation.x = 0;
            leftArmRef.current.rotation.z = Math.PI / 2;
            leftArmRef.current.rotation.y = 0;
        }
        // Legs slightly spread
        if (rightLegRef.current) {
            rightLegRef.current.rotation.x = 0;
            rightLegRef.current.rotation.z = -0.3;
        }
        if (leftLegRef.current) {
            leftLegRef.current.rotation.x = 0;
            leftLegRef.current.rotation.z = 0.3;
        }
    }

    // Head tilts to the side when dead
    if (headRef.current) {
        if (deathPhase === 2) {
            headRef.current.rotation.x = 0;
            headRef.current.rotation.y = 0.4;
            headRef.current.rotation.z = 0.2;
        } else {
            headRef.current.rotation.x = 0;
            headRef.current.rotation.y = 0;
            headRef.current.rotation.z = 0;
        }
    }
}

/**
 * Apply running animation (during charge)
 */
export function applyRunningAnimation(
    refs: BossAnimationRefs,
    time: number,
    chargePhase: number
): void {
    const { groupRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef, coatRef, tieRef } = refs;

    if (!groupRef.current) return;

    const runCycle = time * 18;
    const armSwing = 1.2;
    const legSwing = 0.8;

    // Bounce while running
    groupRef.current.position.y = 0.2 + Math.abs(Math.sin(time * 15)) * 0.15;

    if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(runCycle) * armSwing;
    }
    if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(runCycle + Math.PI) * armSwing;
    }
    if (rightLegRef.current) {
        rightLegRef.current.rotation.x = Math.sin(runCycle + Math.PI) * legSwing;
    }
    if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(runCycle) * legSwing;
    }

    if (headRef.current) {
        headRef.current.rotation.x = 0.3;
        headRef.current.rotation.z = Math.sin(runCycle * 0.5) * 0.1;
        headRef.current.rotation.y = 0;
    }

    // Lean forward/back based on charge phase
    if (chargePhase === 2) {
        groupRef.current.rotation.x = 0.15;
    } else {
        groupRef.current.rotation.x = -0.1;
    }

    // Coat flapping
    if (coatRef.current) {
        const flap = 1 + Math.sin(runCycle * 2) * 0.05;
        coatRef.current.scale.set(flap, 1, flap);
    }

    // Tie flying
    if (tieRef.current) {
        tieRef.current.rotation.x = -0.5;
        tieRef.current.rotation.z = Math.sin(runCycle) * 0.2;
    }
}

/**
 * Apply idle animation
 */
export function applyIdleAnimation(
    refs: BossAnimationRefs,
    time: number,
    currentX: number,
    isHit: boolean
): void {
    const { groupRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef, coatRef, tieRef, prevBossX } = refs;

    if (!groupRef.current) return;

    groupRef.current.rotation.x = 0;
    groupRef.current.rotation.z = 0;
    groupRef.current.rotation.y = 0;

    // Floating hover
    groupRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.3;

    // Check if walking (position changed)
    const deltaX = Math.abs(currentX - prevBossX.current);
    const isWalking = deltaX > 0.01;
    prevBossX.current = currentX;

    const walkCycle = time * 10;
    const walkLegSwing = isWalking ? 0.5 : 0;
    const walkArmSwing = isWalking ? 0.6 : 0;

    // Arm animation
    if (rightArmRef.current) {
        if (isWalking) {
            rightArmRef.current.rotation.x = Math.sin(walkCycle) * walkArmSwing;
        } else {
            rightArmRef.current.rotation.x = Math.sin(time * 5) * 0.8;
        }
    }
    if (leftArmRef.current) {
        if (isWalking) {
            leftArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * walkArmSwing;
        } else {
            leftArmRef.current.rotation.x = Math.sin(time * 5 + Math.PI) * 0.8;
        }
    }

    // Leg animation
    if (rightLegRef.current) {
        rightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * walkLegSwing;
    }
    if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walkCycle) * walkLegSwing;
    }

    // Head movement
    if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 2) * 0.1;
        headRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
        if (!isHit) {
            headRef.current.rotation.x = -0.5 + Math.sin(time * 3) * 0.05;
        }
    }

    // Coat ripple
    if (coatRef.current) {
        const ripple = 1 + Math.sin(time * 4) * 0.02;
        coatRef.current.scale.set(ripple, 1, ripple);
    }

    // Tie sway
    if (tieRef.current) {
        tieRef.current.rotation.x = 0;
        tieRef.current.rotation.z = Math.sin(time * 3) * 0.1;
    }
}

/**
 * Apply hit effect (red flash + shake)
 */
export function applyHitEffect(
    refs: BossAnimationRefs,
    isHit: boolean
): void {
    const { groupRef, headRef, materialRefs } = refs;

    if (isHit) {
        // Pain State - Red Flash
        materialRefs.current.forEach(mat => {
            if (mat) {
                mat.emissive.setHex(0xFF0000);
                mat.emissiveIntensity = 2.0;
            }
        });

        // Shake Effect
        if (groupRef.current) {
            groupRef.current.position.x += (Math.random() - 0.5) * 0.8;
            groupRef.current.position.y += (Math.random() - 0.5) * 0.8;
        }

        if (headRef.current) {
            headRef.current.rotation.x = -0.8;
        }
    } else {
        // Normal State - Reset emissive
        materialRefs.current.forEach(mat => {
            if (mat) {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
            }
        });
    }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BossEntity - Main boss entity component
 * Combines BossModel with animation logic
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BossObject, GameStatus, isBoss, GameEvents } from '../../../../types';
import { useStore } from '../../../../store';
import { BossModel } from './BossModel';
import {
    useBossAnimationRefs,
    applyDeathAnimation,
    applyRunningAnimation,
    applyIdleAnimation,
    applyHitEffect
} from './useBossAnimation';

interface BossEntityProps {
    data: BossObject;
}

export const BossEntity: React.FC<BossEntityProps> = ({ data }) => {
    const { status } = useStore();
    const refs = useBossAnimationRefs(data.position[0]);

    // Track if blood splatter was spawned during knockback
    const bloodSplatterSpawned = useRef(false);

    // Spawn blood splatter particles during knockback phase
    useFrame(() => {
        if (!isBoss(data)) return;

        if (data.isDying && data.deathPhase === 0 && !bloodSplatterSpawned.current) {
            bloodSplatterSpawned.current = true;
            window.dispatchEvent(new CustomEvent(GameEvents.PARTICLE_BURST, {
                detail: {
                    position: [data.position[0], data.position[1] + 2, data.position[2]],
                    color: '#DC143C',
                    amount: 25,
                    intensity: 1.2
                }
            }));
        }

        // Reset when boss stops dying (new boss)
        if (!data.isDying) {
            bloodSplatterSpawned.current = false;
        }
    });

    // Main animation frame
    useFrame((state) => {
        if (!refs.groupRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;

        // BOSS DEATH ANIMATION
        if (data.isDying) {
            applyDeathAnimation(
                refs,
                data.deathPhase || 0,
                data.deathTimer || 0,
                data.position
            );
            return;
        }

        // NORMAL BOSS BEHAVIOR
        const isCharging = data.isCharging;
        const chargePhase = data.chargePhase || 0;
        const isRunning = isCharging && (chargePhase === 1 || chargePhase === 2);
        const isHit = data.lastHitTime && (Date.now() - data.lastHitTime < 250);

        // Update position
        refs.groupRef.current.position.x = data.position[0];
        refs.groupRef.current.position.z = data.position[2];

        if (isRunning) {
            applyRunningAnimation(refs, time, chargePhase);
        } else {
            applyIdleAnimation(refs, time, data.position[0], !!isHit);
        }

        applyHitEffect(refs, !!isHit);
    });

    return <BossModel data={data} refs={refs} />;
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FlyingEntity - Main flying enemy (owl) component
 * Combines FlyingModel with animation logic
 */

import React from 'react';
import { useFrame } from '@react-three/fiber';
import { EagleObject, GameStatus } from '../../../../types';
import { useStore } from '../../../../store';
import { FlyingModel } from './FlyingModel';
import { useFlyingAnimationRefs, applyFlyingAnimation } from './useFlyingAnimation';

interface FlyingEntityProps {
    data: EagleObject;
}

export const FlyingEntity: React.FC<FlyingEntityProps> = ({ data }) => {
    const { status } = useStore();
    const refs = useFlyingAnimationRefs();

    useFrame((state) => {
        if (!refs.groupRef.current) return;

        // Update position
        refs.groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;
        const currentZ = data.position[2];

        applyFlyingAnimation(refs, {
            time,
            currentZ,
            eaglePhase: data.eaglePhase,
            targetLane: data.targetLane || 0
        });
    });

    return <FlyingModel refs={refs} />;
};

// Backwards compatibility alias
export const EagleEntity = FlyingEntity;

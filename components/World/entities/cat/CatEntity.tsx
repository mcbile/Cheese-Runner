/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CatEntity - Main cat entity component
 * Combines CatModel with animation logic
 */

import React from 'react';
import { useFrame } from '@react-three/fiber';
import { GameObject, GameStatus } from '../../../../types';
import { useStore } from '../../../../store';
import { CatModel } from './CatModel';
import { useCatAnimationRefs, useFurSpikes, applyCatAnimation } from './useCatAnimation';

interface CatEntityProps {
    data: GameObject;
}

export const CatEntity: React.FC<CatEntityProps> = ({ data }) => {
    const { status } = useStore();
    const refs = useCatAnimationRefs(data.position[0]);
    const furSpikes = useFurSpikes();

    useFrame((state) => {
        if (!refs.groupRef.current) return;

        // Update position
        refs.groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;
        applyCatAnimation(refs, time, data.position[0]);
    });

    return <CatModel refs={refs} furSpikes={furSpikes} />;
};

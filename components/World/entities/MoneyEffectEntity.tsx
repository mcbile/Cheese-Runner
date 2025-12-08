/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MoneyEffectEntity - Flying green $ sprite on enemy kill
 * Floats upward and fades out over lifetime
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MoneyEffectObject } from '../../../types';
import { getHitDollarTexture } from './sprites';

interface MoneyEffectEntityProps {
    data: MoneyEffectObject;
}

const MONEY_EFFECT_LIFETIME = 0.8; // seconds

export const MoneyEffectEntity: React.FC<MoneyEffectEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.SpriteMaterial>(null);
    const texture = useMemo(() => getHitDollarTexture(), []);

    useFrame(() => {
        if (!groupRef.current || !materialRef.current) return;

        // Calculate elapsed time and fade
        const elapsed = (Date.now() - data.startTime) / 1000;
        const progress = Math.min(elapsed / MONEY_EFFECT_LIFETIME, 1);

        // Fade out in last 30% of lifetime
        const fadeStart = 0.7;
        const opacity = progress > fadeStart
            ? 1 - ((progress - fadeStart) / (1 - fadeStart))
            : 1;

        materialRef.current.opacity = opacity;

        // Update position (Y moves up)
        groupRef.current.position.set(
            data.position[0],
            data.position[1],
            data.position[2]
        );
    });

    return (
        <group ref={groupRef}>
            <sprite scale={[1.2, 1.2, 1]}>
                <spriteMaterial
                    ref={materialRef}
                    map={texture}
                    transparent
                    toneMapped={false}
                    depthWrite={false}
                />
            </sprite>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { GameObject } from '../../../types';
import { CheeseSprite, CheeseFlippedSprite } from './sprites';
import { SHADOW_CHEESE_GEO } from '../geometries';

interface CheeseEntityProps {
    data: GameObject;
}

export const CheeseEntity: React.FC<CheeseEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    // Низкий сыр (на мышеловке) - перевёрнутый спрайт (острием вверх)
    // Высокий сыр (в воздухе) - обычный спрайт
    const isLowCheese = data.position[1] < 2.0;

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                {isLowCheese ? <CheeseFlippedSprite /> : <CheeseSprite />}
            </Float>
            <mesh geometry={SHADOW_CHEESE_GEO} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>
        </group>
    );
};

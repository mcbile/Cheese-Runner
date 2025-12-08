/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject, GameStatus, PowerUpType } from '../../../types';
import { useStore } from '../../../store';
import { LightningSprite, HeartSprite, HourglassSprite, FireSprite } from '../sprites';

interface PowerupEntityProps {
    data: GameObject;
}

export const PowerupEntity: React.FC<PowerupEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { status } = useStore();

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;
        groupRef.current.rotation.y += delta * 3;
        groupRef.current.position.y = 1.0 + Math.sin(time * 5) * 0.2;
    });

    if (data.powerUpType === PowerUpType.FIREWALL) {
        // Firewall powerup - fire emoji sprite with green glow
        return (
            <group ref={groupRef}>
                <FireSprite />
                <pointLight distance={5} intensity={3} color="#4ADE80" />
            </group>
        );
    }

    if (data.powerUpType === PowerUpType.HEART) {
        return (
            <group ref={groupRef}>
                <HeartSprite />
                <pointLight distance={5} intensity={3} color="#4ADE80" />
            </group>
        );
    }

    if (data.powerUpType === PowerUpType.SLOW_MOTION) {
        // Slow Motion powerup - hourglass emoji sprite with green glow
        return (
            <group ref={groupRef}>
                <HourglassSprite />
                <pointLight distance={5} intensity={3} color="#4ADE80" />
            </group>
        );
    }

    // Speed Boost (default) - amber color
    return (
        <group ref={groupRef}>
            <LightningSprite />
            <pointLight distance={5} intensity={3} color="#FBBF24" />
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProjectileObject } from '../../../types';
import { PROJECTILE_GEO } from '../geometries';
import { getFireProjectileTexture, getMissDollarTexture } from './sprites';
import { calculateProjectileArcHeight } from '../systems/MovementSystem';

interface ProjectileEntityProps {
    data: ProjectileObject;
}

export const ProjectileEntity: React.FC<ProjectileEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const fireTexture = useMemo(() => data.isFirewall ? getFireProjectileTexture() : null, [data.isFirewall]);
    const missDollarTexture = useMemo(() => getMissDollarTexture(), []);

    useFrame(() => {
        if (!groupRef.current) return;

        // Calculate arc height for boss fight trajectory
        const arcHeight = calculateProjectileArcHeight(
            data.position[2],
            data.startZ ?? data.position[2],
            data.arcEnabled ?? false
        );

        // Apply position with arc offset
        const baseY = data.position[1];
        groupRef.current.position.set(data.position[0], baseY + arcHeight, data.position[2]);
    });

    // Fading projectile - red $ symbol when reaching max distance
    if (data.isFading) {
        return (
            <group ref={groupRef}>
                <sprite scale={[1.5, 1.5, 1]}>
                    <spriteMaterial map={missDollarTexture} transparent toneMapped={false} />
                </sprite>
            </group>
        );
    }

    // Firewall projectile - 🔥 emoji sprite
    if (data.isFirewall && fireTexture) {
        return (
            <group ref={groupRef}>
                <sprite scale={[1.8, 1.8, 1]}>
                    <spriteMaterial map={fireTexture} transparent toneMapped={false} />
                </sprite>
                <pointLight distance={3} intensity={1.5} color="#FF6600" />
            </group>
        );
    }

    // Normal projectile - yellow glowing sphere (75% of firewall size)
    const yellowColor = '#FFDD00';
    return (
        <group ref={groupRef}>
            <mesh geometry={PROJECTILE_GEO}>
                <meshBasicMaterial color={yellowColor} />
            </mesh>
            <pointLight distance={4} intensity={1.5} color={yellowColor} />
        </group>
    );
};

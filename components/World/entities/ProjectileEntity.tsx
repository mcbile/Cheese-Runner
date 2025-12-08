/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject, GameStatus } from '../../../types';
import { useStore } from '../../../store';
import { PROJECTILE_GEO } from '../geometries';
import { getFireProjectileTexture } from '../sprites';

interface ProjectileEntityProps {
    data: GameObject;
}

export const ProjectileEntity: React.FC<ProjectileEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const { status } = useStore();
    const fireTexture = useMemo(() => data.isFirewall ? getFireProjectileTexture() : null, [data.isFirewall]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        // Rotate only normal projectile (not firewall)
        if (!data.isFirewall && meshRef.current) {
            meshRef.current.rotation.z += delta * 15;
        }
    });

    // Firewall projectile - 🔥 emoji sprite, no rotation
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

    // Normal projectile - gold color
    const goldColor = '#FFD700';
    return (
        <group ref={groupRef}>
            <mesh ref={meshRef} geometry={PROJECTILE_GEO} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color={data.color || goldColor} />
            </mesh>
            <pointLight distance={3} intensity={1} color={data.color || goldColor} />
        </group>
    );
};

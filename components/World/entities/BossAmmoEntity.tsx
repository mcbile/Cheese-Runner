/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject } from '../../../types';
import {
    SYRINGE_BARREL_GEO, SYRINGE_NEEDLE_GEO, SYRINGE_NEEDLE_HUB_GEO,
    SYRINGE_FLUID_GEO, SYRINGE_FINGER_FLANGE_GEO
} from '../geometries';

interface BossAmmoEntityProps {
    data: GameObject;
}

export const BossAmmoEntity: React.FC<BossAmmoEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
    });

    return (
        <group ref={groupRef}>
            <group rotation={[Math.PI / 2, 0, 0]} scale={1.5}>
                {/* Glass Barrel - Crystal clear */}
                <mesh geometry={SYRINGE_BARREL_GEO}>
                    <meshPhysicalMaterial
                        color="#FFFFFF"
                        transmission={0.85}
                        opacity={0.3}
                        transparent
                        roughness={0.02}
                        thickness={0.3}
                        ior={1.52}
                    />
                </mesh>

                {/* Finger Flange (упор для пальцев) - Metal */}
                <mesh geometry={SYRINGE_FINGER_FLANGE_GEO} position={[0, -0.38, 0]}>
                    <meshStandardMaterial color="#C8C8C8" metalness={1} roughness={0.15} />
                </mesh>

                {/* Green Toxic Fluid - 50% barrel, 50% empty glass at needle end */}
                <mesh geometry={SYRINGE_FLUID_GEO} position={[0, -0.2, 0]} renderOrder={1}>
                    <meshStandardMaterial
                        color="#39FF14"
                        emissive="#00FF00"
                        emissiveIntensity={1.5}
                        toneMapped={false}
                    />
                </mesh>

                {/* Needle Hub - Chrome */}
                <mesh geometry={SYRINGE_NEEDLE_HUB_GEO} position={[0, 0.46, 0]}>
                    <meshStandardMaterial color="#C8C8C8" metalness={1} roughness={0.1} />
                </mesh>

                {/* Steel Needle - полированная сталь */}
                <mesh geometry={SYRINGE_NEEDLE_GEO} position={[0, 0.75, 0]}>
                    <meshStandardMaterial color="#E8E8E8" metalness={1} roughness={0.05} />
                </mesh>
            </group>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Windmill - Dutch-style windmill scenery object
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';
import { useSceneryMovement } from './useSceneryMovement';

interface WindmillProps {
    initialZ: number;
    x: number;
}

export const Windmill: React.FC<WindmillProps> = ({ initialZ, x }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bladesRef = useRef<THREE.Group>(null);
    const { status } = useStore();
    useSceneryMovement(initialZ, groupRef);

    useFrame((state, delta) => {
        if (!bladesRef.current || status === GameStatus.PAUSED) return;
        bladesRef.current.rotation.z -= delta * 0.6;
    });

    return (
        <group ref={groupRef} position={[x, 0, initialZ]} scale={1.32}>
            {/* Stone Foundation */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[3.0, 3.2, 0.8, 8]} />
                <meshStandardMaterial color="#9e9e9e" roughness={1.0} />
            </mesh>

            {/* Stone texture details */}
            {[0.2, 0.5, 0.7].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <cylinderGeometry args={[3.0 - i * 0.1, 3.0 - i * 0.1, 0.08, 8]} />
                    <meshStandardMaterial color="#757575" roughness={0.95} />
                </mesh>
            ))}

            {/* Red Wooden Body */}
            <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.9, 2.6, 6.8, 8]} />
                <meshStandardMaterial color="#c62828" roughness={0.85} />
            </mesh>

            {/* Horizontal white trim bands */}
            {[1.2, 2.8, 4.4, 6.0].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <cylinderGeometry args={[1.95 + (6.8 - y) * 0.105, 1.95 + (6.8 - y) * 0.105, 0.12, 8]} />
                    <meshStandardMaterial color="#f5f5f5" roughness={0.7} />
                </mesh>
            ))}

            {/* Vertical white corner beams */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 2.3;
                return (
                    <mesh key={`beam-${i}`} position={[Math.cos(angle) * radius, 3.8, Math.sin(angle) * radius]}>
                        <boxGeometry args={[0.15, 6.8, 0.15]} />
                        <meshStandardMaterial color="#eeeeee" roughness={0.8} />
                    </mesh>
                );
            })}

            {/* Windows */}
            {[2.5, 4.8].map((y, i) => (
                <group key={i}>
                    <mesh position={[0, y, 2.4]}>
                        <boxGeometry args={[0.7, 0.9, 0.1]} />
                        <meshStandardMaterial color="#1a1a1a" emissive="#ff9800" emissiveIntensity={0.15} />
                    </mesh>
                    <mesh position={[2.4, y, 0]}>
                        <boxGeometry args={[0.1, 0.9, 0.7]} />
                        <meshStandardMaterial color="#1a1a1a" emissive="#ff9800" emissiveIntensity={0.15} />
                    </mesh>
                </group>
            ))}

            {/* Door */}
            <mesh position={[0, 1.3, 2.5]}>
                <boxGeometry args={[0.9, 2.0, 0.15]} />
                <meshStandardMaterial color="#2d1810" />
            </mesh>
            <mesh position={[0.3, 1.3, 2.55]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#b8860b" metalness={0.7} />
            </mesh>

            {/* Roof Cap */}
            <mesh position={[0, 7.4, 0]} castShadow>
                <coneGeometry args={[2.1, 1.8, 8]} />
                <meshStandardMaterial color="#3e2723" roughness={0.8} />
            </mesh>

            {/* Blade Assembly */}
            <group ref={bladesRef} position={[0, 6.8, 2.3]}>
                <mesh position={[0, 0, 0.2]}>
                    <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
                    <meshStandardMaterial color="#4a2c1a" metalness={0.2} />
                </mesh>

                {/* Four Simplified Blades - solid sail style */}
                {[0, 1, 2, 3].map((i) => (
                    <group key={i} rotation={[0, 0, (Math.PI / 2) * i]}>
                        {/* Main blade arm */}
                        <mesh position={[0, 2.5, 0]}>
                            <boxGeometry args={[0.12, 5.0, 0.08]} />
                            <meshStandardMaterial color="#8b6f47" />
                        </mesh>
                        {/* Sail - single mesh */}
                        <mesh position={[0.25, 2.5, 0]}>
                            <boxGeometry args={[0.6, 4.5, 0.03]} />
                            <meshStandardMaterial color="#f4e4c1" opacity={0.9} transparent />
                        </mesh>
                        {/* Top cross beam */}
                        <mesh position={[0, 4.8, 0]}>
                            <boxGeometry args={[0.7, 0.08, 0.08]} />
                            <meshStandardMaterial color="#8b6f47" />
                        </mesh>
                        {/* Bottom cross beam */}
                        <mesh position={[0, 0.3, 0]}>
                            <boxGeometry args={[0.9, 0.08, 0.08]} />
                            <meshStandardMaterial color="#8b6f47" />
                        </mesh>
                    </group>
                ))}
            </group>
        </group>
    );
};

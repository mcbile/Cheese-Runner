/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject, GameStatus } from '../../../types';
import { useStore } from '../../../store';
import { SHADOW_SNAKE_GEO } from '../geometries';

interface SnakeEntityProps {
    data: GameObject;
}

export const SnakeEntity: React.FC<SnakeEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { status } = useStore();

    // Cobra animation refs
    const cobraBodyRef = useRef<THREE.Group>(null);
    const cobraHoodRef = useRef<THREE.Group>(null);
    const cobraHeadRef = useRef<THREE.Group>(null);
    const cobraTongueRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;
        const swaySpeed = 3;
        const swayAmount = 0.12;

        // Main body sway
        if (cobraBodyRef.current) {
            cobraBodyRef.current.rotation.z = Math.sin(time * swaySpeed) * swayAmount;
            cobraBodyRef.current.rotation.x = Math.sin(time * swaySpeed * 0.7) * 0.05;
        }

        // Hood expands and contracts
        if (cobraHoodRef.current) {
            const hoodPulse = 1 + Math.sin(time * 4) * 0.08;
            cobraHoodRef.current.scale.x = hoodPulse;
            cobraHoodRef.current.scale.y = 1 + Math.sin(time * 4 + 0.5) * 0.05;
            cobraHoodRef.current.rotation.z = Math.sin(time * swaySpeed + Math.PI * 0.3) * 0.1;
        }

        // Head tracks slightly independent
        if (cobraHeadRef.current) {
            cobraHeadRef.current.rotation.y = Math.sin(time * swaySpeed * 1.2) * 0.15;
            cobraHeadRef.current.rotation.z = Math.sin(time * swaySpeed + Math.PI * 0.5) * 0.08;
        }

        // Tongue flicking
        if (cobraTongueRef.current) {
            const tongueFlick = Math.sin(time * 15);
            const tongueExtend = tongueFlick > 0.7 ? (tongueFlick - 0.7) * 3.3 : 0;
            cobraTongueRef.current.scale.z = 0.3 + tongueExtend * 0.7;
            cobraTongueRef.current.position.z = 0.18 + tongueExtend * 0.08;
        }

        // Subtle base movement
        if (groupRef.current) {
            groupRef.current.position.y = 0.2 + Math.sin(time * 2) * 0.02;
        }
    });

    return (
        <group ref={groupRef} scale={2} position-y={0.15}>
            {/* COBRA - Animated with refs */}
            <group ref={cobraBodyRef} position={[0, 0.2, 0]}>
                {/* Coiled base / tail on ground */}
                <mesh position={[0, -0.1, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <torusGeometry args={[0.25, 0.09, 12, 24, Math.PI * 1.5]} />
                    <meshStandardMaterial color="#2D5016" roughness={0.7} metalness={0.1} />
                </mesh>
                <mesh position={[0.18, -0.1, -0.85]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
                    <torusGeometry args={[0.2, 0.08, 12, 20, Math.PI]} />
                    <meshStandardMaterial color="#1E3A0F" roughness={0.7} metalness={0.1} />
                </mesh>
                {/* Tail tip */}
                <mesh position={[0.35, -0.1, -0.95]} rotation={[0, -0.3, Math.PI / 2]}>
                    <coneGeometry args={[0.06, 0.25, 8]} />
                    <meshStandardMaterial color="#1A3510" roughness={0.6} />
                </mesh>

                {/* Scale texture on coils */}
                {[0, 0.8, 1.6, 2.4].map((angle, idx) => (
                    <mesh key={`coil-scale-${idx}`} position={[
                        Math.cos(angle) * 0.25,
                        -0.05,
                        -0.6 + Math.sin(angle) * 0.25
                    ]} rotation={[-Math.PI / 2, 0, angle]} scale={0.04}>
                        <planeGeometry args={[1, 1]} />
                        <meshStandardMaterial color="#1A3A0A" transparent opacity={0.5} side={2} />
                    </mesh>
                ))}

                {/* Raised body - S-curve with belly detail */}
                <mesh position={[0, 0.15, -0.3]} rotation={[Math.PI / 4, 0, 0]} castShadow>
                    <capsuleGeometry args={[0.11, 0.4, 8, 12]} />
                    <meshStandardMaterial color="#2D5016" roughness={0.6} metalness={0.1} />
                </mesh>
                {/* Belly - lighter underside */}
                <mesh position={[0, 0.13, -0.25]} rotation={[Math.PI / 4, 0, 0]} scale={[0.7, 1, 0.5]}>
                    <capsuleGeometry args={[0.1, 0.35, 6, 10]} />
                    <meshStandardMaterial color="#8FBC5A" roughness={0.7} />
                </mesh>

                <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
                    <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
                    <meshStandardMaterial color="#3D6B1E" roughness={0.6} metalness={0.1} />
                </mesh>

                {/* Neck going to hood */}
                <mesh position={[0, 0.7, 0.18]} rotation={[-Math.PI / 3, 0, 0]} castShadow>
                    <capsuleGeometry args={[0.08, 0.22, 8, 10]} />
                    <meshStandardMaterial color="#3D6B1E" roughness={0.6} />
                </mesh>

                {/* HOOD - characteristic cobra hood with animation ref */}
                <group ref={cobraHoodRef} position={[0, 0.65, 0.15]}>
                    {/* Hood main shape - flattened ellipsoid */}
                    <mesh scale={[1.9, 1.3, 0.35]} castShadow>
                        <sphereGeometry args={[0.2, 20, 16]} />
                        <meshStandardMaterial color="#3D6B1E" roughness={0.5} metalness={0.15} />
                    </mesh>
                    {/* Hood ribs - structural detail */}
                    {[-0.15, -0.05, 0.05, 0.15].map((x, idx) => (
                        <mesh key={`rib-${idx}`} position={[x * 1.5, 0, 0.02]} scale={[0.15, 0.9, 0.1]}>
                            <capsuleGeometry args={[0.12, 0.15, 4, 8]} />
                            <meshStandardMaterial color="#2D5016" roughness={0.6} />
                        </mesh>
                    ))}
                    {/* Hood pattern - lighter inner area */}
                    <mesh position={[0, 0, 0.06]} scale={[1.5, 1.0, 0.25]}>
                        <sphereGeometry args={[0.17, 16, 12]} />
                        <meshStandardMaterial color="#5A8F32" roughness={0.6} />
                    </mesh>
                    {/* Hood markings - spectacle pattern (classic cobra) */}
                    <mesh position={[0, 0.08, 0.07]} scale={[0.08, 0.04, 0.01]}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#1A1A1A" />
                    </mesh>
                    {/* Hood markings - eye spots */}
                    <mesh position={[0.13, 0.05, 0.065]} scale={0.065}>
                        <circleGeometry args={[1, 16]} />
                        <meshStandardMaterial color="#1A1A1A" />
                    </mesh>
                    <mesh position={[-0.13, 0.05, 0.065]} scale={0.065}>
                        <circleGeometry args={[1, 16]} />
                        <meshStandardMaterial color="#1A1A1A" />
                    </mesh>
                    {/* Hood markings - inner rings (spectacles) */}
                    <mesh position={[0.13, 0.05, 0.07]} scale={0.04}>
                        <circleGeometry args={[1, 16]} />
                        <meshStandardMaterial color="#FFD700" />
                    </mesh>
                    <mesh position={[-0.13, 0.05, 0.07]} scale={0.04}>
                        <circleGeometry args={[1, 16]} />
                        <meshStandardMaterial color="#FFD700" />
                    </mesh>
                    {/* Hood edge - darker rim */}
                    <mesh scale={[2.0, 1.35, 0.2]} position={[0, 0, -0.01]}>
                        <sphereGeometry args={[0.2, 16, 12]} />
                        <meshStandardMaterial color="#1E3A0F" roughness={0.6} />
                    </mesh>
                </group>

                {/* Head - animated with ref */}
                <group ref={cobraHeadRef} position={[0, 0.88, 0.32]}>
                    {/* Main head */}
                    <mesh rotation={[Math.PI / 6, 0, 0]} castShadow>
                        <sphereGeometry args={[0.13, 16, 12]} />
                        <meshStandardMaterial color="#4A7D26" roughness={0.5} metalness={0.1} />
                    </mesh>
                    {/* Head scales - top */}
                    <mesh position={[0, 0.08, 0]} rotation={[-0.2, 0, 0]} scale={[0.9, 0.5, 0.8]}>
                        <sphereGeometry args={[0.1, 12, 10]} />
                        <meshStandardMaterial color="#3D6B1E" roughness={0.4} />
                    </mesh>
                    {/* Snout - more defined */}
                    <mesh position={[0, -0.02, 0.13]} rotation={[Math.PI / 8, 0, 0]} scale={[0.85, 0.6, 1.1]}>
                        <sphereGeometry args={[0.08, 12, 10]} />
                        <meshStandardMaterial color="#4A7D26" roughness={0.5} />
                    </mesh>
                    {/* Nostrils */}
                    <mesh position={[0.03, -0.01, 0.19]} scale={0.015}>
                        <sphereGeometry args={[1, 8, 8]} />
                        <meshStandardMaterial color="#1A1A1A" />
                    </mesh>
                    <mesh position={[-0.03, -0.01, 0.19]} scale={0.015}>
                        <sphereGeometry args={[1, 8, 8]} />
                        <meshStandardMaterial color="#1A1A1A" />
                    </mesh>
                    {/* Eyes - menacing with glow effect */}
                    <mesh position={[0.075, 0.04, 0.07]}>
                        <sphereGeometry args={[0.038, 12, 12]} />
                        <meshBasicMaterial color="#FFD700" />
                    </mesh>
                    <mesh position={[-0.075, 0.04, 0.07]}>
                        <sphereGeometry args={[0.038, 12, 12]} />
                        <meshBasicMaterial color="#FFD700" />
                    </mesh>
                    {/* Eye rings */}
                    <mesh position={[0.075, 0.04, 0.065]} scale={1.3}>
                        <ringGeometry args={[0.035, 0.045, 16]} />
                        <meshStandardMaterial color="#2D5016" side={2} />
                    </mesh>
                    <mesh position={[-0.075, 0.04, 0.065]} scale={1.3}>
                        <ringGeometry args={[0.035, 0.045, 16]} />
                        <meshStandardMaterial color="#2D5016" side={2} />
                    </mesh>
                    {/* Pupils - vertical slits */}
                    <mesh position={[0.075, 0.04, 0.1]} scale={[0.25, 1.2, 0.25]}>
                        <sphereGeometry args={[0.025, 8, 8]} />
                        <meshBasicMaterial color="#000000" />
                    </mesh>
                    <mesh position={[-0.075, 0.04, 0.1]} scale={[0.25, 1.2, 0.25]}>
                        <sphereGeometry args={[0.025, 8, 8]} />
                        <meshBasicMaterial color="#000000" />
                    </mesh>
                    {/* Brow ridge - aggressive look */}
                    <mesh position={[0, 0.07, 0.06]} scale={[1.2, 0.3, 0.6]} rotation={[0.3, 0, 0]}>
                        <boxGeometry args={[0.15, 0.03, 0.08]} />
                        <meshStandardMaterial color="#3D6B1E" roughness={0.5} />
                    </mesh>

                    {/* Forked tongue - animated with ref */}
                    <group ref={cobraTongueRef} position={[0, -0.05, 0.18]}>
                        <mesh>
                            <boxGeometry args={[0.018, 0.01, 0.18]} />
                            <meshStandardMaterial color="#FF1744" roughness={0.3} />
                        </mesh>
                        <mesh position={[0.025, 0, 0.1]} rotation={[0, 0.5, 0]}>
                            <boxGeometry args={[0.012, 0.008, 0.08]} />
                            <meshStandardMaterial color="#FF1744" roughness={0.3} />
                        </mesh>
                        <mesh position={[-0.02, 0, 0.08]} rotation={[0, -0.4, 0]}>
                            <boxGeometry args={[0.01, 0.006, 0.06]} />
                            <meshStandardMaterial color="#FF1744" />
                        </mesh>
                    </group>
                </group>

                {/* Scale pattern on body - diamond shapes */}
                {[0.1, 0.25, 0.4, 0.55].map((yPos, idx) => (
                    <mesh key={`body-scale-${idx}`} position={[0, yPos, -0.2 + idx * 0.1]} rotation={[Math.PI / 4 - idx * 0.15, 0, Math.PI / 4]} scale={0.045 - idx * 0.005}>
                        <planeGeometry args={[1, 1]} />
                        <meshStandardMaterial color="#1A3A0A" transparent opacity={0.5} side={2} />
                    </mesh>
                ))}
                {/* Side scale patterns */}
                {[0.15, 0.35, 0.5].map((yPos, idx) => (
                    <group key={`side-scales-${idx}`}>
                        <mesh position={[0.08, yPos, -0.15 + idx * 0.08]} rotation={[Math.PI / 4, Math.PI / 4, 0]} scale={0.03}>
                            <planeGeometry args={[1, 1]} />
                            <meshStandardMaterial color="#1E4A0F" transparent opacity={0.4} side={2} />
                        </mesh>
                        <mesh position={[-0.08, yPos, -0.15 + idx * 0.08]} rotation={[Math.PI / 4, -Math.PI / 4, 0]} scale={0.03}>
                            <planeGeometry args={[1, 1]} />
                            <meshStandardMaterial color="#1E4A0F" transparent opacity={0.4} side={2} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Shadow - larger for raised cobra */}
            <mesh geometry={SHADOW_SNAKE_GEO} position={[0, 0.02, -0.25]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 2.2, 1]}>
                <meshBasicMaterial color="#000000" opacity={0.45} transparent />
            </mesh>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cow - Animated cow scenery object
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';
import { useSceneryMovement } from './useSceneryMovement';

export type CowVariant = 'black' | 'brown' | 'spotted_black' | 'spotted_brown';

interface CowProps {
    initialZ: number;
    x: number;
    rotationY?: number;
    variant?: CowVariant;
}

export const Cow: React.FC<CowProps> = ({ initialZ, x, rotationY = 0, variant = 'spotted_black' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const tailRef = useRef<THREE.Group>(null);
    const jawRef = useRef<THREE.Mesh>(null);
    const { status } = useStore();
    useSceneryMovement(initialZ, groupRef);

    const bodyColor = variant === 'black' ? '#1A1A1A'
        : variant === 'brown' ? '#6D4C41'
        : variant === 'spotted_black' ? '#1A1A1A'
        : '#6D4C41';
    const spotColor = '#F5F5F5';
    const showSpots = variant === 'spotted_black' || variant === 'spotted_brown';

    useFrame((state) => {
        if (status === GameStatus.PAUSED) return;
        const time = state.clock.elapsedTime;

        if (groupRef.current) {
            groupRef.current.position.y = Math.abs(Math.sin(time * 2 + x)) * 0.12;
        }

        if (headRef.current) {
            headRef.current.rotation.x = 0.4 + Math.sin(time * 3 + x) * 0.2;
        }

        if (jawRef.current) {
            jawRef.current.position.y = -0.18 - Math.abs(Math.sin(time * 5 + x)) * 0.08;
        }

        if (tailRef.current) {
            tailRef.current.rotation.y = Math.sin(time * 4 + x) * 0.8;
            tailRef.current.rotation.z = Math.cos(time * 2 + x) * 0.4;
        }
    });

    return (
        <group ref={groupRef} position={[x, 0, initialZ]} rotation={[0, rotationY, 0]} scale={2.06}>
            {/* Main Body */}
            <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <capsuleGeometry args={[0.55, 1.3, 12, 20]} />
                <meshStandardMaterial color={bodyColor} roughness={0.85} />
            </mesh>

            {/* Belly */}
            <mesh position={[0, 0.5, 0.1]} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color={bodyColor} roughness={0.85} />
            </mesh>

            {/* Spots */}
            {showSpots && (
                <>
                    <mesh position={[0.35, 1.0, 0.4]} castShadow scale={[1.0, 1.2, 1.0]}>
                        <sphereGeometry args={[0.35, 12, 12]} />
                        <meshStandardMaterial color={spotColor} />
                    </mesh>
                    <mesh position={[-0.25, 0.95, -0.15]} castShadow scale={[1.2, 1.0, 0.9]}>
                        <sphereGeometry args={[0.32, 12, 12]} />
                        <meshStandardMaterial color={spotColor} />
                    </mesh>
                    <mesh position={[0.15, 0.85, 0.7]} castShadow scale={[0.8, 1.1, 1.0]}>
                        <sphereGeometry args={[0.28, 12, 12]} />
                        <meshStandardMaterial color={spotColor} />
                    </mesh>
                    <mesh position={[-0.3, 1.1, 0.5]} castShadow scale={[0.9, 0.8, 1.0]}>
                        <sphereGeometry args={[0.25, 12, 12]} />
                        <meshStandardMaterial color={spotColor} />
                    </mesh>
                    <mesh position={[0.2, 0.7, -0.3]} castShadow scale={[1.1, 0.9, 1.0]}>
                        <sphereGeometry args={[0.3, 12, 12]} />
                        <meshStandardMaterial color={spotColor} />
                    </mesh>
                </>
            )}

            {/* Neck */}
            <mesh position={[0, 1.15, 0.65]} rotation={[0.4, 0, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.38, 0.5, 12]} />
                <meshStandardMaterial color={bodyColor} roughness={0.85} />
            </mesh>

            {/* Head Group */}
            <group ref={headRef} position={[0, 1.25, 1.0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.65, 0.58, 0.85]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.85} />
                </mesh>

                <mesh position={[0, 0.25, 0.15]}>
                    <sphereGeometry args={[0.28, 12, 12]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.85} />
                </mesh>

                {showSpots && (
                    <>
                        <mesh position={[0.2, 0.2, 0.1]} scale={[1.2, 0.9, 1.0]}>
                            <sphereGeometry args={[0.22, 12, 12]} />
                            <meshStandardMaterial color={spotColor} />
                        </mesh>
                        <mesh position={[-0.25, 0.15, 0.2]} scale={[0.9, 1.1, 1.0]}>
                            <sphereGeometry args={[0.18, 12, 12]} />
                            <meshStandardMaterial color={spotColor} />
                        </mesh>
                    </>
                )}

                {/* Snout */}
                <mesh position={[0, -0.15, 0.52]}>
                    <boxGeometry args={[0.58, 0.32, 0.22]} />
                    <meshStandardMaterial color="#FFB6C1" roughness={0.7} />
                </mesh>

                <mesh position={[0, -0.02, 0.58]}>
                    <cylinderGeometry args={[0.28, 0.28, 0.08, 16]} />
                    <meshStandardMaterial color="#FFB6C1" roughness={0.7} />
                </mesh>

                {/* Nostrils */}
                <mesh position={[0.15, -0.15, 0.64]}>
                    <sphereGeometry args={[0.06, 12, 12]} />
                    <meshStandardMaterial color="#8B4789" />
                </mesh>
                <mesh position={[-0.15, -0.15, 0.64]}>
                    <sphereGeometry args={[0.06, 12, 12]} />
                    <meshStandardMaterial color="#8B4789" />
                </mesh>

                {/* Jaw */}
                <mesh ref={jawRef} position={[0, -0.18, 0.45]}>
                    <boxGeometry args={[0.5, 0.15, 0.35]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.85} />
                </mesh>

                {/* Eyes */}
                <group>
                    <mesh position={[0.28, 0.12, 0.32]}>
                        <sphereGeometry args={[0.11, 12, 12]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                    <mesh position={[0.28, 0.12, 0.36]}>
                        <sphereGeometry args={[0.07, 12, 12]} />
                        <meshStandardMaterial color="#2A1A0A" />
                    </mesh>
                    <mesh position={[0.29, 0.14, 0.38]}>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
                    </mesh>

                    <mesh position={[-0.28, 0.12, 0.32]}>
                        <sphereGeometry args={[0.11, 12, 12]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                    <mesh position={[-0.28, 0.12, 0.36]}>
                        <sphereGeometry args={[0.07, 12, 12]} />
                        <meshStandardMaterial color="#2A1A0A" />
                    </mesh>
                    <mesh position={[-0.29, 0.14, 0.38]}>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
                    </mesh>
                </group>

                {/* Ears */}
                <mesh position={[0.35, 0.32, 0.15]} rotation={[0.3, 0, 0.6]}>
                    <coneGeometry args={[0.2, 0.4, 12]} />
                    <meshStandardMaterial color="#FFB6C1" roughness={0.7} />
                </mesh>
                <mesh position={[-0.35, 0.32, 0.15]} rotation={[0.3, 0, -0.6]}>
                    <coneGeometry args={[0.2, 0.4, 12]} />
                    <meshStandardMaterial color="#FFB6C1" roughness={0.7} />
                </mesh>

                <mesh position={[0.36, 0.28, 0.18]} rotation={[0.3, 0, 0.6]}>
                    <coneGeometry args={[0.1, 0.25, 12]} />
                    <meshStandardMaterial color="#F48FB1" />
                </mesh>
                <mesh position={[-0.36, 0.28, 0.18]} rotation={[0.3, 0, -0.6]}>
                    <coneGeometry args={[0.1, 0.25, 12]} />
                    <meshStandardMaterial color="#F48FB1" />
                </mesh>

                {/* Horns */}
                <group>
                    <mesh position={[0.24, 0.42, 0.08]} rotation={[0.4, -0.2, 0.4]}>
                        <coneGeometry args={[0.06, 0.35, 12]} />
                        <meshStandardMaterial color="#D4C5B9" roughness={0.6} />
                    </mesh>
                    <mesh position={[0.26, 0.58, 0.05]} rotation={[0.2, -0.1, 0.3]}>
                        <coneGeometry args={[0.04, 0.2, 12]} />
                        <meshStandardMaterial color="#D4C5B9" roughness={0.6} />
                    </mesh>

                    <mesh position={[-0.24, 0.42, 0.08]} rotation={[0.4, 0.2, -0.4]}>
                        <coneGeometry args={[0.06, 0.35, 12]} />
                        <meshStandardMaterial color="#D4C5B9" roughness={0.6} />
                    </mesh>
                    <mesh position={[-0.26, 0.58, 0.05]} rotation={[0.2, 0.1, -0.3]}>
                        <coneGeometry args={[0.04, 0.2, 12]} />
                        <meshStandardMaterial color="#D4C5B9" roughness={0.6} />
                    </mesh>
                </group>
            </group>

            {/* Legs */}
            {[
                [0.35, 0.4, 0.5],
                [-0.35, 0.4, 0.5],
                [0.35, 0.4, -0.5],
                [-0.35, 0.4, -0.5]
            ].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    <mesh position={[0, 0.15, 0]} castShadow>
                        <capsuleGeometry args={[0.14, 0.4, 8, 12]} />
                        <meshStandardMaterial color={bodyColor} roughness={0.85} />
                    </mesh>
                    <mesh position={[0, -0.15, 0]} castShadow>
                        <capsuleGeometry args={[0.11, 0.35, 8, 12]} />
                        <meshStandardMaterial color={bodyColor} roughness={0.85} />
                    </mesh>
                    <mesh position={[0, -0.42, 0]}>
                        <cylinderGeometry args={[0.12, 0.14, 0.18, 12]} />
                        <meshStandardMaterial color="#1A1A1A" roughness={0.7} />
                    </mesh>
                    <mesh position={[0, -0.5, 0.08]}>
                        <boxGeometry args={[0.14, 0.02, 0.01]} />
                        <meshStandardMaterial color="#0A0A0A" />
                    </mesh>
                </group>
            ))}

            {/* Tail - attached directly to body rear */}
            <group ref={tailRef} position={[0, 0.95, -0.55]} rotation={[-0.5, 0, 0]}>
                {/* Tail base connecting to body */}
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.85} />
                </mesh>
                {/* Tail shaft */}
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[0.05, 0.025, 0.8, 12]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.85} />
                </mesh>
                {/* Tail tuft */}
                <mesh position={[0, -0.82, 0]}>
                    <sphereGeometry args={[0.14, 12, 12]} />
                    <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
                </mesh>
            </group>

            {/* Udder */}
            <mesh position={[0, 0.35, -0.25]}>
                <sphereGeometry args={[0.25, 12, 12]} />
                <meshStandardMaterial color="#FFD7E6" roughness={0.7} />
            </mesh>
            {[[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.15, -0.25 + pos[1]]}>
                    <cylinderGeometry args={[0.03, 0.025, 0.12, 8]} />
                    <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
                </mesh>
            ))}
        </group>
    );
};

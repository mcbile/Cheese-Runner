/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text3D, Center, Text } from '@react-three/drei';
import { GameObject, LANE_WIDTH } from '../../../types';
import { useStore } from '../../../store';
import { getFontUrl } from '../utils/fontLoader';

interface PortalEntityProps {
    data: GameObject;
}

export const PortalEntity: React.FC<PortalEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftDoorRef = useRef<THREE.Group>(null);
    const rightDoorRef = useRef<THREE.Group>(null);
    const textRef = useRef<THREE.Group>(null);

    const { laneCount } = useStore();

    // Calculate portal width based on lane count
    // Road edge is at (laneCount / 2) * LANE_WIDTH + 1 (the +1 is the shoulder)
    // Posts should be on the shoulder, at the road edge
    const roadHalfWidth = (laneCount / 2) * LANE_WIDTH + 1; // Edge of road (shoulder)
    const halfWidth = roadHalfWidth + 0.4; // Post center offset (half of post width)
    const totalWidth = halfWidth * 2;
    const doorWidth = (totalWidth - 1.6) / 2; // Subtract post widths, divide by 2 doors

    const { postGeo, beamGeo, signBoardGeo, doorGeo, woodMat, neonBorderMat, chainGeo } = useMemo(() => {
        const wood = new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.9 }); // Brown wood
        const neon = new THREE.MeshBasicMaterial({ color: '#FFD700', toneMapped: false }); // Yellow neon

        return {
            postGeo: new THREE.BoxGeometry(0.8, 6, 0.8),
            beamGeo: new THREE.BoxGeometry(totalWidth + 0.8, 0.8, 0.8),
            signBoardGeo: new THREE.BoxGeometry(Math.min(6, totalWidth * 0.7), 1.5, 0.2),
            doorGeo: new THREE.BoxGeometry(doorWidth, 2.5, 0.1),
            chainGeo: new THREE.CylinderGeometry(0.05, 0.05, 1.0),
            woodMat: wood,
            neonBorderMat: neon
        };
    }, [totalWidth, doorWidth]);

    useFrame((state) => {
        if (!groupRef.current) return;

        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        const time = state.clock.elapsedTime;
        const currentZ = data.position[2];

        let openFactor = 0;
        if (currentZ > -20) {
            openFactor = THREE.MathUtils.clamp(1 - (Math.abs(currentZ) / 20), 0, 1);
        }

        if (leftDoorRef.current) {
            leftDoorRef.current.rotation.y = openFactor * (Math.PI / 1.5);
        }
        if (rightDoorRef.current) {
            rightDoorRef.current.rotation.y = -openFactor * (Math.PI / 1.5);
        }

        if (textRef.current) {
            textRef.current.rotation.x = Math.sin(time * 1.5) * 0.05;
        }
    });

    // Door inner panel size (slightly smaller than door)
    const doorInnerWidth = doorWidth - 0.2;

    return (
        <group ref={groupRef}>
            {/* Left Post */}
            <mesh geometry={postGeo} material={woodMat} position={[-halfWidth, 3, 0]} castShadow />
            <mesh position={[-halfWidth, 3, 0]} scale={[1.05, 1.01, 1.05]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.5} />
            </mesh>
            <mesh position={[-halfWidth, 3, 0]} scale={[1.10, 1.015, 1.10]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFCC00" wireframe transparent opacity={0.4} />
            </mesh>
            <mesh position={[-halfWidth, 3, 0]} scale={[1.15, 1.02, 1.15]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFA500" wireframe transparent opacity={0.35} />
            </mesh>
            <mesh position={[-halfWidth, 3, 0]} scale={[1.20, 1.025, 1.20]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FF8C00" wireframe transparent opacity={0.25} />
            </mesh>
            <mesh position={[-halfWidth, 3, 0]} scale={[1.25, 1.03, 1.25]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFFF00" wireframe transparent opacity={0.2} />
            </mesh>
            <mesh position={[-halfWidth, 3, 0]} scale={[1.30, 1.035, 1.30]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFFACD" wireframe transparent opacity={0.12} />
            </mesh>

            {/* Right Post */}
            <mesh geometry={postGeo} material={woodMat} position={[halfWidth, 3, 0]} castShadow />
            <mesh position={[halfWidth, 3, 0]} scale={[1.05, 1.01, 1.05]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.5} />
            </mesh>
            <mesh position={[halfWidth, 3, 0]} scale={[1.10, 1.015, 1.10]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFCC00" wireframe transparent opacity={0.4} />
            </mesh>
            <mesh position={[halfWidth, 3, 0]} scale={[1.15, 1.02, 1.15]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFA500" wireframe transparent opacity={0.35} />
            </mesh>
            <mesh position={[halfWidth, 3, 0]} scale={[1.20, 1.025, 1.20]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FF8C00" wireframe transparent opacity={0.25} />
            </mesh>
            <mesh position={[halfWidth, 3, 0]} scale={[1.25, 1.03, 1.25]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFFF00" wireframe transparent opacity={0.2} />
            </mesh>
            <mesh position={[halfWidth, 3, 0]} scale={[1.30, 1.035, 1.30]}>
                <boxGeometry args={[0.8, 6, 0.8]} />
                <meshBasicMaterial color="#FFFACD" wireframe transparent opacity={0.12} />
            </mesh>

            {/* Top Beam */}
            <mesh geometry={beamGeo} material={woodMat} position={[0, 5.6, 0]} castShadow />
            <mesh position={[0, 5.6, 0]} scale={[1.01, 1.1, 1.1]}>
                <boxGeometry args={[totalWidth + 0.8, 0.8, 0.8]} />
                <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 5.6, 0]} scale={[1.015, 1.15, 1.15]}>
                <boxGeometry args={[totalWidth + 0.8, 0.8, 0.8]} />
                <meshBasicMaterial color="#FFCC00" wireframe transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 5.6, 0]} scale={[1.02, 1.2, 1.2]}>
                <boxGeometry args={[totalWidth + 0.8, 0.8, 0.8]} />
                <meshBasicMaterial color="#FFA500" wireframe transparent opacity={0.35} />
            </mesh>
            <mesh position={[0, 5.6, 0]} scale={[1.025, 1.25, 1.25]}>
                <boxGeometry args={[totalWidth + 0.8, 0.8, 0.8]} />
                <meshBasicMaterial color="#FF8C00" wireframe transparent opacity={0.25} />
            </mesh>
            <mesh position={[0, 5.6, 0]} scale={[1.03, 1.3, 1.3]}>
                <boxGeometry args={[totalWidth + 0.8, 0.8, 0.8]} />
                <meshBasicMaterial color="#FFFF00" wireframe transparent opacity={0.2} />
            </mesh>
            <mesh position={[0, 5.6, 0]} scale={[1.035, 1.35, 1.35]}>
                <boxGeometry args={[totalWidth + 0.8, 0.8, 0.8]} />
                <meshBasicMaterial color="#FFFACD" wireframe transparent opacity={0.12} />
            </mesh>

            {/* Left Door */}
            <group ref={leftDoorRef} position={[-halfWidth + 0.4, 2, 0]}>
                <group position={[doorWidth / 2, 0, 0]}>
                    <mesh geometry={doorGeo} material={woodMat} castShadow />
                    <mesh position={[0, 0, 0.06]}>
                        <boxGeometry args={[doorInnerWidth, 2.3, 0.02]} />
                        <meshStandardMaterial color="#A0522D" />
                    </mesh>
                    {/* Vertical neon cross line */}
                    <mesh position={[0, 0, 0.08]}>
                        <boxGeometry args={[0.08, 2.3, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    {/* Horizontal neon cross line */}
                    <mesh position={[0, 0, 0.08]}>
                        <boxGeometry args={[doorInnerWidth, 0.08, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    {/* Diagonal X neon line 1 (top-left to bottom-right) */}
                    <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.atan2(2.3, doorInnerWidth)]}>
                        <boxGeometry args={[Math.sqrt(doorInnerWidth * doorInnerWidth + 2.3 * 2.3), 0.06, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    {/* Diagonal X neon line 2 (top-right to bottom-left) */}
                    <mesh position={[0, 0, 0.08]} rotation={[0, 0, -Math.atan2(2.3, doorInnerWidth)]}>
                        <boxGeometry args={[Math.sqrt(doorInnerWidth * doorInnerWidth + 2.3 * 2.3), 0.06, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.02, 1.05, 1.5]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.4} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.05, 1.08, 1.75]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFCC00" wireframe transparent opacity={0.3} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.08, 1.1, 2.0]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFA500" wireframe transparent opacity={0.25} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.12, 1.15, 2.5]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFFF00" wireframe transparent opacity={0.15} />
                    </mesh>
                </group>
            </group>

            {/* Right Door */}
            <group ref={rightDoorRef} position={[halfWidth - 0.4, 2, 0]}>
                <group position={[-doorWidth / 2, 0, 0]}>
                    <mesh geometry={doorGeo} material={woodMat} castShadow />
                    <mesh position={[0, 0, 0.06]}>
                        <boxGeometry args={[doorInnerWidth, 2.3, 0.02]} />
                        <meshStandardMaterial color="#A0522D" />
                    </mesh>
                    {/* Vertical neon cross line */}
                    <mesh position={[0, 0, 0.08]}>
                        <boxGeometry args={[0.08, 2.3, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    {/* Horizontal neon cross line */}
                    <mesh position={[0, 0, 0.08]}>
                        <boxGeometry args={[doorInnerWidth, 0.08, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    {/* Diagonal X neon line 1 (top-left to bottom-right) */}
                    <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.atan2(2.3, doorInnerWidth)]}>
                        <boxGeometry args={[Math.sqrt(doorInnerWidth * doorInnerWidth + 2.3 * 2.3), 0.06, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    {/* Diagonal X neon line 2 (top-right to bottom-left) */}
                    <mesh position={[0, 0, 0.08]} rotation={[0, 0, -Math.atan2(2.3, doorInnerWidth)]}>
                        <boxGeometry args={[Math.sqrt(doorInnerWidth * doorInnerWidth + 2.3 * 2.3), 0.06, 0.02]} />
                        <meshBasicMaterial color="#FFD700" toneMapped={false} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.02, 1.05, 1.5]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.4} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.05, 1.08, 1.75]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFCC00" wireframe transparent opacity={0.3} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.08, 1.1, 2.0]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFA500" wireframe transparent opacity={0.25} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.12, 1.15, 2.5]}>
                        <boxGeometry args={[doorWidth, 2.5, 0.1]} />
                        <meshBasicMaterial color="#FFFF00" wireframe transparent opacity={0.15} />
                    </mesh>
                </group>
            </group>

            {/* Hanging Sign */}
            <group position={[0, 5.2, 0]} ref={textRef}>
                <mesh geometry={chainGeo} material={neonBorderMat} position={[-2, 0.5, 0]} />
                <mesh geometry={chainGeo} material={neonBorderMat} position={[2, 0.5, 0]} />

                <mesh geometry={signBoardGeo} material={woodMat} position={[0, -0.5, 0]} castShadow />
                <mesh position={[0, -0.5, 0]} scale={[1.02, 1.1, 1.2]}>
                    <boxGeometry args={[Math.min(6, totalWidth * 0.7), 1.5, 0.2]} />
                    <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.3} />
                </mesh>

                <group position={[0, -0.6, 0.15]}>
                    <Center>
                        <Suspense fallback={
                            <Text
                                fontSize={0.6}
                                color="#FFD700"
                                anchorX="center"
                                anchorY="middle"
                                outlineWidth={0.03}
                                outlineColor="#000000"
                            >
                                CHEESE SHOP
                                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
                            </Text>
                        }>
                            <group>
                                {/* Black outline - slightly larger text behind */}
                                <Text3D
                                    font={getFontUrl()}
                                    size={0.62}
                                    height={0.08}
                                    bevelEnabled
                                    bevelSize={0.03}
                                    bevelThickness={0.03}
                                    position={[-0.01, -0.01, -0.02]}
                                >
                                    CHEESE SHOP
                                    <meshBasicMaterial color="#000000" />
                                </Text3D>
                                {/* Main yellow text */}
                                <Text3D
                                    font={getFontUrl()}
                                    size={0.6}
                                    height={0.1}
                                    bevelEnabled
                                    bevelSize={0.02}
                                    bevelThickness={0.02}
                                >
                                    CHEESE SHOP
                                    <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
                                </Text3D>
                            </group>
                        </Suspense>
                    </Center>
                </group>
            </group>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text3D, Center, Float, Text } from '@react-three/drei';
import { GameObject, GameStatus } from '../../../types';
import { useStore } from '../../../store';
import { SHADOW_LETTER_GEO } from '../geometries';
import { getFontUrl } from '../utils/fontLoader';

interface LetterEntityProps {
    data: GameObject;
}

export const LetterEntity: React.FC<LetterEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { status } = useStore();

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        groupRef.current.rotation.y += delta * 2;
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Center>
                    <Suspense fallback={
                        <Text
                            fontSize={1.44}
                            color="#FFFF00"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {data.value}
                            <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={1.5} toneMapped={false} />
                        </Text>
                    }>
                        <Text3D
                            font={getFontUrl()}
                            size={1.44}
                            height={0.24}
                            curveSegments={12}
                            bevelEnabled
                            bevelThickness={0.024}
                            bevelSize={0.024}
                            bevelOffset={0}
                            bevelSegments={5}
                        >
                            {data.value}
                            <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={1.5} toneMapped={false} />
                        </Text3D>
                    </Suspense>
                </Center>
            </Float>
            <pointLight color="#FFFF00" intensity={3} distance={6} />
            <mesh geometry={SHADOW_LETTER_GEO} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>
        </group>
    );
};

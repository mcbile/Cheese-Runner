/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 3D Letter Entity - Volumetric glowing letters for KAASINO word collection
 */

import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Text3D, Center } from '@react-three/drei';
import { LetterObject, GameStatus } from '../../../types';
import { useStore } from '../../../store';

interface LetterEntityProps {
    data: LetterObject;
}

/**
 * 3D Cheese wheel for letter O - uses O.png texture on both faces
 */
const CheeseO: React.FC<{ groupRef: React.RefObject<THREE.Mesh> }> = ({ groupRef }) => {
    const texture = useLoader(THREE.TextureLoader, '/O.png');

    // Create cylinder geometry for cheese wheel (20% smaller: scale 0.8)
    const geometry = useMemo(() => {
        return new THREE.CylinderGeometry(0.96, 0.96, 0.32, 32);
    }, []);

    // Material for the cheese sides (golden edge)
    const sideMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#FFD700',
            emissive: '#FFCC00',
            emissiveIntensity: 1.0,
            metalness: 0.3,
            roughness: 0.2,
        });
    }, []);

    // Material for both faces with texture
    const faceMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            emissive: '#FFCC00',
            emissiveIntensity: 1.0,
            metalness: 0.3,
            roughness: 0.2,
        });
    }, [texture]);

    // CylinderGeometry materials order: [side, top, bottom]
    return (
        <group position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh ref={groupRef} geometry={geometry} material={[sideMaterial, faceMaterial, faceMaterial]} />
        </group>
    );
};

/**
 * 3D Letter component with glow effect
 * All letters are beige/cream colored with warm glow
 * Letter O uses cheese wheel texture (O.png)
 */
export const LetterEntity: React.FC<LetterEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const letterRef = useRef<THREE.Mesh>(null);
    const { status, collectedLetters } = useStore();

    // Check if this letter is already collected (don't render)
    // targetIndex corresponds to position in KAASINO: K=0, A=1, A=2, S=3, I=4, N=5, O=6
    const isCollected = collectedLetters.includes(data.targetIndex);

    // Golden color theme for all letters
    const letterColor = '#FFD700'; // Gold
    const emissiveColor = '#FFCC00'; // Golden glow

    // Check if this is letter O (cheese wheel)
    const isLetterO = data.value === 'O';

    useFrame((state, delta) => {
        // Skip updates for collected letters
        if (isCollected) return;
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        // Rotate the letter - 30% faster (2 * 1.3 = 2.6)
        groupRef.current.rotation.y += delta * 2.6;

        // Pulsing glow effect for regular letters
        if (letterRef.current && !isLetterO) {
            const mat = letterRef.current.material as THREE.MeshStandardMaterial;
            if (mat.emissiveIntensity !== undefined) {
                mat.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.4;
            }
        }
    });

    // Don't render collected letters (after all hooks)
    if (isCollected) {
        return null;
    }

    return (
        <group ref={groupRef}>
            <Float speed={3} rotationIntensity={0.3} floatIntensity={0.8}>
                {isLetterO ? (
                    // Letter O - 3D cheese wheel with texture
                    <CheeseO groupRef={letterRef} />
                ) : (
                    // Regular 3D letters (K, A, A, S, I, N)
                    <Center position={[0, 0.5, 0]}>
                        <Text3D
                            ref={letterRef}
                            font="/fonts/helvetiker_bold.typeface.json"
                            size={1.44}
                            height={0.4}
                            curveSegments={12}
                            bevelEnabled
                            bevelThickness={0.08}
                            bevelSize={0.04}
                            bevelSegments={5}
                        >
                            {data.value}
                            <meshStandardMaterial
                                color={letterColor}
                                emissive={emissiveColor}
                                emissiveIntensity={1.0}
                                metalness={0.3}
                                roughness={0.2}
                            />
                        </Text3D>
                    </Center>
                )}
            </Float>
        </group>
    );
};

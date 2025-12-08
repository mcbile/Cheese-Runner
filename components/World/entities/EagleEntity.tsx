/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject, GameStatus, LANE_WIDTH } from '../../../types';
import { useStore } from '../../../store';
import { SHADOW_EAGLE_GEO } from '../geometries';

interface EagleEntityProps {
    data: GameObject;
}

// 🦉 Owl Entity
export const EagleEntity: React.FC<EagleEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const wingRef = useRef<THREE.Group>(null);
    const rightWingRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);
    const feetRef = useRef<THREE.Group>(null);
    const { status } = useStore();

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;
        const currentZ = data.position[2];

        // Phase detection
        const isDiving = data.eaglePhase === 1;
        const isApproaching = data.eaglePhase === 0;
        const isRetreating = data.eaglePhase === 2;

        // Final attack phase: Z >= -20 during diving (locking onto player)
        const isFinalAttack = isDiving && currentZ >= -20;

        // Wing animation
        if (wingRef.current) {
            if (isFinalAttack) {
                // Wings spread wide to form CROSS silhouette - full wingspan visible
                wingRef.current.rotation.z = 0;
                wingRef.current.rotation.x = 0;

                if (rightWingRef.current) {
                    // Wing extended far out to the side - maximum horizontal spread
                    rightWingRef.current.rotation.z = -1.75;  // Even more horizontal spread
                    rightWingRef.current.rotation.x = 0.3;    // Slight forward tilt to show surface
                    rightWingRef.current.rotation.y = 0.4;    // Rotated to show depth/width
                }
                if (leftWingRef.current) {
                    leftWingRef.current.rotation.z = 1.75;    // Mirror - maximum horizontal spread
                    leftWingRef.current.rotation.x = 0.3;     // Slight forward tilt
                    leftWingRef.current.rotation.y = -0.4;    // Mirror rotation
                }
            } else if (isDiving) {
                // Diving but not final - wings partially spread with slower flap
                const wingSpeed = 6;
                const wingAmplitude = 0.3;
                wingRef.current.rotation.z = Math.sin(time * wingSpeed) * wingAmplitude;

                if (rightWingRef.current) {
                    rightWingRef.current.rotation.z = -0.6 + Math.sin(time * wingSpeed) * 0.2;
                    rightWingRef.current.rotation.x = 0.15;
                    rightWingRef.current.rotation.y = 0.1;
                }
                if (leftWingRef.current) {
                    leftWingRef.current.rotation.z = 0.6 - Math.sin(time * wingSpeed) * 0.2;
                    leftWingRef.current.rotation.x = 0.15;
                    leftWingRef.current.rotation.y = -0.1;
                }
            } else {
                // Normal flapping for approaching and retreating
                const wingSpeed = 12;
                const wingAmplitude = 0.5;
                wingRef.current.rotation.z = Math.sin(time * wingSpeed) * wingAmplitude;

                if (rightWingRef.current) {
                    rightWingRef.current.rotation.z = -0.2 + Math.sin(time * wingSpeed) * 0.4;
                    rightWingRef.current.rotation.x = 0;
                    rightWingRef.current.rotation.y = 0;
                }
                if (leftWingRef.current) {
                    leftWingRef.current.rotation.z = 0.2 - Math.sin(time * wingSpeed) * 0.4;
                    leftWingRef.current.rotation.x = 0;
                    leftWingRef.current.rotation.y = 0;
                }
            }
        }

        // Animate feet - extend forward only during final attack
        if (feetRef.current) {
            if (isFinalAttack) {
                // Feet extended slightly forward - ready to grab, but owl is upright
                feetRef.current.rotation.x = -0.7; // Moderate forward tilt (not too aggressive)
                feetRef.current.position.z = 0.5;  // Extended forward
                feetRef.current.position.y = -0.35; // Natural position for upright pose
            } else if (isDiving) {
                // Feet partially extended during dive approach
                feetRef.current.rotation.x = -0.6;
                feetRef.current.position.z = 0.4;
                feetRef.current.position.y = -0.4;
            } else {
                // Normal tucked position
                feetRef.current.rotation.x = 0;
                feetRef.current.position.z = 0.2;
                feetRef.current.position.y = -0.5;
            }
        }

        // Body orientation based on phase
        const targetX = (data.targetLane || 0) * LANE_WIDTH;
        const diff = targetX - groupRef.current.position.x;

        if (isApproaching) {
            // Flying towards player, facing player (front view)
            groupRef.current.rotation.x = 0.15;
            groupRef.current.rotation.y = 0;
            groupRef.current.rotation.z = -diff * 0.1;
        } else if (isDiving && !isFinalAttack) {
            // Descending/maneuvering phase - facing player, diving down
            groupRef.current.rotation.x = 0.35; // More aggressive dive angle
            groupRef.current.rotation.y = 0;
            groupRef.current.rotation.z = -diff * 0.12;
        } else if (isFinalAttack) {
            // Final attack - owl stands tall, upright posture, wings spread wide showing full wingspan
            groupRef.current.rotation.x = -0.15; // Slight backward tilt for imposing "standing tall" pose
            groupRef.current.rotation.y = 0;
            groupRef.current.rotation.z = -diff * 0.05; // Minimal banking for stable stance
        } else if (isRetreating) {
            // Flying away, back view (facing away from player)
            groupRef.current.rotation.x = 0.15;
            groupRef.current.rotation.y = Math.PI;
            groupRef.current.rotation.z = diff * 0.1;
        }
    });

    // Owl colors based on owl4.png reference
    const bodyBrown = "#8B5A2B";       // Main brown (warmer)
    const darkBrown = "#5D3A1A";       // Dark brown spots
    const lightBrown = "#C4794E";      // Light brown/orange
    const tan = "#B8784E";             // Tan feathers
    const cream = "#F5E6D3";           // Cream face (heart-shaped disc)
    const faceInner = "#FFF5E6";       // Lighter inner face
    const eyeOrange = "#E07020";       // Orange iris (like owl4.png)
    const eyeRing = "#C05010";         // Darker orange ring around iris
    const beakOrange = "#D4742C";      // Orange beak

    return (
        <group ref={groupRef} scale={1.4}>
            {/* Main Body - Rounded owl shape */}
            <mesh position={[0, 0, 0]} castShadow>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial color={bodyBrown} roughness={0.9} />
            </mesh>

            {/* Body feather texture - layered */}
            {[0.1, 0.25, 0.4].map((zOff, i) => (
                <mesh key={`body-layer-${i}`} position={[0, -0.05 - i * 0.05, 0.2 + zOff]} scale={[1, 0.8, 0.5]}>
                    <sphereGeometry args={[0.35 - i * 0.05, 12, 8]} />
                    <meshStandardMaterial color={i % 2 === 0 ? tan : lightBrown} roughness={0.95} />
                </mesh>
            ))}

            {/* Chest with white/cream markings */}
            <mesh position={[0, -0.1, 0.45]} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color={cream} roughness={0.85} />
            </mesh>

            {/* Chest feather stripes */}
            {[-0.12, -0.04, 0.04, 0.12].map((yOff, i) => (
                <mesh key={`chest-stripe-${i}`} position={[0, yOff, 0.55]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.18, 0.03, 0.08]} />
                    <meshStandardMaterial color={darkBrown} roughness={0.9} />
                </mesh>
            ))}

            {/* Head - Round owl head with detailed face */}
            <group position={[0, 0.25, 0.55]}>
                {/* Main head shape */}
                <mesh castShadow>
                    <sphereGeometry args={[0.4, 24, 24]} />
                    <meshStandardMaterial color={bodyBrown} roughness={0.85} />
                </mesh>

                {/* Head top feather texture */}
                <mesh position={[0, 0.28, 0]} castShadow>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshStandardMaterial color={darkBrown} roughness={0.9} />
                </mesh>

                {/* Brown spots/speckles on head - more detailed */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const x = Math.sin(angle) * 0.28;
                    const y = 0.15 + Math.cos(angle) * 0.12;
                    return (
                        <mesh key={`head-spot-${i}`} position={[x, y, 0.18]}>
                            <sphereGeometry args={[0.03 + (i % 3) * 0.01, 8, 8]} />
                            <meshStandardMaterial color={i % 2 === 0 ? darkBrown : tan} roughness={0.9} />
                        </mesh>
                    );
                })}

                {/* Feather tufts on sides of head */}
                {[-1, 1].map((side) => (
                    <group key={`head-tuft-${side}`} position={[side * 0.32, 0.1, 0.05]}>
                        {[0, 1, 2].map((i) => (
                            <mesh key={`tuft-${i}`} position={[side * i * 0.02, i * 0.03, 0]} rotation={[0, 0, side * 0.3]}>
                                <coneGeometry args={[0.03, 0.1, 4]} />
                                <meshStandardMaterial color={lightBrown} roughness={0.9} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Heart-shaped Facial Disc - cream colored */}
                {/* Outer facial disc - more pronounced */}
                <mesh position={[0, -0.02, 0.2]}>
                    <sphereGeometry args={[0.34, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                    <meshStandardMaterial color={cream} roughness={0.75} />
                </mesh>
                {/* Inner lighter face area */}
                <mesh position={[0, -0.02, 0.24]}>
                    <sphereGeometry args={[0.28, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                    <meshStandardMaterial color={faceInner} roughness={0.7} />
                </mesh>
                {/* Facial disc border - feathered edge */}
                <mesh position={[0, -0.02, 0.18]} rotation={[0.2, 0, 0]}>
                    <torusGeometry args={[0.32, 0.03, 12, 32]} />
                    <meshStandardMaterial color={tan} roughness={0.85} />
                </mesh>
                {/* Inner facial disc lines - radial feather pattern */}
                {[...Array(8)].map((_, i) => {
                    const angle = (i / 8) * Math.PI - Math.PI / 2;
                    return (
                        <mesh
                            key={`face-line-${i}`}
                            position={[Math.sin(angle) * 0.15, -0.05 + Math.cos(angle) * 0.1, 0.28]}
                            rotation={[0, 0, angle]}
                        >
                            <boxGeometry args={[0.01, 0.08, 0.01]} />
                            <meshStandardMaterial color={tan} roughness={0.8} />
                        </mesh>
                    );
                })}

                {/* Eyebrow ridges - more prominent */}
                <mesh position={[0.12, 0.12, 0.28]} rotation={[0.2, 0.1, 0.3]}>
                    <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
                    <meshStandardMaterial color={darkBrown} roughness={0.85} />
                </mesh>
                <mesh position={[-0.12, 0.12, 0.28]} rotation={[0.2, -0.1, -0.3]}>
                    <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
                    <meshStandardMaterial color={darkBrown} roughness={0.85} />
                </mesh>

                {/* Eyes - Large round orange eyes with more detail */}
                <group>
                    {/* Right Eye */}
                    <group position={[0.12, 0.02, 0.32]}>
                        {/* Eye socket - deeper */}
                        <mesh position={[0, 0, -0.03]}>
                            <sphereGeometry args={[0.12, 16, 16]} />
                            <meshStandardMaterial color="#1A0A00" roughness={0.95} />
                        </mesh>
                        {/* Eye rim feathers */}
                        <mesh position={[0, 0, -0.01]}>
                            <torusGeometry args={[0.1, 0.015, 8, 20]} />
                            <meshStandardMaterial color={darkBrown} roughness={0.9} />
                        </mesh>
                        {/* Eye white/sclera */}
                        <mesh position={[0, 0, 0.01]}>
                            <sphereGeometry args={[0.1, 20, 20]} />
                            <meshStandardMaterial color="#FFFEF8" roughness={0.15} />
                        </mesh>
                        {/* Outer iris ring - darker orange */}
                        <mesh position={[0, 0, 0.05]}>
                            <sphereGeometry args={[0.09, 20, 20]} />
                            <meshStandardMaterial color={eyeRing} emissive="#802000" emissiveIntensity={0.2} roughness={0.25} />
                        </mesh>
                        {/* Main iris - orange */}
                        <mesh position={[0, 0, 0.06]}>
                            <sphereGeometry args={[0.08, 20, 20]} />
                            <meshStandardMaterial color={eyeOrange} emissive="#C04000" emissiveIntensity={0.35} roughness={0.2} />
                        </mesh>
                        {/* Inner iris gradient - brighter */}
                        <mesh position={[0, 0, 0.07]}>
                            <sphereGeometry args={[0.06, 16, 16]} />
                            <meshStandardMaterial color="#FF8030" emissive="#E05000" emissiveIntensity={0.3} roughness={0.15} />
                        </mesh>
                        {/* Iris texture rings */}
                        <mesh position={[0, 0, 0.075]}>
                            <torusGeometry args={[0.05, 0.008, 6, 20]} />
                            <meshStandardMaterial color={eyeRing} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0, 0.076]}>
                            <torusGeometry args={[0.035, 0.005, 6, 16]} />
                            <meshStandardMaterial color="#D06020" roughness={0.3} />
                        </mesh>
                        {/* Pupil - black with depth */}
                        <mesh position={[0, 0, 0.085]}>
                            <sphereGeometry args={[0.035, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        {/* Pupil inner - even darker */}
                        <mesh position={[0, 0, 0.09]}>
                            <sphereGeometry args={[0.025, 12, 12]} />
                            <meshBasicMaterial color="#000005" />
                        </mesh>
                        {/* Main highlight */}
                        <mesh position={[0.025, 0.03, 0.1]}>
                            <sphereGeometry args={[0.02, 10, 10]} />
                            <meshBasicMaterial color="#FFFFFF" />
                        </mesh>
                        {/* Secondary highlight */}
                        <mesh position={[-0.015, -0.02, 0.095]}>
                            <sphereGeometry args={[0.01, 8, 8]} />
                            <meshBasicMaterial color="#FFFFFF" opacity={0.7} transparent />
                        </mesh>
                        {/* Tiny tertiary highlight */}
                        <mesh position={[0.01, 0.015, 0.098]}>
                            <sphereGeometry args={[0.005, 6, 6]} />
                            <meshBasicMaterial color="#FFFFFF" opacity={0.5} transparent />
                        </mesh>
                        {/* Eye glow */}
                        <pointLight color={eyeOrange} intensity={0.8} distance={1.5} />
                    </group>

                    {/* Left Eye */}
                    <group position={[-0.12, 0.02, 0.32]}>
                        {/* Eye socket - deeper */}
                        <mesh position={[0, 0, -0.03]}>
                            <sphereGeometry args={[0.12, 16, 16]} />
                            <meshStandardMaterial color="#1A0A00" roughness={0.95} />
                        </mesh>
                        {/* Eye rim feathers */}
                        <mesh position={[0, 0, -0.01]}>
                            <torusGeometry args={[0.1, 0.015, 8, 20]} />
                            <meshStandardMaterial color={darkBrown} roughness={0.9} />
                        </mesh>
                        {/* Eye white/sclera */}
                        <mesh position={[0, 0, 0.01]}>
                            <sphereGeometry args={[0.1, 20, 20]} />
                            <meshStandardMaterial color="#FFFEF8" roughness={0.15} />
                        </mesh>
                        {/* Outer iris ring - darker orange */}
                        <mesh position={[0, 0, 0.05]}>
                            <sphereGeometry args={[0.09, 20, 20]} />
                            <meshStandardMaterial color={eyeRing} emissive="#802000" emissiveIntensity={0.2} roughness={0.25} />
                        </mesh>
                        {/* Main iris - orange */}
                        <mesh position={[0, 0, 0.06]}>
                            <sphereGeometry args={[0.08, 20, 20]} />
                            <meshStandardMaterial color={eyeOrange} emissive="#C04000" emissiveIntensity={0.35} roughness={0.2} />
                        </mesh>
                        {/* Inner iris gradient - brighter */}
                        <mesh position={[0, 0, 0.07]}>
                            <sphereGeometry args={[0.06, 16, 16]} />
                            <meshStandardMaterial color="#FF8030" emissive="#E05000" emissiveIntensity={0.3} roughness={0.15} />
                        </mesh>
                        {/* Iris texture rings */}
                        <mesh position={[0, 0, 0.075]}>
                            <torusGeometry args={[0.05, 0.008, 6, 20]} />
                            <meshStandardMaterial color={eyeRing} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0, 0.076]}>
                            <torusGeometry args={[0.035, 0.005, 6, 16]} />
                            <meshStandardMaterial color="#D06020" roughness={0.3} />
                        </mesh>
                        {/* Pupil - black with depth */}
                        <mesh position={[0, 0, 0.085]}>
                            <sphereGeometry args={[0.035, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        {/* Pupil inner - even darker */}
                        <mesh position={[0, 0, 0.09]}>
                            <sphereGeometry args={[0.025, 12, 12]} />
                            <meshBasicMaterial color="#000005" />
                        </mesh>
                        {/* Main highlight */}
                        <mesh position={[-0.025, 0.03, 0.1]}>
                            <sphereGeometry args={[0.02, 10, 10]} />
                            <meshBasicMaterial color="#FFFFFF" />
                        </mesh>
                        {/* Secondary highlight */}
                        <mesh position={[0.015, -0.02, 0.095]}>
                            <sphereGeometry args={[0.01, 8, 8]} />
                            <meshBasicMaterial color="#FFFFFF" opacity={0.7} transparent />
                        </mesh>
                        {/* Tiny tertiary highlight */}
                        <mesh position={[-0.01, 0.015, 0.098]}>
                            <sphereGeometry args={[0.005, 6, 6]} />
                            <meshBasicMaterial color="#FFFFFF" opacity={0.5} transparent />
                        </mesh>
                        {/* Eye glow */}
                        <pointLight color={eyeOrange} intensity={0.8} distance={1.5} />
                    </group>
                </group>

                {/* Beak - More detailed with nostrils and texture */}
                <group position={[0, -0.08, 0.38]}>
                    {/* Beak base/cere */}
                    <mesh position={[0, 0.04, -0.02]}>
                        <sphereGeometry args={[0.04, 10, 10]} />
                        <meshStandardMaterial color="#C8845C" roughness={0.6} />
                    </mesh>
                    {/* Upper beak - curved hook */}
                    <mesh position={[0, 0.02, 0]} rotation={[0.5, 0, 0]}>
                        <coneGeometry args={[0.045, 0.1, 12]} />
                        <meshStandardMaterial color={beakOrange} roughness={0.35} metalness={0.05} />
                    </mesh>
                    {/* Beak ridge */}
                    <mesh position={[0, 0.035, 0.02]} rotation={[0.4, 0, 0]}>
                        <boxGeometry args={[0.02, 0.06, 0.03]} />
                        <meshStandardMaterial color="#E08040" roughness={0.4} />
                    </mesh>
                    {/* Beak tip - hooked */}
                    <mesh position={[0, -0.04, 0.06]} rotation={[1.0, 0, 0]}>
                        <coneGeometry args={[0.02, 0.04, 8]} />
                        <meshStandardMaterial color="#A05020" roughness={0.3} />
                    </mesh>
                    {/* Nostrils */}
                    <mesh position={[0.015, 0.03, 0.01]}>
                        <sphereGeometry args={[0.008, 6, 6]} />
                        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
                    </mesh>
                    <mesh position={[-0.015, 0.03, 0.01]}>
                        <sphereGeometry args={[0.008, 6, 6]} />
                        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
                    </mesh>
                    {/* Beak highlight */}
                    <mesh position={[0, 0.03, 0.03]} rotation={[0.4, 0, 0]}>
                        <sphereGeometry args={[0.012, 8, 8]} />
                        <meshStandardMaterial color="#F0B080" roughness={0.2} />
                    </mesh>
                </group>

                {/* Chin/throat feathers */}
                <mesh position={[0, -0.18, 0.25]}>
                    <sphereGeometry args={[0.12, 12, 12]} />
                    <meshStandardMaterial color={cream} roughness={0.8} />
                </mesh>
                {/* Chin feather texture */}
                {[-0.04, 0, 0.04].map((offset, i) => (
                    <mesh key={`chin-feather-${i}`} position={[offset, -0.22, 0.22]} rotation={[0.3, 0, 0]}>
                        <boxGeometry args={[0.02, 0.04, 0.01]} />
                        <meshStandardMaterial color={tan} roughness={0.85} />
                    </mesh>
                ))}

                {/* Forehead feathers - more detailed with layers */}
                <mesh position={[0, 0.22, 0.12]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshStandardMaterial color={bodyBrown} roughness={0.9} />
                </mesh>
                {/* Forehead feather tufts */}
                {[-0.06, 0, 0.06].map((offset, i) => (
                    <mesh key={`forehead-tuft-${i}`} position={[offset, 0.3, 0.08]} rotation={[-0.3, 0, offset * 2]}>
                        <coneGeometry args={[0.025, 0.08, 4]} />
                        <meshStandardMaterial color={darkBrown} roughness={0.9} />
                    </mesh>
                ))}

                {/* Cheek feather details */}
                {[-1, 1].map((side) => (
                    <group key={`cheek-${side}`} position={[side * 0.22, -0.05, 0.2]}>
                        <mesh>
                            <sphereGeometry args={[0.08, 10, 10]} />
                            <meshStandardMaterial color={cream} roughness={0.8} />
                        </mesh>
                        {/* Cheek feather lines */}
                        {[0, 1, 2].map((i) => (
                            <mesh key={`cheek-line-${i}`} position={[side * 0.02, -0.02 - i * 0.02, 0.04]} rotation={[0, 0, side * 0.2]}>
                                <boxGeometry args={[0.03, 0.008, 0.01]} />
                                <meshStandardMaterial color={tan} roughness={0.85} />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>

            {/* Wings */}
            <group ref={wingRef} position={[0, 0.1, 0]}>
                {/* Right Wing - Large spread wing (wider) */}
                <group ref={rightWingRef} position={[0.55, 0, 0]} rotation={[0, 0.1, -0.2]}>
                    {/* Wing base - wider (Z increased from 0.6 to 0.9) */}
                    <mesh position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.7, 0.12, 0.9]} />
                        <meshStandardMaterial color={bodyBrown} roughness={0.85} />
                    </mesh>

                    {/* Wing middle section - wider (Z increased from 0.55 to 0.85) */}
                    <mesh position={[0.4, 0, 0.05]}>
                        <boxGeometry args={[0.5, 0.1, 0.85]} />
                        <meshStandardMaterial color={lightBrown} roughness={0.85} />
                    </mesh>

                    {/* Wing stripes/bands - wider (Z increased from 0.5 to 0.8) */}
                    {[0, 0.15, 0.3].map((offset, i) => (
                        <mesh key={`right-band-${i}`} position={[0.2 + i * 0.25, 0.07, 0]}>
                            <boxGeometry args={[0.15, 0.02, 0.8]} />
                            <meshStandardMaterial color={darkBrown} roughness={0.9} />
                        </mesh>
                    ))}

                    {/* Primary feathers - tips (spread wider in Z) */}
                    {[0, 0.12, 0.24, 0.36, 0.48].map((offset, i) => (
                        <mesh
                            key={`right-primary-${i}`}
                            position={[0.75 + i * 0.05, -0.02, offset - 0.24]}
                            rotation={[0, 0.2 * i, -0.05 * i]}
                        >
                            <boxGeometry args={[0.35, 0.04, 0.1]} />
                            <meshStandardMaterial color={i % 2 === 0 ? darkBrown : tan} roughness={0.9} />
                        </mesh>
                    ))}

                    {/* Secondary feathers - wider spread */}
                    {[0, 0.15, 0.3, 0.45].map((offset, i) => (
                        <mesh
                            key={`right-secondary-${i}`}
                            position={[0.5, -0.06, offset - 0.22]}
                        >
                            <boxGeometry args={[0.25, 0.03, 0.12]} />
                            <meshStandardMaterial color={tan} roughness={0.9} />
                        </mesh>
                    ))}
                </group>

                {/* Left Wing - Mirror (wider) */}
                <group ref={leftWingRef} position={[-0.55, 0, 0]} rotation={[0, -0.1, 0.2]}>
                    {/* Wing base - wider (Z increased from 0.6 to 0.9) */}
                    <mesh position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.7, 0.12, 0.9]} />
                        <meshStandardMaterial color={bodyBrown} roughness={0.85} />
                    </mesh>

                    {/* Wing middle section - wider (Z increased from 0.55 to 0.85) */}
                    <mesh position={[-0.4, 0, 0.05]}>
                        <boxGeometry args={[0.5, 0.1, 0.85]} />
                        <meshStandardMaterial color={lightBrown} roughness={0.85} />
                    </mesh>

                    {/* Wing stripes/bands - wider (Z increased from 0.5 to 0.8) */}
                    {[0, 0.15, 0.3].map((offset, i) => (
                        <mesh key={`left-band-${i}`} position={[-0.2 - i * 0.25, 0.07, 0]}>
                            <boxGeometry args={[0.15, 0.02, 0.8]} />
                            <meshStandardMaterial color={darkBrown} roughness={0.9} />
                        </mesh>
                    ))}

                    {/* Primary feathers - tips (spread wider in Z) */}
                    {[0, 0.12, 0.24, 0.36, 0.48].map((offset, i) => (
                        <mesh
                            key={`left-primary-${i}`}
                            position={[-0.75 - i * 0.05, -0.02, offset - 0.24]}
                            rotation={[0, -0.2 * i, 0.05 * i]}
                        >
                            <boxGeometry args={[0.35, 0.04, 0.1]} />
                            <meshStandardMaterial color={i % 2 === 0 ? darkBrown : tan} roughness={0.9} />
                        </mesh>
                    ))}

                    {/* Secondary feathers - wider spread */}
                    {[0, 0.15, 0.3, 0.45].map((offset, i) => (
                        <mesh
                            key={`left-secondary-${i}`}
                            position={[-0.5, -0.06, offset - 0.22]}
                        >
                            <boxGeometry args={[0.25, 0.03, 0.12]} />
                            <meshStandardMaterial color={tan} roughness={0.9} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* Tail Feathers - Fan shape */}
            <group position={[0, -0.1, -0.6]} rotation={[0.3, 0, 0]}>
                {[-0.15, -0.08, 0, 0.08, 0.15].map((offset, i) => (
                    <group key={`tail-${i}`}>
                        <mesh position={[offset, 0, -0.15]} rotation={[0.1, offset * 0.5, 0]}>
                            <boxGeometry args={[0.1, 0.04, 0.4]} />
                            <meshStandardMaterial color={i % 2 === 0 ? bodyBrown : tan} roughness={0.9} />
                        </mesh>
                        {/* Tail stripe */}
                        <mesh position={[offset, 0.025, -0.25]} rotation={[0.1, offset * 0.5, 0]}>
                            <boxGeometry args={[0.08, 0.02, 0.15]} />
                            <meshStandardMaterial color={darkBrown} roughness={0.9} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Feet/Talons */}
            <group ref={feetRef} position={[0, -0.5, 0.2]}>
                {/* Right foot */}
                <group position={[0.12, 0, 0]}>
                    {/* Leg feathers */}
                    <mesh position={[0, 0.15, 0]} rotation={[0.2, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.25, 8]} />
                        <meshStandardMaterial color={tan} roughness={0.9} />
                    </mesh>
                    {/* Foot */}
                    <mesh position={[0, -0.05, 0.05]}>
                        <sphereGeometry args={[0.08, 10, 10]} />
                        <meshStandardMaterial color="#C9A86C" roughness={0.6} />
                    </mesh>
                    {/* Talons */}
                    {[-0.05, 0, 0.05, -0.02].map((offset, i) => (
                        <mesh
                            key={`right-talon-${i}`}
                            position={[offset, -0.18, i === 3 ? -0.02 : 0.08]}
                            rotation={[i === 3 ? -0.5 : 0.4, offset * 1.2, 0]}
                        >
                            <coneGeometry args={[0.02, 0.15, 6]} />
                            <meshStandardMaterial color="#1A1A1A" metalness={0.4} roughness={0.3} />
                        </mesh>
                    ))}
                </group>

                {/* Left foot */}
                <group position={[-0.12, 0, 0]}>
                    {/* Leg feathers */}
                    <mesh position={[0, 0.15, 0]} rotation={[0.2, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.25, 8]} />
                        <meshStandardMaterial color={tan} roughness={0.9} />
                    </mesh>
                    {/* Foot */}
                    <mesh position={[0, -0.05, 0.05]}>
                        <sphereGeometry args={[0.08, 10, 10]} />
                        <meshStandardMaterial color="#C9A86C" roughness={0.6} />
                    </mesh>
                    {/* Talons */}
                    {[-0.05, 0, 0.05, -0.02].map((offset, i) => (
                        <mesh
                            key={`left-talon-${i}`}
                            position={[offset, -0.18, i === 3 ? -0.02 : 0.08]}
                            rotation={[i === 3 ? -0.5 : 0.4, offset * 1.2, 0]}
                        >
                            <coneGeometry args={[0.02, 0.15, 6]} />
                            <meshStandardMaterial color="#1A1A1A" metalness={0.4} roughness={0.3} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* Eye glow light - orange for owl */}
            <pointLight color={eyeOrange} intensity={1.5} distance={3} position={[0, 0.3, 1]} />

            {/* Shadow */}
            <mesh geometry={SHADOW_EAGLE_GEO} position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.6}>
                <meshBasicMaterial color="#000000" opacity={0.4} transparent />
            </mesh>
        </group>
    );
};

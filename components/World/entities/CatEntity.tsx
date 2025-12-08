/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject, GameStatus } from '../../../types';
import { useStore } from '../../../store';
import { SHADOW_CAT_GEO } from '../geometries';

interface CatEntityProps {
    data: GameObject;
}

export const CatEntity: React.FC<CatEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { status } = useStore();

    // Animation refs
    const frontRightPawRef = useRef<THREE.Group>(null);
    const frontLeftPawRef = useRef<THREE.Group>(null);
    const backRightLegRef = useRef<THREE.Group>(null);
    const backLeftLegRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const tailRef = useRef<THREE.Group>(null);
    const tailMidRef = useRef<THREE.Group>(null);
    const tailTipRef = useRef<THREE.Group>(null);
    const tailCurlRef = useRef<THREE.Group>(null);
    const jawRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const rightEarRef = useRef<THREE.Group>(null);
    const leftEarRef = useRef<THREE.Group>(null);
    const prevCatX = useRef<number>(data.position[0]);

    // Colors - cartoon Halloween black cat style (matching reference image)
    const furBlack = "#080808";
    const furDark = "#101010";
    const furHighlight = "#1a1a1a";
    const eyeOrange = "#FF9500";
    const eyeYellow = "#FFD700";
    const eyeGlow = "#FFAA00";
    const mouthRed = "#AA1100";
    const mouthDark = "#550000";
    const tongueRed = "#DD3344";
    const tonguePink = "#FF6677";
    const innerEar = "#2a1515";
    const pawPads = "#221515";
    const pawPadPink = "#3a2020";
    const clawWhite = "#dddddd";
    const noseColor = "#1a0a0a";

    // Fur spike generator for bristled effect on back - more dramatic arch
    const furSpikes = useMemo(() => {
        const spikes: Array<{ x: number; y: number; z: number; rotX: number; rotZ: number; scale: number; side: number }> = [];
        // Center spine spikes (main arch)
        for (let i = 0; i < 14; i++) {
            const t = i / 13;
            const z = 0.45 - t * 1.1;
            const archHeight = Math.sin(t * Math.PI) * 0.2;
            const y = 0.68 + archHeight;
            spikes.push({
                x: 0, y, z,
                rotX: -0.4 + t * 0.5,
                rotZ: 0,
                scale: 0.09 + Math.sin(t * Math.PI) * 0.07,
                side: 0
            });
        }
        // Side spikes for volume
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const z = 0.35 - t * 0.9;
            const archHeight = Math.sin(t * Math.PI) * 0.15;
            const y = 0.62 + archHeight;
            // Left side
            spikes.push({
                x: -0.12, y, z,
                rotX: -0.3 + t * 0.4,
                rotZ: -0.4,
                scale: 0.06 + Math.sin(t * Math.PI) * 0.04,
                side: -1
            });
            // Right side
            spikes.push({
                x: 0.12, y, z,
                rotX: -0.3 + t * 0.4,
                rotZ: 0.4,
                scale: 0.06 + Math.sin(t * Math.PI) * 0.04,
                side: 1
            });
        }
        return spikes;
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;
        const runSpeed = 14;
        const runCycle = time * runSpeed;

        // Body bounce while running - more pronounced gallop
        if (bodyRef.current) {
            bodyRef.current.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.1;
            bodyRef.current.rotation.z = Math.sin(runCycle) * 0.04;
            bodyRef.current.rotation.x = Math.sin(runCycle * 2) * 0.03;
        }

        // Front paw attack animation - aggressive swiping like in reference
        if (frontRightPawRef.current) {
            const rightSwipe = Math.sin(runCycle);
            frontRightPawRef.current.rotation.x = rightSwipe * 0.7 - 0.9;
            frontRightPawRef.current.rotation.z = rightSwipe * 0.25 + 0.1;
            frontRightPawRef.current.position.y = 0.75 + Math.max(0, rightSwipe) * 0.25;
        }
        if (frontLeftPawRef.current) {
            const leftSwipe = Math.sin(runCycle + Math.PI);
            frontLeftPawRef.current.rotation.x = leftSwipe * 0.7 - 0.9;
            frontLeftPawRef.current.rotation.z = -leftSwipe * 0.25 - 0.1;
            frontLeftPawRef.current.position.y = 0.75 + Math.max(0, leftSwipe) * 0.25;
        }

        // Back legs running - powerful push
        if (backRightLegRef.current) {
            backRightLegRef.current.rotation.x = Math.sin(runCycle) * 0.6;
        }
        if (backLeftLegRef.current) {
            backLeftLegRef.current.rotation.x = Math.sin(runCycle + Math.PI) * 0.6;
        }

        // Bristled tail - nervous twitching with S-curve like reference
        if (tailRef.current) {
            tailRef.current.rotation.z = Math.sin(time * 10) * 0.35;
            tailRef.current.rotation.x = -0.1 + Math.sin(time * 5) * 0.15;
        }
        if (tailMidRef.current) {
            tailMidRef.current.rotation.z = Math.sin(time * 12 + 0.5) * 0.45;
            tailMidRef.current.rotation.x = Math.sin(time * 6) * 0.1;
        }
        if (tailTipRef.current) {
            tailTipRef.current.rotation.z = Math.sin(time * 14 + 1) * 0.5;
        }
        // Curled tip animation
        if (tailCurlRef.current) {
            tailCurlRef.current.rotation.z = Math.sin(time * 16 + 1.5) * 0.3 + 0.5;
        }

        // Ears twitching - alert and aggressive
        if (rightEarRef.current) {
            rightEarRef.current.rotation.z = 0.25 + Math.sin(time * 4) * 0.1;
            rightEarRef.current.rotation.x = 0.1 + Math.sin(time * 5 + 1) * 0.08;
        }
        if (leftEarRef.current) {
            leftEarRef.current.rotation.z = -0.25 + Math.sin(time * 4 + 0.5) * 0.1;
            leftEarRef.current.rotation.x = 0.1 + Math.sin(time * 5 + 2) * 0.08;
        }

        // Head tracking and hissing
        const currentX = data.position[0];
        const deltaX = currentX - prevCatX.current;
        prevCatX.current = THREE.MathUtils.lerp(prevCatX.current, currentX, 0.1);

        if (headRef.current) {
            const targetLean = THREE.MathUtils.clamp(deltaX * 8, -0.4, 0.4);
            headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetLean * 0.5, 0.1);
            // Aggressive forward tilt
            headRef.current.rotation.x = Math.sin(time * 3) * 0.06 - 0.12;
        }

        // Jaw hissing animation - more dramatic
        if (jawRef.current) {
            const hissPhase = Math.sin(time * 2.5);
            if (hissPhase > 0.4) {
                jawRef.current.rotation.x = 0.35 + Math.abs(Math.sin(time * 18)) * 0.25;
            } else {
                jawRef.current.rotation.x = 0.18 + Math.sin(time * 8) * 0.05;
            }
        }

        // Body lean on lane change
        if (groupRef.current) {
            const targetLean = THREE.MathUtils.clamp(deltaX * 10, -0.5, 0.5);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetLean, 0.12);
        }
    });

    return (
        <group ref={groupRef} scale={1.66}>
            {/* Main body group */}
            <group ref={bodyRef}>
                {/* Body - sleek arched back silhouette like reference */}
                <mesh position={[0, 0.48, 0]} rotation={[0.25, 0, 0]} castShadow>
                    <capsuleGeometry args={[0.26, 0.85, 8, 16]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Arched spine bump - more pronounced */}
                <mesh position={[0, 0.72, -0.05]} castShadow>
                    <sphereGeometry args={[0.23, 16, 16]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Secondary spine arch */}
                <mesh position={[0, 0.68, -0.25]} castShadow>
                    <sphereGeometry args={[0.2, 12, 12]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Chest - forward leaning */}
                <mesh position={[0, 0.52, 0.38]} castShadow>
                    <sphereGeometry args={[0.28, 16, 16]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Shoulder blades */}
                <mesh position={[0.1, 0.6, 0.25]} castShadow>
                    <sphereGeometry args={[0.15, 10, 10]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                <mesh position={[-0.1, 0.6, 0.25]} castShadow>
                    <sphereGeometry args={[0.15, 10, 10]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>

                {/* Hip */}
                <mesh position={[0, 0.42, -0.42]} castShadow>
                    <sphereGeometry args={[0.26, 12, 12]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Belly tuck - slender body */}
                <mesh position={[0, 0.38, 0]} castShadow>
                    <capsuleGeometry args={[0.18, 0.5, 6, 10]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>

                {/* Bristled fur spikes on back - dramatic arch */}
                {furSpikes.map((spike, i) => (
                    <mesh
                        key={`spine-fur-${i}`}
                        position={[spike.x, spike.y, spike.z]}
                        rotation={[spike.rotX, 0, spike.rotZ]}
                    >
                        <coneGeometry args={[spike.scale, spike.scale * 3.5, 4]} />
                        <meshStandardMaterial color={furBlack} roughness={1} />
                    </mesh>
                ))}
            </group>

            {/* Head Group */}
            <group ref={headRef} position={[0, 0.82, 0.52]}>
                {/* Main head - round cartoon style */}
                <mesh castShadow>
                    <sphereGeometry args={[0.34, 20, 20]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Forehead bump */}
                <mesh position={[0, 0.12, 0.15]} castShadow>
                    <sphereGeometry args={[0.22, 12, 12]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Cheeks - fluffy */}
                <mesh position={[0.2, -0.06, 0.12]}>
                    <sphereGeometry args={[0.16, 12, 12]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                <mesh position={[-0.2, -0.06, 0.12]}>
                    <sphereGeometry args={[0.16, 12, 12]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>

                {/* Muzzle - more defined */}
                <mesh position={[0, -0.1, 0.26]}>
                    <sphereGeometry args={[0.14, 14, 14]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                {/* Upper muzzle bump */}
                <mesh position={[0, -0.02, 0.32]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>

                {/* Nose - triangle pointing down like reference */}
                <mesh position={[0, -0.02, 0.42]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.045, 0.055, 3]} />
                    <meshStandardMaterial color={noseColor} roughness={0.3} metalness={0.1} />
                </mesh>
                {/* Nose highlight */}
                <mesh position={[0, 0, 0.445]}>
                    <sphereGeometry args={[0.015, 6, 6]} />
                    <meshStandardMaterial color="#2a1515" roughness={0.2} />
                </mesh>

                {/* EYES - Big glowing orange/yellow cartoon eyes like reference */}
                <group>
                    {/* Right Eye - angry slant */}
                    <group position={[0.13, 0.06, 0.2]} rotation={[0, 0.1, 0.15]}>
                        {/* Eye socket shadow */}
                        <mesh position={[0, 0, -0.02]}>
                            <sphereGeometry args={[0.14, 14, 14]} />
                            <meshStandardMaterial color="#000000" roughness={1} />
                        </mesh>
                        {/* Outer glow */}
                        <mesh>
                            <sphereGeometry args={[0.135, 18, 18]} />
                            <meshBasicMaterial color={eyeYellow} />
                        </mesh>
                        {/* Orange gradient middle */}
                        <mesh position={[0, 0, 0.035]}>
                            <sphereGeometry args={[0.115, 14, 14]} />
                            <meshBasicMaterial color={eyeOrange} />
                        </mesh>
                        {/* Yellow bright center */}
                        <mesh position={[0, 0, 0.065]}>
                            <sphereGeometry args={[0.09, 12, 12]} />
                            <meshBasicMaterial color={eyeGlow} />
                        </mesh>
                        {/* Inner yellow core */}
                        <mesh position={[0, 0, 0.085]}>
                            <sphereGeometry args={[0.06, 10, 10]} />
                            <meshBasicMaterial color={eyeYellow} />
                        </mesh>
                        {/* Black vertical slit pupil - narrow and menacing */}
                        <mesh position={[0, 0, 0.11]}>
                            <boxGeometry args={[0.02, 0.16, 0.015]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        {/* Pupil taper top */}
                        <mesh position={[0, 0.06, 0.11]} rotation={[0, 0, 0]}>
                            <coneGeometry args={[0.015, 0.04, 4]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        {/* Pupil taper bottom */}
                        <mesh position={[0, -0.06, 0.11]} rotation={[Math.PI, 0, 0]}>
                            <coneGeometry args={[0.015, 0.04, 4]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        {/* Eye shine - primary */}
                        <mesh position={[0.035, 0.04, 0.12]}>
                            <sphereGeometry args={[0.022, 8, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        {/* Eye shine - secondary smaller */}
                        <mesh position={[-0.02, -0.03, 0.115]}>
                            <sphereGeometry args={[0.012, 6, 6]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        {/* Eye glow light */}
                        <pointLight color="#FF8800" intensity={2} distance={2.5} />
                    </group>

                    {/* Left Eye - angry slant */}
                    <group position={[-0.13, 0.06, 0.2]} rotation={[0, -0.1, -0.15]}>
                        <mesh position={[0, 0, -0.02]}>
                            <sphereGeometry args={[0.14, 14, 14]} />
                            <meshStandardMaterial color="#000000" roughness={1} />
                        </mesh>
                        <mesh>
                            <sphereGeometry args={[0.135, 18, 18]} />
                            <meshBasicMaterial color={eyeYellow} />
                        </mesh>
                        <mesh position={[0, 0, 0.035]}>
                            <sphereGeometry args={[0.115, 14, 14]} />
                            <meshBasicMaterial color={eyeOrange} />
                        </mesh>
                        <mesh position={[0, 0, 0.065]}>
                            <sphereGeometry args={[0.09, 12, 12]} />
                            <meshBasicMaterial color={eyeGlow} />
                        </mesh>
                        <mesh position={[0, 0, 0.085]}>
                            <sphereGeometry args={[0.06, 10, 10]} />
                            <meshBasicMaterial color={eyeYellow} />
                        </mesh>
                        <mesh position={[0, 0, 0.11]}>
                            <boxGeometry args={[0.02, 0.16, 0.015]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        <mesh position={[0, 0.06, 0.11]}>
                            <coneGeometry args={[0.015, 0.04, 4]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        <mesh position={[0, -0.06, 0.11]} rotation={[Math.PI, 0, 0]}>
                            <coneGeometry args={[0.015, 0.04, 4]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        <mesh position={[-0.035, 0.04, 0.12]}>
                            <sphereGeometry args={[0.022, 8, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        <mesh position={[0.02, -0.03, 0.115]}>
                            <sphereGeometry args={[0.012, 6, 6]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        <pointLight color="#FF8800" intensity={2} distance={2.5} />
                    </group>
                </group>

                {/* Brow ridge - angry expression */}
                <mesh position={[0.08, 0.16, 0.26]} rotation={[0.2, 0.2, 0.3]}>
                    <boxGeometry args={[0.12, 0.03, 0.06]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                <mesh position={[-0.08, 0.16, 0.26]} rotation={[0.2, -0.2, -0.3]}>
                    <boxGeometry args={[0.12, 0.03, 0.06]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Ears - Large pointed triangular with fur tufts */}
                <group ref={rightEarRef} position={[0.22, 0.32, -0.02]} rotation={[0.1, 0.25, 0.25]}>
                    <mesh castShadow>
                        <coneGeometry args={[0.13, 0.38, 4]} />
                        <meshStandardMaterial color={furBlack} roughness={0.95} />
                    </mesh>
                    {/* Inner ear */}
                    <mesh position={[0, -0.03, 0.035]} rotation={[0.15, 0, 0]}>
                        <coneGeometry args={[0.075, 0.25, 4]} />
                        <meshStandardMaterial color={innerEar} roughness={0.9} />
                    </mesh>
                    {/* Ear fur tuft */}
                    <mesh position={[0, 0.2, 0]}>
                        <coneGeometry args={[0.03, 0.08, 3]} />
                        <meshStandardMaterial color={furBlack} roughness={1} />
                    </mesh>
                </group>
                <group ref={leftEarRef} position={[-0.22, 0.32, -0.02]} rotation={[0.1, -0.25, -0.25]}>
                    <mesh castShadow>
                        <coneGeometry args={[0.13, 0.38, 4]} />
                        <meshStandardMaterial color={furBlack} roughness={0.95} />
                    </mesh>
                    <mesh position={[0, -0.03, 0.035]} rotation={[0.15, 0, 0]}>
                        <coneGeometry args={[0.075, 0.25, 4]} />
                        <meshStandardMaterial color={innerEar} roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.2, 0]}>
                        <coneGeometry args={[0.03, 0.08, 3]} />
                        <meshStandardMaterial color={furBlack} roughness={1} />
                    </mesh>
                </group>

                {/* Mouth - Open red hissing mouth with depth */}
                <mesh position={[0, -0.16, 0.18]}>
                    <sphereGeometry args={[0.11, 12, 12]} />
                    <meshBasicMaterial color={mouthDark} />
                </mesh>
                {/* Mouth opening highlight */}
                <mesh position={[0, -0.14, 0.24]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshBasicMaterial color={mouthRed} />
                </mesh>

                {/* Animated Jaw group */}
                <group ref={jawRef} position={[0, -0.21, 0.14]}>
                    {/* Lower jaw */}
                    <mesh>
                        <boxGeometry args={[0.16, 0.055, 0.14]} />
                        <meshStandardMaterial color={furBlack} roughness={0.95} />
                    </mesh>
                    {/* Lower jaw chin */}
                    <mesh position={[0, -0.02, 0.05]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color={furDark} roughness={0.95} />
                    </mesh>
                    {/* Tongue - more detailed */}
                    <mesh position={[0, 0.025, 0.04]} rotation={[0.35, 0, 0]}>
                        <capsuleGeometry args={[0.04, 0.08, 6, 8]} />
                        <meshStandardMaterial color={tongueRed} roughness={0.5} />
                    </mesh>
                    {/* Tongue tip */}
                    <mesh position={[0, 0.03, 0.1]} rotation={[0.5, 0, 0]}>
                        <sphereGeometry args={[0.025, 8, 8]} />
                        <meshStandardMaterial color={tonguePink} roughness={0.4} />
                    </mesh>
                    {/* Tongue groove */}
                    <mesh position={[0, 0.035, 0.06]} rotation={[0.35, 0, 0]}>
                        <boxGeometry args={[0.01, 0.005, 0.06]} />
                        <meshStandardMaterial color={mouthRed} roughness={0.6} />
                    </mesh>
                </group>

                {/* Fangs - Large and menacing */}
                <mesh position={[0.055, -0.17, 0.32]} rotation={[0.12, 0, 0.05]}>
                    <coneGeometry args={[0.022, 0.14, 8]} />
                    <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
                </mesh>
                <mesh position={[-0.055, -0.17, 0.32]} rotation={[0.12, 0, -0.05]}>
                    <coneGeometry args={[0.022, 0.14, 8]} />
                    <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
                </mesh>
                {/* Upper teeth row */}
                {[-0.025, 0, 0.025].map((offset, i) => (
                    <mesh key={`upper-tooth-${i}`} position={[offset, -0.15, 0.34]} rotation={[0.1, 0, 0]}>
                        <coneGeometry args={[0.012, 0.05, 6]} />
                        <meshStandardMaterial color="#EEEEEE" roughness={0.3} />
                    </mesh>
                ))}

                {/* Whiskers - prominent cartoon style like reference */}
                {[-1, 1].map((side) => (
                    <group key={`whiskers-${side}`}>
                        {[0.035, 0, -0.035].map((yOff, i) => (
                            <mesh
                                key={i}
                                position={[side * 0.18, yOff - 0.04, 0.3]}
                                rotation={[yOff * 2.5, 0, side * (0.12 + i * 0.1)]}
                            >
                                <cylinderGeometry args={[0.006, 0.003, 0.35, 4]} />
                                <meshStandardMaterial color="#222222" roughness={0.8} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Cheek fur tufts */}
                <mesh position={[0.24, -0.08, 0.08]} rotation={[0, 0.3, 0.5]}>
                    <coneGeometry args={[0.04, 0.1, 4]} />
                    <meshStandardMaterial color={furBlack} roughness={1} />
                </mesh>
                <mesh position={[-0.24, -0.08, 0.08]} rotation={[0, -0.3, -0.5]}>
                    <coneGeometry args={[0.04, 0.1, 4]} />
                    <meshStandardMaterial color={furBlack} roughness={1} />
                </mesh>
            </group>

            {/* Front Right Paw - raised attack pose with detailed paw */}
            <group ref={frontRightPawRef} position={[0.18, 0.75, 0.38]} rotation={[-0.9, 0, 0.12]}>
                {/* Upper arm */}
                <mesh castShadow>
                    <capsuleGeometry args={[0.065, 0.24, 6, 10]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                {/* Elbow joint */}
                <mesh position={[0, -0.16, 0]}>
                    <sphereGeometry args={[0.055, 8, 8]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                {/* Lower arm */}
                <mesh position={[0, -0.3, 0]}>
                    <capsuleGeometry args={[0.05, 0.2, 6, 8]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                {/* Paw - main pad */}
                <mesh position={[0, -0.44, 0.02]}>
                    <sphereGeometry args={[0.085, 12, 12]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                {/* Paw pad - main */}
                <mesh position={[0, -0.48, 0.08]}>
                    <sphereGeometry args={[0.045, 8, 8]} />
                    <meshStandardMaterial color={pawPadPink} roughness={0.8} />
                </mesh>
                {/* Toe pads */}
                {[-0.035, 0, 0.035].map((offset, idx) => (
                    <mesh key={`toe-pad-r-${idx}`} position={[offset, -0.49, 0.1]}>
                        <sphereGeometry args={[0.02, 6, 6]} />
                        <meshStandardMaterial color={pawPadPink} roughness={0.8} />
                    </mesh>
                ))}
                {/* Claws extended - longer and sharper */}
                {[-0.04, 0, 0.04].map((offset, idx) => (
                    <group key={`claw-r-${idx}`}>
                        <mesh position={[offset, -0.5, 0.12]} rotation={[0.5, 0, offset * 2]}>
                            <coneGeometry args={[0.012, 0.12, 6]} />
                            <meshStandardMaterial color={clawWhite} roughness={0.3} metalness={0.1} />
                        </mesh>
                        {/* Claw base */}
                        <mesh position={[offset, -0.485, 0.1]}>
                            <sphereGeometry args={[0.015, 6, 6]} />
                            <meshStandardMaterial color={furDark} roughness={0.9} />
                        </mesh>
                    </group>
                ))}
                {/* Dewclaw */}
                <mesh position={[0.05, -0.42, 0.02]} rotation={[0.3, 0, 0.5]}>
                    <coneGeometry args={[0.008, 0.06, 4]} />
                    <meshStandardMaterial color={clawWhite} roughness={0.3} />
                </mesh>
            </group>

            {/* Front Left Paw - raised attack pose with detailed paw */}
            <group ref={frontLeftPawRef} position={[-0.18, 0.75, 0.38]} rotation={[-0.9, 0, -0.12]}>
                <mesh castShadow>
                    <capsuleGeometry args={[0.065, 0.24, 6, 10]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.16, 0]}>
                    <sphereGeometry args={[0.055, 8, 8]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.3, 0]}>
                    <capsuleGeometry args={[0.05, 0.2, 6, 8]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.44, 0.02]}>
                    <sphereGeometry args={[0.085, 12, 12]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.48, 0.08]}>
                    <sphereGeometry args={[0.045, 8, 8]} />
                    <meshStandardMaterial color={pawPadPink} roughness={0.8} />
                </mesh>
                {[-0.035, 0, 0.035].map((offset, idx) => (
                    <mesh key={`toe-pad-l-${idx}`} position={[offset, -0.49, 0.1]}>
                        <sphereGeometry args={[0.02, 6, 6]} />
                        <meshStandardMaterial color={pawPadPink} roughness={0.8} />
                    </mesh>
                ))}
                {[-0.04, 0, 0.04].map((offset, idx) => (
                    <group key={`claw-l-${idx}`}>
                        <mesh position={[offset, -0.5, 0.12]} rotation={[0.5, 0, -offset * 2]}>
                            <coneGeometry args={[0.012, 0.12, 6]} />
                            <meshStandardMaterial color={clawWhite} roughness={0.3} metalness={0.1} />
                        </mesh>
                        <mesh position={[offset, -0.485, 0.1]}>
                            <sphereGeometry args={[0.015, 6, 6]} />
                            <meshStandardMaterial color={furDark} roughness={0.9} />
                        </mesh>
                    </group>
                ))}
                <mesh position={[-0.05, -0.42, 0.02]} rotation={[0.3, 0, -0.5]}>
                    <coneGeometry args={[0.008, 0.06, 4]} />
                    <meshStandardMaterial color={clawWhite} roughness={0.3} />
                </mesh>
            </group>

            {/* Back Right Leg - more muscular */}
            <group ref={backRightLegRef} position={[0.14, 0.32, -0.38]}>
                {/* Upper thigh */}
                <mesh position={[0, 0.02, 0]} castShadow>
                    <capsuleGeometry args={[0.085, 0.28, 6, 10]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                {/* Knee joint */}
                <mesh position={[0, -0.18, 0.04]}>
                    <sphereGeometry args={[0.065, 8, 8]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                {/* Lower leg */}
                <mesh position={[0, -0.32, 0.06]}>
                    <capsuleGeometry args={[0.06, 0.24, 6, 8]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                {/* Ankle */}
                <mesh position={[0, -0.48, 0.08]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                {/* Paw */}
                <mesh position={[0, -0.54, 0.1]}>
                    <sphereGeometry args={[0.075, 10, 10]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                {/* Main paw pad */}
                <mesh position={[0, -0.57, 0.14]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color={pawPads} roughness={0.85} />
                </mesh>
                {/* Toe pads */}
                {[-0.03, 0, 0.03].map((offset, idx) => (
                    <mesh key={`back-toe-r-${idx}`} position={[offset, -0.57, 0.16]}>
                        <sphereGeometry args={[0.018, 6, 6]} />
                        <meshStandardMaterial color={pawPadPink} roughness={0.85} />
                    </mesh>
                ))}
            </group>

            {/* Back Left Leg */}
            <group ref={backLeftLegRef} position={[-0.14, 0.32, -0.38]}>
                <mesh position={[0, 0.02, 0]} castShadow>
                    <capsuleGeometry args={[0.085, 0.28, 6, 10]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.18, 0.04]}>
                    <sphereGeometry args={[0.065, 8, 8]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.32, 0.06]}>
                    <capsuleGeometry args={[0.06, 0.24, 6, 8]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.48, 0.08]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.54, 0.1]}>
                    <sphereGeometry args={[0.075, 10, 10]} />
                    <meshStandardMaterial color={furDark} roughness={0.95} />
                </mesh>
                <mesh position={[0, -0.57, 0.14]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color={pawPads} roughness={0.85} />
                </mesh>
                {[-0.03, 0, 0.03].map((offset, idx) => (
                    <mesh key={`back-toe-l-${idx}`} position={[offset, -0.57, 0.16]}>
                        <sphereGeometry args={[0.018, 6, 6]} />
                        <meshStandardMaterial color={pawPadPink} roughness={0.85} />
                    </mesh>
                ))}
            </group>

            {/* Tail - Bristled upright with curled tip like reference */}
            <group ref={tailRef} position={[0, 0.52, -0.52]} rotation={[-0.2, 0, 0]}>
                {/* Tail base - thicker */}
                <mesh>
                    <capsuleGeometry args={[0.055, 0.28, 6, 10]} />
                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                </mesh>

                {/* Bristled fur on base - denser */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                    <mesh
                        key={`tail-fur-base-${i}`}
                        position={[
                            Math.cos(i * Math.PI / 6) * 0.055,
                            (i % 3) * 0.08 - 0.08,
                            Math.sin(i * Math.PI / 6) * 0.055
                        ]}
                        rotation={[Math.sin(i) * 0.2, 0, (i * Math.PI / 6)]}
                    >
                        <coneGeometry args={[0.032, 0.11, 3]} />
                        <meshStandardMaterial color={furBlack} roughness={1} />
                    </mesh>
                ))}

                {/* Middle section */}
                <group ref={tailMidRef} position={[0, 0.22, 0]} rotation={[0.15, 0, 0]}>
                    <mesh>
                        <capsuleGeometry args={[0.05, 0.24, 6, 10]} />
                        <meshStandardMaterial color={furBlack} roughness={0.95} />
                    </mesh>

                    {/* Bristled fur on middle - even denser */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                        <mesh
                            key={`tail-fur-mid-${i}`}
                            position={[
                                Math.cos(i * Math.PI / 6) * 0.05,
                                (i % 3) * 0.06 - 0.06,
                                Math.sin(i * Math.PI / 6) * 0.05
                            ]}
                            rotation={[Math.sin(i) * 0.3, 0, (i * Math.PI / 6)]}
                        >
                            <coneGeometry args={[0.038, 0.13, 3]} />
                            <meshStandardMaterial color={furBlack} roughness={1} />
                        </mesh>
                    ))}

                    {/* Tip section */}
                    <group ref={tailTipRef} position={[0, 0.2, 0]} rotation={[0.1, 0, 0]}>
                        <mesh>
                            <capsuleGeometry args={[0.042, 0.18, 6, 8]} />
                            <meshStandardMaterial color={furBlack} roughness={0.95} />
                        </mesh>

                        {/* Bristled fur on tip - very spiky */}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                            <mesh
                                key={`tail-fur-tip-${i}`}
                                position={[
                                    Math.cos(i * Math.PI / 8) * 0.042,
                                    (i % 4) * 0.04 - 0.06,
                                    Math.sin(i * Math.PI / 8) * 0.042
                                ]}
                                rotation={[Math.sin(i) * 0.4, 0, (i * Math.PI / 8)]}
                            >
                                <coneGeometry args={[0.035, 0.12, 3]} />
                                <meshStandardMaterial color={furBlack} roughness={1} />
                            </mesh>
                        ))}

                        {/* Curled tip section - like reference image */}
                        <group ref={tailCurlRef} position={[0, 0.15, 0]} rotation={[0.3, 0, 0.4]}>
                            <mesh>
                                <capsuleGeometry args={[0.035, 0.14, 4, 8]} />
                                <meshStandardMaterial color={furBlack} roughness={0.95} />
                            </mesh>

                            {/* Curl fur spikes */}
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <mesh
                                    key={`tail-curl-fur-${i}`}
                                    position={[
                                        Math.cos(i * Math.PI / 4) * 0.035,
                                        (i % 2) * 0.04 - 0.02,
                                        Math.sin(i * Math.PI / 4) * 0.035
                                    ]}
                                    rotation={[0, 0, (i * Math.PI / 4)]}
                                >
                                    <coneGeometry args={[0.03, 0.1, 3]} />
                                    <meshStandardMaterial color={furBlack} roughness={1} />
                                </mesh>
                            ))}

                            {/* Very tip - curled end */}
                            <group position={[0.02, 0.1, 0.02]} rotation={[0.5, 0, 0.8]}>
                                <mesh>
                                    <capsuleGeometry args={[0.028, 0.1, 4, 6]} />
                                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                                </mesh>
                                {/* Final tuft */}
                                <mesh position={[0, 0.08, 0]}>
                                    <sphereGeometry args={[0.045, 8, 8]} />
                                    <meshStandardMaterial color={furBlack} roughness={0.95} />
                                </mesh>
                                {/* Tip spikes */}
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <mesh
                                        key={`tail-end-${i}`}
                                        position={[
                                            Math.cos(i * Math.PI / 3) * 0.04,
                                            0.08,
                                            Math.sin(i * Math.PI / 3) * 0.04
                                        ]}
                                        rotation={[Math.sin(i), 0, (i * Math.PI / 3)]}
                                    >
                                        <coneGeometry args={[0.025, 0.08, 3]} />
                                        <meshStandardMaterial color={furBlack} roughness={1} />
                                    </mesh>
                                ))}
                            </group>
                        </group>
                    </group>
                </group>
            </group>

            {/* Shadow */}
            <mesh geometry={SHADOW_CAT_GEO} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={2.5}>
                <meshBasicMaterial color="#000000" opacity={0.5} transparent />
            </mesh>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FlyingModel - 3D geometry for the Owl (flying enemy)
 */

import React from 'react';
import * as THREE from 'three';
import { SHADOW_EAGLE_GEO } from '../../geometries';
import { COLORS, MATERIAL_SETTINGS } from './flyingMaterials';
import { FlyingAnimationRefs } from './useFlyingAnimation';

interface FlyingModelProps {
    refs: FlyingAnimationRefs;
}

/** Eye component - reusable for both eyes */
const OwlEye: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
    const isRight = side === 'right';
    const xPos = isRight ? 0.12 : -0.12;
    const highlightX = isRight ? 0.025 : -0.025;
    const highlight2X = isRight ? -0.015 : 0.015;
    const highlight3X = isRight ? 0.01 : -0.01;

    return (
        <group position={[xPos, 0.02, 0.32]}>
            {/* Eye socket */}
            <mesh position={[0, 0, -0.03]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color={COLORS.EYE_SOCKET} roughness={0.95} />
            </mesh>
            {/* Eye rim feathers */}
            <mesh position={[0, 0, -0.01]}>
                <torusGeometry args={[0.1, 0.015, 8, 20]} />
                <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.9} />
            </mesh>
            {/* Eye white/sclera */}
            <mesh position={[0, 0, 0.01]}>
                <sphereGeometry args={[0.1, 20, 20]} />
                <meshStandardMaterial color={COLORS.EYE_WHITE} roughness={0.15} />
            </mesh>
            {/* Outer iris ring */}
            <mesh position={[0, 0, 0.05]}>
                <sphereGeometry args={[0.09, 20, 20]} />
                <meshStandardMaterial color={COLORS.EYE_RING} emissive="#802000" emissiveIntensity={0.2} roughness={0.25} />
            </mesh>
            {/* Main iris */}
            <mesh position={[0, 0, 0.06]}>
                <sphereGeometry args={[0.08, 20, 20]} />
                <meshStandardMaterial color={COLORS.EYE_ORANGE} emissive="#C04000" emissiveIntensity={0.35} roughness={0.2} />
            </mesh>
            {/* Inner iris */}
            <mesh position={[0, 0, 0.07]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color={COLORS.EYE_INNER} emissive="#E05000" emissiveIntensity={0.3} roughness={0.15} />
            </mesh>
            {/* Iris texture rings */}
            <mesh position={[0, 0, 0.075]}>
                <torusGeometry args={[0.05, 0.008, 6, 20]} />
                <meshStandardMaterial color={COLORS.EYE_RING} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.076]}>
                <torusGeometry args={[0.035, 0.005, 6, 16]} />
                <meshStandardMaterial color="#D06020" roughness={0.3} />
            </mesh>
            {/* Pupil */}
            <mesh position={[0, 0, 0.085]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshBasicMaterial color={COLORS.PUPIL} />
            </mesh>
            <mesh position={[0, 0, 0.09]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color={COLORS.PUPIL_INNER} />
            </mesh>
            {/* Highlights */}
            <mesh position={[highlightX, 0.03, 0.1]}>
                <sphereGeometry args={[0.02, 10, 10]} />
                <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[highlight2X, -0.02, 0.095]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.7} transparent />
            </mesh>
            <mesh position={[highlight3X, 0.015, 0.098]}>
                <sphereGeometry args={[0.005, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.5} transparent />
            </mesh>
            {/* Eye glow */}
            <pointLight color={COLORS.EYE_ORANGE} intensity={MATERIAL_SETTINGS.EYE_GLOW_INTENSITY} distance={MATERIAL_SETTINGS.EYE_GLOW_DISTANCE} />
        </group>
    );
};

/** Wing component */
const Wing: React.FC<{ side: 'left' | 'right'; wingRef: React.RefObject<THREE.Group> }> = ({ side, wingRef }) => {
    const isRight = side === 'right';
    const xPos = isRight ? 0.55 : -0.55;
    const rotY = isRight ? 0.1 : -0.1;
    const rotZ = isRight ? -0.2 : 0.2;
    const mult = isRight ? 1 : -1;

    return (
        <group ref={wingRef} position={[xPos, 0, 0]} rotation={[0, rotY, rotZ]}>
            {/* Wing base */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.7, 0.12, 0.9]} />
                <meshStandardMaterial color={COLORS.BODY_BROWN} roughness={0.85} />
            </mesh>

            {/* Wing middle section */}
            <mesh position={[mult * 0.4, 0, 0.05]}>
                <boxGeometry args={[0.5, 0.1, 0.85]} />
                <meshStandardMaterial color={COLORS.LIGHT_BROWN} roughness={0.85} />
            </mesh>

            {/* Wing stripes */}
            {[0, 0.15, 0.3].map((offset, i) => (
                <mesh key={`band-${i}`} position={[mult * (0.2 + i * 0.25), 0.07, 0]}>
                    <boxGeometry args={[0.15, 0.02, 0.8]} />
                    <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.9} />
                </mesh>
            ))}

            {/* Primary feathers */}
            {[0, 0.12, 0.24, 0.36, 0.48].map((offset, i) => (
                <mesh
                    key={`primary-${i}`}
                    position={[mult * (0.75 + i * 0.05), -0.02, offset - 0.24]}
                    rotation={[0, mult * 0.2 * i, mult * -0.05 * i]}
                >
                    <boxGeometry args={[0.35, 0.04, 0.1]} />
                    <meshStandardMaterial color={i % 2 === 0 ? COLORS.DARK_BROWN : COLORS.TAN} roughness={0.9} />
                </mesh>
            ))}

            {/* Secondary feathers */}
            {[0, 0.15, 0.3, 0.45].map((offset, i) => (
                <mesh key={`secondary-${i}`} position={[mult * 0.5, -0.06, offset - 0.22]}>
                    <boxGeometry args={[0.25, 0.03, 0.12]} />
                    <meshStandardMaterial color={COLORS.TAN} roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
};

/** Foot component */
const Foot: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
    const isRight = side === 'right';
    const xPos = isRight ? 0.12 : -0.12;

    return (
        <group position={[xPos, 0, 0]}>
            {/* Leg feathers */}
            <mesh position={[0, 0.15, 0]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.25, 8]} />
                <meshStandardMaterial color={COLORS.TAN} roughness={0.9} />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.05, 0.05]}>
                <sphereGeometry args={[0.08, 10, 10]} />
                <meshStandardMaterial color={COLORS.FOOT} roughness={0.6} />
            </mesh>
            {/* Talons */}
            {[-0.05, 0, 0.05, -0.02].map((offset, i) => (
                <mesh
                    key={`talon-${i}`}
                    position={[offset, -0.18, i === 3 ? -0.02 : 0.08]}
                    rotation={[i === 3 ? -0.5 : 0.4, offset * 1.2, 0]}
                >
                    <coneGeometry args={[0.02, 0.15, 6]} />
                    <meshStandardMaterial color={COLORS.TALON} metalness={MATERIAL_SETTINGS.TALON_METALNESS} roughness={MATERIAL_SETTINGS.TALON_ROUGHNESS} />
                </mesh>
            ))}
        </group>
    );
};

export const FlyingModel: React.FC<FlyingModelProps> = ({ refs }) => {
    return (
        <group ref={refs.groupRef} scale={1.4}>
            {/* Main Body */}
            <mesh position={[0, 0, 0]} castShadow>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial color={COLORS.BODY_BROWN} roughness={0.9} />
            </mesh>

            {/* Body feather layers */}
            {[0.1, 0.25, 0.4].map((zOff, i) => (
                <mesh key={`body-layer-${i}`} position={[0, -0.05 - i * 0.05, 0.2 + zOff]} scale={[1, 0.8, 0.5]}>
                    <sphereGeometry args={[0.35 - i * 0.05, 12, 8]} />
                    <meshStandardMaterial color={i % 2 === 0 ? COLORS.TAN : COLORS.LIGHT_BROWN} roughness={0.95} />
                </mesh>
            ))}

            {/* Chest */}
            <mesh position={[0, -0.1, 0.45]} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color={COLORS.CREAM} roughness={0.85} />
            </mesh>

            {/* Chest stripes */}
            {[-0.12, -0.04, 0.04, 0.12].map((yOff, i) => (
                <mesh key={`chest-stripe-${i}`} position={[0, yOff, 0.55]}>
                    <boxGeometry args={[0.18, 0.03, 0.08]} />
                    <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.9} />
                </mesh>
            ))}

            {/* Head */}
            <group position={[0, 0.25, 0.55]}>
                {/* Main head */}
                <mesh castShadow>
                    <sphereGeometry args={[0.4, 24, 24]} />
                    <meshStandardMaterial color={COLORS.BODY_BROWN} roughness={0.85} />
                </mesh>

                {/* Head top */}
                <mesh position={[0, 0.28, 0]} castShadow>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.9} />
                </mesh>

                {/* Head spots */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const x = Math.sin(angle) * 0.28;
                    const y = 0.15 + Math.cos(angle) * 0.12;
                    return (
                        <mesh key={`head-spot-${i}`} position={[x, y, 0.18]}>
                            <sphereGeometry args={[0.03 + (i % 3) * 0.01, 8, 8]} />
                            <meshStandardMaterial color={i % 2 === 0 ? COLORS.DARK_BROWN : COLORS.TAN} roughness={0.9} />
                        </mesh>
                    );
                })}

                {/* Head tufts */}
                {[-1, 1].map((side) => (
                    <group key={`head-tuft-${side}`} position={[side * 0.32, 0.1, 0.05]}>
                        {[0, 1, 2].map((i) => (
                            <mesh key={`tuft-${i}`} position={[side * i * 0.02, i * 0.03, 0]} rotation={[0, 0, side * 0.3]}>
                                <coneGeometry args={[0.03, 0.1, 4]} />
                                <meshStandardMaterial color={COLORS.LIGHT_BROWN} roughness={0.9} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Facial disc */}
                <mesh position={[0, -0.02, 0.2]}>
                    <sphereGeometry args={[0.34, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                    <meshStandardMaterial color={COLORS.CREAM} roughness={0.75} />
                </mesh>
                <mesh position={[0, -0.02, 0.24]}>
                    <sphereGeometry args={[0.28, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                    <meshStandardMaterial color={COLORS.FACE_INNER} roughness={0.7} />
                </mesh>
                <mesh position={[0, -0.02, 0.18]} rotation={[0.2, 0, 0]}>
                    <torusGeometry args={[0.32, 0.03, 12, 32]} />
                    <meshStandardMaterial color={COLORS.TAN} roughness={0.85} />
                </mesh>

                {/* Facial disc lines */}
                {[...Array(8)].map((_, i) => {
                    const angle = (i / 8) * Math.PI - Math.PI / 2;
                    return (
                        <mesh
                            key={`face-line-${i}`}
                            position={[Math.sin(angle) * 0.15, -0.05 + Math.cos(angle) * 0.1, 0.28]}
                            rotation={[0, 0, angle]}
                        >
                            <boxGeometry args={[0.01, 0.08, 0.01]} />
                            <meshStandardMaterial color={COLORS.TAN} roughness={0.8} />
                        </mesh>
                    );
                })}

                {/* Eyebrow ridges */}
                <mesh position={[0.12, 0.12, 0.28]} rotation={[0.2, 0.1, 0.3]}>
                    <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
                    <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.85} />
                </mesh>
                <mesh position={[-0.12, 0.12, 0.28]} rotation={[0.2, -0.1, -0.3]}>
                    <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
                    <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.85} />
                </mesh>

                {/* Eyes */}
                <group>
                    <OwlEye side="right" />
                    <OwlEye side="left" />
                </group>

                {/* Beak */}
                <group position={[0, -0.08, 0.38]}>
                    <mesh position={[0, 0.04, -0.02]}>
                        <sphereGeometry args={[0.04, 10, 10]} />
                        <meshStandardMaterial color={COLORS.BEAK_BASE} roughness={0.6} />
                    </mesh>
                    <mesh position={[0, 0.02, 0]} rotation={[0.5, 0, 0]}>
                        <coneGeometry args={[0.045, 0.1, 12]} />
                        <meshStandardMaterial color={COLORS.BEAK_ORANGE} roughness={MATERIAL_SETTINGS.BEAK_ROUGHNESS} metalness={MATERIAL_SETTINGS.BEAK_METALNESS} />
                    </mesh>
                    <mesh position={[0, 0.035, 0.02]} rotation={[0.4, 0, 0]}>
                        <boxGeometry args={[0.02, 0.06, 0.03]} />
                        <meshStandardMaterial color={COLORS.BEAK_RIDGE} roughness={0.4} />
                    </mesh>
                    <mesh position={[0, -0.04, 0.06]} rotation={[1.0, 0, 0]}>
                        <coneGeometry args={[0.02, 0.04, 8]} />
                        <meshStandardMaterial color={COLORS.BEAK_TIP} roughness={0.3} />
                    </mesh>
                    {/* Nostrils */}
                    <mesh position={[0.015, 0.03, 0.01]}>
                        <sphereGeometry args={[0.008, 6, 6]} />
                        <meshStandardMaterial color={COLORS.NOSTRIL} roughness={0.9} />
                    </mesh>
                    <mesh position={[-0.015, 0.03, 0.01]}>
                        <sphereGeometry args={[0.008, 6, 6]} />
                        <meshStandardMaterial color={COLORS.NOSTRIL} roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.03, 0.03]} rotation={[0.4, 0, 0]}>
                        <sphereGeometry args={[0.012, 8, 8]} />
                        <meshStandardMaterial color={COLORS.BEAK_HIGHLIGHT} roughness={0.2} />
                    </mesh>
                </group>

                {/* Chin */}
                <mesh position={[0, -0.18, 0.25]}>
                    <sphereGeometry args={[0.12, 12, 12]} />
                    <meshStandardMaterial color={COLORS.CREAM} roughness={0.8} />
                </mesh>
                {[-0.04, 0, 0.04].map((offset, i) => (
                    <mesh key={`chin-feather-${i}`} position={[offset, -0.22, 0.22]} rotation={[0.3, 0, 0]}>
                        <boxGeometry args={[0.02, 0.04, 0.01]} />
                        <meshStandardMaterial color={COLORS.TAN} roughness={0.85} />
                    </mesh>
                ))}

                {/* Forehead */}
                <mesh position={[0, 0.22, 0.12]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshStandardMaterial color={COLORS.BODY_BROWN} roughness={0.9} />
                </mesh>
                {[-0.06, 0, 0.06].map((offset, i) => (
                    <mesh key={`forehead-tuft-${i}`} position={[offset, 0.3, 0.08]} rotation={[-0.3, 0, offset * 2]}>
                        <coneGeometry args={[0.025, 0.08, 4]} />
                        <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.9} />
                    </mesh>
                ))}

                {/* Cheeks */}
                {[-1, 1].map((side) => (
                    <group key={`cheek-${side}`} position={[side * 0.22, -0.05, 0.2]}>
                        <mesh>
                            <sphereGeometry args={[0.08, 10, 10]} />
                            <meshStandardMaterial color={COLORS.CREAM} roughness={0.8} />
                        </mesh>
                        {[0, 1, 2].map((i) => (
                            <mesh key={`cheek-line-${i}`} position={[side * 0.02, -0.02 - i * 0.02, 0.04]} rotation={[0, 0, side * 0.2]}>
                                <boxGeometry args={[0.03, 0.008, 0.01]} />
                                <meshStandardMaterial color={COLORS.TAN} roughness={0.85} />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>

            {/* Wings */}
            <group ref={refs.wingRef} position={[0, 0.1, 0]}>
                <Wing side="right" wingRef={refs.rightWingRef} />
                <Wing side="left" wingRef={refs.leftWingRef} />
            </group>

            {/* Tail Feathers */}
            <group position={[0, -0.1, -0.6]} rotation={[0.3, 0, 0]}>
                {[-0.15, -0.08, 0, 0.08, 0.15].map((offset, i) => (
                    <group key={`tail-${i}`}>
                        <mesh position={[offset, 0, -0.15]} rotation={[0.1, offset * 0.5, 0]}>
                            <boxGeometry args={[0.1, 0.04, 0.4]} />
                            <meshStandardMaterial color={i % 2 === 0 ? COLORS.BODY_BROWN : COLORS.TAN} roughness={0.9} />
                        </mesh>
                        <mesh position={[offset, 0.025, -0.25]} rotation={[0.1, offset * 0.5, 0]}>
                            <boxGeometry args={[0.08, 0.02, 0.15]} />
                            <meshStandardMaterial color={COLORS.DARK_BROWN} roughness={0.9} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Feet */}
            <group ref={refs.feetRef} position={[0, -0.5, 0.2]}>
                <Foot side="right" />
                <Foot side="left" />
            </group>

            {/* Main glow */}
            <pointLight color={COLORS.EYE_ORANGE} intensity={MATERIAL_SETTINGS.MAIN_GLOW_INTENSITY} distance={MATERIAL_SETTINGS.MAIN_GLOW_DISTANCE} position={[0, 0.3, 1]} />

            {/* Shadow */}
            <mesh geometry={SHADOW_EAGLE_GEO} position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.6}>
                <meshBasicMaterial color={COLORS.SHADOW} opacity={0.4} transparent />
            </mesh>
        </group>
    );
};

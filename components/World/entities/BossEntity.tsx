/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject, GameStatus, LANE_WIDTH, isBoss, GameEvents } from '../../../types';
import { useStore } from '../../../store';
import {
    DOCTOR_BODY_GEO, DOCTOR_SHOULDER_GEO, DOCTOR_LEG_GEO, DOCTOR_HEAD_GEO,
    DOCTOR_NOSE_GEO, DOCTOR_HAIR_GEO, DOCTOR_TOP_HAIR_GEO, DOCTOR_GLASSES_GEO,
    DOCTOR_LENS_GEO, DOCTOR_SWIRL_GEO, DOCTOR_SHOE_GEO, DOCTOR_MOUTH_GEO, DOCTOR_TIE_GEO,
    CAT_LEG_GEO,
    SYRINGE_BARREL_GEO, SYRINGE_NEEDLE_GEO, SYRINGE_NEEDLE_HUB_GEO,
    SYRINGE_PLUNGER_GEO, SYRINGE_FLUID_GEO, SYRINGE_FINGER_FLANGE_GEO,
    SHADOW_CAT_GEO, MOUSE_WHISKER_GEO
} from '../geometries';

interface BossEntityProps {
    data: GameObject;
}

export const BossEntity: React.FC<BossEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { status } = useStore();

    // Animation refs
    const bossHeadRef = useRef<THREE.Group>(null);
    const bossLeftArmRef = useRef<THREE.Group>(null);
    const bossRightArmRef = useRef<THREE.Group>(null);
    const bossLeftLegRef = useRef<THREE.Group>(null);
    const bossRightLegRef = useRef<THREE.Group>(null);
    const bossCoatRef = useRef<THREE.Mesh>(null);
    const bossTieRef = useRef<THREE.Mesh>(null);
    const prevBossX = useRef<number>(data.position[0]);

    // Damage flash refs
    const bossMaterialRefs = useRef<THREE.MeshStandardMaterial[]>([]);

    // Track if blood splatter was spawned during knockback
    const bloodSplatterSpawned = useRef(false);

    // Spawn blood splatter particles during knockback phase - use useFrame for reliable detection
    useFrame(() => {
        if (!isBoss(data)) return;

        if (data.isDying && data.deathPhase === 0 && !bloodSplatterSpawned.current) {
            // Spawn blood particles during knockback
            bloodSplatterSpawned.current = true;
            window.dispatchEvent(new CustomEvent(GameEvents.PARTICLE_BURST, {
                detail: {
                    position: [data.position[0], data.position[1] + 2, data.position[2]],
                    color: '#DC143C', // Scarlet blood (алый)
                    amount: 25,
                    intensity: 1.2
                }
            }));
        }

        // Reset when boss stops dying (new boss)
        if (!data.isDying) {
            bloodSplatterSpawned.current = false;
        }
    });

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const time = state.clock.elapsedTime;

        // BOSS DEATH ANIMATION
        if (data.isDying) {
            const deathPhase = data.deathPhase || 0;
            const deathTimer = data.deathTimer || 0;

            groupRef.current.position.x = data.position[0];
            groupRef.current.position.y = data.position[1];
            groupRef.current.position.z = data.position[2];

            if (deathPhase === 0) {
                // Knockback phase - boss flies back
                const knockbackProgress = Math.min(deathTimer / 0.8, 1);
                groupRef.current.rotation.x = -knockbackProgress * 0.5;
                groupRef.current.rotation.z = knockbackProgress * 0.3;

                // Arms flail back during knockback
                if (bossRightArmRef.current) {
                    bossRightArmRef.current.rotation.x = -knockbackProgress * 1.2;
                    bossRightArmRef.current.rotation.z = -knockbackProgress * 0.8;
                }
                if (bossLeftArmRef.current) {
                    bossLeftArmRef.current.rotation.x = -knockbackProgress * 1.2;
                    bossLeftArmRef.current.rotation.z = knockbackProgress * 0.8;
                }
            } else if (deathPhase === 1) {
                // Falling phase - boss falls to ground
                const fallProgress = Math.min(deathTimer / 1.0, 1);
                groupRef.current.rotation.x = -0.5 - fallProgress * (Math.PI / 2 - 0.5);
                groupRef.current.rotation.z = 0.3 * (1 - fallProgress);

                // Arms spread out as boss falls
                if (bossRightArmRef.current) {
                    bossRightArmRef.current.rotation.x = -1.2 + fallProgress * 0.5;
                    bossRightArmRef.current.rotation.z = -0.8 - fallProgress * 0.7;
                }
                if (bossLeftArmRef.current) {
                    bossLeftArmRef.current.rotation.x = -1.2 + fallProgress * 0.5;
                    bossLeftArmRef.current.rotation.z = 0.8 + fallProgress * 0.7;
                }
                // Legs spread slightly
                if (bossRightLegRef.current) {
                    bossRightLegRef.current.rotation.z = -fallProgress * 0.3;
                }
                if (bossLeftLegRef.current) {
                    bossLeftLegRef.current.rotation.z = fallProgress * 0.3;
                }
            } else {
                // Dead pose - lying flat on back with arms spread OUT on the ground (not on belly)
                groupRef.current.rotation.x = -Math.PI / 2;
                groupRef.current.rotation.z = 0;
                groupRef.current.rotation.y = 0;

                // Arms spread OUT to the sides on the ground (perpendicular to body)
                if (bossRightArmRef.current) {
                    bossRightArmRef.current.rotation.x = 0; // Arm along ground
                    bossRightArmRef.current.rotation.z = -Math.PI / 2; // Perpendicular to body, out to right
                    bossRightArmRef.current.rotation.y = 0;
                }
                if (bossLeftArmRef.current) {
                    bossLeftArmRef.current.rotation.x = 0; // Arm along ground
                    bossLeftArmRef.current.rotation.z = Math.PI / 2; // Perpendicular to body, out to left
                    bossLeftArmRef.current.rotation.y = 0;
                }
                // Legs slightly spread
                if (bossRightLegRef.current) {
                    bossRightLegRef.current.rotation.x = 0;
                    bossRightLegRef.current.rotation.z = -0.3;
                }
                if (bossLeftLegRef.current) {
                    bossLeftLegRef.current.rotation.x = 0;
                    bossLeftLegRef.current.rotation.z = 0.3;
                }
            }

            // Head tilts to the side when dead
            if (bossHeadRef.current) {
                if (deathPhase === 2) {
                    bossHeadRef.current.rotation.x = 0;
                    bossHeadRef.current.rotation.y = 0.4;
                    bossHeadRef.current.rotation.z = 0.2;
                } else {
                    bossHeadRef.current.rotation.x = 0;
                    bossHeadRef.current.rotation.y = 0;
                    bossHeadRef.current.rotation.z = 0;
                }
            }

            return;
        }

        // NORMAL BOSS BEHAVIOR
        const isCharging = data.isCharging;
        const chargePhase = data.chargePhase || 0;
        const isRunning = isCharging && (chargePhase === 1 || chargePhase === 2);

        groupRef.current.rotation.z = 0;
        groupRef.current.rotation.y = 0;

        // Hover/Float
        if (isRunning) {
            groupRef.current.position.y = 0.2 + Math.abs(Math.sin(time * 15)) * 0.15;
        } else {
            groupRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.3;
        }

        groupRef.current.position.x = data.position[0];
        groupRef.current.position.z = data.position[2];

        const isHit = data.lastHitTime && (Date.now() - data.lastHitTime < 250);

        if (isRunning) {
            // RUNNING ANIMATION
            const runCycle = time * 18;
            const armSwing = 1.2;
            const legSwing = 0.8;

            if (bossRightArmRef.current) {
                bossRightArmRef.current.rotation.x = Math.sin(runCycle) * armSwing;
            }
            if (bossLeftArmRef.current) {
                bossLeftArmRef.current.rotation.x = Math.sin(runCycle + Math.PI) * armSwing;
            }
            if (bossRightLegRef.current) {
                bossRightLegRef.current.rotation.x = Math.sin(runCycle + Math.PI) * legSwing;
            }
            if (bossLeftLegRef.current) {
                bossLeftLegRef.current.rotation.x = Math.sin(runCycle) * legSwing;
            }

            if (bossHeadRef.current) {
                bossHeadRef.current.rotation.x = 0.3;
                bossHeadRef.current.rotation.z = Math.sin(runCycle * 0.5) * 0.1;
                bossHeadRef.current.rotation.y = 0;
            }

            if (chargePhase === 2) {
                groupRef.current.rotation.x = 0.15;
            } else {
                groupRef.current.rotation.x = -0.1;
            }

            if (bossCoatRef.current) {
                const flap = 1 + Math.sin(runCycle * 2) * 0.05;
                bossCoatRef.current.scale.set(flap, 1, flap);
            }

            if (bossTieRef.current) {
                bossTieRef.current.rotation.x = -0.5;
                bossTieRef.current.rotation.z = Math.sin(runCycle) * 0.2;
            }
        } else {
            // IDLE ANIMATION
            groupRef.current.rotation.x = 0;

            const currentX = data.position[0];
            const deltaX = Math.abs(currentX - prevBossX.current);
            const isWalking = deltaX > 0.01;
            prevBossX.current = currentX;

            const walkCycle = time * 10;
            const walkLegSwing = isWalking ? 0.5 : 0;
            const walkArmSwing = isWalking ? 0.6 : 0;

            if (bossRightArmRef.current) {
                if (isWalking) {
                    bossRightArmRef.current.rotation.x = Math.sin(walkCycle) * walkArmSwing;
                } else {
                    bossRightArmRef.current.rotation.x = Math.sin(time * 5) * 0.8;
                }
            }
            if (bossLeftArmRef.current) {
                if (isWalking) {
                    bossLeftArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * walkArmSwing;
                } else {
                    bossLeftArmRef.current.rotation.x = Math.sin(time * 5 + Math.PI) * 0.8;
                }
            }

            if (bossRightLegRef.current) {
                bossRightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * walkLegSwing;
            }
            if (bossLeftLegRef.current) {
                bossLeftLegRef.current.rotation.x = Math.sin(walkCycle) * walkLegSwing;
            }

            if (bossHeadRef.current) {
                bossHeadRef.current.rotation.z = Math.sin(time * 2) * 0.1;
                bossHeadRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
                if (!isHit) {
                    bossHeadRef.current.rotation.x = -0.5 + Math.sin(time * 3) * 0.05;
                }
            }

            if (bossCoatRef.current) {
                const ripple = 1 + Math.sin(time * 4) * 0.02;
                bossCoatRef.current.scale.set(ripple, 1, ripple);
            }

            if (bossTieRef.current) {
                bossTieRef.current.rotation.x = 0;
                bossTieRef.current.rotation.z = Math.sin(time * 3) * 0.1;
            }
        }

        if (isHit) {
            // Pain State - Red Flash
            bossMaterialRefs.current.forEach(mat => {
                if (mat) {
                    mat.emissive.setHex(0xFF0000);
                    mat.emissiveIntensity = 2.0;
                }
            });

            // Shake Effect
            groupRef.current.position.x += (Math.random() - 0.5) * 0.8;
            groupRef.current.position.y += (Math.random() - 0.5) * 0.8;

            if (bossHeadRef.current) {
                bossHeadRef.current.rotation.x = -0.8;
            }
        } else {
            // Normal State - Reset emissive
            bossMaterialRefs.current.forEach(mat => {
                if (mat) {
                    mat.emissive.setHex(0x000000);
                    mat.emissiveIntensity = 0;
                }
            });
        }
    });

    return (
        <group ref={groupRef} scale={3.5}>
            {/* Shadow */}
            <mesh geometry={SHADOW_CAT_GEO} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.5}>
                <meshBasicMaterial color="#000000" opacity={0.5} transparent />
            </mesh>

            {/* BODY GROUP (Coat + Legs) */}
            <group position={[0, 1.05, 0]}>
                {/* Lab Coat Body */}
                <mesh geometry={DOCTOR_BODY_GEO} castShadow ref={bossCoatRef}>
                    <meshStandardMaterial
                        ref={el => { if (el) bossMaterialRefs.current[0] = el }}
                        color="#FFFFFF" roughness={0.8}
                    />
                </mesh>
                {/* Shoulders */}
                <mesh geometry={DOCTOR_SHOULDER_GEO} position={[0, 0.25, 0]}>
                    <meshStandardMaterial
                        ref={el => { if (el) bossMaterialRefs.current[2] = el }}
                        color="#FFFFFF" roughness={0.8}
                    />
                </mesh>

                {/* Blood stains on lab coat - appear dynamically based on damage */}
                {/* First stain appears at 1/3 HP lost, doubles in size at 2/3 HP lost */}
                {/* Stains on BOTH front and back for FPS mode visibility */}
                {isBoss(data) && (() => {
                    const hpRatio = data.health / data.maxHealth;
                    const showFirstStain = hpRatio <= 0.67; // 1/3 HP lost
                    const showLargerStain = hpRatio <= 0.34; // 2/3 HP lost
                    const stainScale = showLargerStain ? 2.0 : 1.0;

                    if (!showFirstStain) return null;

                    return (
                        <>
                            {/* FRONT stains - pushed out slightly to avoid z-fighting */}
                            <mesh position={[0, 0, 0.44]} rotation={[0, 0, 0.2]} scale={stainScale} renderOrder={10}>
                                <circleGeometry args={[0.12, 8]} />
                                <meshBasicMaterial color="#8B0000" side={THREE.DoubleSide} depthTest={false} />
                            </mesh>
                            {/* BACK stains - mirrored position */}
                            <mesh position={[0, 0, -0.44]} rotation={[0, Math.PI, -0.2]} scale={stainScale} renderOrder={10}>
                                <circleGeometry args={[0.12, 8]} />
                                <meshBasicMaterial color="#8B0000" side={THREE.DoubleSide} depthTest={false} />
                            </mesh>
                            {/* Additional splatter when large */}
                            {showLargerStain && (
                                <>
                                    {/* Front splatters */}
                                    <mesh position={[0.15, -0.1, 0.44]} rotation={[0, 0, -0.3]} renderOrder={10}>
                                        <circleGeometry args={[0.06, 6]} />
                                        <meshBasicMaterial color="#A52A2A" side={THREE.DoubleSide} depthTest={false} />
                                    </mesh>
                                    <mesh position={[-0.12, 0.08, 0.44]} rotation={[0, 0, 0.4]} renderOrder={10}>
                                        <circleGeometry args={[0.05, 6]} />
                                        <meshBasicMaterial color="#800000" side={THREE.DoubleSide} depthTest={false} />
                                    </mesh>
                                    {/* Back splatters - mirrored */}
                                    <mesh position={[-0.15, -0.1, -0.44]} rotation={[0, Math.PI, 0.3]} renderOrder={10}>
                                        <circleGeometry args={[0.06, 6]} />
                                        <meshBasicMaterial color="#A52A2A" side={THREE.DoubleSide} depthTest={false} />
                                    </mesh>
                                    <mesh position={[0.12, 0.08, -0.44]} rotation={[0, Math.PI, -0.4]} renderOrder={10}>
                                        <circleGeometry args={[0.05, 6]} />
                                        <meshBasicMaterial color="#800000" side={THREE.DoubleSide} depthTest={false} />
                                    </mesh>
                                </>
                            )}
                        </>
                    );
                })()}

                {/* Tie & Pocket */}
                <mesh ref={bossTieRef} geometry={DOCTOR_TIE_GEO} position={[0, 0.2, 0.4]} rotation={[Math.PI, 0, 0]}>
                    <meshStandardMaterial color="#2E003E" />
                </mesh>
                <mesh position={[0.2, -0.1, 0.42]} scale={[0.15, 0.2, 0.05]}>
                    <boxGeometry />
                    <meshStandardMaterial color="#CCCCCC" />
                </mesh>

                {/* Purple Pants Legs */}
                <group position={[0, -0.05, 0]}>
                    {/* Right Leg */}
                    <group ref={bossRightLegRef} position={[0.2, 0, 0]}>
                        <mesh position={[0, -0.45, 0]} geometry={DOCTOR_LEG_GEO}>
                            <meshStandardMaterial color="#4A148C" />
                        </mesh>
                        <mesh position={[0, -0.9, 0.1]} geometry={DOCTOR_SHOE_GEO}>
                            <meshStandardMaterial color="#111111" />
                        </mesh>
                    </group>
                    {/* Left Leg */}
                    <group ref={bossLeftLegRef} position={[-0.2, 0, 0]}>
                        <mesh position={[0, -0.45, 0]} geometry={DOCTOR_LEG_GEO}>
                            <meshStandardMaterial color="#4A148C" />
                        </mesh>
                        <mesh position={[0, -0.9, 0.1]} geometry={DOCTOR_SHOE_GEO}>
                            <meshStandardMaterial color="#111111" />
                        </mesh>
                    </group>
                </group>

                {/* Right Arm (Holding Syringe) */}
                <group ref={bossRightArmRef} position={[0.6, 0.35, 0]}>
                    <group rotation={[0, 0, -0.2]}>
                        <mesh geometry={CAT_LEG_GEO} position={[0, -0.35, 0]}>
                            <meshStandardMaterial color="#FFFFFF" />
                        </mesh>
                        {/* Syringe */}
                        <group position={[0, -0.65, 0.15]} rotation={[Math.PI / 2, 0, 0]} scale={0.66}>
                            <mesh geometry={SYRINGE_BARREL_GEO}>
                                <meshPhysicalMaterial color="#E8E8E8" transmission={0.6} opacity={0.5} transparent roughness={0.05} />
                            </mesh>
                            <mesh geometry={SYRINGE_FINGER_FLANGE_GEO} position={[0, -0.38, 0]}>
                                <meshStandardMaterial color="#E0E0E0" roughness={0.3} />
                            </mesh>
                            <mesh geometry={SYRINGE_FLUID_GEO} position={[0, -0.06, 0]} renderOrder={1}>
                                <meshStandardMaterial color="#39FF14" emissive="#00FF00" emissiveIntensity={1.5} toneMapped={false} />
                            </mesh>
                            <mesh geometry={SYRINGE_NEEDLE_HUB_GEO} position={[0, 0.46, 0]}>
                                <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.15} />
                            </mesh>
                            <mesh geometry={SYRINGE_NEEDLE_GEO} position={[0, 0.75, 0]}>
                                <meshStandardMaterial color="#D4D4D4" metalness={1} roughness={0.1} />
                            </mesh>
                            <mesh geometry={SYRINGE_PLUNGER_GEO} position={[0, -0.65, 0]}>
                                <meshStandardMaterial color="#1A1A1A" roughness={0.7} />
                            </mesh>
                        </group>
                    </group>
                </group>

                {/* Left Arm (Also Holding Syringe) */}
                <group ref={bossLeftArmRef} position={[-0.6, 0.35, 0]}>
                    <group rotation={[0, 0, 0.2]}>
                        <mesh geometry={CAT_LEG_GEO} position={[0, -0.35, 0]}>
                            <meshStandardMaterial color="#FFFFFF" />
                        </mesh>
                        {/* Syringe */}
                        <group position={[0, -0.65, 0.15]} rotation={[Math.PI / 2, 0, 0]} scale={0.66}>
                            <mesh geometry={SYRINGE_BARREL_GEO}>
                                <meshPhysicalMaterial color="#E8E8E8" transmission={0.6} opacity={0.5} transparent roughness={0.05} />
                            </mesh>
                            <mesh geometry={SYRINGE_FINGER_FLANGE_GEO} position={[0, -0.38, 0]}>
                                <meshStandardMaterial color="#E0E0E0" roughness={0.3} />
                            </mesh>
                            <mesh geometry={SYRINGE_FLUID_GEO} position={[0, -0.06, 0]} renderOrder={1}>
                                <meshStandardMaterial color="#39FF14" emissive="#00FF00" emissiveIntensity={1.5} toneMapped={false} />
                            </mesh>
                            <mesh geometry={SYRINGE_NEEDLE_HUB_GEO} position={[0, 0.46, 0]}>
                                <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.15} />
                            </mesh>
                            <mesh geometry={SYRINGE_NEEDLE_GEO} position={[0, 0.75, 0]}>
                                <meshStandardMaterial color="#D4D4D4" metalness={1} roughness={0.1} />
                            </mesh>
                            <mesh geometry={SYRINGE_PLUNGER_GEO} position={[0, -0.65, 0]}>
                                <meshStandardMaterial color="#1A1A1A" roughness={0.7} />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>

            {/* HEAD GROUP */}
            <group ref={bossHeadRef} position={[0, 2.0, 0]}>
                <mesh geometry={DOCTOR_HEAD_GEO} castShadow>
                    <meshStandardMaterial
                        ref={el => { if (el) bossMaterialRefs.current[1] = el }}
                        color="#FFE0BD"
                    />
                </mesh>

                {/* Spiky Hair Tufts */}
                <mesh geometry={DOCTOR_HAIR_GEO} position={[0.42, 0.1, 0]} rotation={[0, 0, -1.2]}>
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>
                <mesh geometry={DOCTOR_HAIR_GEO} position={[-0.42, 0.1, 0]} rotation={[0, 0, 1.2]}>
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>
                <mesh geometry={DOCTOR_TOP_HAIR_GEO} position={[0, 0.45, 0]}>
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>

                {/* Large Nose */}
                <mesh geometry={DOCTOR_NOSE_GEO} position={[0, -0.1, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#FFC0CB" />
                </mesh>

                {/* Crazy Glasses */}
                <group position={[0, 0.15, 0.38]}>
                    <mesh geometry={DOCTOR_GLASSES_GEO} position={[0.16, 0, 0]} rotation={[0, 0, 0]}>
                        <meshStandardMaterial color="#111111" />
                    </mesh>
                    <mesh geometry={DOCTOR_GLASSES_GEO} position={[-0.16, 0, 0]} rotation={[0, 0, 0]}>
                        <meshStandardMaterial color="#111111" />
                    </mesh>
                    <mesh geometry={DOCTOR_LENS_GEO} position={[0.16, 0, 0.02]}>
                        <meshBasicMaterial color="#FFFFFF" />
                    </mesh>
                    <mesh geometry={DOCTOR_SWIRL_GEO} position={[0.16, 0, 0.03]}>
                        <meshBasicMaterial color="#000000" />
                    </mesh>
                    <mesh geometry={DOCTOR_LENS_GEO} position={[-0.16, 0, 0.02]}>
                        <meshBasicMaterial color="#FFFFFF" />
                    </mesh>
                    <mesh geometry={DOCTOR_SWIRL_GEO} position={[-0.16, 0, 0.03]}>
                        <meshBasicMaterial color="#000000" />
                    </mesh>
                </group>

                {/* Mouth */}
                <mesh geometry={DOCTOR_MOUTH_GEO} position={[0, -0.32, 0.42]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color="#BC6E6E" roughness={0.6} />
                </mesh>

                {/* Mustache/Whiskers */}
                <group position={[0, -0.18, 0.48]}>
                    <mesh position={[0.25, 0, 0]} rotation={[0, 0, -0.2]} scale={[1.5, 15.0, 15.0]}>
                        <mesh geometry={MOUSE_WHISKER_GEO}>
                            <meshStandardMaterial color="#000000" />
                        </mesh>
                    </mesh>
                    <mesh position={[-0.25, 0, 0]} rotation={[0, 0, 0.2]} scale={[1.5, 15.0, 15.0]}>
                        <mesh geometry={MOUSE_WHISKER_GEO}>
                            <meshStandardMaterial color="#000000" />
                        </mesh>
                    </mesh>
                </group>
            </group>
        </group>
    );
};

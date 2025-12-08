/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CatModel - 3D geometry for the Halloween black cat
 */

import React from 'react';
import * as THREE from 'three';
import { SHADOW_CAT_GEO } from '../../geometries';
import { COLORS, MATERIAL_SETTINGS } from './catMaterials';
import { CatAnimationRefs } from './useCatAnimation';

interface CatModelProps {
    refs: CatAnimationRefs;
    furSpikes: Array<{ x: number; y: number; z: number; rotX: number; rotZ: number; scale: number; side: number }>;
}

/** Eye component - reusable for both eyes */
const CatEye: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
    const isRight = side === 'right';
    const xPos = isRight ? 0.13 : -0.13;
    const rotY = isRight ? 0.1 : -0.1;
    const rotZ = isRight ? 0.15 : -0.15;
    const shineX = isRight ? 0.035 : -0.035;
    const shineX2 = isRight ? -0.02 : 0.02;

    return (
        <group position={[xPos, 0.06, 0.2]} rotation={[0, rotY, rotZ]}>
            {/* Eye socket shadow */}
            <mesh position={[0, 0, -0.02]}>
                <sphereGeometry args={[0.14, 14, 14]} />
                <meshStandardMaterial color="#000000" roughness={1} />
            </mesh>
            {/* Outer glow */}
            <mesh>
                <sphereGeometry args={[0.135, 18, 18]} />
                <meshBasicMaterial color={COLORS.EYE_YELLOW} />
            </mesh>
            {/* Orange gradient middle */}
            <mesh position={[0, 0, 0.035]}>
                <sphereGeometry args={[0.115, 14, 14]} />
                <meshBasicMaterial color={COLORS.EYE_ORANGE} />
            </mesh>
            {/* Yellow bright center */}
            <mesh position={[0, 0, 0.065]}>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshBasicMaterial color={COLORS.EYE_GLOW} />
            </mesh>
            {/* Inner yellow core */}
            <mesh position={[0, 0, 0.085]}>
                <sphereGeometry args={[0.06, 10, 10]} />
                <meshBasicMaterial color={COLORS.EYE_YELLOW} />
            </mesh>
            {/* Black vertical slit pupil */}
            <mesh position={[0, 0, 0.11]}>
                <boxGeometry args={[0.02, 0.16, 0.015]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            {/* Pupil taper top */}
            <mesh position={[0, 0.06, 0.11]}>
                <coneGeometry args={[0.015, 0.04, 4]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            {/* Pupil taper bottom */}
            <mesh position={[0, -0.06, 0.11]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.015, 0.04, 4]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            {/* Eye shine - primary */}
            <mesh position={[shineX, 0.04, 0.12]}>
                <sphereGeometry args={[0.022, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Eye shine - secondary */}
            <mesh position={[shineX2, -0.03, 0.115]}>
                <sphereGeometry args={[0.012, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Eye glow light */}
            <pointLight color="#FF8800" intensity={MATERIAL_SETTINGS.EYE_GLOW_INTENSITY} distance={MATERIAL_SETTINGS.EYE_GLOW_DISTANCE} />
        </group>
    );
};

/** Ear component */
const CatEar: React.FC<{ side: 'left' | 'right'; earRef: React.RefObject<THREE.Group> }> = ({ side, earRef }) => {
    const isRight = side === 'right';
    const xPos = isRight ? 0.22 : -0.22;
    const rotY = isRight ? 0.25 : -0.25;
    const rotZ = isRight ? 0.25 : -0.25;

    return (
        <group ref={earRef} position={[xPos, 0.32, -0.02]} rotation={[0.1, rotY, rotZ]}>
            <mesh castShadow>
                <coneGeometry args={[0.13, 0.38, 4]} />
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Inner ear */}
            <mesh position={[0, -0.03, 0.035]} rotation={[0.15, 0, 0]}>
                <coneGeometry args={[0.075, 0.25, 4]} />
                <meshStandardMaterial color={COLORS.INNER_EAR} roughness={0.9} />
            </mesh>
            {/* Ear fur tuft */}
            <mesh position={[0, 0.2, 0]}>
                <coneGeometry args={[0.03, 0.08, 3]} />
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
            </mesh>
        </group>
    );
};

/** Front Paw component */
const FrontPaw: React.FC<{ side: 'left' | 'right'; pawRef: React.RefObject<THREE.Group> }> = ({ side, pawRef }) => {
    const isRight = side === 'right';
    const xPos = isRight ? 0.18 : -0.18;
    const rotZ = isRight ? 0.12 : -0.12;
    const clawRotMult = isRight ? 1 : -1;
    const dewClawX = isRight ? 0.05 : -0.05;
    const dewClawRotZ = isRight ? 0.5 : -0.5;

    return (
        <group ref={pawRef} position={[xPos, 0.75, 0.38]} rotation={[-0.9, 0, rotZ]}>
            {/* Upper arm */}
            <mesh castShadow>
                <capsuleGeometry args={[0.065, 0.24, 6, 10]} />
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Elbow joint */}
            <mesh position={[0, -0.16, 0]}>
                <sphereGeometry args={[0.055, 8, 8]} />
                <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Lower arm */}
            <mesh position={[0, -0.3, 0]}>
                <capsuleGeometry args={[0.05, 0.2, 6, 8]} />
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Paw */}
            <mesh position={[0, -0.44, 0.02]}>
                <sphereGeometry args={[0.085, 12, 12]} />
                <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Paw pad */}
            <mesh position={[0, -0.48, 0.08]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshStandardMaterial color={COLORS.PAW_PAD_PINK} roughness={MATERIAL_SETTINGS.PAW_PAD_ROUGHNESS} />
            </mesh>
            {/* Toe pads */}
            {[-0.035, 0, 0.035].map((offset, idx) => (
                <mesh key={`toe-pad-${side}-${idx}`} position={[offset, -0.49, 0.1]}>
                    <sphereGeometry args={[0.02, 6, 6]} />
                    <meshStandardMaterial color={COLORS.PAW_PAD_PINK} roughness={MATERIAL_SETTINGS.PAW_PAD_ROUGHNESS} />
                </mesh>
            ))}
            {/* Claws */}
            {[-0.04, 0, 0.04].map((offset, idx) => (
                <group key={`claw-${side}-${idx}`}>
                    <mesh position={[offset, -0.5, 0.12]} rotation={[0.5, 0, offset * 2 * clawRotMult]}>
                        <coneGeometry args={[0.012, 0.12, 6]} />
                        <meshStandardMaterial color={COLORS.CLAW_WHITE} roughness={MATERIAL_SETTINGS.CLAW_ROUGHNESS} metalness={MATERIAL_SETTINGS.CLAW_METALNESS} />
                    </mesh>
                    <mesh position={[offset, -0.485, 0.1]}>
                        <sphereGeometry args={[0.015, 6, 6]} />
                        <meshStandardMaterial color={COLORS.FUR_DARK} roughness={0.9} />
                    </mesh>
                </group>
            ))}
            {/* Dewclaw */}
            <mesh position={[dewClawX, -0.42, 0.02]} rotation={[0.3, 0, dewClawRotZ]}>
                <coneGeometry args={[0.008, 0.06, 4]} />
                <meshStandardMaterial color={COLORS.CLAW_WHITE} roughness={MATERIAL_SETTINGS.CLAW_ROUGHNESS} />
            </mesh>
        </group>
    );
};

/** Back Leg component */
const BackLeg: React.FC<{ side: 'left' | 'right'; legRef: React.RefObject<THREE.Group> }> = ({ side, legRef }) => {
    const isRight = side === 'right';
    const xPos = isRight ? 0.14 : -0.14;

    return (
        <group ref={legRef} position={[xPos, 0.32, -0.38]}>
            {/* Upper thigh */}
            <mesh position={[0, 0.02, 0]} castShadow>
                <capsuleGeometry args={[0.085, 0.28, 6, 10]} />
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Knee joint */}
            <mesh position={[0, -0.18, 0.04]}>
                <sphereGeometry args={[0.065, 8, 8]} />
                <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0, -0.32, 0.06]}>
                <capsuleGeometry args={[0.06, 0.24, 6, 8]} />
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Ankle */}
            <mesh position={[0, -0.48, 0.08]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Paw */}
            <mesh position={[0, -0.54, 0.1]}>
                <sphereGeometry args={[0.075, 10, 10]} />
                <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>
            {/* Main paw pad */}
            <mesh position={[0, -0.57, 0.14]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color={COLORS.PAW_PADS} roughness={0.85} />
            </mesh>
            {/* Toe pads */}
            {[-0.03, 0, 0.03].map((offset, idx) => (
                <mesh key={`back-toe-${side}-${idx}`} position={[offset, -0.57, 0.16]}>
                    <sphereGeometry args={[0.018, 6, 6]} />
                    <meshStandardMaterial color={COLORS.PAW_PAD_PINK} roughness={0.85} />
                </mesh>
            ))}
        </group>
    );
};

/** Tail section with fur spikes */
const TailSection: React.FC<{
    tailRef: React.RefObject<THREE.Group>;
    tailMidRef: React.RefObject<THREE.Group>;
    tailTipRef: React.RefObject<THREE.Group>;
    tailCurlRef: React.RefObject<THREE.Group>;
}> = ({ tailRef, tailMidRef, tailTipRef, tailCurlRef }) => (
    <group ref={tailRef} position={[0, 0.52, -0.52]} rotation={[-0.2, 0, 0]}>
        {/* Tail base */}
        <mesh>
            <capsuleGeometry args={[0.055, 0.28, 6, 10]} />
            <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
        </mesh>

        {/* Bristled fur on base */}
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
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
            </mesh>
        ))}

        {/* Middle section */}
        <group ref={tailMidRef} position={[0, 0.22, 0]} rotation={[0.15, 0, 0]}>
            <mesh>
                <capsuleGeometry args={[0.05, 0.24, 6, 10]} />
                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
            </mesh>

            {/* Bristled fur on middle */}
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
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
                </mesh>
            ))}

            {/* Tip section */}
            <group ref={tailTipRef} position={[0, 0.2, 0]} rotation={[0.1, 0, 0]}>
                <mesh>
                    <capsuleGeometry args={[0.042, 0.18, 6, 8]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Bristled fur on tip */}
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
                        <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
                    </mesh>
                ))}

                {/* Curled tip section */}
                <group ref={tailCurlRef} position={[0, 0.15, 0]} rotation={[0.3, 0, 0.4]}>
                    <mesh>
                        <capsuleGeometry args={[0.035, 0.14, 4, 8]} />
                        <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
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
                            <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
                        </mesh>
                    ))}

                    {/* Very tip - curled end */}
                    <group position={[0.02, 0.1, 0.02]} rotation={[0.5, 0, 0.8]}>
                        <mesh>
                            <capsuleGeometry args={[0.028, 0.1, 4, 6]} />
                            <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                        </mesh>
                        {/* Final tuft */}
                        <mesh position={[0, 0.08, 0]}>
                            <sphereGeometry args={[0.045, 8, 8]} />
                            <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
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
                                <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
                            </mesh>
                        ))}
                    </group>
                </group>
            </group>
        </group>
    </group>
);

export const CatModel: React.FC<CatModelProps> = ({ refs, furSpikes }) => {
    return (
        <group ref={refs.groupRef} scale={1.66}>
            {/* Main body group */}
            <group ref={refs.bodyRef}>
                {/* Body - sleek arched back silhouette */}
                <mesh position={[0, 0.48, 0]} rotation={[0.25, 0, 0]} castShadow>
                    <capsuleGeometry args={[0.26, 0.85, 8, 16]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Arched spine bump */}
                <mesh position={[0, 0.72, -0.05]} castShadow>
                    <sphereGeometry args={[0.23, 16, 16]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Secondary spine arch */}
                <mesh position={[0, 0.68, -0.25]} castShadow>
                    <sphereGeometry args={[0.2, 12, 12]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Chest */}
                <mesh position={[0, 0.52, 0.38]} castShadow>
                    <sphereGeometry args={[0.28, 16, 16]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Shoulder blades */}
                <mesh position={[0.1, 0.6, 0.25]} castShadow>
                    <sphereGeometry args={[0.15, 10, 10]} />
                    <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>
                <mesh position={[-0.1, 0.6, 0.25]} castShadow>
                    <sphereGeometry args={[0.15, 10, 10]} />
                    <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Hip */}
                <mesh position={[0, 0.42, -0.42]} castShadow>
                    <sphereGeometry args={[0.26, 12, 12]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Belly tuck */}
                <mesh position={[0, 0.38, 0]} castShadow>
                    <capsuleGeometry args={[0.18, 0.5, 6, 10]} />
                    <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Bristled fur spikes on back */}
                {furSpikes.map((spike, i) => (
                    <mesh
                        key={`spine-fur-${i}`}
                        position={[spike.x, spike.y, spike.z]}
                        rotation={[spike.rotX, 0, spike.rotZ]}
                    >
                        <coneGeometry args={[spike.scale, spike.scale * 3.5, 4]} />
                        <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
                    </mesh>
                ))}
            </group>

            {/* Head Group */}
            <group ref={refs.headRef} position={[0, 0.82, 0.52]}>
                {/* Main head */}
                <mesh castShadow>
                    <sphereGeometry args={[0.34, 20, 20]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Forehead bump */}
                <mesh position={[0, 0.12, 0.15]} castShadow>
                    <sphereGeometry args={[0.22, 12, 12]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Cheeks */}
                <mesh position={[0.2, -0.06, 0.12]}>
                    <sphereGeometry args={[0.16, 12, 12]} />
                    <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>
                <mesh position={[-0.2, -0.06, 0.12]}>
                    <sphereGeometry args={[0.16, 12, 12]} />
                    <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Muzzle */}
                <mesh position={[0, -0.1, 0.26]}>
                    <sphereGeometry args={[0.14, 14, 14]} />
                    <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>
                <mesh position={[0, -0.02, 0.32]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Nose */}
                <mesh position={[0, -0.02, 0.42]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.045, 0.055, 3]} />
                    <meshStandardMaterial color={COLORS.NOSE} roughness={MATERIAL_SETTINGS.NOSE_ROUGHNESS} metalness={MATERIAL_SETTINGS.NOSE_METALNESS} />
                </mesh>
                <mesh position={[0, 0, 0.445]}>
                    <sphereGeometry args={[0.015, 6, 6]} />
                    <meshStandardMaterial color={COLORS.NOSE_HIGHLIGHT} roughness={0.2} />
                </mesh>

                {/* Eyes */}
                <group>
                    <CatEye side="right" />
                    <CatEye side="left" />
                </group>

                {/* Brow ridge - angry expression */}
                <mesh position={[0.08, 0.16, 0.26]} rotation={[0.2, 0.2, 0.3]}>
                    <boxGeometry args={[0.12, 0.03, 0.06]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>
                <mesh position={[-0.08, 0.16, 0.26]} rotation={[0.2, -0.2, -0.3]}>
                    <boxGeometry args={[0.12, 0.03, 0.06]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                </mesh>

                {/* Ears */}
                <CatEar side="right" earRef={refs.rightEarRef} />
                <CatEar side="left" earRef={refs.leftEarRef} />

                {/* Mouth */}
                <mesh position={[0, -0.16, 0.18]}>
                    <sphereGeometry args={[0.11, 12, 12]} />
                    <meshBasicMaterial color={COLORS.MOUTH_DARK} />
                </mesh>
                <mesh position={[0, -0.14, 0.24]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshBasicMaterial color={COLORS.MOUTH_RED} />
                </mesh>

                {/* Animated Jaw group */}
                <group ref={refs.jawRef} position={[0, -0.21, 0.14]}>
                    <mesh>
                        <boxGeometry args={[0.16, 0.055, 0.14]} />
                        <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                    </mesh>
                    <mesh position={[0, -0.02, 0.05]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color={COLORS.FUR_DARK} roughness={MATERIAL_SETTINGS.FUR_ROUGHNESS} />
                    </mesh>
                    {/* Tongue */}
                    <mesh position={[0, 0.025, 0.04]} rotation={[0.35, 0, 0]}>
                        <capsuleGeometry args={[0.04, 0.08, 6, 8]} />
                        <meshStandardMaterial color={COLORS.TONGUE_RED} roughness={0.5} />
                    </mesh>
                    <mesh position={[0, 0.03, 0.1]} rotation={[0.5, 0, 0]}>
                        <sphereGeometry args={[0.025, 8, 8]} />
                        <meshStandardMaterial color={COLORS.TONGUE_PINK} roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 0.035, 0.06]} rotation={[0.35, 0, 0]}>
                        <boxGeometry args={[0.01, 0.005, 0.06]} />
                        <meshStandardMaterial color={COLORS.MOUTH_RED} roughness={0.6} />
                    </mesh>
                </group>

                {/* Fangs */}
                <mesh position={[0.055, -0.17, 0.32]} rotation={[0.12, 0, 0.05]}>
                    <coneGeometry args={[0.022, 0.14, 8]} />
                    <meshStandardMaterial color={COLORS.FANG_WHITE} roughness={MATERIAL_SETTINGS.FANG_ROUGHNESS} />
                </mesh>
                <mesh position={[-0.055, -0.17, 0.32]} rotation={[0.12, 0, -0.05]}>
                    <coneGeometry args={[0.022, 0.14, 8]} />
                    <meshStandardMaterial color={COLORS.FANG_WHITE} roughness={MATERIAL_SETTINGS.FANG_ROUGHNESS} />
                </mesh>
                {/* Upper teeth row */}
                {[-0.025, 0, 0.025].map((offset, i) => (
                    <mesh key={`upper-tooth-${i}`} position={[offset, -0.15, 0.34]} rotation={[0.1, 0, 0]}>
                        <coneGeometry args={[0.012, 0.05, 6]} />
                        <meshStandardMaterial color={COLORS.TEETH_WHITE} roughness={0.3} />
                    </mesh>
                ))}

                {/* Whiskers */}
                {[-1, 1].map((side) => (
                    <group key={`whiskers-${side}`}>
                        {[0.035, 0, -0.035].map((yOff, i) => (
                            <mesh
                                key={i}
                                position={[side * 0.18, yOff - 0.04, 0.3]}
                                rotation={[yOff * 2.5, 0, side * (0.12 + i * 0.1)]}
                            >
                                <cylinderGeometry args={[0.006, 0.003, 0.35, 4]} />
                                <meshStandardMaterial color={COLORS.WHISKER_DARK} roughness={0.8} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Cheek fur tufts */}
                <mesh position={[0.24, -0.08, 0.08]} rotation={[0, 0.3, 0.5]}>
                    <coneGeometry args={[0.04, 0.1, 4]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
                </mesh>
                <mesh position={[-0.24, -0.08, 0.08]} rotation={[0, -0.3, -0.5]}>
                    <coneGeometry args={[0.04, 0.1, 4]} />
                    <meshStandardMaterial color={COLORS.FUR_BLACK} roughness={1} />
                </mesh>
            </group>

            {/* Front Paws */}
            <FrontPaw side="right" pawRef={refs.frontRightPawRef} />
            <FrontPaw side="left" pawRef={refs.frontLeftPawRef} />

            {/* Back Legs */}
            <BackLeg side="right" legRef={refs.backRightLegRef} />
            <BackLeg side="left" legRef={refs.backLeftLegRef} />

            {/* Tail */}
            <TailSection
                tailRef={refs.tailRef}
                tailMidRef={refs.tailMidRef}
                tailTipRef={refs.tailTipRef}
                tailCurlRef={refs.tailCurlRef}
            />

            {/* Shadow */}
            <mesh geometry={SHADOW_CAT_GEO} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={2.5}>
                <meshBasicMaterial color={COLORS.SHADOW} opacity={0.5} transparent />
            </mesh>
        </group>
    );
};

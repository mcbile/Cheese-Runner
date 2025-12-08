/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PlayerModel - 3D model of the lab mouse character
 * Separated from Player.tsx for better maintainability
 */

import React, { forwardRef } from 'react';
import * as THREE from 'three';
import {
    MOUSE_HEAD_GEO,
    MOUSE_EAR_GEO,
    MOUSE_INNER_EAR_GEO,
    MOUSE_SNOUT_GEO,
    MOUSE_NOSE_GEO,
    MOUSE_BODY_GEO,
    MOUSE_BELLY_GEO,
    MOUSE_LIMB_GEO,
    MOUSE_TAIL_GEO,
    MOUSE_WHISKER_GEO,
    MOUSE_JOINT_GEO,
    MOUSE_FINGER_GEO,
    MOUSE_TOOTH_GEO,
    MOUSE_EYE_HIGHLIGHT_GEO,
    PLAYER_SHADOW_GEO
} from './geometries';

export interface PlayerModelRefs {
    bodyRef: React.RefObject<THREE.Group>;
    headRef: React.RefObject<THREE.Group>;
    tailRef: React.RefObject<THREE.Group>;
    leftArmRef: React.RefObject<THREE.Group>;
    rightArmRef: React.RefObject<THREE.Group>;
    leftLegRef: React.RefObject<THREE.Group>;
    rightLegRef: React.RefObject<THREE.Group>;
    shadowRef: React.RefObject<THREE.Mesh>;
}

export interface PlayerModelProps {
    refs: PlayerModelRefs;
    furMaterial: THREE.Material;
    pinkMaterial: THREE.Material;
    eyeMaterial: THREE.Material;
    shadowMaterial: THREE.Material;
    whiskerMaterial: THREE.Material;
    isFirstPersonMode?: boolean;
}

export const PlayerModel: React.FC<PlayerModelProps> = ({
    refs,
    furMaterial,
    pinkMaterial,
    eyeMaterial,
    shadowMaterial,
    whiskerMaterial,
    isFirstPersonMode = false
}) => {
    const { bodyRef, headRef, tailRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef, shadowRef } = refs;

    // In first person mode, only show whiskers silhouette
    if (isFirstPersonMode) {
        return (
            <>
                <group ref={bodyRef} position={[0, 0.8, 0]}>
                    {/* Hidden refs to maintain animation system */}
                    <group ref={tailRef} visible={false} />
                    <group ref={headRef} position={[0, 0.35, 0]}>
                        {/* Only whiskers visible - subtle silhouette at bottom of screen */}
                        <group position={[0, -0.15, -0.5]}>
                            {/* Right whiskers */}
                            <mesh position={[0.25, 0.02, 0]} rotation={[0, 0.3, 0.05]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                            <mesh position={[0.28, -0.02, 0.02]} rotation={[0, 0.15, 0]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                            <mesh position={[0.25, -0.06, 0.04]} rotation={[0, 0, -0.05]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />

                            {/* Left whiskers */}
                            <mesh position={[-0.25, 0.02, 0]} rotation={[0, -0.3, -0.05]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                            <mesh position={[-0.28, -0.02, 0.02]} rotation={[0, -0.15, 0]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                            <mesh position={[-0.25, -0.06, 0.04]} rotation={[0, 0, 0.05]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                        </group>
                    </group>
                    {/* Hidden arm/leg refs */}
                    <group position={[0.22, 0.1, 0]}><group ref={rightArmRef} visible={false} /></group>
                    <group position={[-0.22, 0.1, 0]}><group ref={leftArmRef} visible={false} /></group>
                    <group position={[0.12, -0.25, 0]}><group ref={rightLegRef} visible={false} /></group>
                    <group position={[-0.12, -0.25, 0]}><group ref={leftLegRef} visible={false} /></group>
                </group>
                {/* Shadow still visible */}
                <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={PLAYER_SHADOW_GEO} material={shadowMaterial} />
            </>
        );
    }

    return (
        <>
            <group ref={bodyRef} position={[0, 0.8, 0]}>
                {/* Body */}
                <mesh castShadow geometry={MOUSE_BODY_GEO} material={furMaterial} />

                {/* Belly */}
                <mesh position={[0, -0.1, -0.15]} geometry={MOUSE_BELLY_GEO} material={furMaterial} castShadow />

                {/* Tail */}
                <group ref={tailRef} position={[0, -0.4, 0.2]} rotation={[1.0, 0, 0]}>
                    <mesh castShadow geometry={MOUSE_TAIL_GEO} material={pinkMaterial} />
                </group>

                {/* Head Group */}
                <group ref={headRef} position={[0, 0.35, 0]}>
                    <mesh castShadow geometry={MOUSE_HEAD_GEO} material={furMaterial} />

                    {/* Snout */}
                    <mesh position={[0, -0.05, -0.25]} geometry={MOUSE_SNOUT_GEO} material={furMaterial} />
                    {/* Nose */}
                    <mesh position={[0, -0.05, -0.4]} geometry={MOUSE_NOSE_GEO} material={pinkMaterial} />

                    {/* Teeth */}
                    <mesh position={[0.015, -0.15, -0.38]} geometry={MOUSE_TOOTH_GEO}>
                        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
                    </mesh>
                    <mesh position={[-0.015, -0.15, -0.38]} geometry={MOUSE_TOOTH_GEO}>
                        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
                    </mesh>

                    {/* Whiskers */}
                    <group position={[0, -0.08, -0.32]}>
                        <mesh position={[0.2, 0.04, -0.02]} rotation={[0, 0.4, 0.1]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                        <mesh position={[0.22, 0, 0]} rotation={[0, 0.2, 0]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                        <mesh position={[0.2, -0.04, 0.02]} rotation={[0, 0, -0.1]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />

                        <mesh position={[-0.2, 0.04, -0.02]} rotation={[0, -0.4, -0.1]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                        <mesh position={[-0.22, 0, 0]} rotation={[0, -0.2, 0]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                        <mesh position={[-0.2, -0.04, 0.02]} rotation={[0, 0, 0.1]} geometry={MOUSE_WHISKER_GEO} material={whiskerMaterial} />
                    </group>

                    {/* Eyes */}
                    <mesh position={[0.12, 0.05, -0.28]} geometry={MOUSE_NOSE_GEO} material={eyeMaterial} />
                    <mesh position={[-0.12, 0.05, -0.28]} geometry={MOUSE_NOSE_GEO} material={eyeMaterial} />

                    {/* Eye highlights */}
                    <mesh position={[0.135, 0.07, -0.32]} geometry={MOUSE_EYE_HIGHLIGHT_GEO}>
                        <meshBasicMaterial color="#FFFFFF" />
                    </mesh>
                    <mesh position={[-0.105, 0.07, -0.32]} geometry={MOUSE_EYE_HIGHLIGHT_GEO}>
                        <meshBasicMaterial color="#FFFFFF" />
                    </mesh>

                    {/* Ears */}
                    <group position={[0.25, 0.25, 0]} rotation={[0, 0, -0.5]}>
                        <mesh geometry={MOUSE_EAR_GEO} rotation={[Math.PI / 2, 0, 0]} material={furMaterial} castShadow />
                        <mesh position={[0, 0, -0.01]} geometry={MOUSE_INNER_EAR_GEO} rotation={[Math.PI / 2, 0, 0]} material={pinkMaterial} />
                    </group>
                    <group position={[-0.25, 0.25, 0]} rotation={[0, 0, 0.5]}>
                        <mesh geometry={MOUSE_EAR_GEO} rotation={[Math.PI / 2, 0, 0]} material={furMaterial} castShadow />
                        <mesh position={[0, 0, -0.01]} geometry={MOUSE_INNER_EAR_GEO} rotation={[Math.PI / 2, 0, 0]} material={pinkMaterial} />
                    </group>
                </group>

                {/* Right Arm */}
                <group position={[0.22, 0.1, 0]}>
                    <group ref={rightArmRef}>
                        <mesh geometry={MOUSE_JOINT_GEO} material={furMaterial} />
                        <mesh position={[0, -0.2, 0]} castShadow geometry={MOUSE_LIMB_GEO} material={furMaterial} />
                        <mesh position={[0, -0.4, 0]} geometry={MOUSE_NOSE_GEO} material={pinkMaterial} />
                        <group position={[0, -0.43, 0]}>
                            <mesh position={[0.03, 0, -0.03]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[0, 0, -0.04]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[-0.03, 0, -0.03]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                        </group>
                    </group>
                </group>

                {/* Left Arm */}
                <group position={[-0.22, 0.1, 0]}>
                    <group ref={leftArmRef}>
                        <mesh geometry={MOUSE_JOINT_GEO} material={furMaterial} />
                        <mesh position={[0, -0.2, 0]} castShadow geometry={MOUSE_LIMB_GEO} material={furMaterial} />
                        <mesh position={[0, -0.4, 0]} geometry={MOUSE_NOSE_GEO} material={pinkMaterial} />
                        <group position={[0, -0.43, 0]}>
                            <mesh position={[0.03, 0, -0.03]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[0, 0, -0.04]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[-0.03, 0, -0.03]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                        </group>
                    </group>
                </group>

                {/* Right Leg */}
                <group position={[0.12, -0.25, 0]}>
                    <group ref={rightLegRef}>
                        <mesh geometry={MOUSE_JOINT_GEO} material={furMaterial} />
                        <mesh position={[0, -0.2, 0]} castShadow geometry={MOUSE_LIMB_GEO} material={furMaterial} />
                        <mesh position={[0, -0.4, 0.05]} geometry={MOUSE_NOSE_GEO} material={pinkMaterial} />
                        <group position={[0, -0.43, 0.08]}>
                            <mesh position={[0.02, 0, 0.02]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[0, 0, 0.03]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[-0.02, 0, 0.02]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                        </group>
                    </group>
                </group>

                {/* Left Leg */}
                <group position={[-0.12, -0.25, 0]}>
                    <group ref={leftLegRef}>
                        <mesh geometry={MOUSE_JOINT_GEO} material={furMaterial} />
                        <mesh position={[0, -0.2, 0]} castShadow geometry={MOUSE_LIMB_GEO} material={furMaterial} />
                        <mesh position={[0, -0.4, 0.05]} geometry={MOUSE_NOSE_GEO} material={pinkMaterial} />
                        <group position={[0, -0.43, 0.08]}>
                            <mesh position={[0.02, 0, 0.02]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[0, 0, 0.03]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                            <mesh position={[-0.02, 0, 0.02]} geometry={MOUSE_FINGER_GEO} material={pinkMaterial} />
                        </group>
                    </group>
                </group>
            </group>

            <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={PLAYER_SHADOW_GEO} material={shadowMaterial} />
        </>
    );
};

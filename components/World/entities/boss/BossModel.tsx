/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BossModel - 3D geometry and visual components for the Boss
 */

import React from 'react';
import * as THREE from 'three';
import { BossObject, isBoss } from '../../../../types';
import {
    DOCTOR_BODY_GEO, DOCTOR_SHOULDER_GEO, DOCTOR_LEG_GEO, DOCTOR_HEAD_GEO,
    DOCTOR_NOSE_GEO, DOCTOR_HAIR_GEO, DOCTOR_TOP_HAIR_GEO, DOCTOR_GLASSES_GEO,
    DOCTOR_LENS_GEO, DOCTOR_SWIRL_GEO, DOCTOR_SHOE_GEO, DOCTOR_MOUTH_GEO, DOCTOR_TIE_GEO,
    CAT_LEG_GEO,
    SYRINGE_BARREL_GEO, SYRINGE_NEEDLE_GEO, SYRINGE_NEEDLE_HUB_GEO,
    SYRINGE_PLUNGER_GEO, SYRINGE_FLUID_GEO, SYRINGE_FINGER_FLANGE_GEO,
    SHADOW_CAT_GEO, MOUSE_WHISKER_GEO
} from '../../geometries';
import { COLORS, MATERIAL_SETTINGS } from './bossMaterials';
import { BossAnimationRefs } from './useBossAnimation';

interface BossModelProps {
    data: BossObject;
    refs: BossAnimationRefs;
}

/** Syringe sub-component */
const Syringe: React.FC = () => (
    <group position={[0, -0.65, 0.15]} rotation={[Math.PI / 2, 0, 0]} scale={0.66}>
        <mesh geometry={SYRINGE_BARREL_GEO}>
            <meshPhysicalMaterial
                color={COLORS.SYRINGE_BODY}
                transmission={MATERIAL_SETTINGS.SYRINGE_TRANSMISSION}
                opacity={MATERIAL_SETTINGS.SYRINGE_OPACITY}
                transparent
                roughness={MATERIAL_SETTINGS.SYRINGE_ROUGHNESS}
            />
        </mesh>
        <mesh geometry={SYRINGE_FINGER_FLANGE_GEO} position={[0, -0.38, 0]}>
            <meshStandardMaterial color={COLORS.SYRINGE_FLANGE} roughness={0.3} />
        </mesh>
        <mesh geometry={SYRINGE_FLUID_GEO} position={[0, -0.06, 0]} renderOrder={1}>
            <meshStandardMaterial
                color={COLORS.SYRINGE_FLUID}
                emissive={COLORS.SYRINGE_FLUID_EMISSIVE}
                emissiveIntensity={MATERIAL_SETTINGS.FLUID_EMISSIVE_INTENSITY}
                toneMapped={false}
            />
        </mesh>
        <mesh geometry={SYRINGE_NEEDLE_HUB_GEO} position={[0, 0.46, 0]}>
            <meshStandardMaterial color={COLORS.SYRINGE_HUB} metalness={0.95} roughness={MATERIAL_SETTINGS.METAL_ROUGHNESS} />
        </mesh>
        <mesh geometry={SYRINGE_NEEDLE_GEO} position={[0, 0.75, 0]}>
            <meshStandardMaterial color={COLORS.SYRINGE_NEEDLE} metalness={MATERIAL_SETTINGS.NEEDLE_METALNESS} roughness={MATERIAL_SETTINGS.NEEDLE_ROUGHNESS} />
        </mesh>
        <mesh geometry={SYRINGE_PLUNGER_GEO} position={[0, -0.65, 0]}>
            <meshStandardMaterial color={COLORS.SYRINGE_PLUNGER} roughness={0.7} />
        </mesh>
    </group>
);

/** Blood stains sub-component */
const BloodStains: React.FC<{ data: BossObject }> = ({ data }) => {
    if (!isBoss(data)) return null;

    const hpRatio = data.health / data.maxHealth;
    const showFirstStain = hpRatio <= 0.67; // 1/3 HP lost
    const showLargerStain = hpRatio <= 0.34; // 2/3 HP lost
    const stainScale = showLargerStain ? 2.0 : 1.0;

    if (!showFirstStain) return null;

    return (
        <>
            {/* FRONT stains */}
            <mesh position={[0, 0, 0.44]} rotation={[0, 0, 0.2]} scale={stainScale} renderOrder={10}>
                <circleGeometry args={[0.12, 8]} />
                <meshBasicMaterial color={COLORS.BLOOD_DARK} side={THREE.DoubleSide} depthTest={false} />
            </mesh>
            {/* BACK stains */}
            <mesh position={[0, 0, -0.44]} rotation={[0, Math.PI, -0.2]} scale={stainScale} renderOrder={10}>
                <circleGeometry args={[0.12, 8]} />
                <meshBasicMaterial color={COLORS.BLOOD_DARK} side={THREE.DoubleSide} depthTest={false} />
            </mesh>
            {/* Additional splatter when large */}
            {showLargerStain && (
                <>
                    {/* Front splatters */}
                    <mesh position={[0.15, -0.1, 0.44]} rotation={[0, 0, -0.3]} renderOrder={10}>
                        <circleGeometry args={[0.06, 6]} />
                        <meshBasicMaterial color={COLORS.BLOOD_MED} side={THREE.DoubleSide} depthTest={false} />
                    </mesh>
                    <mesh position={[-0.12, 0.08, 0.44]} rotation={[0, 0, 0.4]} renderOrder={10}>
                        <circleGeometry args={[0.05, 6]} />
                        <meshBasicMaterial color={COLORS.BLOOD_LIGHT} side={THREE.DoubleSide} depthTest={false} />
                    </mesh>
                    {/* Back splatters */}
                    <mesh position={[-0.15, -0.1, -0.44]} rotation={[0, Math.PI, 0.3]} renderOrder={10}>
                        <circleGeometry args={[0.06, 6]} />
                        <meshBasicMaterial color={COLORS.BLOOD_MED} side={THREE.DoubleSide} depthTest={false} />
                    </mesh>
                    <mesh position={[0.12, 0.08, -0.44]} rotation={[0, Math.PI, -0.4]} renderOrder={10}>
                        <circleGeometry args={[0.05, 6]} />
                        <meshBasicMaterial color={COLORS.BLOOD_LIGHT} side={THREE.DoubleSide} depthTest={false} />
                    </mesh>
                </>
            )}
        </>
    );
};

/** Head sub-component */
const BossHead: React.FC<{ refs: BossAnimationRefs }> = ({ refs }) => (
    <group ref={refs.headRef} position={[0, 2.0, 0]}>
        <mesh geometry={DOCTOR_HEAD_GEO} castShadow>
            <meshStandardMaterial
                ref={el => { if (el) refs.materialRefs.current[1] = el }}
                color={COLORS.SKIN}
            />
        </mesh>

        {/* Spiky Hair Tufts */}
        <mesh geometry={DOCTOR_HAIR_GEO} position={[0.42, 0.1, 0]} rotation={[0, 0, -1.2]}>
            <meshStandardMaterial color={COLORS.HAIR_BLACK} />
        </mesh>
        <mesh geometry={DOCTOR_HAIR_GEO} position={[-0.42, 0.1, 0]} rotation={[0, 0, 1.2]}>
            <meshStandardMaterial color={COLORS.HAIR_BLACK} />
        </mesh>
        <mesh geometry={DOCTOR_TOP_HAIR_GEO} position={[0, 0.45, 0]}>
            <meshStandardMaterial color={COLORS.HAIR_BLACK} />
        </mesh>

        {/* Large Nose */}
        <mesh geometry={DOCTOR_NOSE_GEO} position={[0, -0.1, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={COLORS.NOSE_PINK} />
        </mesh>

        {/* Crazy Glasses */}
        <group position={[0, 0.15, 0.38]}>
            <mesh geometry={DOCTOR_GLASSES_GEO} position={[0.16, 0, 0]}>
                <meshStandardMaterial color={COLORS.GLASSES_FRAME} />
            </mesh>
            <mesh geometry={DOCTOR_GLASSES_GEO} position={[-0.16, 0, 0]}>
                <meshStandardMaterial color={COLORS.GLASSES_FRAME} />
            </mesh>
            <mesh geometry={DOCTOR_LENS_GEO} position={[0.16, 0, 0.02]}>
                <meshBasicMaterial color={COLORS.LENS_WHITE} />
            </mesh>
            <mesh geometry={DOCTOR_SWIRL_GEO} position={[0.16, 0, 0.03]}>
                <meshBasicMaterial color={COLORS.SWIRL_BLACK} />
            </mesh>
            <mesh geometry={DOCTOR_LENS_GEO} position={[-0.16, 0, 0.02]}>
                <meshBasicMaterial color={COLORS.LENS_WHITE} />
            </mesh>
            <mesh geometry={DOCTOR_SWIRL_GEO} position={[-0.16, 0, 0.03]}>
                <meshBasicMaterial color={COLORS.SWIRL_BLACK} />
            </mesh>
        </group>

        {/* Mouth */}
        <mesh geometry={DOCTOR_MOUTH_GEO} position={[0, -0.32, 0.42]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color={COLORS.MOUTH} roughness={0.6} />
        </mesh>

        {/* Mustache/Whiskers */}
        <group position={[0, -0.18, 0.48]}>
            <mesh position={[0.25, 0, 0]} rotation={[0, 0, -0.2]} scale={[1.5, 15.0, 15.0]}>
                <mesh geometry={MOUSE_WHISKER_GEO}>
                    <meshStandardMaterial color={COLORS.MUSTACHE} />
                </mesh>
            </mesh>
            <mesh position={[-0.25, 0, 0]} rotation={[0, 0, 0.2]} scale={[1.5, 15.0, 15.0]}>
                <mesh geometry={MOUSE_WHISKER_GEO}>
                    <meshStandardMaterial color={COLORS.MUSTACHE} />
                </mesh>
            </mesh>
        </group>
    </group>
);

export const BossModel: React.FC<BossModelProps> = ({ data, refs }) => {
    return (
        <group ref={refs.groupRef} scale={3.5}>
            {/* Shadow */}
            <mesh geometry={SHADOW_CAT_GEO} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.5}>
                <meshBasicMaterial color={COLORS.SHADOW} opacity={0.5} transparent />
            </mesh>

            {/* BODY GROUP (Coat + Legs) */}
            <group position={[0, 1.05, 0]}>
                {/* Lab Coat Body */}
                <mesh geometry={DOCTOR_BODY_GEO} castShadow ref={refs.coatRef}>
                    <meshStandardMaterial
                        ref={el => { if (el) refs.materialRefs.current[0] = el }}
                        color={COLORS.COAT_WHITE}
                        roughness={MATERIAL_SETTINGS.COAT_ROUGHNESS}
                    />
                </mesh>
                {/* Shoulders */}
                <mesh geometry={DOCTOR_SHOULDER_GEO} position={[0, 0.25, 0]}>
                    <meshStandardMaterial
                        ref={el => { if (el) refs.materialRefs.current[2] = el }}
                        color={COLORS.COAT_WHITE}
                        roughness={MATERIAL_SETTINGS.COAT_ROUGHNESS}
                    />
                </mesh>

                {/* Blood stains */}
                <BloodStains data={data} />

                {/* Tie & Pocket */}
                <mesh ref={refs.tieRef} geometry={DOCTOR_TIE_GEO} position={[0, 0.2, 0.4]} rotation={[Math.PI, 0, 0]}>
                    <meshStandardMaterial color={COLORS.TIE_PURPLE} />
                </mesh>
                <mesh position={[0.2, -0.1, 0.42]} scale={[0.15, 0.2, 0.05]}>
                    <boxGeometry />
                    <meshStandardMaterial color={COLORS.COAT_POCKET} />
                </mesh>

                {/* Purple Pants Legs */}
                <group position={[0, -0.05, 0]}>
                    {/* Right Leg */}
                    <group ref={refs.rightLegRef} position={[0.2, 0, 0]}>
                        <mesh position={[0, -0.45, 0]} geometry={DOCTOR_LEG_GEO}>
                            <meshStandardMaterial color={COLORS.PANTS_PURPLE} />
                        </mesh>
                        <mesh position={[0, -0.9, 0.1]} geometry={DOCTOR_SHOE_GEO}>
                            <meshStandardMaterial color={COLORS.SHOE_BLACK} />
                        </mesh>
                    </group>
                    {/* Left Leg */}
                    <group ref={refs.leftLegRef} position={[-0.2, 0, 0]}>
                        <mesh position={[0, -0.45, 0]} geometry={DOCTOR_LEG_GEO}>
                            <meshStandardMaterial color={COLORS.PANTS_PURPLE} />
                        </mesh>
                        <mesh position={[0, -0.9, 0.1]} geometry={DOCTOR_SHOE_GEO}>
                            <meshStandardMaterial color={COLORS.SHOE_BLACK} />
                        </mesh>
                    </group>
                </group>

                {/* Right Arm (Holding Syringe) */}
                <group ref={refs.rightArmRef} position={[0.6, 0.35, 0]}>
                    <group rotation={[0, 0, -0.2]}>
                        <mesh geometry={CAT_LEG_GEO} position={[0, -0.35, 0]}>
                            <meshStandardMaterial color={COLORS.COAT_WHITE} />
                        </mesh>
                        <Syringe />
                    </group>
                </group>

                {/* Left Arm (Also Holding Syringe) */}
                <group ref={refs.leftArmRef} position={[-0.6, 0.35, 0]}>
                    <group rotation={[0, 0, 0.2]}>
                        <mesh geometry={CAT_LEG_GEO} position={[0, -0.35, 0]}>
                            <meshStandardMaterial color={COLORS.COAT_WHITE} />
                        </mesh>
                        <Syringe />
                    </group>
                </group>
            </group>

            {/* HEAD GROUP */}
            <BossHead refs={refs} />
        </group>
    );
};

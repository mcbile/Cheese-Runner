/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameObject, GameStatus } from '../../../types';
import { useStore } from '../../../store';
import {
    MOUSETRAP_BASE_GEO, MOUSETRAP_BASE_TOP_GEO, MOUSETRAP_FRONT_EDGE_GEO,
    MOUSETRAP_SIDE_RAIL_GEO, MOUSETRAP_TOP_BAR_GEO, MOUSETRAP_KILL_BAR_GEO,
    MOUSETRAP_SPRING_GEO, MOUSETRAP_TRIGGER_PLATE_GEO, MOUSETRAP_TRIGGER_ARM_GEO,
    MOUSETRAP_LOCK_BAR_GEO, MOUSETRAP_HOOK_GEO, MOUSETRAP_PEDAL_GEO,
    MOUSETRAP_STAPLE_GEO, MOUSETRAP_WIRE_GEO,
    MOUSETRAP_PLANK_LINE_GEO, SHADOW_TRAP_GEO
} from '../geometries';

interface MousetrapEntityProps {
    data: GameObject;
}

// Scale factor for mousetrap (25% smaller + 5% lower = 0.7125)
const MOUSETRAP_SCALE = 0.7125;

export const MousetrapEntity: React.FC<MousetrapEntityProps> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { status } = useStore();

    // Materials
    const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#C4883A',
        roughness: 0.85,
        metalness: 0.05,
    }), []);

    const woodDarkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#8B5A2B',
        roughness: 0.9,
        metalness: 0.0,
    }), []);

    const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#C0C0C0',
        roughness: 0.15,
        metalness: 0.95,
    }), []);

    const metalDarkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#A8A8A8',
        roughness: 0.2,
        metalness: 0.9,
    }), []);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
    });

    return (
        <group ref={groupRef}>
            {/* Scaled mousetrap group (25% smaller) */}
            <group scale={[MOUSETRAP_SCALE, MOUSETRAP_SCALE, MOUSETRAP_SCALE]}>
                {/* === WOODEN BASE === */}
                {/* Main base platform */}
                <mesh geometry={MOUSETRAP_BASE_GEO} position={[0, 0, 0]} castShadow receiveShadow material={woodMaterial} />

            {/* Top layer with wood grain effect */}
            <mesh geometry={MOUSETRAP_BASE_TOP_GEO} position={[0, 0.15, 0]} castShadow material={woodMaterial} />

            {/* Front curved edge (metal band) */}
            <mesh
                geometry={MOUSETRAP_FRONT_EDGE_GEO}
                position={[0, 0.08, -1.5]}
                rotation={[0, 0, Math.PI / 2]}
                material={metalDarkMaterial}
            />

            {/* Wood plank lines for texture */}
            {[-0.8, -0.3, 0.2, 0.7, 1.2].map((zPos, i) => (
                <mesh
                    key={`plank-${i}`}
                    geometry={MOUSETRAP_PLANK_LINE_GEO}
                    position={[0, 0.2, zPos]}
                    material={woodDarkMaterial}
                />
            ))}

            {/* === SIDE FRAME RAILS (Metal Arches) === */}
            {/* Left rail */}
            <mesh
                geometry={MOUSETRAP_SIDE_RAIL_GEO}
                position={[-0.75, 0.2, 0.2]}
                rotation={[0, Math.PI / 2, 0]}
                material={metalMaterial}
            />
            {/* Right rail */}
            <mesh
                geometry={MOUSETRAP_SIDE_RAIL_GEO}
                position={[0.75, 0.2, 0.2]}
                rotation={[0, Math.PI / 2, 0]}
                material={metalMaterial}
            />

            {/* Top cross bar connecting the arches */}
            <mesh
                geometry={MOUSETRAP_TOP_BAR_GEO}
                position={[0, 1.55, 0.2]}
                rotation={[0, 0, Math.PI / 2]}
                material={metalMaterial}
            />

            {/* Additional cross bars */}
            <mesh
                geometry={MOUSETRAP_TOP_BAR_GEO}
                position={[0, 1.2, -0.6]}
                rotation={[0, 0, Math.PI / 2]}
                material={metalDarkMaterial}
            />

            {/* === KILL BAR MECHANISM === */}
            {/* Kill bar (cocked back position) */}
            <group position={[0, 0.25, 1.0]} rotation={[-2.5, 0, 0]}>
                <mesh geometry={MOUSETRAP_KILL_BAR_GEO} position={[0, 0, -0.8]} material={metalMaterial} />
            </group>

            {/* === SPRING MECHANISM === */}
            {/* Left spring coil */}
            <mesh
                geometry={MOUSETRAP_SPRING_GEO}
                position={[-0.35, 0.3, 1.0]}
                rotation={[Math.PI / 2, 0, 0]}
                material={metalDarkMaterial}
            />
            <mesh
                geometry={MOUSETRAP_SPRING_GEO}
                position={[-0.35, 0.3, 0.85]}
                rotation={[Math.PI / 2, 0, 0]}
                material={metalDarkMaterial}
            />
            {/* Right spring coil */}
            <mesh
                geometry={MOUSETRAP_SPRING_GEO}
                position={[0.35, 0.3, 1.0]}
                rotation={[Math.PI / 2, 0, 0]}
                material={metalDarkMaterial}
            />
            <mesh
                geometry={MOUSETRAP_SPRING_GEO}
                position={[0.35, 0.3, 0.85]}
                rotation={[Math.PI / 2, 0, 0]}
                material={metalDarkMaterial}
            />

            {/* === CENTRAL TRIGGER MECHANISM === */}
            {/* Trigger plate (the part you press) */}
            <mesh
                geometry={MOUSETRAP_TRIGGER_PLATE_GEO}
                position={[0, 0.22, -0.2]}
                material={metalDarkMaterial}
            />

            {/* Trigger arm */}
            <mesh
                geometry={MOUSETRAP_TRIGGER_ARM_GEO}
                position={[0, 0.3, 0.2]}
                rotation={[0.2, 0, 0]}
                material={metalMaterial}
            />

            {/* Locking bar */}
            <mesh
                geometry={MOUSETRAP_LOCK_BAR_GEO}
                position={[0, 0.4, 0]}
                rotation={[-0.3, 0, 0]}
                material={metalDarkMaterial}
            />

            {/* Hook at end of locking bar */}
            <mesh
                geometry={MOUSETRAP_HOOK_GEO}
                position={[0, 0.5, -0.7]}
                rotation={[0, 0, 0]}
                material={metalMaterial}
            />

            {/* === STAPLES / BRACKETS === */}
            {/* Staples holding the mechanism to the wood */}
            <mesh
                geometry={MOUSETRAP_STAPLE_GEO}
                position={[-0.4, 0.22, 0.6]}
                rotation={[Math.PI / 2, 0, Math.PI / 2]}
                material={metalMaterial}
            />
            <mesh
                geometry={MOUSETRAP_STAPLE_GEO}
                position={[0.4, 0.22, 0.6]}
                rotation={[Math.PI / 2, 0, Math.PI / 2]}
                material={metalMaterial}
            />
            <mesh
                geometry={MOUSETRAP_STAPLE_GEO}
                position={[0, 0.22, -0.6]}
                rotation={[Math.PI / 2, 0, 0]}
                material={metalMaterial}
            />

            {/* === WIRE DETAILS === */}
            {/* Connecting wires */}
            <mesh
                geometry={MOUSETRAP_WIRE_GEO}
                position={[-0.6, 0.8, 0.4]}
                rotation={[0.5, 0.2, 0]}
                material={metalDarkMaterial}
            />
            <mesh
                geometry={MOUSETRAP_WIRE_GEO}
                position={[0.6, 0.8, 0.4]}
                rotation={[0.5, -0.2, 0]}
                material={metalDarkMaterial}
            />

                {/* === BAIT AREA === */}
                {/* Bait pedal */}
                <mesh
                    geometry={MOUSETRAP_PEDAL_GEO}
                    position={[0, 0.2, -0.9]}
                    material={metalMaterial}
                />

                {/* === SHADOW === */}
                <mesh geometry={SHADOW_TRAP_GEO} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <meshBasicMaterial color="#000000" opacity={0.35} transparent />
                </mesh>
            </group>
        </group>
    );
};

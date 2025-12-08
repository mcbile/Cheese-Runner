/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TulipField - Instanced tulip flowers for greenhouse sections
 * 3 meshes: stem, leaf, bloom
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { GameStatus, CAMERA_BASE_Z, CAMERA_DIST_FACTOR_DESKTOP } from '../../../types';
import {
    SCENERY_LIMIT_Z,
    LOOP_LENGTH,
    MOBILE_SCREEN_WIDTH_THRESHOLD,
    MOBILE_VISIBILITY_FACTOR
} from './constants';
import { generateSceneryLayout, generateTulipPositions } from './SceneryLayoutManager';

const TULIP_COUNT = 1500;

export const TulipField: React.FC = () => {
    const { speed, status, laneCount } = useStore();
    const { size } = useThree();

    const stemMeshRef = useRef<THREE.InstancedMesh>(null);
    const leafMeshRef = useRef<THREE.InstancedMesh>(null);
    const bloomMeshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Bloom geometry - tulip-shaped
    const bloomGeo = useMemo(() => {
        const geo = new THREE.SphereGeometry(0.12, 6, 4);
        geo.scale(1, 1.6, 1);
        return geo;
    }, []);

    // Leaf geometry - flat elongated shape
    const leafGeo = useMemo(() => {
        const geo = new THREE.BoxGeometry(0.08, 0.25, 0.02);
        return geo;
    }, []);

    // Generate positions using layout manager
    const { initialPositions, colors, randomRotations, randomScales, leafRotations } = useMemo(() => {
        const layout = generateSceneryLayout(laneCount);
        const positions = generateTulipPositions(layout, TULIP_COUNT, laneCount);

        const pos = new Float32Array(TULIP_COUNT * 3);
        const col = new Float32Array(TULIP_COUNT * 3);
        const rots = new Float32Array(TULIP_COUNT);
        const scales = new Float32Array(TULIP_COUNT);
        const leafRots = new Float32Array(TULIP_COUNT);

        const palette = [
            new THREE.Color('#FF0000'),
            new THREE.Color('#FF1744'),
            new THREE.Color('#FFFF00'),
            new THREE.Color('#FFC107'),
            new THREE.Color('#FFFFFF'),
            new THREE.Color('#F8BBD0'),
            new THREE.Color('#FF69B4'),
            new THREE.Color('#E91E63'),
            new THREE.Color('#FF6F00'),
            new THREE.Color('#9C27B0')
        ];

        for (let i = 0; i < TULIP_COUNT; i++) {
            if (i < positions.length) {
                pos[i * 3] = positions[i].x;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = positions[i].z;
            } else {
                pos[i * 3] = 1000;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = -2000;
            }

            rots[i] = Math.random() * Math.PI * 2;
            scales[i] = (0.7 + Math.random() * 0.5) * 1.35; // +35% size
            leafRots[i] = Math.random() * Math.PI * 2;

            const chosenColor = palette[Math.floor(Math.random() * palette.length)];
            col[i * 3] = chosenColor.r;
            col[i * 3 + 1] = chosenColor.g;
            col[i * 3 + 2] = chosenColor.b;
        }

        return { initialPositions: pos, colors: col, randomRotations: rots, randomScales: scales, leafRotations: leafRots };
    }, [laneCount]);

    // Initialize tulip positions on mount (before first frame)
    useEffect(() => {
        if (!stemMeshRef.current || !leafMeshRef.current || !bloomMeshRef.current) return;

        for (let i = 0; i < TULIP_COUNT; i++) {
            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const rotY = randomRotations[i];
            const scale = randomScales[i];
            const leafRotY = leafRotations[i];

            // Stem
            dummy.position.set(x, y + scale * 0.3, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            stemMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Leaf
            dummy.position.set(x + Math.cos(leafRotY) * scale * 0.05, y + scale * 0.15, z + Math.sin(leafRotY) * scale * 0.05);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0.3, leafRotY, 0);
            dummy.updateMatrix();
            leafMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Bloom
            dummy.position.set(x, y + scale * 0.6, z);
            dummy.scale.set(scale * 0.9, scale * 0.9, scale * 0.9);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            bloomMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        stemMeshRef.current.instanceMatrix.needsUpdate = true;
        leafMeshRef.current.instanceMatrix.needsUpdate = true;
        bloomMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [initialPositions, randomRotations, randomScales, leafRotations, dummy]);

    useFrame((state, delta) => {
        if (!stemMeshRef.current || !leafMeshRef.current || !bloomMeshRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const activeSpeed = speed > 0 ? speed : 2;

        // Mobile frustum culling optimization
        const isNarrowScreen = size.width < MOBILE_SCREEN_WIDTH_THRESHOLD && size.width > size.height;
        const extraLanes = Math.max(0, laneCount - 3);
        const cameraZ = CAMERA_BASE_Z + (extraLanes * CAMERA_DIST_FACTOR_DESKTOP);

        for (let i = 0; i < TULIP_COUNT; i++) {
            initialPositions[i * 3 + 2] += activeSpeed * delta;

            if (initialPositions[i * 3 + 2] > SCENERY_LIMIT_Z) {
                initialPositions[i * 3 + 2] -= LOOP_LENGTH;
            }

            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];

            // On narrow screens, skip matrix update for instances outside frustum
            if (isNarrowScreen) {
                const objX = Math.abs(x);
                const visibilityZ = cameraZ - (objX / MOBILE_VISIBILITY_FACTOR);
                if (z < visibilityZ) {
                    // Object not visible yet - hide it far away
                    dummy.position.set(0, -1000, 0);
                    dummy.scale.set(0, 0, 0);
                    dummy.updateMatrix();
                    stemMeshRef.current.setMatrixAt(i, dummy.matrix);
                    leafMeshRef.current.setMatrixAt(i, dummy.matrix);
                    bloomMeshRef.current.setMatrixAt(i, dummy.matrix);
                    continue;
                }
            }

            const rotY = randomRotations[i];
            const scale = randomScales[i];
            const leafRotY = leafRotations[i];

            // Stem
            dummy.position.set(x, y + scale * 0.3, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            stemMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Leaf - positioned at stem base, tilted outward
            dummy.position.set(x + Math.cos(leafRotY) * scale * 0.05, y + scale * 0.15, z + Math.sin(leafRotY) * scale * 0.05);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0.3, leafRotY, 0);
            dummy.updateMatrix();
            leafMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Bloom
            dummy.position.set(x, y + scale * 0.6, z);
            dummy.scale.set(scale * 0.9, scale * 0.9, scale * 0.9);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            bloomMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        stemMeshRef.current.instanceMatrix.needsUpdate = true;
        leafMeshRef.current.instanceMatrix.needsUpdate = true;
        bloomMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group key={`tulip-field-${laneCount}`}>
            {/* Stems */}
            <instancedMesh ref={stemMeshRef} args={[undefined, undefined, TULIP_COUNT]}>
                <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.9} />
            </instancedMesh>

            {/* Leaves */}
            <instancedMesh ref={leafMeshRef} args={[leafGeo, undefined, TULIP_COUNT]}>
                <meshStandardMaterial color="#388e3c" roughness={0.85} />
            </instancedMesh>

            {/* Blooms with instance colors */}
            <instancedMesh ref={bloomMeshRef} args={[bloomGeo, undefined, TULIP_COUNT]}>
                <meshStandardMaterial roughness={0.7} />
                <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
            </instancedMesh>
        </group>
    );
};

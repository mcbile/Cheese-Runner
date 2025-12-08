/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tree - Single deciduous trees scattered in row 2
 * Optimized: No wind animation, simplified geometry
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
import { generateSceneryLayout } from './SceneryLayoutManager';

export const Trees: React.FC = () => {
    const { speed, status, laneCount } = useStore();
    const { size } = useThree();

    const trunkMeshRef = useRef<THREE.InstancedMesh>(null);
    const foliageMeshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Trunk geometry - 1.5x wider and taller from base
    const trunkGeo = useMemo(() => {
        return new THREE.CylinderGeometry(0.15 * 1.5, 0.25 * 1.5, 2.5 * 1.5, 5);
    }, []);

    // Foliage geometry - 2x larger from base
    const foliageGeo = useMemo(() => {
        return new THREE.IcosahedronGeometry(1.2 * 2, 1);
    }, []);

    // Generate tree positions from layout
    const { trees, initialPositions, scales, rotations } = useMemo(() => {
        const layout = generateSceneryLayout(laneCount);
        const treeData = layout.trees;

        const pos = new Float32Array(treeData.length * 3);
        const scl = new Float32Array(treeData.length);
        const rot = new Float32Array(treeData.length);

        treeData.forEach((tree, i) => {
            pos[i * 3] = tree.x;
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = tree.z;
            scl[i] = tree.scale * 1.5; // +50% size
            rot[i] = tree.rotation;
        });

        return { trees: treeData, initialPositions: pos, scales: scl, rotations: rot };
    }, [laneCount]);

    const treeCount = trees.length;

    // Initialize tree positions on mount (before first frame)
    useEffect(() => {
        if (!trunkMeshRef.current || !foliageMeshRef.current) return;
        if (treeCount === 0) return;

        for (let i = 0; i < treeCount; i++) {
            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const scale = scales[i];
            const rotY = rotations[i];

            // Trunk position
            dummy.position.set(x, y + scale * 1.875, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            trunkMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Foliage position
            dummy.position.set(x, y + scale * 5.5, z);
            dummy.scale.set(scale * 1.1, scale * 0.9, scale * 1.1);
            dummy.updateMatrix();
            foliageMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        trunkMeshRef.current.instanceMatrix.needsUpdate = true;
        foliageMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [treeCount, initialPositions, scales, rotations, dummy]);

    useFrame((state, delta) => {
        if (!trunkMeshRef.current || !foliageMeshRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;
        if (treeCount === 0) return;

        const activeSpeed = speed > 0 ? speed : 2;

        // Mobile frustum culling optimization
        const isNarrowScreen = size.width < MOBILE_SCREEN_WIDTH_THRESHOLD && size.width > size.height;
        const extraLanes = Math.max(0, laneCount - 3);
        const cameraZ = CAMERA_BASE_Z + (extraLanes * CAMERA_DIST_FACTOR_DESKTOP);

        for (let i = 0; i < treeCount; i++) {
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
                    // Object not visible yet - hide it
                    dummy.position.set(0, -1000, 0);
                    dummy.scale.set(0, 0, 0);
                    dummy.updateMatrix();
                    trunkMeshRef.current.setMatrixAt(i, dummy.matrix);
                    foliageMeshRef.current.setMatrixAt(i, dummy.matrix);
                    continue;
                }
            }

            const scale = scales[i];
            const rotY = rotations[i];

            // No wind - static position
            // Trunk position adjusted for 1.5x taller trunk
            dummy.position.set(x, y + scale * 1.875, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            trunkMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Foliage position adjusted for larger crown (2x) on taller trunk
            dummy.position.set(x, y + scale * 5.5, z);
            dummy.scale.set(scale * 1.1, scale * 0.9, scale * 1.1);
            dummy.updateMatrix();
            foliageMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        trunkMeshRef.current.instanceMatrix.needsUpdate = true;
        foliageMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (treeCount === 0) return null;

    return (
        <group key={`trees-${laneCount}`}>
            <instancedMesh ref={trunkMeshRef} args={[trunkGeo, undefined, treeCount]}>
                <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </instancedMesh>

            <instancedMesh ref={foliageMeshRef} args={[foliageGeo, undefined, treeCount]}>
                <meshStandardMaterial color="#2e7d32" roughness={0.8} />
            </instancedMesh>
        </group>
    );
};

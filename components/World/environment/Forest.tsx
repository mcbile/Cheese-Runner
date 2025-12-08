/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Forest - Silhouette tree line at far edge (row 4)
 * Dark silhouettes fading into fog for atmosphere
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';
import {
    SCENERY_LIMIT_Z,
    LOOP_LENGTH
} from './constants';
import { generateSceneryLayout, generateForestPositions } from './SceneryLayoutManager';

const FOREST_TREE_COUNT = 120;

export const Forest: React.FC = () => {
    const { speed, status, laneCount } = useStore();

    const silhouetteMeshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Simple silhouette geometry - tall pine shape
    const silhouetteGeo = useMemo(() => {
        const geo = new THREE.ConeGeometry(3, 14, 4);
        return geo;
    }, []);

    // Generate forest positions
    const { initialPositions, scales } = useMemo(() => {
        const layout = generateSceneryLayout(laneCount);
        const positions = generateForestPositions(layout, FOREST_TREE_COUNT, laneCount);

        const pos = new Float32Array(FOREST_TREE_COUNT * 3);
        const scl = new Float32Array(FOREST_TREE_COUNT);

        for (let i = 0; i < FOREST_TREE_COUNT; i++) {
            if (i < positions.length) {
                pos[i * 3] = positions[i].x;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = positions[i].z;
            } else {
                pos[i * 3] = 1000;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = -2000;
            }
            // Scale for distant silhouettes (reduced by 25%)
            scl[i] = 1.9 + Math.random() * 2.25;
        }

        return { initialPositions: pos, scales: scl };
    }, [laneCount]);

    // Initialize forest positions on mount (before first frame)
    useEffect(() => {
        if (!silhouetteMeshRef.current) return;

        for (let i = 0; i < FOREST_TREE_COUNT; i++) {
            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const scale = scales[i];

            dummy.position.set(x, y + scale * 7, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            silhouetteMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        silhouetteMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [initialPositions, scales, dummy]);

    useFrame((state, delta) => {
        if (!silhouetteMeshRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const activeSpeed = speed > 0 ? speed : 2;

        for (let i = 0; i < FOREST_TREE_COUNT; i++) {
            initialPositions[i * 3 + 2] += activeSpeed * delta;

            if (initialPositions[i * 3 + 2] > SCENERY_LIMIT_Z) {
                initialPositions[i * 3 + 2] -= LOOP_LENGTH;
            }

            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const scale = scales[i];

            dummy.position.set(x, y + scale * 7, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            silhouetteMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        silhouetteMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group key={`forest-${laneCount}`}>
            {/* Dark silhouettes - blend with fog for depth effect */}
            <instancedMesh ref={silhouetteMeshRef} args={[silhouetteGeo, undefined, FOREST_TREE_COUNT]}>
                <meshBasicMaterial color="#1a3a2a" transparent opacity={0.6} fog={true} />
            </instancedMesh>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WheatField - Instanced wheat stalks for windmill sections
 * Optimized: No wind animation, simplified geometry
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
import { generateSceneryLayout, generateWheatPositions } from './SceneryLayoutManager';

const WHEAT_COUNT = 1200; // Optimized count

export const WheatField: React.FC = () => {
    const { speed, status, laneCount } = useStore();

    const wheatMeshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Combined wheat geometry (stalk + head in one)
    const wheatGeo = useMemo(() => {
        const geo = new THREE.CylinderGeometry(0.03, 0.05, 1.0, 4);
        return geo;
    }, []);

    // Generate layout and wheat positions
    const { initialPositions, randomScales, randomRotations } = useMemo(() => {
        const layout = generateSceneryLayout(laneCount);
        const positions = generateWheatPositions(layout, WHEAT_COUNT, laneCount);

        const pos = new Float32Array(WHEAT_COUNT * 3);
        const scales = new Float32Array(WHEAT_COUNT);
        const rots = new Float32Array(WHEAT_COUNT);

        for (let i = 0; i < WHEAT_COUNT; i++) {
            if (i < positions.length) {
                pos[i * 3] = positions[i].x;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = positions[i].z;
            } else {
                pos[i * 3] = 1000;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = -2000;
            }
            scales[i] = 0.7 + Math.random() * 0.5;
            rots[i] = Math.random() * Math.PI * 2;
        }

        return { initialPositions: pos, randomScales: scales, randomRotations: rots };
    }, [laneCount]);

    // Initialize wheat positions on mount (before first frame)
    useEffect(() => {
        if (!wheatMeshRef.current) return;

        for (let i = 0; i < WHEAT_COUNT; i++) {
            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const scale = randomScales[i];
            const rotY = randomRotations[i];

            dummy.position.set(x, y + scale * 0.5, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            wheatMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        wheatMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [initialPositions, randomScales, randomRotations, dummy]);

    useFrame((state, delta) => {
        if (!wheatMeshRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const activeSpeed = speed > 0 ? speed : 2;

        for (let i = 0; i < WHEAT_COUNT; i++) {
            initialPositions[i * 3 + 2] += activeSpeed * delta;

            if (initialPositions[i * 3 + 2] > SCENERY_LIMIT_Z) {
                initialPositions[i * 3 + 2] -= LOOP_LENGTH;
            }

            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const scale = randomScales[i];
            const rotY = randomRotations[i];

            // No wind - static position
            dummy.position.set(x, y + scale * 0.5, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            wheatMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        wheatMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group key={`wheat-field-${laneCount}`}>
            <instancedMesh ref={wheatMeshRef} args={[wheatGeo, undefined, WHEAT_COUNT]}>
                <meshStandardMaterial color="#d4a017" roughness={0.9} />
            </instancedMesh>
        </group>
    );
};

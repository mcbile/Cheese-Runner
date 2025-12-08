/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bush - Instanced bushes/shrubs for pasture sections
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';
import {
    SCENERY_LIMIT_Z,
    SCENERY_RESET_Z,
    LOOP_LENGTH
} from './constants';
import { generateSceneryLayout, generatePasturePositions } from './SceneryLayoutManager';

const BUSH_COUNT = 200; // Reduced from 800 for performance

export const Bush: React.FC = () => {
    const { speed, status, laneCount } = useStore();

    const bushMeshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate layout and bush positions
    const { initialPositions, randomScales, randomRotations, colors } = useMemo(() => {
        const layout = generateSceneryLayout(laneCount);
        const positions = generatePasturePositions(layout, BUSH_COUNT, laneCount, 33333);

        const pos = new Float32Array(BUSH_COUNT * 3);
        const scales = new Float32Array(BUSH_COUNT);
        const rots = new Float32Array(BUSH_COUNT);
        const col = new Float32Array(BUSH_COUNT * 3);

        const bushColors = [
            new THREE.Color('#2d5a27'),
            new THREE.Color('#3d6b37'),
            new THREE.Color('#4a7c43'),
            new THREE.Color('#355e2e')
        ];

        for (let i = 0; i < BUSH_COUNT; i++) {
            if (i < positions.length) {
                pos[i * 3] = positions[i].x;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = positions[i].z;
            } else {
                pos[i * 3] = 1000;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = -2000;
            }
            scales[i] = 0.5 + Math.random() * 0.8;
            rots[i] = Math.random() * Math.PI * 2;

            const color = bushColors[Math.floor(Math.random() * bushColors.length)];
            col[i * 3] = color.r;
            col[i * 3 + 1] = color.g;
            col[i * 3 + 2] = color.b;
        }

        return { initialPositions: pos, randomScales: scales, randomRotations: rots, colors: col };
    }, [laneCount]);

    // Bush geometry (cluster of spheres merged into one shape)
    const bushGeo = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(0.5, 1);
        // Squash it a bit to make it more bush-like
        const positions = geo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            positions.setY(i, y * 0.6);
        }
        geo.computeVertexNormals();
        return geo;
    }, []);

    // Initialize bush positions on mount (before first frame)
    useEffect(() => {
        if (!bushMeshRef.current) return;

        for (let i = 0; i < BUSH_COUNT; i++) {
            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const scale = randomScales[i];
            const rotY = randomRotations[i];

            dummy.position.set(x, y + scale * 0.25, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            bushMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        bushMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [initialPositions, randomScales, randomRotations, dummy]);

    useFrame((state, delta) => {
        if (!bushMeshRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const activeSpeed = speed > 0 ? speed : 2;

        for (let i = 0; i < BUSH_COUNT; i++) {
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
            dummy.position.set(x, y + scale * 0.25, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            bushMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        bushMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group key={`bushes-${laneCount}`}>
            <instancedMesh ref={bushMeshRef} args={[bushGeo, undefined, BUSH_COUNT]}>
                <meshStandardMaterial roughness={0.9} vertexColors={false} color="#3d6b37" />
            </instancedMesh>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Grass - Simple instanced grass blades for filling empty spaces
 * Uses flat planes for minimal performance impact (~1600 triangles total)
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { LANE_WIDTH, GameStatus, CAMERA_BASE_Z, CAMERA_DIST_FACTOR_DESKTOP } from '../../../types';
import {
    SCENERY_LIMIT_Z,
    SCENERY_RESET_Z,
    LOOP_LENGTH,
    MOBILE_SCREEN_WIDTH_THRESHOLD,
    MOBILE_VISIBILITY_FACTOR
} from './constants';

const GRASS_COUNT = 600;

export const Grass: React.FC = () => {
    const { speed, status, laneCount } = useStore();
    const { size } = useThree();

    const grassMeshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Simple grass blade geometry - single plane
    const grassGeo = useMemo(() => {
        const geo = new THREE.PlaneGeometry(0.15, 0.6);
        // Move pivot to bottom
        geo.translate(0, 0.3, 0);
        return geo;
    }, []);

    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;

    // Generate grass positions
    const { initialPositions, randomScales, randomRotations } = useMemo(() => {
        const pos = new Float32Array(GRASS_COUNT * 3);
        const scales = new Float32Array(GRASS_COUNT);
        const rots = new Float32Array(GRASS_COUNT);

        // Spread across both sides, avoiding road
        const xMin = roadHalfWidth + 5;
        const xMax = roadHalfWidth + 35;

        for (let i = 0; i < GRASS_COUNT; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            pos[i * 3] = side * (xMin + Math.random() * (xMax - xMin));
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = SCENERY_RESET_Z + Math.random() * LOOP_LENGTH;

            scales[i] = 0.6 + Math.random() * 0.8;
            rots[i] = Math.random() * Math.PI; // Random Y rotation
        }

        return { initialPositions: pos, randomScales: scales, randomRotations: rots };
    }, [roadHalfWidth]);

    // Initialize grass positions on mount (before first frame)
    useEffect(() => {
        if (!grassMeshRef.current) return;

        for (let i = 0; i < GRASS_COUNT; i++) {
            const x = initialPositions[i * 3];
            const y = initialPositions[i * 3 + 1];
            const z = initialPositions[i * 3 + 2];
            const scale = randomScales[i];
            const rotY = randomRotations[i];

            dummy.position.set(x, y, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            grassMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        grassMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [initialPositions, randomScales, randomRotations, dummy]);

    useFrame((state, delta) => {
        if (!grassMeshRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const activeSpeed = speed > 0 ? speed : 2;

        // Mobile frustum culling optimization
        const isNarrowScreen = size.width < MOBILE_SCREEN_WIDTH_THRESHOLD && size.width > size.height;
        const extraLanes = Math.max(0, laneCount - 3);
        const cameraZ = CAMERA_BASE_Z + (extraLanes * CAMERA_DIST_FACTOR_DESKTOP);

        for (let i = 0; i < GRASS_COUNT; i++) {
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
                    grassMeshRef.current.setMatrixAt(i, dummy.matrix);
                    continue;
                }
            }

            const scale = randomScales[i];
            const rotY = randomRotations[i];

            dummy.position.set(x, y, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            grassMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        grassMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group key={`grass-${laneCount}`}>
            <instancedMesh ref={grassMeshRef} args={[grassGeo, undefined, GRASS_COUNT]}>
                <meshBasicMaterial color="#4a7c43" side={THREE.DoubleSide} />
            </instancedMesh>
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Guardrail - Road barrier/guardrail using instanced mesh
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { LANE_WIDTH, GameStatus } from '../../../types';
import {
    SCENERY_LIMIT_Z,
    SCENERY_RESET_Z,
    LOOP_LENGTH
} from './constants';

const SEGMENT_LENGTH = 8;
const GUARDRAIL_HEIGHT = 0.8;
const GUARDRAIL_OFFSET = 3; // Distance from road edge

export const Guardrail: React.FC = () => {
    const { speed, status, laneCount } = useStore();
    const leftMeshRef = useRef<THREE.InstancedMesh>(null);
    const rightMeshRef = useRef<THREE.InstancedMesh>(null);
    const postLeftRef = useRef<THREE.InstancedMesh>(null);
    const postRightRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;
    const guardrailX = roadHalfWidth + GUARDRAIL_OFFSET;

    // Calculate segment count
    const segmentCount = Math.ceil(LOOP_LENGTH / SEGMENT_LENGTH) + 2;

    // Generate initial Z positions
    const initialPositions = useMemo(() => {
        const positions: number[] = [];
        for (let i = 0; i < segmentCount; i++) {
            positions.push(SCENERY_LIMIT_Z - i * SEGMENT_LENGTH);
        }
        return new Float32Array(positions);
    }, [segmentCount]);

    // Guardrail beam geometry (long horizontal bar)
    const beamGeo = useMemo(() => {
        return new THREE.BoxGeometry(0.15, 0.25, SEGMENT_LENGTH);
    }, []);

    // Post geometry
    const postGeo = useMemo(() => {
        return new THREE.CylinderGeometry(0.08, 0.08, GUARDRAIL_HEIGHT, 6);
    }, []);

    // Initialize guardrail positions on mount (before first frame)
    useEffect(() => {
        if (!leftMeshRef.current || !rightMeshRef.current) return;
        if (!postLeftRef.current || !postRightRef.current) return;

        for (let i = 0; i < segmentCount; i++) {
            const z = initialPositions[i];

            // Left guardrail beam
            dummy.position.set(-guardrailX, GUARDRAIL_HEIGHT * 0.7, z);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            leftMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Right guardrail beam
            dummy.position.set(guardrailX, GUARDRAIL_HEIGHT * 0.7, z);
            dummy.updateMatrix();
            rightMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Left post
            dummy.position.set(-guardrailX, GUARDRAIL_HEIGHT / 2, z - SEGMENT_LENGTH / 2);
            dummy.updateMatrix();
            postLeftRef.current.setMatrixAt(i, dummy.matrix);

            // Right post
            dummy.position.set(guardrailX, GUARDRAIL_HEIGHT / 2, z - SEGMENT_LENGTH / 2);
            dummy.updateMatrix();
            postRightRef.current.setMatrixAt(i, dummy.matrix);
        }

        leftMeshRef.current.instanceMatrix.needsUpdate = true;
        rightMeshRef.current.instanceMatrix.needsUpdate = true;
        postLeftRef.current.instanceMatrix.needsUpdate = true;
        postRightRef.current.instanceMatrix.needsUpdate = true;
    }, [segmentCount, initialPositions, guardrailX, dummy]);

    useFrame((state, delta) => {
        if (!leftMeshRef.current || !rightMeshRef.current) return;
        if (!postLeftRef.current || !postRightRef.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const activeSpeed = speed > 0 ? speed : 2;

        for (let i = 0; i < segmentCount; i++) {
            // Update Z position
            initialPositions[i] += activeSpeed * delta;

            // Loop back
            if (initialPositions[i] > SCENERY_LIMIT_Z) {
                initialPositions[i] -= LOOP_LENGTH;
            }

            const z = initialPositions[i];

            // Left guardrail beam
            dummy.position.set(-guardrailX, GUARDRAIL_HEIGHT * 0.7, z);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            leftMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Right guardrail beam
            dummy.position.set(guardrailX, GUARDRAIL_HEIGHT * 0.7, z);
            dummy.updateMatrix();
            rightMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Left post
            dummy.position.set(-guardrailX, GUARDRAIL_HEIGHT / 2, z - SEGMENT_LENGTH / 2);
            dummy.updateMatrix();
            postLeftRef.current.setMatrixAt(i, dummy.matrix);

            // Right post
            dummy.position.set(guardrailX, GUARDRAIL_HEIGHT / 2, z - SEGMENT_LENGTH / 2);
            dummy.updateMatrix();
            postRightRef.current.setMatrixAt(i, dummy.matrix);
        }

        leftMeshRef.current.instanceMatrix.needsUpdate = true;
        rightMeshRef.current.instanceMatrix.needsUpdate = true;
        postLeftRef.current.instanceMatrix.needsUpdate = true;
        postRightRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group key={`guardrail-${laneCount}`}>
            {/* Left beam - no shadow */}
            <instancedMesh ref={leftMeshRef} args={[beamGeo, undefined, segmentCount]}>
                <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.4} />
            </instancedMesh>

            {/* Right beam - no shadow */}
            <instancedMesh ref={rightMeshRef} args={[beamGeo, undefined, segmentCount]}>
                <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.4} />
            </instancedMesh>

            {/* Left posts - no shadow */}
            <instancedMesh ref={postLeftRef} args={[postGeo, undefined, segmentCount]}>
                <meshStandardMaterial color="#808080" metalness={0.3} roughness={0.6} />
            </instancedMesh>

            {/* Right posts - no shadow */}
            <instancedMesh ref={postRightRef} args={[postGeo, undefined, segmentCount]}>
                <meshStandardMaterial color="#808080" metalness={0.3} roughness={0.6} />
            </instancedMesh>
        </group>
    );
};

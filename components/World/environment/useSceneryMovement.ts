/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hook for scenery movement (infinite scroll)
 */

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { GameStatus, CAMERA_BASE_Z, CAMERA_DIST_FACTOR_DESKTOP } from '../../../types';
import { SCENERY_LIMIT_Z, LOOP_LENGTH, MOBILE_SCREEN_WIDTH_THRESHOLD, MOBILE_VISIBILITY_FACTOR } from './constants';

export const useSceneryMovement = (initialZ: number, ref: React.RefObject<THREE.Group>) => {
    const { speed, status, laneCount } = useStore();
    const { size } = useThree();
    const zPos = useRef(initialZ);

    useFrame((state, delta) => {
        if (!ref.current) return;
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        const activeSpeed = speed > 0 ? speed : 2;
        zPos.current += activeSpeed * delta;

        if (zPos.current > SCENERY_LIMIT_Z) {
            zPos.current -= LOOP_LENGTH;
        }

        ref.current.position.z = zPos.current;

        // Mobile visibility optimization: hide objects not in view frustum
        // Only apply on narrow screens (< 450px in landscape orientation)
        const isNarrowScreen = size.width < MOBILE_SCREEN_WIDTH_THRESHOLD && size.width > size.height;
        if (isNarrowScreen) {
            const objX = Math.abs(ref.current.position.x);
            const extraLanes = Math.max(0, laneCount - 3);
            const cameraZ = CAMERA_BASE_Z + (extraLanes * CAMERA_DIST_FACTOR_DESKTOP);
            // Object becomes visible when Z < cameraZ - (X / MOBILE_VISIBILITY_FACTOR)
            const visibilityZ = cameraZ - (objX / MOBILE_VISIBILITY_FACTOR);
            ref.current.visible = zPos.current < visibilityZ;
        } else {
            ref.current.visible = true;
        }
    });
};

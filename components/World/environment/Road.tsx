/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Road - Road surface with animated lane markings
 * Uses shader-based UV animation for optimal performance
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { LANE_WIDTH, getLaneBounds, GameStatus } from '../../../types';

// Shared stripe texture - created once and used by all lane stripes
let sharedStripeTexture: THREE.DataTexture | null = null;

const getSharedStripeTexture = (): THREE.DataTexture => {
    if (sharedStripeTexture) return sharedStripeTexture;

    const height = 64; // Texture height (stripe pattern repeats)
    const stripeLength = 12; // Length of white stripe (pixels) - shorter
    const gapLength = 20; // Gap between stripes (pixels) - shorter gap = more frequent
    const totalLength = stripeLength + gapLength;

    const data = new Uint8Array(height * 4);

    for (let i = 0; i < height; i++) {
        const idx = i * 4;
        // Create stripe pattern: white for stripeLength, transparent for gapLength
        if (i % totalLength < stripeLength) {
            data[idx] = 255;     // R
            data[idx + 1] = 255; // G
            data[idx + 2] = 255; // B
            data[idx + 3] = 200; // A (slightly transparent)
        } else {
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            data[idx + 3] = 0; // Fully transparent
        }
    }

    sharedStripeTexture = new THREE.DataTexture(data, 1, height, THREE.RGBAFormat);
    sharedStripeTexture.wrapS = THREE.RepeatWrapping;
    sharedStripeTexture.wrapT = THREE.RepeatWrapping;
    sharedStripeTexture.repeat.set(1, 15); // Repeat pattern along road - more repeats
    sharedStripeTexture.needsUpdate = true;

    return sharedStripeTexture;
};

// Lane stripe component - uses shared texture for synchronized animation
const LaneStripe: React.FC<{ x: number }> = ({ x }) => {
    // All stripes share the same texture instance
    const texture = useMemo(() => getSharedStripeTexture(), []);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, -50]}>
            <planeGeometry args={[0.15, 300]} />
            <meshBasicMaterial
                map={texture}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
};

// Component to animate the shared stripe texture
const StripeAnimator: React.FC = () => {
    const { status, speed, isDevMode } = useStore();

    useFrame((_, delta) => {
        // Skip animation if not playing or in dev mode
        if (status !== GameStatus.PLAYING || isDevMode) return;
        if (!sharedStripeTexture) return;

        // Animate UV offset based on speed (move texture up = stripes move away from player)
        const safeDelta = Math.min(delta, 0.05);
        sharedStripeTexture.offset.y += speed * safeDelta * 0.02;
    });

    return null;
};

// Boss attack lane warning overlay - flashing red highlight
const BossAttackWarning: React.FC = () => {
    const { isBossActive, bossChargePhase, bossChargeLane, bossChargeWidth, laneCount } = useStore();
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    // Flashing animation
    useFrame((state) => {
        if (!materialRef.current) return;

        // Show warning during phase 1 (retreat) and phase 2 (charge)
        const showWarning = isBossActive && (bossChargePhase === 1 || bossChargePhase === 2);

        if (showWarning) {
            // Fast flashing effect (4 Hz)
            const flash = Math.sin(state.clock.elapsedTime * 25) * 0.5 + 0.5;
            materialRef.current.opacity = 0.15 + flash * 0.25;
            materialRef.current.visible = true;
        } else {
            materialRef.current.visible = false;
        }
    });

    // Don't render if boss not active
    if (!isBossActive) return null;

    // chargeLane = CENTER of attack zone (consistent across all widths)
    // Width 1: integer lane, Width 2: half lane (0.5, 1.5...), Width 3: integer lane
    // Position is simply chargeLane * LANE_WIDTH for all cases
    const warningWidth = bossChargeWidth * LANE_WIDTH;
    const warningCenterX = bossChargeLane * LANE_WIDTH;

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[warningCenterX, 0.03, -50]}
        >
            <planeGeometry args={[warningWidth, 300]} />
            <meshBasicMaterial
                ref={materialRef}
                color="#FF0000"
                transparent
                opacity={0.15}
                depthWrite={false}
                visible={false}
            />
        </mesh>
    );
};

export const Road: React.FC = () => {
    const { laneCount } = useStore();
    const { min: minLane, max: maxLane } = getLaneBounds(laneCount);
    const roadCenterX = (minLane + maxLane) * LANE_WIDTH / 2;

    // Calculate lane divider positions
    const markerPositions = useMemo(() => {
        const lines: number[] = [];
        for (let i = minLane; i < maxLane; i++) {
            lines.push((i + 0.5) * LANE_WIDTH);
        }
        return lines;
    }, [minLane, maxLane]);

    return (
        <group position={[0, 0.01, 0]}>
            {/* Stripe animation controller - animates shared texture */}
            <StripeAnimator />

            {/* Road surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roadCenterX, 0, -50]} receiveShadow>
                <planeGeometry args={[(maxLane - minLane + 1) * LANE_WIDTH + 2, 300]} />
                <meshStandardMaterial color="#374151" roughness={0.9} />
            </mesh>

            {/* Boss attack warning - flashing red lanes */}
            <BossAttackWarning />

            {/* Animated lane stripes */}
            {markerPositions.map((x, i) => (
                <LaneStripe key={i} x={x} />
            ))}
        </group>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Greenhouse - Glass greenhouse scenery object
 * Half-length version with simplified solid roof
 */

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useSceneryMovement } from './useSceneryMovement';

interface GreenhouseProps {
    initialZ: number;
    x: number;
}

export const Greenhouse: React.FC<GreenhouseProps> = ({ initialZ, x }) => {
    const groupRef = useRef<THREE.Group>(null);
    useSceneryMovement(initialZ, groupRef);

    // Reusable Materials
    const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.8 }), []);
    const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#E0F7FA',
        transmission: 0.2,
        opacity: 0.3,
        transparent: true,
        roughness: 0,
        metalness: 0.1
    }), []);
    const foundationMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78909C' }), []);
    const dirtMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3E2723' }), []);
    const plantMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2E7D32' }), []);
    const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#546E7A', roughness: 0.6 }), []);

    // Frame Geometries - half length (10.5 instead of 21)
    const pillarGeo = useMemo(() => new THREE.BoxGeometry(0.2, 4, 0.2), []);
    const longBeamGeo = useMemo(() => new THREE.BoxGeometry(0.2, 0.2, 10.6), []);

    // Glass Geometries - half length
    const sideGlassGeo = useMemo(() => new THREE.BoxGeometry(0.05, 3.5, 10.5), []);
    const endGlassGeo = useMemo(() => new THREE.BoxGeometry(6, 3.5, 0.05), []);

    return (
        <group ref={groupRef} position={[x, 0, initialZ]}>
            {/* Foundation - half length */}
            <mesh position={[0, 0.2, 0]} material={foundationMat}>
                <boxGeometry args={[7, 0.4, 10.5]} />
            </mesh>

            {/* Interior Plants - half length */}
            <group position={[0, 0.5, 0]}>
                <mesh position={[-2, 0.3, 0]} material={dirtMat}>
                    <boxGeometry args={[1.5, 0.6, 9]} />
                </mesh>
                <mesh position={[2, 0.3, 0]} material={dirtMat}>
                    <boxGeometry args={[1.5, 0.6, 9]} />
                </mesh>

                {[...Array(5)].map((_, i) => (
                    <group key={i}>
                        <mesh position={[-2, 0.8, (i * 2) - 4]} material={plantMat}>
                            <dodecahedronGeometry args={[0.5]} />
                        </mesh>
                        <mesh position={[2, 0.8, (i * 2) - 4]} material={plantMat}>
                            <dodecahedronGeometry args={[0.5]} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Structure - reduced pillars (4 instead of 7 rows) */}
            <group>
                {[-5.25, -1.75, 1.75, 5.25].map(z => (
                    <group key={z} position={[0, 0, z]}>
                        <mesh position={[-3, 2, 0]} geometry={pillarGeo} material={frameMat} />
                        <mesh position={[3, 2, 0]} geometry={pillarGeo} material={frameMat} />
                    </group>
                ))}

                <mesh position={[-3, 3.8, 0]} geometry={longBeamGeo} material={frameMat} />
                <mesh position={[3, 3.8, 0]} geometry={longBeamGeo} material={frameMat} />
                <mesh position={[0, 5.1, 0]} geometry={longBeamGeo} material={frameMat} />
            </group>

            {/* Glass Panels - side walls */}
            <group>
                <mesh position={[-3, 2, 0]} geometry={sideGlassGeo} material={glassMat} />
                <mesh position={[3, 2, 0]} geometry={sideGlassGeo} material={glassMat} />
                <mesh position={[0, 2, 5.25]} geometry={endGlassGeo} material={glassMat} />
                <mesh position={[0, 2, -5.25]} geometry={endGlassGeo} material={glassMat} />
            </group>

            {/* Simplified Solid Roof - pitched design */}
            <mesh position={[-1.6, 4.5, 0]} rotation={[0, 0, -Math.PI / 8]} material={roofMat}>
                <boxGeometry args={[3.5, 0.15, 10.6]} />
            </mesh>
            <mesh position={[1.6, 4.5, 0]} rotation={[0, 0, Math.PI / 8]} material={roofMat}>
                <boxGeometry args={[3.5, 0.15, 10.6]} />
            </mesh>
        </group>
    );
};

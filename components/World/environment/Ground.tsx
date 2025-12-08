/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Ground - Green grass plane
 */

import React from 'react';

export const Ground: React.FC = () => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -100]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#4ade80" />
        </mesh>
    );
};

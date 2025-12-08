/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Environment - Main environment component
 * Refactored to use modular subcomponents for better maintainability
 */

import React from 'react';
import { useThree } from '@react-three/fiber';
import { Ground } from './environment/Ground';
import { Road } from './environment/Road';
import { TulipField } from './environment/TulipField';
import { Countryside } from './environment/Countryside';
import { Guardrail } from './environment/Guardrail';
import { Trees } from './environment/Tree';
import { Grass } from './environment/Grass';
import { Forest } from './environment/Forest';
import { MOBILE_SCREEN_WIDTH_THRESHOLD } from './environment/constants';

export const Environment: React.FC = () => {
    const { size } = useThree();
    // Show forest only on wider screens (>= 450px or portrait orientation)
    const isNarrowLandscape = size.width < MOBILE_SCREEN_WIDTH_THRESHOLD && size.width > size.height;

    return (
        <>
            <color attach="background" args={['#87CEEB']} />
            <fog attach="fog" args={['#87CEEB', 30, 120]} />
            <ambientLight intensity={0.6} color="#ffffff" />
            <directionalLight
                position={[50, 100, 50]}
                intensity={1.5}
                color="#fff7ed"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />
            <Ground />
            <Road />
            {/* Row 0: Guardrail */}
            <Guardrail />
            {/* Row 1-3: Fields */}
            <TulipField />
            <Grass />
            <Trees />
            {/* Row 2-3: Buildings and Cows */}
            <Countryside />
            {/* Row 4: Forest - hidden on narrow landscape screens (<450px) */}
            {!isNarrowLandscape && <Forest />}
        </>
    );
};

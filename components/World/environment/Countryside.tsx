/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Countryside - Manager for all scenery objects using centralized layout
 */

import React, { useMemo } from 'react';
import { useStore } from '../../../store';
import { Cow } from './Cow';
import { Windmill } from './Windmill';
import { Greenhouse } from './Greenhouse';
import { generateSceneryLayout } from './SceneryLayoutManager';

export const Countryside: React.FC = () => {
    const { laneCount } = useStore();

    // Generate layout once based on lane count
    const layout = useMemo(() => generateSceneryLayout(laneCount), [laneCount]);

    return (
        <group>
            {/* Cows */}
            {layout.cows.map((cow, i) => (
                <Cow
                    key={`cow-${i}`}
                    x={cow.x}
                    initialZ={cow.z}
                    rotationY={cow.rotationY}
                    variant={cow.variant}
                />
            ))}

            {/* Windmills */}
            {layout.buildings
                .filter(b => b.type === 'windmill')
                .map((building, i) => (
                    <Windmill
                        key={`windmill-${i}`}
                        x={building.x}
                        initialZ={building.z}
                    />
                ))}

            {/* Greenhouses - one per slot */}
            {layout.buildings
                .filter(b => b.type === 'greenhouse')
                .map((building, i) => (
                    <Greenhouse
                        key={`greenhouse-${i}`}
                        x={building.x}
                        initialZ={building.z}
                    />
                ))}
        </group>
    );
};

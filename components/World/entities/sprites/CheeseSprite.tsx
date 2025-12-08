/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { getCheeseTexture, getCheeseFlippedTexture } from './textures';

export const CheeseSprite: React.FC = React.memo(() => {
    const texture = useMemo(() => getCheeseTexture(), []);
    return (
        <sprite scale={[1.8, 1.8, 1]}>
            <spriteMaterial map={texture} transparent toneMapped={false} />
        </sprite>
    );
});

export const CheeseFlippedSprite: React.FC = React.memo(() => {
    const texture = useMemo(() => getCheeseFlippedTexture(), []);
    return (
        <sprite scale={[1.8, 1.8, 1]}>
            <spriteMaterial map={texture} transparent toneMapped={false} />
        </sprite>
    );
});

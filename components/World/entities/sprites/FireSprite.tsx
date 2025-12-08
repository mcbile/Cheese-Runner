/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { getFireTexture } from './textures';

export const FireSprite: React.FC = React.memo(() => {
    const texture = useMemo(() => getFireTexture(), []);
    return (
        <sprite scale={[2.5, 2.5, 1]}>
            <spriteMaterial map={texture} transparent toneMapped={false} />
        </sprite>
    );
});

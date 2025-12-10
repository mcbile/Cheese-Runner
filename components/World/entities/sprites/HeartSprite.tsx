/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { getHeartTexture } from './textures';

export const HeartSprite: React.FC = React.memo(() => {
    const texture = useMemo(() => getHeartTexture(), []);
    return (
        <sprite scale={[2.5, 2.5, 1]}>
            <spriteMaterial map={texture} transparent toneMapped={false} />
        </sprite>
    );
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { getLightningTexture } from './textures';

export const LightningSprite: React.FC = React.memo(() => {
    const texture = useMemo(() => getLightningTexture(), []);
    return (
        <sprite scale={[2.5, 2.5, 1]}>
            <spriteMaterial map={texture} transparent toneMapped={false} />
        </sprite>
    );
});

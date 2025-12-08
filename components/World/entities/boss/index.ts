/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Boss entity module exports
 */

export { BossEntity } from './BossEntity';
export { BossModel } from './BossModel';
export { COLORS, MATERIAL_SETTINGS } from './bossMaterials';
export {
    useBossAnimationRefs,
    applyDeathAnimation,
    applyRunningAnimation,
    applyIdleAnimation,
    applyHitEffect
} from './useBossAnimation';
export type { BossAnimationRefs } from './useBossAnimation';

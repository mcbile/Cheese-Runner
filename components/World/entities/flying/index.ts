/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Flying entity module exports
 */

export { FlyingEntity, EagleEntity } from './FlyingEntity';
export { FlyingModel } from './FlyingModel';
export { COLORS, MATERIAL_SETTINGS } from './flyingMaterials';
export {
    useFlyingAnimationRefs,
    applyFlyingAnimation,
    applyWingAnimation,
    applyFeetAnimation,
    applyBodyOrientation
} from './useFlyingAnimation';
export type { FlyingAnimationRefs } from './useFlyingAnimation';

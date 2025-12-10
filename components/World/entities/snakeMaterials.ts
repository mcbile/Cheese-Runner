/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Snake Materials - Color constants for the cobra enemy
 */

import { COMMON_COLORS, COMMON_SETTINGS } from '../materials/commonColors';

export const COLORS = {
    // Body colors - green palette
    BODY_GREEN: '#2D5016',
    BODY_DARK: '#1E3A0F',
    BODY_DARKER: '#1A3510',
    BODY_LIGHT: '#3D6B1E',

    // Hood colors
    HOOD_GREEN: '#3D6B1E',
    HOOD_INNER: '#5A8F32',
    HOOD_EDGE: '#1E3A0F',

    // Head colors
    HEAD_GREEN: '#4A7D26',
    HEAD_DARK: '#3D6B1E',

    // Belly
    BELLY_LIGHT: '#8FBC5A',

    // Scale pattern
    SCALE_DARK: '#1A3A0A',
    SCALE_SIDE: '#1E4A0F',

    // Eyes - using common yellow
    EYE_YELLOW: COMMON_COLORS.EYE_YELLOW,
    EYE_RING: '#2D5016',

    // Markings (spectacle pattern)
    MARKING_BLACK: COMMON_COLORS.BLACK,
    MARKING_GOLD: COMMON_COLORS.EYE_YELLOW,

    // Nostrils and pupils
    NOSTRIL: COMMON_COLORS.BLACK,
    PUPIL: COMMON_COLORS.PUPIL,

    // Tongue
    TONGUE_RED: '#FF1744',

    // Shadow
    SHADOW: COMMON_COLORS.SHADOW,
} as const;

export const MATERIAL_SETTINGS = {
    // Body roughness
    BODY_ROUGHNESS: 0.7,
    BODY_METALNESS: 0.1,

    // Neck and raised body
    NECK_ROUGHNESS: 0.6,
    NECK_METALNESS: 0.1,

    // Hood
    HOOD_ROUGHNESS: 0.5,
    HOOD_METALNESS: 0.15,

    // Head
    HEAD_ROUGHNESS: 0.5,
    HEAD_METALNESS: 0.1,
    HEAD_TOP_ROUGHNESS: 0.4,

    // Tongue
    TONGUE_ROUGHNESS: 0.3,

    // Scale pattern opacity
    SCALE_OPACITY: 0.5,
    SCALE_SIDE_OPACITY: 0.4,

    // Shadow
    SHADOW_OPACITY: COMMON_SETTINGS.SHADOW_OPACITY,
} as const;

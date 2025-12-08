/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Flying Entity Materials - Color constants for the owl
 */

import { COMMON_COLORS } from '../../materials/commonColors';

export const COLORS = {
    // Body colors
    BODY_BROWN: '#8B5A2B',
    DARK_BROWN: '#5D3A1A',
    LIGHT_BROWN: '#C4794E',
    TAN: '#B8784E',

    // Face
    CREAM: '#F5E6D3',
    FACE_INNER: '#FFF5E6',

    // Eyes
    EYE_ORANGE: '#E07020',
    EYE_RING: '#C05010',
    EYE_SOCKET: '#1A0A00',
    EYE_WHITE: '#FFFEF8',
    EYE_INNER: '#FF8030',
    PUPIL: COMMON_COLORS.PUPIL,
    PUPIL_INNER: '#000005',

    // Beak
    BEAK_ORANGE: '#D4742C',
    BEAK_BASE: '#C8845C',
    BEAK_RIDGE: '#E08040',
    BEAK_TIP: '#A05020',
    BEAK_HIGHLIGHT: '#F0B080',
    NOSTRIL: '#2A1A0A',

    // Feet
    FOOT: '#C9A86C',
    TALON: COMMON_COLORS.BLACK,

    // Shadow
    SHADOW: COMMON_COLORS.SHADOW,
} as const;

export const MATERIAL_SETTINGS = {
    FEATHER_ROUGHNESS: 0.9,
    BEAK_ROUGHNESS: 0.35,
    BEAK_METALNESS: 0.05,
    TALON_METALNESS: 0.4,
    TALON_ROUGHNESS: 0.3,
    EYE_GLOW_INTENSITY: 0.8,
    EYE_GLOW_DISTANCE: 1.5,
    MAIN_GLOW_INTENSITY: 1.5,
    MAIN_GLOW_DISTANCE: 3
} as const;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cat Materials - Color constants for the Halloween black cat
 */

import { COMMON_COLORS } from '../../materials/commonColors';

export const COLORS = {
    // Fur colors
    FUR_BLACK: '#080808',
    FUR_DARK: '#101010',
    FUR_HIGHLIGHT: '#1a1a1a',

    // Eyes
    EYE_ORANGE: '#FF9500',
    EYE_YELLOW: COMMON_COLORS.EYE_YELLOW,
    EYE_GLOW: '#FFAA00',

    // Mouth/Face
    MOUTH_RED: '#AA1100',
    MOUTH_DARK: '#550000',
    TONGUE_RED: '#DD3344',
    TONGUE_PINK: '#FF6677',
    INNER_EAR: '#2a1515',
    NOSE: '#1a0a0a',
    NOSE_HIGHLIGHT: '#2a1515',

    // Paws
    PAW_PADS: '#221515',
    PAW_PAD_PINK: '#3a2020',
    CLAW_WHITE: '#dddddd',

    // Teeth
    FANG_WHITE: COMMON_COLORS.WHITE,
    TEETH_WHITE: '#EEEEEE',

    // Whiskers
    WHISKER_DARK: '#222222',

    // Shadow
    SHADOW: COMMON_COLORS.SHADOW,
} as const;

export const MATERIAL_SETTINGS = {
    FUR_ROUGHNESS: 0.95,
    PAW_PAD_ROUGHNESS: 0.8,
    NOSE_ROUGHNESS: 0.3,
    NOSE_METALNESS: 0.1,
    CLAW_ROUGHNESS: 0.3,
    CLAW_METALNESS: 0.1,
    FANG_ROUGHNESS: 0.25,
    EYE_GLOW_INTENSITY: 2,
    EYE_GLOW_DISTANCE: 2.5
} as const;

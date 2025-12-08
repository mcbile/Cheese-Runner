/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Common Colors - Shared color constants used across multiple entities
 */

export const COMMON_COLORS = {
    // Universal colors
    SHADOW: '#000000',
    PUPIL: '#000000',
    BLACK: '#1A1A1A',
    WHITE: '#FFFFFF',

    // Eyes
    EYE_YELLOW: '#FFD700',

    // Metal
    METAL_SILVER: '#C0C0C0',
    METAL_DARK: '#A8A8A8',
} as const;

export const COMMON_SETTINGS = {
    // Shadow opacity
    SHADOW_OPACITY: 0.45,

    // Metal properties
    METAL_ROUGHNESS: 0.15,
    METAL_METALNESS: 0.95,
} as const;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Environment constants and configuration
 */

// Scenery loop configuration
export const SCENERY_LIMIT_Z = 50;
export const SCENERY_RESET_Z = -1150;
export const LOOP_LENGTH = SCENERY_LIMIT_Z - SCENERY_RESET_Z; // 1200 units

// Spawn intervals (per side, left and right are async)
export const COW_INTERVAL = 40;
export const WINDMILL_INTERVAL = 200;
export const GREENHOUSE_INTERVAL = 240;

// Position offsets
export const UI_EDGE_OFFSET = 12;
export const COW_LINE_X = UI_EDGE_OFFSET + 8;    // 20
export const BUILDING_LINE_X = UI_EDGE_OFFSET + 12; // 24

// Windmill exclusion zone (2.5x windmill size ~10 = 25 units around each windmill)
export const WINDMILL_EXCLUSION_ZONE = 25;

// Conflict resolution
export const COW_BUILDING_MIN_DISTANCE = 15;

// Mobile visibility optimization (for screens < 450px in landscape)
// On narrow screens, decorations are only visible when they enter the frustum
// Formula: Z_visible = cameraZ - (X_from_center / (tan(30°) * aspect))
// For aspect ~1.5: Z_visible ≈ cameraZ - X_from_center / 0.866
export const MOBILE_SCREEN_WIDTH_THRESHOLD = 450;
export const MOBILE_VISIBILITY_FACTOR = 0.866; // tan(30°) * 1.5 aspect

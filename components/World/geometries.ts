/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared Three.js geometries for game objects.
 * Created once at module load and reused across components for performance.
 *
 * LOD System: Automatically detects mobile devices and creates lower-poly geometries
 * to improve performance on mobile platforms.
 */

import * as THREE from 'three';

// --- LOD DETECTION ---
// Detect mobile at module load time (before React mounts)
const detectMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    const aspect = window.innerWidth / window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    return (aspect < 1.2 && isTouchDevice) || isSmallScreen;
};

export const IS_MOBILE_LOD = detectMobile();

// LOD quality multipliers (mobile uses ~50% segments)
const LOD = {
    // Sphere/Cylinder segments
    HIGH: IS_MOBILE_LOD ? 8 : 16,       // 16 -> 8 on mobile
    MEDIUM: IS_MOBILE_LOD ? 6 : 12,     // 12 -> 6 on mobile
    LOW: IS_MOBILE_LOD ? 4 : 8,         // 8 -> 4 on mobile
    TINY: IS_MOBILE_LOD ? 3 : 6,        // 6 -> 3 on mobile
    // Torus segments
    TORUS_RADIAL: IS_MOBILE_LOD ? 4 : 8,
    TORUS_TUBULAR: IS_MOBILE_LOD ? 12 : 24,
    TORUS_SMALL_RADIAL: IS_MOBILE_LOD ? 4 : 6,
    TORUS_SMALL_TUBULAR: IS_MOBILE_LOD ? 8 : 12,
    // Circle segments
    CIRCLE_HIGH: IS_MOBILE_LOD ? 16 : 32,
    CIRCLE_LOW: IS_MOBILE_LOD ? 8 : 16,
};

// --- MOUSE PLAYER GEOMETRIES ---
export const MOUSE_HEAD_GEO = new THREE.SphereGeometry(0.35, LOD.HIGH, LOD.HIGH);
export const MOUSE_EAR_GEO = new THREE.CylinderGeometry(0.25, 0.25, 0.05, LOD.HIGH);
export const MOUSE_INNER_EAR_GEO = new THREE.CylinderGeometry(0.18, 0.18, 0.06, LOD.HIGH);
export const MOUSE_SNOUT_GEO = new THREE.SphereGeometry(0.15, LOD.HIGH, LOD.HIGH);
export const MOUSE_NOSE_GEO = new THREE.SphereGeometry(0.06, LOD.LOW, LOD.LOW);
export const MOUSE_BODY_GEO = new THREE.CapsuleGeometry(0.25, 0.5, 4, LOD.LOW);
export const MOUSE_BELLY_GEO = new THREE.SphereGeometry(0.2, LOD.MEDIUM, LOD.MEDIUM);
export const MOUSE_LIMB_GEO = new THREE.CapsuleGeometry(0.08, 0.4, 4, LOD.LOW);
export const MOUSE_TAIL_GEO = new THREE.CapsuleGeometry(0.03, 0.5, 4, LOD.MEDIUM);
export const MOUSE_WHISKER_GEO = new THREE.BoxGeometry(0.35, 0.01, 0.01);
export const MOUSE_JOINT_GEO = new THREE.SphereGeometry(0.12, LOD.LOW, LOD.LOW);
export const MOUSE_FINGER_GEO = new THREE.SphereGeometry(0.03, LOD.TINY, LOD.TINY);
export const MOUSE_TOOTH_GEO = new THREE.BoxGeometry(0.02, 0.04, 0.01);
export const MOUSE_EYE_HIGHLIGHT_GEO = new THREE.SphereGeometry(0.025, LOD.TINY, LOD.TINY);
export const PLAYER_SHADOW_GEO = new THREE.CircleGeometry(0.5, LOD.CIRCLE_HIGH);

// --- MOUSETRAP GEOMETRIES ---
// Wooden base: width 2, length 3, 20% thicker (0.30)
export const MOUSETRAP_BASE_GEO = new THREE.BoxGeometry(2.0, 0.30, 3.0);
export const MOUSETRAP_BASE_TOP_GEO = new THREE.BoxGeometry(1.8, 0.10, 2.8);
// Front curved edge
export const MOUSETRAP_FRONT_EDGE_GEO = new THREE.CylinderGeometry(0.12, 0.12, 2.2, LOD.HIGH);
// Side frame rails (metal arches) - 15% shorter (1.4 * 0.85 = 1.19)
export const MOUSETRAP_SIDE_RAIL_GEO = new THREE.TorusGeometry(1.19, 0.04, LOD.TORUS_RADIAL, LOD.TORUS_TUBULAR, Math.PI);
// Top cross bar
export const MOUSETRAP_TOP_BAR_GEO = new THREE.CylinderGeometry(0.04, 0.04, 1.6, LOD.LOW);
// Kill bar (the snapping mechanism)
export const MOUSETRAP_KILL_BAR_GEO = new THREE.TorusGeometry(0.9, 0.06, LOD.MEDIUM, LOD.TORUS_TUBULAR, Math.PI);
// Spring coils
export const MOUSETRAP_SPRING_GEO = new THREE.TorusGeometry(0.15, 0.025, LOD.TORUS_RADIAL, LOD.CIRCLE_LOW);
// Central trigger mechanism
export const MOUSETRAP_TRIGGER_PLATE_GEO = new THREE.BoxGeometry(0.6, 0.06, 0.8);
export const MOUSETRAP_TRIGGER_ARM_GEO = new THREE.BoxGeometry(0.08, 0.04, 1.2);
// Lock bar and hook
export const MOUSETRAP_LOCK_BAR_GEO = new THREE.BoxGeometry(0.05, 0.05, 1.6);
export const MOUSETRAP_HOOK_GEO = new THREE.TorusGeometry(0.08, 0.02, LOD.TORUS_SMALL_RADIAL, LOD.TORUS_SMALL_TUBULAR, Math.PI);
// Bait pedal
export const MOUSETRAP_PEDAL_GEO = new THREE.CylinderGeometry(0.25, 0.25, 0.04, LOD.HIGH);
// Cheese on pedal
export const MOUSETRAP_CHEESE_GEO = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 3);
// Metal staples/brackets holding mechanism
export const MOUSETRAP_STAPLE_GEO = new THREE.TorusGeometry(0.1, 0.02, LOD.TORUS_SMALL_RADIAL, LOD.TORUS_SMALL_TUBULAR, Math.PI);
// Rope/wire details
export const MOUSETRAP_WIRE_GEO = new THREE.CylinderGeometry(0.015, 0.015, 0.5, LOD.TINY);
// Wood plank lines (decorative)
export const MOUSETRAP_PLANK_LINE_GEO = new THREE.BoxGeometry(1.8, 0.02, 0.02);

// --- EAGLE GEOMETRIES ---
export const EAGLE_BODY_GEO = new THREE.ConeGeometry(0.3, 1.2, LOD.LOW);
export const EAGLE_WING_GEO = new THREE.BoxGeometry(1.5, 0.1, 0.5);
export const EAGLE_HEAD_GEO = new THREE.SphereGeometry(0.25, LOD.LOW, LOD.LOW);
export const EAGLE_BEAK_GEO = new THREE.ConeGeometry(0.1, 0.3, 4);

// --- PROJECTILE GEOMETRIES ---
export const PROJECTILE_GEO = new THREE.CylinderGeometry(0.075, 0.075, 1.0, LOD.TINY);

// --- CAT GEOMETRIES ---
export const CAT_BODY_GEO = new THREE.CapsuleGeometry(0.35, 1.0, 4, LOD.LOW);
export const CAT_HEAD_GEO = new THREE.SphereGeometry(0.4, LOD.HIGH, LOD.HIGH);
export const CAT_EAR_GEO = new THREE.ConeGeometry(0.15, 0.3, 4);
export const CAT_LEG_GEO = new THREE.CapsuleGeometry(0.1, 0.5, 4, LOD.LOW);
export const CAT_TAIL_GEO = new THREE.CylinderGeometry(0.05, 0.02, 0.8, LOD.LOW);
export const CAT_EYE_GEO = new THREE.SphereGeometry(0.1, LOD.LOW, LOD.LOW);
export const CAT_JAW_GEO = new THREE.CapsuleGeometry(0.25, 0.4, 4, LOD.LOW);
export const CAT_MOUTH_INTERIOR_GEO = new THREE.SphereGeometry(0.2, LOD.LOW, LOD.LOW);

// --- POWERUP GEOMETRIES ---
export const POWERUP_SHIELD_GEO = new THREE.IcosahedronGeometry(0.4, 0);
export const POWERUP_SPEED_GEO = new THREE.OctahedronGeometry(0.4, 0);

// --- SNAKE GEOMETRIES ---
export const SNAKE_BODY_GEO = new THREE.CapsuleGeometry(0.15, 0.6, 4, LOD.LOW);
export const SNAKE_HEAD_GEO = new THREE.SphereGeometry(0.2, LOD.MEDIUM, LOD.MEDIUM);
export const SNAKE_EYE_GEO = new THREE.SphereGeometry(0.05, LOD.LOW, LOD.LOW);
export const SNAKE_TONGUE_GEO = new THREE.BoxGeometry(0.02, 0.01, 0.2);
export const SNAKE_TONGUE_FORK_GEO = new THREE.BoxGeometry(0.015, 0.01, 0.08);

// --- CHEESE PLANE GEOMETRY (for low cheese lying flat) ---
export const CHEESE_PLANE_GEO = new THREE.PlaneGeometry(1.8, 1.8);

// --- SHADOW GEOMETRIES ---
export const SHADOW_LETTER_GEO = new THREE.PlaneGeometry(2, 0.6);
export const SHADOW_CHEESE_GEO = new THREE.CircleGeometry(0.6, LOD.CIRCLE_HIGH);
export const SHADOW_CAT_GEO = new THREE.CircleGeometry(0.6, LOD.CIRCLE_HIGH);
export const SHADOW_SNAKE_GEO = new THREE.CircleGeometry(0.5, LOD.CIRCLE_LOW);
export const SHADOW_EAGLE_GEO = new THREE.CircleGeometry(0.8, LOD.CIRCLE_LOW);
export const SHADOW_DEFAULT_GEO = new THREE.CircleGeometry(0.8, LOD.TINY);
export const SHADOW_TRAP_GEO = new THREE.PlaneGeometry(2.0, 2.8);

// --- BOSS (DOCTOR) GEOMETRIES ---
export const DOCTOR_BODY_GEO = new THREE.CylinderGeometry(0.45, 0.55, 0.55, LOD.HIGH);
export const DOCTOR_SHOULDER_GEO = new THREE.SphereGeometry(0.44, LOD.HIGH, LOD.HIGH);
export const DOCTOR_LEG_GEO = new THREE.CapsuleGeometry(0.1, 0.7, 4, LOD.LOW);
export const DOCTOR_HEAD_GEO = new THREE.SphereGeometry(0.48, LOD.HIGH, LOD.HIGH);
export const DOCTOR_NOSE_GEO = new THREE.CapsuleGeometry(0.14, 0.45, 4, LOD.LOW);
export const DOCTOR_HAIR_GEO = new THREE.ConeGeometry(0.15, 0.4, LOD.LOW);
export const DOCTOR_TOP_HAIR_GEO = new THREE.SphereGeometry(0.25, LOD.HIGH, LOD.HIGH);
export const DOCTOR_GLASSES_GEO = new THREE.TorusGeometry(0.16, 0.05, LOD.TORUS_RADIAL, LOD.CIRCLE_LOW);
export const DOCTOR_LENS_GEO = new THREE.CircleGeometry(0.15, LOD.CIRCLE_LOW);
export const DOCTOR_SWIRL_GEO = new THREE.TorusGeometry(0.08, 0.02, LOD.TORUS_RADIAL, LOD.CIRCLE_LOW);
export const DOCTOR_SHOE_GEO = new THREE.BoxGeometry(0.28, 0.2, 0.55);
export const DOCTOR_MOUTH_GEO = new THREE.CapsuleGeometry(0.04, 0.25, 4, LOD.LOW);
export const DOCTOR_TIE_GEO = new THREE.ConeGeometry(0.15, 0.6, 4);

// --- SYRINGE GEOMETRIES ---
export const SYRINGE_BARREL_GEO = new THREE.CylinderGeometry(0.12, 0.12, 0.8, LOD.HIGH);
export const SYRINGE_NEEDLE_GEO = new THREE.CylinderGeometry(0.015, 0.008, 0.5, LOD.LOW);
export const SYRINGE_NEEDLE_HUB_GEO = new THREE.CylinderGeometry(0.05, 0.03, 0.12, LOD.LOW);
export const SYRINGE_PLUNGER_GEO = new THREE.CylinderGeometry(0.08, 0.08, 0.3, LOD.LOW);
export const SYRINGE_PLUNGER_ROD_GEO = new THREE.CylinderGeometry(0.02, 0.02, 0.5, LOD.LOW);
export const SYRINGE_PLUNGER_TIP_GEO = new THREE.CylinderGeometry(0.095, 0.095, 0.05, LOD.HIGH);
// Fluid fills 50% of barrel (0.8 * 0.5 = 0.4), leaving 50% empty glass at top (near needle)
export const SYRINGE_FLUID_GEO = new THREE.CylinderGeometry(0.1, 0.1, 0.4, LOD.HIGH);
export const SYRINGE_FINGER_FLANGE_GEO = new THREE.CylinderGeometry(0.18, 0.18, 0.03, LOD.HIGH);
// Wings/ears at the back of the syringe barrel
export const SYRINGE_WING_GEO = new THREE.BoxGeometry(0.35, 0.02, 0.12);
export const SYRINGE_BARREL_RING_GEO = new THREE.TorusGeometry(0.12, 0.01, LOD.TORUS_RADIAL, LOD.CIRCLE_LOW);

// --- PARTICLE SYSTEM ---
// Reduced particle count on mobile for better performance
export const PARTICLE_COUNT = IS_MOBILE_LOD ? 300 : 600;

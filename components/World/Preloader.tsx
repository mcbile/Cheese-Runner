/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Preloader component - Preloads all geometries and materials for smooth gameplay
 */

import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ChevronLeft, Play, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import { getLaneCountForLevel } from '../../store/utils';

// Import all geometries to ensure they're compiled
import {
    MOUSE_HEAD_GEO, MOUSE_EAR_GEO, MOUSE_INNER_EAR_GEO, MOUSE_SNOUT_GEO,
    MOUSE_NOSE_GEO, MOUSE_BODY_GEO, MOUSE_BELLY_GEO, MOUSE_LIMB_GEO,
    MOUSE_TAIL_GEO, MOUSE_WHISKER_GEO, MOUSE_JOINT_GEO, MOUSE_FINGER_GEO,
    MOUSE_TOOTH_GEO, MOUSE_EYE_HIGHLIGHT_GEO, PLAYER_SHADOW_GEO,
    MOUSETRAP_BASE_GEO, MOUSETRAP_BASE_TOP_GEO, MOUSETRAP_FRONT_EDGE_GEO,
    MOUSETRAP_SIDE_RAIL_GEO, MOUSETRAP_TOP_BAR_GEO, MOUSETRAP_KILL_BAR_GEO,
    MOUSETRAP_SPRING_GEO, MOUSETRAP_TRIGGER_PLATE_GEO, MOUSETRAP_TRIGGER_ARM_GEO,
    MOUSETRAP_LOCK_BAR_GEO, MOUSETRAP_HOOK_GEO, MOUSETRAP_PEDAL_GEO,
    MOUSETRAP_CHEESE_GEO, MOUSETRAP_STAPLE_GEO, MOUSETRAP_WIRE_GEO,
    MOUSETRAP_PLANK_LINE_GEO,
    EAGLE_BODY_GEO, EAGLE_WING_GEO, EAGLE_HEAD_GEO, EAGLE_BEAK_GEO,
    PROJECTILE_GEO,
    CAT_BODY_GEO, CAT_HEAD_GEO, CAT_EAR_GEO, CAT_LEG_GEO, CAT_TAIL_GEO,
    CAT_EYE_GEO, CAT_JAW_GEO, CAT_MOUTH_INTERIOR_GEO,
    POWERUP_SHIELD_GEO, POWERUP_SPEED_GEO,
    SNAKE_BODY_GEO, SNAKE_HEAD_GEO, SNAKE_EYE_GEO, SNAKE_TONGUE_GEO,
    SNAKE_TONGUE_FORK_GEO,
    CHEESE_PLANE_GEO,
    SHADOW_LETTER_GEO, SHADOW_CHEESE_GEO, SHADOW_CAT_GEO, SHADOW_SNAKE_GEO,
    SHADOW_EAGLE_GEO, SHADOW_DEFAULT_GEO, SHADOW_TRAP_GEO,
    DOCTOR_BODY_GEO, DOCTOR_SHOULDER_GEO, DOCTOR_LEG_GEO, DOCTOR_HEAD_GEO,
    DOCTOR_NOSE_GEO, DOCTOR_HAIR_GEO, DOCTOR_TOP_HAIR_GEO, DOCTOR_GLASSES_GEO,
    DOCTOR_LENS_GEO, DOCTOR_SWIRL_GEO, DOCTOR_SHOE_GEO, DOCTOR_MOUTH_GEO,
    DOCTOR_TIE_GEO,
    SYRINGE_BARREL_GEO, SYRINGE_NEEDLE_GEO, SYRINGE_NEEDLE_HUB_GEO,
    SYRINGE_PLUNGER_GEO, SYRINGE_PLUNGER_ROD_GEO, SYRINGE_PLUNGER_TIP_GEO,
    SYRINGE_FLUID_GEO, SYRINGE_FINGER_FLANGE_GEO, SYRINGE_BARREL_RING_GEO
} from './geometries';

interface PreloaderProps {
    onLoaded: () => void;
}

// Scenery geometries (created at compile time)
const SCENERY_GEOMETRIES: THREE.BufferGeometry[] = [
    // Guardrail
    new THREE.BoxGeometry(0.15, 0.25, 8), // Beam
    new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6), // Post
    // Wheat
    new THREE.CylinderGeometry(0.02, 0.03, 0.9, 4), // Stalk
    new THREE.CylinderGeometry(0.05, 0.03, 0.25, 6), // Head
    // Bush
    new THREE.IcosahedronGeometry(0.5, 1),
    // Tree
    new THREE.CylinderGeometry(0.15, 0.25, 2.5, 8), // Trunk
    new THREE.IcosahedronGeometry(1.2, 2), // Foliage
    // Forest
    new THREE.CylinderGeometry(0.2, 0.35, 4, 6), // Trunk
    new THREE.ConeGeometry(1.8, 4, 8), // Foliage
    // Tulip
    new THREE.CylinderGeometry(0.025, 0.025, 0.65, 6), // Stem
];

// All geometries to precompile
const ALL_GEOMETRIES: THREE.BufferGeometry[] = [
    // Player
    MOUSE_HEAD_GEO, MOUSE_EAR_GEO, MOUSE_INNER_EAR_GEO, MOUSE_SNOUT_GEO,
    MOUSE_NOSE_GEO, MOUSE_BODY_GEO, MOUSE_BELLY_GEO, MOUSE_LIMB_GEO,
    MOUSE_TAIL_GEO, MOUSE_WHISKER_GEO, MOUSE_JOINT_GEO, MOUSE_FINGER_GEO,
    MOUSE_TOOTH_GEO, MOUSE_EYE_HIGHLIGHT_GEO, PLAYER_SHADOW_GEO,
    // Mousetrap
    MOUSETRAP_BASE_GEO, MOUSETRAP_BASE_TOP_GEO, MOUSETRAP_FRONT_EDGE_GEO,
    MOUSETRAP_SIDE_RAIL_GEO, MOUSETRAP_TOP_BAR_GEO, MOUSETRAP_KILL_BAR_GEO,
    MOUSETRAP_SPRING_GEO, MOUSETRAP_TRIGGER_PLATE_GEO, MOUSETRAP_TRIGGER_ARM_GEO,
    MOUSETRAP_LOCK_BAR_GEO, MOUSETRAP_HOOK_GEO, MOUSETRAP_PEDAL_GEO,
    MOUSETRAP_CHEESE_GEO, MOUSETRAP_STAPLE_GEO, MOUSETRAP_WIRE_GEO,
    MOUSETRAP_PLANK_LINE_GEO,
    // Eagle
    EAGLE_BODY_GEO, EAGLE_WING_GEO, EAGLE_HEAD_GEO, EAGLE_BEAK_GEO,
    // Projectile
    PROJECTILE_GEO,
    // Cat
    CAT_BODY_GEO, CAT_HEAD_GEO, CAT_EAR_GEO, CAT_LEG_GEO, CAT_TAIL_GEO,
    CAT_EYE_GEO, CAT_JAW_GEO, CAT_MOUTH_INTERIOR_GEO,
    // PowerUps
    POWERUP_SHIELD_GEO, POWERUP_SPEED_GEO,
    // Snake
    SNAKE_BODY_GEO, SNAKE_HEAD_GEO, SNAKE_EYE_GEO, SNAKE_TONGUE_GEO,
    SNAKE_TONGUE_FORK_GEO,
    // Cheese plane (for low cheese lying flat)
    CHEESE_PLANE_GEO,
    // Shadows
    SHADOW_LETTER_GEO, SHADOW_CHEESE_GEO, SHADOW_CAT_GEO, SHADOW_SNAKE_GEO,
    SHADOW_EAGLE_GEO, SHADOW_DEFAULT_GEO, SHADOW_TRAP_GEO,
    // Boss (Scientist)
    DOCTOR_BODY_GEO, DOCTOR_SHOULDER_GEO, DOCTOR_LEG_GEO, DOCTOR_HEAD_GEO,
    DOCTOR_NOSE_GEO, DOCTOR_HAIR_GEO, DOCTOR_TOP_HAIR_GEO, DOCTOR_GLASSES_GEO,
    DOCTOR_LENS_GEO, DOCTOR_SWIRL_GEO, DOCTOR_SHOE_GEO, DOCTOR_MOUTH_GEO,
    DOCTOR_TIE_GEO,
    // Syringe
    SYRINGE_BARREL_GEO, SYRINGE_NEEDLE_GEO, SYRINGE_NEEDLE_HUB_GEO,
    SYRINGE_PLUNGER_GEO, SYRINGE_PLUNGER_ROD_GEO, SYRINGE_PLUNGER_TIP_GEO,
    SYRINGE_FLUID_GEO, SYRINGE_FINGER_FLANGE_GEO, SYRINGE_BARREL_RING_GEO,
    // Scenery
    ...SCENERY_GEOMETRIES
];

// Common materials to precompile
const PRELOAD_MATERIALS: THREE.Material[] = [
    new THREE.MeshStandardMaterial({ color: '#FAFAFA' }), // Player fur
    new THREE.MeshStandardMaterial({ color: '#FFB3D9' }), // Player pink
    new THREE.MeshStandardMaterial({ color: '#C4883A' }), // Wood
    new THREE.MeshStandardMaterial({ color: '#C0C0C0', metalness: 0.95 }), // Metal
    new THREE.MeshStandardMaterial({ color: '#4A7C59' }), // Snake
    new THREE.MeshStandardMaterial({ color: '#FF6600' }), // Cat
    new THREE.MeshStandardMaterial({ color: '#8B4513' }), // Eagle
    new THREE.MeshStandardMaterial({ color: '#FFFFFF' }), // Boss coat
    new THREE.MeshStandardMaterial({ color: '#FFD700' }), // Cheese
    new THREE.MeshBasicMaterial({ color: '#00FF00' }), // Projectile
    // Scenery materials
    new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.6, roughness: 0.4 }), // Guardrail beam
    new THREE.MeshStandardMaterial({ color: '#808080', metalness: 0.3, roughness: 0.6 }), // Guardrail post
    new THREE.MeshStandardMaterial({ color: '#c4a000', roughness: 0.9 }), // Wheat stalk
    new THREE.MeshStandardMaterial({ color: '#daa520', roughness: 0.85 }), // Wheat head
    new THREE.MeshStandardMaterial({ color: '#3d6b37', roughness: 0.9 }), // Bush
    new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.9 }), // Tree trunk
    new THREE.MeshStandardMaterial({ color: '#2e7d32', roughness: 0.8 }), // Tree foliage
    new THREE.MeshStandardMaterial({ color: '#1b5e20', roughness: 0.85 }), // Forest foliage
    new THREE.MeshStandardMaterial({ color: '#4a3728', roughness: 0.95 }), // Forest trunk
    new THREE.MeshStandardMaterial({ color: '#2e7d32', roughness: 0.9 }), // Tulip stem
    new THREE.MeshStandardMaterial({ color: '#388e3c', roughness: 0.8 }), // Tulip leaf
    new THREE.MeshStandardMaterial({ color: '#FF0000', roughness: 0.7 }), // Tulip bloom red
    new THREE.MeshStandardMaterial({ color: '#FFFF00', roughness: 0.7 }), // Tulip bloom yellow
];

export const Preloader: React.FC<PreloaderProps> = ({ onLoaded }) => {
    const { gl } = useThree();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const total = ALL_GEOMETRIES.length + PRELOAD_MATERIALS.length;
        let loaded = 0;

        // Compile geometries
        const compileGeometries = () => {
            const dummyMaterial = new THREE.MeshBasicMaterial();

            ALL_GEOMETRIES.forEach((geometry, index) => {
                // Create a temporary mesh to force GPU compilation
                const mesh = new THREE.Mesh(geometry, dummyMaterial);
                gl.compile(mesh, new THREE.Scene().add(mesh));
                loaded++;
                setProgress(Math.round((loaded / total) * 100));
            });

            dummyMaterial.dispose();
        };

        // Compile materials
        const compileMaterials = () => {
            const dummyGeometry = new THREE.BoxGeometry(1, 1, 1);
            const scene = new THREE.Scene();

            PRELOAD_MATERIALS.forEach((material) => {
                const mesh = new THREE.Mesh(dummyGeometry, material);
                scene.add(mesh);
                gl.compile(mesh, scene);
                loaded++;
                setProgress(Math.round((loaded / total) * 100));
                scene.remove(mesh);
            });

            dummyGeometry.dispose();
        };

        // Run compilation in next frame to not block initial render
        const timeoutId = setTimeout(() => {
            try {
                compileGeometries();
                compileMaterials();

                // Small delay to ensure everything is ready
                setTimeout(() => {
                    onLoaded();
                }, 100);
            } catch (error) {
                console.error('[Preloader] Error during compilation:', error);
                onLoaded(); // Continue anyway
            }
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [gl, onLoaded]);

    return null; // Invisible component, just compiles assets
};

// Level 1 Preloader Screen - single window with mission + controls info
// Shows START button after countdown complete (3 seconds is enough for asset compilation)
export const Level1PreloadScreen: React.FC<{ visible: boolean; ready: boolean; countdown: number; onStart: () => void }> = ({ visible, ready, countdown, onStart }) => {
    const { quitToMenu } = useStore();

    if (!visible) return null;

    // Button enabled when countdown finished (assets compile during countdown)
    const canStart = countdown <= 0;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start bg-black/60 backdrop-blur-sm px-1.5 pb-1.5 pt-3 pointer-events-auto">
            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-4 px-4 overflow-hidden">
                {/* Header - Level Done style */}
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0">
                    <span className="text-white">LEVEL</span> <span className="text-yellow-400">1</span>
                </h1>

                {/* Divider */}
                <div className="w-full h-[2px] bg-white/30 mb-3 shrink-0" />

                {/* Content - Mission banner + Controls from AboutScreen */}
                <div className="w-full flex-1 overflow-y-auto min-h-0">
                    <div className="flex flex-col gap-1.5">
                        {/* Logo - centered */}
                        <div className="flex justify-center items-center py-2">
                            <img
                                src="/kaasino_logo_full.png"
                                alt="KAASINO"
                                className="w-36 h-auto object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            />
                        </div>

                        {/* Main objective banner - emerald theme */}
                        <div className="bg-gradient-to-r from-emerald-900/50 to-green-800/40 rounded-lg p-2 border-2 border-emerald-500/60 text-center">
                            <span className="text-xl font-black uppercase tracking-widest">
                                <span className="text-white">👉  COLLECT</span> <span className="text-yellow-400">7</span> <span className="text-white">LETTERS</span>
                            </span>
                        </div>

                        {/* Touch controls - 2x2 grid */}
                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="bg-white/5 rounded-lg border border-red-500/40 p-2 flex items-center gap-2">
                                <span className="text-3xl">🎯</span>
                                <div>
                                    <span className="text-sm font-black text-red-400">TAP</span>
                                    <div className="text-xs text-gray-300">Shoot</div>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg border border-cyan-500/40 p-2 flex items-center gap-2">
                                <span className="text-2xl">👈 👉</span>
                                <div>
                                    <span className="text-sm font-black text-cyan-400">SWIPE L/R</span>
                                    <div className="text-xs text-gray-300">Move</div>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg border border-green-500/40 p-2 flex items-center gap-2">
                                <span className="text-3xl">👆</span>
                                <div>
                                    <span className="text-sm font-black text-green-400">SWIPE UP</span>
                                    <div className="text-xs text-gray-300">Jump</div>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg border border-amber-500/40 p-2 flex items-center gap-2">
                                <span className="text-3xl">💼</span>
                                <div>
                                    <span className="text-sm font-black text-amber-400">BAG BTN</span>
                                    <div className="text-xs text-gray-300">Inventory</div>
                                </div>
                            </div>
                        </div>

                        {/* Keyboard controls - 2 rows x 3 cards */}
                        <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                                <span className="text-lg font-black text-cyan-400">←→</span>
                                <div className="text-sm font-bold text-white">Move</div>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                                <span className="text-lg font-black text-cyan-400">↑</span>
                                <div className="text-sm font-bold text-white">Jump</div>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                                <span className="text-lg font-black text-cyan-400">SPACE</span>
                                <div className="text-sm font-bold text-white">Shoot</div>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                                <span className="text-lg font-black text-cyan-400">2×↓</span>
                                <div className="text-sm font-bold text-white">💼 Bag</div>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                                <span className="text-lg font-black text-cyan-400">ESC</span>
                                <div className="text-sm font-bold text-white">⏸️ Pause</div>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-800/40 rounded-lg p-2 border-2 border-cyan-500/60 text-center">
                                <span className="text-lg font-black text-cyan-400">M</span>
                                <div className="text-sm font-bold text-white">🔇 Mute</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation buttons - MAIN MENU (blue) + START (orange) */}
                <div className="flex items-center gap-2 w-full mt-3 shrink-0">
                    <button
                        onClick={quitToMenu}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#1E4785] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" /> MENU
                    </button>
                    {canStart ? (
                        <button
                            onClick={onStart}
                            className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                            style={{ textShadow: "0px 0px 4px rgba(255,255,255,0.5)" }}
                        >
                            START <Play className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 flex items-center justify-center text-sm bg-gray-700 text-gray-400 border-gray-600">
                            {countdown > 0 ? `READY IN ${countdown}...` : 'LOADING...'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Paired tips for Level 2+ preloader - two items per slide
const PAIRED_TIPS = [
    // MISSION
    {
        section: 'MISSION',
        sectionColor: 'text-emerald-400',
        items: [
            { icon: '🔤', title: 'K-A-A-S-I-N-O', text: 'Collect all 7 letters', color: 'text-yellow-400' },
            { icon: '💰', title: 'SHOOT', text: 'Defeat enemies = MONEY', color: 'text-green-400' },
        ]
    },
    // ENEMIES - Trap + Snake
    {
        section: 'ENEMIES',
        sectionColor: 'text-red-400',
        items: [
            { icon: '🪤', title: 'TRAP', text: 'Jump or shoot • 1 HP • +1x', color: 'text-amber-400' },
            { icon: '🐍', title: 'SNAKE', text: 'Changes lanes • 1 HP • +2x', color: 'text-green-400' },
        ]
    },
    // ENEMIES - Cat + Owl
    {
        section: 'ENEMIES',
        sectionColor: 'text-red-400',
        items: [
            { icon: '😾', title: 'CAT', text: 'Hunts you! • 2 HP • +3x', color: 'text-purple-400' },
            { icon: '🦉', title: 'OWL', text: 'Triple attack! • 3 HP • +5x', color: 'text-amber-500' },
        ]
    },
    // BOSS
    {
        section: 'BOSS',
        sectionColor: 'text-orange-400',
        items: [
            { icon: '👨🏻‍🔬', title: 'BOSS', text: 'Rams into you! HP: 20+', color: 'text-red-400' },
            { icon: '💉', title: 'SYRINGE', text: 'Dodge or shoot • +1x', color: 'text-cyan-400' },
        ]
    },
    // POWER-UPS - Slow + Speed
    {
        section: 'POWER-UPS',
        sectionColor: 'text-purple-400',
        items: [
            { icon: '⏳', title: 'SLOW', text: '-50% speed • 5 sec', color: 'text-green-400' },
            { icon: '🌪', title: 'SPEED', text: '+50% speed • 5 sec', color: 'text-amber-400' },
        ]
    },
    // POWER-UPS - Firewall + Heart
    {
        section: 'POWER-UPS',
        sectionColor: 'text-purple-400',
        items: [
            { icon: '🔥', title: 'FIREWALL', text: '2 projectiles • 10 sec', color: 'text-orange-400' },
            { icon: '💊', title: 'HEART', text: '+1 Life • Only at 1 life', color: 'text-green-400' },
        ]
    },
    // SHOP - Time Warp + Enemy Rush (pts)
    {
        section: 'SHOP',
        sectionColor: 'text-yellow-400',
        items: [
            { icon: '⏰', title: 'TIME WARP', text: 'Slow 15s • 2000 pts', color: 'text-blue-400' },
            { icon: '⚡', title: 'ENEMY RUSH', text: '🐍😾🦉 spawn! • 3000 pts', color: 'text-purple-400' },
        ]
    },
    // SHOP - Extra Heart + Cheese Magic (BET)
    {
        section: 'SHOP',
        sectionColor: 'text-yellow-400',
        items: [
            { icon: '💖', title: 'EXTRA HEART', text: 'Max +1 • 10x BET', color: 'text-pink-400' },
            { icon: '🪄', title: 'CHEESE MAGIC', text: 'Enemies = 🧀 • 20x BET', color: 'text-orange-400' },
        ]
    },
];

// Exit confirmation modal for LevelPreloadScreen
const ExitConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    return (
        <div className="absolute inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[90%] max-w-sm bg-[#0F172A] rounded-2xl border-4 border-white shadow-[0_0_30px_rgba(174,28,40,0.5)] p-5 flex flex-col items-center">
                {/* Warning icon */}
                <div className="w-16 h-16 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-9 h-9 text-red-400" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-red-400 uppercase tracking-wider mb-2">
                    EXIT GAME?
                </h2>

                {/* Warning text */}
                <p className="text-center text-gray-300 text-sm mb-4 leading-relaxed">
                    All your progress will be <span className="text-red-400 font-bold">LOST</span>!
                    <br />
                    Cheese points, earnings, and level progress will not be saved.
                </p>

                {/* Buttons - Dutch colors: NO (blue) + YES (orange) */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#1E4785] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                    >
                        NO
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                    >
                        YES
                    </button>
                </div>
            </div>
        </div>
    );
};

// Level Preload Screen - shows between levels with paired tips
export const LevelPreloadScreen: React.FC<{ level: number; countdown: number; visible: boolean; onStart: () => void }> = ({ level, countdown, visible, onStart }) => {
    const [tipIndex, setTipIndex] = React.useState(0);
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);
    const { restartGame, lives, maxLives } = useStore();

    // Cycle through paired tips every 2.5 seconds
    React.useEffect(() => {
        if (!visible) return;
        // Start from first tip (main objective)
        setTipIndex(0);

        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % PAIRED_TIPS.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [visible]);

    if (!visible) return null;

    const currentPair = PAIRED_TIPS[tipIndex];

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start bg-black/60 backdrop-blur-sm px-1.5 pb-1.5 pt-3 pointer-events-auto">
            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-4 px-4 overflow-hidden">
                {/* Header - Level Done style */}
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0">
                    <span className="text-white">LEVEL</span> <span className="text-yellow-400">{level}</span>
                </h1>

                {/* Tip indicator dots - under header */}
                <div className="flex justify-center gap-1.5 mb-3 shrink-0">
                    {PAIRED_TIPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all ${
                                idx === tipIndex
                                    ? 'bg-yellow-400 w-4'
                                    : 'bg-white/30 w-2'
                            }`}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="w-full h-[2px] bg-white/30 mb-3 shrink-0" />

                {/* Content */}
                <div className="w-full flex-1 overflow-y-auto min-h-0">
                    <div className="flex flex-col gap-2">
                        {/* Section title banner */}
                        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/60 rounded-lg p-2 border-2 border-white/20 text-center">
                            <span className={`text-lg font-black uppercase tracking-widest ${currentPair.sectionColor}`}>
                                {currentPair.section}
                            </span>
                        </div>

                        {/* Paired tip banners */}
                        <div className="grid grid-cols-2 gap-2">
                            {currentPair.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gradient-to-r from-slate-800/80 to-slate-700/60 rounded-lg p-3 border-2 border-white/20 text-center"
                                >
                                    <span className="text-3xl block mb-1">{item.icon}</span>
                                    <span className={`text-sm font-black uppercase tracking-wide block ${item.color}`}>
                                        {item.title}
                                    </span>
                                    <p className="text-xs text-gray-300 mt-1 leading-tight">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Level info */}
                        <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/20 rounded-xl p-3 border border-emerald-500/30 mt-1">
                            <div className="flex justify-around text-center">
                                <div>
                                    <div className="text-xl font-black text-white">{getLaneCountForLevel(level)}</div>
                                    <div className="text-xs text-gray-400 uppercase">Lanes</div>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-yellow-400">+30%</div>
                                    <div className="text-xs text-gray-400 uppercase">Speed</div>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-red-400">{lives}/{maxLives}</div>
                                    <div className="text-xs text-gray-400 uppercase">Lives</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation buttons - QUIT (blue) + START (orange) - Dutch colors */}
                <div className="flex items-center gap-2 w-full mt-3 shrink-0">
                    <button
                        onClick={() => setShowExitConfirm(true)}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#1E4785] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" /> QUIT
                    </button>
                    {countdown <= 0 ? (
                        <button
                            onClick={onStart}
                            className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                            style={{ textShadow: "0px 0px 4px rgba(255,255,255,0.5)" }}
                        >
                            START <Play className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 flex items-center justify-center text-sm bg-gray-700 text-gray-400 border-gray-600">
                            READY IN {countdown}...
                        </div>
                    )}
                </div>
            </div>

            {/* Exit confirmation modal */}
            {showExitConfirm && (
                <ExitConfirmModal
                    onConfirm={() => {
                        setShowExitConfirm(false);
                        restartGame();
                    }}
                    onCancel={() => setShowExitConfirm(false)}
                />
            )}
        </div>
    );
};

// ControlsScreen removed - replaced by Level1PreloadScreen which combines mission + controls

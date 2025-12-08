/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cached texture utilities for sprite components.
 * Textures are created once and reused for performance.
 */

import * as THREE from 'three';

// Cheese emoji texture (normal - острием вниз)
let cachedCheeseTexture: THREE.CanvasTexture | null = null;
export const getCheeseTexture = (): THREE.CanvasTexture => {
    if (cachedCheeseTexture) return cachedCheeseTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.font = '90px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧀', 64, 70);
    }
    cachedCheeseTexture = new THREE.CanvasTexture(canvas);
    cachedCheeseTexture.colorSpace = THREE.SRGBColorSpace;
    return cachedCheeseTexture;
};

// Cheese emoji texture flipped (перевёрнутый - острием вверх)
let cachedCheeseFlippedTexture: THREE.CanvasTexture | null = null;
export const getCheeseFlippedTexture = (): THREE.CanvasTexture => {
    if (cachedCheeseFlippedTexture) return cachedCheeseFlippedTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Переворачиваем canvas вверх ногами
        ctx.translate(64, 64);
        ctx.rotate(Math.PI);
        ctx.translate(-64, -64);
        ctx.font = '90px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧀', 64, 58);
    }
    cachedCheeseFlippedTexture = new THREE.CanvasTexture(canvas);
    cachedCheeseFlippedTexture.colorSpace = THREE.SRGBColorSpace;
    return cachedCheeseFlippedTexture;
};

// Tornado emoji texture with glow effect for Speed Boost (amber color)
let cachedLightningTexture: THREE.CanvasTexture | null = null;
export const getLightningTexture = (): THREE.CanvasTexture => {
    if (cachedLightningTexture) return cachedLightningTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Draw amber glow/halo effect (amber-400: #FBBF24)
        const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
        gradient.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)');
        gradient.addColorStop(0.7, 'rgba(217, 119, 6, 0.2)');
        gradient.addColorStop(1, 'rgba(180, 83, 9, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Draw tornado emoji
        ctx.font = '70px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌪', 64, 64);
    }
    cachedLightningTexture = new THREE.CanvasTexture(canvas);
    cachedLightningTexture.colorSpace = THREE.SRGBColorSpace;
    return cachedLightningTexture;
};

// Hourglass emoji texture with green glow effect for Slow Motion
let cachedHourglassTexture: THREE.CanvasTexture | null = null;
export const getHourglassTexture = (): THREE.CanvasTexture => {
    if (cachedHourglassTexture) return cachedHourglassTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Draw green glow/halo effect (green-400: #4ADE80)
        const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        gradient.addColorStop(0, 'rgba(74, 222, 128, 0.9)');
        gradient.addColorStop(0.4, 'rgba(34, 197, 94, 0.5)');
        gradient.addColorStop(0.7, 'rgba(22, 163, 74, 0.2)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Draw hourglass emoji
        ctx.font = '70px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⏳', 64, 64);
    }
    cachedHourglassTexture = new THREE.CanvasTexture(canvas);
    cachedHourglassTexture.colorSpace = THREE.SRGBColorSpace;
    return cachedHourglassTexture;
};

// Fire emoji texture with green glow effect for Firewall
let cachedFireTexture: THREE.CanvasTexture | null = null;
export const getFireTexture = (): THREE.CanvasTexture => {
    if (cachedFireTexture) return cachedFireTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Draw green glow/halo effect (green-400: #4ADE80)
        const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        gradient.addColorStop(0, 'rgba(74, 222, 128, 0.9)');
        gradient.addColorStop(0.4, 'rgba(34, 197, 94, 0.5)');
        gradient.addColorStop(0.7, 'rgba(22, 163, 74, 0.2)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Draw fire emoji
        ctx.font = '70px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥', 64, 64);
    }
    cachedFireTexture = new THREE.CanvasTexture(canvas);
    cachedFireTexture.colorSpace = THREE.SRGBColorSpace;
    return cachedFireTexture;
};

// Fire emoji texture with orange glow for Firewall projectile
let cachedFireProjectileTexture: THREE.CanvasTexture | null = null;
export const getFireProjectileTexture = (): THREE.CanvasTexture => {
    if (cachedFireProjectileTexture) return cachedFireProjectileTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Draw orange glow/halo effect
        const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        gradient.addColorStop(0, 'rgba(255, 102, 0, 0.9)');
        gradient.addColorStop(0.4, 'rgba(255, 68, 0, 0.5)');
        gradient.addColorStop(0.7, 'rgba(204, 51, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(153, 34, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Draw fire emoji
        ctx.font = '70px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥', 64, 64);
    }
    cachedFireProjectileTexture = new THREE.CanvasTexture(canvas);
    cachedFireProjectileTexture.colorSpace = THREE.SRGBColorSpace;
    return cachedFireProjectileTexture;
};

// Pill emoji texture with green glow effect for Health Restore
let cachedHeartTexture: THREE.CanvasTexture | null = null;
export const getHeartTexture = (): THREE.CanvasTexture => {
    if (cachedHeartTexture) return cachedHeartTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Draw green glow/halo effect (green-400: #4ADE80)
        const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        gradient.addColorStop(0, 'rgba(74, 222, 128, 0.9)');
        gradient.addColorStop(0.4, 'rgba(34, 197, 94, 0.5)');
        gradient.addColorStop(0.7, 'rgba(22, 163, 74, 0.2)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Draw pill emoji
        ctx.font = '70px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💊', 64, 64);
    }
    cachedHeartTexture = new THREE.CanvasTexture(canvas);
    cachedHeartTexture.colorSpace = THREE.SRGBColorSpace;
    return cachedHeartTexture;
};

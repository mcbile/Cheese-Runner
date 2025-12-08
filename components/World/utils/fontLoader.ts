/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Font loading utility with fallback chain and proper error handling.
 */

// Font URLs with fallback chain
const FONT_URLS = [
    "https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json",
    "https://unpkg.com/three/examples/fonts/helvetiker_bold.typeface.json",
    "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
];

// Cached font URL after successful load
let cachedFontUrl: string | null = null;
let fontLoadPromise: Promise<string> | null = null;

/**
 * Preload font with fallback chain.
 * Returns the first working font URL.
 */
async function preloadFontAsync(): Promise<string> {
    if (cachedFontUrl) return cachedFontUrl;

    for (const url of FONT_URLS) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                cachedFontUrl = url;
                console.log('Font loaded from:', url);
                return url;
            }
        } catch (error) {
            console.warn(`Font URL failed: ${url}`, error);
        }
    }

    // All URLs failed - use first URL as fallback (will show fallback Text component)
    console.error('All font URLs failed, using fallback Text component');
    cachedFontUrl = FONT_URLS[0];
    return cachedFontUrl;
}

/**
 * Get the font URL synchronously.
 * Returns cached URL if available, otherwise returns default.
 */
export function getFontUrl(): string {
    return cachedFontUrl || FONT_URLS[0];
}

/**
 * Initialize font loading.
 * Call this early in the app lifecycle.
 * Returns a promise that resolves when font is loaded.
 */
export function initFontLoader(): Promise<string> {
    if (!fontLoadPromise) {
        fontLoadPromise = preloadFontAsync();
    }
    return fontLoadPromise;
}

/**
 * Check if font has been successfully loaded.
 */
export function isFontLoaded(): boolean {
    return cachedFontUrl !== null;
}

// Start preloading immediately when module is imported
// Handle the promise to prevent unhandled rejection
initFontLoader().catch((error) => {
    console.error('Font preload failed:', error);
});

// Export default URL for components that need it immediately
export const FONT_URL = FONT_URLS[0];

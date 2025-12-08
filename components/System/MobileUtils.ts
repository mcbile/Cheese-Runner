/**
 * Mobile utilities for haptic feedback, fullscreen, and orientation
 */

// Extend ScreenOrientation type for lock() method (non-standard but widely supported)
declare global {
    interface ScreenOrientation {
        lock?(orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'): Promise<void>;
    }
}

// Haptic feedback patterns (in milliseconds)
export const HapticPatterns = {
    // Light tap for UI interactions
    TAP: [10],
    // Medium feedback for actions like shooting
    SHOOT: [15],
    // Strong feedback for damage
    DAMAGE: [50, 30, 50],
    // Double tap for collecting items
    COLLECT: [10, 50, 10],
    // Success pattern for level complete
    SUCCESS: [20, 100, 20, 100, 40],
    // Jump feedback
    JUMP: [12],
    // Lane change
    LANE_CHANGE: [8],
    // Boss hit
    BOSS_HIT: [30, 20, 30],
    // Game over
    GAME_OVER: [100, 50, 100, 50, 200],
} as const;

export type OrientationMode = 'portrait' | 'landscape' | 'auto';

class MobileUtilsManager {
    private _hapticEnabled: boolean = true;
    private _isFullscreen: boolean = false;
    private _preferredOrientation: OrientationMode = 'auto';
    private _orientationChangeCallbacks: ((isLandscape: boolean) => void)[] = [];

    constructor() {
        // Check if haptic is supported
        this._hapticEnabled = 'vibrate' in navigator;
        this._setupOrientationListener();
    }

    /**
     * Setup orientation change listener
     */
    private _setupOrientationListener() {
        if (typeof window === 'undefined') return;

        const handleOrientationChange = () => {
            const isLandscape = this.isLandscape;
            this._orientationChangeCallbacks.forEach(cb => cb(isLandscape));
        };

        // Modern API
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        }

        // Fallback for iOS
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', () => {
            // Debounce resize to catch orientation changes
            setTimeout(handleOrientationChange, 100);
        });
    }

    /**
     * Subscribe to orientation changes
     */
    onOrientationChange(callback: (isLandscape: boolean) => void): () => void {
        this._orientationChangeCallbacks.push(callback);
        return () => {
            const index = this._orientationChangeCallbacks.indexOf(callback);
            if (index > -1) {
                this._orientationChangeCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Check if device is in landscape orientation
     */
    get isLandscape(): boolean {
        if (screen.orientation) {
            return screen.orientation.type.includes('landscape');
        }
        // Fallback to window dimensions
        return window.innerWidth > window.innerHeight;
    }

    /**
     * Check if device is in portrait orientation
     */
    get isPortrait(): boolean {
        return !this.isLandscape;
    }

    /**
     * Get current orientation angle
     */
    get orientationAngle(): number {
        if (screen.orientation) {
            return screen.orientation.angle;
        }
        // Deprecated but fallback
        return (window as any).orientation || 0;
    }

    /**
     * Get preferred orientation mode
     */
    get preferredOrientation(): OrientationMode {
        return this._preferredOrientation;
    }

    set preferredOrientation(mode: OrientationMode) {
        this._preferredOrientation = mode;
    }

    // --- Haptic Feedback ---

    get hapticSupported(): boolean {
        return 'vibrate' in navigator;
    }

    get hapticEnabled(): boolean {
        return this._hapticEnabled && this.hapticSupported;
    }

    set hapticEnabled(value: boolean) {
        this._hapticEnabled = value;
    }

    /**
     * Trigger haptic feedback with a pattern
     */
    vibrate(pattern: number | readonly number[]): void {
        if (!this.hapticEnabled) return;
        try {
            navigator.vibrate(pattern as number | number[]);
        } catch (e) {
            // Silently fail if vibration not supported
        }
    }

    /**
     * Light tap feedback for UI interactions
     */
    tap(): void {
        this.vibrate(HapticPatterns.TAP);
    }

    /**
     * Feedback for shooting
     */
    shoot(): void {
        this.vibrate(HapticPatterns.SHOOT);
    }

    /**
     * Strong feedback for taking damage
     */
    damage(): void {
        this.vibrate(HapticPatterns.DAMAGE);
    }

    /**
     * Feedback for collecting items
     */
    collect(): void {
        this.vibrate(HapticPatterns.COLLECT);
    }

    /**
     * Success pattern for level complete
     */
    success(): void {
        this.vibrate(HapticPatterns.SUCCESS);
    }

    /**
     * Jump feedback
     */
    jump(): void {
        this.vibrate(HapticPatterns.JUMP);
    }

    /**
     * Lane change feedback
     */
    laneChange(): void {
        this.vibrate(HapticPatterns.LANE_CHANGE);
    }

    /**
     * Boss hit feedback
     */
    bossHit(): void {
        this.vibrate(HapticPatterns.BOSS_HIT);
    }

    /**
     * Game over feedback
     */
    gameOver(): void {
        this.vibrate(HapticPatterns.GAME_OVER);
    }

    // --- Fullscreen API ---

    get fullscreenSupported(): boolean {
        return !!(
            document.documentElement.requestFullscreen ||
            (document.documentElement as any).webkitRequestFullscreen ||
            (document.documentElement as any).mozRequestFullScreen ||
            (document.documentElement as any).msRequestFullscreen
        );
    }

    get isFullscreen(): boolean {
        return !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
        );
    }

    /**
     * Request fullscreen mode
     */
    async requestFullscreen(): Promise<boolean> {
        if (!this.fullscreenSupported) return false;
        if (this.isFullscreen) return true;

        const elem = document.documentElement;
        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if ((elem as any).webkitRequestFullscreen) {
                await (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).mozRequestFullScreen) {
                await (elem as any).mozRequestFullScreen();
            } else if ((elem as any).msRequestFullscreen) {
                await (elem as any).msRequestFullscreen();
            }
            this._isFullscreen = true;
            return true;
        } catch (e) {
            console.warn('Fullscreen request failed:', e);
            return false;
        }
    }

    /**
     * Exit fullscreen mode
     */
    async exitFullscreen(): Promise<boolean> {
        if (!this.isFullscreen) return true;

        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                await (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen();
            }
            this._isFullscreen = false;
            return true;
        } catch (e) {
            console.warn('Exit fullscreen failed:', e);
            return false;
        }
    }

    /**
     * Toggle fullscreen mode
     */
    async toggleFullscreen(): Promise<boolean> {
        if (this.isFullscreen) {
            return this.exitFullscreen();
        } else {
            return this.requestFullscreen();
        }
    }

    // --- Screen Orientation Lock ---

    get orientationLockSupported(): boolean {
        return !!(screen.orientation && screen.orientation.lock);
    }

    /**
     * Lock screen orientation to portrait
     */
    async lockPortrait(): Promise<boolean> {
        if (!this.orientationLockSupported) return false;

        try {
            await screen.orientation.lock('portrait');
            return true;
        } catch (e) {
            // Orientation lock may fail on desktop or if not in fullscreen
            console.warn('Orientation lock failed:', e);
            return false;
        }
    }

    /**
     * Lock screen orientation to landscape
     */
    async lockLandscape(): Promise<boolean> {
        if (!this.orientationLockSupported) return false;

        try {
            await screen.orientation.lock('landscape');
            return true;
        } catch (e) {
            console.warn('Orientation lock failed:', e);
            return false;
        }
    }

    /**
     * Unlock screen orientation
     */
    unlockOrientation(): void {
        if (!this.orientationLockSupported) return;

        try {
            screen.orientation.unlock();
        } catch (e) {
            // Silently fail
        }
    }

    // --- Wake Lock (keep screen on) ---

    private _wakeLock: WakeLockSentinel | null = null;

    get wakeLockSupported(): boolean {
        return 'wakeLock' in navigator;
    }

    /**
     * Request wake lock to keep screen on during gameplay
     */
    async requestWakeLock(): Promise<boolean> {
        if (!this.wakeLockSupported) return false;

        try {
            this._wakeLock = await (navigator as any).wakeLock.request('screen');
            return true;
        } catch (e) {
            console.warn('Wake lock failed:', e);
            return false;
        }
    }

    /**
     * Release wake lock
     */
    async releaseWakeLock(): Promise<void> {
        if (this._wakeLock) {
            await this._wakeLock.release();
            this._wakeLock = null;
        }
    }

    // --- Combined mobile experience setup ---

    /**
     * Setup optimal mobile experience (call on game start)
     * @param orientation - preferred orientation ('portrait', 'landscape', or 'auto')
     */
    async setupMobileExperience(orientation: OrientationMode = 'auto'): Promise<void> {
        this._preferredOrientation = orientation;

        // Request fullscreen (user gesture required)
        await this.requestFullscreen();

        // Lock orientation based on preference
        if (orientation === 'portrait') {
            await this.lockPortrait();
        } else if (orientation === 'landscape') {
            await this.lockLandscape();
        }
        // 'auto' - don't lock, allow both orientations

        // Keep screen on during gameplay
        await this.requestWakeLock();
    }

    /**
     * Cleanup mobile experience (call on game end)
     */
    async cleanupMobileExperience(): Promise<void> {
        this.unlockOrientation();
        await this.releaseWakeLock();
        // Don't exit fullscreen - let user control that
    }

    /**
     * Check if current device is mobile based on screen size and touch capability
     */
    get isMobileDevice(): boolean {
        if (typeof window === 'undefined') return false;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth < 1024;
        return isTouchDevice && isSmallScreen;
    }

    /**
     * Check if current device is tablet (larger touch device)
     */
    get isTablet(): boolean {
        if (typeof window === 'undefined') return false;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isLargeScreen = window.innerWidth >= 768 && window.innerWidth < 1200;
        return isTouchDevice && isLargeScreen;
    }

    /**
     * Get recommended control layout based on device and orientation
     */
    getControlLayout(): 'mobile-portrait' | 'mobile-landscape' | 'tablet' | 'desktop' {
        if (!this.isMobileDevice) return 'desktop';
        if (this.isTablet) return 'tablet';
        return this.isLandscape ? 'mobile-landscape' : 'mobile-portrait';
    }
}

// Singleton instance
export const mobileUtils = new MobileUtilsManager();

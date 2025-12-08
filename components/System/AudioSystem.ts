/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AudioSystem - Core audio context management and system controls
 */

/** Master volume level */
export const MASTER_VOLUME = 0.4;
/** SFX gain relative to music (25% quieter) */
export const SFX_VOLUME = 0.375;

/**
 * Core audio system managing AudioContext and gain nodes
 */
export class AudioSystem {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    sfxGain: GainNode | null = null;
    isMuted = false;

    // iOS/Safari audio unlock state
    private _isUnlocked = false;
    private _silentBuffer: AudioBuffer | null = null;

    constructor() {
        this._setupIOSUnlock();
    }

    /**
     * iOS/Safari requires a user gesture to start audio.
     * Sets up listeners to unlock audio on first interaction.
     */
    private _setupIOSUnlock() {
        if (typeof window === 'undefined') return;

        const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];

        const unlock = () => {
            if (this._isUnlocked) return;
            this._unlockAudioContext();
        };

        unlockEvents.forEach(event => {
            document.addEventListener(event, unlock, { once: false, passive: true });
        });

        // Handle visibility changes (iOS may suspend audio on tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.ctx?.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        });
    }

    /**
     * Unlock AudioContext for iOS/Safari
     */
    private async _unlockAudioContext() {
        if (this._isUnlocked) return;

        try {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = this.isMuted ? 0 : MASTER_VOLUME;
                this.masterGain.connect(this.ctx.destination);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.value = SFX_VOLUME;
                this.sfxGain.connect(this.masterGain);
            }

            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }

            // Create and play a silent buffer to fully unlock
            if (!this._silentBuffer && this.ctx) {
                this._silentBuffer = this.ctx.createBuffer(1, 1, 22050);
                const source = this.ctx.createBufferSource();
                source.buffer = this._silentBuffer;
                source.connect(this.ctx.destination);
                source.start(0);
                source.stop(0.001);
            }

            this._isUnlocked = true;
            console.log('[Audio] AudioContext unlocked for iOS/Safari');
        } catch (e) {
            console.warn('[Audio] Failed to unlock AudioContext:', e);
        }
    }

    /** Check if audio is unlocked and ready */
    get isUnlocked(): boolean {
        return this._isUnlocked && this.ctx?.state === 'running';
    }

    /** Force unlock audio (call from user gesture handler) */
    async forceUnlock(): Promise<void> {
        await this._unlockAudioContext();
    }

    /** Initialize audio context and gain nodes */
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.isMuted ? 0 : MASTER_VOLUME;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = SFX_VOLUME;
            this.sfxGain.connect(this.masterGain);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch((err) => {
                console.warn('[Audio] Failed to resume AudioContext:', err);
            });
        }
    }

    /** Toggle mute state */
    toggleMute(muted: boolean) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(muted ? 0 : MASTER_VOLUME, this.ctx.currentTime);
        }
    }

    /** Pause all audio */
    pauseAudio() {
        if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend();
        }
    }

    /** Resume all audio */
    resumeAudio() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Audio - Facade for audio subsystems (System, Music, SFX)
 *
 * This module provides a unified interface for all audio functionality.
 * Internal implementation is split into:
 * - AudioSystem.ts: Core AudioContext management
 * - AudioMusic.ts: Background music sequencer
 * - AudioSFX.ts: Sound effects
 */

import { AudioSystem } from './AudioSystem';
import { AudioMusic } from './AudioMusic';
import { AudioSFX } from './AudioSFX';

/**
 * Main audio controller facade
 * Delegates to specialized subsystems while maintaining backwards compatibility
 */
export class AudioController {
    private system: AudioSystem;
    private music: AudioMusic;
    private sfx: AudioSFX;

    constructor() {
        this.system = new AudioSystem();
        this.music = new AudioMusic(this.system);
        this.sfx = new AudioSFX(this.system);
    }

    // --- System ---

    get ctx() { return this.system.ctx; }
    get masterGain() { return this.system.masterGain; }
    get sfxGain() { return this.system.sfxGain; }
    get isMuted() { return this.system.isMuted; }
    get isUnlocked() { return this.system.isUnlocked; }

    init() { this.system.init(); }
    async forceUnlock() { await this.system.forceUnlock(); }
    toggleMute(muted: boolean) { this.system.toggleMute(muted); }
    pauseAudio() { this.system.pauseAudio(); }
    resumeAudio() { this.system.resumeAudio(); }

    // --- Music ---

    startMusic() { this.music.start(); }
    stopMusic() { this.music.stop(); }

    // --- SFX ---

    playShoot() { this.sfx.playShoot(); }
    playJump(isDouble = false) { this.sfx.playJump(isDouble); }
    playDamage() { this.sfx.playDamage(); }
    playGemCollect() { this.sfx.playGemCollect(); }
    playLetterCollect() { this.sfx.playLetterCollect(); }
    playExplosion() { this.sfx.playExplosion(); }
    playCountdownBeep() { this.sfx.playCountdownBeep(); }
    playCountdownGo() { this.sfx.playCountdownGo(); }
    playBossFootstep() { this.sfx.playBossFootstep(); }
    playBossDeathGroan() { this.sfx.playBossDeathGroan(); }
}

/** Singleton audio controller instance */
export const audio = new AudioController();

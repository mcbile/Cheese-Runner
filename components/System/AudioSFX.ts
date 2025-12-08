/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AudioSFX - Sound effects for gameplay
 */

import { AudioSystem } from './AudioSystem';

/**
 * Sound effects manager for all gameplay sounds
 */
export class AudioSFX {
    private system: AudioSystem;

    constructor(system: AudioSystem) {
        this.system = system;
    }

    /** Ensure audio is initialized before playing */
    private ensureInit(): boolean {
        if (!this.system.ctx || !this.system.sfxGain) {
            this.system.init();
        }
        return !!(this.system.ctx && this.system.sfxGain);
    }

    // --- Player Actions ---

    playShoot() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1800, t);
            osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

            filter.type = 'highpass';
            filter.frequency.value = 1000;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.system.sfxGain!);

            osc.start(t);
            osc.stop(t + 0.15);
        } catch (e) {
            console.warn('[AudioSFX] Error playing shoot:', e);
        }
    }

    playJump(isDouble = false) {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const startFreq = isDouble ? 400 : 200;
            const endFreq = isDouble ? 800 : 450;

            osc.frequency.setValueAtTime(startFreq, t);
            osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

            osc.connect(gain);
            gain.connect(this.system.sfxGain!);

            osc.start(t);
            osc.stop(t + 0.15);
        } catch (e) {
            console.warn('[AudioSFX] Error playing jump:', e);
        }
    }

    playDamage() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            // Noise for crunch
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            // Low osc for thud
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);

            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.6, t);
            oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.5, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

            osc.connect(oscGain);
            oscGain.connect(this.system.sfxGain!);

            noise.connect(noiseGain);
            noiseGain.connect(this.system.sfxGain!);

            osc.start(t);
            osc.stop(t + 0.3);
            noise.start(t);
            noise.stop(t + 0.3);
        } catch (e) {
            console.warn('[AudioSFX] Error playing damage:', e);
        }
    }

    // --- Collectibles ---

    playGemCollect() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);

            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

            osc.connect(gain);
            gain.connect(this.system.sfxGain!);

            osc.start(t);
            osc.stop(t + 0.15);
        } catch (e) {
            console.warn('[AudioSFX] Error playing gem collect:', e);
        }
    }

    playLetterCollect() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            // Major chord arpeggio
            const freqs = [523.25, 659.25, 783.99];

            freqs.forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.value = f;

                const start = t + (i * 0.04);
                const dur = 0.3;

                gain.gain.setValueAtTime(0.3, start);
                gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

                osc.connect(gain);
                gain.connect(this.system.sfxGain!);

                osc.start(start);
                osc.stop(start + dur);
            });
        } catch (e) {
            console.warn('[AudioSFX] Error playing letter collect:', e);
        }
    }

    // --- Environment ---

    playExplosion() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            const bufferSize = ctx.sampleRate * 0.4;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.8, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.system.sfxGain!);

            noise.start(t);
        } catch (e) {
            console.warn('[AudioSFX] Error playing explosion:', e);
        }
    }

    // --- Countdown ---

    playCountdownBeep() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(800, t);

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

            osc.connect(gain);
            gain.connect(this.system.sfxGain!);

            osc.start(t);
            osc.stop(t + 0.15);
        } catch (e) {
            console.warn('[AudioSFX] Error playing countdown beep:', e);
        }
    }

    playCountdownGo() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.exponentialRampToValueAtTime(400, t + 0.4);

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

            osc.connect(gain);
            gain.connect(this.system.sfxGain!);

            osc.start(t);
            osc.stop(t + 0.5);
        } catch (e) {
            console.warn('[AudioSFX] Error playing countdown go:', e);
        }
    }

    // --- Boss ---

    playBossFootstep() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            // Low thud
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

            // Crunch noise
            const bufferSize = ctx.sampleRate * 0.08;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 300;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.15, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

            osc.connect(gain);
            gain.connect(this.system.sfxGain!);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.system.sfxGain!);

            osc.start(t);
            osc.stop(t + 0.12);
            noise.start(t);
            noise.stop(t + 0.1);
        } catch (e) {
            console.warn('[AudioSFX] Error playing boss footstep:', e);
        }
    }

    playBossDeathGroan() {
        try {
            if (!this.ensureInit()) return;
            const ctx = this.system.ctx!;
            const t = ctx.currentTime;

            // Main groan
            const groanOsc = ctx.createOscillator();
            const groanGain = ctx.createGain();
            const groanFilter = ctx.createBiquadFilter();

            groanOsc.type = 'sawtooth';
            groanOsc.frequency.setValueAtTime(180, t);
            groanOsc.frequency.exponentialRampToValueAtTime(60, t + 1.2);

            groanGain.gain.setValueAtTime(0.4, t);
            groanGain.gain.linearRampToValueAtTime(0.5, t + 0.1);
            groanGain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

            groanFilter.type = 'lowpass';
            groanFilter.frequency.setValueAtTime(400, t);
            groanFilter.frequency.exponentialRampToValueAtTime(150, t + 1.0);

            groanOsc.connect(groanFilter);
            groanFilter.connect(groanGain);
            groanGain.connect(this.system.sfxGain!);

            // Second harmonic
            const harmOsc = ctx.createOscillator();
            const harmGain = ctx.createGain();

            harmOsc.type = 'sine';
            harmOsc.frequency.setValueAtTime(120, t);
            harmOsc.frequency.exponentialRampToValueAtTime(40, t + 1.0);

            harmGain.gain.setValueAtTime(0.25, t);
            harmGain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);

            harmOsc.connect(harmGain);
            harmGain.connect(this.system.sfxGain!);

            // Breathy noise
            const bufferSize = ctx.sampleRate * 1.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 200;
            noiseFilter.Q.value = 2;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.08, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.system.sfxGain!);

            groanOsc.start(t);
            groanOsc.stop(t + 1.3);
            harmOsc.start(t);
            harmOsc.stop(t + 1.1);
            noise.start(t);
            noise.stop(t + 1.2);
        } catch (e) {
            console.warn('[AudioSFX] Error playing boss death groan:', e);
        }
    }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AudioMusic - Background music sequencer (synthwave style)
 */

import { AudioSystem } from './AudioSystem';

/** Music sequencer configuration */
const MUSIC_CONFIG = {
    TEMPO: 115,              // BPM
    LOOKAHEAD: 25.0,         // ms (scheduling frequency)
    SCHEDULE_AHEAD: 0.1,     // s (how far ahead to schedule)
    BGM_VOLUME: 0.5          // Music volume relative to master
};

/** Chord progression frequencies */
const CHORD_PROGRESSION = [
    [130.81, 155.56, 196.00], // Cm
    [116.54, 146.83, 174.61], // Bb
    [103.83, 130.81, 155.56], // Ab
    [98.00, 123.47, 146.83]   // G
];

/** Bass frequencies per bar */
const BASS_FREQUENCIES = [65.41, 58.27, 51.91, 49.00]; // C2, Bb1, Ab1, G1

/**
 * Music sequencer for procedural synthwave background music
 */
export class AudioMusic {
    private system: AudioSystem;
    private bgmGain: GainNode | null = null;
    private isPlayingMusic = false;
    private nextNoteTime = 0;
    private current16thNote = 0;
    private schedulerTimer: number | null = null;

    constructor(system: AudioSystem) {
        this.system = system;
    }

    /** Start background music */
    start() {
        if (this.isPlayingMusic) return;
        this.system.init();
        if (!this.system.ctx || !this.system.masterGain) return;

        this.isPlayingMusic = true;
        this.current16thNote = 0;
        this.nextNoteTime = this.system.ctx.currentTime + 0.1;

        this.bgmGain = this.system.ctx.createGain();
        this.bgmGain.gain.value = MUSIC_CONFIG.BGM_VOLUME;
        this.bgmGain.connect(this.system.masterGain);

        this.scheduler();
    }

    /** Stop background music */
    stop() {
        this.isPlayingMusic = false;
        if (this.schedulerTimer) window.clearTimeout(this.schedulerTimer);

        if (this.bgmGain && this.system.ctx) {
            try {
                this.bgmGain.gain.setTargetAtTime(0, this.system.ctx.currentTime, 0.1);
                const oldGain = this.bgmGain;
                setTimeout(() => {
                    try { oldGain.disconnect(); } catch (e) { /* ignore */ }
                }, 200);
            } catch (e) {
                console.warn('[AudioMusic] Error during stop:', e);
            }
            this.bgmGain = null;
        }
    }

    /** Main scheduler loop */
    private scheduler() {
        if (!this.isPlayingMusic || !this.system.ctx) return;

        while (this.nextNoteTime < this.system.ctx.currentTime + MUSIC_CONFIG.SCHEDULE_AHEAD) {
            this.scheduleNote(this.current16thNote, this.nextNoteTime);
            const secondsPerBeat = 60.0 / MUSIC_CONFIG.TEMPO;
            this.nextNoteTime += 0.25 * secondsPerBeat;
            this.current16thNote++;
        }
        this.schedulerTimer = window.setTimeout(() => this.scheduler(), MUSIC_CONFIG.LOOKAHEAD);
    }

    /** Schedule a single note */
    private scheduleNote(beatIndex: number, time: number) {
        if (!this.system.ctx || !this.bgmGain) return;

        const step = beatIndex % 16;
        const bar = Math.floor(beatIndex / 16) % 4;

        // Drums
        if (step % 4 === 0) this.playDrumKick(time);
        if (step === 4 || step === 12) this.playDrumSnare(time);
        if (step % 2 !== 0) this.playDrumHiHat(time, step % 4 === 1);

        // Bass (8th notes)
        if (step % 2 === 0) {
            let freq = BASS_FREQUENCIES[bar];
            if (step % 4 !== 0) freq *= 2; // Octave jump
            this.playSynthBass(time, freq);
        }

        // Chords (start of each bar)
        if (step === 0) {
            const chord = CHORD_PROGRESSION[bar];
            chord.forEach((f, i) => this.playSynthPad(time, f, i * 0.05));
        }
    }

    // --- Drum instruments ---

    private playDrumKick(time: number) {
        const ctx = this.system.ctx!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(this.bgmGain!);

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(1.0, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    private playDrumSnare(time: number) {
        const ctx = this.system.ctx!;
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain!);

        noise.start(time);
    }

    private playDrumHiHat(time: number, accent: boolean) {
        const ctx = this.system.ctx!;
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(accent ? 0.2 : 0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain!);
        noise.start(time);
    }

    // --- Synth instruments ---

    private playSynthBass(time: number, freq: number) {
        const ctx = this.system.ctx!;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';

        const gain = ctx.createGain();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain!);

        osc.frequency.setValueAtTime(freq, time);

        filter.frequency.setValueAtTime(600, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

        osc.start(time);
        osc.stop(time + 0.25);
    }

    private playSynthPad(time: number, freq: number, delay: number) {
        const ctx = this.system.ctx!;
        const t = time + delay;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';

        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(this.bgmGain!);

        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

        osc.start(t);
        osc.stop(t + 3.0);
    }
}

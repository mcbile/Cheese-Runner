/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ActiveEffectsDisplay - отображение активных эффектов и перков
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';

interface ActiveEffect {
    key: string;
    label: string;
    emoji: string;
    endTime: number;
    color: string;
    duration: number;
}

interface ActivePerk {
    key: string;
    label: string;
    emoji: string;
    color: string;
}

export const ActiveEffectsDisplay: React.FC = () => {
    const {
        isFirewallActive, firewallEndTime,
        isSpeedBoostActive, speedBoostEndTime,
        isCheeseFeverActive, cheeseFeverEndTime,
        isSlowMotionActive, slowMotionEndTime,
        chasingSnakesActive,
        isGodMode,
        isDevMode,
        isFirstPersonMode
    } = useStore();

    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => forceUpdate(n => n + 1), 100);
        return () => clearInterval(interval);
    }, []);

    const effects: ActiveEffect[] = [];
    const perks: ActivePerk[] = [];
    const modes: ActivePerk[] = [];
    const now = Date.now();

    // Dev/God/FPS modes (show first, most important)
    if (isFirstPersonMode) {
        modes.push({ key: 'fps-mode', label: 'FPS', emoji: '👁️', color: 'text-cyan-400 border-cyan-400/50' });
    }
    if (isDevMode) {
        modes.push({ key: 'dev-mode', label: 'DEV', emoji: '👑', color: 'text-green-400 border-green-400/50' });
    }
    if (isGodMode) {
        modes.push({ key: 'god-mode', label: 'GOD', emoji: '⭐', color: 'text-purple-400 border-purple-400/50' });
    }

    // Timed effects
    if (isFirewallActive && firewallEndTime > now) {
        effects.push({ key: 'firewall', label: 'FIREWALL', emoji: '🔥', endTime: firewallEndTime, color: 'text-red-500 border-red-500/50', duration: 10000 });
    }
    if (isSpeedBoostActive && speedBoostEndTime > now) {
        effects.push({ key: 'speedboost', label: 'SPEED', emoji: '⚡', endTime: speedBoostEndTime, color: 'text-yellow-400 border-yellow-400/50', duration: 5000 });
    }
    if (isCheeseFeverActive && cheeseFeverEndTime > now) {
        effects.push({ key: 'fever', label: 'FEVER', emoji: '🧀', endTime: cheeseFeverEndTime, color: 'text-orange-500 border-orange-500/50', duration: 20000 });
    }
    if (isSlowMotionActive && slowMotionEndTime > now) {
        effects.push({ key: 'slowmo', label: 'SLOW', emoji: '🐢', endTime: slowMotionEndTime, color: 'text-cyan-400 border-cyan-400/50', duration: 15000 });
    }

    // Permanent perks (shop purchases)
    if (chasingSnakesActive) {
        perks.push({ key: 'chasing-snakes', label: 'SNAKES', emoji: '🐍', color: 'text-green-500 border-green-500/50' });
    }

    // Sort timed effects by remaining time (less time = higher position)
    effects.sort((a, b) => (a.endTime - now) - (b.endTime - now));

    if (effects.length === 0 && perks.length === 0 && modes.length === 0) return null;

    return (
        <div className="flex flex-col items-center gap-1.5 mb-2">
            {/* Dev/God modes first (most important) */}
            {modes.map(mode => (
                <div key={mode.key} className={`flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded-lg border ${mode.color.split(' ')[1]} animate-pulse`}>
                    <span className="text-base">{mode.emoji}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${mode.color.split(' ')[0]}`}>{mode.label}</span>
                </div>
            ))}
            {/* Permanent perks */}
            {perks.map(perk => (
                <div key={perk.key} className={`flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg border ${perk.color.split(' ')[1]}`}>
                    <span className="text-base">{perk.emoji}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${perk.color.split(' ')[0]}`}>{perk.label}</span>
                </div>
            ))}
            {/* Timed effects */}
            {effects.map(effect => {
                const remaining = Math.max(0, effect.endTime - now);
                const progress = (remaining / effect.duration) * 100;
                return (
                    <div key={effect.key} className={`flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg border ${effect.color.split(' ')[1]}`}>
                        <span className="text-base">{effect.emoji}</span>
                        <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div className={`h-full ${effect.color.split(' ')[0].replace('text-', 'bg-')} transition-all duration-100`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className={`text-[9px] font-bold ${effect.color.split(' ')[0]}`}>{Math.ceil(remaining / 1000)}s</span>
                    </div>
                );
            })}
        </div>
    );
};

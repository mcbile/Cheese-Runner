/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useAudioSync - Hook that syncs store state changes with audio
 *
 * This hook listens to store changes and triggers audio actions,
 * keeping audio logic out of store slices.
 */

import { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { audio } from './Audio';
import { GameStatus } from '../../types';

/**
 * Hook to sync audio with game state changes.
 * Should be mounted once in App component.
 */
export function useAudioSync() {
    const status = useStore(state => state.status);
    const isMuted = useStore(state => state.isMuted);
    const prevStatusRef = useRef<GameStatus>(status);

    // Sync mute state
    useEffect(() => {
        audio.toggleMute(isMuted);
    }, [isMuted]);

    // Sync game status changes
    useEffect(() => {
        const prevStatus = prevStatusRef.current;
        prevStatusRef.current = status;

        // Start music when game starts (COUNTDOWN)
        if (status === GameStatus.COUNTDOWN && prevStatus === GameStatus.MENU) {
            audio.startMusic();
        }

        // Pause audio when paused, inventory, or shop
        if (status === GameStatus.PAUSED || status === GameStatus.INVENTORY) {
            audio.pauseAudio();
        }

        // Resume audio when returning to playing
        if (status === GameStatus.PLAYING &&
            (prevStatus === GameStatus.PAUSED || prevStatus === GameStatus.INVENTORY)) {
            audio.resumeAudio();
        }

        // Pause on level complete / victory
        if (status === GameStatus.LEVEL_COMPLETE || status === GameStatus.VICTORY) {
            audio.pauseAudio();
        }

        // Stop music and resume audio when going to menu
        if (status === GameStatus.MENU && prevStatus !== GameStatus.MENU) {
            audio.stopMusic();
            audio.resumeAudio();
        }

        // Resume and start music for next level (from LEVEL_COMPLETE or SHOP)
        if (status === GameStatus.LEVEL_PRELOAD &&
            (prevStatus === GameStatus.LEVEL_COMPLETE || prevStatus === GameStatus.SHOP)) {
            audio.resumeAudio();
            audio.startMusic();
        }

    }, [status]);
}

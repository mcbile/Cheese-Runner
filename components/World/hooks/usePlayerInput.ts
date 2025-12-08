/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Custom hook for player input handling (keyboard, touch, joystick)
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { LANE_WIDTH, GameStatus, JoystickMoveEvent, getLaneBounds } from '../../../types';
import { audio } from '../../System/Audio';

interface UsePlayerInputProps {
    groupRef: React.RefObject<THREE.Group>;
    isJumping: React.MutableRefObject<boolean>;
    velocityY: React.MutableRefObject<number>;
    jumpsPerformed: React.MutableRefObject<number>;
    spinRotation: React.MutableRefObject<number>;
    jumpForce: number;
}

interface UsePlayerInputReturn {
    lane: number;
    setLane: React.Dispatch<React.SetStateAction<number>>;
    triggerJump: () => void;
    triggerShoot: () => void;
}

export function usePlayerInput({
    groupRef,
    isJumping,
    velocityY,
    jumpsPerformed,
    spinRotation,
    jumpForce
}: UsePlayerInputProps): UsePlayerInputReturn {
    const { status, laneCount, hasDoubleJump, activateImmortality, setPlayerLane, attemptShoot } = useStore();

    const [lane, setLane] = useState(0);
    const laneRef = useRef(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    // Shoot cooldown (250ms minimum between shots)
    const lastShootTime = useRef(0);
    const SHOOT_COOLDOWN = 250; // ms

    // Refs for stable event handlers
    const statusRef = useRef(status);
    const laneCountRef = useRef(laneCount);

    // Keep refs in sync
    useEffect(() => {
        laneRef.current = lane;
    }, [lane]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        laneCountRef.current = laneCount;
    }, [laneCount]);

    // Trigger jump action
    const triggerJump = useCallback(() => {
        const maxJumps = hasDoubleJump ? 2 : 1;

        if (!isJumping.current) {
            audio.playJump(false);
            isJumping.current = true;
            jumpsPerformed.current = 1;
            velocityY.current = jumpForce;
        } else if (jumpsPerformed.current < maxJumps) {
            audio.playJump(true);
            jumpsPerformed.current += 1;
            velocityY.current = jumpForce;
            spinRotation.current = 0;
        }
    }, [hasDoubleJump, isJumping, velocityY, jumpsPerformed, spinRotation, jumpForce]);

    // Trigger shoot action
    const triggerShoot = useCallback(() => {
        if (!groupRef.current) return;

        // Enforce cooldown between shots
        const now = Date.now();
        if (now - lastShootTime.current < SHOOT_COOLDOWN) return;

        if (attemptShoot()) {
            lastShootTime.current = now;
            audio.playShoot();
            window.dispatchEvent(new CustomEvent('player-shoot', {
                detail: {
                    position: [
                        groupRef.current.position.x,
                        groupRef.current.position.y + 0.8,
                        groupRef.current.position.z
                    ]
                }
            }));
        }
    }, [groupRef, attemptShoot]);

    // Keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== GameStatus.PLAYING) return;
            const { min: minLane, max: maxLane } = getLaneBounds(laneCount);

            if (e.key === 'ArrowLeft') {
                const next = Math.max(lane - 1, minLane);
                setLane(next);
                setPlayerLane(next);
            }
            else if (e.key === 'ArrowRight') {
                const next = Math.min(lane + 1, maxLane);
                setLane(next);
                setPlayerLane(next);
            }
            else if (e.key === 'ArrowUp' || e.key === 'w') triggerJump();
            else if (e.key === ' ') triggerShoot();
            else if (e.key === 'Shift' || e.key === 'Enter') activateImmortality();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, laneCount, lane, setPlayerLane, activateImmortality, triggerJump, triggerShoot]);

    // Joystick input
    useEffect(() => {
        const handleJoystick = (e: Event) => {
            if (statusRef.current !== GameStatus.PLAYING) return;
            const joystickEvent = e as JoystickMoveEvent;
            const currentLaneCount = laneCountRef.current;
            const { min: minLane, max: maxLane } = getLaneBounds(currentLaneCount);
            const direction = joystickEvent.detail.direction;

            if (direction === 'right') {
                const next = Math.min(laneRef.current + 1, maxLane);
                setLane(next);
                setPlayerLane(next);
            } else if (direction === 'left') {
                const next = Math.max(laneRef.current - 1, minLane);
                setLane(next);
                setPlayerLane(next);
            }
        };

        const handleJumpEvent = () => {
            if (statusRef.current !== GameStatus.PLAYING) return;
            triggerJump();
        };

        window.addEventListener('joystick-move', handleJoystick);
        window.addEventListener('player-jump', handleJumpEvent);

        return () => {
            window.removeEventListener('joystick-move', handleJoystick);
            window.removeEventListener('player-jump', handleJumpEvent);
        };
    }, [setPlayerLane, triggerJump]);

    // Touch input
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (status !== GameStatus.PLAYING) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX.current;
            const deltaY = e.changedTouches[0].clientY - touchStartY.current;

            if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -30) {
                triggerJump();
            }
        };

        const handleShootUI = () => triggerShoot();

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('ui-shoot-press', handleShootUI);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('ui-shoot-press', handleShootUI);
        };
    }, [status, triggerJump, triggerShoot]);

    // Lane bounds check
    useEffect(() => {
        const { min: minLane, max: maxLane } = getLaneBounds(laneCount);

        if (lane < minLane || lane > maxLane) {
            const newLane = Math.max(Math.min(lane, maxLane), minLane);
            setLane(newLane);
            setPlayerLane(newLane);
        }
    }, [laneCount, lane, setPlayerLane]);

    return {
        lane,
        setLane,
        triggerJump,
        triggerShoot
    };
}

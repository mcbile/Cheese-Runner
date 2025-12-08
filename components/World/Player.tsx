/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Player component - Lab mouse character with physics, animation, and input
 * Uses modular hooks for physics and animation
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import {
    GameStatus,
    JUMP_FORCE,
    MAX_LATERAL_VELOCITY,
    INVINCIBILITY_DURATION,
    TOUCH_CONFIG,
    getLaneBounds,
    LANE_WIDTH,
    SPRING_STIFFNESS,
    SPRING_DAMPING,
    GRAVITY,
    RUN_SPEED_BASE
} from '../../types';
import { audio } from '../System/Audio';
import { mobileUtils } from '../System/MobileUtils';

// Import geometries
import {
    MOUSE_HEAD_GEO,
    MOUSE_EAR_GEO,
    MOUSE_INNER_EAR_GEO,
    MOUSE_SNOUT_GEO,
    MOUSE_NOSE_GEO,
    MOUSE_BODY_GEO,
    MOUSE_BELLY_GEO,
    MOUSE_LIMB_GEO,
    MOUSE_TAIL_GEO,
    MOUSE_WHISKER_GEO,
    MOUSE_JOINT_GEO,
    MOUSE_FINGER_GEO,
    MOUSE_TOOTH_GEO,
    MOUSE_EYE_HIGHLIGHT_GEO,
    PLAYER_SHADOW_GEO
} from './geometries';

// Import hooks
import {
    usePlayerPhysics,
    updateHorizontalPhysics,
    updateJumpPhysics,
    resetPhysicsState,
    updateTailAnimation,
    updateRunningAnimation,
    updateIdleAnimation,
    updateJumpingAnimation,
    updateShadow,
    type AnimationRefs
} from './hooks';

// Re-export geometries for backward compatibility
export {
    MOUSE_HEAD_GEO,
    MOUSE_EAR_GEO,
    MOUSE_INNER_EAR_GEO,
    MOUSE_SNOUT_GEO,
    MOUSE_NOSE_GEO,
    MOUSE_BODY_GEO,
    MOUSE_LIMB_GEO,
    MOUSE_TAIL_GEO,
    MOUSE_WHISKER_GEO,
    MOUSE_JOINT_GEO
} from './geometries';

// Import PlayerModel component
import { PlayerModel, type PlayerModelRefs } from './PlayerModel';

export const Player: React.FC = () => {
    // Group refs
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const shadowRef = useRef<THREE.Mesh>(null);
    const tailRef = useRef<THREE.Group>(null);

    // Limb refs for animation
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);

    // Store state
    const { status, laneCount, takeDamage, hasDoubleJump, activateImmortality, isImmortalityActive, setPlayerLane, setPlayerY, attemptShoot, speed, openInventory, closeInventory, isDevMode, isFirstPersonMode } = useStore();

    // Lane state
    const [lane, setLane] = React.useState(0);
    const laneRef = useRef(0);

    // Physics state from hook
    const physicsState = usePlayerPhysics();
    const { isJumping, velocityY, velocityX, jumpsPerformed, spinRotation, targetX } = physicsState;

    // Animation state
    const animTime = useRef(0);

    // Touch input state
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchStartTime = useRef(0);
    const isTouchActive = useRef(false);
    const touchProcessed = useRef(false);
    const inventoryOpenedThisTouch = useRef(false); // Track if inventory was opened during current touch
    const holdDownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Timer for inventory hold-to-open


    // Invincibility state
    const isInvincible = useRef(false);
    const lastDamageTime = useRef(0);

    // Shoot cooldown (200ms minimum between shots)
    const lastShootTime = useRef(0);
    const SHOOT_COOLDOWN = 200; // ms

    // Refs for stable event handlers
    const statusRef = useRef(status);
    const laneCountRef = useRef(laneCount);

    // Memoized materials with cleanup to prevent memory leaks
    const materials = useMemo(() => {
        return {
            furMaterial: new THREE.MeshStandardMaterial({
                color: '#FAFAFA',
                roughness: 0.85,
                metalness: 0.05,
                emissive: '#1A1A1A',
                emissiveIntensity: 0.15
            }),
            pinkMaterial: new THREE.MeshStandardMaterial({
                color: '#FFB3D9',
                roughness: 0.4,
                metalness: 0.1,
                emissive: '#F472B6',
                emissiveIntensity: 0.05
            }),
            eyeMaterial: new THREE.MeshStandardMaterial({
                color: '#FF2222',
                roughness: 0.2,
                metalness: 0.3,
                emissive: '#AA0000',
                emissiveIntensity: 0.6
            }),
            shadowMaterial: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.3, transparent: true }),
            invincibilityMaterial: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 }),
            whiskerMaterial: new THREE.MeshBasicMaterial({ color: '#222222', transparent: true, opacity: 0.7 }),
        };
    }, []);

    // Dispose materials on unmount to prevent GPU memory leaks
    useEffect(() => {
        return () => {
            materials.furMaterial.dispose();
            materials.pinkMaterial.dispose();
            materials.eyeMaterial.dispose();
            materials.shadowMaterial.dispose();
            materials.invincibilityMaterial.dispose();
            materials.whiskerMaterial.dispose();
        };
    }, [materials]);

    const { furMaterial, pinkMaterial, eyeMaterial, shadowMaterial, invincibilityMaterial, whiskerMaterial } = materials;

    // --- Keep refs in sync ---
    useEffect(() => { laneRef.current = lane; }, [lane]);
    useEffect(() => { statusRef.current = status; }, [status]);
    useEffect(() => { laneCountRef.current = laneCount; }, [laneCount]);

    // --- Reset state on game start or level preload ---
    useEffect(() => {
        // Reset on LEVEL_PRELOAD (between levels) or COUNTDOWN (level 1 start)
        if (status === GameStatus.LEVEL_PRELOAD || status === GameStatus.COUNTDOWN) {
            // Use hook's reset function for physics state
            resetPhysicsState(physicsState, groupRef.current, bodyRef.current);
            velocityX.current = 0;
            targetX.current = 0;
            animTime.current = 0;
            setLane(0);
            setPlayerLane(0);
            if (groupRef.current) {
                groupRef.current.position.x = 0;
                groupRef.current.rotation.set(0, 0, 0);
                groupRef.current.visible = true;
            }
            if (bodyRef.current) {
                bodyRef.current.position.set(0, 0, 0);
            }
            // Reset all limbs to neutral position
            if (headRef.current) headRef.current.rotation.set(0, 0, 0);
            if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0);
            if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, 0);
            if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
            if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
            if (tailRef.current) tailRef.current.rotation.set(0, 0, 0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, setPlayerLane]);

    // --- Lane bounds check ---
    useEffect(() => {
        const { min: minLane, max: maxLane } = getLaneBounds(laneCount);

        if (lane < minLane || lane > maxLane) {
            const newLane = Math.max(Math.min(lane, maxLane), minLane);
            setLane(newLane);
            setPlayerLane(newLane);
        }
    }, [laneCount, lane, setPlayerLane]);

    // --- Controls ---
    const triggerJump = () => {
        const maxJumps = hasDoubleJump ? 2 : 1;

        if (!isJumping.current) {
            audio.playJump(false);
            mobileUtils.jump();
            isJumping.current = true;
            jumpsPerformed.current = 1;
            velocityY.current = JUMP_FORCE;
        } else if (jumpsPerformed.current < maxJumps) {
            audio.playJump(true);
            mobileUtils.jump();
            jumpsPerformed.current += 1;
            velocityY.current = JUMP_FORCE;
            spinRotation.current = 0;
        }
    };

    const triggerShoot = () => {
        if (!groupRef.current) return;

        // Enforce cooldown between shots
        const now = Date.now();
        if (now - lastShootTime.current < SHOOT_COOLDOWN) return;

        if (attemptShoot()) {
            lastShootTime.current = now;
            audio.playShoot();
            mobileUtils.shoot();
            // Use target lane position instead of current visual position
            // This ensures projectile spawns where player intends to be, not where animation is
            window.dispatchEvent(new CustomEvent('player-shoot', {
                detail: {
                    position: [
                        lane * LANE_WIDTH,  // Target lane, not current position
                        groupRef.current.position.y + 0.8,
                        groupRef.current.position.z
                    ]
                }
            }));
        }
    };

    // --- Keyboard input ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== GameStatus.PLAYING || isDevMode) return;
            const { min: minLane, max: maxLane } = getLaneBounds(laneCount);

            if (e.key === 'ArrowLeft') {
                const next = Math.max(lane - 1, minLane);
                if (next !== lane) mobileUtils.laneChange();
                setLane(next);
                setPlayerLane(next);
            }
            else if (e.key === 'ArrowRight') {
                const next = Math.min(lane + 1, maxLane);
                if (next !== lane) mobileUtils.laneChange();
                setLane(next);
                setPlayerLane(next);
            }
            else if (e.key === 'ArrowUp') triggerJump();
            else if (e.key === ' ') triggerShoot();
            else if (e.key === 'Shift' || e.key === 'Enter') activateImmortality();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, laneCount, hasDoubleJump, activateImmortality, lane, setPlayerLane, attemptShoot]);

    // --- Game event listeners (joystick, jump, shoot, damage) ---
    useEffect(() => {
        const handleJoystick = (e: Event) => {
            if (statusRef.current !== GameStatus.PLAYING) return;
            const joystickEvent = e as CustomEvent<{ direction: string }>;
            const currentLaneCount = laneCountRef.current;
            const minLane = -Math.floor((currentLaneCount - 1) / 2);
            const maxLane = Math.ceil((currentLaneCount - 1) / 2);
            const direction = joystickEvent.detail.direction;

            if (direction === 'right') {
                const next = Math.min(laneRef.current + 1, maxLane);
                if (next !== laneRef.current) mobileUtils.laneChange();
                setLane(next);
                setPlayerLane(next);
            } else if (direction === 'left') {
                const next = Math.max(laneRef.current - 1, minLane);
                if (next !== laneRef.current) mobileUtils.laneChange();
                setLane(next);
                setPlayerLane(next);
            }
        };

        const handleJumpEvent = () => {
            if (statusRef.current !== GameStatus.PLAYING) return;
            triggerJump();
        };

        const handleShootUI = () => triggerShoot();

        const handlePlayerHit = () => {
            if (isInvincible.current || useStore.getState().isImmortalityActive) return;
            audio.playDamage();
            mobileUtils.damage();
            takeDamage();
            isInvincible.current = true;
            lastDamageTime.current = Date.now();
        };

        window.addEventListener('joystick-move', handleJoystick);
        window.addEventListener('player-jump', handleJumpEvent);
        window.addEventListener('ui-shoot-press', handleShootUI);
        window.addEventListener('player-hit', handlePlayerHit);

        return () => {
            window.removeEventListener('joystick-move', handleJoystick);
            window.removeEventListener('player-jump', handleJumpEvent);
            window.removeEventListener('ui-shoot-press', handleShootUI);
            window.removeEventListener('player-hit', handlePlayerHit);
        };
    }, [setPlayerLane, takeDamage]);

    // --- Touch input with invisible control zones ---
    // Bottom 40% of screen: LEFT half = shoot (tap), RIGHT half = joystick (swipes)
    useEffect(() => {
        const { SWIPE_THRESHOLD_X, SWIPE_THRESHOLD_Y, MAX_SWIPE_TIME, SWIPE_DOWN_THRESHOLD } = TOUCH_CONFIG;
        const CONTROL_ZONE_HEIGHT = 0.40; // Bottom 40% of screen

        // Helper to check if touch is in control zone (bottom 40%)
        const isInControlZone = (y: number) => {
            const screenHeight = window.innerHeight;
            return y > screenHeight * (1 - CONTROL_ZONE_HEIGHT);
        };

        // Helper to check which side of screen (35% left, 65% right)
        const LEFT_ZONE_WIDTH = 0.35;
        const isLeftHalf = (x: number) => x < window.innerWidth * LEFT_ZONE_WIDTH;
        const isRightHalf = (x: number) => x >= window.innerWidth * LEFT_ZONE_WIDTH;

        const handleTouchStart = (e: TouchEvent) => {
            // Only track first touch
            if (e.touches.length !== 1) return;

            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
            touchStartTime.current = Date.now();
            isTouchActive.current = true;
            touchProcessed.current = false;
            inventoryOpenedThisTouch.current = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isTouchActive.current || touchProcessed.current) return;
            if (e.touches.length !== 1) return;

            const deltaX = e.touches[0].clientX - touchStartX.current;
            const deltaY = e.touches[0].clientY - touchStartY.current;
            const elapsed = Date.now() - touchStartTime.current;
            const inControlZone = isInControlZone(touchStartY.current);
            const inRightZone = isRightHalf(touchStartX.current);

            // Swipe down during INVENTORY - mark that we should NOT close it on this touch
            if (statusRef.current === GameStatus.INVENTORY) {
                inventoryOpenedThisTouch.current = true;
                return;
            }

            // Rest of swipe handling only in PLAYING state
            if (statusRef.current !== GameStatus.PLAYING) return;

            // RIGHT ZONE (joystick area): swipe down + hold to open inventory
            if (inControlZone && inRightZone && deltaY > SWIPE_DOWN_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
                if (!holdDownTimerRef.current && !inventoryOpenedThisTouch.current) {
                    holdDownTimerRef.current = setTimeout(() => {
                        openInventory();
                        inventoryOpenedThisTouch.current = true;
                        touchProcessed.current = true;
                        holdDownTimerRef.current = null;
                    }, 1000);
                }
                return;
            } else {
                if (holdDownTimerRef.current) {
                    clearTimeout(holdDownTimerRef.current);
                    holdDownTimerRef.current = null;
                }
            }

            // RIGHT ZONE: Horizontal swipe for lane change
            if (inControlZone && inRightZone && elapsed < MAX_SWIPE_TIME) {
                if (Math.abs(deltaX) > SWIPE_THRESHOLD_X && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                    const currentLaneCount = laneCountRef.current;
                    const minLane = -Math.floor((currentLaneCount - 1) / 2);
                    const maxLane = Math.ceil((currentLaneCount - 1) / 2);

                    if (deltaX > 0) {
                        const next = Math.min(laneRef.current + 1, maxLane);
                        if (next !== laneRef.current) {
                            mobileUtils.laneChange();
                            setLane(next);
                            setPlayerLane(next);
                            touchProcessed.current = true;
                        }
                    } else {
                        const next = Math.max(laneRef.current - 1, minLane);
                        if (next !== laneRef.current) {
                            mobileUtils.laneChange();
                            setLane(next);
                            setPlayerLane(next);
                            touchProcessed.current = true;
                        }
                    }
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            // Cancel hold timer on touch end
            if (holdDownTimerRef.current) {
                clearTimeout(holdDownTimerRef.current);
                holdDownTimerRef.current = null;
            }

            if (!isTouchActive.current) return;

            const deltaX = e.changedTouches[0].clientX - touchStartX.current;
            const deltaY = e.changedTouches[0].clientY - touchStartY.current;
            const elapsed = Date.now() - touchStartTime.current;
            const inControlZone = isInControlZone(touchStartY.current);
            const inLeftZone = isLeftHalf(touchStartX.current);
            const inRightZone = isRightHalf(touchStartX.current);

            // Handle INVENTORY close with NEW swipe down
            if (statusRef.current === GameStatus.INVENTORY) {
                if (!inventoryOpenedThisTouch.current && deltaY > SWIPE_DOWN_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
                    closeInventory();
                }
                isTouchActive.current = false;
                touchProcessed.current = false;
                return;
            }

            if (statusRef.current !== GameStatus.PLAYING) {
                isTouchActive.current = false;
                touchProcessed.current = false;
                return;
            }

            // LEFT ZONE: Tap to shoot
            if (inControlZone && inLeftZone && !touchProcessed.current) {
                const isTap = elapsed < 300 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30;
                if (isTap) {
                    triggerShoot();
                    touchProcessed.current = true;
                }
            }

            // RIGHT ZONE: Swipe up for jump
            if (inControlZone && inRightZone && !touchProcessed.current && elapsed < MAX_SWIPE_TIME) {
                if (Math.abs(deltaY) > SWIPE_THRESHOLD_Y && deltaY < 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
                    triggerJump();
                }
            }

            isTouchActive.current = false;
            touchProcessed.current = false;
        };

        const handleTouchCancel = () => {
            if (holdDownTimerRef.current) {
                clearTimeout(holdDownTimerRef.current);
                holdDownTimerRef.current = null;
            }
            isTouchActive.current = false;
            touchProcessed.current = false;
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('touchcancel', handleTouchCancel);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchCancel);
        };
    }, [setPlayerLane, openInventory, closeInventory]);

    // --- Animation loop ---
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (isDevMode) return; // Pause player animation when dev console is open
        if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP && status !== GameStatus.COUNTDOWN) return;

        try {
            // 1. Horizontal spring physics with velocity clamping
            // Adaptive lateral speed: scales with game speed (10% extra per speed unit above base)
            const speedRatio = 1 + (Math.max(0, speed - RUN_SPEED_BASE) * 0.1);
            const adaptiveStiffness = SPRING_STIFFNESS * speedRatio;
            const adaptiveDamping = SPRING_DAMPING * speedRatio;
            const adaptiveMaxVelocity = MAX_LATERAL_VELOCITY * speedRatio;

            targetX.current = lane * LANE_WIDTH;
            const currentX = groupRef.current.position.x;
            const displacement = targetX.current - currentX;
            const acceleration = (adaptiveStiffness * displacement) - (adaptiveDamping * velocityX.current);
            velocityX.current += acceleration * delta;
            // Clamp velocity to prevent jerky overshooting
            velocityX.current = THREE.MathUtils.clamp(velocityX.current, -adaptiveMaxVelocity, adaptiveMaxVelocity);
            groupRef.current.position.x += velocityX.current * delta;

            // 2. Vertical jump physics
            if (status === GameStatus.PLAYING) {
                if (isJumping.current) {
                    groupRef.current.position.y += velocityY.current * delta;
                    velocityY.current -= GRAVITY * delta;

                    if (groupRef.current.position.y <= 0) {
                        groupRef.current.position.y = 0;
                        isJumping.current = false;
                        jumpsPerformed.current = 0;
                        velocityY.current = 0;
                        if (bodyRef.current) bodyRef.current.rotation.x = 0;
                    }

                    if (jumpsPerformed.current === 2 && bodyRef.current) {
                        spinRotation.current -= delta * 15;
                        if (spinRotation.current < -Math.PI * 2) spinRotation.current = -Math.PI * 2;
                        bodyRef.current.rotation.x = spinRotation.current;
                    }
                }
                // Update playerY in store for FPS camera
                setPlayerY(groupRef.current.position.y);
            } else if (status === GameStatus.COUNTDOWN) {
                groupRef.current.position.y = 0;
                setPlayerY(0);
            }

            const bankingTilt = THREE.MathUtils.clamp(-velocityX.current * 0.05, -0.6, 0.6);
            groupRef.current.rotation.z = 0;

            // 3. Animation
            const isRunning = status === GameStatus.PLAYING;
            const speedMultiplier = speed / 18.0;
            const baseAnimSpeed = isRunning ? 20 : 3;
            const targetAnimSpeed = baseAnimSpeed * Math.max(0.5, Math.min(2.0, speedMultiplier));
            animTime.current += delta * targetAnimSpeed;
            const time = animTime.current;

            // Animation refs for utility functions
            const animRefs: AnimationRefs = {
                bodyRef, headRef, tailRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef, shadowRef
            };

            // Tail animation
            if (tailRef.current) {
                updateTailAnimation(tailRef.current, time, isJumping.current, isRunning);
            }

            // Body animation
            if (!isJumping.current) {
                if (isRunning) {
                    updateRunningAnimation(animRefs, time, speedMultiplier, bankingTilt, delta);
                } else {
                    updateIdleAnimation(animRefs, time, bankingTilt, delta);
                }
            } else {
                updateJumpingAnimation(animRefs, velocityY.current, jumpsPerformed.current, delta);
            }

            // Shadow
            if (shadowRef.current && groupRef.current) {
                updateShadow(shadowRef.current, groupRef.current.position.y, time, isJumping.current, speedMultiplier);
            }

            // Invincibility effect
            const showFlicker = isInvincible.current || isImmortalityActive;
            if (showFlicker) {
                if (isInvincible.current) {
                    if (Date.now() - lastDamageTime.current > INVINCIBILITY_DURATION) {
                        isInvincible.current = false;
                        groupRef.current.visible = true;
                    } else {
                        groupRef.current.visible = Math.floor(Date.now() / 50) % 2 === 0;
                    }
                }
                if (isImmortalityActive) {
                    groupRef.current.visible = true;
                }
            } else {
                groupRef.current.visible = true;
            }
        } catch (error) {
            console.error('[Player] Error in animation loop:', error);
        }
    });

    // Active material based on state
    const currentFurMat = isImmortalityActive ? invincibilityMaterial : furMaterial;

    // Model refs
    const modelRefs: PlayerModelRefs = {
        bodyRef, headRef, tailRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef, shadowRef
    };

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <PlayerModel
                refs={modelRefs}
                furMaterial={currentFurMat}
                pinkMaterial={pinkMaterial}
                eyeMaterial={eyeMaterial}
                shadowMaterial={shadowMaterial}
                whiskerMaterial={whiskerMaterial}
                isFirstPersonMode={isFirstPersonMode}
            />
        </group>
    );
};

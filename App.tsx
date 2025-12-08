












/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { DevConsole } from './components/UI/DevConsole';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './store';
import { Preloader, Level1PreloadScreen } from './components/World/Preloader';
import { audio } from './components/System/Audio';
import { mobileUtils } from './components/System/MobileUtils';
import {
    LANE_WIDTH,
    CAMERA_HEIGHT_FACTOR_MOBILE,
    CAMERA_HEIGHT_FACTOR_DESKTOP,
    CAMERA_DIST_FACTOR_MOBILE,
    CAMERA_DIST_FACTOR_DESKTOP,
    CAMERA_BASE_Y,
    CAMERA_BASE_Z,
    CAMERA_LOOK_Y,
    GameStatus,
    getLaneBounds
} from './types';

// Dynamic Camera Controller with orientation/resize handling and first-person mode
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount, playerLane, playerY, isFirstPersonMode } = useStore();
  const lastAspect = useRef(size.width / size.height);
  const orientationChangeTime = useRef(0);

  // Reusable temp objects to avoid GC pressure in useFrame
  const tempVec3 = useRef(new THREE.Vector3());
  const tempVec3_2 = useRef(new THREE.Vector3());
  const tempQuat = useRef(new THREE.Quaternion());
  const tempMatrix = useRef(new THREE.Matrix4());
  const upVector = useRef(new THREE.Vector3(0, 1, 0));

  // Handle orientation change - force immediate camera update
  useEffect(() => {
    const handleOrientationChange = () => {
      orientationChangeTime.current = Date.now();
    };

    const handleResize = () => {
      // On resize, trigger a recalculation
      orientationChangeTime.current = Date.now();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    // Also handle screen.orientation API for modern browsers
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  useFrame((state, delta) => {
    // First-person mode - camera follows player Y position (jumps)
    if (isFirstPersonMode) {
      const playerX = playerLane * LANE_WIDTH;
      const eyeHeight = 1.7; // Eye level height

      // Reuse temp vectors instead of creating new ones
      const targetPos = tempVec3.current.set(playerX, playerY + eyeHeight, -1);
      const lookTarget = tempVec3_2.current.set(playerX, playerY + 1.5, -56);

      // Instant Y follow for responsive jumping, smooth X for lane changes
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPos.x, delta * 12.0);
      camera.position.y = targetPos.y; // Instant Y follow for responsive jumps
      camera.position.z = -1;

      // Calculate look direction and apply using reusable objects
      tempMatrix.current.lookAt(camera.position, lookTarget, upVector.current);
      tempQuat.current.setFromRotationMatrix(tempMatrix.current);
      camera.quaternion.slerp(tempQuat.current, delta * 15.0);

      return;
    }

    // Normal third-person mode
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2;

    // Detect significant aspect ratio change (orientation change)
    const aspectChanged = Math.abs(aspect - lastAspect.current) > 0.1;
    const recentOrientationChange = Date.now() - orientationChangeTime.current < 500;

    // Use faster lerp during orientation transition
    const lerpSpeed = (aspectChanged || recentOrientationChange) ? 8.0 : 2.0;

    // Update last aspect ratio
    lastAspect.current = aspect;

    // Calculate expansion factors
    const heightFactor = isMobile ? CAMERA_HEIGHT_FACTOR_MOBILE : CAMERA_HEIGHT_FACTOR_DESKTOP;
    const distFactor = isMobile ? CAMERA_DIST_FACTOR_MOBILE : CAMERA_DIST_FACTOR_DESKTOP;

    // Base (3 lanes): y=5.5, z=8
    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = CAMERA_BASE_Y + (extraLanes * heightFactor);
    const targetZ = CAMERA_BASE_Z + (extraLanes * distFactor);

    // Center camera on the playable lane area (handles asymmetric/even lane counts)
    const { min: minLane, max: maxLane } = getLaneBounds(laneCount);
    const centerOffset = (minLane + maxLane) * LANE_WIDTH / 2;

    // Reuse temp vector for target position
    const targetPos = tempVec3.current.set(centerOffset, targetY, targetZ);

    // Smoothly interpolate camera position (faster during orientation change)
    camera.position.lerp(targetPos, delta * lerpSpeed);

    // LOOK TARGET ADJUSTMENT:
    // CAMERA_LOOK_Y ensures the player (at Y=0) is positioned slightly below center,
    // visually appearing "immediately above" the bottom control panel.
    camera.lookAt(centerOffset, CAMERA_LOOK_Y, -30);
  });

  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

// Game flow states - simplified for single Level 1 preloader
type PreloadPhase = 'idle' | 'preloading' | 'ready';

// Event name for triggering preload from dev console
export const DEV_START_PRELOAD_EVENT = 'dev-start-preload';

const LEVEL1_PRELOAD_TIME = 3; // 3 seconds countdown for Level 1

// Detect if device is likely mobile (for performance optimizations)
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  const aspect = window.innerWidth / window.innerHeight;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 768;
  return (aspect < 1.2 && isTouchDevice) || isSmallScreen;
};

function App() {
  const { status, startGame, isDevMode, toggleDevMode, toggleFirstPersonMode, isFirstPersonMode } = useStore();

  // Detect mobile for performance optimizations
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  // Update mobile detection on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global dev mode toggle - works on ANY screen/state
  // N key toggles first-person camera mode (desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        toggleDevMode();
      }
      // N key for first-person mode toggle (only on desktop)
      if ((e.key === 'n' || e.key === 'N') && !isMobile) {
        toggleFirstPersonMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDevMode, toggleFirstPersonMode, isMobile]);

  // Preload flow state - simplified for single Level 1 screen
  const [preloadPhase, setPreloadPhase] = useState<PreloadPhase>('idle');
  const [assetsReady, setAssetsReady] = useState(false);
  const [preloadCountdown, setPreloadCountdown] = useState(LEVEL1_PRELOAD_TIME);
  const countdownRef = useRef(LEVEL1_PRELOAD_TIME);

  // Track when assets are compiled
  const handleLoaded = useCallback(() => {
    setAssetsReady(true);
  }, []);

  // Handle START RUN from menu - show Level 1 preloader and start countdown
  const handleStartRunFromMenu = useCallback(() => {
    setPreloadPhase('preloading');
    countdownRef.current = LEVEL1_PRELOAD_TIME;
    setPreloadCountdown(LEVEL1_PRELOAD_TIME);
  }, []);

  // Listen for dev console preload trigger
  useEffect(() => {
    const handleDevPreload = () => {
      setPreloadPhase('preloading');
      countdownRef.current = LEVEL1_PRELOAD_TIME;
      setPreloadCountdown(LEVEL1_PRELOAD_TIME);
    };

    window.addEventListener(DEV_START_PRELOAD_EVENT, handleDevPreload);
    return () => window.removeEventListener(DEV_START_PRELOAD_EVENT, handleDevPreload);
  }, []);

  // Track previous status to detect when we RETURN to menu (not when already in menu)
  const prevStatusRef = useRef(status);

  // Reset preload phase when returning to MENU (e.g., after quitToMenu)
  // NOTE: Do NOT reset assetsReady - assets stay compiled in GPU memory
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    // Only reset if we RETURNED to menu from another state (not already in menu)
    if (status === GameStatus.MENU && prevStatus !== GameStatus.MENU && preloadPhase !== 'idle') {
      setPreloadPhase('idle');
      // Keep assetsReady = true since Preloader only runs once
      countdownRef.current = LEVEL1_PRELOAD_TIME;
      setPreloadCountdown(LEVEL1_PRELOAD_TIME);
    }
  }, [status, preloadPhase]);

  // Level 1 preload countdown timer
  useEffect(() => {
    if (preloadPhase !== 'preloading') {
      return;
    }

    const interval = setInterval(() => {
      countdownRef.current -= 1;
      setPreloadCountdown(countdownRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [preloadPhase]);

  // Handle START RUN from Level 1 preloader - actually start the game
  const handleStartGame = useCallback(async () => {
    // Setup mobile experience (fullscreen, wake lock, auto orientation)
    if (isMobile) {
      // Use 'auto' to allow both portrait and landscape
      await mobileUtils.setupMobileExperience('auto');
    }
    setPreloadPhase('ready');
    audio.startMusic();
    startGame();
  }, [startGame, isMobile]);

  // Prevent scrolling, bouncing, and zooming on mobile
  useEffect(() => {
      const preventDefault = (e: Event) => e.preventDefault();

      // Prevent scroll/bounce
      document.body.addEventListener('touchmove', preventDefault, { passive: false });

      // Prevent pinch-to-zoom (Safari gesture events)
      document.addEventListener('gesturestart', preventDefault, { passive: false });
      document.addEventListener('gesturechange', preventDefault, { passive: false });
      document.addEventListener('gestureend', preventDefault, { passive: false });

      // Prevent double-tap zoom by tracking tap timing
      let lastTouchEnd = 0;
      const preventDoubleTapZoom = (e: TouchEvent) => {
          const now = Date.now();
          if (now - lastTouchEnd <= 300) {
              e.preventDefault();
          }
          lastTouchEnd = now;
      };
      document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

      // Prevent multi-touch zoom (pinch with 2+ fingers)
      const preventMultiTouchZoom = (e: TouchEvent) => {
          if (e.touches.length > 1) {
              e.preventDefault();
          }
      };
      document.addEventListener('touchstart', preventMultiTouchZoom, { passive: false });

      return () => {
          document.body.removeEventListener('touchmove', preventDefault);
          document.removeEventListener('gesturestart', preventDefault);
          document.removeEventListener('gesturechange', preventDefault);
          document.removeEventListener('gestureend', preventDefault);
          document.removeEventListener('touchend', preventDoubleTapZoom);
          document.removeEventListener('touchstart', preventMultiTouchZoom);
      };
  }, []);

  // Determine visibility states
  const showLevel1Preloader = preloadPhase === 'preloading';
  const gameStarted = preloadPhase === 'ready';
  // Show scene on menu, preloader, and game so player can see the game world behind
  const showScene = preloadPhase === 'idle' || showLevel1Preloader || gameStarted;
  // Hide menu when Level 1 preloader is visible
  const hideMenu = showLevel1Preloader;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none touch-none overscroll-none">
        {/* Canvas first - so UI layers render on top */}
        <Canvas
          shadows={!isMobile}
          dpr={isMobile ? [1, 1] : [1, 1.5]}
          gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 5.5, 8], fov: 60 }}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        >
          <CameraController />
          {/* Preloader compiles all geometries and materials */}
          <Preloader onLoaded={handleLoaded} />
          <Suspense fallback={null}>
              {showScene && <Scene />}
          </Suspense>
        </Canvas>

        {/* Level 1 preloader - shows controls (Level 2+ uses HUD's LEVEL_PRELOAD) */}
        {showLevel1Preloader && (
          <Level1PreloadScreen
            visible={true}
            ready={assetsReady}
            countdown={preloadCountdown}
            onStart={handleStartGame}
          />
        )}

        {/* HUD - passes onStartRun to menu, hideMenu hides the menu */}
        <HUD onStartRun={handleStartRunFromMenu} hideMenu={hideMenu} />

        {/* Dev Console - always available on top of everything */}
        {isDevMode && <DevConsole />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
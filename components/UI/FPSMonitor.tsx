/**
 * FPS Monitor component for dev mode
 * Shows real-time FPS, frame time, and memory usage
 */

import React, { useEffect, useRef, useState } from 'react';

interface FPSData {
  fps: number;
  frameTime: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  memory?: number; // MB
}

export const FPSMonitor: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const [data, setData] = useState<FPSData>({
    fps: 0,
    frameTime: 0,
    avgFps: 0,
    minFps: 999,
    maxFps: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!visible) return;

    let lastFrameTime = performance.now();
    const fpsHistory: number[] = [];
    const maxHistoryLength = 60; // Keep last 60 samples for averaging

    const updateFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTime;
      lastFrameTime = now;
      frameCountRef.current++;

      // Calculate FPS
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 500) { // Update display every 500ms
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        const frameTime = delta;

        // Update history
        fpsHistory.push(fps);
        if (fpsHistory.length > maxHistoryLength) {
          fpsHistory.shift();
        }

        // Calculate stats
        const avgFps = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);
        const minFps = Math.min(...fpsHistory);
        const maxFps = Math.max(...fpsHistory);

        // Get memory usage if available (Chrome only)
        let memory: number | undefined;
        if ((performance as any).memory) {
          memory = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
        }

        setData({
          fps,
          frameTime: Math.round(frameTime * 10) / 10,
          avgFps,
          minFps: minFps === 999 ? fps : minFps,
          maxFps: maxFps === 0 ? fps : maxFps,
          memory
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameIdRef.current = requestAnimationFrame(updateFPS);
    };

    frameIdRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [visible]);

  if (!visible) return null;

  // Color coding for FPS
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-black/70 rounded px-1.5 py-0.5 font-mono text-[9px] border border-white/20 flex items-center gap-1">
      <span className={`font-bold ${getFPSColor(data.fps)}`}>{data.fps}</span>
      <span className="text-gray-500">fps</span>
      <span className="text-gray-600">|</span>
      <span className="text-gray-500">{data.avgFps}avg</span>
      <span className={getFPSColor(data.minFps)}>{data.minFps}</span>
      <span className="text-gray-600">-</span>
      <span className="text-green-300">{data.maxFps}</span>
      {data.memory !== undefined && (
        <>
          <span className="text-gray-600">|</span>
          <span className="text-cyan-300">{data.memory}M</span>
        </>
      )}
    </div>
  );
};

/**
 * Compact FPS counter (just shows FPS number)
 */
export const FPSCounter: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!visible) return;

    const updateFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameIdRef.current = requestAnimationFrame(updateFPS);
    };

    frameIdRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [visible]);

  if (!visible) return null;

  const color = fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="fixed top-2 left-2 z-[100] pointer-events-none">
      <div className={`${color} rounded px-2 py-0.5 font-mono text-xs font-bold text-black`}>
        {fps} FPS
      </div>
    </div>
  );
};

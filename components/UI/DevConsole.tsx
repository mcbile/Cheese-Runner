
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { GameStatus, PowerUpType } from '../../types';
import { FPSMonitor } from './FPSMonitor';
import { DEV_START_PRELOAD_EVENT } from '../../App';

// Crown icon SVG component
const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17l2-9 4 4 4-8 4 8 4-4 2 9z" />
        <path d="M2 17h20v4H2z" />
        <circle cx="12" cy="5" r="1" fill="currentColor" />
    </svg>
);

// Lock icon for password screen
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

// Password prompt component
const DevPasswordPrompt: React.FC = () => {
    const { authenticateDev, toggleDevMode } = useStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (authenticateDev(password)) {
            setError(false);
        } else {
            setError(true);
            setShake(true);
            setPassword('');
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleClose = () => {
        toggleDevMode();
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm pointer-events-auto">
            <div className={`relative w-full max-w-sm bg-[#0F172A] rounded-2xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white p-6 ${shake ? 'animate-shake' : ''}`}>
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-900/50 hover:bg-red-800 rounded-lg flex items-center justify-center text-white border border-white/20 transition-all"
                >
                    ✕
                </button>

                {/* Lock icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/50">
                        <LockIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-white text-center mb-2 tracking-wider">ROYAL ACCESS</h2>
                <p className="text-gray-400 text-center text-sm mb-4">Enter password to unlock dev console</p>

                {/* Password form */}
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="Password"
                        autoFocus
                        className={`w-full bg-gray-800 text-white text-center rounded-xl px-4 py-3 text-lg font-mono border-2 ${error ? 'border-red-500' : 'border-white/20'} focus:border-yellow-500 focus:outline-none transition-colors`}
                    />
                    {error && (
                        <p className="text-red-400 text-center text-sm mt-2">Wrong password</p>
                    )}
                    <button
                        type="submit"
                        className="w-full mt-4 bg-[#FF6B00] hover:bg-[#FF8C00] text-white py-3 rounded-xl font-black tracking-wider border-2 border-white transition-all"
                    >
                        UNLOCK
                    </button>
                </form>
            </div>

            {/* Shake animation style */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export const DevConsole: React.FC = () => {
    const { isDevAuthenticated, isGodMode, debugAddBalance, debugAddScore, debugAddLife, debugSetStatus, debugSpawnBoss, debugSpawnEnemies, debugSpawnPortal, debugStartGame, debugApplyToCurrentGame, toggleDevMode, setGodMode, level, speed, status, openShop, collectPowerUp } = useStore();

    const [targetLevel, setTargetLevel] = useState(level);
    const [godModePending, setGodModePending] = useState(isGodMode);
    const [forceBossPending, setForceBossPending] = useState(false);
    const [spawnEnemiesPending, setSpawnEnemiesPending] = useState(false);
    const [spawnPortalPending, setSpawnPortalPending] = useState(false);
    const [targetSpeed, setTargetSpeed] = useState(speed || 15);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => { setTargetLevel(level); }, [level]);
    useEffect(() => { setGodModePending(isGodMode); }, [isGodMode]);
    useEffect(() => { if (speed > 0) setTargetSpeed(speed); }, [speed]);

    // Show password prompt if not authenticated
    if (!isDevAuthenticated) {
        return <DevPasswordPrompt />;
    }

    // Check if game is actively running (PLAYING or COUNTDOWN)
    const isGameRunning = status === GameStatus.PLAYING || status === GameStatus.COUNTDOWN;

    const handleApply = () => {
        if (isGameRunning) {
            // Apply changes to current game without resetting
            debugApplyToCurrentGame(targetSpeed, godModePending);
        } else {
            // Start new game with selected parameters
            debugStartGame(targetLevel, targetSpeed, godModePending);
        }

        // Apply special spawns (works in both cases)
        if (forceBossPending || spawnEnemiesPending || spawnPortalPending) {
            setTimeout(() => {
                if (forceBossPending) {
                    debugSpawnBoss();
                    setForceBossPending(false);
                }
                if (spawnEnemiesPending) {
                    debugSpawnEnemies();
                    setSpawnEnemiesPending(false);
                }
                if (spawnPortalPending) {
                    debugSpawnPortal();
                    setSpawnPortalPending(false);
                }
            }, 100);
        }
    };

    // Collapsed banner at bottom
    if (isCollapsed) {
        return (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-[#0F172A] border-4 border-white px-4 py-2 rounded-xl font-mono text-xs text-green-400 pointer-events-auto shadow-[0_0_50px_rgba(33,70,139,0.5)] flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <CrownIcon className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-white">Royal</span>
                </div>
                <FPSMonitor visible={true} />
                <div className="h-4 w-px bg-white/30" />
                <button onClick={() => setIsCollapsed(false)} className="px-3 py-1 bg-[#1E4785] hover:bg-[#2B5BA7] rounded border border-white/20 font-bold transition-colors text-white">EXPAND</button>
                <button onClick={handleApply} className="px-3 py-1 bg-[#FF6B00] hover:bg-[#FF8C00] rounded border-2 border-white font-bold transition-colors text-white">APPLY</button>
                <button onClick={toggleDevMode} className="text-white hover:text-red-400 font-bold ml-1">✕</button>
            </div>
        );
    }

    // Full panel - styled like MenuScreen
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-start z-[100] bg-black/20 backdrop-blur-[1px] px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 pointer-events-auto">
            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white animate-in zoom-in-95 duration-500 flex flex-col items-center py-4 px-5 shrink overflow-y-auto">

                {/* Row 1: Header - Royal + collapse + close */}
                <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-white/20">
                    <div className="flex items-center gap-2">
                        <CrownIcon className="w-6 h-6 text-yellow-500" />
                        <span className="text-xl font-black text-white tracking-wider">ROYAL MODE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsCollapsed(true)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white border border-white/20 transition-all">_</button>
                        <button onClick={toggleDevMode} className="w-8 h-8 bg-red-900/50 hover:bg-red-800 rounded-lg flex items-center justify-center text-white border border-white/20 transition-all">✕</button>
                    </div>
                </div>

                {/* Row 2: FPS Monitor */}
                <div className="w-full mb-3">
                    <FPSMonitor visible={true} />
                </div>

                <div className="w-full space-y-2 text-sm">
                    {/* Row 3: GOD, BOSS */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                            <span className="text-white font-bold">GOD</span>
                            <button onClick={() => setGodModePending(!godModePending)} className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${godModePending ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-400'}`}>{godModePending ? 'ON' : 'OFF'}</button>
                        </div>
                        <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                            <span className="text-red-400 font-bold">BOSS</span>
                            <button onClick={() => setForceBossPending(!forceBossPending)} className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${forceBossPending ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{forceBossPending ? 'SKIP' : 'OFF'}</button>
                        </div>
                    </div>

                    {/* Row 4: ENEMIES, PORTAL */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                            <span className="text-purple-400 font-bold">ENEMIES</span>
                            <button onClick={() => setSpawnEnemiesPending(!spawnEnemiesPending)} className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${spawnEnemiesPending ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{spawnEnemiesPending ? 'YES' : 'OFF'}</button>
                        </div>
                        <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                            <span className="text-yellow-400 font-bold">PORTAL</span>
                            <button onClick={() => setSpawnPortalPending(!spawnPortalPending)} className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${spawnPortalPending ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{spawnPortalPending ? 'YES' : 'OFF'}</button>
                        </div>
                    </div>

                    {/* Row 5: LVL */}
                    <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                        <span className="text-white font-bold">LVL</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setTargetLevel(l => Math.max(1, l - 1))} className="w-8 h-8 bg-gray-700 hover:bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">-</button>
                            <span className="font-black text-white text-lg w-6 text-center">{targetLevel}</span>
                            <button onClick={() => setTargetLevel(l => Math.min(5, l + 1))} className="w-8 h-8 bg-gray-700 hover:bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">+</button>
                        </div>
                    </div>

                    {/* Row 6: SPD */}
                    <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                        <span className="text-cyan-400 font-bold">SPD</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setTargetSpeed(s => Math.max(5, s - 5))} className="w-8 h-8 bg-gray-700 hover:bg-white/20 rounded-lg flex items-center justify-center text-white text-xs font-bold">-5</button>
                            <input
                                type="number"
                                id="dev-speed-input"
                                name="dev-speed"
                                autoComplete="off"
                                value={Math.round(targetSpeed)}
                                onChange={(e) => setTargetSpeed(Math.max(5, Math.min(999, Math.round(parseFloat(e.target.value)) || 5)))}
                                className="w-16 bg-gray-800 text-white text-center rounded-lg px-2 py-1 text-sm font-bold border border-white/20"
                                min="5"
                                max="999"
                                step="5"
                            />
                            <button onClick={() => setTargetSpeed(s => Math.min(999, s + 5))} className="w-8 h-8 bg-gray-700 hover:bg-white/20 rounded-lg flex items-center justify-center text-white text-xs font-bold">+5</button>
                        </div>
                    </div>

                    {/* Row 7: +€, +Pts */}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => debugAddBalance(100)} className="bg-green-900/50 border border-green-500/50 text-green-300 px-3 py-2 rounded-xl hover:bg-green-800 font-bold text-center transition-all">+€100</button>
                        <button onClick={() => debugAddScore(20000)} className="bg-amber-900/50 border border-amber-500/50 text-amber-300 px-3 py-2 rounded-xl hover:bg-amber-800 font-bold text-center transition-all">+20K Pts</button>
                    </div>

                    {/* Row 8: PowerUps 1+2 */}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => collectPowerUp(PowerUpType.FIREWALL)} className="bg-orange-900/40 border border-orange-500/30 px-3 py-2 rounded-xl hover:bg-orange-800 text-orange-200 font-bold text-center transition-all">🔥 Fire</button>
                        <button onClick={() => collectPowerUp(PowerUpType.SPEED_BOOST)} className="bg-yellow-900/40 border border-yellow-500/30 px-3 py-2 rounded-xl hover:bg-yellow-800 text-yellow-200 font-bold text-center transition-all">⚡ Speed</button>
                    </div>

                    {/* Row 9: +1 Life + Slow */}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={debugAddLife} className="bg-pink-900/40 border border-pink-500/30 px-3 py-2 rounded-xl hover:bg-pink-800 text-pink-200 font-bold text-center transition-all">❤️ +1 Life</button>
                        <button onClick={() => collectPowerUp(PowerUpType.SLOW_MOTION)} className="bg-blue-900/40 border border-blue-500/30 px-3 py-2 rounded-xl hover:bg-blue-800 text-blue-200 font-bold text-center transition-all">🐢 Slow</button>
                    </div>

                    {/* Row 10: WIN, LVL+, LOSE */}
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => { debugSetStatus(GameStatus.VICTORY); setIsCollapsed(true); }} className="bg-white/10 border border-white/20 text-white px-2 py-2 rounded-xl hover:bg-white/20 font-bold text-center transition-all">WIN</button>
                        <button onClick={() => { debugSetStatus(GameStatus.LEVEL_COMPLETE); setIsCollapsed(true); }} className="bg-white/10 border border-white/20 text-white px-2 py-2 rounded-xl hover:bg-white/20 font-bold text-center transition-all">LVL+</button>
                        <button onClick={() => { debugSetStatus(GameStatus.GAME_OVER); setIsCollapsed(true); }} className="bg-white/10 border border-white/20 text-white px-2 py-2 rounded-xl hover:bg-white/20 font-bold text-center transition-all">LOSE</button>
                    </div>

                    {/* Row 11: PRE1, PRE2+ */}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { window.dispatchEvent(new CustomEvent(DEV_START_PRELOAD_EVENT)); setIsCollapsed(true); }} className="bg-white/10 border border-white/20 text-white px-2 py-2 rounded-xl hover:bg-white/20 font-bold text-center transition-all">PRE1</button>
                        <button onClick={() => { debugSetStatus(GameStatus.LEVEL_PRELOAD); setIsCollapsed(true); }} className="bg-white/10 border border-white/20 text-white px-2 py-2 rounded-xl hover:bg-white/20 font-bold text-center transition-all">PRE2+</button>
                    </div>

                    {/* Row 12: SHOP, APPLY */}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { openShop(); setIsCollapsed(true); }} className="bg-[#1E4785] text-white px-3 py-3 rounded-xl font-black tracking-wider hover:bg-[#2B5BA7] border-2 border-white transition-all">SHOP</button>
                        <button onClick={handleApply} className="bg-[#FF6B00] text-white px-3 py-3 rounded-xl font-black tracking-wider hover:bg-[#FF8C00] border-2 border-white transition-all">APPLY</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Briefcase, Heart, Play } from 'lucide-react';
import { useStore } from '../../store';
import { RAW_SHOP_ITEMS } from './shopData';

const USE_COOLDOWN_MS = 330;
const AUTO_CLOSE_DURATION = 15000;

export const InventoryScreen: React.FC = () => {
    const { closeInventory, inventory, consumeItem, lives, maxLives, isSlowMotionActive, isCheeseFeverActive } = useStore();
    const isEmpty = Object.keys(inventory).length === 0;

    // Check if an item is disabled (either health full for heal, or effect already active)
    const isItemDisabled = useMemo(() => (id: string): boolean => {
        if (id === 'FULL_HEAL' && lives >= maxLives) return true;
        if (id === 'SLOW_MOTION' && isSlowMotionActive) return true;
        if (id === 'CHEESE_FEVER' && isCheeseFeverActive) return true;
        return false;
    }, [lives, maxLives, isSlowMotionActive, isCheeseFeverActive]);

    const [progress, setProgress] = useState(100);
    const lastUseTimeRef = useRef<number>(0);

    /** Use item with cooldown protection */
    const handleUseItem = useCallback((id: string) => {
        const now = Date.now();
        if (now - lastUseTimeRef.current < USE_COOLDOWN_MS) {
            return; // Still in cooldown
        }
        lastUseTimeRef.current = now;
        consumeItem(id);
    }, [consumeItem]);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, AUTO_CLOSE_DURATION - elapsed);
            const pct = (remaining / AUTO_CLOSE_DURATION) * 100;
            setProgress(pct);
            if (remaining <= 0) {
                closeInventory();
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [closeInventory]);

    return (
        <div className="absolute inset-0 bg-blue-900/60 z-[120] text-white pointer-events-auto backdrop-blur-sm flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4">
            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-4 px-5 overflow-y-auto">
                {/* Header */}
                <h1 className="text-[30px] font-black mb-3 font-cyber text-center leading-tight tracking-wider shrink-0">
                    <span className="text-emerald-400">BACK</span> <span className="text-white">PACK</span>
                </h1>

                {/* Lives indicator */}
                <div className="flex gap-3 text-center mb-3 w-full shrink-0">
                    <div className="flex-1 bg-white/10 p-3 rounded-xl border-2 border-red-500/50 shadow-inner flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                            <span className="text-[30px] font-black text-red-400 drop-shadow-sm">{lives}/{maxLives}</span>
                        </div>
                        <div className="text-xs text-gray-300 tracking-wider uppercase font-bold">Lives</div>
                    </div>
                </div>

                {/* Items list */}
                <div className="w-full rounded-xl border border-white/10 p-3 mb-4 bg-black/40 flex-1 overflow-y-auto">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <Briefcase className="w-12 h-12 text-gray-600 mb-2" />
                            <div className="text-gray-400 font-mono text-sm">Your backpack is empty.<br/>Visit the Shop to buy items!</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(inventory).map(([id, count]) => {
                                const itemDef = RAW_SHOP_ITEMS.find(i => i.id === id);
                                if (!itemDef) return null;
                                const Icon = itemDef.icon;
                                const disabled = isItemDisabled(id);
                                return (
                                    <div key={id} className={`bg-white/10 rounded-xl p-3 flex flex-col items-center border border-white/5 ${disabled ? 'opacity-50' : ''}`}>
                                        <div className="bg-black/40 p-2 rounded-lg text-white border border-white/5 mb-2">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="font-bold text-white text-sm text-center leading-tight mb-1">{itemDef.name}</div>
                                        <div className="text-xs text-emerald-400 font-mono font-bold mb-2">x{count}</div>
                                        <button
                                            onClick={() => !disabled && handleUseItem(id)}
                                            disabled={disabled}
                                            className={`w-full py-2 font-bold rounded-lg text-xs tracking-wider shadow-lg transition-all ${
                                                disabled
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-500 text-white active:scale-95'
                                            }`}
                                        >
                                            {disabled ? (id === 'FULL_HEAL' ? 'FULL' : 'ACTIVE') : 'USE'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Timer bar */}
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4 shrink-0">
                    <div className="h-full bg-emerald-400 transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
                </div>

                {/* Close button */}
                <div className="flex flex-col gap-2 w-full shrink-0">
                    <button
                        onClick={closeInventory}
                        className="w-full py-3.5 text-xl rounded-xl bg-[#AE1C28] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#D32F2F] active:scale-95 transition-all flex items-center justify-center"
                    >
                        <Play className="mr-2 w-6 h-6 fill-current" /> CONTINUE
                    </button>
                </div>
            </div>

            <div className="w-full shrink basis-4 min-h-4" />
        </div>
    );
};


import React, { useState } from 'react';
import { Info, ChevronLeft, Home, Play, X, AlertTriangle, LucideIcon } from 'lucide-react';
import { useStore } from '../../store';
import { ShopItem } from '../../types';
import { audio } from '../System/Audio';
import { CONSUMABLES, UPGRADES } from './shopData';

// Card color configs matching AboutScreen style
const CARD_COLORS: Record<string, { border: string; text: string; icon: string }> = {
    'FULL_HEAL': { border: 'border-red-500/40', text: 'text-red-400', icon: 'text-red-400' },
    'MAX_LIFE': { border: 'border-rose-500/40', text: 'text-rose-400', icon: 'text-rose-400' },
    'SLOW_MOTION': { border: 'border-blue-500/40', text: 'text-blue-400', icon: 'text-blue-400' },
    'CHEESE_FEVER': { border: 'border-orange-500/40', text: 'text-orange-400', icon: 'text-orange-400' },
    'ENEMY_RUSH': { border: 'border-purple-500/40', text: 'text-purple-400', icon: 'text-purple-400' },
    'INSTANT_CHEESE': { border: 'border-yellow-500/40', text: 'text-yellow-400', icon: 'text-yellow-400' },
};

// Shop items in specific order for grid layout
// Row 1: HEAL POTION (1000 pts) + EXTRA LIFE (10x BET)
// Row 2: TIME WARP (2000 pts) + CHEESE MAGIC (20x BET)
// Row 3: ENEMY RUSH (3000 pts) + CHEESE EXCHANGE (30x BET)
const SHOP_ROWS = [
    [CONSUMABLES[0], UPGRADES[0]], // HEAL + EXTRA LIFE
    [CONSUMABLES[1], UPGRADES[1]], // TIME WARP + CHEESE MAGIC
    [CONSUMABLES[2], UPGRADES[2]], // ENEMY RUSH + CHEESE EXCHANGE
];

interface ShopCardProps {
    item: ShopItem;
    onBuy: () => void;
    canAfford: boolean;
    isFlipped: boolean;
    onFlip: () => void;
    onClose: () => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ item, onBuy, canAfford, isFlipped, onFlip, onClose }) => {
    const Icon = item.icon as LucideIcon;
    const { betAmount } = useStore();
    const finalCost = item.priceType === 'BET_MULTIPLIER' ? item.cost * betAmount : item.cost;
    const isEuro = item.currency === 'EURO';

    const colors = CARD_COLORS[item.id] || { border: 'border-gray-500/40', text: 'text-gray-400', icon: 'text-gray-400' };
    const containerOpacity = !canAfford ? "opacity-50" : "opacity-100";

    return (
        <div className={`relative w-full h-20 ${containerOpacity}`} style={{ perspective: '1000px' }}>
            <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none'
                }}
            >
                {/* FRONT - AboutScreen style */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <button
                        onClick={() => { if (canAfford) onBuy(); }}
                        disabled={!canAfford}
                        className={`relative w-full h-full bg-white/5 rounded-lg border ${colors.border} p-2 flex items-center gap-2 active:scale-95 transition-transform`}
                    >
                        {item.emoji ? (
                            <span className="text-3xl shrink-0">{item.emoji}</span>
                        ) : (
                            <Icon className={`w-8 h-8 ${colors.icon} shrink-0`} />
                        )}
                        <div className="flex flex-col text-left flex-1">
                            <span className={`font-black ${colors.text} text-sm`}>{item.name}</span>
                            <span className="text-[10px] text-gray-400">{item.description}</span>
                            {isEuro ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-lg font-black text-green-400">€{finalCost.toFixed(2)}</span>
                                    <span className="text-[9px] text-green-400/70">({item.cost}x BET)</span>
                                </div>
                            ) : (
                                <span className="font-mono text-lg font-black text-yellow-400">{finalCost.toLocaleString()} pts</span>
                            )}
                        </div>
                    </button>
                    {/* Info button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onFlip(); }}
                        className="absolute top-1 right-1 p-1 rounded-full z-10 transition-colors text-white/40 hover:text-white hover:bg-white/10"
                    >
                        <Info className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* BACK - Description */}
                <div
                    className={`absolute inset-0 w-full h-full bg-white/5 rounded-lg border ${colors.border} p-2 flex flex-col overflow-hidden`}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    {/* Close X button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="absolute top-1 right-1 p-1 rounded-full z-10 transition-colors text-white/40 hover:text-white hover:bg-white/10"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    {/* Description text */}
                    <p className="text-[10px] leading-tight text-gray-300 pr-5 overflow-hidden">
                        {item.details}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Exit confirmation modal
const ExitConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    return (
        <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[90%] max-w-sm bg-[#0F172A] rounded-2xl border-4 border-white shadow-[0_0_30px_rgba(174,28,40,0.5)] p-5 flex flex-col items-center">
                {/* Warning icon */}
                <div className="w-16 h-16 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-9 h-9 text-red-400" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-red-400 uppercase tracking-wider mb-2">
                    EXIT GAME?
                </h2>

                {/* Warning text */}
                <p className="text-center text-gray-300 text-sm mb-4 leading-relaxed">
                    All your progress will be <span className="text-red-400 font-bold">LOST</span>!
                    <br />
                    Cheese points, earnings, and level progress will not be saved.
                </p>

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#1E4785] text-white border-white hover:bg-[#2B5BA7] active:scale-95"
                    >
                        NO
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center text-sm bg-[#FF6B00] text-white border-white hover:bg-[#FF8C00] active:scale-95"
                    >
                        YES
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ShopScreen: React.FC = () => {
    const { closeShop, startNextLevel, backToStats, quitToMenu, score, balance, buyItem, betAmount } = useStore();
    const [flippedCard, setFlippedCard] = useState<string | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const handleBuy = (item: ShopItem) => {
        const cost = item.priceType === 'BET_MULTIPLIER' ? item.cost * betAmount : item.cost;
        if (buyItem(item.id, cost, item.currency)) {
            audio.playGemCollect();
        }
    };

    const handleRun = () => {
        closeShop();
        startNextLevel();
    };

    const handleBack = () => {
        backToStats();
    };

    const handleHomeClick = () => {
        setShowExitConfirm(true);
    };

    const handleExitConfirm = () => {
        setShowExitConfirm(false);
        quitToMenu();
    };

    const handleExitCancel = () => {
        setShowExitConfirm(false);
    };

    const handleFlip = (itemId: string) => {
        setFlippedCard(itemId);
    };

    const handleCloseFlip = () => {
        setFlippedCard(null);
    };

    return (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-[120] flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 text-white pointer-events-auto">
            <div className="relative w-full max-w-md max-h-full min-h-[340px] bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 bg-black/20 flex items-center justify-center shrink-0">
                    <h1 className="text-xl font-black text-yellow-400 font-cyber tracking-widest uppercase">CHEESE SHOP</h1>
                </div>

                {/* Balance cards - 2 cards above items */}
                <div className="px-4 pt-3 pb-2 shrink-0">
                    <div className="grid grid-cols-2 gap-2">
                        {/* PTS Balance - Yellow */}
                        <div className="bg-gradient-to-r from-yellow-900/40 to-amber-800/30 rounded-lg p-2.5 border-2 border-yellow-500/50 text-center">
                            <div className="text-[10px] text-yellow-300 uppercase font-bold tracking-wider">Cheese Points</div>
                            <div className="text-xl font-black text-yellow-400 font-mono">{score.toLocaleString()}</div>
                        </div>
                        {/* EURO Balance */}
                        <div className="bg-gradient-to-r from-green-900/40 to-emerald-800/30 rounded-lg p-2.5 border-2 border-green-500/50 text-center">
                            <div className="text-[10px] text-green-300 uppercase font-bold tracking-wider">Wallet</div>
                            <div className="text-xl font-black text-green-400 font-mono">€{balance.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* Content - 3 rows x 2 columns grid */}
                <div className="flex-1 px-4 pb-2 overflow-y-auto min-h-0">
                    <div className="flex flex-col gap-1.5">
                        {SHOP_ROWS.map((row, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-2 gap-1.5">
                                {row.map(item => {
                                    const cost = item.priceType === 'BET_MULTIPLIER' ? item.cost * betAmount : item.cost;
                                    const canAfford = item.currency === 'EURO' ? balance >= cost : score >= cost;

                                    return (
                                        <ShopCard
                                            key={item.id}
                                            item={item}
                                            onBuy={() => handleBuy(item)}
                                            canAfford={canAfford}
                                            isFlipped={flippedCard === item.id}
                                            onFlip={() => handleFlip(item.id)}
                                            onClose={handleCloseFlip}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation buttons - Blue (Back to Stats) / White (Home) / Red (Run) */}
                <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-black/20 shrink-0">
                    <button
                        onClick={handleBack}
                        className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#21468B] text-white border-white hover:bg-[#2a5ab0] active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" /> STATS
                    </button>
                    <button
                        onClick={handleHomeClick}
                        className="w-12 shrink-0 py-2.5 rounded-xl bg-white text-[#21468B] font-black border-2 border-[#21468B] hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
                        title="Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleRun}
                        className="flex-1 py-2.5 rounded-xl font-black tracking-wider uppercase border-2 transition-all flex items-center justify-center gap-1 text-sm bg-[#AE1C28] text-white border-white hover:bg-[#D32F2F] active:scale-95"
                    >
                        RUN <Play className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Exit confirmation modal */}
            {showExitConfirm && (
                <ExitConfirmModal
                    onConfirm={handleExitConfirm}
                    onCancel={handleExitCancel}
                />
            )}
        </div>
    );
};

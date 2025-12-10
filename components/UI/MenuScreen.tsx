
import React, { useState, lazy, Suspense } from 'react';
import { Play, BookOpen, ChevronUp, ChevronDown, BarChart } from 'lucide-react';
import { useStore } from '../../store';
import { Difficulty, DIFFICULTY_CONFIG } from '../../types';

// Lazy load AboutScreen (505 lines) - only needed when user clicks "About"
const AboutScreen = lazy(() => import('./AboutScreen').then(m => ({ default: m.AboutScreen })));

const BUTTON_TEXT_GLOW = { textShadow: "0px 0px 4px rgba(255,255,255,0.5)" };

export const BetControl: React.FC = () => {
    const { betAmount, setBetAmount, isFirstPersonMode, toggleFirstPersonMode } = useStore();
    const adjust = (delta: number) => setBetAmount(parseFloat((betAmount + delta).toFixed(2)));
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const val = parseFloat(e.target.value); if (!isNaN(val)) setBetAmount(val); };
    return (
        <div className="flex w-full gap-3 mb-3">
            <style>{`
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
            <div className="flex-1 bg-white/10 border-2 border-red-500/50 rounded-xl p-3 flex flex-col items-center justify-center shadow-inner">
                <div className="flex items-center w-full justify-center">
                    <div className="relative flex-1">
                        <input type="number" id="bet-amount-input" name="bet-amount" autoComplete="off" step="0.1" min="0.1" max="50" value={betAmount} onChange={handleChange} className="w-full bg-transparent py-1 px-2 text-center text-red-400 font-mono font-black text-[26px] focus:outline-none appearance-none" />
                    </div>
                    <div className="flex flex-col gap-0.5 ml-1">
                        <button onClick={() => adjust(0.1)} aria-label="Увеличить ставку" className="w-6 h-5 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"><ChevronUp className="w-4 h-4" /></button>
                        <button onClick={() => adjust(-0.1)} aria-label="Уменьшить ставку" className="w-6 h-5 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="text-xs text-gray-300 font-bold uppercase tracking-wider">🎯 Shot Cost</div>
            </div>
            {/* Camera toggle */}
            <button
                onClick={toggleFirstPersonMode}
                aria-label="Переключить камеру"
                className="flex-1 bg-white/10 border-2 border-[#21468B]/50 rounded-xl p-3 flex flex-col items-center justify-center shadow-inner hover:bg-white/20 active:scale-95 transition-all"
            >
                <div className="text-[26px]">{isFirstPersonMode ? '🐭' : '🐁'}</div>
                <div className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                    📷 {isFirstPersonMode ? 'FPS' : '3RD'}
                </div>
            </button>
        </div>
    );
};

export const DifficultySelector: React.FC = () => {
    const { difficulty, setDifficulty } = useStore();
    const [isFlipped, setIsFlipped] = useState(false);
    const config = DIFFICULTY_CONFIG[difficulty];

    const handleSelect = (d: Difficulty) => {
        setDifficulty(d);
        setIsFlipped(false);
    };

    const perspectiveStyle: React.CSSProperties = { perspective: '1000px' };
    const preserve3dStyle: React.CSSProperties = { transformStyle: 'preserve-3d' };
    const backfaceHiddenStyle: React.CSSProperties = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as React.CSSProperties;
    const rotateY180Style: React.CSSProperties = { transform: 'rotateY(180deg)' };

    return (
        <div className="relative w-full h-14 group z-10" style={perspectiveStyle}>
            <div className={`relative w-full h-full transition-transform duration-500`} style={{ ...preserve3dStyle, transform: isFlipped ? 'rotateY(180deg)' : 'none' }}>
                {/* FRONT - White Button */}
                <button
                    onClick={() => setIsFlipped(true)}
                    className="absolute inset-0 w-full h-full bg-white border-2 border-[#21468B] rounded-xl flex items-center justify-center text-[#21468B] font-black tracking-widest uppercase shadow-lg hover:bg-gray-100 active:scale-95 transition-all text-base"
                    style={backfaceHiddenStyle}
                >
                    <span className="flex items-center gap-2">
                        <BarChart className="w-5 h-5" />
                        DIFFICULTY: <span className={difficulty === Difficulty.HARD ? 'text-red-600' : difficulty === Difficulty.MEDIUM ? 'text-orange-500' : 'text-green-600'}>{config.label}</span>
                    </span>
                </button>

                {/* BACK - Selection Tabs (White Background) */}
                <div className="absolute inset-0 w-full h-full bg-white border-2 border-[#21468B] rounded-xl flex items-center justify-between p-1.5 gap-1.5 shadow-xl" style={{ ...backfaceHiddenStyle, ...rotateY180Style }}>
                    <button onClick={(e) => { e.stopPropagation(); handleSelect(Difficulty.EASY); }} className={`flex-1 h-full rounded-lg font-black text-sm tracking-wider transition-all ${difficulty === Difficulty.EASY ? 'bg-green-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>EASY</button>
                    <button onClick={(e) => { e.stopPropagation(); handleSelect(Difficulty.MEDIUM); }} className={`flex-1 h-full rounded-lg font-black text-sm tracking-wider transition-all ${difficulty === Difficulty.MEDIUM ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>MED</button>
                    <button onClick={(e) => { e.stopPropagation(); handleSelect(Difficulty.HARD); }} className={`flex-1 h-full rounded-lg font-black text-sm tracking-wider transition-all ${difficulty === Difficulty.HARD ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>HARD</button>
                </div>
            </div>
        </div>
    );
};

interface MenuScreenProps {
    onStartRun?: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onStartRun }) => {
    const [showAbout, setShowAbout] = useState(false);
    const { toggleDevMode } = useStore();

    const handleStartRun = () => {
        if (onStartRun) {
            onStartRun();
        }
    };

    // Secret dev mode activation by clicking the ruby on the crown
    const handleLogoClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Ruby position: approximately center-top of the logo (crown area)
        const rubyX = rect.width * 0.5;
        const rubyY = rect.height * 0.15;
        const distance = Math.sqrt((x - rubyX) ** 2 + (y - rubyY) ** 2);
        // If click is within 20px of ruby center
        if (distance < 20) {
            toggleDevMode();
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-start z-[100] bg-black/20 backdrop-blur-[1px] px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 pointer-events-auto">
            {showAbout && (
                <Suspense fallback={<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]"><div className="text-white text-xl">Loading...</div></div>}>
                    <AboutScreen onClose={() => setShowAbout(false)} />
                </Suspense>
            )}

            <div className="relative w-full max-w-md max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white animate-in zoom-in-95 duration-500 flex flex-col items-center py-4 px-5 shrink overflow-y-auto">
                <div className="w-48 h-24 mb-2 relative shrink-0 cursor-default" onClick={handleLogoClick}>
                    <img src="/kaasino-mini.svg" alt="Kaasino" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]" />
                </div>
                <h1 className="text-2xl font-black text-white font-cyber mb-2 drop-shadow-md text-center tracking-wider uppercase shrink-0">Cheese <span className="text-yellow-500">Runner</span></h1>

                <BetControl />

                <div className="flex flex-col w-full gap-2 shrink-0">
                    <button onClick={handleStartRun} aria-label="Начать игру" className="w-full py-3.5 text-xl rounded-xl bg-[#AE1C28] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#D32F2F] active:scale-95 transition-all flex items-center justify-center relative overflow-hidden">
                        <span style={BUTTON_TEXT_GLOW} className="relative z-10 flex items-center justify-center">START RUN <Play className="ml-2 w-5 h-5 fill-current" /></span>
                    </button>

                    <DifficultySelector />

                    <button onClick={() => setShowAbout(true)} aria-label="Об игре" className="w-full py-3 text-base rounded-xl bg-[#21468B] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#2B5BA7] active:scale-95 transition-all flex items-center justify-center relative overflow-hidden">
                        <span style={BUTTON_TEXT_GLOW} className="relative z-10 flex items-center justify-center"><BookOpen className="mr-2 w-5 h-5" /> ABOUT GAME</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

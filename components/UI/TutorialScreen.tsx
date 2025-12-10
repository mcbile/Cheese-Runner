
import React, { useState } from 'react';
import { Trophy, Zap, Play, ChevronRight, SkipForward, DollarSign, AlertTriangle } from 'lucide-react';

// Exit confirmation modal
const ExitConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    return (
        <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[90%] max-w-sm bg-[#0F172A] rounded-2xl border-4 border-white shadow-[0_0_30px_rgba(174,28,40,0.5)] p-5 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-9 h-9 text-red-400" />
                </div>
                <h2 className="text-xl font-black text-red-400 uppercase tracking-wider mb-2">
                    EXIT GAME?
                </h2>
                <p className="text-center text-gray-300 text-sm mb-4 leading-relaxed">
                    All your progress will be <span className="text-red-400 font-bold">LOST</span>!
                    <br />
                    Cheese points, earnings, and level progress will not be saved.
                </p>
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

interface TutorialStep {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    content: React.ReactNode;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: "MISSION",
        icon: Trophy,
        color: "text-emerald-400",
        content: (
            <div className="flex flex-col gap-4 justify-center h-full">
                {/* Ammo costs block - prominent warning FIRST */}
                <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 rounded-2xl p-5 border-2 border-red-500/50 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <DollarSign className="w-10 h-10 text-red-400" />
                        <span className="text-2xl font-black text-red-400 uppercase tracking-wide">AMMO = MONEY</span>
                    </div>
                    <p className="text-lg text-gray-200">Every shot costs your <span className="text-yellow-400 font-black">BET AMOUNT</span></p>
                </div>

                {/* Mission description with logo */}
                <div className="bg-white/10 p-5 rounded-2xl border border-emerald-500/30 text-center">
                    <p className="text-2xl leading-tight mb-4 font-bold">Collect all letters to clear each level</p>
                    <img
                        src="/kaasino_logo_full.png"
                        alt="KAASINO"
                        className="w-60 h-auto object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.5)] mx-auto"
                    />
                </div>
            </div>
        )
    },
    {
        title: "CONTROLS",
        icon: Zap,
        color: "text-yellow-400",
        content: (
            <div className="flex flex-col gap-4 h-full">
                {/* Mobile Controls FIRST - Mobile First approach */}
                <div className="bg-white/10 rounded-2xl border border-cyan-500/30 p-4">
                    <div className="text-sm text-cyan-400 uppercase tracking-wider mb-3 text-center font-bold">📱 Mobile / Touch</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <span className="text-sm text-gray-200 font-bold">Tap Anywhere</span>
                                <div className="text-xs text-cyan-400">Shoot</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                            <span className="text-xl">👈 👉</span>
                            <div>
                                <span className="text-sm text-gray-200 font-bold">Swipe L/R</span>
                                <div className="text-xs text-cyan-400">Move</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                            <span className="text-2xl">👆</span>
                            <div>
                                <span className="text-sm text-gray-200 font-bold">Swipe Up</span>
                                <div className="text-xs text-cyan-400">Jump</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                            <span className="text-2xl">⚙️</span>
                            <div>
                                <span className="text-sm text-gray-200 font-bold">Settings</span>
                                <div className="text-xs text-cyan-400">Bag, Sound, Camera</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Controls */}
                <div className="bg-white/10 rounded-2xl border border-purple-500/30 p-4">
                    <div className="text-sm text-purple-400 uppercase tracking-wider mb-3 text-center font-bold">🖥️ Desktop</div>
                    <div className="grid grid-cols-3 gap-2 justify-items-center">
                        <div className="flex flex-col items-center gap-1">
                            <span className="w-14 h-12 bg-black border border-white/30 rounded-xl text-white flex items-center justify-center text-lg font-bold">←→</span>
                            <span className="text-sm text-gray-300 font-bold">Move</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="w-14 h-12 bg-black border border-white/30 rounded-xl text-white flex items-center justify-center text-lg font-bold">↑</span>
                            <span className="text-sm text-gray-300 font-bold">Jump</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="w-14 h-12 bg-black border border-white/30 rounded-xl text-white flex items-center justify-center text-sm font-bold">SPACE</span>
                            <span className="text-sm text-gray-300 font-bold">🎯 Shoot</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="w-14 h-12 bg-black border border-white/30 rounded-xl text-white flex items-center justify-center text-sm font-bold">ESC</span>
                            <span className="text-sm text-gray-300 font-bold">⚙️ Settings</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="w-14 h-12 bg-black border border-white/30 rounded-xl text-white flex items-center justify-center text-sm font-bold">M</span>
                            <span className="text-sm text-gray-300 font-bold">🔇 Mute</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="w-14 h-12 bg-black border border-white/30 rounded-xl text-white flex items-center justify-center text-sm font-bold">V</span>
                            <span className="text-sm text-gray-300 font-bold">🐭 View</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
];

export const TutorialScreen: React.FC<{ onStart: () => void, onClose: () => void }> = ({ onStart, onClose }) => {
    const [step, setStep] = useState(0);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const currentStep = TUTORIAL_STEPS[step];
    const Icon = currentStep.icon;
    const isLastStep = step === TUTORIAL_STEPS.length - 1;
    const nextStep = () => isLastStep ? onStart() : setStep(s => s + 1);
    const prevStep = () => setStep(s => Math.max(0, s - 1));

    const handleExitClick = () => {
        setShowExitConfirm(true);
    };

    const handleExitConfirm = () => {
        setShowExitConfirm(false);
        onClose();
    };

    const handleExitCancel = () => {
        setShowExitConfirm(false);
    };

    return (
        <div className="absolute inset-0 bg-black/10 z-[120] text-white pointer-events-auto flex flex-col items-center justify-start px-2 pb-2 pt-4">
            <div className="relative w-full max-w-lg max-h-full bg-[#0F172A] rounded-3xl shadow-[0_0_50px_rgba(33,70,139,0.5)] border-4 border-white flex flex-col items-center py-5 px-4 overflow-y-auto">
                {/* Header with step indicator */}
                <div className="flex items-center justify-between w-full mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <Icon className={`w-10 h-10 ${currentStep.color}`} />
                        <h1 className={`text-2xl font-black font-cyber tracking-wider uppercase ${currentStep.color}`}>{currentStep.title}</h1>
                    </div>
                    <div className="flex gap-3">
                        {TUTORIAL_STEPS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setStep(idx)}
                                className={`w-4 h-4 rounded-full transition-all duration-300 ${idx === step ? `${currentStep.color.replace('text-', 'bg-')} scale-125` : 'bg-gray-700 hover:bg-gray-500'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content area */}
                <div className="w-full mb-5 flex-1 overflow-y-auto">
                    {currentStep.content}
                </div>

                {/* Buttons - stacked vertically, larger for mobile */}
                <div className="flex flex-col gap-3 w-full shrink-0">
                    {isLastStep ? (
                        <>
                            {/* LET'S RUN - Red */}
                            <button onClick={nextStep} className="w-full py-4 text-xl rounded-xl bg-[#AE1C28] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#D32F2F] active:scale-95 transition-all flex items-center justify-center">
                                <Play className="mr-2 w-7 h-7 fill-current" /> LET'S RUN
                            </button>
                            {/* BACK - White */}
                            <button onClick={prevStep} className="w-full py-3.5 text-lg rounded-xl bg-white text-[#21468B] font-black tracking-widest uppercase border-2 border-[#21468B] shadow-lg hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center">
                                BACK
                            </button>
                            {/* QUIT - Blue */}
                            <button onClick={handleExitClick} className="w-full py-3.5 text-lg rounded-xl bg-[#21468B] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#2a5ab0] active:scale-95 transition-all flex items-center justify-center">
                                QUIT
                            </button>
                        </>
                    ) : (
                        <>
                            {/* NEXT - Red */}
                            <button onClick={nextStep} className="w-full py-4 text-xl rounded-xl bg-[#AE1C28] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#D32F2F] active:scale-95 transition-all flex items-center justify-center">
                                NEXT <ChevronRight className="ml-2 w-7 h-7" />
                            </button>
                            {/* SKIP - White */}
                            <button onClick={onStart} className="w-full py-3.5 text-lg rounded-xl bg-white text-[#21468B] font-black tracking-widest uppercase border-2 border-[#21468B] shadow-lg hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center">
                                <SkipForward className="mr-2 w-6 h-6" /> SKIP
                            </button>
                            {/* QUIT - Blue */}
                            <button onClick={handleExitClick} className="w-full py-3.5 text-lg rounded-xl bg-[#21468B] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#2a5ab0] active:scale-95 transition-all flex items-center justify-center">
                                QUIT
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="w-full shrink basis-4 min-h-4" />

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

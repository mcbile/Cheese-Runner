/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PausedScreen - экран паузы
 */

import React, { useState } from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { useStore } from '../../../store';
import { ExitConfirmModal } from './ExitConfirmModal';

export const PausedScreen: React.FC = () => {
    const { resumeGame, restartGame, quitToMenu } = useStore();
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const handleQuitClick = () => {
        setShowExitConfirm(true);
    };

    const handleExitConfirm = () => {
        setShowExitConfirm(false);
        quitToMenu();
    };

    const handleExitCancel = () => {
        setShowExitConfirm(false);
    };

    return (
        <div className="absolute inset-0 bg-black/25 z-[100] flex flex-col items-center justify-start px-1.5 pb-1.5 pt-3 sm:pb-3 md:pb-4 pointer-events-auto">

            <div className="bg-[#0F172A] p-8 rounded-3xl border-4 border-white shadow-2xl flex flex-col items-center w-full max-w-md max-h-full shrink min-h-0 overflow-y-auto">
                <h1 className="text-4xl font-black text-white font-cyber mb-8 tracking-widest uppercase">PAUSED</h1>
                <button
                    onClick={resumeGame}
                    className="w-full flex items-center justify-center px-6 py-4 mb-4 rounded-xl bg-[#AE1C28] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#D32F2F] transition-all"
                >
                    <Play className="mr-2 w-5 h-5 fill-current" /> RESUME
                </button>
                <button
                    onClick={() => { resumeGame(); restartGame(); }}
                    className="w-full flex items-center justify-center px-6 py-4 mb-4 rounded-xl bg-white text-[#21468B] font-black tracking-widest uppercase border-2 border-[#21468B] shadow-lg hover:bg-gray-100 transition-all"
                >
                    <RotateCcw className="mr-2 w-5 h-5" /> RESTART
                </button>
                <button
                    onClick={handleQuitClick}
                    className="w-full flex items-center justify-center px-6 py-4 rounded-xl bg-[#21468B] text-white font-black tracking-widest uppercase border-2 border-white shadow-lg hover:bg-[#2B5BA7] transition-all"
                >
                    <Home className="mr-2 w-5 h-5" /> QUIT
                </button>
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ExitConfirmModal - модальное окно подтверждения выхода
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ExitConfirmModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({ onConfirm, onCancel }) => {
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

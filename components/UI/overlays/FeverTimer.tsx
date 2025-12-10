/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FeverTimer - таймер режима Cheese Fever
 */

import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useStore } from '../../../store';

export const FeverTimer: React.FC = () => {
    const { isCheeseFeverActive, cheeseFeverEndTime } = useStore();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isCheeseFeverActive) return;
        const DURATION = 20000;
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, cheeseFeverEndTime - now);
            setProgress((remaining / DURATION) * 100);
        }, 50);
        return () => clearInterval(interval);
    }, [isCheeseFeverActive, cheeseFeverEndTime]);

    if (!isCheeseFeverActive) return null;

    return (
        <div className="flex flex-col items-center animate-pulse mt-2">
            <div className="flex items-center gap-2 mb-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest">
                    FEVER MODE
                </span>
            </div>
            <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-orange-500/50">
                <div
                    className="h-full bg-orange-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

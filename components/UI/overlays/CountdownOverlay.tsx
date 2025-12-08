/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CountdownOverlay - обратный отсчёт перед стартом игры
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';
import { audio } from '../../System/Audio';

export const CountdownOverlay: React.FC = () => {
    const { setStatus } = useStore();
    const [count, setCount] = useState(3);

    useEffect(() => {
        audio.playCountdownBeep();
        const timer = setInterval(() => {
            setCount(prev => {
                if (prev === 1) {
                    audio.playCountdownGo();
                    return 0;
                }
                if (prev <= 0) {
                    clearInterval(timer);
                    setStatus(GameStatus.PLAYING);
                    return 0;
                }
                audio.playCountdownBeep();
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [setStatus]);

    return (
        <div className="absolute inset-0 flex items-center justify-center z-[200] pointer-events-none">
            <div className="flex flex-col items-center">
                <h1
                    key={count}
                    className="text-8xl md:text-9xl font-black font-cyber text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-in zoom-in-50 duration-300"
                >
                    {count > 0 ? count : "RUN!"}
                </h1>
            </div>
        </div>
    );
};

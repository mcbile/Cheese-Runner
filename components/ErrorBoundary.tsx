/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Storage key for crash recovery data
const CRASH_RECOVERY_KEY = 'cheese-runner-crash-recovery';

interface CrashRecoveryData {
    balance: number;
    level: number;
    difficulty: string;
    timestamp: number;
    errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Game Error:', error);
        console.error('Error Info:', errorInfo.componentStack);

        // Save critical game data for recovery
        this.saveCrashRecoveryData(error);
    }

    /**
     * Save critical game state to localStorage for potential recovery
     */
    private saveCrashRecoveryData(error: Error): void {
        try {
            // Dynamically import store to avoid circular dependencies
            // Using require for synchronous access in error handler
            const storeModule = require('../../store');
            const state = storeModule.useStore?.getState?.();

            if (state) {
                const recoveryData: CrashRecoveryData = {
                    balance: state.balance ?? 0,
                    level: state.level ?? 1,
                    difficulty: state.difficulty ?? 'MEDIUM',
                    timestamp: Date.now(),
                    errorMessage: error.message
                };

                localStorage.setItem(CRASH_RECOVERY_KEY, JSON.stringify(recoveryData));
                console.log('[ErrorBoundary] Crash recovery data saved');
            }
        } catch (storageError) {
            console.warn('[ErrorBoundary] Failed to save crash recovery data:', storageError);
        }
    }

    /**
     * Check if there's recoverable data from a previous crash
     */
    static getRecoveryData(): CrashRecoveryData | null {
        try {
            const data = localStorage.getItem(CRASH_RECOVERY_KEY);
            if (data) {
                const parsed = JSON.parse(data) as CrashRecoveryData;
                // Only use recovery data if it's less than 1 hour old
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - parsed.timestamp < oneHour) {
                    return parsed;
                }
                // Clear stale recovery data
                localStorage.removeItem(CRASH_RECOVERY_KEY);
            }
        } catch {
            // Ignore parse errors
        }
        return null;
    }

    /**
     * Clear recovery data after successful restart
     */
    static clearRecoveryData(): void {
        localStorage.removeItem(CRASH_RECOVERY_KEY);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 text-white">
                    <div className="max-w-md text-center">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-400 mb-6">
                            The game encountered an unexpected error.
                        </p>
                        {this.state.error && (
                            <pre className="bg-gray-900 p-4 rounded-lg text-left text-xs text-red-400 mb-6 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Restart Game
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

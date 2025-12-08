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

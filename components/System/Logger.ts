/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Logger - Centralized logging system for game events and errors
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: number;
    level: LogLevel;
    component: string;
    message: string;
    data?: unknown;
}

// Recent logs buffer for debugging
const MAX_LOG_BUFFER = 100;
const logBuffer: LogEntry[] = [];

// Check if we're in development mode
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

/**
 * Game Logger - provides structured logging with component context
 * In development: all logs are shown
 * In production: only warn/error are shown, errors can be reported
 */
class GameLogger {
    private enabled = true;

    /**
     * Enable or disable logging
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Log a message with component context
     */
    log(level: LogLevel, component: string, message: string, data?: unknown): void {
        if (!this.enabled) return;

        // In production, skip debug logs
        if (!isDev && level === 'debug') return;

        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            component,
            message,
            data
        };

        // Add to buffer (for crash reports)
        logBuffer.push(entry);
        if (logBuffer.length > MAX_LOG_BUFFER) {
            logBuffer.shift();
        }

        // Format message
        const prefix = `[${component}]`;
        const formattedMessage = `${prefix} ${message}`;

        // Console output
        switch (level) {
            case 'debug':
                console.debug(formattedMessage, data !== undefined ? data : '');
                break;
            case 'info':
                console.info(formattedMessage, data !== undefined ? data : '');
                break;
            case 'warn':
                console.warn(formattedMessage, data !== undefined ? data : '');
                break;
            case 'error':
                console.error(formattedMessage, data !== undefined ? data : '');
                // In production, could send to error tracking service
                if (!isDev) {
                    this.reportError(entry);
                }
                break;
        }
    }

    /**
     * Convenience methods for each log level
     */
    debug(component: string, message: string, data?: unknown): void {
        this.log('debug', component, message, data);
    }

    info(component: string, message: string, data?: unknown): void {
        this.log('info', component, message, data);
    }

    warn(component: string, message: string, data?: unknown): void {
        this.log('warn', component, message, data);
    }

    error(component: string, message: string, data?: unknown): void {
        this.log('error', component, message, data);
    }

    /**
     * Get recent logs (for crash reports or debugging)
     */
    getRecentLogs(): LogEntry[] {
        return [...logBuffer];
    }

    /**
     * Clear log buffer
     */
    clearLogs(): void {
        logBuffer.length = 0;
    }

    /**
     * Report error to external service (placeholder for future integration)
     * Could integrate with Sentry, LogRocket, etc.
     */
    private reportError(entry: LogEntry): void {
        // Store in localStorage for later analysis
        try {
            const errorLog = localStorage.getItem('cheese-runner-error-log');
            const errors: LogEntry[] = errorLog ? JSON.parse(errorLog) : [];
            errors.push(entry);

            // Keep only last 10 errors
            if (errors.length > 10) {
                errors.shift();
            }

            localStorage.setItem('cheese-runner-error-log', JSON.stringify(errors));
        } catch {
            // Ignore storage errors
        }

        // Future: send to error tracking service
        // Example: Sentry.captureMessage(entry.message, { extra: entry });
    }

    /**
     * Performance timing helper
     * Usage: const end = logger.startTimer('Component', 'operation'); ... end();
     */
    startTimer(component: string, operation: string): () => void {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            if (duration > 16) { // Log if operation took more than one frame (16ms)
                this.warn(component, `Slow operation: ${operation}`, { durationMs: duration.toFixed(2) });
            } else if (isDev) {
                this.debug(component, `Timer: ${operation}`, { durationMs: duration.toFixed(2) });
            }
        };
    }
}

// Singleton instance
export const logger = new GameLogger();

// Re-export types
export type { LogLevel, LogEntry };

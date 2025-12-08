/**
 * Service Worker registration and management
 */

export interface SWRegistration {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  isRegistered: boolean;
}

class ServiceWorkerManager {
  private _registration: ServiceWorkerRegistration | null = null;
  private _isSupported: boolean = false;
  private _isRegistered: boolean = false;

  constructor() {
    this._isSupported = 'serviceWorker' in navigator;
  }

  get isSupported(): boolean {
    return this._isSupported;
  }

  get isRegistered(): boolean {
    return this._isRegistered;
  }

  get registration(): ServiceWorkerRegistration | null {
    return this._registration;
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this._isSupported) {
      console.log('[SW] Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      this._registration = registration;
      this._isRegistered = true;

      console.log('[SW] Service Worker registered:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              console.log('[SW] New version available!');
              this.onUpdateAvailable?.();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this._registration) {
      return false;
    }

    try {
      const result = await this._registration.unregister();
      if (result) {
        this._registration = null;
        this._isRegistered = false;
        console.log('[SW] Service Worker unregistered');
      }
      return result;
    } catch (error) {
      console.error('[SW] Unregistration failed:', error);
      return false;
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this._registration) {
      return;
    }

    try {
      await this._registration.update();
      console.log('[SW] Checked for updates');
    } catch (error) {
      console.error('[SW] Update check failed:', error);
    }
  }

  /**
   * Skip waiting and activate the new worker
   */
  skipWaiting(): void {
    if (this._registration?.waiting) {
      this._registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<boolean> {
    if (!this._registration?.active) {
      return false;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.cleared);
      };
      this._registration!.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
    });
  }

  // Callback for when an update is available
  onUpdateAvailable?: () => void;
}

// Singleton instance
export const swManager = new ServiceWorkerManager();

/**
 * Initialize service worker on app start
 */
export async function initServiceWorker(): Promise<void> {
  // Only register in production or when explicitly enabled
  if (import.meta.env?.PROD || import.meta.env?.VITE_ENABLE_SW) {
    await swManager.register();
  } else {
    console.log('[SW] Service Worker disabled in development');
  }
}

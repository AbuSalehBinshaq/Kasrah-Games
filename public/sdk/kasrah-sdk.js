/**
 * Kasrah Games SDK v3.0.0
 * Professional Game Integration SDK
 * 
 * Features:
 * - Video Ads & Rewarded Ads
 * - Cloud Data Storage
 * - User Accounts
 * - Analytics
 * - Advanced Error Handling
 * 
 * Usage:
 * <script src="/sdk/kasrah-sdk.js"></script>
 * <script>
 *   KasrahSDK.init({
 *     gameId: 'your-game-id',
 *     apiUrl: 'https://kasrah-games.onrender.com/api/sdk'
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  const SDK_VERSION = '3.0.0';
  const DEFAULT_CONFIG = {
    gameId: null,
    apiUrl: 'https://kasrah-games.onrender.com/api/sdk',
    debugMode: false,
    enableAnalytics: true,
    adFrequency: 3,
    autoPlayDelay: 5000,
    timeout: 10000
  };

  // Logger utility
  const Logger = {
    log: (message, data = null) => {
      if (KasrahSDK.config.debugMode) {
        console.log(`%c[Kasrah SDK] INFO`, 'color: #3b82f6; font-weight: bold;', message, data || '');
      }
    },
    success: (message, data = null) => {
      if (KasrahSDK.config.debugMode) {
        console.log(`%c[Kasrah SDK] SUCCESS`, 'color: #10b981; font-weight: bold;', message, data || '');
      }
    },
    error: (message, error = null) => {
      console.error(`%c[Kasrah SDK] ERROR`, 'color: #ef4444; font-weight: bold;', message, error || '');
    },
    warn: (message, data = null) => {
      console.warn(`%c[Kasrah SDK] WARN`, 'color: #f59e0b; font-weight: bold;', message, data || '');
    }
  };

  // Event Emitter
  class EventEmitter {
    constructor() {
      this.events = {};
    }

    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
      return this;
    }

    off(event, callback) {
      if (this.events[event]) {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      }
      return this;
    }

    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            Logger.error(`Error in event listener for ${event}:`, error);
          }
        });
      }
      return this;
    }

    once(event, callback) {
      const wrapper = (data) => {
        callback(data);
        this.off(event, wrapper);
      };
      return this.on(event, wrapper);
    }
  }

  // API Client
  class APIClient {
    constructor(baseUrl, timeout = 10000) {
      this.baseUrl = baseUrl;
      this.timeout = timeout;
    }

    async request(endpoint, method = 'GET', data = null) {
      const url = `${this.baseUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-SDK-Version': SDK_VERSION,
          'X-Game-ID': KasrahSDK.config.gameId
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        Logger.error(`API Request Failed: ${endpoint}`, error);
        throw error;
      }
    }

    get(endpoint) {
      return this.request(endpoint, 'GET');
    }

    post(endpoint, data) {
      return this.request(endpoint, 'POST', data);
    }

    put(endpoint, data) {
      return this.request(endpoint, 'PUT', data);
    }

    delete(endpoint) {
      return this.request(endpoint, 'DELETE');
    }
  }

  // Data Storage Manager
  class StorageManager {
    constructor() {
      this.localData = {};
      this.maxSize = 2 * 1024 * 1024; // 2MB
    }

    validateData(data) {
      const size = new Blob([JSON.stringify(data)]).size;
      if (size > this.maxSize) {
        throw new Error(`Data exceeds maximum size of ${this.maxSize} bytes`);
      }
      return true;
    }

    async save(key, value) {
      try {
        this.validateData(value);
        this.localData[key] = value;

        // Sync to cloud if user is logged in
        if (KasrahSDK.user) {
          await KasrahSDK.api.post('/data/save', {
            key,
            value,
            gameId: KasrahSDK.config.gameId
          });
          Logger.success(`Data saved: ${key}`);
        }

        KasrahSDK.emit('dataSaved', { key, value });
        return true;
      } catch (error) {
        Logger.error(`Failed to save data: ${key}`, error);
        KasrahSDK.emit('dataError', { key, error: error.message });
        throw error;
      }
    }

    async load(key) {
      try {
        // Try cloud first if user is logged in
        if (KasrahSDK.user) {
          const response = await KasrahSDK.api.get(`/data/load?key=${key}&gameId=${KasrahSDK.config.gameId}`);
          if (response.success) {
            this.localData[key] = response.data;
            Logger.success(`Data loaded from cloud: ${key}`);
            return response.data;
          }
        }

        // Fallback to local storage
        const data = this.localData[key];
        Logger.log(`Data loaded locally: ${key}`);
        return data;
      } catch (error) {
        Logger.error(`Failed to load data: ${key}`, error);
        return this.localData[key] || null;
      }
    }

    clear(key) {
      delete this.localData[key];
      Logger.log(`Data cleared: ${key}`);
    }

    clearAll() {
      this.localData = {};
      Logger.log('All data cleared');
    }
  }

  // Ads Manager
  class AdsManager {
    constructor() {
      this.adCount = 0;
      this.lastAdTime = 0;
      this.isAdPlaying = false;
    }

    async showAd(type = 'video') {
      try {
        if (this.isAdPlaying) {
          Logger.warn('Ad is already playing');
          return false;
        }

        // Check ad frequency
        if (type === 'video' && this.adCount > 0 && this.adCount % KasrahSDK.config.adFrequency !== 0) {
          Logger.log('Ad frequency not met, skipping ad');
          return false;
        }

        this.isAdPlaying = true;
        KasrahSDK.emit('adStarted', { type });

        // Pause game if callback exists
        if (KasrahSDK.gameCallbacks.onAdStart) {
          KasrahSDK.gameCallbacks.onAdStart();
        }

        // Fetch ad from server
        const adResponse = await KasrahSDK.api.post('/ads/get', {
          type,
          gameId: KasrahSDK.config.gameId
        });

        if (!adResponse.success || !adResponse.ad) {
          Logger.warn('No ad available');
          this.isAdPlaying = false;
          return false;
        }

        // Show ad (mock implementation)
        await this.displayAd(adResponse.ad, type);

        // Track ad impression
        await KasrahSDK.api.post('/ads/track', {
          adId: adResponse.ad.id,
          type: 'impression',
          gameId: KasrahSDK.config.gameId
        });

        this.adCount++;
        this.lastAdTime = Date.now();
        this.isAdPlaying = false;

        KasrahSDK.emit('adFinished', { type, adId: adResponse.ad.id });

        // Resume game if callback exists
        if (KasrahSDK.gameCallbacks.onAdEnd) {
          KasrahSDK.gameCallbacks.onAdEnd();
        }

        return true;
      } catch (error) {
        Logger.error('Failed to show ad', error);
        this.isAdPlaying = false;
        KasrahSDK.emit('adError', { error: error.message });
        return false;
      }
    }

    async displayAd(ad, type) {
      return new Promise((resolve) => {
        // Create ad container
        const container = document.createElement('div');
        container.id = 'kasrah-ad-container';
        container.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        `;

        if (type === 'video') {
          content.innerHTML = `
            <h2 style="margin: 0 0 10px 0; color: #333;">Advertisement</h2>
            <p style="margin: 0 0 20px 0; color: #666;">This video ad will close in 5 seconds...</p>
            <div style="width: 100%; height: 300px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              <span style="color: #999;">Video Ad</span>
            </div>
          `;
        } else {
          content.innerHTML = `
            <h2 style="margin: 0 0 10px 0; color: #333;">Special Offer</h2>
            <p style="margin: 0 0 20px 0; color: #666;">Check out this amazing offer!</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
            ">Close</button>
          `;
        }

        container.appendChild(content);
        document.body.appendChild(container);

        // Auto-close after 5 seconds for video ads
        const timeout = type === 'video' ? 5000 : 10000;
        setTimeout(() => {
          if (container.parentElement) {
            container.remove();
          }
          resolve();
        }, timeout);
      });
    }
  }

  // Analytics Manager
  class AnalyticsManager {
    constructor() {
      this.events = [];
      this.sessionId = this.generateSessionId();
      this.startTime = Date.now();
    }

    generateSessionId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    trackEvent(eventName, eventData = {}) {
      try {
        const event = {
          name: eventName,
          data: eventData,
          timestamp: Date.now(),
          sessionId: this.sessionId
        };

        this.events.push(event);
        Logger.log(`Event tracked: ${eventName}`, eventData);

        // Send to server if batch size reached
        if (this.events.length >= 10) {
          this.flush();
        }
      } catch (error) {
        Logger.error('Failed to track event', error);
      }
    }

    async flush() {
      if (this.events.length === 0) return;

      try {
        await KasrahSDK.api.post('/analytics/track', {
          events: this.events,
          gameId: KasrahSDK.config.gameId,
          sessionId: this.sessionId
        });

        Logger.success(`Flushed ${this.events.length} analytics events`);
        this.events = [];
      } catch (error) {
        Logger.error('Failed to flush analytics', error);
      }
    }

    getSessionDuration() {
      return Date.now() - this.startTime;
    }
  }

  // Main SDK Object
  const KasrahSDK = {
    version: SDK_VERSION,
    config: { ...DEFAULT_CONFIG },
    user: null,
    api: null,
    storage: new StorageManager(),
    ads: new AdsManager(),
    analytics: new AnalyticsManager(),
    gameCallbacks: {},
    eventEmitter: new EventEmitter(),

    /**
     * Initialize SDK
     */
    init(config = {}) {
      try {
        this.config = { ...this.config, ...config };

        if (!this.config.gameId) {
          throw new Error('gameId is required');
        }

        this.api = new APIClient(this.config.apiUrl, this.config.timeout);

        Logger.success(`SDK initialized v${SDK_VERSION}`, {
          gameId: this.config.gameId,
          apiUrl: this.config.apiUrl
        });

        this.emit('initialized', { version: SDK_VERSION });

        // Auto-load user if exists
        this.loadUser();

        // Track game start
        this.analytics.trackEvent('gameStart', {
          gameId: this.config.gameId,
          timestamp: new Date().toISOString()
        });

        return true;
      } catch (error) {
        Logger.error('SDK initialization failed', error);
        this.emit('initError', { error: error.message });
        return false;
      }
    },

    /**
     * Manual initialization with custom config
     */
    manualInit(config = {}) {
      return this.init(config);
    },

    /**
     * Load user from localStorage or API
     */
    async loadUser() {
      try {
        const storedUser = localStorage.getItem('kasrah_user');
        if (storedUser) {
          this.user = JSON.parse(storedUser);
          Logger.success('User loaded from storage', this.user);
        }
      } catch (error) {
        Logger.warn('Failed to load user', error);
      }
    },

    /**
     * Set user (after login)
     */
    setUser(user) {
      this.user = user;
      localStorage.setItem('kasrah_user', JSON.stringify(user));
      Logger.success('User set', user);
      this.emit('userSet', user);
    },

    /**
     * Clear user (logout)
     */
    clearUser() {
      this.user = null;
      localStorage.removeItem('kasrah_user');
      Logger.log('User cleared');
      this.emit('userCleared');
    },

    /**
     * Show video ad
     */
    async showVideoAd() {
      return this.ads.showAd('video');
    },

    /**
     * Show rewarded ad
     */
    async showRewardedAd() {
      return this.ads.showAd('rewarded');
    },

    /**
     * Save data
     */
    async saveData(key, value) {
      return this.storage.save(key, value);
    },

    /**
     * Load data
     */
    async loadData(key) {
      return this.storage.load(key);
    },

    /**
     * Clear data
     */
    clearData(key) {
      this.storage.clear(key);
    },

    /**
     * Track custom event
     */
    trackEvent(eventName, eventData = {}) {
      this.analytics.trackEvent(eventName, eventData);
    },

    /**
     * Register game callback
     */
    onGameStart(callback) {
      this.gameCallbacks.onAdStart = callback;
    },

    /**
     * Register game callback
     */
    onGameEnd(callback) {
      this.gameCallbacks.onAdEnd = callback;
    },

    /**
     * Event listener
     */
    on(event, callback) {
      return this.eventEmitter.on(event, callback);
    },

    /**
     * Remove event listener
     */
    off(event, callback) {
      return this.eventEmitter.off(event, callback);
    },

    /**
     * Emit event
     */
    emit(event, data) {
      return this.eventEmitter.emit(event, data);
    },

    /**
     * One-time event listener
     */
    once(event, callback) {
      return this.eventEmitter.once(event, callback);
    },

    /**
     * Flush analytics
     */
    async flushAnalytics() {
      return this.analytics.flush();
    },

    /**
     * Get SDK info
     */
    getInfo() {
      return {
        version: SDK_VERSION,
        gameId: this.config.gameId,
        user: this.user,
        sessionId: this.analytics.sessionId,
        sessionDuration: this.analytics.getSessionDuration()
      };
    }
  };

  // Expose to window
  window.KasrahSDK = KasrahSDK;

  // Auto-initialize if data-auto-init attribute is present
  if (document.currentScript && document.currentScript.hasAttribute('data-auto-init')) {
    const gameId = document.currentScript.getAttribute('data-game-id');
    if (gameId) {
      KasrahSDK.init({ gameId });
    }
  }

})(window);

// Moonfin Web Plugin - Built 2026-01-01T04:08:45.237Z
(function() {
"use strict";

// === utils/device.js ===
const Device = {
    _cache: null,

    detect() {
        if (this._cache) return this._cache;

        const ua = navigator.userAgent.toLowerCase();
        const width = window.innerWidth;
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
        const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua) || (hasTouch && width >= 768 && width <= 1024);
        const isTV = /tv|tizen|webos|smart-tv|netcast|hbbtv|vidaa|viera/i.test(ua);
        const isDesktop = !isMobile && !isTablet && !isTV;

        this._cache = {
            type: isTV ? 'tv' : isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
            isMobile: isMobile || isTablet,
            isDesktop,
            isTV,
            isTablet,
            hasTouch,
            screenWidth: width,
            screenHeight: window.innerHeight,
            userAgent: navigator.userAgent
        };

        console.log('[Moonfin] Device detected:', this._cache.type);
        return this._cache;
    },

    getType() {
        return this.detect().type;
    },

    isMobile() {
        return this.detect().isMobile;
    },

    isDesktop() {
        return this.detect().isDesktop;
    },

    isTV() {
        return this.detect().isTV;
    },

    hasTouch() {
        return this.detect().hasTouch;
    },

    getInfo() {
        return this.detect();
    }
};


// === utils/api.js ===
const API = {
    getApiClient() {
        return window.ApiClient || (window.connectionManager && window.connectionManager.currentApiClient());
    },

    async getCurrentUser() {
        const api = this.getApiClient();
        if (!api) return null;
        
        try {
            const user = await api.getCurrentUser();
            return user;
        } catch (e) {
            console.error('[Moonfin] Failed to get current user:', e);
            return null;
        }
    },

    async getUserViews() {
        const api = this.getApiClient();
        if (!api) return [];

        try {
            const userId = api.getCurrentUserId();
            const result = await api.getUserViews(userId);
            return result.Items || [];
        } catch (e) {
            console.error('[Moonfin] Failed to get user views:', e);
            return [];
        }
    },

    async getRandomItems(options = {}) {
        const api = this.getApiClient();
        if (!api) return [];

        const { contentType = 'both', limit = 10 } = options;

        try {
            const userId = api.getCurrentUserId();
            
            // Determine item types based on content preference
            let includeItemTypes = [];
            if (contentType === 'movies' || contentType === 'both') {
                includeItemTypes.push('Movie');
            }
            if (contentType === 'tv' || contentType === 'both') {
                includeItemTypes.push('Series');
            }

            const params = {
                userId: userId,
                includeItemTypes: includeItemTypes.join(','),
                sortBy: 'Random',
                limit: limit,
                recursive: true,
                hasThemeSong: false,
                hasThemeVideo: false,
                fields: 'Overview,Genres,CommunityRating,CriticRating,OfficialRating,RunTimeTicks,ProductionYear',
                imageTypeLimit: 1,
                enableImageTypes: 'Backdrop,Logo,Primary'
            };

            const result = await api.getItems(userId, params);
            return result.Items || [];
        } catch (e) {
            console.error('[Moonfin] Failed to get random items:', e);
            return [];
        }
    },

    getImageUrl(item, imageType = 'Backdrop', options = {}) {
        const api = this.getApiClient();
        if (!api || !item) return null;

        const itemId = item.Id;
        const { maxWidth = 1920, maxHeight = 1080, quality = 96 } = options;

        // Check if the item has this image type
        if (!item.ImageTags || !item.ImageTags[imageType]) {
            // For backdrop, check BackdropImageTags
            if (imageType === 'Backdrop' && item.BackdropImageTags && item.BackdropImageTags.length > 0) {
                return api.getScaledImageUrl(itemId, {
                    type: 'Backdrop',
                    maxWidth,
                    maxHeight,
                    quality,
                    tag: item.BackdropImageTags[0]
                });
            }
            return null;
        }

        return api.getScaledImageUrl(itemId, {
            type: imageType,
            maxWidth,
            maxHeight,
            quality,
            tag: item.ImageTags[imageType]
        });
    },

    getUserAvatarUrl(user) {
        const api = this.getApiClient();
        if (!api || !user) return null;

        if (user.PrimaryImageTag) {
            return api.getUserImageUrl(user.Id, {
                type: 'Primary',
                tag: user.PrimaryImageTag
            });
        }
        return null;
    },

    navigateToItem(itemId) {
        if (window.Emby && window.Emby.Page) {
            window.Emby.Page.show('/details?id=' + itemId);
        } else if (window.appRouter) {
            window.appRouter.show('/details?id=' + itemId);
        }
    },

    navigateTo(path) {
        if (window.Emby && window.Emby.Page) {
            window.Emby.Page.show(path);
        } else if (window.appRouter) {
            window.appRouter.show(path);
        }
    }
};


// === utils/storage.js ===
const Storage = {
    STORAGE_KEY: 'moonfin_settings',
    SYNC_STATUS_KEY: 'moonfin_sync_status',
    CLIENT_ID: 'moonfin-web',

    syncState: {
        serverAvailable: null,  // null = unknown, true/false
        lastSyncTime: null,
        lastSyncError: null,
        syncing: false
    },

    defaults: {
        // Navbar Settings
        navbarOverlayOpacity: 50,        // 0-100
        navbarOverlayColor: 'gray',      // color key

        // Toolbar Settings
        showShuffleButton: true,
        showGenresButton: true,
        showFavoritesButton: true,
        showLibrariesInToolbar: true,
        shuffleContentType: 'both',      // 'movies', 'tv', 'both'

        // Display Settings
        seasonalSurprise: 'none',        // 'none', 'winter', 'spring', 'summer', 'fall', 'halloween'
        backdropEnabled: true,
        confirmExit: true,

        // UI Customization
        navbarPosition: 'top',           // 'top', 'bottom'
        showClock: true,
        use24HourClock: false
    },

    colorOptions: {
        'gray': { name: 'Gray', hex: '#808080' },
        'black': { name: 'Black', hex: '#000000' },
        'dark_blue': { name: 'Dark Blue', hex: '#1A2332' },
        'purple': { name: 'Purple', hex: '#4A148C' },
        'teal': { name: 'Teal', hex: '#00695C' },
        'navy': { name: 'Navy', hex: '#0D1B2A' },
        'charcoal': { name: 'Charcoal', hex: '#36454F' },
        'brown': { name: 'Brown', hex: '#3E2723' },
        'dark_red': { name: 'Dark Red', hex: '#8B0000' },
        'dark_green': { name: 'Dark Green', hex: '#0B4F0F' },
        'slate': { name: 'Slate', hex: '#475569' },
        'indigo': { name: 'Indigo', hex: '#1E3A8A' }
    },

    seasonalOptions: {
        'none': { name: 'None', icon: '❌' },
        'winter': { name: 'Winter', icon: '❄️' },
        'spring': { name: 'Spring', icon: '🌸' },
        'summer': { name: 'Summer', icon: '☀️' },
        'fall': { name: 'Fall', icon: '🍁' },
        'halloween': { name: 'Halloween', icon: '🎃' }
    },

    getAll() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Migrate old mediaBar settings to navbar settings
                if (parsed.mediaBarOverlayColor && !parsed.navbarOverlayColor) {
                    parsed.navbarOverlayColor = parsed.mediaBarOverlayColor;
                    delete parsed.mediaBarOverlayColor;
                }
                if (parsed.mediaBarOverlayOpacity && !parsed.navbarOverlayOpacity) {
                    parsed.navbarOverlayOpacity = parsed.mediaBarOverlayOpacity;
                    delete parsed.mediaBarOverlayOpacity;
                }
                // Remove old mediaBar settings
                delete parsed.mediaBarEnabled;
                delete parsed.mediaBarContentType;
                delete parsed.mediaBarItemCount;
                delete parsed.mediaBarAutoAdvance;
                delete parsed.mediaBarIntervalMs;
                
                // Save migrated settings
                if (parsed.navbarOverlayColor || parsed.navbarOverlayOpacity) {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
                }
                
                return { ...this.defaults, ...parsed };
            }
        } catch (e) {
            console.error('[Moonfin] Failed to read settings:', e);
        }
        return { ...this.defaults };
    },

    get(key, defaultValue = null) {
        const settings = this.getAll();
        return key in settings ? settings[key] : (defaultValue !== null ? defaultValue : this.defaults[key]);
    },

    set(key, value) {
        const settings = this.getAll();
        settings[key] = value;
        this.saveAll(settings);
    },

    saveAll(settings, syncToServer = true) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
            // Dispatch event for listeners
            window.dispatchEvent(new CustomEvent('moonfin-settings-changed', { detail: settings }));
            
            // Sync to server if enabled
            if (syncToServer && this.syncState.serverAvailable) {
                this.saveToServer(settings);
            }
        } catch (e) {
            console.error('[Moonfin] Failed to save settings:', e);
        }
    },

    reset() {
        this.saveAll({ ...this.defaults });
    },

    getColorHex(colorKey) {
        return this.colorOptions[colorKey]?.hex || this.colorOptions['gray'].hex;
    },

    getColorRgba(colorKey, opacity = 50) {
        const hex = this.getColorHex(colorKey);
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    },

    async pingServer() {
        try {
            const serverUrl = window.ApiClient?.serverAddress?.() || '';
            const response = await fetch(`${serverUrl}/Moonfin/Ping`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                this.syncState.serverAvailable = data.installed && data.settingsSyncEnabled;
                console.log('[Moonfin] Server plugin detected:', data);
                return data;
            }
        } catch (e) {
            console.log('[Moonfin] Server plugin not available:', e.message);
        }
        
        this.syncState.serverAvailable = false;
        return null;
    },

    getAuthHeader() {
        const token = window.ApiClient?.accessToken?.();
        if (token) {
            return { 'Authorization': `MediaBrowser Token="${token}"` };
        }
        return {};
    },

    async fetchFromServer() {
        if (this.syncState.serverAvailable === false) {
            return null;
        }

        try {
            const serverUrl = window.ApiClient?.serverAddress?.() || '';
            const response = await fetch(`${serverUrl}/Moonfin/Settings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                }
            });

            if (response.ok) {
                const serverSettings = await response.json();
                console.log('[Moonfin] Fetched settings from server:', serverSettings);
                return this.mapServerToLocal(serverSettings);
            } else if (response.status === 404) {
                console.log('[Moonfin] No settings found on server');
                return null;
            }
        } catch (e) {
            console.error('[Moonfin] Failed to fetch from server:', e);
            this.syncState.lastSyncError = e.message;
        }
        
        return null;
    },

    async saveToServer(settings, mergeMode = 'merge') {
        if (this.syncState.serverAvailable === false) {
            return false;
        }

        try {
            this.syncState.syncing = true;
            const serverUrl = window.ApiClient?.serverAddress?.() || '';
            
            const response = await fetch(`${serverUrl}/Moonfin/Settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({
                    settings: this.mapLocalToServer(settings),
                    clientId: this.CLIENT_ID,
                    mergeMode: mergeMode
                })
            });

            if (response.ok) {
                this.syncState.lastSyncTime = Date.now();
                this.syncState.lastSyncError = null;
                console.log('[Moonfin] Settings saved to server');
                return true;
            }
        } catch (e) {
            console.error('[Moonfin] Failed to save to server:', e);
            this.syncState.lastSyncError = e.message;
        } finally {
            this.syncState.syncing = false;
        }
        
        return false;
    },

    mapServerToLocal(serverSettings) {
        return {
            // Toolbar
            showShuffleButton: serverSettings.showShuffleButton ?? this.defaults.showShuffleButton,
            showGenresButton: serverSettings.showGenresButton ?? this.defaults.showGenresButton,
            showFavoritesButton: serverSettings.showFavoritesButton ?? this.defaults.showFavoritesButton,
            showLibrariesInToolbar: serverSettings.showLibrariesInToolbar ?? this.defaults.showLibrariesInToolbar,
            shuffleContentType: serverSettings.shuffleContentType ?? this.defaults.shuffleContentType,

            // Display
            seasonalSurprise: serverSettings.seasonalSurprise ?? this.defaults.seasonalSurprise,
            backdropEnabled: serverSettings.backdropEnabled ?? this.defaults.backdropEnabled,
            confirmExit: serverSettings.confirmExit ?? this.defaults.confirmExit,

            // UI
            navbarPosition: serverSettings.navbarPosition ?? this.defaults.navbarPosition,
            showClock: serverSettings.showClock ?? this.defaults.showClock,
            use24HourClock: serverSettings.use24HourClock ?? this.defaults.use24HourClock
        };
    },

    mapLocalToServer(localSettings) {
        return {
            // Navbar
            overlayOpacity: localSettings.navbarOverlayOpacity,
            overlayColor: localSettings.navbarOverlayColor,

            // Toolbar
            showShuffleButton: localSettings.showShuffleButton,
            showGenresButton: localSettings.showGenresButton,
            showFavoritesButton: localSettings.showFavoritesButton,
            showLibrariesInToolbar: localSettings.showLibrariesInToolbar,
            shuffleContentType: localSettings.shuffleContentType,

            // Display
            seasonalSurprise: localSettings.seasonalSurprise,
            backdropEnabled: localSettings.backdropEnabled,
            confirmExit: localSettings.confirmExit,

            // UI
            navbarPosition: localSettings.navbarPosition,
            showClock: localSettings.showClock,
            use24HourClock: localSettings.use24HourClock
        };
    },

    async sync() {
        console.log('[Moonfin] Starting settings sync...');
        
        // Check if server plugin is available
        const pingResult = await this.pingServer();
        if (!pingResult?.installed || !pingResult?.settingsSyncEnabled) {
            console.log('[Moonfin] Server sync not available');
            return;
        }

        const localSettings = this.getAll();
        const hasLocalSettings = localStorage.getItem(this.STORAGE_KEY) !== null;

        // Try to fetch from server
        const serverSettings = await this.fetchFromServer();

        if (serverSettings) {
            // Server has settings - merge with local (server wins for conflicts)
            const merged = { ...localSettings, ...serverSettings };
            this.saveAll(merged, false);  // Don't sync back to server
            console.log('[Moonfin] Merged server settings with local');
        } else if (hasLocalSettings) {
            // No server settings, but we have local - push to server
            await this.saveToServer(localSettings);
            console.log('[Moonfin] Pushed local settings to server');
        }
    },

    initSync() {
        // Listen for user login events
        document.addEventListener('viewshow', (e) => {
            if (window.ApiClient?.isLoggedIn?.()) {
                // Debounce sync
                if (!this._syncDebounce) {
                    this._syncDebounce = setTimeout(() => {
                        this.sync();
                        this._syncDebounce = null;
                    }, 1000);
                }
            }
        });

        // Initial sync if already logged in
        if (window.ApiClient?.isLoggedIn?.()) {
            setTimeout(() => this.sync(), 2000);
        }
    },

    getSyncStatus() {
        return {
            available: this.syncState.serverAvailable,
            lastSync: this.syncState.lastSyncTime,
            error: this.syncState.lastSyncError,
            syncing: this.syncState.syncing
        };
    }
};


// === components/navbar.js ===
const Navbar = {
    container: null,
    initialized: false,
    libraries: [],
    currentUser: null,

    async init() {
        if (this.initialized) return;

        console.log('[Moonfin] Initializing navbar...');

        await this.waitForApi();

        this.createNavbar();

        await this.loadUserData();

        this.setupEventListeners();

        this.startClock();

        this.updateVisibility();

        this.initialized = true;
        console.log('[Moonfin] Navbar initialized');
    },

    shouldShowNavbar() {
        const path = window.location.hash || window.location.pathname;
        const adminPages = [
            '/dashboard',
            '/configurationpage',
            '/installedplugins',
            '/availableplugins',
            '/scheduledtasks',
            '/devices',
            '/serveractivity',
            '/notificationsettings',
            '/networking',
            '/dlna',
            '/livetv',
            '/encodingsettings',
            '/playback',
            '/metadata'
        ];
        
        const lowerPath = path.toLowerCase();
        return !adminPages.some(page => lowerPath.includes(page));
    },

    updateVisibility() {
        if (!this.container) return;
        
        const shouldShow = this.shouldShowNavbar();
        this.container.style.display = shouldShow ? '' : 'none';
        document.body.classList.toggle('moonfin-navbar-active', shouldShow);
    },

    waitForApi() {
        return new Promise((resolve) => {
            const check = () => {
                if (API.getApiClient()) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    },

    createNavbar() {
        const existing = document.querySelector('.moonfin-navbar');
        if (existing) {
            existing.remove();
        }

        const settings = Storage.getAll();
        const overlayColor = Storage.getColorRgba(settings.navbarOverlayColor, settings.navbarOverlayOpacity);

        this.container = document.createElement('div');
        this.container.className = 'moonfin-navbar';
        this.container.innerHTML = `
            <div class="moonfin-navbar-content">
                <!-- Left section: User -->
                <div class="moonfin-navbar-left">
                    <button class="moonfin-user-btn" title="Switch User">
                        <div class="moonfin-user-avatar">
                            <svg viewBox="0 0 24 24" class="moonfin-user-icon">
                                <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/>
                            </svg>
                        </div>
                    </button>
                </div>

                <!-- Center section: Navigation buttons -->
                <div class="moonfin-navbar-center" style="background: ${overlayColor}">
                    <button class="moonfin-nav-btn moonfin-nav-home" data-action="home" title="Home">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-search" data-action="search" title="Search">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-shuffle ${!settings.showShuffleButton ? 'hidden' : ''}" data-action="shuffle" title="Shuffle">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M14.83 13.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13M14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-genres ${!settings.showGenresButton ? 'hidden' : ''}" data-action="genres" title="Genres">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-favorites ${!settings.showFavoritesButton ? 'hidden' : ''}" data-action="favorites" title="Favorites">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-cast" data-action="cast" title="Cast to Device">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2a9 9 0 0 1 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-syncplay" data-action="syncplay" title="SyncPlay">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-settings" data-action="settings" title="Settings">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66"/>
                        </svg>
                    </button>
                    <button class="moonfin-nav-btn moonfin-nav-jellyseerr hidden" data-action="jellyseerr" title="Jellyseerr">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l4.59-4.59L16 11l-6 6z"/>
                        </svg>
                    </button>
                    <div class="moonfin-nav-divider ${!settings.showLibrariesInToolbar ? 'hidden' : ''}"></div>
                    <div class="moonfin-nav-libraries ${!settings.showLibrariesInToolbar ? 'hidden' : ''}">
                        <!-- Libraries will be inserted here -->
                    </div>
                </div>

                <!-- Right section: Clock -->
                <div class="moonfin-navbar-right">
                    <div class="moonfin-clock ${!settings.showClock ? 'hidden' : ''}">
                        <span class="moonfin-clock-time">--:--</span>
                    </div>
                </div>
            </div>
        `;

        document.body.insertBefore(this.container, document.body.firstChild);

        document.body.classList.add('moonfin-navbar-active');
    },

    async loadUserData() {
        this.currentUser = await API.getCurrentUser();
        if (this.currentUser) {
            this.updateUserAvatar();
        }

        this.libraries = await API.getUserViews();
        this.updateLibraries();
    },

    updateUserAvatar() {
        const avatarContainer = this.container.querySelector('.moonfin-user-avatar');
        if (!avatarContainer || !this.currentUser) return;

        const avatarUrl = API.getUserAvatarUrl(this.currentUser);
        if (avatarUrl) {
            avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="${this.currentUser.Name}" class="moonfin-user-img">`;
        }
    },

    updateLibraries() {
        const librariesContainer = this.container.querySelector('.moonfin-nav-libraries');
        if (!librariesContainer) return;

        const filteredLibraries = this.libraries.filter(lib => 
            lib.CollectionType !== 'playlists' && 
            lib.CollectionType !== 'boxsets'
        );

        librariesContainer.innerHTML = filteredLibraries.map(lib => `
            <button class="moonfin-nav-btn moonfin-nav-library" data-action="library" data-library-id="${lib.Id}" title="${lib.Name}">
                <span class="moonfin-library-name">${lib.Name}</span>
            </button>
        `).join('');
    },

    setupEventListeners() {
        this.container.addEventListener('click', async (e) => {
            const btn = e.target.closest('.moonfin-nav-btn');
            if (!btn) return;

            const action = btn.dataset.action;
            this.handleNavigation(action, btn);
        });

        const userBtn = this.container.querySelector('.moonfin-user-btn');
        if (userBtn) {
            userBtn.addEventListener('click', () => {
                API.navigateTo('/selectserver.html');
            });
        }

        window.addEventListener('moonfin-settings-changed', (e) => {
            this.applySettings(e.detail);
        });

        window.addEventListener('viewshow', () => {
            this.updateActiveState();
            this.updateVisibility();
        });

        window.addEventListener('hashchange', () => {
            this.updateVisibility();
        });

        window.addEventListener('moonfin-jellyseerr-config', (e) => {
            this.updateJellyseerrButton(e.detail);
        });
    },

    updateJellyseerrButton(config) {
        const btn = this.container?.querySelector('.moonfin-nav-jellyseerr');
        if (!btn) return;

        if (config?.enabled && config?.url) {
            btn.classList.remove('hidden');
            btn.title = config.displayName || 'Jellyseerr';
        } else {
            btn.classList.add('hidden');
        }
    },

    async handleNavigation(action, btn) {
        switch (action) {
            case 'home':
                API.navigateTo('/home.html');
                break;
            case 'search':
                API.navigateTo('/search.html');
                break;
            case 'shuffle':
                await this.handleShuffle();
                break;
            case 'genres':
                const serverId = API.getApiClient()?.serverId();
                API.navigateTo(`/movies.html?tab=1&serverId=${serverId}`);
                break;
            case 'favorites':
                const favServerId = API.getApiClient()?.serverId();
                API.navigateTo(`/list.html?type=Movie&IsFavorite=true&serverId=${favServerId}`);
                break;
            case 'settings':
                Settings.show();
                break;
            case 'jellyseerr':
                Jellyseerr.toggle();
                btn.classList.toggle('active', Jellyseerr.isOpen);
                break;
            case 'cast':
                this.handleCast();
                break;
            case 'syncplay':
                this.handleSyncPlay();
                break;
            case 'library':
                const libraryId = btn.dataset.libraryId;
                if (libraryId) {
                    API.navigateTo(`/list.html?parentId=${libraryId}&serverId=` + API.getApiClient()?.serverId());
                }
                break;
        }
    },

    async handleShuffle() {
        const settings = Storage.getAll();
        const items = await API.getRandomItems({
            contentType: settings.shuffleContentType,
            limit: 1
        });

        if (items.length > 0) {
            API.navigateToItem(items[0].Id);
        }
    },

    handleCast() {
        // Try to open the cast menu
        if (window.require) {
            try {
                const castSenderManager = window.require('components/castSenderManager/castSenderManager');
                if (castSenderManager && castSenderManager.showMenu) {
                    castSenderManager.showMenu();
                    return;
                }
            } catch (e) {
                console.log('[Moonfin] Cast menu not available via require');
            }
        }
        
        // Fallback: navigate to playback settings where cast is available
        API.navigateTo('/playbackconfiguration.html');
    },

    handleSyncPlay() {
        // Navigate to SyncPlay page
        API.navigateTo('/syncplay.html');
    },

    updateActiveState() {
        const path = window.location.pathname + window.location.search;
        
        this.container.querySelectorAll('.moonfin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (path.includes('/home')) {
            this.container.querySelector('.moonfin-nav-home')?.classList.add('active');
        } else if (path.includes('/search')) {
            this.container.querySelector('.moonfin-nav-search')?.classList.add('active');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const parentId = urlParams.get('parentId');
        if (parentId) {
            const libraryBtn = this.container.querySelector(`[data-library-id="${parentId}"]`);
            if (libraryBtn) {
                libraryBtn.classList.add('active');
            }
        }
    },

    startClock() {
        const updateClock = () => {
            const clockElement = this.container.querySelector('.moonfin-clock-time');
            if (!clockElement) return;

            const now = new Date();
            const settings = Storage.getAll();
            
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let suffix = '';

            if (!settings.use24HourClock) {
                suffix = hours >= 12 ? ' PM' : ' AM';
                hours = hours % 12 || 12;
            }

            clockElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}${suffix}`;
        };

        updateClock();
        setInterval(updateClock, 1000);
    },

    applySettings(settings) {
        if (!this.container) return;

        const overlayColor = Storage.getColorRgba(settings.navbarOverlayColor, settings.navbarOverlayOpacity);
        
        const center = this.container.querySelector('.moonfin-navbar-center');
        if (center) {
            center.style.background = overlayColor;
        }

        this.container.querySelector('.moonfin-nav-shuffle')?.classList.toggle('hidden', !settings.showShuffleButton);
        this.container.querySelector('.moonfin-nav-genres')?.classList.toggle('hidden', !settings.showGenresButton);
        this.container.querySelector('.moonfin-nav-favorites')?.classList.toggle('hidden', !settings.showFavoritesButton);
        this.container.querySelector('.moonfin-nav-divider')?.classList.toggle('hidden', !settings.showLibrariesInToolbar);
        this.container.querySelector('.moonfin-nav-libraries')?.classList.toggle('hidden', !settings.showLibrariesInToolbar);
        this.container.querySelector('.moonfin-clock')?.classList.toggle('hidden', !settings.showClock);
    },

    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        document.body.classList.remove('moonfin-navbar-active');
        this.initialized = false;
    }
};


// === components/settings.js ===
const Settings = {
    dialog: null,
    isOpen: false,

    show() {
        if (this.isOpen) return;

        this.createDialog();
        this.dialog.classList.add('open');
        this.isOpen = true;

        setTimeout(() => {
            this.dialog.querySelector('input, select, button')?.focus();
        }, 100);
    },

    hide() {
        if (!this.isOpen) return;

        this.dialog.classList.remove('open');
        setTimeout(() => {
            this.dialog.remove();
            this.dialog = null;
        }, 300);
        this.isOpen = false;
    },

    createDialog() {
        const existing = document.querySelector('.moonfin-settings-dialog');
        if (existing) {
            existing.remove();
        }

        const settings = Storage.getAll();

        this.dialog = document.createElement('div');
        this.dialog.className = 'moonfin-settings-dialog';
        this.dialog.innerHTML = `
            <div class="moonfin-settings-overlay"></div>
            <div class="moonfin-settings-panel">
                <div class="moonfin-settings-header">
                    <h2>Moonfin Settings</h2>
                    <button class="moonfin-settings-close" title="Close">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                <div class="moonfin-settings-content">
                    <!-- Toolbar Section -->
                    <div class="moonfin-settings-section">
                        <h3>Toolbar Buttons</h3>
                        <div class="moonfin-settings-group">
                            <label class="moonfin-settings-toggle">
                                <span>Show Shuffle Button</span>
                                <input type="checkbox" name="showShuffleButton" ${settings.showShuffleButton ? 'checked' : ''}>
                                <span class="moonfin-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="moonfin-settings-group">
                            <label>Shuffle Content Type</label>
                            <select name="shuffleContentType">
                                <option value="both" ${settings.shuffleContentType === 'both' ? 'selected' : ''}>Movies & TV Shows</option>
                                <option value="movies" ${settings.shuffleContentType === 'movies' ? 'selected' : ''}>Movies Only</option>
                                <option value="tv" ${settings.shuffleContentType === 'tv' ? 'selected' : ''}>TV Shows Only</option>
                            </select>
                        </div>
                        <div class="moonfin-settings-group">
                            <label class="moonfin-settings-toggle">
                                <span>Show Genres Button</span>
                                <input type="checkbox" name="showGenresButton" ${settings.showGenresButton ? 'checked' : ''}>
                                <span class="moonfin-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="moonfin-settings-group">
                            <label class="moonfin-settings-toggle">
                                <span>Show Favorites Button</span>
                                <input type="checkbox" name="showFavoritesButton" ${settings.showFavoritesButton ? 'checked' : ''}>
                                <span class="moonfin-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="moonfin-settings-group">
                            <label class="moonfin-settings-toggle">
                                <span>Show Libraries in Toolbar</span>
                                <input type="checkbox" name="showLibrariesInToolbar" ${settings.showLibrariesInToolbar ? 'checked' : ''}>
                                <span class="moonfin-toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Display Section -->
                    <div class="moonfin-settings-section">
                        <h3>Display</h3>
                        <div class="moonfin-settings-group">
                            <label class="moonfin-settings-toggle">
                                <span>Show Clock</span>
                                <input type="checkbox" name="showClock" ${settings.showClock ? 'checked' : ''}>
                                <span class="moonfin-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="moonfin-settings-group">
                            <label class="moonfin-settings-toggle">
                                <span>Use 24-Hour Clock</span>
                                <input type="checkbox" name="use24HourClock" ${settings.use24HourClock ? 'checked' : ''}>
                                <span class="moonfin-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="moonfin-settings-group">
                            <label>Seasonal Effect</label>
                            <select name="seasonalSurprise">
                                ${Object.entries(Storage.seasonalOptions).map(([key, value]) => `
                                    <option value="${key}" ${settings.seasonalSurprise === key ? 'selected' : ''}>${value.icon} ${value.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="moonfin-settings-footer">
                    <div class="moonfin-sync-status" id="moonfinSyncStatus">
                        <span class="moonfin-sync-indicator"></span>
                        <span class="moonfin-sync-text">Checking sync status...</span>
                    </div>
                    <div class="moonfin-settings-buttons">
                        <button class="moonfin-settings-reset">Reset to Defaults</button>
                        <button class="moonfin-settings-sync" title="Sync settings with server">Sync</button>
                        <button class="moonfin-settings-save">Save & Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.dialog);
        this.setupEventListeners();
        this.updateSyncStatus();
    },

    async updateSyncStatus() {
        const statusEl = this.dialog?.querySelector('#moonfinSyncStatus');
        if (!statusEl) return;

        const indicator = statusEl.querySelector('.moonfin-sync-indicator');
        const text = statusEl.querySelector('.moonfin-sync-text');

        const syncStatus = Storage.getSyncStatus();

        if (syncStatus.syncing) {
            indicator.className = 'moonfin-sync-indicator syncing';
            text.textContent = 'Syncing...';
        } else if (syncStatus.available === null) {
            indicator.className = 'moonfin-sync-indicator checking';
            text.textContent = 'Checking server...';
            await Storage.pingServer();
            this.updateSyncStatus();
        } else if (syncStatus.available) {
            indicator.className = 'moonfin-sync-indicator connected';
            if (syncStatus.lastSync) {
                const ago = Math.round((Date.now() - syncStatus.lastSync) / 1000);
                text.textContent = `Synced ${ago < 60 ? ago + 's' : Math.round(ago / 60) + 'm'} ago`;
            } else {
                text.textContent = 'Server sync available';
            }
        } else {
            indicator.className = 'moonfin-sync-indicator disconnected';
            text.textContent = syncStatus.error || 'Server sync unavailable';
        }
    },

    setupEventListeners() {
        this.dialog.querySelector('.moonfin-settings-close')?.addEventListener('click', () => {
            this.hide();
        });

        this.dialog.querySelector('.moonfin-settings-overlay')?.addEventListener('click', () => {
            this.hide();
        });

        this.dialog.querySelector('.moonfin-settings-save')?.addEventListener('click', () => {
            this.saveSettings();
            this.hide();
        });

        this.dialog.querySelector('.moonfin-settings-reset')?.addEventListener('click', () => {
            if (confirm('Reset all Moonfin settings to defaults?')) {
                Storage.reset();
                this.hide();
                this.show(); // Reopen with defaults
            }
        });

        this.dialog.querySelector('.moonfin-settings-sync')?.addEventListener('click', async () => {
            const syncBtn = this.dialog.querySelector('.moonfin-settings-sync');
            syncBtn.disabled = true;
            syncBtn.textContent = 'Syncing...';
            
            await Storage.sync();
            await this.updateSyncStatus();
            
            syncBtn.disabled = false;
            syncBtn.textContent = 'Sync';
            
            this.hide();
            setTimeout(() => this.show(), 350);
        });

        this.dialog.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => {
                this.previewSettings();
            });
        });

        this.dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    },

    getFormValues() {
        const form = {};
        
        this.dialog.querySelectorAll('input[type="checkbox"]').forEach(input => {
            form[input.name] = input.checked;
        });

        this.dialog.querySelectorAll('select').forEach(select => {
            const value = select.value;
            // Convert to number if it's a numeric value
            form[select.name] = isNaN(value) ? value : parseInt(value, 10);
        });

        this.dialog.querySelectorAll('input[type="range"]').forEach(input => {
            form[input.name] = parseInt(input.value, 10);
        });

        return form;
    },

    previewSettings() {
        const values = this.getFormValues();
        window.dispatchEvent(new CustomEvent('moonfin-settings-preview', { detail: values }));
    },

    saveSettings() {
        const values = this.getFormValues();
        Storage.saveAll(values);
        console.log('[Moonfin] Settings saved:', values);
    }
};


// === components/jellyseerr.js ===
const Jellyseerr = {
    container: null,
    iframe: null,
    isOpen: false,
    config: null,

    async init() {
        await this.fetchConfig();
        
        if (this.config?.enabled && this.config?.url) {
            console.log('[Moonfin] Jellyseerr enabled:', this.config.url);
            window.dispatchEvent(new CustomEvent('moonfin-jellyseerr-config', { 
                detail: this.config 
            }));
        }
    },

    async fetchConfig() {
        try {
            const serverUrl = window.ApiClient?.serverAddress?.() || '';
            const token = window.ApiClient?.accessToken?.();
            
            if (!serverUrl || !token) {
                console.log('[Moonfin] Cannot fetch Jellyseerr config - not authenticated');
                return;
            }

            const deviceInfo = Device.getInfo();
            const params = new URLSearchParams({
                deviceType: deviceInfo.type,
                isMobile: deviceInfo.isMobile,
                hasTouch: deviceInfo.hasTouch
            });

            const response = await fetch(`${serverUrl}/Moonfin/Jellyseerr/Config?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `MediaBrowser Token="${token}"`
                }
            });

            if (response.ok) {
                this.config = await response.json();
            }
        } catch (e) {
            console.error('[Moonfin] Failed to fetch Jellyseerr config:', e);
        }
    },

    open() {
        if (!this.config?.enabled || !this.config?.url) {
            console.warn('[Moonfin] Jellyseerr not configured');
            return;
        }

        if (this.config.openInNewTab) {
            window.open(this.config.url, '_blank');
            return;
        }

        if (this.isOpen) return;

        this.createContainer();
        this.isOpen = true;

        document.body.classList.add('moonfin-jellyseerr-open');

        requestAnimationFrame(() => {
            this.container.classList.add('open');
        });
    },

    close() {
        if (!this.isOpen) return;

        this.container.classList.remove('open');
        document.body.classList.remove('moonfin-jellyseerr-open');

        setTimeout(() => {
            if (this.container) {
                this.container.remove();
                this.container = null;
                this.iframe = null;
            }
        }, 300);

        this.isOpen = false;
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    createContainer() {
        const existing = document.querySelector('.moonfin-jellyseerr-container');
        if (existing) {
            existing.remove();
        }

        this.container = document.createElement('div');
        this.container.className = 'moonfin-jellyseerr-container';
        
        const displayName = this.config?.displayName || 'Jellyseerr';
        
        this.container.innerHTML = `
            <div class="moonfin-jellyseerr-header">
                <div class="moonfin-jellyseerr-title">
                    <svg class="moonfin-jellyseerr-icon" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>${displayName}</span>
                </div>
                <div class="moonfin-jellyseerr-actions">
                    <button class="moonfin-jellyseerr-btn moonfin-jellyseerr-refresh" title="Refresh">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                    </button>
                    <button class="moonfin-jellyseerr-btn moonfin-jellyseerr-external" title="Open in new tab">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                    </button>
                    <button class="moonfin-jellyseerr-btn moonfin-jellyseerr-close" title="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="moonfin-jellyseerr-loading">
                <div class="moonfin-jellyseerr-spinner"></div>
                <span>Loading ${displayName}...</span>
            </div>
            <iframe 
                class="moonfin-jellyseerr-iframe" 
                src="${this.config.url}"
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
            ></iframe>
        `;

        document.body.appendChild(this.container);
        
        this.iframe = this.container.querySelector('.moonfin-jellyseerr-iframe');
        
        this.setupEventListeners();
    },

    setupEventListeners() {
        this.container.querySelector('.moonfin-jellyseerr-close')?.addEventListener('click', () => {
            this.close();
        });

        this.container.querySelector('.moonfin-jellyseerr-refresh')?.addEventListener('click', () => {
            this.refresh();
        });

        this.container.querySelector('.moonfin-jellyseerr-external')?.addEventListener('click', () => {
            window.open(this.config.url, '_blank');
        });

        this.iframe?.addEventListener('load', () => {
            this.container.classList.add('loaded');
        });

        this.iframe?.addEventListener('error', () => {
            this.showError('Failed to load. The site may block embedding.');
        });

        this._escHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this._escHandler);
    },

    refresh() {
        if (this.iframe && this.config?.url) {
            this.container.classList.remove('loaded');
            this.iframe.src = this.config.url;
        }
    },

    showError(message) {
        const loading = this.container?.querySelector('.moonfin-jellyseerr-loading');
        if (loading) {
            loading.innerHTML = `
                <svg viewBox="0 0 24 24" width="48" height="48" style="color: #f44336;">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span style="color: #f44336;">${message}</span>
                <button class="moonfin-jellyseerr-btn" onclick="window.open('${this.config.url}', '_blank')">
                    Open in New Tab
                </button>
            `;
            loading.style.display = 'flex';
        }
    },

    destroy() {
        this.close();
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
        }
    }
};


// === plugin.js ===
const Plugin = {
    version: '1.0.0',
    name: 'Moonfin Web Plugin',
    initialized: false,

    async init() {
        if (this.initialized) return;

        console.log(`[Moonfin] ${this.name} v${this.version} initializing...`);

        Device.detect();

        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        this.loadStyles();
        this.applyDeviceClasses();

        Storage.initSync();

        try {
            await Navbar.init();
            await Jellyseerr.init();
            this.initSeasonalEffects();
        } catch (e) {
            console.error('[Moonfin] Error initializing components:', e);
        }

        this.setupGlobalListeners();

        this.initialized = true;
        console.log('[Moonfin] Plugin initialized successfully');
    },

    applyDeviceClasses() {
        const device = Device.getInfo();
        document.body.classList.toggle('moonfin-mobile', device.isMobile);
        document.body.classList.toggle('moonfin-desktop', device.isDesktop);
        document.body.classList.toggle('moonfin-tv', device.isTV);
        document.body.classList.toggle('moonfin-touch', device.hasTouch);
        document.body.dataset.moonfinDevice = device.type;
    },

    loadStyles() {
        if (document.querySelector('link[href*="moonfin"]') || 
            document.querySelector('style[data-moonfin]')) {
            return;
        }

        const cssUrl = this.getPluginUrl('plugin.css');
        if (cssUrl) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.appendChild(link);
        }
    },

    getPluginUrl(filename) {
        const scripts = document.querySelectorAll('script[src*="moonfin"]');
        if (scripts.length > 0) {
            const scriptSrc = scripts[0].src;
            return scriptSrc.replace(/[^/]+$/, filename);
        }
        return null;
    },

    initSeasonalEffects() {
        const settings = Storage.getAll();
        this.applySeasonalEffect(settings.seasonalSurprise);

        window.addEventListener('moonfin-settings-changed', (e) => {
            this.applySeasonalEffect(e.detail.seasonalSurprise);
        });
    },

    applySeasonalEffect(effect) {
        document.querySelectorAll('.moonfin-seasonal-effect').forEach(el => el.remove());

        if (effect === 'none') return;

        const container = document.createElement('div');
        container.className = `moonfin-seasonal-effect moonfin-seasonal-${effect}`;
        
        const particleCount = effect === 'winter' ? 50 : 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'moonfin-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${5 + Math.random() * 10}s`;
            
            switch (effect) {
                case 'winter':
                    particle.textContent = '❄️';
                    break;
                case 'spring':
                    particle.textContent = ['🌸', '🌼', '🌷'][Math.floor(Math.random() * 3)];
                    break;
                case 'summer':
                    particle.textContent = ['☀️', '🌴', '🏖️'][Math.floor(Math.random() * 3)];
                    break;
                case 'fall':
                    particle.textContent = ['🍁', '🍂', '🍃'][Math.floor(Math.random() * 3)];
                    break;
                case 'halloween':
                    particle.textContent = ['🎃', '👻', '🦇', '🕷️'][Math.floor(Math.random() * 4)];
                    break;
            }
            
            container.appendChild(particle);
        }

        document.body.appendChild(container);
    },

    setupGlobalListeners() {
        window.addEventListener('viewshow', () => {
            this.onPageChange();
            this.injectSettingsMenuItem();
        });

        window.addEventListener('moonfin-settings-preview', (e) => {
            Navbar.applySettings(e.detail);
        });

        window.addEventListener('moonfin-settings-changed', (e) => {
            console.log('[Moonfin] Settings changed:', e.detail);
        });
    },

    injectSettingsMenuItem() {
        // Check if we're on the user settings page
        const hash = window.location.hash || '';
        if (!hash.includes('mypreferencesmenu.html') && !hash.includes('mypreferences.html')) {
            return;
        }

        // Check if already injected
        if (document.querySelector('.moonfin-settings-menu-item')) {
            return;
        }

        // Wait for the settings menu to be available
        setTimeout(() => {
            const settingsListContainer = document.querySelector('.paperList, .listItem-content');
            if (!settingsListContainer) {
                return;
            }

            // Create Moonfin settings menu item
            const moonfinItem = document.createElement('button');
            moonfinItem.className = 'listItem listItem-button emby-button moonfin-settings-menu-item';
            moonfinItem.setAttribute('is', 'emby-button');
            moonfinItem.innerHTML = `
                <div class="listItemBody">
                    <div class="listItemBodyText">🌙 Moonfin</div>
                </div>
            `;

            moonfinItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                Settings.show();
            });

            // Insert at the beginning of the list
            const firstItem = settingsListContainer.querySelector('.listItem');
            if (firstItem) {
                settingsListContainer.insertBefore(moonfinItem, firstItem);
            } else {
                settingsListContainer.appendChild(moonfinItem);
            }
        }, 100);
    },

    onPageChange() {
        const path = window.location.pathname;
        Navbar.updateActiveState();
    },

    destroy() {
        Navbar.destroy();
        Jellyseerr.destroy();
        document.querySelectorAll('.moonfin-seasonal-effect').forEach(el => el.remove());
        this.initialized = false;
        console.log('[Moonfin] Plugin destroyed');
    }
};

(function() {
    if (typeof window !== 'undefined') {
        const initWhenReady = () => {
            if (window.ApiClient || (window.connectionManager && window.connectionManager.currentApiClient())) {
                Plugin.init();
            } else {
                setTimeout(initWhenReady, 500);
            }
        };

        if (document.readyState === 'complete') {
            initWhenReady();
        } else {
            window.addEventListener('load', initWhenReady);
        }
    }
})();


})();

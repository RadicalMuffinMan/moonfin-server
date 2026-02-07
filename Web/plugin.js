// Moonfin Web Plugin - Built 2026-02-07T20:14:11.887Z
// Transpiled for webOS 4+ (Chrome 53+) compatibility
(function() {
"use strict";

"use strict";

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// === utils/device.js ===
const Device = {
  _cache: null,
  detect() {
    if (this._cache) return this._cache;
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua) || hasTouch && width >= 768 && width <= 1024;
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
  /**
   * Normalize an object's keys from PascalCase to camelCase.
   * Jellyfin's serializer uses PascalCase, but our JS code expects camelCase.
   */
  toCamelCase: function (obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    var result = {};
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var camel = key.charAt(0).toLowerCase() + key.slice(1);
      result[camel] = obj[key];
    }
    return result;
  },
  getApiClient() {
    return window.ApiClient || window.connectionManager && window.connectionManager.currentApiClient();
  },
  getCurrentUser() {
    var _this = this;
    return _asyncToGenerator(function* () {
      const api = _this.getApiClient();
      if (!api) return null;
      try {
        const user = yield api.getCurrentUser();
        return user;
      } catch (e) {
        console.error('[Moonfin] Failed to get current user:', e);
        return null;
      }
    })();
  },
  getUserViews() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      const api = _this2.getApiClient();
      if (!api) return [];
      try {
        const userId = api.getCurrentUserId();
        const result = yield api.getUserViews(userId);
        return result.Items || [];
      } catch (e) {
        console.error('[Moonfin] Failed to get user views:', e);
        return [];
      }
    })();
  },
  getRandomItems() {
    var _this3 = this;
    return _asyncToGenerator(function* (options = {}) {
      const api = _this3.getApiClient();
      if (!api) return [];
      const {
        contentType = 'both',
        limit = 10
      } = options;
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
          fields: 'Overview,Genres,CommunityRating,CriticRating,OfficialRating,RunTimeTicks,ProductionYear,ProviderIds',
          imageTypeLimit: 1,
          enableImageTypes: 'Backdrop,Logo,Primary'
        };
        const result = yield api.getItems(userId, params);
        return result.Items || [];
      } catch (e) {
        console.error('[Moonfin] Failed to get random items:', e);
        return [];
      }
    }).apply(this, arguments);
  },
  getImageUrl(item, imageType = 'Backdrop', options = {}) {
    const api = this.getApiClient();
    if (!api || !item) return null;
    const itemId = item.Id;
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 96
    } = options;

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
    serverAvailable: null,
    // null = unknown, true/false
    lastSyncTime: null,
    lastSyncError: null,
    syncing: false
  },
  defaults: {
    // UI Feature Toggles
    navbarEnabled: false,
    // Media Bar Settings
    mediaBarEnabled: false,
    mediaBarContentType: 'both',
    // 'movies', 'tv', 'both'
    mediaBarItemCount: 10,
    mediaBarOverlayOpacity: 50,
    // 0-100
    mediaBarOverlayColor: 'gray',
    // color key
    mediaBarAutoAdvance: true,
    mediaBarIntervalMs: 7000,
    // Toolbar Settings
    showShuffleButton: true,
    showGenresButton: true,
    showFavoritesButton: true,
    showCastButton: true,
    showSyncPlayButton: true,
    showLibrariesInToolbar: true,
    shuffleContentType: 'both',
    // 'movies', 'tv', 'both'

    // Display Settings
    seasonalSurprise: 'none',
    // 'none', 'winter', 'spring', 'summer', 'fall', 'halloween'
    backdropEnabled: true,
    confirmExit: true,
    // UI Customization
    navbarPosition: 'top',
    // 'top', 'bottom'
    showClock: true,
    use24HourClock: false,
    // MDBList Ratings
    mdblistEnabled: false,
    mdblistApiKey: '',
    mdblistRatingSources: ['imdb', 'tmdb', 'tomatoes', 'metacritic']
  },
  colorOptions: {
    'gray': {
      name: 'Gray',
      hex: '#808080'
    },
    'black': {
      name: 'Black',
      hex: '#000000'
    },
    'dark_blue': {
      name: 'Dark Blue',
      hex: '#1A2332'
    },
    'purple': {
      name: 'Purple',
      hex: '#4A148C'
    },
    'teal': {
      name: 'Teal',
      hex: '#00695C'
    },
    'navy': {
      name: 'Navy',
      hex: '#0D1B2A'
    },
    'charcoal': {
      name: 'Charcoal',
      hex: '#36454F'
    },
    'brown': {
      name: 'Brown',
      hex: '#3E2723'
    },
    'dark_red': {
      name: 'Dark Red',
      hex: '#8B0000'
    },
    'dark_green': {
      name: 'Dark Green',
      hex: '#0B4F0F'
    },
    'slate': {
      name: 'Slate',
      hex: '#475569'
    },
    'indigo': {
      name: 'Indigo',
      hex: '#1E3A8A'
    }
  },
  seasonalOptions: {
    'none': {
      name: 'None'
    },
    'winter': {
      name: 'Winter'
    },
    'spring': {
      name: 'Spring'
    },
    'summer': {
      name: 'Summer'
    },
    'fall': {
      name: 'Fall'
    },
    'halloween': {
      name: 'Halloween'
    }
  },
  getAll() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return _objectSpread(_objectSpread({}, this.defaults), JSON.parse(stored));
      }
    } catch (e) {
      console.error('[Moonfin] Failed to read settings:', e);
    }
    return _objectSpread({}, this.defaults);
  },
  get(key, defaultValue = null) {
    const settings = this.getAll();
    return key in settings ? settings[key] : defaultValue !== null ? defaultValue : this.defaults[key];
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
      window.dispatchEvent(new CustomEvent('moonfin-settings-changed', {
        detail: settings
      }));

      // Sync to server if enabled
      if (syncToServer && this.syncState.serverAvailable) {
        this.saveToServer(settings);
      }
    } catch (e) {
      console.error('[Moonfin] Failed to save settings:', e);
    }
  },
  reset() {
    this.saveAll(_objectSpread({}, this.defaults));
  },
  getColorHex(colorKey) {
    var _this$colorOptions$co;
    return ((_this$colorOptions$co = this.colorOptions[colorKey]) === null || _this$colorOptions$co === void 0 ? void 0 : _this$colorOptions$co.hex) || this.colorOptions['gray'].hex;
  },
  getColorRgba(colorKey, opacity = 50) {
    const hex = this.getColorHex(colorKey);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  },
  pingServer() {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      try {
        var _window$ApiClient, _window$ApiClient$ser;
        const serverUrl = ((_window$ApiClient = window.ApiClient) === null || _window$ApiClient === void 0 || (_window$ApiClient$ser = _window$ApiClient.serverAddress) === null || _window$ApiClient$ser === void 0 ? void 0 : _window$ApiClient$ser.call(_window$ApiClient)) || '';
        const response = yield fetch(`${serverUrl}/Moonfin/Ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = API.toCamelCase(yield response.json());
          _this4.syncState.serverAvailable = data.installed && data.settingsSyncEnabled;
          console.log('[Moonfin] Server plugin detected:', data);
          return data;
        }
      } catch (e) {
        console.log('[Moonfin] Server plugin not available:', e.message);
      }
      _this4.syncState.serverAvailable = false;
      return null;
    })();
  },
  getAuthHeader() {
    var _window$ApiClient2, _window$ApiClient2$ac;
    const token = (_window$ApiClient2 = window.ApiClient) === null || _window$ApiClient2 === void 0 || (_window$ApiClient2$ac = _window$ApiClient2.accessToken) === null || _window$ApiClient2$ac === void 0 ? void 0 : _window$ApiClient2$ac.call(_window$ApiClient2);
    if (token) {
      return {
        'Authorization': `MediaBrowser Token="${token}"`
      };
    }
    return {};
  },
  fetchFromServer() {
    var _this5 = this;
    return _asyncToGenerator(function* () {
      if (_this5.syncState.serverAvailable === false) {
        return null;
      }
      try {
        var _window$ApiClient3, _window$ApiClient3$se;
        const serverUrl = ((_window$ApiClient3 = window.ApiClient) === null || _window$ApiClient3 === void 0 || (_window$ApiClient3$se = _window$ApiClient3.serverAddress) === null || _window$ApiClient3$se === void 0 ? void 0 : _window$ApiClient3$se.call(_window$ApiClient3)) || '';
        const response = yield fetch(`${serverUrl}/Moonfin/Settings`, {
          method: 'GET',
          headers: _objectSpread({
            'Content-Type': 'application/json'
          }, _this5.getAuthHeader())
        });
        if (response.ok) {
          const serverSettings = API.toCamelCase(yield response.json());
          console.log('[Moonfin] Fetched settings from server:', serverSettings);
          return _this5.mapServerToLocal(serverSettings);
        } else if (response.status === 404) {
          console.log('[Moonfin] No settings found on server');
          return null;
        }
      } catch (e) {
        console.error('[Moonfin] Failed to fetch from server:', e);
        _this5.syncState.lastSyncError = e.message;
      }
      return null;
    })();
  },
  saveToServer(_x) {
    var _this6 = this;
    return _asyncToGenerator(function* (settings, mergeMode = 'merge') {
      if (_this6.syncState.serverAvailable === false) {
        return false;
      }
      try {
        var _window$ApiClient4, _window$ApiClient4$se;
        _this6.syncState.syncing = true;
        const serverUrl = ((_window$ApiClient4 = window.ApiClient) === null || _window$ApiClient4 === void 0 || (_window$ApiClient4$se = _window$ApiClient4.serverAddress) === null || _window$ApiClient4$se === void 0 ? void 0 : _window$ApiClient4$se.call(_window$ApiClient4)) || '';
        const response = yield fetch(`${serverUrl}/Moonfin/Settings`, {
          method: 'POST',
          headers: _objectSpread({
            'Content-Type': 'application/json'
          }, _this6.getAuthHeader()),
          body: JSON.stringify({
            settings: _this6.mapLocalToServer(settings),
            clientId: _this6.CLIENT_ID,
            mergeMode: mergeMode
          })
        });
        if (response.ok) {
          _this6.syncState.lastSyncTime = Date.now();
          _this6.syncState.lastSyncError = null;
          console.log('[Moonfin] Settings saved to server');
          return true;
        }
      } catch (e) {
        console.error('[Moonfin] Failed to save to server:', e);
        _this6.syncState.lastSyncError = e.message;
      } finally {
        _this6.syncState.syncing = false;
      }
      return false;
    }).apply(this, arguments);
  },
  mapServerToLocal(serverSettings) {
    var _serverSettings$navba, _serverSettings$media, _serverSettings$media2, _serverSettings$media3, _serverSettings$overl, _serverSettings$overl2, _serverSettings$media4, _serverSettings$media5, _serverSettings$showS, _serverSettings$showG, _serverSettings$showF, _serverSettings$showL, _serverSettings$shuff, _serverSettings$seaso, _serverSettings$backd, _serverSettings$confi, _serverSettings$navba2, _serverSettings$showC, _serverSettings$use, _serverSettings$mdbli, _serverSettings$mdbli2, _serverSettings$mdbli3;
    return {
      // UI Feature Toggles
      navbarEnabled: (_serverSettings$navba = serverSettings.navbarEnabled) !== null && _serverSettings$navba !== void 0 ? _serverSettings$navba : this.defaults.navbarEnabled,
      // Media Bar
      mediaBarEnabled: (_serverSettings$media = serverSettings.mediaBarEnabled) !== null && _serverSettings$media !== void 0 ? _serverSettings$media : this.defaults.mediaBarEnabled,
      mediaBarContentType: (_serverSettings$media2 = serverSettings.mediaBarContentType) !== null && _serverSettings$media2 !== void 0 ? _serverSettings$media2 : this.defaults.mediaBarContentType,
      mediaBarItemCount: (_serverSettings$media3 = serverSettings.mediaBarItemCount) !== null && _serverSettings$media3 !== void 0 ? _serverSettings$media3 : this.defaults.mediaBarItemCount,
      mediaBarOverlayOpacity: (_serverSettings$overl = serverSettings.overlayOpacity) !== null && _serverSettings$overl !== void 0 ? _serverSettings$overl : this.defaults.mediaBarOverlayOpacity,
      mediaBarOverlayColor: (_serverSettings$overl2 = serverSettings.overlayColor) !== null && _serverSettings$overl2 !== void 0 ? _serverSettings$overl2 : this.defaults.mediaBarOverlayColor,
      mediaBarAutoAdvance: (_serverSettings$media4 = serverSettings.mediaBarAutoAdvance) !== null && _serverSettings$media4 !== void 0 ? _serverSettings$media4 : this.defaults.mediaBarAutoAdvance,
      mediaBarIntervalMs: (_serverSettings$media5 = serverSettings.mediaBarInterval) !== null && _serverSettings$media5 !== void 0 ? _serverSettings$media5 : this.defaults.mediaBarIntervalMs,
      // Toolbar
      showShuffleButton: (_serverSettings$showS = serverSettings.showShuffleButton) !== null && _serverSettings$showS !== void 0 ? _serverSettings$showS : this.defaults.showShuffleButton,
      showGenresButton: (_serverSettings$showG = serverSettings.showGenresButton) !== null && _serverSettings$showG !== void 0 ? _serverSettings$showG : this.defaults.showGenresButton,
      showFavoritesButton: (_serverSettings$showF = serverSettings.showFavoritesButton) !== null && _serverSettings$showF !== void 0 ? _serverSettings$showF : this.defaults.showFavoritesButton,
      showLibrariesInToolbar: (_serverSettings$showL = serverSettings.showLibrariesInToolbar) !== null && _serverSettings$showL !== void 0 ? _serverSettings$showL : this.defaults.showLibrariesInToolbar,
      shuffleContentType: (_serverSettings$shuff = serverSettings.shuffleContentType) !== null && _serverSettings$shuff !== void 0 ? _serverSettings$shuff : this.defaults.shuffleContentType,
      // Display
      seasonalSurprise: (_serverSettings$seaso = serverSettings.seasonalSurprise) !== null && _serverSettings$seaso !== void 0 ? _serverSettings$seaso : this.defaults.seasonalSurprise,
      backdropEnabled: (_serverSettings$backd = serverSettings.backdropEnabled) !== null && _serverSettings$backd !== void 0 ? _serverSettings$backd : this.defaults.backdropEnabled,
      confirmExit: (_serverSettings$confi = serverSettings.confirmExit) !== null && _serverSettings$confi !== void 0 ? _serverSettings$confi : this.defaults.confirmExit,
      // UI
      navbarPosition: (_serverSettings$navba2 = serverSettings.navbarPosition) !== null && _serverSettings$navba2 !== void 0 ? _serverSettings$navba2 : this.defaults.navbarPosition,
      showClock: (_serverSettings$showC = serverSettings.showClock) !== null && _serverSettings$showC !== void 0 ? _serverSettings$showC : this.defaults.showClock,
      use24HourClock: (_serverSettings$use = serverSettings.use24HourClock) !== null && _serverSettings$use !== void 0 ? _serverSettings$use : this.defaults.use24HourClock,
      // MDBList
      mdblistEnabled: (_serverSettings$mdbli = serverSettings.mdblistEnabled) !== null && _serverSettings$mdbli !== void 0 ? _serverSettings$mdbli : this.defaults.mdblistEnabled,
      mdblistApiKey: (_serverSettings$mdbli2 = serverSettings.mdblistApiKey) !== null && _serverSettings$mdbli2 !== void 0 ? _serverSettings$mdbli2 : this.defaults.mdblistApiKey,
      mdblistRatingSources: (_serverSettings$mdbli3 = serverSettings.mdblistRatingSources) !== null && _serverSettings$mdbli3 !== void 0 ? _serverSettings$mdbli3 : this.defaults.mdblistRatingSources
    };
  },
  mapLocalToServer(localSettings) {
    return {
      // UI Feature Toggles
      navbarEnabled: localSettings.navbarEnabled,
      // Media Bar
      mediaBarEnabled: localSettings.mediaBarEnabled,
      mediaBarContentType: localSettings.mediaBarContentType,
      mediaBarItemCount: localSettings.mediaBarItemCount,
      overlayOpacity: localSettings.mediaBarOverlayOpacity,
      overlayColor: localSettings.mediaBarOverlayColor,
      mediaBarAutoAdvance: localSettings.mediaBarAutoAdvance,
      mediaBarInterval: localSettings.mediaBarIntervalMs,
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
      use24HourClock: localSettings.use24HourClock,
      // MDBList
      mdblistEnabled: localSettings.mdblistEnabled,
      mdblistApiKey: localSettings.mdblistApiKey,
      mdblistRatingSources: localSettings.mdblistRatingSources
    };
  },
  sync() {
    var _this7 = this;
    return _asyncToGenerator(function* () {
      console.log('[Moonfin] Starting settings sync...');

      // Check if server plugin is available
      const pingResult = yield _this7.pingServer();
      if (!(pingResult !== null && pingResult !== void 0 && pingResult.installed) || !(pingResult !== null && pingResult !== void 0 && pingResult.settingsSyncEnabled)) {
        console.log('[Moonfin] Server sync not available');
        return;
      }
      const hasLocalSettings = localStorage.getItem(_this7.STORAGE_KEY) !== null;
      const localSettings = _this7.getAll();

      // Try to fetch from server
      const serverSettings = yield _this7.fetchFromServer();
      if (serverSettings && hasLocalSettings) {
        // Both exist: local wins — user's local changes are most recent
        const merged = _objectSpread(_objectSpread({}, serverSettings), localSettings);
        _this7.saveAll(merged, false); // Don't re-dispatch to server yet
        // Push merged result to server so it stays in sync
        yield _this7.saveToServer(merged);
        console.log('[Moonfin] Merged settings (local wins), pushed to server');
      } else if (serverSettings && !hasLocalSettings) {
        // Fresh install: restore from server
        _this7.saveAll(serverSettings, false);
        console.log('[Moonfin] Restored settings from server (fresh install)');
      } else if (hasLocalSettings) {
        // No server settings, but we have local - push to server
        yield _this7.saveToServer(localSettings);
        console.log('[Moonfin] Pushed local settings to server');
      }
    })();
  },
  initSync() {
    var _window$ApiClient5, _window$ApiClient5$is;
    // Only sync once on initial load — repeated syncs on every viewshow
    // can overwrite local changes with stale server data
    if (this._initialSyncDone) return;
    this._initialSyncDone = true;

    // Initial sync if already logged in
    if ((_window$ApiClient5 = window.ApiClient) !== null && _window$ApiClient5 !== void 0 && (_window$ApiClient5$is = _window$ApiClient5.isLoggedIn) !== null && _window$ApiClient5$is !== void 0 && _window$ApiClient5$is.call(_window$ApiClient5)) {
      setTimeout(() => this.sync(), 2000);
    } else {
      // Wait for login then sync once
      const onLogin = () => {
        var _window$ApiClient6, _window$ApiClient6$is;
        if ((_window$ApiClient6 = window.ApiClient) !== null && _window$ApiClient6 !== void 0 && (_window$ApiClient6$is = _window$ApiClient6.isLoggedIn) !== null && _window$ApiClient6$is !== void 0 && _window$ApiClient6$is.call(_window$ApiClient6)) {
          document.removeEventListener('viewshow', onLogin);
          setTimeout(() => this.sync(), 2000);
        }
      };
      document.addEventListener('viewshow', onLogin);
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

// === utils/mdblist.js ===
/**
 * Moonfin MDBList Integration
 * Fetches and displays ratings from MDBList via the server proxy.
 */
var MdbList = {
  // In-memory cache: key = "type:tmdbId" => { ratings, fetchedAt }
  _cache: {},
  _cacheTtlMs: 30 * 60 * 1000,
  // 30 minutes client-side cache

  // Rating source metadata
  sources: {
    imdb: {
      name: 'IMDb',
      icon: 'IMDb',
      color: '#F5C518',
      textColor: '#000'
    },
    tmdb: {
      name: 'TMDb',
      icon: 'TMDb',
      color: '#01D277',
      textColor: '#fff'
    },
    trakt: {
      name: 'Trakt',
      icon: 'Trakt',
      color: '#ED1C24',
      textColor: '#fff'
    },
    tomatoes: {
      name: 'Rotten Tomatoes',
      icon: '🍅',
      color: '#FA320A',
      textColor: '#fff'
    },
    popcorn: {
      name: 'RT Audience',
      icon: '🍿',
      color: '#FA320A',
      textColor: '#fff'
    },
    metacritic: {
      name: 'Metacritic',
      icon: 'MC',
      color: '#FFCC34',
      textColor: '#000'
    },
    metacriticuser: {
      name: 'Metacritic User',
      icon: 'MC',
      color: '#00CE7A',
      textColor: '#000'
    },
    letterboxd: {
      name: 'Letterboxd',
      icon: 'LB',
      color: '#00E054',
      textColor: '#fff'
    },
    rogerebert: {
      name: 'RogerEbert',
      icon: 'RE',
      color: '#E50914',
      textColor: '#fff'
    },
    myanimelist: {
      name: 'MyAnimeList',
      icon: 'MAL',
      color: '#2E51A2',
      textColor: '#fff'
    },
    anilist: {
      name: 'AniList',
      icon: 'AL',
      color: '#02A9FF',
      textColor: '#fff'
    }
  },
  /**
   * Check if MDBList is enabled in user settings.
   */
  isEnabled: function () {
    var settings = Storage.getAll();
    return settings.mdblistEnabled === true;
  },
  /**
   * Get the list of selected rating sources from user settings.
   * Returns all sources if none are explicitly selected.
   */
  getSelectedSources: function () {
    var settings = Storage.getAll();
    var selected = settings.mdblistRatingSources;
    if (selected && selected.length > 0) {
      return selected;
    }
    // Default: show the most common ones
    return ['imdb', 'tmdb', 'tomatoes', 'metacritic'];
  },
  /**
   * Determine MDBList content type from a Jellyfin item.
   * Returns 'movie' or 'show', or null if not supported.
   */
  getContentType: function (item) {
    if (!item) return null;
    var type = item.Type || item.type;
    if (type === 'Movie') return 'movie';
    if (type === 'Series') return 'show';
    // Episodes and Seasons map to their parent series
    if (type === 'Episode' || type === 'Season') return 'show';
    return null;
  },
  /**
   * Get TMDb ID from a Jellyfin item.
   */
  getTmdbId: function (item) {
    if (!item) return null;
    var providerIds = item.ProviderIds || item.providerIds;
    if (!providerIds) return null;
    return providerIds.Tmdb || providerIds.tmdb || null;
  },
  /**
   * Fetch ratings for a Jellyfin item.
   * Returns a promise resolving to an array of rating objects, or empty array.
   */
  fetchRatings: function (item) {
    if (!this.isEnabled()) return Promise.resolve([]);
    var contentType = this.getContentType(item);
    var tmdbId = this.getTmdbId(item);
    if (!contentType || !tmdbId) return Promise.resolve([]);
    return this.fetchRatingsByTmdb(contentType, tmdbId);
  },
  /**
   * Fetch ratings by content type and TMDb ID.
   */
  fetchRatingsByTmdb: function (type, tmdbId) {
    var self = this;
    var cacheKey = type + ':' + tmdbId;

    // Check client cache
    var cached = this._cache[cacheKey];
    if (cached && Date.now() - cached.fetchedAt < this._cacheTtlMs) {
      return Promise.resolve(cached.ratings);
    }
    var api = API.getApiClient();
    if (!api) return Promise.resolve([]);
    var url = api.getUrl('Moonfin/MdbList/Ratings', {
      type: type,
      tmdbId: tmdbId
    });
    return new Promise(function (resolve) {
      api.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        headers: {
          'Authorization': 'MediaBrowser Token="' + api.accessToken() + '"'
        }
      }).then(function (response) {
        var resp = API.toCamelCase(response);
        if (resp && resp.success && resp.ratings) {
          // Normalize rating keys
          var ratings = [];
          for (var i = 0; i < resp.ratings.length; i++) {
            ratings.push(API.toCamelCase(resp.ratings[i]));
          }
          self._cache[cacheKey] = {
            ratings: ratings,
            fetchedAt: Date.now()
          };
          resolve(ratings);
        } else {
          if (resp && resp.error) {
            console.warn('[Moonfin] MDBList:', resp.error);
          }
          resolve([]);
        }
      }, function (err) {
        console.warn('[Moonfin] MDBList fetch failed:', err);
        resolve([]);
      });
    });
  },
  /**
   * Format a rating value for display based on source.
   * MDBList returns `value` (native scale) and `score` (0-100 normalized).
   */
  formatRating: function (rating) {
    if (!rating || !rating.source) return null;
    var source = rating.source.toLowerCase();
    var value = rating.value;
    var score = rating.score;
    if (value == null && score == null) return null;

    // Use native value when available for better display
    switch (source) {
      case 'imdb':
        // IMDb: 0-10 scale
        return value != null ? value.toFixed(1) : score != null ? (score / 10).toFixed(1) : null;
      case 'tmdb':
        // TMDb: 0-10 scale
        return value != null ? value.toFixed(0) + '%' : score != null ? score.toFixed(0) + '%' : null;
      case 'tomatoes':
      case 'popcorn':
      case 'metacritic':
      case 'metacriticuser':
        // Percentage-based
        return score != null ? score.toFixed(0) + '%' : value != null ? value.toFixed(0) + '%' : null;
      case 'letterboxd':
        // Letterboxd: 0-5 scale (value), score is 0-100
        return value != null ? value.toFixed(1) : score != null ? (score / 20).toFixed(1) : null;
      case 'trakt':
        // Trakt: percentage
        return score != null ? score.toFixed(0) + '%' : null;
      case 'rogerebert':
        // Roger Ebert: 0-4 scale (value), score is 0-100
        return value != null ? value.toFixed(1) + '/4' : score != null ? score.toFixed(0) + '%' : null;
      case 'myanimelist':
        // MAL: 0-10 scale
        return value != null ? value.toFixed(1) : score != null ? (score / 10).toFixed(1) : null;
      case 'anilist':
        // AniList: percentage
        return score != null ? score.toFixed(0) + '%' : null;
      default:
        return score != null ? score.toFixed(0) + '%' : value != null ? String(value) : null;
    }
  },
  /**
   * Get display info for a source.
   */
  getSourceInfo: function (source) {
    return this.sources[source] || {
      name: source,
      icon: source,
      color: '#666',
      textColor: '#fff'
    };
  },
  /**
   * Build an inline ratings HTML string for the selected sources.
   * Used in media bar and details screen.
   * @param {Array} ratings - Array of rating objects from MDBList
   * @param {string} mode - 'compact' for media bar, 'full' for details
   * @returns {string} HTML string
   */
  buildRatingsHtml: function (ratings, mode) {
    if (!ratings || ratings.length === 0) return '';
    var selectedSources = this.getSelectedSources();
    var html = '';
    for (var i = 0; i < selectedSources.length; i++) {
      var source = selectedSources[i];
      // Find this source in the ratings
      var rating = null;
      for (var j = 0; j < ratings.length; j++) {
        if (ratings[j].source && ratings[j].source.toLowerCase() === source) {
          rating = ratings[j];
          break;
        }
      }
      if (!rating) continue;
      var formatted = this.formatRating(rating);
      if (!formatted) continue;
      var info = this.getSourceInfo(source);
      if (mode === 'compact') {
        html += '<span class="moonfin-mdblist-rating-compact">' + '<span class="moonfin-mdblist-badge" style="background:' + info.color + ';color:' + info.textColor + '">' + info.icon + '</span>' + '<span class="moonfin-mdblist-value">' + formatted + '</span>' + '</span>';
      } else {
        html += '<div class="moonfin-mdblist-rating-full">' + '<span class="moonfin-mdblist-badge-lg" style="background:' + info.color + ';color:' + info.textColor + '">' + info.icon + '</span>' + '<div class="moonfin-mdblist-rating-info">' + '<span class="moonfin-mdblist-rating-value">' + formatted + '</span>' + '<span class="moonfin-mdblist-rating-name">' + info.name + '</span>' + '</div>' + '</div>';
      }
    }
    return html;
  },
  /**
   * Build a simple text string of ratings for inline use.
   * @param {Array} ratings - Array of rating objects from MDBList
   * @returns {string} Text like "IMDb 7.5 • 🍅 85% • MC 72%"
   */
  buildRatingsText: function (ratings) {
    if (!ratings || ratings.length === 0) return '';
    var selectedSources = this.getSelectedSources();
    var parts = [];
    for (var i = 0; i < selectedSources.length; i++) {
      var source = selectedSources[i];
      var rating = null;
      for (var j = 0; j < ratings.length; j++) {
        if (ratings[j].source && ratings[j].source.toLowerCase() === source) {
          rating = ratings[j];
          break;
        }
      }
      if (!rating) continue;
      var formatted = this.formatRating(rating);
      if (!formatted) continue;
      var info = this.getSourceInfo(source);
      parts.push(info.icon + ' ' + formatted);
    }
    return parts.join('  \u2022  ');
  }
};

// === utils/tv-navigation.js ===
/**
 * TV Navigation Utility
 * Provides 5-way navigation (D-pad) support for TV devices
 * Works with webOS, Tizen, and other smart TV platforms
 */

const TVNavigation = {
  enabled: false,
  focusableSelector: '.moonfin-focusable, .moonfin-nav-btn, .moonfin-user-btn, .moonfin-library-btn, .moonfin-mediabar-nav-btn, .moonfin-mediabar-dot, .moonfin-jellyseerr-fab',
  currentFocusIndex: -1,
  focusableElements: [],
  // Key codes for different TV platforms
  KEYS: {
    LEFT: [37, 'ArrowLeft'],
    RIGHT: [39, 'ArrowRight'],
    UP: [38, 'ArrowUp'],
    DOWN: [40, 'ArrowDown'],
    ENTER: [13, 'Enter'],
    BACK: [461, 10009, 8, 27, 'Escape', 'GoBack'],
    // webOS, Tizen, backspace, escape
    PLAY: [415, 179],
    PAUSE: [19, 179],
    STOP: [413],
    REWIND: [412],
    FAST_FORWARD: [417]
  },
  /**
   * Initialize TV navigation
   */
  init() {
    // Check if we're on a TV
    if (!this.isTV()) {
      console.log('[Moonfin TV] Not a TV device, skipping TV navigation');
      return;
    }
    console.log('[Moonfin TV] Initializing TV navigation...');
    this.enabled = true;

    // Add TV mode class to body
    document.body.classList.add('moonfin-tv-mode');

    // Setup keyboard/remote event listeners
    this.setupKeyboardListeners();

    // Setup mutation observer to track new focusable elements
    this.setupMutationObserver();

    // Initial focus scan
    this.updateFocusableElements();
    console.log('[Moonfin TV] TV navigation initialized');
  },
  /**
   * Check if running on a TV platform
   */
  isTV() {
    var _window$NativeShell, _window$NativeShell$g, _Device$isTV;
    // Check NativeShell (jellyfin-webos/tizen provides this)
    if (((_window$NativeShell = window.NativeShell) === null || _window$NativeShell === void 0 || (_window$NativeShell = _window$NativeShell.AppHost) === null || _window$NativeShell === void 0 || (_window$NativeShell$g = _window$NativeShell.getDefaultLayout) === null || _window$NativeShell$g === void 0 ? void 0 : _window$NativeShell$g.call(_window$NativeShell)) === 'tv') {
      return true;
    }

    // Check user agent
    const ua = navigator.userAgent.toLowerCase();
    if (/tv|tizen|webos|smart-tv|netcast|hbbtv|vidaa|viera/i.test(ua)) {
      return true;
    }

    // Check Device utility
    if (typeof Device !== 'undefined' && (_Device$isTV = Device.isTV) !== null && _Device$isTV !== void 0 && _Device$isTV.call(Device)) {
      return true;
    }
    return false;
  },
  /**
   * Setup keyboard event listeners for remote control
   */
  setupKeyboardListeners() {
    // Use capture phase to intercept events before jellyfin-web handlers
    document.addEventListener('keydown', e => {
      if (!this.enabled) return;
      const key = e.key || e.keyCode;

      // Check if we're focused on a Moonfin element
      const activeEl = document.activeElement;
      const isMoonfinElement = activeEl && (activeEl.classList.contains('moonfin-nav-btn') || activeEl.classList.contains('moonfin-user-btn') || activeEl.classList.contains('moonfin-mediabar-nav-btn') || activeEl.classList.contains('moonfin-mediabar-dot') || activeEl.classList.contains('moonfin-focusable') || activeEl.classList.contains('moonfin-focused') || activeEl.classList.contains('moonfin-details-btn') || activeEl.classList.contains('moonfin-details-close') || activeEl.tagName === 'BODY');

      // Check if we're in the mediabar area
      const isInMediabar = activeEl && activeEl.closest('.moonfin-mediabar');

      // Handle mediabar-specific left/right navigation (change slides)
      if (isInMediabar) {
        if (this.matchKey(key, this.KEYS.LEFT)) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof MediaBar !== 'undefined' && MediaBar.prevSlide) {
            MediaBar.prevSlide();
          }
          return;
        } else if (this.matchKey(key, this.KEYS.RIGHT)) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof MediaBar !== 'undefined' && MediaBar.nextSlide) {
            MediaBar.nextSlide();
          }
          return;
        } else if (this.matchKey(key, this.KEYS.DOWN)) {
          // From mediabar, go to Jellyfin content
          e.preventDefault();
          e.stopPropagation();
          this.focusJellyfinContent();
          return;
        } else if (this.matchKey(key, this.KEYS.UP)) {
          // From mediabar, go to navbar
          e.preventDefault();
          e.stopPropagation();
          const homeBtn = document.querySelector('.moonfin-navbar .moonfin-nav-home');
          if (homeBtn) {
            this.focusElement(homeBtn);
          }
          return;
        } else if (this.matchKey(key, this.KEYS.ENTER)) {
          // Enter on mediabar - navigate to item
          e.preventDefault();
          e.stopPropagation();
          if (typeof MediaBar !== 'undefined' && MediaBar.items && MediaBar.items[MediaBar.currentIndex]) {
            const item = MediaBar.items[MediaBar.currentIndex];
            if (typeof Details !== 'undefined') {
              Details.showDetails(item.Id, item.Type);
            } else {
              API.navigateToItem(item.Id);
            }
          }
          return;
        }
      }
      if (!isMoonfinElement) return;

      // Navigation
      if (this.matchKey(key, this.KEYS.LEFT)) {
        e.preventDefault();
        e.stopPropagation();
        this.navigate('left');
      } else if (this.matchKey(key, this.KEYS.RIGHT)) {
        e.preventDefault();
        e.stopPropagation();
        this.navigate('right');
      } else if (this.matchKey(key, this.KEYS.UP)) {
        e.preventDefault();
        e.stopPropagation();
        this.navigate('up');
      } else if (this.matchKey(key, this.KEYS.DOWN)) {
        e.preventDefault();
        e.stopPropagation();
        this.navigate('down');
      } else if (this.matchKey(key, this.KEYS.ENTER)) {
        e.preventDefault();
        e.stopPropagation();
        this.activateFocused();
      } else if (this.matchKey(key, this.KEYS.BACK)) {
        this.handleBack(e);
      }
    }, true); // <-- capture phase
  },
  /**
   * Check if a key matches any in the key array
   */
  matchKey(key, keyArray) {
    return keyArray.includes(key) || keyArray.includes(parseInt(key));
  },
  /**
   * Setup mutation observer to track DOM changes
   */
  setupMutationObserver() {
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
  /**
   * Update the list of focusable elements
   */
  updateFocusableElements() {
    this.focusableElements = Array.from(document.querySelectorAll(this.focusableSelector)).filter(el => {
      // Filter out hidden or disabled elements
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled && !el.classList.contains('hidden');
    });
  },
  /**
   * Navigate in a direction
   */
  navigate(direction) {
    this.updateFocusableElements();
    const currentFocused = document.activeElement;
    const currentIndex = this.focusableElements.indexOf(currentFocused);

    // Check if we're in the navbar and trying to navigate down
    if (direction === 'down' && this.isInNavbar(currentFocused)) {
      // First check if mediabar is visible
      if (this.focusMediabar()) {
        return;
      }
      // Otherwise hand off focus to Jellyfin content below
      if (this.focusJellyfinContent()) {
        return;
      }
    }

    // Check if we're in Jellyfin content and trying to navigate up
    if (direction === 'up' && !this.isInNavbar(currentFocused) && !this.isInMediabar(currentFocused)) {
      // First check if mediabar is visible
      if (this.focusMediabar()) {
        return;
      }
      // Otherwise try navbar
      const navbar = document.querySelector('.moonfin-navbar');
      if (navbar) {
        const navbarRect = navbar.getBoundingClientRect();
        const currentRect = currentFocused.getBoundingClientRect();

        // If we're near the top, try to focus navbar
        if (currentRect.top < navbarRect.bottom + 200) {
          const homeBtn = navbar.querySelector('.moonfin-nav-home');
          if (homeBtn) {
            this.focusElement(homeBtn);
            return;
          }
        }
      }
    }
    if (this.focusableElements.length === 0) return;
    let nextElement = null;
    if (currentIndex === -1) {
      // No current focus, focus first element
      nextElement = this.focusableElements[0];
    } else {
      // Find next element based on direction
      nextElement = this.findNextElement(currentFocused, direction);
    }
    if (nextElement) {
      this.focusElement(nextElement);
    } else if (direction === 'down') {
      // No moonfin element found below, try Jellyfin content
      this.focusJellyfinContent();
    }
  },
  /**
   * Check if element is in the Moonfin navbar
   */
  isInNavbar(element) {
    return element && element.closest('.moonfin-navbar') !== null;
  },
  /**
   * Check if element is in the Moonfin mediabar
   */
  isInMediabar(element) {
    return element && element.closest('.moonfin-mediabar') !== null;
  },
  /**
   * Focus the mediabar if visible
   */
  focusMediabar() {
    const mediabar = document.querySelector('.moonfin-mediabar');
    if (!mediabar) return false;

    // Check if mediabar is visible
    const style = window.getComputedStyle(mediabar);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }

    // Check if mediabar has content
    if (typeof MediaBar === 'undefined' || !MediaBar.items || MediaBar.items.length === 0) {
      return false;
    }

    // Focus the mediabar content area (make it focusable)
    const content = mediabar.querySelector('.moonfin-mediabar-content');
    if (content) {
      content.setAttribute('tabindex', '0');
      content.focus();
      content.classList.add('moonfin-focused');
      console.log('[Moonfin TV] Focused mediabar');
      return true;
    }
    return false;
  },
  /**
   * Focus the first focusable Jellyfin content element below the navbar/mediabar
   */
  focusJellyfinContent() {
    // Jellyfin uses these selectors for focusable content
    const jellyfinSelectors = ['.card', '.listItem', '.emby-button', '.emby-tab-button', '.itemsContainer button', '.section0 .card', '.homeSection .card', '[data-action]', '.button-flat', '.raised'];

    // Find the bottom of our UI elements
    const navbar = document.querySelector('.moonfin-navbar');
    const mediabar = document.querySelector('.moonfin-mediabar');
    let topOffset = 0;
    if (navbar) {
      topOffset = Math.max(topOffset, navbar.getBoundingClientRect().bottom);
    }
    if (mediabar && window.getComputedStyle(mediabar).display !== 'none') {
      topOffset = Math.max(topOffset, mediabar.getBoundingClientRect().bottom);
    }
    for (const selector of jellyfinSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // Find first element below our UI that's visible
        if (rect.top > topOffset && rect.width > 0 && rect.height > 0) {
          el.focus();
          el.classList.add('moonfin-jf-focused');
          console.log('[Moonfin TV] Focused Jellyfin element:', el);
          return true;
        }
      }
    }
    return false;
  },
  /**
   * Find the next element in a given direction using spatial navigation
   */
  findNextElement(currentElement, direction) {
    var _candidates$;
    const currentRect = currentElement.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };
    let candidates = [];
    for (const el of this.focusableElements) {
      if (el === currentElement) continue;
      const rect = el.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      // Check if element is in the correct direction
      let isValid = false;
      let distance = Infinity;
      switch (direction) {
        case 'left':
          isValid = center.x < currentCenter.x;
          distance = this.calculateDistance(currentCenter, center, 'horizontal');
          break;
        case 'right':
          isValid = center.x > currentCenter.x;
          distance = this.calculateDistance(currentCenter, center, 'horizontal');
          break;
        case 'up':
          isValid = center.y < currentCenter.y;
          distance = this.calculateDistance(currentCenter, center, 'vertical');
          break;
        case 'down':
          isValid = center.y > currentCenter.y;
          distance = this.calculateDistance(currentCenter, center, 'vertical');
          break;
      }
      if (isValid) {
        candidates.push({
          element: el,
          distance
        });
      }
    }

    // Sort by distance and return closest
    candidates.sort((a, b) => a.distance - b.distance);
    return ((_candidates$ = candidates[0]) === null || _candidates$ === void 0 ? void 0 : _candidates$.element) || null;
  },
  /**
   * Calculate weighted distance between two points
   */
  calculateDistance(from, to, axis) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Weight the perpendicular axis more heavily to prefer elements in a line
    if (axis === 'horizontal') {
      return Math.abs(dx) + Math.abs(dy) * 2;
    } else {
      return Math.abs(dy) + Math.abs(dx) * 2;
    }
  },
  /**
   * Focus an element with visual feedback
   */
  focusElement(element) {
    // Remove focus from all elements
    this.focusableElements.forEach(el => {
      el.classList.remove('moonfin-focused');
    });

    // Focus the new element
    element.classList.add('moonfin-focused');
    element.focus();

    // Scroll into view if needed
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  },
  /**
   * Activate (click) the currently focused element
   */
  activateFocused() {
    const focused = document.activeElement;
    if (focused && this.focusableElements.includes(focused)) {
      focused.click();
    }
  },
  /**
   * Handle back button press
   */
  handleBack(e) {
    var _window$NativeShell2;
    // Check if any Moonfin modal/overlay is open
    const settingsPanel = document.querySelector('.moonfin-settings-panel');
    const jellyseerrModal = document.querySelector('.moonfin-jellyseerr-modal');
    if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
      e.preventDefault();
      // Close settings
      settingsPanel.classList.add('hidden');
      return;
    }
    if (jellyseerrModal) {
      e.preventDefault();
      jellyseerrModal.remove();
      return;
    }

    // Otherwise, let jellyfin-web handle the back navigation
    // or call NativeShell if available
    if ((_window$NativeShell2 = window.NativeShell) !== null && _window$NativeShell2 !== void 0 && (_window$NativeShell2 = _window$NativeShell2.AppHost) !== null && _window$NativeShell2 !== void 0 && _window$NativeShell2.exit) {
      // Don't prevent default - let the app handle it
    }
  },
  /**
   * Set focus to a specific element by selector
   */
  setFocus(selector) {
    this.updateFocusableElements();
    const element = document.querySelector(selector);
    if (element && this.focusableElements.includes(element)) {
      this.focusElement(element);
    }
  },
  /**
   * Set focus to the first focusable element
   */
  focusFirst() {
    this.updateFocusableElements();
    if (this.focusableElements.length > 0) {
      this.focusElement(this.focusableElements[0]);
    }
  },
  /**
   * Add a custom focusable selector
   */
  addFocusableSelector(selector) {
    this.focusableSelector += `, ${selector}`;
    this.updateFocusableElements();
  },
  /**
   * Temporarily disable TV navigation (e.g., during video playback)
   */
  disable() {
    this.enabled = false;
  },
  /**
   * Re-enable TV navigation
   */
  enable() {
    if (this.isTV()) {
      this.enabled = true;
    }
  }
};

// === components/navbar.js ===
const Navbar = {
  container: null,
  initialized: false,
  libraries: [],
  currentUser: null,
  librariesExpanded: false,
  librariesTimeout: null,
  isMobile: function () {
    return window.innerWidth <= 768;
  },
  init() {
    var _this8 = this;
    return _asyncToGenerator(function* () {
      if (_this8.initialized) return;
      console.log('[Moonfin] Initializing navbar...');
      try {
        yield _this8.waitForApi();
      } catch (e) {
        console.error('[Moonfin] Navbar: Failed to initialize -', e.message);
        return;
      }
      _this8.createNavbar();
      yield _this8.loadUserData();
      _this8.setupEventListeners();
      _this8.startClock();
      _this8.initialized = true;
      console.log('[Moonfin] Navbar initialized');
    })();
  },
  waitForApi() {
    return new Promise(function (resolve, reject) {
      var attempts = 0;
      var maxAttempts = 100;
      var check = function () {
        var api = API.getApiClient();
        if (api && api._currentUser && api._currentUser.Id) {
          console.log('[Moonfin] Navbar: API ready with authenticated user');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.warn('[Moonfin] Navbar: Timeout waiting for API');
          reject(new Error('API timeout'));
        } else {
          attempts++;
          setTimeout(check, 100);
        }
      };
      check();
    });
  },
  createNavbar() {
    var existing = document.querySelector('.moonfin-navbar');
    if (existing) {
      existing.remove();
    }
    var settings = Storage.getAll();
    var overlayColor = Storage.getColorRgba(settings.mediaBarOverlayColor, settings.mediaBarOverlayOpacity);
    this.container = document.createElement('nav');
    this.container.className = 'moonfin-navbar';
    this.container.innerHTML = ['<!-- Left: User Avatar -->', '<div class="moonfin-navbar-left">', '    <button class="moonfin-user-btn" title="User Menu">', '        <div class="moonfin-user-avatar">', '            <span class="moonfin-user-initial">U</span>', '        </div>', '    </button>', '</div>', '', '<!-- Center: Nav Pill -->', '<div class="moonfin-navbar-center">', '    <div class="moonfin-nav-pill" style="background: ' + overlayColor + '">', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-home" data-action="home" title="Home">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>', '            <span class="moonfin-expand-label">Home</span>', '        </button>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-search" data-action="search" title="Search">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>', '            <span class="moonfin-expand-label">Search</span>', '        </button>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-shuffle' + (!settings.showShuffleButton ? ' hidden' : '') + '" data-action="shuffle" title="Shuffle">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>', '            <span class="moonfin-expand-label">Shuffle</span>', '        </button>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-genres' + (!settings.showGenresButton ? ' hidden' : '') + '" data-action="genres" title="Genres">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9"/></svg>', '            <span class="moonfin-expand-label">Genres</span>', '        </button>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-favorites' + (!settings.showFavoritesButton ? ' hidden' : '') + '" data-action="favorites" title="Favorites">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>', '            <span class="moonfin-expand-label">Favorites</span>', '        </button>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-jellyseerr hidden" data-action="jellyseerr" title="Jellyseerr">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l4.59-4.59L16 11l-6 6z"/></svg>', '            <span class="moonfin-expand-label">Jellyseerr</span>', '        </button>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-cast' + (!settings.showCastButton ? ' hidden' : '') + '" data-action="cast" title="Cast">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M1 18v3h3c0-1.66-1.34-3-3-3m0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7m0-4v2a9 9 0 0 1 9 9h2c0-6.08-4.93-11-11-11m20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2"/></svg>', '            <span class="moonfin-expand-label">Cast</span>', '        </button>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-syncplay' + (!settings.showSyncPlayButton ? ' hidden' : '') + '" data-action="syncplay" title="SyncPlay">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M9.5 16.5v-9l7 4.5z"/></svg>', '            <span class="moonfin-expand-label">SyncPlay</span>', '        </button>', '', '        <!-- Libraries expandable group -->', '        <div class="moonfin-libraries-group' + (!settings.showLibrariesInToolbar ? ' hidden' : '') + '">', '            <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-libraries-btn" data-action="libraries-toggle" title="Libraries">', '                <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>', '                <span class="moonfin-expand-label">Libraries</span>', '            </button>', '            <div class="moonfin-libraries-list">', '                <!-- Library buttons inserted here -->', '            </div>', '        </div>', '', '        <button class="moonfin-nav-btn moonfin-expandable-btn moonfin-nav-settings" data-action="settings" title="Settings">', '            <svg class="moonfin-nav-icon" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>', '            <span class="moonfin-expand-label">Settings</span>', '        </button>', '', '    </div>', '</div>', '', '<!-- Right: Clock -->', '<div class="moonfin-navbar-right">', '    <div class="moonfin-clock' + (!settings.showClock ? ' hidden' : '') + '">', '        <span class="moonfin-clock-time">--:--</span>', '    </div>', '</div>'].join('\n');
    document.body.insertBefore(this.container, document.body.firstChild);
    document.body.classList.add('moonfin-navbar-active');
  },
  loadUserData() {
    var _this9 = this;
    return _asyncToGenerator(function* () {
      _this9.currentUser = yield API.getCurrentUser();
      if (_this9.currentUser) {
        _this9.updateUserAvatar();
      }
      _this9.libraries = yield API.getUserViews();
      _this9.updateLibraries();
    })();
  },
  updateUserAvatar() {
    var avatarContainer = this.container.querySelector('.moonfin-user-avatar');
    if (!avatarContainer || !this.currentUser) return;
    var avatarUrl = API.getUserAvatarUrl(this.currentUser);
    if (avatarUrl) {
      avatarContainer.innerHTML = '<img src="' + avatarUrl + '" alt="' + (this.currentUser.Name || '') + '" class="moonfin-user-img">';
    } else {
      // Show first letter of username as fallback
      var initial = this.currentUser.Name && this.currentUser.Name[0] || 'U';
      avatarContainer.innerHTML = '<span class="moonfin-user-initial">' + initial + '</span>';
    }
  },
  updateLibraries() {
    var librariesList = this.container.querySelector('.moonfin-libraries-list');
    if (!librariesList) return;
    var filteredLibraries = this.libraries.filter(function (lib) {
      var type = lib.CollectionType ? lib.CollectionType.toLowerCase() : '';
      return type !== 'playlists' && type !== 'boxsets';
    });
    librariesList.innerHTML = filteredLibraries.map(function (lib) {
      var collectionType = lib.CollectionType || '';
      return '<button class="moonfin-nav-btn moonfin-library-btn" data-action="library" data-library-id="' + lib.Id + '" data-collection-type="' + collectionType + '" title="' + lib.Name + '">' + '<span class="moonfin-library-name">' + lib.Name + '</span>' + '</button>';
    }).join('');
  },
  getLibraryUrl: function (libraryId, collectionType) {
    var type = (collectionType || '').toLowerCase();
    switch (type) {
      case 'movies':
        return '/movies?topParentId=' + libraryId + '&collectionType=' + collectionType;
      case 'tvshows':
        return '/tv?topParentId=' + libraryId + '&collectionType=' + collectionType;
      case 'music':
        return '/music?topParentId=' + libraryId + '&collectionType=' + collectionType;
      case 'livetv':
        return '/livetv?collectionType=' + collectionType;
      case 'homevideos':
        return '/homevideos?topParentId=' + libraryId;
      case 'books':
        return '/list?parentId=' + libraryId;
      default:
        return '/list?parentId=' + libraryId;
    }
  },
  toggleLibraries() {
    var group = this.container.querySelector('.moonfin-libraries-group');
    if (!group) return;
    this.librariesExpanded = !this.librariesExpanded;
    group.classList.toggle('expanded', this.librariesExpanded);

    // On mobile, scroll the pill so libraries are visible
    if (this.isMobile() && this.librariesExpanded) {
      var pill = this.container.querySelector('.moonfin-nav-pill');
      if (pill) {
        setTimeout(function () {
          group.scrollIntoView({
            behavior: 'smooth',
            inline: 'start',
            block: 'nearest'
          });
        }, 50);
      }
    }
  },
  collapseLibraries() {
    // On mobile, don't auto-collapse; user taps toggle to close
    if (this.isMobile()) return;
    var self = this;
    if (this.librariesTimeout) {
      clearTimeout(this.librariesTimeout);
    }
    this.librariesTimeout = setTimeout(function () {
      self.librariesExpanded = false;
      var group = self.container ? self.container.querySelector('.moonfin-libraries-group') : null;
      if (group) {
        group.classList.remove('expanded');
      }
    }, 150);
  },
  cancelCollapseLibraries() {
    if (this.librariesTimeout) {
      clearTimeout(this.librariesTimeout);
      this.librariesTimeout = null;
    }
  },
  setupEventListeners() {
    var self = this;

    // Nav button clicks
    this.container.addEventListener('click', function (e) {
      var btn = e.target.closest('.moonfin-nav-btn');
      if (!btn) return;
      var action = btn.dataset.action;
      if (action === 'libraries-toggle') {
        self.toggleLibraries();
        return;
      }
      self.handleNavigation(action, btn);
    });

    // User avatar click
    var userBtn = this.container.querySelector('.moonfin-user-btn');
    if (userBtn) {
      userBtn.addEventListener('click', function () {
        API.navigateTo('/mypreferencesmenu');
      });
    }

    // Libraries group hover expand/collapse (desktop only)
    var librariesGroup = this.container.querySelector('.moonfin-libraries-group');
    if (librariesGroup) {
      librariesGroup.addEventListener('mouseenter', function () {
        if (!self.isMobile()) {
          self.cancelCollapseLibraries();
        }
      });
      librariesGroup.addEventListener('mouseleave', function () {
        if (!self.isMobile()) {
          self.collapseLibraries();
        }
      });
      librariesGroup.addEventListener('focusin', function () {
        if (!self.isMobile()) {
          self.cancelCollapseLibraries();
          self.librariesExpanded = true;
          librariesGroup.classList.add('expanded');
        }
      });
      librariesGroup.addEventListener('focusout', function (e) {
        if (self.isMobile()) return;
        if (e.relatedTarget && librariesGroup.contains(e.relatedTarget)) {
          return;
        }
        self.collapseLibraries();
      });
    }

    // Global events
    window.addEventListener('moonfin-settings-changed', function (e) {
      self.applySettings(e.detail);
    });
    window.addEventListener('viewshow', function () {
      self.updateActiveState();
    });
    window.addEventListener('moonfin-jellyseerr-config', function (e) {
      self.updateJellyseerrButton(e.detail);
    });
  },
  updateJellyseerrButton(config) {
    var btn = this.container ? this.container.querySelector('.moonfin-nav-jellyseerr') : null;
    if (!btn) return;
    if (config && config.enabled && config.url) {
      btn.classList.remove('hidden');
      var label = btn.querySelector('.moonfin-expand-label');
      if (label) {
        label.textContent = config.displayName || 'Jellyseerr';
      }
      btn.title = config.displayName || 'Jellyseerr';
    } else {
      btn.classList.add('hidden');
    }
  },
  handleNavigation(action, btn) {
    var _this0 = this;
    return _asyncToGenerator(function* () {
      // Close Jellyseerr iframe on any navigation except toggling jellyseerr itself
      if (action !== 'jellyseerr' && action !== 'settings' && Jellyseerr.isOpen) {
        Jellyseerr.close();
        _this0.updateJellyseerrButtonState();
      }
      switch (action) {
        case 'home':
          API.navigateTo('/home');
          break;
        case 'search':
          API.navigateTo('/search');
          break;
        case 'shuffle':
          yield _this0.handleShuffle();
          break;
        case 'genres':
          API.navigateTo('/list?type=Genre');
          break;
        case 'favorites':
          API.navigateTo('/home?tab=1');
          break;
        case 'settings':
          Settings.show();
          break;
        case 'cast':
          _this0.showCastMenu(btn);
          break;
        case 'syncplay':
          _this0.showSyncPlayMenu(btn);
          break;
        case 'jellyseerr':
          Jellyseerr.toggle();
          _this0.updateJellyseerrButtonState();
          break;
        case 'library':
          var libraryId = btn.dataset.libraryId;
          var collectionType = btn.dataset.collectionType;
          if (libraryId) {
            API.navigateTo(_this0.getLibraryUrl(libraryId, collectionType));
          }
          break;
      }
    })();
  },
  updateJellyseerrButtonState() {
    var btn = this.container ? this.container.querySelector('.moonfin-nav-jellyseerr') : null;
    if (btn) {
      btn.classList.toggle('active', Jellyseerr.isOpen);
    }
  },
  showCastMenu(button) {
    var nativeCastBtn = document.querySelector('.headerCastButton, .castButton');
    if (nativeCastBtn) {
      console.log('[Moonfin] Triggering Cast menu via native button');
      nativeCastBtn.click();
    } else {
      console.warn('[Moonfin] Cast button not found');
    }
  },
  showSyncPlayMenu(button) {
    var nativeSyncBtn = document.querySelector('.headerSyncButton, .syncButton');
    if (nativeSyncBtn) {
      console.log('[Moonfin] Triggering SyncPlay menu via native button');
      nativeSyncBtn.click();
    } else {
      console.warn('[Moonfin] SyncPlay button not found');
    }
  },
  handleShuffle() {
    return _asyncToGenerator(function* () {
      var settings = Storage.getAll();
      var items = yield API.getRandomItems({
        contentType: settings.shuffleContentType,
        limit: 1
      });
      if (items.length > 0) {
        API.navigateToItem(items[0].Id);
      }
    })();
  },
  updateActiveState() {
    if (!this.container) return;
    var path = window.location.pathname + window.location.search;
    this.container.querySelectorAll('.moonfin-nav-btn').forEach(function (btn) {
      btn.classList.remove('active');
    });
    if (path.indexOf('/home') !== -1) {
      var homeBtn = this.container.querySelector('.moonfin-nav-home');
      if (homeBtn) homeBtn.classList.add('active');
    } else if (path.indexOf('/search') !== -1) {
      var searchBtn = this.container.querySelector('.moonfin-nav-search');
      if (searchBtn) searchBtn.classList.add('active');
    }
    var urlParams = new URLSearchParams(window.location.search);
    var parentId = urlParams.get('parentId');
    if (parentId) {
      var libraryBtn = this.container.querySelector('[data-library-id="' + parentId + '"]');
      if (libraryBtn) {
        libraryBtn.classList.add('active');
      }
    }
  },
  startClock() {
    var self = this;
    var updateClock = function () {
      var clockElement = self.container ? self.container.querySelector('.moonfin-clock-time') : null;
      if (!clockElement) return;
      var now = new Date();
      var settings = Storage.getAll();
      var hours = now.getHours();
      var minutes = now.getMinutes();
      var suffix = '';
      if (!settings.use24HourClock) {
        suffix = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12;
      }
      clockElement.textContent = hours + ':' + minutes.toString().padStart(2, '0') + suffix;
    };
    updateClock();
    setInterval(updateClock, 1000);
  },
  applySettings(settings) {
    if (!this.container) return;
    var overlayColor = Storage.getColorRgba(settings.mediaBarOverlayColor, settings.mediaBarOverlayOpacity);
    var pill = this.container.querySelector('.moonfin-nav-pill');
    if (pill) {
      pill.style.background = overlayColor;
    }
    var shuffleBtn = this.container.querySelector('.moonfin-nav-shuffle');
    if (shuffleBtn) shuffleBtn.classList.toggle('hidden', !settings.showShuffleButton);
    var genresBtn = this.container.querySelector('.moonfin-nav-genres');
    if (genresBtn) genresBtn.classList.toggle('hidden', !settings.showGenresButton);
    var favoritesBtn = this.container.querySelector('.moonfin-nav-favorites');
    if (favoritesBtn) favoritesBtn.classList.toggle('hidden', !settings.showFavoritesButton);
    var librariesGroup = this.container.querySelector('.moonfin-libraries-group');
    if (librariesGroup) librariesGroup.classList.toggle('hidden', !settings.showLibrariesInToolbar);
    var clock = this.container.querySelector('.moonfin-clock');
    if (clock) clock.classList.toggle('hidden', !settings.showClock);
  },
  destroy() {
    if (this.librariesTimeout) {
      clearTimeout(this.librariesTimeout);
      this.librariesTimeout = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    document.body.classList.remove('moonfin-navbar-active');
    this.librariesExpanded = false;
    this.initialized = false;
  }
};

// === components/mediabar.js ===
const MediaBar = {
  container: null,
  initialized: false,
  items: [],
  currentIndex: 0,
  isPaused: false,
  autoAdvanceTimer: null,
  isVisible: true,
  init() {
    var _this1 = this;
    return _asyncToGenerator(function* () {
      const settings = Storage.getAll();
      if (!settings.mediaBarEnabled) {
        console.log('[Moonfin] Media bar is disabled');
        document.body.classList.remove('moonfin-mediabar-active');
        return;
      }
      if (_this1.initialized) return;
      console.log('[Moonfin] Initializing media bar...');
      try {
        yield _this1.waitForApi();
      } catch (e) {
        console.error('[Moonfin] MediaBar: Failed to initialize -', e.message);
        document.body.classList.remove('moonfin-mediabar-active');
        return;
      }
      _this1.createMediaBar();
      yield _this1.loadContent();

      // Only add active class if we have items to show AND we're on the home page
      if (_this1.items.length > 0 && _this1.isHomePage()) {
        document.body.classList.add('moonfin-mediabar-active');
      } else {
        document.body.classList.remove('moonfin-mediabar-active');
      }
      _this1.setupEventListeners();
      if (settings.mediaBarAutoAdvance) {
        _this1.startAutoAdvance();
      }
      _this1.initialized = true;
      console.log('[Moonfin] Media bar initialized with', _this1.items.length, 'items');
    })();
  },
  waitForApi() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max

      const check = () => {
        const api = API.getApiClient();
        // Check not just for API but for full auth
        if (api && api._currentUser && api._currentUser.Id) {
          console.log('[Moonfin] MediaBar: API ready with authenticated user');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.warn('[Moonfin] MediaBar: Timeout waiting for API');
          reject(new Error('API timeout'));
        } else {
          attempts++;
          setTimeout(check, 100);
        }
      };
      check();
    });
  },
  createMediaBar() {
    const existing = document.querySelector('.moonfin-mediabar');
    if (existing) {
      existing.remove();
    }
    const settings = Storage.getAll();
    const overlayColor = Storage.getColorRgba(settings.mediaBarOverlayColor, settings.mediaBarOverlayOpacity);
    this.container = document.createElement('div');
    this.container.className = 'moonfin-mediabar';
    this.container.innerHTML = `
            <div class="moonfin-mediabar-backdrop">
                <div class="moonfin-mediabar-backdrop-img moonfin-mediabar-backdrop-current"></div>
                <div class="moonfin-mediabar-backdrop-img moonfin-mediabar-backdrop-next"></div>
            </div>
            <div class="moonfin-mediabar-gradient"></div>
            <div class="moonfin-mediabar-content">
                <!-- Left: Info overlay -->
                <div class="moonfin-mediabar-info" style="background: ${overlayColor}">
                    <div class="moonfin-mediabar-metadata">
                        <span class="moonfin-mediabar-year"></span>
                        <span class="moonfin-mediabar-runtime"></span>
                    </div>
                    <div class="moonfin-mediabar-genres"></div>
                    <div class="moonfin-mediabar-ratings"></div>
                    <div class="moonfin-mediabar-overview"></div>
                </div>
                <!-- Right: Logo -->
                <div class="moonfin-mediabar-logo-container">
                    <img class="moonfin-mediabar-logo" src="" alt="">
                </div>
            </div>
            <!-- Navigation -->
            <div class="moonfin-mediabar-nav">
                <button class="moonfin-mediabar-nav-btn moonfin-mediabar-prev" style="background: ${overlayColor}">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </button>
                <button class="moonfin-mediabar-nav-btn moonfin-mediabar-next" style="background: ${overlayColor}">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    </svg>
                </button>
            </div>
            <!-- Dots indicator -->
            <div class="moonfin-mediabar-dots"></div>
            <!-- Play/Pause indicator -->
            <div class="moonfin-mediabar-playstate">
                <svg viewBox="0 0 24 24" class="moonfin-mediabar-play-icon">
                    <path fill="currentColor" d="M8 5v14l11-7z"/>
                </svg>
                <svg viewBox="0 0 24 24" class="moonfin-mediabar-pause-icon">
                    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </div>
        `;

    // Insert into document.body so it persists across SPA navigation
    // (Jellyfin replaces .mainAnimatedPage content on route changes)
    document.body.appendChild(this.container);
  },
  loadContent() {
    var _this10 = this;
    return _asyncToGenerator(function* () {
      const settings = Storage.getAll();
      _this10.items = yield API.getRandomItems({
        contentType: settings.mediaBarContentType,
        limit: settings.mediaBarItemCount
      });
      if (_this10.items.length > 0) {
        _this10.updateDisplay();
        _this10.updateDots();
      } else {
        console.log('[Moonfin] No items found for media bar');
        _this10.container.classList.add('empty');
      }
    })();
  },
  updateDisplay() {
    const item = this.items[this.currentIndex];
    if (!item) return;
    const backdropUrl = API.getImageUrl(item, 'Backdrop', {
      maxWidth: 1920
    });
    this.updateBackdrop(backdropUrl);
    const logoUrl = API.getImageUrl(item, 'Logo', {
      maxWidth: 500
    });
    const logoContainer = this.container.querySelector('.moonfin-mediabar-logo-container');
    const logoImg = this.container.querySelector('.moonfin-mediabar-logo');
    if (logoUrl) {
      logoImg.src = logoUrl;
      logoImg.alt = item.Name;
      logoContainer.classList.remove('hidden');
    } else {
      logoContainer.classList.add('hidden');
    }
    const yearEl = this.container.querySelector('.moonfin-mediabar-year');
    const runtimeEl = this.container.querySelector('.moonfin-mediabar-runtime');
    const ratingsEl = this.container.querySelector('.moonfin-mediabar-ratings');
    const genresEl = this.container.querySelector('.moonfin-mediabar-genres');
    const overviewEl = this.container.querySelector('.moonfin-mediabar-overview');
    yearEl.textContent = item.ProductionYear || '';
    if (item.RunTimeTicks) {
      const minutes = Math.round(item.RunTimeTicks / 600000000);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      runtimeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } else {
      runtimeEl.textContent = '';
    }

    // Build ratings line - start with Jellyfin's built-in ratings
    var ratingParts = [];
    if (item.OfficialRating) {
      ratingParts.push(item.OfficialRating);
    }
    if (item.CommunityRating) {
      ratingParts.push('★ ' + item.CommunityRating.toFixed(1));
    }
    if (item.CriticRating) {
      ratingParts.push('🍅 ' + item.CriticRating + '%');
    }
    ratingsEl.textContent = ratingParts.join('  •  ');

    // Fetch and show MDBList ratings if enabled
    if (MdbList.isEnabled()) {
      var currentIdx = this.currentIndex;
      MdbList.fetchRatings(item).then(function (mdbRatings) {
        // Only update if still on the same slide
        if (MediaBar.currentIndex !== currentIdx) return;
        if (mdbRatings && mdbRatings.length > 0) {
          var mdbHtml = MdbList.buildRatingsHtml(mdbRatings, 'compact');
          if (mdbHtml) {
            ratingsEl.innerHTML = mdbHtml;
          }
        }
      });
    }
    if (item.Genres && item.Genres.length > 0) {
      genresEl.textContent = item.Genres.slice(0, 3).join(' • ');
    } else {
      genresEl.textContent = '';
    }
    if (item.Overview) {
      overviewEl.textContent = item.Overview;
    } else {
      overviewEl.textContent = '';
    }
    this.updateActiveDot();
  },
  updateBackdrop(url) {
    const current = this.container.querySelector('.moonfin-mediabar-backdrop-current');
    const next = this.container.querySelector('.moonfin-mediabar-backdrop-next');
    if (!url) {
      current.style.backgroundImage = '';
      return;
    }
    next.style.backgroundImage = `url('${url}')`;
    next.classList.add('active');
    setTimeout(() => {
      current.style.backgroundImage = `url('${url}')`;
      next.classList.remove('active');
    }, 500);
  },
  updateDots() {
    const dotsContainer = this.container.querySelector('.moonfin-mediabar-dots');
    const settings = Storage.getAll();
    const overlayColor = Storage.getColorRgba(settings.mediaBarOverlayColor, settings.mediaBarOverlayOpacity);
    dotsContainer.innerHTML = this.items.map((_, index) => `
            <button class="moonfin-mediabar-dot ${index === this.currentIndex ? 'active' : ''}" 
                    data-index="${index}"
                    style="background: ${index === this.currentIndex ? '#fff' : overlayColor}">
            </button>
        `).join('');
  },
  updateActiveDot() {
    const dots = this.container.querySelectorAll('.moonfin-mediabar-dot');
    const settings = Storage.getAll();
    const overlayColor = Storage.getColorRgba(settings.mediaBarOverlayColor, settings.mediaBarOverlayOpacity);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
      dot.style.background = index === this.currentIndex ? '#fff' : overlayColor;
    });
  },
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateDisplay();
    this.resetAutoAdvance();
  },
  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateDisplay();
    this.resetAutoAdvance();
  },
  goToSlide(index) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.updateDisplay();
      this.resetAutoAdvance();
    }
  },
  togglePause() {
    this.isPaused = !this.isPaused;
    this.container.classList.toggle('paused', this.isPaused);
    if (this.isPaused) {
      this.stopAutoAdvance();
    } else {
      this.startAutoAdvance();
    }
  },
  startAutoAdvance() {
    const settings = Storage.getAll();
    if (!settings.mediaBarAutoAdvance) return;
    this.autoAdvanceTimer = setInterval(() => {
      if (!this.isPaused && this.isVisible) {
        this.nextSlide();
      }
    }, settings.mediaBarIntervalMs);
  },
  stopAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  },
  resetAutoAdvance() {
    this.stopAutoAdvance();
    if (!this.isPaused) {
      this.startAutoAdvance();
    }
  },
  isInDOM() {
    return this.container && document.body.contains(this.container);
  },
  ensureInDOM() {
    if (this.container && !document.body.contains(this.container)) {
      console.log('[Moonfin] MediaBar: Re-inserting container into DOM');
      document.body.appendChild(this.container);
    }
  },
  setupEventListeners() {
    var _this$container$query, _this$container$query2, _this$container$query3;
    (_this$container$query = this.container.querySelector('.moonfin-mediabar-prev')) === null || _this$container$query === void 0 || _this$container$query.addEventListener('click', e => {
      e.stopPropagation();
      this.prevSlide();
    });
    (_this$container$query2 = this.container.querySelector('.moonfin-mediabar-next')) === null || _this$container$query2 === void 0 || _this$container$query2.addEventListener('click', e => {
      e.stopPropagation();
      this.nextSlide();
    });
    (_this$container$query3 = this.container.querySelector('.moonfin-mediabar-dots')) === null || _this$container$query3 === void 0 || _this$container$query3.addEventListener('click', e => {
      e.stopPropagation();
      const dot = e.target.closest('.moonfin-mediabar-dot');
      if (dot) {
        this.goToSlide(parseInt(dot.dataset.index, 10));
      }
    });

    // Make the entire media bar clickable - open custom details
    this.container.addEventListener('click', e => {
      // Don't navigate if clicking nav buttons, dots, or playstate
      if (e.target.closest('.moonfin-mediabar-nav-btn, .moonfin-mediabar-dots, .moonfin-mediabar-playstate')) {
        return;
      }
      const item = this.items[this.currentIndex];
      if (item) {
        Details.showDetails(item.Id, item.Type);
      }
    });

    // Touch swipe support for mobile
    var touchStartX = 0;
    var touchStartY = 0;
    var touchMoved = false;
    var self = this;
    this.container.addEventListener('touchstart', function (e) {
      var touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchMoved = false;
    }, {
      passive: true
    });
    this.container.addEventListener('touchmove', function (e) {
      if (!touchStartX) return;
      var dx = Math.abs(e.touches[0].clientX - touchStartX);
      var dy = Math.abs(e.touches[0].clientY - touchStartY);
      // Only count as swipe if horizontal movement > vertical
      if (dx > 10 || dy > 10) {
        touchMoved = true;
      }
      // Prevent vertical scroll when swiping horizontally on the media bar
      if (dx > dy && dx > 10) {
        e.preventDefault();
      }
    }, {
      passive: false
    });
    this.container.addEventListener('touchend', function (e) {
      if (!touchMoved) {
        // It was a tap, not a swipe - let the click handler deal with it
        touchStartX = 0;
        return;
      }
      var touch = e.changedTouches[0];
      var dx = touch.clientX - touchStartX;
      var minSwipe = 50;
      if (Math.abs(dx) >= minSwipe) {
        if (dx < 0) {
          self.nextSlide();
        } else {
          self.prevSlide();
        }
      }
      touchStartX = 0;
      touchMoved = false;
    }, {
      passive: true
    });
    this.container.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowLeft':
          this.prevSlide();
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.nextSlide();
          e.preventDefault();
          break;
        case ' ':
          this.togglePause();
          e.preventDefault();
          break;
        case 'Enter':
          const item = this.items[this.currentIndex];
          if (item) {
            Details.showDetails(item.Id, item.Type);
          }
          e.preventDefault();
          break;
      }
    });
    this.container.addEventListener('mouseenter', () => {
      this.container.classList.add('focused');
    });
    this.container.addEventListener('mouseleave', () => {
      this.container.classList.remove('focused');
    });
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
    });
    window.addEventListener('moonfin-settings-changed', e => {
      this.applySettings(e.detail);
    });

    // Note: visibility toggling is handled by Plugin.onPageChange()
    // No need for a separate viewshow listener here
  },
  applySettings(settings) {
    if (!this.container) return;
    if (!settings.mediaBarEnabled) {
      this.hide();
      return;
    } else {
      this.show();
    }
    const overlayColor = Storage.getColorRgba(settings.mediaBarOverlayColor, settings.mediaBarOverlayOpacity);
    const infoBox = this.container.querySelector('.moonfin-mediabar-info');
    if (infoBox) {
      infoBox.style.background = overlayColor;
    }
    this.container.querySelectorAll('.moonfin-mediabar-nav-btn').forEach(btn => {
      btn.style.background = overlayColor;
    });
    this.updateDots();
    this.resetAutoAdvance();
    if (this._lastContentType !== settings.mediaBarContentType || this._lastItemCount !== settings.mediaBarItemCount) {
      this._lastContentType = settings.mediaBarContentType;
      this._lastItemCount = settings.mediaBarItemCount;
      this.loadContent();
    }
  },
  isHomePage() {
    var hash = window.location.hash.toLowerCase();
    if (hash === '#/home' || hash === '#/home.html') return true;
    if (hash.startsWith('#/home?') || hash.startsWith('#/home.html?')) {
      return hash.indexOf('tab=') === -1;
    }
    return false;
  },
  show() {
    if (this.container) {
      this.container.classList.remove('disabled');
      // Only show on home page
      if (this.isHomePage()) {
        document.body.classList.add('moonfin-mediabar-active');
      }
    }
  },
  hide() {
    if (this.container) {
      this.container.classList.add('disabled');
      document.body.classList.remove('moonfin-mediabar-active');
    }
  },
  refresh() {
    var _this11 = this;
    return _asyncToGenerator(function* () {
      _this11.currentIndex = 0;
      yield _this11.loadContent();
    })();
  },
  destroy() {
    this.stopAutoAdvance();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    document.body.classList.remove('moonfin-mediabar-active');
    this.initialized = false;
    this.items = [];
    this.currentIndex = 0;
  }
};

// === components/settings.js ===
var Settings = {
  dialog: null,
  isOpen: false,
  _toastTimeout: null,
  toggle: function () {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  },
  show: function () {
    if (this.isOpen) return;
    this.createDialog();
    // Trigger animation after append
    var self = this;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (self.dialog) {
          self.dialog.classList.add('open');
        }
      });
    });
    this.isOpen = true;
  },
  hide: function () {
    if (!this.isOpen) return;
    var self = this;
    this.dialog.classList.remove('open');
    setTimeout(function () {
      if (self.dialog) {
        self.dialog.remove();
        self.dialog = null;
      }
    }, 300);
    this.isOpen = false;
  },
  showToast: function (message) {
    var existing = document.querySelector('.moonfin-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'moonfin-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });
    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 2000);
  },
  saveSetting: function (name, value) {
    var current = Storage.getAll();
    current[name] = value;
    Storage.saveAll(current);
    console.log('[Moonfin] Setting saved:', name, '=', value);
  },
  createToggleCard: function (id, title, description, checked) {
    return '<div class="moonfin-toggle-card">' + '<label class="moonfin-toggle-label">' + '<input type="checkbox" id="moonfin-' + id + '" name="' + id + '"' + (checked ? ' checked' : '') + '>' + '<div class="moonfin-toggle-info">' + '<div class="moonfin-toggle-title">' + title + '</div>' + (description ? '<div class="moonfin-toggle-desc">' + description + '</div>' : '') + '</div>' + '</label>' + '</div>';
  },
  createSelectCard: function (id, title, description, options, currentValue) {
    var optionsHtml = '';
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      optionsHtml += '<option value="' + opt.value + '"' + (String(currentValue) === String(opt.value) ? ' selected' : '') + '>' + opt.label + '</option>';
    }
    return '<div class="moonfin-select-card">' + '<div class="moonfin-select-info">' + '<div class="moonfin-toggle-title">' + title + '</div>' + (description ? '<div class="moonfin-toggle-desc">' + description + '</div>' : '') + '</div>' + '<select id="moonfin-' + id + '" name="' + id + '" class="moonfin-panel-select">' + optionsHtml + '</select>' + '</div>';
  },
  createRangeCard: function (id, title, description, min, max, step, currentValue, suffix) {
    return '<div class="moonfin-select-card">' + '<div class="moonfin-select-info">' + '<div class="moonfin-toggle-title">' + title + ' <span class="moonfin-range-value" data-for="' + id + '">' + currentValue + (suffix || '') + '</span></div>' + (description ? '<div class="moonfin-toggle-desc">' + description + '</div>' : '') + '</div>' + '<input type="range" id="moonfin-' + id + '" name="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + currentValue + '" class="moonfin-panel-range">' + '</div>';
  },
  createSection: function (icon, title, contentHtml, openByDefault) {
    return '<details class="moonfin-panel-section"' + (openByDefault ? ' open' : '') + '>' + '<summary class="moonfin-panel-summary">' + (icon ? icon + ' ' : '') + title + '</summary>' + '<div class="moonfin-panel-section-content">' + contentHtml + '</div>' + '</details>';
  },
  createDialog: function () {
    var existing = document.querySelector('.moonfin-settings-dialog');
    if (existing) existing.remove();
    var settings = Storage.getAll();
    var self = this;
    this.dialog = document.createElement('div');
    this.dialog.className = 'moonfin-settings-dialog';

    // --- Build sections ---

    // Moonfin UI Section
    var uiContent = this.createToggleCard('navbarEnabled', 'Navigation Bar', 'Show the custom navigation bar with quick access buttons', settings.navbarEnabled) + this.createToggleCard('mediaBarEnabled', 'Media Bar', 'Show the featured media carousel on the home page', settings.mediaBarEnabled);

    // Media Bar Config Section
    var mediaBarContent = this.createSelectCard('mediaBarContentType', 'Content Type', 'What type of content to show in the media bar', [{
      value: 'both',
      label: 'Movies & TV Shows'
    }, {
      value: 'movies',
      label: 'Movies Only'
    }, {
      value: 'tv',
      label: 'TV Shows Only'
    }], settings.mediaBarContentType) + this.createSelectCard('mediaBarItemCount', 'Number of Items', 'How many items to display', [{
      value: '5',
      label: '5'
    }, {
      value: '10',
      label: '10'
    }, {
      value: '15',
      label: '15'
    }, {
      value: '20',
      label: '20'
    }], settings.mediaBarItemCount) + this.createSelectCard('mediaBarIntervalMs', 'Auto-advance Interval', 'Time between automatic slide changes', [{
      value: '5000',
      label: '5 seconds'
    }, {
      value: '7000',
      label: '7 seconds'
    }, {
      value: '10000',
      label: '10 seconds'
    }, {
      value: '15000',
      label: '15 seconds'
    }, {
      value: '20000',
      label: '20 seconds'
    }], settings.mediaBarIntervalMs);

    // Overlay Appearance
    var colorOptions = [];
    var colorKeys = Object.keys(Storage.colorOptions);
    for (var i = 0; i < colorKeys.length; i++) {
      colorOptions.push({
        value: colorKeys[i],
        label: Storage.colorOptions[colorKeys[i]].name
      });
    }
    var overlayContent = this.createSelectCard('mediaBarOverlayColor', 'Overlay Color', 'Color of the gradient overlay on media bar items', colorOptions, settings.mediaBarOverlayColor) + '<div class="moonfin-color-preview" id="moonfin-color-preview" style="background:' + Storage.getColorHex(settings.mediaBarOverlayColor) + '"></div>' + this.createRangeCard('mediaBarOverlayOpacity', 'Overlay Opacity', 'Transparency of the gradient overlay', 0, 100, 5, settings.mediaBarOverlayOpacity, '%');

    // Toolbar Buttons
    var toolbarContent = this.createToggleCard('showShuffleButton', 'Shuffle Button', 'Show random content button in the toolbar', settings.showShuffleButton) + this.createSelectCard('shuffleContentType', 'Shuffle Content Type', 'What type of content to shuffle', [{
      value: 'both',
      label: 'Movies & TV Shows'
    }, {
      value: 'movies',
      label: 'Movies Only'
    }, {
      value: 'tv',
      label: 'TV Shows Only'
    }], settings.shuffleContentType) + this.createToggleCard('showGenresButton', 'Genres Button', 'Show genres dropdown in the toolbar', settings.showGenresButton) + this.createToggleCard('showFavoritesButton', 'Favorites Button', 'Show favorites button in the toolbar', settings.showFavoritesButton) + this.createToggleCard('showCastButton', 'Cast Button', 'Show Chromecast button in the toolbar', settings.showCastButton) + this.createToggleCard('showSyncPlayButton', 'SyncPlay Button', 'Show SyncPlay button in the toolbar', settings.showSyncPlayButton) + this.createToggleCard('showLibrariesInToolbar', 'Library Shortcuts', 'Show library quick links in the toolbar', settings.showLibrariesInToolbar);

    // Display
    var seasonalOptions = [];
    var seasonKeys = Object.keys(Storage.seasonalOptions);
    for (var j = 0; j < seasonKeys.length; j++) {
      seasonalOptions.push({
        value: seasonKeys[j],
        label: Storage.seasonalOptions[seasonKeys[j]].name
      });
    }
    var displayContent = this.createToggleCard('showClock', 'Clock', 'Show a clock in the navigation bar', settings.showClock) + this.createToggleCard('use24HourClock', '24-Hour Format', 'Use 24-hour time format instead of 12-hour', settings.use24HourClock) + this.createSelectCard('seasonalSurprise', 'Seasonal Effect', 'Add a seasonal visual effect to the interface', seasonalOptions, settings.seasonalSurprise);

    // Jellyseerr (conditionally shown)
    var jellyseerrContent = '<div class="moonfin-jellyseerr-status-group">' + '<div class="moonfin-jellyseerr-sso-status">' + '<span class="moonfin-jellyseerr-sso-indicator"></span>' + '<span class="moonfin-jellyseerr-sso-text">Checking...</span>' + '</div>' + '</div>' + '<div class="moonfin-jellyseerr-login-group" style="display:none">' + '<p class="moonfin-toggle-desc" style="margin:0 0 12px 0">Enter your Jellyfin credentials to sign in to Jellyseerr. Your session is stored on the server so all devices stay signed in.</p>' + '<div class="moonfin-jellyseerr-login-error" style="display:none"></div>' + '<div style="margin-bottom:8px">' + '<label class="moonfin-input-label">Username</label>' + '<input type="text" id="jellyseerr-settings-username" autocomplete="username" class="moonfin-panel-input">' + '</div>' + '<div style="margin-bottom:12px">' + '<label class="moonfin-input-label">Password</label>' + '<input type="password" id="jellyseerr-settings-password" autocomplete="current-password" class="moonfin-panel-input">' + '</div>' + '<button class="moonfin-jellyseerr-settings-login-btn moonfin-panel-btn moonfin-panel-btn-primary">Sign In</button>' + '</div>' + '<div class="moonfin-jellyseerr-signedIn-group" style="display:none">' + '<button class="moonfin-jellyseerr-settings-logout-btn moonfin-panel-btn moonfin-panel-btn-danger">Sign Out of Jellyseerr</button>' + '</div>';

    // MDBList Section
    var mdblistSources = [{
      key: 'imdb',
      label: 'IMDb'
    }, {
      key: 'tmdb',
      label: 'TMDb'
    }, {
      key: 'trakt',
      label: 'Trakt'
    }, {
      key: 'tomatoes',
      label: 'Rotten Tomatoes (Critics)'
    }, {
      key: 'popcorn',
      label: 'Rotten Tomatoes (Audience)'
    }, {
      key: 'metacritic',
      label: 'Metacritic'
    }, {
      key: 'metacriticuser',
      label: 'Metacritic User'
    }, {
      key: 'letterboxd',
      label: 'Letterboxd'
    }, {
      key: 'rogerebert',
      label: 'Roger Ebert'
    }, {
      key: 'myanimelist',
      label: 'MyAnimeList'
    }, {
      key: 'anilist',
      label: 'AniList'
    }];
    var selectedSources = settings.mdblistRatingSources || ['imdb', 'tmdb', 'tomatoes', 'metacritic'];
    var sourcesCheckboxes = '';
    for (var si = 0; si < mdblistSources.length; si++) {
      var src = mdblistSources[si];
      var isChecked = selectedSources.indexOf(src.key) !== -1;
      sourcesCheckboxes += '<label class="moonfin-mdblist-source-label">' + '<input type="checkbox" class="moonfin-mdblist-source-cb" data-source="' + src.key + '"' + (isChecked ? ' checked' : '') + '>' + '<span>' + src.label + '</span>' + '</label>';
    }
    var mdblistContent = this.createToggleCard('mdblistEnabled', 'Enable MDBList Ratings', 'Show ratings from MDBList (IMDb, Rotten Tomatoes, Metacritic, etc.) on media bar and item details', settings.mdblistEnabled) + '<div class="moonfin-mdblist-config" style="' + (settings.mdblistEnabled ? '' : 'display:none') + '">' + '<div style="margin-bottom:12px">' + '<label class="moonfin-input-label">MDBList API Key</label>' + '<input type="password" id="moonfin-mdblistApiKey" class="moonfin-panel-input" placeholder="Enter your mdblist.com API key" value="' + (settings.mdblistApiKey || '') + '">' + '<div class="moonfin-toggle-desc" style="margin-top:4px">Get your free API key at <a href="https://mdblist.com/preferences/" target="_blank" rel="noopener" style="color:#00a4dc">mdblist.com/preferences</a></div>' + '</div>' + '<div style="margin-bottom:8px">' + '<label class="moonfin-input-label">Rating Sources to Display</label>' + '<div class="moonfin-mdblist-sources">' + sourcesCheckboxes + '</div>' + '</div>' + '</div>';

    // --- Assemble the panel ---
    this.dialog.innerHTML = '<div class="moonfin-settings-overlay"></div>' + '<div class="moonfin-settings-panel">' + '<div class="moonfin-settings-header">' + '<div class="moonfin-settings-header-left">' + '<h2>Moonfin</h2>' + '<span class="moonfin-settings-subtitle">Settings</span>' + '</div>' + '<button class="moonfin-settings-close" title="Close">' + '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' + '</button>' + '</div>' + '<div class="moonfin-settings-content">' + this.createSection('', 'Moonfin UI', uiContent, true) + this.createSection('', 'Media Bar', mediaBarContent) + this.createSection('', 'Overlay Appearance', overlayContent) + this.createSection('', 'Toolbar Buttons', toolbarContent) + this.createSection('', 'Display', displayContent) + this.createSection('', 'MDBList Ratings', mdblistContent) + '<div class="moonfin-settings-jellyseerr-wrapper" style="display:none">' + this.createSection('', 'Jellyseerr', jellyseerrContent) + '</div>' + '</div>' + '<div class="moonfin-settings-footer">' + '<div class="moonfin-sync-status" id="moonfinSyncStatus">' + '<span class="moonfin-sync-indicator"></span>' + '<span class="moonfin-sync-text">Checking sync...</span>' + '</div>' + '<div class="moonfin-settings-footer-buttons">' + '<button class="moonfin-panel-btn moonfin-panel-btn-ghost moonfin-settings-reset">Reset</button>' + '<button class="moonfin-panel-btn moonfin-panel-btn-ghost moonfin-settings-sync">Sync</button>' + '<button class="moonfin-panel-btn moonfin-panel-btn-close moonfin-settings-close-btn">Close</button>' + '</div>' + '</div>' + '</div>';
    document.body.appendChild(this.dialog);
    this.setupEventListeners();
    this.updateSyncStatus();
    this.updateJellyseerrSsoSection();
  },
  updateJellyseerrSsoSection: function () {
    var self = this;
    var wrapper = this.dialog ? this.dialog.querySelector('.moonfin-settings-jellyseerr-wrapper') : null;
    if (!wrapper) return Promise.resolve();

    // Always fetch fresh config to catch admin changes
    return Jellyseerr.fetchConfig().then(function () {
      // Only show if Jellyseerr is configured
      if (!Jellyseerr.config || !Jellyseerr.config.enabled || !Jellyseerr.config.url) {
        console.log('[Moonfin] Jellyseerr not configured, hiding section. Config:', Jellyseerr.config);
        wrapper.style.display = 'none';
        return;
      }
      wrapper.style.display = '';
      var indicator = wrapper.querySelector('.moonfin-jellyseerr-sso-indicator');
      var text = wrapper.querySelector('.moonfin-jellyseerr-sso-text');
      var loginGroup = wrapper.querySelector('.moonfin-jellyseerr-login-group');
      var signedInGroup = wrapper.querySelector('.moonfin-jellyseerr-signedIn-group');
      return Jellyseerr.checkSsoStatus().then(function () {
        if (Jellyseerr.ssoStatus && Jellyseerr.ssoStatus.authenticated) {
          indicator.className = 'moonfin-jellyseerr-sso-indicator connected';
          var displayName = Jellyseerr.ssoStatus.displayName || 'Unknown';
          text.textContent = 'Signed in as ' + displayName;
          loginGroup.style.display = 'none';
          signedInGroup.style.display = '';
        } else {
          indicator.className = 'moonfin-jellyseerr-sso-indicator disconnected';
          text.textContent = 'Not signed in';
          loginGroup.style.display = '';
          signedInGroup.style.display = 'none';
          var api = API.getApiClient();
          if (api && api._currentUser) {
            var usernameInput = wrapper.querySelector('#jellyseerr-settings-username');
            if (usernameInput && !usernameInput.value) {
              usernameInput.value = api._currentUser.Name || '';
            }
          }
        }
      });
    });
  },
  updateSyncStatus: function () {
    var self = this;
    var statusEl = this.dialog ? this.dialog.querySelector('#moonfinSyncStatus') : null;
    if (!statusEl) return Promise.resolve();
    var indicator = statusEl.querySelector('.moonfin-sync-indicator');
    var text = statusEl.querySelector('.moonfin-sync-text');
    var syncStatus = Storage.getSyncStatus();
    if (syncStatus.syncing) {
      indicator.className = 'moonfin-sync-indicator syncing';
      text.textContent = 'Syncing...';
      return Promise.resolve();
    }

    // Always re-ping when the panel opens to get fresh status
    indicator.className = 'moonfin-sync-indicator checking';
    text.textContent = 'Checking server...';
    return Storage.pingServer().then(function () {
      var freshStatus = Storage.getSyncStatus();
      if (freshStatus.available) {
        indicator.className = 'moonfin-sync-indicator connected';
        if (freshStatus.lastSync) {
          var ago = Math.round((Date.now() - freshStatus.lastSync) / 1000);
          text.textContent = 'Synced ' + (ago < 60 ? ago + 's' : Math.round(ago / 60) + 'm') + ' ago';
        } else {
          text.textContent = 'Server sync available';
        }
      } else {
        indicator.className = 'moonfin-sync-indicator disconnected';
        text.textContent = freshStatus.error || 'Server sync unavailable';
      }
    });
  },
  setupEventListeners: function () {
    var self = this;

    // Close buttons
    this.dialog.querySelector('.moonfin-settings-close').addEventListener('click', function () {
      self.hide();
    });
    this.dialog.querySelector('.moonfin-settings-close-btn').addEventListener('click', function () {
      self.hide();
    });
    this.dialog.querySelector('.moonfin-settings-overlay').addEventListener('click', function () {
      self.hide();
    });

    // Reset
    this.dialog.querySelector('.moonfin-settings-reset').addEventListener('click', function () {
      if (confirm('Reset all Moonfin settings to defaults?')) {
        Storage.reset();
        self.showToast('Settings reset to defaults');
        self.hide();
        setTimeout(function () {
          self.show();
        }, 350);
      }
    });

    // Sync
    this.dialog.querySelector('.moonfin-settings-sync').addEventListener('click', function () {
      var syncBtn = self.dialog.querySelector('.moonfin-settings-sync');
      syncBtn.disabled = true;
      syncBtn.textContent = 'Syncing...';
      Storage.sync().then(function () {
        return self.updateSyncStatus();
      }).then(function () {
        syncBtn.disabled = false;
        syncBtn.textContent = 'Sync';
        self.showToast('Settings synced');
        self.hide();
        setTimeout(function () {
          self.show();
        }, 350);
      });
    });

    // --- Immediate save on toggle change ---
    var checkboxes = this.dialog.querySelectorAll('input[type="checkbox"][name]');
    for (var i = 0; i < checkboxes.length; i++) {
      (function (cb) {
        cb.addEventListener('change', function () {
          self.saveSetting(cb.name, cb.checked);
          self.showToast(cb.checked ? 'Enabled' : 'Disabled');

          // Toggle MDBList config visibility
          if (cb.name === 'mdblistEnabled') {
            var configDiv = self.dialog.querySelector('.moonfin-mdblist-config');
            if (configDiv) {
              configDiv.style.display = cb.checked ? '' : 'none';
            }
          }
        });
      })(checkboxes[i]);
    }

    // --- Immediate save on select change ---
    var selects = this.dialog.querySelectorAll('select');
    for (var j = 0; j < selects.length; j++) {
      (function (sel) {
        sel.addEventListener('change', function () {
          var val = sel.value;
          var numVal = parseInt(val, 10);
          self.saveSetting(sel.name, isNaN(numVal) ? val : numVal);
          self.showToast('Setting updated');
        });
      })(selects[j]);
    }

    // --- Immediate save on range change ---
    var ranges = this.dialog.querySelectorAll('input[type="range"]');
    for (var k = 0; k < ranges.length; k++) {
      (function (range) {
        range.addEventListener('input', function () {
          var valueSpan = self.dialog.querySelector('.moonfin-range-value[data-for="' + range.name + '"]');
          if (valueSpan) {
            valueSpan.textContent = range.value + '%';
          }
        });
        range.addEventListener('change', function () {
          self.saveSetting(range.name, parseInt(range.value, 10));
          self.showToast('Setting updated');
        });
      })(ranges[k]);
    }

    // Color preview update
    var colorSelect = this.dialog.querySelector('select[name="mediaBarOverlayColor"]');
    if (colorSelect) {
      colorSelect.addEventListener('change', function () {
        var preview = self.dialog.querySelector('#moonfin-color-preview');
        if (preview) {
          preview.style.background = Storage.getColorHex(colorSelect.value);
        }
      });
    }

    // Escape key
    this.dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        self.hide();
      }
    });

    // MDBList API key - save on blur
    var mdblistApiKeyInput = this.dialog.querySelector('#moonfin-mdblistApiKey');
    if (mdblistApiKeyInput) {
      mdblistApiKeyInput.addEventListener('change', function () {
        self.saveSetting('mdblistApiKey', mdblistApiKeyInput.value.trim());
        self.showToast('API key saved');
      });
    }

    // MDBList source checkboxes
    var sourceCheckboxes = this.dialog.querySelectorAll('.moonfin-mdblist-source-cb');
    for (var sci = 0; sci < sourceCheckboxes.length; sci++) {
      (function (cb) {
        cb.addEventListener('change', function () {
          // Collect all checked sources
          var checked = [];
          var allCbs = self.dialog.querySelectorAll('.moonfin-mdblist-source-cb');
          for (var x = 0; x < allCbs.length; x++) {
            if (allCbs[x].checked) {
              checked.push(allCbs[x].getAttribute('data-source'));
            }
          }
          self.saveSetting('mdblistRatingSources', checked);
          self.showToast('Rating sources updated');
        });
      })(sourceCheckboxes[sci]);
    }

    // Jellyseerr SSO event listeners
    var loginBtn = this.dialog.querySelector('.moonfin-jellyseerr-settings-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        self.handleJellyseerrLogin();
      });
    }
    var passwordInput = this.dialog.querySelector('#jellyseerr-settings-password');
    if (passwordInput) {
      passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          self.handleJellyseerrLogin();
        }
      });
    }
    var logoutBtn = this.dialog.querySelector('.moonfin-jellyseerr-settings-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        if (confirm('Sign out of Jellyseerr? You will need to sign in again to use it.')) {
          Jellyseerr.ssoLogout().then(function () {
            self.updateJellyseerrSsoSection();
            self.showToast('Signed out of Jellyseerr');
          });
        }
      });
    }
  },
  handleJellyseerrLogin: function () {
    var self = this;
    var wrapper = this.dialog ? this.dialog.querySelector('.moonfin-settings-jellyseerr-wrapper') : null;
    if (!wrapper) return;
    var username = wrapper.querySelector('#jellyseerr-settings-username');
    var password = wrapper.querySelector('#jellyseerr-settings-password');
    var errorEl = wrapper.querySelector('.moonfin-jellyseerr-login-error');
    var submitBtn = wrapper.querySelector('.moonfin-jellyseerr-settings-login-btn');
    var usernameVal = username ? username.value : '';
    var passwordVal = password ? password.value : '';
    if (!usernameVal || !passwordVal) {
      errorEl.textContent = 'Please enter your username and password.';
      errorEl.style.display = 'block';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    errorEl.style.display = 'none';
    Jellyseerr.ssoLogin(usernameVal, passwordVal).then(function (result) {
      if (result.success) {
        self.updateJellyseerrSsoSection();
        self.showToast('Signed in to Jellyseerr');
      } else {
        errorEl.textContent = result.error || 'Authentication failed';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }
};

// === components/jellyseerr.js ===
const Jellyseerr = {
  container: null,
  iframe: null,
  isOpen: false,
  config: null,
  ssoStatus: null,
  init() {
    var _this12 = this;
    return _asyncToGenerator(function* () {
      var _this12$config, _this12$config2;
      yield _this12.fetchConfig();
      if ((_this12$config = _this12.config) !== null && _this12$config !== void 0 && _this12$config.enabled && (_this12$config2 = _this12.config) !== null && _this12$config2 !== void 0 && _this12$config2.url) {
        console.log('[Moonfin] Jellyseerr enabled:', _this12.config.url);
        yield _this12.checkSsoStatus();
        window.dispatchEvent(new CustomEvent('moonfin-jellyseerr-config', {
          detail: _this12.config
        }));
      }
    })();
  },
  fetchConfig() {
    var _this13 = this;
    return _asyncToGenerator(function* () {
      try {
        var _window$ApiClient7, _window$ApiClient7$se, _window$ApiClient8, _window$ApiClient8$ac;
        const serverUrl = ((_window$ApiClient7 = window.ApiClient) === null || _window$ApiClient7 === void 0 || (_window$ApiClient7$se = _window$ApiClient7.serverAddress) === null || _window$ApiClient7$se === void 0 ? void 0 : _window$ApiClient7$se.call(_window$ApiClient7)) || '';
        const token = (_window$ApiClient8 = window.ApiClient) === null || _window$ApiClient8 === void 0 || (_window$ApiClient8$ac = _window$ApiClient8.accessToken) === null || _window$ApiClient8$ac === void 0 ? void 0 : _window$ApiClient8$ac.call(_window$ApiClient8);
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
        var response = yield fetch(serverUrl + '/Moonfin/Jellyseerr/Config?' + params, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'MediaBrowser Token="' + token + '"'
          }
        });
        if (response.ok) {
          _this13.config = API.toCamelCase(yield response.json());
        }
      } catch (e) {
        console.error('[Moonfin] Failed to fetch Jellyseerr config:', e);
      }
    })();
  },
  checkSsoStatus() {
    var _this14 = this;
    return _asyncToGenerator(function* () {
      try {
        var _window$ApiClient9, _window$ApiClient9$se, _window$ApiClient0, _window$ApiClient0$ac;
        var serverUrl = ((_window$ApiClient9 = window.ApiClient) === null || _window$ApiClient9 === void 0 || (_window$ApiClient9$se = _window$ApiClient9.serverAddress) === null || _window$ApiClient9$se === void 0 ? void 0 : _window$ApiClient9$se.call(_window$ApiClient9)) || '';
        var token = (_window$ApiClient0 = window.ApiClient) === null || _window$ApiClient0 === void 0 || (_window$ApiClient0$ac = _window$ApiClient0.accessToken) === null || _window$ApiClient0$ac === void 0 ? void 0 : _window$ApiClient0$ac.call(_window$ApiClient0);
        if (!serverUrl || !token) return;
        var response = yield fetch(serverUrl + '/Moonfin/Jellyseerr/Status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'MediaBrowser Token="' + token + '"'
          }
        });
        if (response.ok) {
          _this14.ssoStatus = API.toCamelCase(yield response.json());
          console.log('[Moonfin] Jellyseerr SSO status:', _this14.ssoStatus.authenticated ? 'authenticated' : 'not authenticated');
        }
      } catch (e) {
        console.error('[Moonfin] Failed to check Jellyseerr SSO status:', e);
      }
    })();
  },
  ssoLogin(username, password) {
    var _this15 = this;
    return _asyncToGenerator(function* () {
      try {
        var _window$ApiClient1, _window$ApiClient1$se, _window$ApiClient10, _window$ApiClient10$a;
        var serverUrl = ((_window$ApiClient1 = window.ApiClient) === null || _window$ApiClient1 === void 0 || (_window$ApiClient1$se = _window$ApiClient1.serverAddress) === null || _window$ApiClient1$se === void 0 ? void 0 : _window$ApiClient1$se.call(_window$ApiClient1)) || '';
        var token = (_window$ApiClient10 = window.ApiClient) === null || _window$ApiClient10 === void 0 || (_window$ApiClient10$a = _window$ApiClient10.accessToken) === null || _window$ApiClient10$a === void 0 ? void 0 : _window$ApiClient10$a.call(_window$ApiClient10);
        if (!serverUrl || !token) {
          return {
            success: false,
            error: 'Not authenticated with Jellyfin'
          };
        }
        var response = yield fetch(serverUrl + '/Moonfin/Jellyseerr/Login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'MediaBrowser Token="' + token + '"'
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        });
        var result = API.toCamelCase(yield response.json());
        if (response.ok && result.success) {
          var _this15$config;
          _this15.ssoStatus = {
            enabled: true,
            authenticated: true,
            url: (_this15$config = _this15.config) === null || _this15$config === void 0 ? void 0 : _this15$config.url,
            jellyseerrUserId: result.jellyseerrUserId,
            displayName: result.displayName,
            avatar: result.avatar,
            permissions: result.permissions
          };
          console.log('[Moonfin] Jellyseerr SSO login successful:', result.displayName);
          return {
            success: true
          };
        }
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      } catch (e) {
        console.error('[Moonfin] Jellyseerr SSO login error:', e);
        return {
          success: false,
          error: 'Connection error'
        };
      }
    })();
  },
  ssoLogout() {
    var _this16 = this;
    return _asyncToGenerator(function* () {
      try {
        var _window$ApiClient11, _window$ApiClient11$s, _window$ApiClient12, _window$ApiClient12$a, _this16$config;
        var serverUrl = ((_window$ApiClient11 = window.ApiClient) === null || _window$ApiClient11 === void 0 || (_window$ApiClient11$s = _window$ApiClient11.serverAddress) === null || _window$ApiClient11$s === void 0 ? void 0 : _window$ApiClient11$s.call(_window$ApiClient11)) || '';
        var token = (_window$ApiClient12 = window.ApiClient) === null || _window$ApiClient12 === void 0 || (_window$ApiClient12$a = _window$ApiClient12.accessToken) === null || _window$ApiClient12$a === void 0 ? void 0 : _window$ApiClient12$a.call(_window$ApiClient12);
        if (!serverUrl || !token) return;
        yield fetch(serverUrl + '/Moonfin/Jellyseerr/Logout', {
          method: 'DELETE',
          headers: {
            'Authorization': 'MediaBrowser Token="' + token + '"'
          }
        });
        _this16.ssoStatus = {
          enabled: true,
          authenticated: false,
          url: (_this16$config = _this16.config) === null || _this16$config === void 0 ? void 0 : _this16$config.url
        };
        console.log('[Moonfin] Jellyseerr SSO logged out');
      } catch (e) {
        console.error('[Moonfin] Jellyseerr SSO logout error:', e);
      }
    })();
  },
  ssoApiCall(method, path, body) {
    var _this17 = this;
    return _asyncToGenerator(function* () {
      var _window$ApiClient13, _window$ApiClient13$s, _window$ApiClient14, _window$ApiClient14$a;
      var serverUrl = ((_window$ApiClient13 = window.ApiClient) === null || _window$ApiClient13 === void 0 || (_window$ApiClient13$s = _window$ApiClient13.serverAddress) === null || _window$ApiClient13$s === void 0 ? void 0 : _window$ApiClient13$s.call(_window$ApiClient13)) || '';
      var token = (_window$ApiClient14 = window.ApiClient) === null || _window$ApiClient14 === void 0 || (_window$ApiClient14$a = _window$ApiClient14.accessToken) === null || _window$ApiClient14$a === void 0 ? void 0 : _window$ApiClient14$a.call(_window$ApiClient14);
      if (!serverUrl || !token) {
        throw new Error('Not authenticated with Jellyfin');
      }
      var options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'MediaBrowser Token="' + token + '"'
        }
      };
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }
      var response = yield fetch(serverUrl + '/Moonfin/Jellyseerr/Api/' + path, options);
      if (response.status === 401) {
        var _this17$config;
        // Session expired - clear status
        _this17.ssoStatus = {
          enabled: true,
          authenticated: false,
          url: (_this17$config = _this17.config) === null || _this17$config === void 0 ? void 0 : _this17$config.url
        };
        throw new Error('SESSION_EXPIRED');
      }
      return response;
    })();
  },
  open() {
    var _this$config, _this$config2, _this$ssoStatus;
    if (!((_this$config = this.config) !== null && _this$config !== void 0 && _this$config.enabled) || !((_this$config2 = this.config) !== null && _this$config2 !== void 0 && _this$config2.url)) {
      console.warn('[Moonfin] Jellyseerr not configured');
      return;
    }
    if (this.isOpen) return;

    // Check SSO status - direct user to Settings if not authenticated
    if (!((_this$ssoStatus = this.ssoStatus) !== null && _this$ssoStatus !== void 0 && _this$ssoStatus.authenticated)) {
      this.showSignInPrompt();
      return;
    }
    if (this.config.openInNewTab) {
      window.open(this.config.url, '_blank');
      return;
    }
    this.createContainer();
    this.isOpen = true;
    document.body.classList.add('moonfin-jellyseerr-open');
    requestAnimationFrame(function () {
      if (Jellyseerr.container) {
        Jellyseerr.container.classList.add('open');
      }
    });
  },
  showSignInPrompt() {
    // Show a brief toast-style prompt directing user to Settings
    var existing = document.querySelector('.moonfin-jellyseerr-signin-prompt');
    if (existing) existing.remove();
    var prompt = document.createElement('div');
    prompt.className = 'moonfin-jellyseerr-signin-prompt';
    prompt.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1e1e2e; border:1px solid #555; border-radius:8px; padding:1.5em 2em; z-index:100001; text-align:center; color:#fff; box-shadow:0 4px 24px rgba(0,0,0,0.5);';
    prompt.innerHTML = '<p style="margin:0 0 1em 0; font-size:1em;">Sign in to Jellyseerr in <strong>Moonfin Settings</strong> first.</p>' + '<div style="display:flex; gap:0.5em; justify-content:center;">' + '<button class="moonfin-prompt-settings-btn" style="padding:0.5em 1.5em; border:none; border-radius:4px; background:#6366f1; color:#fff; cursor:pointer; font-size:0.9em;">Open Settings</button>' + '<button class="moonfin-prompt-close-btn" style="padding:0.5em 1.5em; border:none; border-radius:4px; background:#555; color:#fff; cursor:pointer; font-size:0.9em;">Close</button>' + '</div>';
    document.body.appendChild(prompt);
    prompt.querySelector('.moonfin-prompt-close-btn').addEventListener('click', function () {
      prompt.remove();
    });
    prompt.querySelector('.moonfin-prompt-settings-btn').addEventListener('click', function () {
      prompt.remove();
      Settings.show();
    });

    // Auto-dismiss after 8 seconds
    setTimeout(function () {
      if (prompt.parentNode) prompt.remove();
    }, 8000);
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
    var _this$config3, _this$ssoStatus2;
    var existing = document.querySelector('.moonfin-jellyseerr-container');
    if (existing) {
      existing.remove();
    }
    this.container = document.createElement('div');
    this.container.className = 'moonfin-jellyseerr-container';
    var displayName = ((_this$config3 = this.config) === null || _this$config3 === void 0 ? void 0 : _this$config3.displayName) || 'Jellyseerr';
    var ssoUser = ((_this$ssoStatus2 = this.ssoStatus) === null || _this$ssoStatus2 === void 0 ? void 0 : _this$ssoStatus2.displayName) || '';
    this.container.innerHTML = '<div class="moonfin-jellyseerr-header">' + '<div class="moonfin-jellyseerr-title">' + '<svg class="moonfin-jellyseerr-icon" viewBox="0 0 24 24" width="24" height="24">' + '<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' + '</svg>' + '<span>' + displayName + '</span>' + (ssoUser ? '<span class="moonfin-jellyseerr-sso-user"> &mdash; ' + ssoUser + '</span>' : '') + '</div>' + '<div class="moonfin-jellyseerr-actions">' + '<button class="moonfin-jellyseerr-btn moonfin-jellyseerr-refresh" title="Refresh">' + '<svg viewBox="0 0 24 24" width="20" height="20">' + '<path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>' + '</svg>' + '</button>' + '<button class="moonfin-jellyseerr-btn moonfin-jellyseerr-external" title="Open in new tab">' + '<svg viewBox="0 0 24 24" width="20" height="20">' + '<path fill="currentColor" d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>' + '</svg>' + '</button>' + '<button class="moonfin-jellyseerr-btn moonfin-jellyseerr-signout" title="Sign out of Jellyseerr">' + '<svg viewBox="0 0 24 24" width="20" height="20">' + '<path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>' + '</svg>' + '</button>' + '<button class="moonfin-jellyseerr-btn moonfin-jellyseerr-close" title="Close">' + '<svg viewBox="0 0 24 24" width="20" height="20">' + '<path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>' + '</svg>' + '</button>' + '</div>' + '</div>' + '<div class="moonfin-jellyseerr-loading">' + '<div class="moonfin-jellyseerr-spinner"></div>' + '<span>Loading ' + displayName + '...</span>' + '</div>' + '<iframe ' + 'class="moonfin-jellyseerr-iframe" ' + 'src="' + this.config.url + '" ' + 'allow="fullscreen" ' + 'sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"' + '></iframe>';
    document.body.appendChild(this.container);
    this.iframe = this.container.querySelector('.moonfin-jellyseerr-iframe');
    this.setupEventListeners();
  },
  setupEventListeners() {
    var _this$container$query4, _this$container$query5, _this$container$query6, _this$container$query7, _this$iframe, _this$iframe2;
    var self = this;
    (_this$container$query4 = this.container.querySelector('.moonfin-jellyseerr-close')) === null || _this$container$query4 === void 0 || _this$container$query4.addEventListener('click', function () {
      self.close();
    });
    (_this$container$query5 = this.container.querySelector('.moonfin-jellyseerr-refresh')) === null || _this$container$query5 === void 0 || _this$container$query5.addEventListener('click', function () {
      self.refresh();
    });
    (_this$container$query6 = this.container.querySelector('.moonfin-jellyseerr-external')) === null || _this$container$query6 === void 0 || _this$container$query6.addEventListener('click', function () {
      window.open(self.config.url, '_blank');
    });
    (_this$container$query7 = this.container.querySelector('.moonfin-jellyseerr-signout')) === null || _this$container$query7 === void 0 || _this$container$query7.addEventListener('click', function () {
      if (confirm('Sign out of Jellyseerr? You will need to sign in again to use it.')) {
        self.close();
        self.ssoLogout();
      }
    });
    (_this$iframe = this.iframe) === null || _this$iframe === void 0 || _this$iframe.addEventListener('load', function () {
      self.container.classList.add('loaded');
    });
    (_this$iframe2 = this.iframe) === null || _this$iframe2 === void 0 || _this$iframe2.addEventListener('error', function () {
      self.showError('Failed to load. The site may block embedding.');
    });
    this._escHandler = function (e) {
      if (e.key === 'Escape' && self.isOpen) {
        self.close();
      }
    };
    document.addEventListener('keydown', this._escHandler);
  },
  refresh() {
    var _this$config4;
    if (this.iframe && (_this$config4 = this.config) !== null && _this$config4 !== void 0 && _this$config4.url) {
      this.container.classList.remove('loaded');
      this.iframe.src = this.config.url;
    }
  },
  showError(message) {
    var _this$container;
    const loading = (_this$container = this.container) === null || _this$container === void 0 ? void 0 : _this$container.querySelector('.moonfin-jellyseerr-loading');
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

// === components/details.js ===
/**
 * Moonfin Details Panel
 * Custom details overlay for media items, styled like the Android TV app
 */

var Details = {
  container: null,
  currentItem: null,
  isVisible: false,
  /**
   * Initialize the details component
   */
  init: function () {
    console.log('[Moonfin] Details: Initializing...');
    this.createContainer();
    this.setupItemInterception();
    console.log('[Moonfin] Details: Initialized');
  },
  /**
   * Create the details container
   */
  createContainer: function () {
    var existing = document.querySelector('.moonfin-details-overlay');
    if (existing) existing.remove();
    this.container = document.createElement('div');
    this.container.className = 'moonfin-details-overlay';
    this.container.innerHTML = '<div class="moonfin-details-panel"></div>';
    document.body.appendChild(this.container);
  },
  /**
   * Setup interception of item clicks to show custom details
   */
  setupItemInterception: function () {
    var self = this;

    // Use event delegation on document - intercept BEFORE Jellyfin handlers
    document.addEventListener('click', function (e) {
      // Find the card element
      var card = e.target.closest('.card, .listItem, [data-id]');
      if (!card) return;

      // Don't intercept if it's an inner button (like play, more options)
      if (e.target.closest('.cardOverlayButton, .listItemButton, .btnPlayItem')) {
        return;
      }

      // Get item ID from the card
      var itemId = self.getItemIdFromCard(card);
      if (!itemId) return;

      // Check if it's a media item (movie, series, episode)
      var cardType = card.getAttribute('data-type') || (card.querySelector('[data-type]') ? card.querySelector('[data-type]').getAttribute('data-type') : null) || self.inferCardType(card);

      // Only intercept for movies, series, and episodes
      if (['Movie', 'Series', 'Episode', 'Season'].indexOf(cardType) !== -1) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        self.showDetails(itemId, cardType);
        return false;
      }
    }, true);

    // Also intercept link clicks within cards
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="id="], a[href*="/details"]');
      if (!link) return;
      var card = link.closest('.card, .listItem');
      if (!card) return;
      var itemId = self.getItemIdFromCard(card) || self.getItemIdFromLink(link);
      if (!itemId) return;
      var cardType = card.getAttribute('data-type') || self.inferCardType(card);
      if (['Movie', 'Series', 'Episode', 'Season'].indexOf(cardType) !== -1) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        self.showDetails(itemId, cardType);
        return false;
      }
    }, true);

    // Also listen for card focus/enter on TV
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        var focused = document.activeElement;
        var card = (focused ? focused.closest('.card, .listItem') : null) || (focused && focused.classList.contains('card') ? focused : null);
        if (card) {
          var itemId = self.getItemIdFromCard(card);
          var cardType = card.getAttribute('data-type') || self.inferCardType(card);
          if (itemId && ['Movie', 'Series', 'Episode', 'Season'].indexOf(cardType) !== -1) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            self.showDetails(itemId, cardType);
            return false;
          }
        }
      }
    }, true);

    // Close on back button
    document.addEventListener('keydown', function (e) {
      if (self.isVisible && (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 461 || e.keyCode === 10009)) {
        e.preventDefault();
        e.stopPropagation();
        self.hide();
      }
    }, true);
  },
  /**
   * Get item ID from a card element
   */
  getItemIdFromCard: function (card) {
    var idFromAttr = card.getAttribute('data-id') || card.getAttribute('data-itemid');
    if (idFromAttr) return idFromAttr;
    var dataIdEl = card.querySelector('[data-id]');
    if (dataIdEl) return dataIdEl.getAttribute('data-id');
    var link = card.querySelector('a');
    if (link && link.href) {
      var match = link.href.match(/id=([a-f0-9]+)/i) || link.href.match(/\/([a-f0-9]{32})/i);
      if (match) return match[1];
    }
    return null;
  },
  /**
   * Get item ID from a link element
   */
  getItemIdFromLink: function (link) {
    if (!link || !link.href) return null;
    var match = link.href.match(/id=([a-f0-9]+)/i) || link.href.match(/\/details\?id=([a-f0-9]+)/i) || link.href.match(/\/([a-f0-9]{32})/i);
    return match ? match[1] : null;
  },
  /**
   * Infer card type from structure
   */
  inferCardType: function (card) {
    var classList = card.className.toLowerCase();
    if (classList.indexOf('movie') !== -1) return 'Movie';
    if (classList.indexOf('series') !== -1) return 'Series';
    if (classList.indexOf('episode') !== -1) return 'Episode';
    if (classList.indexOf('season') !== -1) return 'Season';
    var section = card.closest('.homeSection, .section');
    if (section) {
      var sectionTitle = section.querySelector('.sectionTitle');
      var title = sectionTitle ? sectionTitle.textContent.toLowerCase() : '';
      if (title.indexOf('movie') !== -1) return 'Movie';
      if (title.indexOf('series') !== -1 || title.indexOf('show') !== -1) return 'Series';
      if (title.indexOf('episode') !== -1) return 'Episode';
    }
    return null;
  },
  /**
   * Show details for an item
   */
  showDetails: function (itemId, itemType) {
    var self = this;
    console.log('[Moonfin] Details: Loading item', itemId, itemType);
    var api = API.getApiClient();
    if (!api) {
      console.error('[Moonfin] Details: No API client');
      return;
    }
    this.container.classList.add('visible');
    this.isVisible = true;
    document.body.classList.add('moonfin-details-visible');
    var panel = this.container.querySelector('.moonfin-details-panel');
    panel.innerHTML = '<div class="moonfin-details-loading"><div class="moonfin-spinner"></div><span>Loading...</span></div>';
    this.fetchItem(api, itemId).then(function (item) {
      self.currentItem = item;

      // Fetch additional data in parallel
      var similarPromise = self.fetchSimilar(api, itemId).catch(function () {
        return [];
      });
      var castPromise = Promise.resolve(item.People || []);
      var seasonsPromise = item.Type === 'Series' ? self.fetchSeasons(api, itemId).catch(function () {
        return [];
      }) : Promise.resolve([]);
      var episodesPromise = item.Type === 'Episode' && item.SeasonId ? self.fetchEpisodes(api, item.SeriesId, item.SeasonId).catch(function () {
        return [];
      }) : Promise.resolve([]);
      return Promise.all([similarPromise, castPromise, seasonsPromise, episodesPromise]).then(function (results) {
        var similar = results[0];
        var cast = results[1];
        var seasons = results[2];
        var episodes = results[3];
        self.renderDetails(item, similar, cast, seasons, episodes);

        // Fetch MDBList ratings asynchronously
        if (MdbList.isEnabled()) {
          MdbList.fetchRatings(item).then(function (ratings) {
            if (ratings && ratings.length > 0 && self.currentItem && self.currentItem.Id === item.Id) {
              self.renderMdbListRatings(ratings);
            }
          });
        }

        // Focus first button
        setTimeout(function () {
          var firstBtn = panel.querySelector('.moonfin-btn');
          if (firstBtn) firstBtn.focus();
        }, 100);
      });
    }).catch(function (err) {
      console.error('[Moonfin] Details: Error loading item', err);
      panel.innerHTML = '<div class="moonfin-details-error"><span>Failed to load details</span><button class="moonfin-btn moonfin-focusable" onclick="Details.hide()">Close</button></div>';
    });
  },
  /**
   * Fetch item details from API
   */
  fetchItem: function (api, itemId) {
    var userId = api.getCurrentUserId();
    return api.getItem(userId, itemId);
  },
  /**
   * Fetch similar items
   */
  fetchSimilar: function (api, itemId) {
    var userId = api.getCurrentUserId();
    return api.getSimilarItems(itemId, {
      userId: userId,
      limit: 12,
      fields: 'PrimaryImageAspectRatio'
    }).then(function (result) {
      return result.Items || [];
    });
  },
  /**
   * Fetch seasons for a series
   */
  fetchSeasons: function (api, seriesId) {
    var userId = api.getCurrentUserId();
    return api.getSeasons(seriesId, {
      userId: userId,
      fields: 'PrimaryImageAspectRatio'
    }).then(function (result) {
      return result.Items || [];
    });
  },
  /**
   * Fetch episodes for a season
   */
  fetchEpisodes: function (api, seriesId, seasonId) {
    var userId = api.getCurrentUserId();
    var serverUrl = api._serverAddress || api.serverAddress();
    var headers = this.getAuthHeaders();
    return fetch(serverUrl + '/Shows/' + seriesId + '/Episodes?UserId=' + userId + '&SeasonId=' + seasonId + '&Fields=Overview,PrimaryImageAspectRatio', {
      headers: headers
    }).then(function (resp) {
      return resp.json();
    }).then(function (result) {
      return result.Items || [];
    });
  },
  /**
   * Render the details panel - webOS Moonfin style
   */
  renderDetails: function (item, similar, cast, seasons, episodes) {
    var self = this;
    var panel = this.container.querySelector('.moonfin-details-panel');
    var api = API.getApiClient();
    var serverUrl = api._serverAddress;

    // Get backdrop
    var backdropId = item.BackdropImageTags && item.BackdropImageTags.length > 0 ? item.Id : item.ParentBackdropItemId || item.Id;
    var backdropUrl = serverUrl + '/Items/' + backdropId + '/Images/Backdrop?maxWidth=1920&quality=90';

    // Get poster
    var posterId = item.Id;
    var posterTag = item.ImageTags ? item.ImageTags.Primary : null;
    var posterUrl = posterTag ? serverUrl + '/Items/' + posterId + '/Images/Primary?maxHeight=500&quality=90' : '';

    // Get logo (optional)
    var logoTag = item.ImageTags ? item.ImageTags.Logo : null;
    var logoUrl = logoTag ? serverUrl + '/Items/' + item.Id + '/Images/Logo?maxWidth=400&quality=90' : null;

    // Format runtime
    var runtime = item.RunTimeTicks ? this.formatRuntime(item.RunTimeTicks) : '';

    // Get year
    var year = item.ProductionYear || (item.PremiereDate ? new Date(item.PremiereDate).getFullYear() : '');

    // Get rating
    var rating = item.OfficialRating || '';

    // Get community rating
    var communityRating = item.CommunityRating ? item.CommunityRating.toFixed(1) : '';

    // Get critic rating
    var criticRating = item.CriticRating;

    // Get genres
    var genres = (item.Genres || []).join(', ');

    // Get directors
    var directors = (item.People || []).filter(function (p) {
      return p.Type === 'Director';
    }).map(function (p) {
      return p.Name;
    }).join(', ');

    // Get writers
    var writers = (item.People || []).filter(function (p) {
      return p.Type === 'Writer';
    }).map(function (p) {
      return p.Name;
    }).join(', ');

    // Get studios
    var studios = (item.Studios || []).map(function (s) {
      return s.Name;
    }).join(', ');

    // Get tagline
    var tagline = item.Taglines && item.Taglines.length > 0 ? item.Taglines[0] : '';

    // Media info badges
    var badges = this.getMediaBadges(item);

    // Check states
    var isFavorite = item.UserData ? item.UserData.IsFavorite : false;
    var isPlayed = item.UserData ? item.UserData.Played : false;
    var resumePosition = item.UserData ? item.UserData.PlaybackPositionTicks || 0 : 0;
    var hasResume = resumePosition > 0;
    var isEpisode = item.Type === 'Episode';
    var isSeries = item.Type === 'Series';
    var seasonCount = item.ChildCount || seasons.length || 0;

    // Build info badges row
    var infoItems = [];
    if (year) infoItems.push('<span class="moonfin-info-item">' + year + '</span>');
    if (rating) infoItems.push('<span class="moonfin-info-pill">' + rating + '</span>');
    if (communityRating) infoItems.push('<span class="moonfin-info-item moonfin-star-rating"><svg viewBox="0 -960 960 960" fill="currentColor" width="16" height="16"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/></svg> ' + communityRating + '</span>');
    if (criticRating) infoItems.push('<span class="moonfin-info-item moonfin-critic-rating">' + criticRating + '%</span>');
    if (runtime && item.Type !== 'Series') infoItems.push('<span class="moonfin-info-item">' + runtime + '</span>');
    if (isSeries && seasonCount > 0) {
      infoItems.push('<span class="moonfin-info-item">' + seasonCount + ' Season' + (seasonCount !== 1 ? 's' : '') + '</span>');
    }
    badges.forEach(function (badge) {
      infoItems.push(badge);
    });
    var infoRowHtml = infoItems.length > 0 ? '<div class="moonfin-info-row">' + infoItems.join('') + '</div>' : '';

    // Episode header for episodes
    var episodeHeader = '';
    if (isEpisode) {
      var epInfo = '';
      if (item.ParentIndexNumber !== undefined && item.IndexNumber !== undefined) {
        epInfo = 'S' + item.ParentIndexNumber + ' E' + item.IndexNumber;
      }
      episodeHeader = '<div class="moonfin-episode-header">' + (item.SeriesName ? '<span class="moonfin-series-name">' + item.SeriesName + '</span>' : '') + (epInfo ? '<span class="moonfin-episode-number">' + epInfo + '</span>' : '') + '</div>';
    }

    // Build action buttons - webOS style large icons
    var actionBtns = [];
    if (hasResume) {
      actionBtns.push('<div class="moonfin-btn-wrapper moonfin-focusable" data-action="play" tabindex="0">' + '<div class="moonfin-btn-circle moonfin-btn-primary">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' + '</div>' + '<span class="moonfin-btn-label">Resume</span>' + '</div>');
    }
    actionBtns.push('<div class="moonfin-btn-wrapper moonfin-focusable" data-action="' + (hasResume ? 'restart' : 'play') + '" tabindex="0">' + '<div class="moonfin-btn-circle">' + (hasResume ? '<svg viewBox="0 -960 960 960" fill="currentColor"><path d="M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80Z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>') + '</div>' + '<span class="moonfin-btn-label">' + (hasResume ? 'Restart' : 'Play') + '</span>' + '</div>');
    if (isSeries) {
      actionBtns.push('<div class="moonfin-btn-wrapper moonfin-focusable" data-action="shuffle" tabindex="0">' + '<div class="moonfin-btn-circle">' + '<svg viewBox="0 -960 960 960" fill="currentColor"><path d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"/></svg>' + '</div>' + '<span class="moonfin-btn-label">Shuffle</span>' + '</div>');
    }
    actionBtns.push('<div class="moonfin-btn-wrapper moonfin-focusable ' + (isPlayed ? 'active' : '') + '" data-action="played" tabindex="0">' + '<div class="moonfin-btn-circle">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z"/></svg>' + '</div>' + '<span class="moonfin-btn-label">' + (isPlayed ? 'Watched' : 'Unwatched') + '</span>' + '</div>');
    actionBtns.push('<div class="moonfin-btn-wrapper moonfin-focusable ' + (isFavorite ? 'active' : '') + '" data-action="favorite" tabindex="0">' + '<div class="moonfin-btn-circle">' + '<svg viewBox="0 -960 960 960" fill="currentColor"><path d="' + (isFavorite ? 'm480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z' : 'M480-120q-14 0-28.5-5T426-140q-43-38-97.5-82.5T232-308q-41.5-41.5-72-83T122-475q-8-32-11-60.5T108-596q0-86 57-147t147-61q52 0 99 22t69 62q22-40 69-62t99-22q90 0 147 61t57 147q0 32-3 60.5T837-475q-7 42-37.5 83.5T728-308q-42 42-96.5 86.5T534-140q-11 10-25.5 15t-28.5 5Zm0-80q41-37 88.5-75t83-68.5q35.5-30.5 61-58T746-456q9-27 11.5-49t2.5-43q0-53-34.5-91.5T636-678q-43 0-77.5 24T507-602h-54q-17-28-51.5-52T324-678q-55 0-89.5 38.5T200-548q0 21 2.5 43t11.5 49q9 27 34.5 54.5t61 58Q345-313 392.5-275T480-200Z') + '"/></svg>' + '</div>' + '<span class="moonfin-btn-label">' + (isFavorite ? 'Favorited' : 'Favorite') + '</span>' + '</div>');
    if (isEpisode && item.SeriesId) {
      actionBtns.push('<div class="moonfin-btn-wrapper moonfin-focusable" data-action="series" tabindex="0">' + '<div class="moonfin-btn-circle">' + '<svg viewBox="0 -960 960 960" fill="currentColor"><path d="M320-120v-80l40-40H160q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v440q0 33-23.5 56.5T800-240H680l40 40v80H320Z"/></svg>' + '</div>' + '<span class="moonfin-btn-label">Go to Series</span>' + '</div>');
    }
    actionBtns.push('<div class="moonfin-btn-wrapper moonfin-focusable" data-action="more" tabindex="0">' + '<div class="moonfin-btn-circle">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>' + '</div>' + '<span class="moonfin-btn-label">More</span>' + '</div>');

    // Build metadata section
    var metadataRows = [];
    if (genres) metadataRows.push('<div class="moonfin-metadata-cell"><span class="moonfin-metadata-label">Genres</span><span class="moonfin-metadata-value">' + genres + '</span></div>');
    if (directors) metadataRows.push('<div class="moonfin-metadata-cell"><span class="moonfin-metadata-label">Director</span><span class="moonfin-metadata-value">' + directors + '</span></div>');
    if (writers) metadataRows.push('<div class="moonfin-metadata-cell"><span class="moonfin-metadata-label">Writers</span><span class="moonfin-metadata-value">' + writers + '</span></div>');
    if (studios) metadataRows.push('<div class="moonfin-metadata-cell"><span class="moonfin-metadata-label">Studio</span><span class="moonfin-metadata-value">' + studios + '</span></div>');
    if (runtime) metadataRows.push('<div class="moonfin-metadata-cell"><span class="moonfin-metadata-label">Runtime</span><span class="moonfin-metadata-value">' + runtime + '</span></div>');
    if (isSeries && seasonCount > 0) metadataRows.push('<div class="moonfin-metadata-cell"><span class="moonfin-metadata-label">Seasons</span><span class="moonfin-metadata-value">' + seasonCount + '</span></div>');
    var metadataHtml = metadataRows.length > 0 ? '<div class="moonfin-metadata-group">' + metadataRows.join('') + '</div>' : '';

    // Build cast HTML - circular photos
    var castHtml = cast.slice(0, 15).map(function (person) {
      var personImg = person.PrimaryImageTag ? serverUrl + '/Items/' + person.Id + '/Images/Primary?maxHeight=280&quality=80' : '';
      return '<div class="moonfin-cast-card moonfin-focusable" data-person-id="' + person.Id + '" tabindex="0">' + '<div class="moonfin-cast-photo">' + (personImg ? '<img src="' + personImg + '" alt="" loading="lazy">' : '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/></svg>') + '</div>' + '<span class="moonfin-cast-name">' + person.Name + '</span>' + '<span class="moonfin-cast-role">' + (person.Role || person.Type || '') + '</span>' + '</div>';
    }).join('');

    // Build similar items HTML
    var similarHtml = similar.slice(0, 12).map(function (sim) {
      var simPosterTag = sim.ImageTags ? sim.ImageTags.Primary : null;
      var simPosterUrl = simPosterTag ? serverUrl + '/Items/' + sim.Id + '/Images/Primary?maxHeight=400&quality=80' : '';
      return '<div class="moonfin-similar-card moonfin-focusable" data-item-id="' + sim.Id + '" data-type="' + sim.Type + '" tabindex="0">' + '<div class="moonfin-similar-poster">' + (simPosterUrl ? '<img src="' + simPosterUrl + '" alt="" loading="lazy">' : '') + '</div>' + '<span class="moonfin-similar-title">' + sim.Name + '</span>' + '</div>';
    }).join('');

    // Build seasons HTML
    var seasonsHtml = seasons.length > 0 ? '<div class="moonfin-section">' + '<div class="moonfin-section-header">' + '<h3 class="moonfin-section-title">Seasons</h3>' + '<div class="moonfin-section-arrows">' + '<button class="moonfin-section-arrow moonfin-arrow-left" aria-label="Scroll left">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>' + '</button>' + '<button class="moonfin-section-arrow moonfin-arrow-right" aria-label="Scroll right">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' + '</button>' + '</div>' + '</div>' + '<div class="moonfin-section-scroll">' + seasons.map(function (season) {
      var seasonPosterTag = season.ImageTags ? season.ImageTags.Primary : null;
      var seasonPoster = seasonPosterTag ? serverUrl + '/Items/' + season.Id + '/Images/Primary?maxHeight=350&quality=80' : '';
      return '<div class="moonfin-season-card moonfin-focusable" data-item-id="' + season.Id + '" data-type="Season" tabindex="0">' + '<div class="moonfin-season-poster">' + (seasonPoster ? '<img src="' + seasonPoster + '" alt="" loading="lazy">' : '<span>' + season.Name + '</span>') + '</div>' + '<span class="moonfin-season-name">' + season.Name + '</span>' + '</div>';
    }).join('') + '</div>' + '</div>' : '';

    // Build episodes HTML (for episode details - shows other episodes in the season)
    var episodesArr = episodes || [];
    var episodesHtml = '';
    if (isEpisode && episodesArr.length > 0) {
      var seasonLabel = item.ParentIndexNumber !== undefined ? 'Season ' + item.ParentIndexNumber + ' Episodes' : 'Episodes';
      var epCards = episodesArr.map(function (ep) {
        var epThumbTag = ep.ImageTags ? ep.ImageTags.Primary : null;
        var epThumbUrl = epThumbTag ? serverUrl + '/Items/' + ep.Id + '/Images/Primary?maxWidth=400&quality=80' : '';
        var isCurrentEp = ep.Id === item.Id;
        var epRuntime = ep.RunTimeTicks ? self.formatRuntime(ep.RunTimeTicks) : '';
        return '<div class="moonfin-episode-card moonfin-focusable' + (isCurrentEp ? ' moonfin-episode-current' : '') + '" data-item-id="' + ep.Id + '" data-type="Episode" tabindex="0">' + '<div class="moonfin-episode-thumb">' + (epThumbUrl ? '<img src="' + epThumbUrl + '" alt="" loading="lazy">' : '<div class="moonfin-episode-thumb-placeholder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 7.5l7 4.5-7 4.5z"/></svg></div>') + (ep.UserData && ep.UserData.PlayedPercentage ? '<div class="moonfin-episode-progress"><div class="moonfin-episode-progress-bar" style="width:' + Math.min(ep.UserData.PlayedPercentage, 100) + '%"></div></div>' : '') + '</div>' + '<div class="moonfin-episode-info">' + '<span class="moonfin-episode-ep-number">E' + (ep.IndexNumber || '?') + '</span>' + '<span class="moonfin-episode-ep-title">' + ep.Name + '</span>' + (epRuntime ? '<span class="moonfin-episode-ep-runtime">' + epRuntime + '</span>' : '') + '</div>' + '</div>';
      }).join('');
      episodesHtml = '<div class="moonfin-section">' + '<div class="moonfin-section-header">' + '<h3 class="moonfin-section-title">' + seasonLabel + '</h3>' + '<div class="moonfin-section-arrows">' + '<button class="moonfin-section-arrow moonfin-arrow-left" aria-label="Scroll left">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>' + '</button>' + '<button class="moonfin-section-arrow moonfin-arrow-right" aria-label="Scroll right">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' + '</button>' + '</div>' + '</div>' + '<div class="moonfin-section-scroll">' + epCards + '</div>' + '</div>';
    }

    // Assemble the full layout
    panel.innerHTML = '<div class="moonfin-details-backdrop" style="background-image: url(\'' + backdropUrl + '\')"></div>' + '<div class="moonfin-details-gradient"></div>' + '<button class="moonfin-details-back moonfin-focusable" title="Back" tabindex="0">' + '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>' + '</button>' + '<div class="moonfin-details-content">' +
    // Header: info left, poster right
    '<div class="moonfin-details-header">' + '<div class="moonfin-info-section">' + episodeHeader + '<div class="moonfin-title-section">' + (logoUrl ? '<img class="moonfin-logo" src="' + logoUrl + '" alt="' + item.Name + '">' : '<h1 class="moonfin-title">' + item.Name + '</h1>') + '</div>' + infoRowHtml + '<div class="moonfin-mdblist-ratings-row" id="moonfin-details-mdblist"></div>' + (tagline ? '<p class="moonfin-tagline">&ldquo;' + tagline + '&rdquo;</p>' : '') + (item.Overview ? '<p class="moonfin-overview">' + item.Overview + '</p>' : '') + '</div>' + '<div class="moonfin-poster-section">' + '<div class="moonfin-poster">' + (posterUrl ? '<img src="' + posterUrl + '" alt="" loading="lazy">' : '') + '</div>' + '</div>' + '</div>' +
    // Action buttons
    '<div class="moonfin-actions">' + actionBtns.join('') + '</div>' +
    // Metadata
    metadataHtml +
    // Content sections
    '<div class="moonfin-sections">' + seasonsHtml + episodesHtml + (cast.length > 0 ? '<div class="moonfin-section">' + '<div class="moonfin-section-header">' + '<h3 class="moonfin-section-title">Cast & Crew</h3>' + '<div class="moonfin-section-arrows">' + '<button class="moonfin-section-arrow moonfin-arrow-left" aria-label="Scroll left">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>' + '</button>' + '<button class="moonfin-section-arrow moonfin-arrow-right" aria-label="Scroll right">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' + '</button>' + '</div>' + '</div>' + '<div class="moonfin-section-scroll">' + castHtml + '</div>' + '</div>' : '') + (similar.length > 0 ? '<div class="moonfin-section">' + '<div class="moonfin-section-header">' + '<h3 class="moonfin-section-title">More Like This</h3>' + '<div class="moonfin-section-arrows">' + '<button class="moonfin-section-arrow moonfin-arrow-left" aria-label="Scroll left">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>' + '</button>' + '<button class="moonfin-section-arrow moonfin-arrow-right" aria-label="Scroll right">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' + '</button>' + '</div>' + '</div>' + '<div class="moonfin-section-scroll">' + similarHtml + '</div>' + '</div>' : '') + '</div>' + '</div>';
    this.setupPanelListeners(panel, item);
  },
  /**
   * Get media badges (resolution, HDR, audio, etc.)
   */
  getMediaBadges: function (item) {
    var badges = [];
    if (item.MediaStreams) {
      var video = null;
      var audio = null;
      for (var i = 0; i < item.MediaStreams.length; i++) {
        if (item.MediaStreams[i].Type === 'Video' && !video) video = item.MediaStreams[i];
        if (item.MediaStreams[i].Type === 'Audio' && !audio) audio = item.MediaStreams[i];
      }
      if (video) {
        if (video.Width >= 3800) badges.push('<span class="moonfin-badge moonfin-badge-4k">4K</span>');else if (video.Width >= 1900) badges.push('<span class="moonfin-badge moonfin-badge-hd">HD</span>');
        if (video.VideoRange === 'HDR' || video.VideoRangeType) badges.push('<span class="moonfin-badge moonfin-badge-hdr">HDR</span>');
        if (video.VideoDoViTitle || video.Title && video.Title.indexOf('Dolby Vision') !== -1) {
          badges.push('<span class="moonfin-badge moonfin-badge-dv">DV</span>');
        }
      }
      if (audio) {
        if (audio.DisplayTitle && audio.DisplayTitle.indexOf('Atmos') !== -1 || audio.Profile && audio.Profile.indexOf('Atmos') !== -1) {
          badges.push('<span class="moonfin-badge moonfin-badge-atmos">ATMOS</span>');
        } else if (audio.DisplayTitle && audio.DisplayTitle.indexOf('DTS:X') !== -1 || audio.Profile && audio.Profile.indexOf('DTS:X') !== -1) {
          badges.push('<span class="moonfin-badge moonfin-badge-dtsx">DTS:X</span>');
        } else if (audio.Channels >= 6) {
          badges.push('<span class="moonfin-badge moonfin-badge-surround">' + (audio.Channels >= 8 ? '7.1' : '5.1') + '</span>');
        }
      }
    }
    return badges;
  },
  /**
   * Format runtime ticks to readable string
   */
  formatRuntime: function (ticks) {
    var minutes = Math.floor(ticks / 600000000);
    if (minutes < 60) return minutes + 'm';
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return mins > 0 ? hours + 'h ' + mins + 'm' : hours + 'h';
  },
  /**
   * Setup event listeners for the panel
   */
  setupPanelListeners: function (panel, item) {
    var self = this;
    var backBtn = panel.querySelector('.moonfin-details-back');
    if (backBtn) backBtn.addEventListener('click', function () {
      self.hide();
    });
    var actionBtns = panel.querySelectorAll('[data-action]');
    for (var i = 0; i < actionBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          self.handleAction(e.currentTarget.getAttribute('data-action'), item);
        });
      })(actionBtns[i]);
    }
    var similarCards = panel.querySelectorAll('.moonfin-similar-card');
    for (var j = 0; j < similarCards.length; j++) {
      (function (card) {
        card.addEventListener('click', function () {
          self.showDetails(card.getAttribute('data-item-id'), card.getAttribute('data-type'));
        });
      })(similarCards[j]);
    }
    var seasonCards = panel.querySelectorAll('.moonfin-season-card');
    for (var k = 0; k < seasonCards.length; k++) {
      (function (card) {
        card.addEventListener('click', function () {
          self.hide();
          window.location.hash = '#/details?id=' + card.getAttribute('data-item-id');
        });
      })(seasonCards[k]);
    }

    // Episode cards - open details for the clicked episode
    var episodeCards = panel.querySelectorAll('.moonfin-episode-card');
    for (var n = 0; n < episodeCards.length; n++) {
      (function (card) {
        card.addEventListener('click', function () {
          var epId = card.getAttribute('data-item-id');
          self.showDetails(epId, 'Episode');
        });
      })(episodeCards[n]);
    }
    var personCards = panel.querySelectorAll('.moonfin-cast-card');
    for (var l = 0; l < personCards.length; l++) {
      (function (card) {
        card.addEventListener('click', function () {
          self.hide();
          window.location.hash = '#/details?id=' + card.getAttribute('data-person-id');
        });
      })(personCards[l]);
    }

    // Scroll arrows
    var arrowBtns = panel.querySelectorAll('.moonfin-section-arrow');
    for (var m = 0; m < arrowBtns.length; m++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var section = btn.closest('.moonfin-section');
          if (!section) return;
          var scrollContainer = section.querySelector('.moonfin-section-scroll');
          if (!scrollContainer) return;
          var scrollAmount = scrollContainer.clientWidth * 0.7;
          var isLeft = btn.classList.contains('moonfin-arrow-left');
          scrollContainer.scrollBy({
            left: isLeft ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
          });
        });
      })(arrowBtns[m]);
    }
  },
  /**
   * Get auth headers for REST API calls
   */
  getAuthHeaders: function () {
    var api = API.getApiClient();
    var token = api.accessToken();
    return {
      'Authorization': 'MediaBrowser Token="' + token + '"',
      'Content-Type': 'application/json'
    };
  },
  /**
   * Get server base URL
   */
  getServerUrl: function () {
    var api = API.getApiClient();
    return api._serverAddress || api.serverAddress();
  },
  /**
   * Get the current session ID for sending playback commands
   */
  getSessionId: function () {
    var api = API.getApiClient();
    var serverUrl = this.getServerUrl();
    var deviceId = api.deviceId();
    return fetch(serverUrl + '/Sessions?DeviceId=' + encodeURIComponent(deviceId), {
      headers: this.getAuthHeaders()
    }).then(function (resp) {
      return resp.json();
    }).then(function (sessions) {
      return sessions && sessions.length > 0 ? sessions[0].Id : null;
    });
  },
  /**
   * Play an item using the best available method
   */
  playItem: function (itemId, startPositionTicks) {
    var self = this;
    var api = API.getApiClient();

    // Method 1: Try ApiClient.sendPlayCommand if available
    if (api && typeof api.sendPlayCommand === 'function') {
      var deviceId = api.deviceId();
      api.getSessions({
        DeviceId: deviceId
      }).then(function (sessions) {
        if (sessions && sessions.length > 0) {
          return api.sendPlayCommand(sessions[0].Id, {
            ItemIds: [itemId],
            PlayCommand: 'PlayNow',
            StartPositionTicks: startPositionTicks || 0
          });
        }
        throw new Error('No session');
      }).catch(function () {
        self._playViaSession(itemId, startPositionTicks);
      });
      return;
    }

    // Method 2: Try REST Sessions API
    self._playViaSession(itemId, startPositionTicks);
  },
  /**
   * Play via REST Sessions API
   */
  _playViaSession: function (itemId, startPositionTicks) {
    var self = this;
    var serverUrl = this.getServerUrl();
    var headers = this.getAuthHeaders();
    this.getSessionId().then(function (sessionId) {
      if (!sessionId) {
        throw new Error('No session found');
      }
      return fetch(serverUrl + '/Sessions/' + sessionId + '/Playing', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ItemIds: [itemId],
          StartPositionTicks: startPositionTicks || 0,
          PlayCommand: 'PlayNow'
        })
      }).then(function (resp) {
        if (!resp.ok) throw new Error('Play command failed: ' + resp.status);
      });
    }).catch(function (err) {
      console.error('[Moonfin] Details: Sessions API failed, using fallback', err);
      self._playViaFallback(itemId);
    });
  },
  /**
   * Fallback: navigate to native details and auto-click play
   */
  _playViaFallback: function (itemId) {
    API.navigateTo('/details?id=' + itemId);
    // Wait for the Jellyfin details page to load, then click its play button
    var attempts = 0;
    var tryClick = setInterval(function () {
      attempts++;
      var playBtn = document.querySelector('.btnPlay, .detailButton-primary, [data-action="resume"], [data-action="play"]');
      if (playBtn) {
        clearInterval(tryClick);
        playBtn.click();
      } else if (attempts > 20) {
        clearInterval(tryClick);
      }
    }, 250);
  },
  /**
   * Shuffle play a series via the Sessions API
   */
  shuffleItem: function (itemId) {
    var self = this;
    var api = API.getApiClient();
    var serverUrl = this.getServerUrl();
    var headers = this.getAuthHeaders();
    var userId = api.getCurrentUserId();

    // Fetch all episodes for the series, shuffle, then send as play command
    fetch(serverUrl + '/Shows/' + itemId + '/Episodes?UserId=' + userId + '&Fields=MediaSources', {
      headers: headers
    }).then(function (resp) {
      return resp.json();
    }).then(function (result) {
      var items = result.Items || [];
      if (items.length === 0) return;

      // Fisher-Yates shuffle
      var ids = items.map(function (i) {
        return i.Id;
      });
      for (var i = ids.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = ids[i];
        ids[i] = ids[j];
        ids[j] = temp;
      }

      // Try ApiClient.sendPlayCommand first
      if (typeof api.sendPlayCommand === 'function') {
        var deviceId = api.deviceId();
        return api.getSessions({
          DeviceId: deviceId
        }).then(function (sessions) {
          if (sessions && sessions.length > 0) {
            return api.sendPlayCommand(sessions[0].Id, {
              ItemIds: ids,
              PlayCommand: 'PlayNow',
              StartPositionTicks: 0
            });
          }
          throw new Error('No session');
        }).catch(function () {
          return self._shuffleViaSession(ids);
        });
      }
      return self._shuffleViaSession(ids);
    }).catch(function (err) {
      console.error('[Moonfin] Details: Failed to shuffle', err);
    });
  },
  /**
   * Shuffle via REST Sessions API
   */
  _shuffleViaSession: function (ids) {
    var self = this;
    var serverUrl = this.getServerUrl();
    var headers = this.getAuthHeaders();
    return this.getSessionId().then(function (sessionId) {
      if (!sessionId) return;
      return fetch(serverUrl + '/Sessions/' + sessionId + '/Playing', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ItemIds: ids,
          StartPositionTicks: 0,
          PlayCommand: 'PlayNow'
        })
      });
    });
  },
  /**
   * Handle action button clicks
   */
  handleAction: function (action, item) {
    var self = this;
    var api = API.getApiClient();
    var userId = api.getCurrentUserId();
    var serverUrl = this.getServerUrl();
    var headers = this.getAuthHeaders();
    switch (action) {
      case 'play':
        this.hide();
        // Resume from last position if available
        var resumeTicks = item.UserData && item.UserData.PlaybackPositionTicks ? item.UserData.PlaybackPositionTicks : 0;
        this.playItem(item.Id, resumeTicks);
        break;
      case 'restart':
        this.hide();
        this.playItem(item.Id, 0);
        break;
      case 'shuffle':
        this.hide();
        this.shuffleItem(item.Id);
        break;
      case 'favorite':
        var isFav = item.UserData ? item.UserData.IsFavorite : false;
        fetch(serverUrl + '/Users/' + userId + '/FavoriteItems/' + item.Id, {
          method: isFav ? 'DELETE' : 'POST',
          headers: headers
        }).then(function (resp) {
          if (resp.ok) {
            if (!item.UserData) item.UserData = {};
            item.UserData.IsFavorite = !isFav;
            var wrapper = self.container.querySelector('[data-action="favorite"]');
            if (wrapper) {
              wrapper.classList.toggle('active');
              var label = wrapper.querySelector('.moonfin-btn-label');
              if (label) label.textContent = item.UserData.IsFavorite ? 'Favorited' : 'Favorite';
            }
          }
        }).catch(function (err) {
          console.error('[Moonfin] Details: Failed to toggle favorite', err);
        });
        break;
      case 'played':
        var isPlayed = item.UserData ? item.UserData.Played : false;
        fetch(serverUrl + '/Users/' + userId + '/PlayedItems/' + item.Id, {
          method: isPlayed ? 'DELETE' : 'POST',
          headers: headers
        }).then(function (resp) {
          if (resp.ok) {
            if (!item.UserData) item.UserData = {};
            item.UserData.Played = !isPlayed;
            var wrapper = self.container.querySelector('[data-action="played"]');
            if (wrapper) {
              wrapper.classList.toggle('active');
              var label = wrapper.querySelector('.moonfin-btn-label');
              if (label) label.textContent = item.UserData.Played ? 'Watched' : 'Unwatched';
            }
          }
        }).catch(function (err) {
          console.error('[Moonfin] Details: Failed to toggle played', err);
        });
        break;
      case 'series':
        this.hide();
        API.navigateTo('/details?id=' + item.SeriesId);
        break;
      case 'more':
        this.hide();
        API.navigateTo('/details?id=' + item.Id);
        break;
    }
  },
  /**
   * Render MDBList ratings into the details panel.
   */
  renderMdbListRatings: function (ratings) {
    var container = this.container.querySelector('#moonfin-details-mdblist');
    if (!container) return;
    var html = MdbList.buildRatingsHtml(ratings, 'full');
    if (html) {
      container.innerHTML = html;
      container.style.display = '';
    }
  },
  /**
   * Hide the details panel
   */
  hide: function () {
    this.container.classList.remove('visible');
    this.isVisible = false;
    this.currentItem = null;
    document.body.classList.remove('moonfin-details-visible');
  }
};

// === plugin.js ===
const Plugin = {
  version: '1.0.0',
  name: 'Moonfin Web Plugin',
  initialized: false,
  isHomePage() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#/home' || hash === '#/home.html') return true;
    if (hash.startsWith('#/home?') || hash.startsWith('#/home.html?')) {
      // Exclude tab-based sub-pages (e.g. favorites, collections)
      return hash.indexOf('tab=') === -1;
    }
    return false;
  },
  isAdminPage() {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // Check for admin/dashboard/config pages using hash-based detection
    // User pages are: #/home.html, #/home, #/movies.html, #/details, #/search.html, etc.
    // Admin pages are: #/dashboard, #/configurationpage, etc.
    const isUserPage = hash === '' || hash.includes('#/home') || hash.includes('#/movies') || hash.includes('#/tvshows') || hash.includes('#/music') || hash.includes('#/livetv') || hash.includes('#/details') || hash.includes('#/search') || hash.includes('#/favorites') || hash.includes('#/list') || hash.includes('#/mypreferencesmenu') || hash.includes('#/mypreferencesdisplay') || hash.includes('#/mypreferenceshome') || hash.includes('#/mypreferencesplayback') || hash.includes('#/mypreferencessubtitles') || hash.includes('#/mypreferencescontrol') || hash.includes('#/mypreferencesquickconnect') || hash.includes('#/video');

    // If it's a known user page, it's NOT an admin page
    if (isUserPage) {
      return false;
    }

    // Check for explicit admin indicators
    return path.includes('/dashboard') || path.includes('/configurationpage') || path.includes('/admin') || hash.includes('configurationpage') || hash.includes('dashboard') || hash.includes('plugincatalog') || document.querySelector('.dashboardDocument') !== null || document.querySelector('.type-interior.pluginConfigurationPage') !== null;
  },
  init() {
    var _this18 = this;
    return _asyncToGenerator(function* () {
      if (_this18.initialized) return;

      // Always register global listeners so we can detect navigation back from admin pages
      if (!_this18._listenersRegistered) {
        _this18.setupGlobalListeners();
        _this18._listenersRegistered = true;
      }
      if (_this18.isAdminPage()) {
        console.log('[Moonfin] Skipping initialization on admin page');
        return;
      }
      console.log(`[Moonfin] ${_this18.name} v${_this18.version} initializing...`);
      Device.detect();
      if (document.readyState === 'loading') {
        yield new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      _this18.loadStyles();
      _this18.applyDeviceClasses();
      Storage.initSync();
      try {
        var settings = Storage.getAll();
        if (settings.navbarEnabled) {
          yield Navbar.init();
        }
        if (settings.mediaBarEnabled) {
          yield MediaBar.init();
        }
        yield Jellyseerr.init();
        Details.init();
        _this18.initSeasonalEffects();
        if (Device.isTV()) {
          TVNavigation.init();
        }
      } catch (e) {
        console.error('[Moonfin] Error initializing components:', e);
      }
      _this18.initialized = true;
      console.log('[Moonfin] Plugin initialized successfully');
    })();
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
    if (document.querySelector('link[href*="moonfin"]') || document.querySelector('style[data-moonfin]')) {
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
    window.addEventListener('moonfin-settings-changed', e => {
      this.applySeasonalEffect(e.detail.seasonalSurprise);
    });

    // Listen for page changes to hide/show seasonal effects
    window.addEventListener('hashchange', () => {
      const settings = Storage.getAll();
      this.applySeasonalEffect(settings.seasonalSurprise);
    });
  },
  applySeasonalEffect(effect) {
    // Always remove existing effects first
    document.querySelectorAll('.moonfin-seasonal-effect').forEach(el => el.remove());

    // Don't apply on admin pages
    if (this.isAdminPage()) return;
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
    });

    // Also listen for hashchange for SPA navigation
    window.addEventListener('hashchange', () => {
      this.onPageChange();
    });

    // Persistent DOM observer for injecting settings links
    this.setupDOMObserver();
    window.addEventListener('moonfin-settings-preview', e => {
      Navbar.applySettings(e.detail);
      MediaBar.applySettings(e.detail);
    });
    window.addEventListener('moonfin-settings-changed', e => {
      console.log('[Moonfin] Settings changed:', e.detail);

      // Handle navbar enable/disable
      if (e.detail.navbarEnabled && !Navbar.initialized) {
        Navbar.init();
      } else if (!e.detail.navbarEnabled && Navbar.initialized) {
        Navbar.destroy();
      }

      // Handle mediabar enable/disable
      if (e.detail.mediaBarEnabled && !MediaBar.initialized) {
        MediaBar.init();
      } else if (!e.detail.mediaBarEnabled && MediaBar.initialized) {
        MediaBar.destroy();
      }
    });
  },
  onPageChange() {
    // Close details overlay on any page navigation
    if (Details.isVisible) {
      Details.hide();
    }

    // Close Jellyseerr iframe on any page navigation
    if (Jellyseerr.isOpen) {
      Jellyseerr.close();
      Navbar.updateJellyseerrButtonState();
    }
    if (this.isAdminPage()) {
      if (Navbar.container) Navbar.container.classList.add('hidden');
      if (MediaBar.container) MediaBar.container.classList.add('hidden');
      document.querySelectorAll('.moonfin-seasonal-effect').forEach(el => el.style.display = 'none');
      document.body.classList.remove('moonfin-navbar-active');
      return;
    }

    // If plugin was never fully initialized (e.g. first loaded on admin page), init now
    if (!this.initialized) {
      this.init();
      return;
    }
    if (Navbar.container) {
      var navbarEnabled = Storage.get('navbarEnabled');
      Navbar.container.classList.toggle('hidden', !navbarEnabled);
      document.body.classList.toggle('moonfin-navbar-active', !!navbarEnabled);
    }
    document.querySelectorAll('.moonfin-seasonal-effect').forEach(el => el.style.display = '');
    if (MediaBar.initialized && MediaBar.container) {
      // Ensure the media bar element is still in the DOM
      // (Jellyfin SPA navigation can detach elements)
      MediaBar.ensureInDOM();
      var showMediaBar = this.isHomePage();
      MediaBar.container.classList.toggle('hidden', !showMediaBar);
      if (MediaBar.items && MediaBar.items.length > 0) {
        document.body.classList.toggle('moonfin-mediabar-active', showMediaBar);
      } else {
        document.body.classList.remove('moonfin-mediabar-active');
      }
    } else {
      // No media bar - ensure the push-down class is removed
      document.body.classList.remove('moonfin-mediabar-active');
    }
    Navbar.updateActiveState();
  },
  addUserPreferencesLink() {
    // Don't add if already present on the current page
    var prefsPage = document.querySelector('#myPreferencesMenuPage:not(.hide)');
    if (!prefsPage) return;
    if (prefsPage.querySelector('.moonfin-prefs-link')) return;

    // Find the "Control" menu item to insert after it
    var menuItems = prefsPage.querySelectorAll('.listItem-border');
    if (menuItems.length === 0) return;
    var controlItem = null;
    for (var i = 0; i < menuItems.length; i++) {
      var bodyText = menuItems[i].querySelector('.listItemBodyText');
      if (bodyText) {
        var text = bodyText.textContent.toLowerCase().trim();
        if (text === 'control' || text === 'controls') {
          controlItem = menuItems[i];
          break;
        }
      }
    }

    // Fall back to last item if Control not found
    var insertAfter = controlItem || menuItems[menuItems.length - 1];
    if (!insertAfter || !insertAfter.parentNode) return;

    // Create the link to match Jellyfin's native list item structure
    var link = document.createElement('a');
    link.className = 'listItem listItem-border navMenuOption emby-button moonfin-prefs-link';
    link.href = '#';
    link.innerHTML = '<span class="listItemIcon material-icons">settings</span>' + '<div class="listItemBody">' + '<div class="listItemBodyText">Moonfin</div>' + '</div>';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      Settings.show();
    });
    insertAfter.parentNode.insertBefore(link, insertAfter.nextSibling);
    console.log('[Moonfin] Added preferences link to user settings menu');
  },
  setupDOMObserver() {
    if (this._domObserver) return;
    var self = this;
    var throttleTimer = null;
    this._domObserver = new MutationObserver(function () {
      if (throttleTimer) return;
      throttleTimer = setTimeout(function () {
        throttleTimer = null;
        // Only inject if on the preferences page
        var hash = window.location.hash.toLowerCase();
        if (hash.includes('mypreferencesmenu')) {
          self.addUserPreferencesLink();
        }
      }, 500);
    });
    this._domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
  destroy() {
    Navbar.destroy();
    MediaBar.destroy();
    Jellyseerr.destroy();
    document.querySelectorAll('.moonfin-seasonal-effect').forEach(el => el.remove());
    this.initialized = false;
    console.log('[Moonfin] Plugin destroyed');
  }
};
(function () {
  if (typeof window !== 'undefined') {
    // Check if user is fully logged in (not just ApiClient exists)
    const isUserLoggedIn = () => {
      try {
        const api = window.ApiClient || window.connectionManager && window.connectionManager.currentApiClient();
        return api && api._currentUser && api._currentUser.Id && api._serverInfo && api._serverInfo.AccessToken;
      } catch (e) {
        return false;
      }
    };
    const initWhenReady = () => {
      // Don't init on login page
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('login') || hash.includes('selectserver') || hash.includes('startup')) {
        setTimeout(initWhenReady, 1000);
        return;
      }
      if (isUserLoggedIn()) {
        console.log('[Moonfin] User authenticated, initializing...');
        Plugin.init();
      } else {
        console.log('[Moonfin] Waiting for user authentication...');
        setTimeout(initWhenReady, 500);
      }
    };

    // Start checking once DOM is ready
    if (document.readyState === 'complete') {
      setTimeout(initWhenReady, 100);
    } else {
      window.addEventListener('load', () => setTimeout(initWhenReady, 100));
    }

    // Re-init on hash change in case user navigates to a user page after loading on admin/login
    window.addEventListener('hashchange', () => {
      if (isUserLoggedIn() && !Plugin.initialized) {
        Plugin.init();
      }
    });
  }

  // Expose to global scope for debugging and external access
  window.Moonfin = {
    Plugin,
    TVNavigation,
    Device,
    Storage,
    Navbar,
    MediaBar,
    Jellyseerr,
    Details,
    API
  };
})();
})();

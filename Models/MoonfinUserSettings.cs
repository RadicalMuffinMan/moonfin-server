using System.Text.Json.Serialization;

namespace Moonfin.Server.Models;

/// <summary>
/// Comprehensive Moonfin user settings model.
/// All fields are nullable to support different clients with varying feature sets.
/// Clients: Android TV, Fire TV, Roku, Tizen, webOS, tvOS, Web
/// </summary>
public class MoonfinUserSettings
{
    /// <summary>
    /// Schema version for settings migration.
    /// </summary>
    [JsonPropertyName("schemaVersion")]
    public int SchemaVersion { get; set; } = 1;

    /// <summary>
    /// Timestamp of last update (Unix milliseconds).
    /// </summary>
    [JsonPropertyName("lastUpdated")]
    public long? LastUpdated { get; set; }

    /// <summary>
    /// Client that last updated these settings.
    /// </summary>
    [JsonPropertyName("lastUpdatedBy")]
    public string? LastUpdatedBy { get; set; }

    // ==========================================
    // MEDIA BAR SETTINGS
    // ==========================================

    /// <summary>
    /// Enable the featured media bar on home screen.
    /// </summary>
    [JsonPropertyName("mediaBarEnabled")]
    public bool? MediaBarEnabled { get; set; }

    /// <summary>
    /// Content type for media bar: "movies", "tv", "both".
    /// </summary>
    [JsonPropertyName("mediaBarContentType")]
    public string? MediaBarContentType { get; set; }

    /// <summary>
    /// Number of items in media bar slideshow.
    /// </summary>
    [JsonPropertyName("mediaBarItemCount")]
    public int? MediaBarItemCount { get; set; }

    /// <summary>
    /// Overlay opacity (0-100).
    /// </summary>
    [JsonPropertyName("mediaBarOverlayOpacity")]
    public int? MediaBarOverlayOpacity { get; set; }

    /// <summary>
    /// Overlay color key: "gray", "black", "dark_blue", "purple", "teal", "navy", etc.
    /// </summary>
    [JsonPropertyName("mediaBarOverlayColor")]
    public string? MediaBarOverlayColor { get; set; }

    /// <summary>
    /// Auto-advance enabled for slideshow.
    /// </summary>
    [JsonPropertyName("mediaBarAutoAdvance")]
    public bool? MediaBarAutoAdvance { get; set; }

    /// <summary>
    /// Auto-advance interval in milliseconds.
    /// </summary>
    [JsonPropertyName("mediaBarIntervalMs")]
    public int? MediaBarIntervalMs { get; set; }

    // ==========================================
    // TOOLBAR/NAVBAR SETTINGS
    // ==========================================

    /// <summary>
    /// Show shuffle button in toolbar.
    /// </summary>
    [JsonPropertyName("showShuffleButton")]
    public bool? ShowShuffleButton { get; set; }

    /// <summary>
    /// Show genres button in toolbar.
    /// </summary>
    [JsonPropertyName("showGenresButton")]
    public bool? ShowGenresButton { get; set; }

    /// <summary>
    /// Show favorites button in toolbar.
    /// </summary>
    [JsonPropertyName("showFavoritesButton")]
    public bool? ShowFavoritesButton { get; set; }

    /// <summary>
    /// Show library buttons in toolbar.
    /// </summary>
    [JsonPropertyName("showLibrariesInToolbar")]
    public bool? ShowLibrariesInToolbar { get; set; }

    /// <summary>
    /// Content type for shuffle: "movies", "tv", "both".
    /// </summary>
    [JsonPropertyName("shuffleContentType")]
    public string? ShuffleContentType { get; set; }

    /// <summary>
    /// Show clock in toolbar/UI.
    /// </summary>
    [JsonPropertyName("showClock")]
    public bool? ShowClock { get; set; }

    /// <summary>
    /// Use 24-hour clock format.
    /// </summary>
    [JsonPropertyName("use24HourClock")]
    public bool? Use24HourClock { get; set; }

    // ==========================================
    // HOME SCREEN SETTINGS
    // ==========================================

    /// <summary>
    /// JSON-encoded home sections configuration.
    /// </summary>
    [JsonPropertyName("homeSectionsConfig")]
    public string? HomeSectionsConfig { get; set; }

    /// <summary>
    /// Use universal image type override for home rows.
    /// </summary>
    [JsonPropertyName("homeRowsUniversalOverride")]
    public bool? HomeRowsUniversalOverride { get; set; }

    /// <summary>
    /// Universal image type: "POSTER", "THUMB", "BANNER".
    /// </summary>
    [JsonPropertyName("homeRowsUniversalImageType")]
    public string? HomeRowsUniversalImageType { get; set; }

    // ==========================================
    // PLAYBACK SETTINGS
    // ==========================================

    /// <summary>
    /// Skip back length in milliseconds.
    /// </summary>
    [JsonPropertyName("skipBackLength")]
    public int? SkipBackLength { get; set; }

    /// <summary>
    /// Skip forward length in milliseconds.
    /// </summary>
    [JsonPropertyName("skipForwardLength")]
    public int? SkipForwardLength { get; set; }

    /// <summary>
    /// Maximum bitrate in Mbps.
    /// </summary>
    [JsonPropertyName("maxBitrate")]
    public string? MaxBitrate { get; set; }

    /// <summary>
    /// Enable media queuing (auto-play next).
    /// </summary>
    [JsonPropertyName("mediaQueuingEnabled")]
    public bool? MediaQueuingEnabled { get; set; }

    /// <summary>
    /// Next up behavior: "DISABLED", "MINIMAL", "EXTENDED".
    /// </summary>
    [JsonPropertyName("nextUpBehavior")]
    public string? NextUpBehavior { get; set; }

    /// <summary>
    /// Next up timeout in milliseconds.
    /// </summary>
    [JsonPropertyName("nextUpTimeout")]
    public int? NextUpTimeout { get; set; }

    /// <summary>
    /// Resume preroll subtract duration in seconds.
    /// </summary>
    [JsonPropertyName("resumeSubtractDuration")]
    public string? ResumeSubtractDuration { get; set; }

    /// <summary>
    /// Enable cinema mode (intros/trailers).
    /// </summary>
    [JsonPropertyName("cinemaModeEnabled")]
    public bool? CinemaModeEnabled { get; set; }

    // ==========================================
    // AUDIO SETTINGS
    // ==========================================

    /// <summary>
    /// Audio behavior: "DIRECT_STREAM", "STEREO", "DOWNMIX".
    /// </summary>
    [JsonPropertyName("audioBehavior")]
    public string? AudioBehavior { get; set; }

    /// <summary>
    /// Enable audio night mode.
    /// </summary>
    [JsonPropertyName("audioNightMode")]
    public bool? AudioNightMode { get; set; }

    /// <summary>
    /// Enable AC3 passthrough.
    /// </summary>
    [JsonPropertyName("ac3Enabled")]
    public bool? Ac3Enabled { get; set; }

    // ==========================================
    // SUBTITLE SETTINGS
    // ==========================================

    /// <summary>
    /// Subtitle background color (ARGB long).
    /// </summary>
    [JsonPropertyName("subtitlesBackgroundColor")]
    public long? SubtitlesBackgroundColor { get; set; }

    /// <summary>
    /// Subtitle text color (ARGB long).
    /// </summary>
    [JsonPropertyName("subtitlesTextColor")]
    public long? SubtitlesTextColor { get; set; }

    /// <summary>
    /// Subtitle text stroke color (ARGB long).
    /// </summary>
    [JsonPropertyName("subtitlesTextStrokeColor")]
    public long? SubtitlesTextStrokeColor { get; set; }

    /// <summary>
    /// Subtitle text size.
    /// </summary>
    [JsonPropertyName("subtitlesTextSize")]
    public float? SubtitlesTextSize { get; set; }

    /// <summary>
    /// Subtitle text weight (font weight).
    /// </summary>
    [JsonPropertyName("subtitlesTextWeight")]
    public int? SubtitlesTextWeight { get; set; }

    /// <summary>
    /// Subtitle offset position from bottom.
    /// </summary>
    [JsonPropertyName("subtitlesOffsetPosition")]
    public float? SubtitlesOffsetPosition { get; set; }

    /// <summary>
    /// Default subtitles to none instead of server default.
    /// </summary>
    [JsonPropertyName("subtitlesDefaultToNone")]
    public bool? SubtitlesDefaultToNone { get; set; }

    // ==========================================
    // BACKGROUND/VISUAL SETTINGS
    // ==========================================

    /// <summary>
    /// Enable backdrop images while browsing.
    /// </summary>
    [JsonPropertyName("backdropEnabled")]
    public bool? BackdropEnabled { get; set; }

    /// <summary>
    /// Details page background blur amount (0-25).
    /// </summary>
    [JsonPropertyName("detailsBackgroundBlurAmount")]
    public int? DetailsBackgroundBlurAmount { get; set; }

    /// <summary>
    /// Browsing pages background blur amount (0-25).
    /// </summary>
    [JsonPropertyName("browsingBackgroundBlurAmount")]
    public int? BrowsingBackgroundBlurAmount { get; set; }

    // ==========================================
    // SCREENSAVER SETTINGS
    // ==========================================

    /// <summary>
    /// Enable in-app screensaver.
    /// </summary>
    [JsonPropertyName("screensaverInAppEnabled")]
    public bool? ScreensaverInAppEnabled { get; set; }

    /// <summary>
    /// Screensaver mode: "library", "logo".
    /// </summary>
    [JsonPropertyName("screensaverMode")]
    public string? ScreensaverMode { get; set; }

    /// <summary>
    /// Screensaver dimming level (0-100).
    /// </summary>
    [JsonPropertyName("screensaverDimmingLevel")]
    public int? ScreensaverDimmingLevel { get; set; }

    /// <summary>
    /// Screensaver timeout in milliseconds.
    /// </summary>
    [JsonPropertyName("screensaverInAppTimeout")]
    public long? ScreensaverInAppTimeout { get; set; }

    /// <summary>
    /// Max age rating for screensaver content.
    /// </summary>
    [JsonPropertyName("screensaverAgeRatingMax")]
    public int? ScreensaverAgeRatingMax { get; set; }

    /// <summary>
    /// Require age rating for screensaver content.
    /// </summary>
    [JsonPropertyName("screensaverAgeRatingRequired")]
    public bool? ScreensaverAgeRatingRequired { get; set; }

    /// <summary>
    /// Show clock in screensaver.
    /// </summary>
    [JsonPropertyName("screensaverShowClock")]
    public bool? ScreensaverShowClock { get; set; }

    // ==========================================
    // THEME SETTINGS
    // ==========================================

    /// <summary>
    /// App theme: "DARK", "LIGHT", "SYSTEM".
    /// </summary>
    [JsonPropertyName("appTheme")]
    public string? AppTheme { get; set; }

    /// <summary>
    /// Seasonal surprise effect: "none", "winter", "spring", "summer", "fall", "halloween".
    /// </summary>
    [JsonPropertyName("seasonalSurprise")]
    public string? SeasonalSurprise { get; set; }

    // ==========================================
    // THEME MUSIC SETTINGS (Android TV specific)
    // ==========================================

    /// <summary>
    /// Enable theme music on item details.
    /// </summary>
    [JsonPropertyName("themeMusicEnabled")]
    public bool? ThemeMusicEnabled { get; set; }

    /// <summary>
    /// Theme music volume (0-100).
    /// </summary>
    [JsonPropertyName("themeMusicVolume")]
    public int? ThemeMusicVolume { get; set; }

    /// <summary>
    /// Enable theme music on home rows.
    /// </summary>
    [JsonPropertyName("themeMusicOnHomeRows")]
    public bool? ThemeMusicOnHomeRows { get; set; }

    // ==========================================
    // DISPLAY/UI SETTINGS
    // ==========================================

    /// <summary>
    /// Rating type to display: "RATING_TOMATOES", "RATING_IMDB", etc.
    /// </summary>
    [JsonPropertyName("defaultRatingType")]
    public string? DefaultRatingType { get; set; }

    /// <summary>
    /// Watched indicator behavior: "ALWAYS", "NEVER", "FOCUSED".
    /// </summary>
    [JsonPropertyName("watchedIndicatorBehavior")]
    public string? WatchedIndicatorBehavior { get; set; }

    /// <summary>
    /// Enable series thumbnails in home rows.
    /// </summary>
    [JsonPropertyName("seriesThumbnailsEnabled")]
    public bool? SeriesThumbnailsEnabled { get; set; }

    /// <summary>
    /// Merge continue watching and next up rows.
    /// </summary>
    [JsonPropertyName("mergeContinueWatchingNextUp")]
    public bool? MergeContinueWatchingNextUp { get; set; }

    /// <summary>
    /// Confirm before exiting app.
    /// </summary>
    [JsonPropertyName("confirmExit")]
    public bool? ConfirmExit { get; set; }

    // ==========================================
    // MULTI-SERVER SETTINGS (Android TV specific)
    // ==========================================

    /// <summary>
    /// Enable multi-server library aggregation.
    /// </summary>
    [JsonPropertyName("enableMultiServerLibraries")]
    public bool? EnableMultiServerLibraries { get; set; }

    // ==========================================
    // JELLYSEERR SETTINGS
    // ==========================================

    /// <summary>
    /// Jellyseerr enabled for this user.
    /// </summary>
    [JsonPropertyName("jellyseerrEnabled")]
    public bool? JellyseerrEnabled { get; set; }

    /// <summary>
    /// Show Jellyseerr in toolbar.
    /// </summary>
    [JsonPropertyName("jellyseerrShowInToolbar")]
    public bool? JellyseerrShowInToolbar { get; set; }

    // ==========================================
    // MEDIA SEGMENT SETTINGS
    // ==========================================

    /// <summary>
    /// Media segment actions JSON string.
    /// </summary>
    [JsonPropertyName("mediaSegmentActions")]
    public string? MediaSegmentActions { get; set; }

    // ==========================================
    // PLAYER SETTINGS
    // ==========================================

    /// <summary>
    /// Player zoom mode: "FIT", "FILL", "STRETCH".
    /// </summary>
    [JsonPropertyName("playerZoomMode")]
    public string? PlayerZoomMode { get; set; }

    /// <summary>
    /// Enable TrickPlay (thumbnail seeking).
    /// </summary>
    [JsonPropertyName("trickPlayEnabled")]
    public bool? TrickPlayEnabled { get; set; }

    /// <summary>
    /// Enable PGS subtitle direct play.
    /// </summary>
    [JsonPropertyName("pgsDirectPlay")]
    public bool? PgsDirectPlay { get; set; }

    /// <summary>
    /// Enable external player.
    /// </summary>
    [JsonPropertyName("useExternalPlayer")]
    public bool? UseExternalPlayer { get; set; }

    /// <summary>
    /// External player component name.
    /// </summary>
    [JsonPropertyName("externalPlayerComponentName")]
    public string? ExternalPlayerComponentName { get; set; }

    // ==========================================
    // LIVE TV SETTINGS
    // ==========================================

    /// <summary>
    /// Enable Live TV direct play.
    /// </summary>
    [JsonPropertyName("liveTvDirectPlayEnabled")]
    public bool? LiveTvDirectPlayEnabled { get; set; }

    // ==========================================
    // CLIENT-SPECIFIC SETTINGS
    // These are stored but may only apply to certain clients
    // ==========================================

    /// <summary>
    /// Client-specific settings JSON blob.
    /// Allows each client to store custom settings not in the shared schema.
    /// </summary>
    [JsonPropertyName("clientSpecific")]
    public Dictionary<string, string>? ClientSpecific { get; set; }
}

/// <summary>
/// Response model for ping endpoint.
/// </summary>
public class MoonfinPingResponse
{
    /// <summary>
    /// Plugin version.
    /// </summary>
    [JsonPropertyName("version")]
    public string Version { get; set; } = "1.0.0";

    /// <summary>
    /// Plugin name.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = "Moonfin Settings Sync";

    /// <summary>
    /// Settings schema version.
    /// </summary>
    [JsonPropertyName("schemaVersion")]
    public int SchemaVersion { get; set; } = 1;

    /// <summary>
    /// Whether settings sync is enabled.
    /// </summary>
    [JsonPropertyName("settingsSyncEnabled")]
    public bool SettingsSyncEnabled { get; set; } = true;
}

/// <summary>
/// Request model for saving settings.
/// </summary>
public class SaveSettingsRequest
{
    /// <summary>
    /// The settings to save.
    /// </summary>
    [JsonPropertyName("settings")]
    public MoonfinUserSettings? Settings { get; set; }

    /// <summary>
    /// Client identifier (e.g., "androidtv", "roku", "tizen", "webos", "tvos", "web").
    /// </summary>
    [JsonPropertyName("clientId")]
    public string? ClientId { get; set; }

    /// <summary>
    /// Merge mode: "replace" (overwrite all), "merge" (only update non-null fields).
    /// </summary>
    [JsonPropertyName("mergeMode")]
    public string? MergeMode { get; set; } = "merge";
}

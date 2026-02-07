using MediaBrowser.Model.Plugins;

namespace Moonfin.Server;

/// <summary>
/// Admin-level plugin configuration for Moonfin.
/// </summary>
public class PluginConfiguration : BasePluginConfiguration
{
    /// <summary>
    /// Enable settings sync across Moonfin clients.
    /// </summary>
    public bool EnableSettingsSync { get; set; } = true;

    /// <summary>
    /// Allow unauthenticated ping to check if plugin is installed.
    /// </summary>
    public bool AllowAnonymousPing { get; set; } = true;

    // ==========================================
    // JELLYSEERR (Admin Settings)
    // User API keys are stored in user settings
    // ==========================================

    /// <summary>
    /// Enable Jellyseerr integration for all users.
    /// </summary>
    public bool JellyseerrEnabled { get; set; } = false;

    /// <summary>
    /// Jellyseerr server URL (admin-configured, public-facing).
    /// </summary>
    public string? JellyseerrUrl { get; set; }

    /// <summary>
    /// Internal Jellyseerr URL for server-to-server communication (optional).
    /// Use this if Jellyseerr is on a private network and the public URL is different.
    /// If empty, the public JellyseerrUrl is used for API proxying.
    /// </summary>
    public string? JellyseerrInternalUrl { get; set; }
}

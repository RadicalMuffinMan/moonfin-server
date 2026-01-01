using Jellyfin.Model.Plugins;

namespace Moonfin.Server;

/// <summary>
/// Plugin configuration for Moonfin Settings Sync.
/// </summary>
public class PluginConfiguration : BasePluginConfiguration
{
    /// <summary>
    /// Gets or sets a value indicating whether settings sync is enabled.
    /// </summary>
    public bool EnableSettingsSync { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to allow anonymous ping (check if plugin exists).
    /// </summary>
    public bool AllowAnonymousPing { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether Jellyseerr integration is enabled.
    /// </summary>
    public bool JellyseerrEnabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the Jellyseerr server URL (e.g., https://jellyseerr.example.com).
    /// </summary>
    public string? JellyseerrUrl { get; set; }

    /// <summary>
    /// Gets or sets the display name for Jellyseerr in the UI.
    /// </summary>
    public string JellyseerrDisplayName { get; set; } = "Jellyseerr";

    /// <summary>
    /// Gets or sets a value indicating whether to open Jellyseerr in a new tab instead of iframe.
    /// Some Jellyseerr configurations may block iframe embedding.
    /// </summary>
    public bool JellyseerrOpenInNewTab { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether to force open in new tab on mobile devices.
    /// Iframes often don't work well on mobile.
    /// </summary>
    public bool JellyseerrOpenInNewTabOnMobile { get; set; } = true;
}

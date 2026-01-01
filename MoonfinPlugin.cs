using System;
using System.Collections.Generic;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace Moonfin.Server;

/// <summary>
/// Moonfin Server Plugin for Jellyfin.
/// Provides settings synchronization across Moonfin clients.
/// </summary>
public class MoonfinPlugin : BasePlugin<PluginConfiguration>, IHasWebPages
{
    /// <summary>
    /// Gets the plugin instance.
    /// </summary>
    public static MoonfinPlugin? Instance { get; private set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="MoonfinPlugin"/> class.
    /// </summary>
    public MoonfinPlugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
        // File Transformation registration is handled by MoonfinStartupService (IScheduledTask)
    }

    /// <inheritdoc />
    public override string Name => "Moonfin";

    /// <inheritdoc />
    public override string Description => "Custom UI and settings sync for Jellyfin - navbar, media bar, Jellyseerr integration.";

    /// <inheritdoc />
    public override Guid Id => Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

    /// <summary>
    /// Gets the data folder path for storing user settings.
    /// </summary>
    public new string DataFolderPath => Path.Combine(ApplicationPaths.PluginConfigurationsPath, "Moonfin");

    /// <inheritdoc />
    public IEnumerable<PluginPageInfo> GetPages()
    {
        return new[]
        {
            new PluginPageInfo
            {
                Name = Name,
                EmbeddedResourcePath = GetType().Namespace + ".Pages.configPage.html"
            }
        };
    }
}

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
    }

    /// <inheritdoc />
    public override string Name => "Moonfin";

    /// <inheritdoc />
    public override string Description => "Moonfin brings a modern TV-style UI to Jellyfin web. Features include: custom navbar, media bar with featured content, Jellyseerr integration, and cross-device settings synchronization. Works with Android TV, Roku, Tizen, webOS, and Web clients. Requires File Transformation plugin for automatic UI injection.";

    /// <inheritdoc />
    public override Guid Id => Guid.Parse("8c5d0e91-4f2a-4b6d-9e3f-1a7c8d9e0f2b");

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

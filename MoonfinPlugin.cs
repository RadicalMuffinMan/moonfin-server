using System;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Moonfin.Server.Services;

namespace Moonfin.Server;

/// <summary>
/// Moonfin Server Plugin for Jellyfin.
/// Provides settings synchronization across Moonfin clients.
/// </summary>
public class MoonfinPlugin : BasePlugin<PluginConfiguration>
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
        
        // Register with File Transformation plugin for auto-injection
        Task.Run(() => FileTransformationIntegration.Register());
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
}

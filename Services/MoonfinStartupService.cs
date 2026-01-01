using System.Reflection;
using System.Runtime.Loader;
using MediaBrowser.Model.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace Moonfin.Server.Services;

/// <summary>
/// Startup task that registers Moonfin with File Transformation plugin.
/// This runs on Jellyfin startup to inject the Moonfin loader into index.html.
/// </summary>
public class MoonfinStartupService : IScheduledTask
{
    private readonly ILogger<MoonfinStartupService> _logger;

    public string Name => "Moonfin Startup Registration";
    public string Key => "Moonfin.StartupRegistration";
    public string Description => "Registers Moonfin with File Transformation plugin for UI injection.";
    public string Category => "Moonfin";

    public MoonfinStartupService(ILogger<MoonfinStartupService> logger)
    {
        _logger = logger;
    }

    public IEnumerable<TaskTriggerInfo> GetDefaultTriggers()
    {
        // Run on startup
        return new[]
        {
            new TaskTriggerInfo
            {
                Type = TaskTriggerInfo.TriggerStartup
            }
        };
    }

    public Task ExecuteAsync(IProgress<double> progress, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Moonfin startup task running - registering with File Transformation plugin");
        
        progress.Report(10);

        try
        {
            RegisterWithFileTransformation();
            progress.Report(100);
            _logger.LogInformation("Moonfin successfully registered with File Transformation plugin");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register Moonfin with File Transformation plugin");
        }

        return Task.CompletedTask;
    }

    private void RegisterWithFileTransformation()
    {
        // Find the File Transformation assembly
        Assembly? fileTransformationAssembly = AssemblyLoadContext.All
            .SelectMany(x => x.Assemblies)
            .FirstOrDefault(x => x.FullName?.Contains(".FileTransformation") ?? false);

        if (fileTransformationAssembly == null)
        {
            _logger.LogWarning("File Transformation plugin not found. Install from: https://www.iamparadox.dev/jellyfin/plugins/manifest.json");
            return;
        }

        _logger.LogInformation("Found File Transformation assembly: {Assembly}", fileTransformationAssembly.FullName);

        // Get the PluginInterface type
        Type? pluginInterfaceType = fileTransformationAssembly.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");

        if (pluginInterfaceType == null)
        {
            _logger.LogError("File Transformation PluginInterface type not found");
            return;
        }

        // Get RegisterTransformation method
        var registerMethod = pluginInterfaceType.GetMethod("RegisterTransformation");
        if (registerMethod == null)
        {
            _logger.LogError("RegisterTransformation method not found");
            return;
        }

        // Create the payload as JObject (Newtonsoft.Json) - this is what File Transformation expects
        JObject payload = new JObject
        {
            ["id"] = Guid.NewGuid().ToString(),
            ["fileNamePattern"] = @"index\.html$",
            ["callbackAssembly"] = typeof(MoonfinTransformationCallback).Assembly.FullName,
            ["callbackClass"] = typeof(MoonfinTransformationCallback).FullName,
            ["callbackMethod"] = nameof(MoonfinTransformationCallback.Transform)
        };

        _logger.LogInformation("Registering transformation with payload: {Payload}", payload.ToString());

        // Invoke RegisterTransformation with the JObject payload
        registerMethod.Invoke(null, new object?[] { payload });

        _logger.LogInformation("Moonfin transformation registered for index.html");
    }
}

/// <summary>
/// Callback class invoked by File Transformation plugin.
/// The Transform method receives a PatchRequestPayload-like object with Contents property.
/// </summary>
public static class MoonfinTransformationCallback
{
    /// <summary>
    /// Transform index.html to inject Moonfin loader script.
    /// Called by File Transformation plugin via reflection.
    /// </summary>
    /// <param name="payload">Object with Contents property containing the HTML.</param>
    /// <returns>Transformed HTML string.</returns>
    public static string Transform(PatchRequestPayload payload)
    {
        var contents = payload.Contents ?? string.Empty;

        // Don't inject if already present
        if (contents.Contains("/Moonfin/Web/"))
        {
            return contents;
        }

        // Inject loader script before </head>
        var injection = @"<script src=""/Moonfin/Web/loader.js""></script>
<link rel=""stylesheet"" href=""/Moonfin/Web/plugin.css"">";

        if (contents.Contains("</head>"))
        {
            return contents.Replace("</head>", $"{injection}\n</head>");
        }
        
        if (contents.Contains("</body>"))
        {
            return contents.Replace("</body>", $"{injection}\n</body>");
        }

        return contents + injection;
    }
}

/// <summary>
/// Payload type that File Transformation passes to callbacks.
/// This matches the structure expected by File Transformation plugin.
/// </summary>
public class PatchRequestPayload
{
    public string? Contents { get; set; }
}

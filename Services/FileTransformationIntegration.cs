using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Moonfin.Server.Services;

/// <summary>
/// Registers Moonfin's HTML transformation with the File Transformation plugin.
/// </summary>
public static class FileTransformationIntegration
{
    private static bool _registered = false;
    private static readonly object _lock = new();

    /// <summary>
    /// Registers the index.html transformation with File Transformation plugin.
    /// </summary>
    public static void Register(ILogger? logger = null)
    {
        lock (_lock)
        {
            if (_registered) return;

            try
            {
                var fileTransformationAssembly = AssemblyLoadContext.All
                    .SelectMany(x => x.Assemblies)
                    .FirstOrDefault(x => x.FullName?.Contains(".FileTransformation") ?? false);

                if (fileTransformationAssembly == null)
                {
                    logger?.LogWarning("File Transformation plugin not found. Moonfin web UI will not be auto-injected.");
                    logger?.LogInformation("Install File Transformation plugin from: https://www.iamparadox.dev/jellyfin/plugins/manifest.json");
                    return;
                }

                var pluginInterfaceType = fileTransformationAssembly.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");

                if (pluginInterfaceType == null)
                {
                    logger?.LogError("File Transformation PluginInterface type not found");
                    return;
                }

                var registerMethod = pluginInterfaceType.GetMethod("RegisterTransformation");
                if (registerMethod == null)
                {
                    logger?.LogError("File Transformation RegisterTransformation method not found");
                    return;
                }

                var payload = new
                {
                    id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-000000000001"),
                    fileNamePattern = @"index\.html$",
                    callbackAssembly = typeof(FileTransformationIntegration).Assembly.FullName,
                    callbackClass = typeof(MoonfinTransformationCallback).FullName,
                    callbackMethod = nameof(MoonfinTransformationCallback.Transform)
                };

                var payloadJson = JsonSerializer.Serialize(payload);
                registerMethod.Invoke(null, new object?[] { payloadJson });

                _registered = true;
                logger?.LogInformation("Moonfin registered with File Transformation plugin for index.html injection");
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Failed to register with File Transformation plugin");
            }
        }
    }
}

/// <summary>
/// Callback class invoked by File Transformation plugin.
/// </summary>
public static class MoonfinTransformationCallback
{
    /// <summary>
    /// Transforms index.html to inject Moonfin loader script.
    /// Called by File Transformation plugin.
    /// </summary>
    /// <param name="payload">JSON object with "contents" property.</param>
    /// <returns>Transformed JSON object with "contents" property.</returns>
    public static string Transform(string payload)
    {
        try
        {
            using var doc = JsonDocument.Parse(payload);
            var contents = doc.RootElement.GetProperty("contents").GetString() ?? string.Empty;

            // Don't inject if already present
            if (contents.Contains("/Moonfin/Web/"))
            {
                return payload;
            }

            // Inject loader script before </head>
            var injection = @"<script src=""/Moonfin/Web/loader.js""></script>";
            
            string transformed;
            if (contents.Contains("</head>"))
            {
                transformed = contents.Replace("</head>", $"{injection}\n</head>");
            }
            else if (contents.Contains("</body>"))
            {
                transformed = contents.Replace("</body>", $"{injection}\n</body>");
            }
            else
            {
                transformed = contents + injection;
            }

            return JsonSerializer.Serialize(new { contents = transformed });
        }
        catch
        {
            return payload;
        }
    }
}

using System.Text.Json;
using Microsoft.Extensions.Logging;
using Moonfin.Server.Models;

namespace Moonfin.Server.Services;

/// <summary>
/// Service for managing Moonfin user settings storage.
/// </summary>
public class MoonfinSettingsService
{
    private readonly string _dataPath;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly ILogger<MoonfinSettingsService> _logger;
    private static readonly SemaphoreSlim _lock = new(1, 1);

    /// <summary>
    /// Initializes a new instance of the <see cref="MoonfinSettingsService"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    public MoonfinSettingsService(ILogger<MoonfinSettingsService> logger)
    {
        _logger = logger;
        _dataPath = MoonfinPlugin.Instance?.DataFolderPath 
            ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Jellyfin", "plugins", "Moonfin");
        
        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        EnsureDataDirectory();
    }

    /// <summary>
    /// Ensures the data directory exists.
    /// </summary>
    private void EnsureDataDirectory()
    {
        if (!Directory.Exists(_dataPath))
        {
            Directory.CreateDirectory(_dataPath);
        }
    }

    /// <summary>
    /// Gets the settings file path for a user.
    /// </summary>
    private string GetUserSettingsPath(Guid userId)
    {
        return Path.Combine(_dataPath, $"{userId}.json");
    }

    /// <summary>
    /// Gets settings for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user settings, or null if not found.</returns>
    public async Task<MoonfinUserSettings?> GetUserSettingsAsync(Guid userId)
    {
        var filePath = GetUserSettingsPath(userId);
        
        if (!File.Exists(filePath))
        {
            return null;
        }

        await _lock.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<MoonfinUserSettings>(json, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading settings for user {UserId}", userId);
            return null;
        }
        finally
        {
            _lock.Release();
        }
    }

    /// <summary>
    /// Saves settings for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="settings">The settings to save.</param>
    /// <param name="clientId">The client that is saving.</param>
    /// <param name="mergeMode">Whether to merge or replace settings.</param>
    public async Task SaveUserSettingsAsync(Guid userId, MoonfinUserSettings settings, string? clientId = null, string mergeMode = "merge")
    {
        var filePath = GetUserSettingsPath(userId);

        await _lock.WaitAsync();
        try
        {
            MoonfinUserSettings finalSettings;

            if (mergeMode == "merge" && File.Exists(filePath))
            {
                // Load existing settings and merge
                var existingJson = await File.ReadAllTextAsync(filePath);
                var existingSettings = JsonSerializer.Deserialize<MoonfinUserSettings>(existingJson, _jsonOptions);
                finalSettings = MergeSettings(existingSettings, settings);
            }
            else
            {
                finalSettings = settings;
            }

            // Update metadata
            finalSettings.LastUpdated = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            finalSettings.LastUpdatedBy = clientId ?? "unknown";
            finalSettings.SchemaVersion = 1;

            var json = JsonSerializer.Serialize(finalSettings, _jsonOptions);
            await File.WriteAllTextAsync(filePath, json);
        }
        finally
        {
            _lock.Release();
        }
    }

    /// <summary>
    /// Merges new settings into existing settings (only non-null values).
    /// </summary>
    private MoonfinUserSettings MergeSettings(MoonfinUserSettings? existing, MoonfinUserSettings incoming)
    {
        if (existing == null)
        {
            return incoming;
        }

        // Use reflection to merge non-null properties
        var properties = typeof(MoonfinUserSettings).GetProperties();
        
        foreach (var prop in properties)
        {
            // Skip metadata properties - they'll be updated separately
            if (prop.Name is "LastUpdated" or "LastUpdatedBy" or "SchemaVersion")
            {
                continue;
            }

            var incomingValue = prop.GetValue(incoming);
            
            // Only update if incoming value is not null
            if (incomingValue != null)
            {
                prop.SetValue(existing, incomingValue);
            }
        }

        return existing;
    }

    /// <summary>
    /// Deletes settings for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    public async Task DeleteUserSettingsAsync(Guid userId)
    {
        var filePath = GetUserSettingsPath(userId);

        await _lock.WaitAsync();
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    /// <summary>
    /// Checks if settings exist for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>True if settings exist.</returns>
    public bool UserSettingsExist(Guid userId)
    {
        return File.Exists(GetUserSettingsPath(userId));
    }

    /// <summary>
    /// Gets all user IDs that have settings stored.
    /// </summary>
    public IEnumerable<Guid> GetAllUserIds()
    {
        EnsureDataDirectory();
        
        foreach (var file in Directory.GetFiles(_dataPath, "*.json"))
        {
            var fileName = Path.GetFileNameWithoutExtension(file);
            if (Guid.TryParse(fileName, out var userId))
            {
                yield return userId;
            }
        }
    }
}

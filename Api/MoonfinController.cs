using System.ComponentModel.DataAnnotations;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moonfin.Server.Models;
using Moonfin.Server.Services;

namespace Moonfin.Server.Api;

/// <summary>
/// API controller for Moonfin settings synchronization.
/// </summary>
[ApiController]
[Route("Moonfin")]
[Produces(MediaTypeNames.Application.Json)]
public class MoonfinController : ControllerBase
{
    private readonly MoonfinSettingsService _settingsService;

    /// <summary>
    /// Initializes a new instance of the <see cref="MoonfinController"/> class.
    /// </summary>
    public MoonfinController()
    {
        _settingsService = new MoonfinSettingsService();
    }

    /// <summary>
    /// Ping endpoint to check if Moonfin plugin is installed.
    /// This can be called without authentication.
    /// </summary>
    /// <returns>Plugin status information.</returns>
    [HttpGet("Ping")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<MoonfinPingResponse> Ping()
    {
        var config = MoonfinPlugin.Instance?.Configuration;
        
        if (config?.AllowAnonymousPing != true)
        {
            // If anonymous ping is disabled, still return basic info
            return Ok(new MoonfinPingResponse
            {
                Installed = true,
                Version = MoonfinPlugin.Instance?.Version.ToString() ?? "1.0.0.0"
            });
        }

        return Ok(new MoonfinPingResponse
        {
            Installed = true,
            Version = MoonfinPlugin.Instance?.Version.ToString() ?? "1.0.0.0",
            SettingsSyncEnabled = config.EnableSettingsSync,
            ServerName = "Jellyfin",
            JellyseerrEnabled = config.JellyseerrEnabled,
            JellyseerrUrl = config.JellyseerrEnabled ? config.JellyseerrUrl : null
        });
    }

    /// <summary>
    /// Gets the settings for the current authenticated user.
    /// </summary>
    /// <returns>The user's Moonfin settings.</returns>
    [HttpGet("Settings")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<MoonfinUserSettings>> GetMySettings()
    {
        var config = MoonfinPlugin.Instance?.Configuration;
        
        if (config?.EnableSettingsSync != true)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { Error = "Settings sync is disabled" });
        }

        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { Error = "User not authenticated" });
        }

        var settings = await _settingsService.GetUserSettingsAsync(userId.Value);
        
        if (settings == null)
        {
            return NotFound(new { Error = "No settings found for user", UserId = userId });
        }

        return Ok(settings);
    }

    /// <summary>
    /// Gets the settings for a specific user (admin only).
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user's Moonfin settings.</returns>
    [HttpGet("Settings/{userId}")]
    [Authorize(Policy = "RequiresElevation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<MoonfinUserSettings>> GetUserSettings([FromRoute] Guid userId)
    {
        var config = MoonfinPlugin.Instance?.Configuration;
        
        if (config?.EnableSettingsSync != true)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { Error = "Settings sync is disabled" });
        }

        var settings = await _settingsService.GetUserSettingsAsync(userId);
        
        if (settings == null)
        {
            return NotFound(new { Error = "No settings found for user", UserId = userId });
        }

        return Ok(settings);
    }

    /// <summary>
    /// Saves settings for the current authenticated user.
    /// </summary>
    /// <param name="request">The settings save request.</param>
    /// <returns>Success status.</returns>
    [HttpPost("Settings")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<MoonfinSaveResponse>> SaveMySettings([FromBody] MoonfinSaveRequest request)
    {
        var config = MoonfinPlugin.Instance?.Configuration;
        
        if (config?.EnableSettingsSync != true)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { Error = "Settings sync is disabled" });
        }

        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { Error = "User not authenticated" });
        }

        if (request.Settings == null)
        {
            return BadRequest(new { Error = "Settings are required" });
        }

        var existed = _settingsService.UserSettingsExist(userId.Value);
        
        await _settingsService.SaveUserSettingsAsync(
            userId.Value, 
            request.Settings, 
            request.ClientId,
            request.MergeMode ?? "merge"
        );

        return Ok(new MoonfinSaveResponse
        {
            Success = true,
            Created = !existed,
            UserId = userId.Value
        });
    }

    /// <summary>
    /// Saves settings for a specific user (admin only).
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The settings save request.</param>
    /// <returns>Success status.</returns>
    [HttpPost("Settings/{userId}")]
    [Authorize(Policy = "RequiresElevation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<MoonfinSaveResponse>> SaveUserSettings(
        [FromRoute] Guid userId, 
        [FromBody] MoonfinSaveRequest request)
    {
        var config = MoonfinPlugin.Instance?.Configuration;
        
        if (config?.EnableSettingsSync != true)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { Error = "Settings sync is disabled" });
        }

        if (request.Settings == null)
        {
            return BadRequest(new { Error = "Settings are required" });
        }

        var existed = _settingsService.UserSettingsExist(userId);
        
        await _settingsService.SaveUserSettingsAsync(
            userId, 
            request.Settings, 
            request.ClientId,
            request.MergeMode ?? "merge"
        );

        return Ok(new MoonfinSaveResponse
        {
            Success = true,
            Created = !existed,
            UserId = userId
        });
    }

    /// <summary>
    /// Deletes settings for the current authenticated user.
    /// </summary>
    /// <returns>Success status.</returns>
    [HttpDelete("Settings")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult> DeleteMySettings()
    {
        var config = MoonfinPlugin.Instance?.Configuration;
        
        if (config?.EnableSettingsSync != true)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { Error = "Settings sync is disabled" });
        }

        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { Error = "User not authenticated" });
        }

        await _settingsService.DeleteUserSettingsAsync(userId.Value);
        
        return Ok(new { Success = true, Message = "Settings deleted" });
    }

    /// <summary>
    /// Checks if the current user has settings stored.
    /// </summary>
    /// <returns>Whether settings exist.</returns>
    [HttpHead("Settings")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public ActionResult CheckMySettingsExist()
    {
        var config = MoonfinPlugin.Instance?.Configuration;
        
        if (config?.EnableSettingsSync != true)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }

        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized();
        }

        if (_settingsService.UserSettingsExist(userId.Value))
        {
            return Ok();
        }

        return NotFound();
    }

    /// <summary>
    /// Gets the user ID from the authentication claims.
    /// </summary>
    private Guid? GetUserIdFromClaims()
    {
        var userIdClaim = User.FindFirst("Jellyfin-UserId")?.Value 
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    /// <summary>
    /// Gets the Jellyseerr configuration.
    /// </summary>
    /// <param name="deviceType">The device type (desktop, mobile, tablet, tv).</param>
    /// <param name="isMobile">Whether the device is mobile.</param>
    /// <param name="hasTouch">Whether the device has touch support.</param>
    /// <returns>Jellyseerr configuration.</returns>
    [HttpGet("Jellyseerr/Config")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<JellyseerrConfigResponse> GetJellyseerrConfig(
        [FromQuery] string? deviceType = null,
        [FromQuery] bool isMobile = false,
        [FromQuery] bool hasTouch = false)
    {
        var config = MoonfinPlugin.Instance?.Configuration;

        var openInNewTab = config?.JellyseerrOpenInNewTab ?? false;
        
        if (isMobile && (config?.JellyseerrOpenInNewTabOnMobile ?? true))
        {
            openInNewTab = true;
        }

        return Ok(new JellyseerrConfigResponse
        {
            Enabled = config?.JellyseerrEnabled ?? false,
            Url = config?.JellyseerrUrl,
            DisplayName = config?.JellyseerrDisplayName ?? "Jellyseerr",
            OpenInNewTab = openInNewTab,
            DeviceType = deviceType ?? "unknown",
            IsMobile = isMobile
        });
    }
}

/// <summary>
/// Response for the ping endpoint.
/// </summary>
public class MoonfinPingResponse
{
    /// <summary>
    /// Gets or sets whether the plugin is installed.
    /// </summary>
    public bool Installed { get; set; }

    /// <summary>
    /// Gets or sets the plugin version.
    /// </summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether settings sync is enabled.
    /// </summary>
    public bool? SettingsSyncEnabled { get; set; }

    /// <summary>
    /// Gets or sets the server name.
    /// </summary>
    public string? ServerName { get; set; }

    /// <summary>
    /// Gets or sets whether Jellyseerr is enabled.
    /// </summary>
    public bool? JellyseerrEnabled { get; set; }

    /// <summary>
    /// Gets or sets the Jellyseerr URL if enabled.
    /// </summary>
    public string? JellyseerrUrl { get; set; }
}

/// <summary>
/// Response for Jellyseerr configuration.
/// </summary>
public class JellyseerrConfigResponse
{
    /// <summary>
    /// Gets or sets whether Jellyseerr is enabled.
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// Gets or sets the Jellyseerr URL.
    /// </summary>
    public string? Url { get; set; }

    /// <summary>
    /// Gets or sets the display name for Jellyseerr.
    /// </summary>
    public string DisplayName { get; set; } = "Jellyseerr";

    /// <summary>
    /// Gets or sets whether to open in new tab instead of iframe.
    /// </summary>
    public bool OpenInNewTab { get; set; }

    /// <summary>
    /// Gets or sets the device type that was detected.
    /// </summary>
    public string DeviceType { get; set; } = "unknown";

    /// <summary>
    /// Gets or sets whether the device is mobile.
    /// </summary>
    public bool IsMobile { get; set; }
}

/// <summary>
/// Request for saving settings.
/// </summary>
public class MoonfinSaveRequest
{
    /// <summary>
    /// Gets or sets the settings to save.
    /// </summary>
    [Required]
    public MoonfinUserSettings? Settings { get; set; }

    /// <summary>
    /// Gets or sets the client ID making the request.
    /// </summary>
    public string? ClientId { get; set; }

    /// <summary>
    /// Gets or sets the merge mode. "merge" to merge with existing, "replace" to overwrite.
    /// </summary>
    public string? MergeMode { get; set; }
}

/// <summary>
/// Response for saving settings.
/// </summary>
public class MoonfinSaveResponse
{
    /// <summary>
    /// Gets or sets whether the save was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets whether settings were created (vs updated).
    /// </summary>
    public bool Created { get; set; }

    /// <summary>
    /// Gets or sets the user ID.
    /// </summary>
    public Guid UserId { get; set; }
}

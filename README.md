# Moonfin Server Plugin

A Jellyfin server plugin that enables cross-client settings synchronization and Jellyseerr integration for Moonfin clients.

## Installation

### Option 1: Add Plugin Repository (Recommended)

1. Open Jellyfin Dashboard → Administration → Plugins → Repositories
2. Click "Add" and enter:
   - **Name:** Moonfin
   - **URL:** `https://raw.githubusercontent.com/RadicalMuffinMan/moonfin-server/master/manifest.json`
3. Go to the Catalog tab and find "Moonfin Settings Sync"
4. Click Install and restart Jellyfin

### Option 2: Manual Installation

1. Download the latest release ZIP from the [Releases page](https://github.com/RadicalMuffinMan/moonfin-server/releases)
2. Extract the ZIP to your Jellyfin plugins folder:
   - **Linux:** `/var/lib/jellyfin/plugins/Moonfin/`
   - **Docker:** `/config/plugins/Moonfin/`
   - **Windows:** `%ProgramData%\Jellyfin\Server\plugins\Moonfin\`
3. Restart Jellyfin

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/RadicalMuffinMan/moonfin-server.git
cd moonfin-server

# Build with .NET 8 SDK
dotnet build -c Release

# Copy Moonfin.Server.dll to your plugins folder
cp bin/Release/net8.0/Moonfin.Server.dll /var/lib/jellyfin/plugins/Moonfin/

# Restart Jellyfin
sudo systemctl restart jellyfin
```

## Features

- **Settings Sync**: Store user preferences on the server so they sync across all Moonfin clients (Android TV, Roku, Tizen, webOS, and Web)
- **Per-User Storage**: Each user's settings are stored separately
- **Merge Mode**: Settings can be merged (only update non-null values) or replaced entirely
- **Flexible Schema**: Uses nullable fields to support different client features
- **Jellyseerr Integration**: Admin-configurable Jellyseerr server integration displayed in Moonfin navbar

## Admin Configuration

Configure in Jellyfin Dashboard → Plugins → Moonfin:

| Setting | Default | Description |
|---------|---------|-------------|
| `EnableSettingsSync` | `true` | Enable cross-client settings synchronization |
| `AllowAnonymousPing` | `true` | Allow unauthenticated `/Moonfin/Ping` requests |
| `JellyseerrEnabled` | `false` | Enable Jellyseerr integration in Moonfin clients |
| `JellyseerrUrl` | `null` | Jellyseerr server URL (e.g., `https://jellyseerr.example.com`) |
| `JellyseerrDisplayName` | `Jellyseerr` | Display name shown in the navbar |
| `JellyseerrOpenInNewTab` | `false` | Open Jellyseerr in new tab instead of iframe |

## API Endpoints

### `GET /Moonfin/Ping`
Check if the Moonfin plugin is installed. Can be called without authentication.

**Response:**
```json
{
  "installed": true,
  "version": "1.0.0.0",
  "settingsSyncEnabled": true,
  "serverName": "Jellyfin",
  "jellyseerrEnabled": true,
  "jellyseerrUrl": "https://jellyseerr.example.com"
}
```

### `GET /Moonfin/Jellyseerr/Config`
Get Jellyseerr configuration (requires authentication).

**Response:**
```json
{
  "enabled": true,
  "url": "https://jellyseerr.example.com",
  "displayName": "Jellyseerr",
  "openInNewTab": false
}
```

### `GET /Moonfin/Settings`
Get settings for the currently authenticated user.

**Headers:** `Authorization: MediaBrowser Token="..."`

**Response:** `MoonfinUserSettings` object or 404 if not found.

### `POST /Moonfin/Settings`
Save settings for the currently authenticated user.

**Headers:** `Authorization: MediaBrowser Token="..."`

**Request Body:**
```json
{
  "settings": {
    "mediaBarEnabled": true,
    "backdropEnabled": true,
    ...
  },
  "clientId": "moonfin-androidtv",
  "mergeMode": "merge"
}
```

**Merge Modes:**
- `merge`: Only update non-null fields in the incoming settings (default)
- `replace`: Replace all settings with the incoming values

**Response:**
```json
{
  "success": true,
  "created": false,
  "userId": "..."
}
```

### `HEAD /Moonfin/Settings`
Check if settings exist for the current user (no body returned).

### `DELETE /Moonfin/Settings`
Delete settings for the current user.

## Settings Schema

The `MoonfinUserSettings` model supports all settings from various Moonfin clients:

### Media Bar
- `mediaBarEnabled` - Show featured content carousel
- `mediaBarContentType` - Content type filter (movies, tv, both)
- `mediaBarItemCount` - Number of items in rotation
- `overlayOpacity` - Gradient overlay opacity
- `overlayColor` - Gradient color theme
- `mediaBarAutoAdvance` - Auto-advance slides
- `mediaBarInterval` - Milliseconds between slides

### Toolbar/Navigation
- `showShuffleButton` - Show shuffle feature
- `showGenresButton` - Show genres navigation
- `showFavoritesButton` - Show favorites shortcut
- `showSearchButton` - Show search
- `showLibrariesInToolbar` - Show library buttons
- `shuffleContentType` - Content type for shuffle

### Playback
- `defaultAudioDelay` - Audio sync offset
- `externalPlayerEnabled` - Use external player
- `externalPlayerApp` - External player app name
- `preferFmp4HlsContainer` - Prefer fMP4 for HLS
- `hlsSegmentSize` - HLS segment duration
- `playbackResumeOffset` - Resume offset seconds
- `autoSkipIntro` - Skip intros automatically
- `autoSkipCredits` - Skip credits automatically
- `autoSkipRecap` - Skip recaps automatically
- ... and many more

### Display
- `seasonalSurprise` - Seasonal theme effects
- `backdropEnabled` - Show backdrop images
- `confirmExit` - Confirm before exit
- `showClock` - Display clock
- `use24HourClock` - Use 24-hour format

### Client-Specific
- `clientSpecific` - Dictionary for platform-specific settings

## Building

```bash
cd Moonfin.Server
dotnet build
```

The built DLL goes in your Jellyfin plugin folder.

## Installation

1. Build the plugin or download a release
2. Copy `Moonfin.Server.dll` to your Jellyfin plugins folder:
   - Linux: `/var/lib/jellyfin/plugins/Moonfin/`
   - Windows: `%ProgramData%\Jellyfin\Server\plugins\Moonfin\`
3. Restart Jellyfin
4. Configure in Dashboard → Plugins → Moonfin

## Client Integration

Clients should:

1. **On Login/Startup**: Call `GET /Moonfin/Ping` to check if plugin is available
2. **If Available**: Call `GET /Moonfin/Settings` to fetch user settings
3. **Merge Settings**: If server has settings, merge with local (server wins for conflicts)
4. **No Server Settings**: If 404, push local settings to server with `POST /Moonfin/Settings`
5. **On Settings Change**: Save to server with `mergeMode: "merge"`

Example client code:

```javascript
// Check if server plugin is installed
const ping = await fetch(`${serverUrl}/Moonfin/Ping`);
const { installed, settingsSyncEnabled } = await ping.json();

if (installed && settingsSyncEnabled) {
    // Fetch settings
    const response = await fetch(`${serverUrl}/Moonfin/Settings`, {
        headers: { Authorization: `MediaBrowser Token="${token}"` }
    });
    
    if (response.ok) {
        const serverSettings = await response.json();
        // Merge with local
    } else if (response.status === 404) {
        // Push local settings to server
        await fetch(`${serverUrl}/Moonfin/Settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `MediaBrowser Token="${token}"`
            },
            body: JSON.stringify({
                settings: localSettings,
                clientId: 'my-client',
                mergeMode: 'replace'
            })
        });
    }
}
```

## License

MIT

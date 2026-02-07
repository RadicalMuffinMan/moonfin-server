# Moonfin Server Plugin

# THIS IS A WORK IN PROGRESS AND NOT MEANT TO BE USED

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
- **Jellyseerr Integration**: Admin-configurable Jellyseerr server URL with user-controlled API keys

## Admin Configuration

Configure in Jellyfin Dashboard → Plugins → Moonfin:

| Setting | Default | Description |
|---------|---------|-------------|
| `EnableSettingsSync` | `true` | Enable cross-client settings synchronization |
| `AllowAnonymousPing` | `true` | Allow unauthenticated `/Moonfin/Ping` requests |
| `JellyseerrEnabled` | `false` | Enable Jellyseerr integration in Moonfin clients |
| `JellyseerrUrl` | `null` | Jellyseerr server URL (e.g., `https://jellyseerr.example.com`) |

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
  "userEnabled": true
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
    "themeMusicEnabled": false,
    "navbarPosition": "bottom"
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

## User Settings Schema

The `MoonfinUserSettings` model stores user preferences synced across Moonfin clients.
Based on [FEATURES.md](https://github.com/Moonfin-Client/AndroidTV-FireTV/blob/master/docs/FEATURES.md).

### API Keys (User-Controlled)
| Setting | Type | Description |
|---------|------|-------------|
| `jellyseerrEnabled` | `bool` | Enable Jellyseerr for this user |
| `jellyseerrApiKey` | `string` | User's Jellyseerr API key |
| `jellyseerrRows` | `object` | Jellyseerr discovery rows config |
| `mdblistEnabled` | `bool` | Enable MDBList ratings |
| `mdblistApiKey` | `string` | User's MDBList API key |
| `tmdbApiKey` | `string` | User's TMDB API key |

### Toolbar/Navbar
| Setting | Type | Description |
|---------|------|-------------|
| `navbarPosition` | `string` | Position: top, bottom, left, right |
| `showShuffleButton` | `bool` | Show shuffle button |
| `showGenresButton` | `bool` | Show genres button |
| `showFavoritesButton` | `bool` | Show favorites button |
| `showLibrariesInToolbar` | `bool` | Show library buttons |
| `shuffleContentType` | `string` | Shuffle content type |

### Home Screen
| Setting | Type | Description |
|---------|------|-------------|
| `mergeContinueWatchingNextUp` | `bool` | Merge Continue Watching and Next Up |
| `enableMultiServerLibraries` | `bool` | Multi-server library aggregation |
| `enableFolderView` | `bool` | Folder-based library view |
| `confirmExit` | `bool` | Show confirm exit dialog |

### Media Bar
| Setting | Type | Description |
|---------|------|-------------|
| `mediaBarEnabled` | `bool` | Enable media bar on home |
| `mediaBarContentType` | `string` | Content type filter |
| `mediaBarItemCount` | `int` | Number of items |
| `mediaBarOpacity` | `int` | Background opacity (0-100) |
| `mediaBarOverlayColor` | `string` | Hex overlay color |

### Visual Customization
| Setting | Type | Description |
|---------|------|-------------|
| `homeRowsImageTypeOverride` | `bool` | Override default image type |
| `homeRowsImageType` | `string` | Image type: poster, thumb, banner |
| `detailsScreenBlur` | `string` | Details screen blur intensity |
| `browsingBlur` | `string` | Browsing screen blur intensity |

### Theme Music
| Setting | Type | Description |
|---------|------|-------------|
| `themeMusicEnabled` | `bool` | Enable theme music |
| `themeMusicOnHomeRows` | `bool` | Play on home rows |
| `themeMusicVolume` | `int` | Volume (0-100) |

### Parental Controls
| Setting | Type | Description |
|---------|------|-------------|
| `blockedRatings` | `List<string>` | Content ratings to block |

### Client-Specific
| Setting | Type | Description |
|---------|------|-------------|
| `clientSpecific` | `Dictionary<string, string>` | Platform-specific settings blob |

### Jellyseerr Rows Config
| Setting | Type | Description |
|---------|------|-------------|
| `trendingMovies` | `bool` | Show trending movies row |
| `trendingTv` | `bool` | Show trending TV row |
| `popularMovies` | `bool` | Show popular movies row |
| `popularTv` | `bool` | Show popular TV row |
| `upcomingMovies` | `bool` | Show upcoming movies row |
| `upcomingTv` | `bool` | Show upcoming TV row |
| `rowOrder` | `List<string>` | Custom row order |

## Building

```bash
cd Moonfin.Server
dotnet build
```

The built DLL goes in your Jellyfin plugin folder.

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

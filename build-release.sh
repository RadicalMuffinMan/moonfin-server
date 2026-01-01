#!/bin/bash
# Build script for Moonfin.Server Jellyfin plugin
# Creates a release ZIP with proper structure for plugin manifest

set -e

VERSION="${1:-1.0.0.0}"
TARGET_ABI="${2:-10.10.0}"
BUILD_TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "Building Moonfin.Server v${VERSION} for Jellyfin ${TARGET_ABI}..."
echo "Build Time: ${BUILD_TIMESTAMP}"

# Build the plugin
dotnet build -c Release

# Create release directory
RELEASE_DIR="release"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# Copy DLL to release folder
cp "bin/Release/net8.0/Moonfin.Server.dll" "$RELEASE_DIR/"

# Create the ZIP file
ZIP_NAME="Moonfin.Server-${TARGET_ABI}.zip"
cd "$RELEASE_DIR"
zip -r "../$ZIP_NAME" .
cd ..

# Calculate MD5 checksum
if command -v md5sum &> /dev/null; then
    CHECKSUM=$(md5sum "$ZIP_NAME" | awk '{print toupper($1)}')
elif command -v md5 &> /dev/null; then
    CHECKSUM=$(md5 -q "$ZIP_NAME" | tr '[:lower:]' '[:upper:]')
else
    CHECKSUM="UNABLE_TO_CALCULATE"
fi
# Update manifest.json
MANIFEST_FILE="manifest.json"
if [ -f "$MANIFEST_FILE" ]; then
    # Create timestamp in ISO 8601 format
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S")
    
    # Use jq if available, otherwise use sed
    if command -v jq &> /dev/null; then
        # Update using jq
        jq --arg ver "$VERSION" \
           --arg abi "${TARGET_ABI}.0" \
           --arg sum "$CHECKSUM" \
           --arg time "$TIMESTAMP" \
           '.[0].versions[0].version = $ver | 
            .[0].versions[0].targetAbi = $abi | 
            .[0].versions[0].checksum = $sum | 
            .[0].versions[0].timestamp = $time' \
           "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
        echo "Updated $MANIFEST_FILE with new checksum and version"
    else
        # Fallback to sed
        sed -i.bak -E "s/\"version\": \"[^\"]+\"/\"version\": \"$VERSION\"/" "$MANIFEST_FILE"
        sed -i.bak -E "s/\"checksum\": \"[^\"]+\"/\"checksum\": \"$CHECKSUM\"/" "$MANIFEST_FILE"
        sed -i.bak -E "s/\"timestamp\": \"[^\"]+\"/\"timestamp\": \"$TIMESTAMP\"/" "$MANIFEST_FILE"
        rm -f "${MANIFEST_FILE}.bak"
        echo "Updated $MANIFEST_FILE with new checksum and version (using sed)"
    fi
fi

echo ""
echo "========================================="
echo "Build complete!"
echo "Build Time: ${BUILD_TIMESTAMP}"
echo "========================================="
echo "ZIP file: $ZIP_NAME"
echo "MD5 Checksum: $CHECKSUM"
echo "Manifest updated: $MANIFEST_FILE"
echo "========================================="

# Cleanup
rm -rf "$RELEASE_DIR"

echo ""
echo "Done!"

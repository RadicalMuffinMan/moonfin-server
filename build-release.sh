#!/bin/bash
# Build script for Moonfin.Server Jellyfin plugin
# Creates a release ZIP with proper structure for plugin manifest

set -e

VERSION="${1:-1.0.0.0}"
TARGET_ABI="${2:-10.10.0}"

echo "Building Moonfin.Server v${VERSION} for Jellyfin ${TARGET_ABI}..."

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

echo ""
echo "========================================="
echo "Build complete!"
echo "========================================="
echo "ZIP file: $ZIP_NAME"
echo "MD5 Checksum: $CHECKSUM"
echo ""
echo "Update manifest.json with:"
echo "  - sourceUrl: URL to your hosted $ZIP_NAME"
echo "  - checksum: $CHECKSUM"
echo "  - version: $VERSION"
echo "  - targetAbi: ${TARGET_ABI}.0"
echo ""
echo "To install manually:"
echo "  1. Upload $ZIP_NAME to your Jellyfin plugins folder"
echo "  2. Or host manifest.json and add as plugin repository"
echo "========================================="

# Cleanup
rm -rf "$RELEASE_DIR"

echo ""
echo "Done!"

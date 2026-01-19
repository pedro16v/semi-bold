#!/bin/bash

# Distribution script for Chrome extension
# Creates a ready-to-share package for distribution

set -e  # Exit on error

VERSION="1.0.0"
DIST_NAME="Google-Docs-Semi-Bold-Chrome-v${VERSION}"

echo "📦 Creating Chrome extension distribution package..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CHROME_DIR="${SCRIPT_DIR}"

# Clean up old distribution if it exists
rm -f "${CHROME_DIR}/${DIST_NAME}.zip" "${CHROME_DIR}/${DIST_NAME}.zip.sha256"

# Create zip file from chrome directory contents
echo "📦 Creating zip archive..."
cd "${CHROME_DIR}"
zip -r "${DIST_NAME}.zip" . \
  -x "*.git*" \
  -x "distribute.sh" \
  -x "*.zip" \
  -x "*.sha256" \
  -x ".DS_Store" \
  > /dev/null

# Calculate checksum
CHECKSUM=$(shasum -a 256 "${DIST_NAME}.zip" | cut -d' ' -f1)

# Create checksum file
echo "${CHECKSUM}  ${DIST_NAME}.zip" > "${DIST_NAME}.zip.sha256"

echo ""
echo "✅ Distribution package created!"
echo ""
echo "📁 Files created:"
echo "   - ${DIST_NAME}.zip (ready to share)"
echo "   - ${DIST_NAME}.zip.sha256 (checksum for verification)"
echo ""
echo "📤 Share ${DIST_NAME}.zip with your team!"
echo ""
echo "🔍 SHA256 checksum: ${CHECKSUM}"
echo "   (Users can verify with: shasum -a 256 -c ${DIST_NAME}.zip.sha256)"
echo ""
echo "📝 Installation instructions:"
echo "   1. Open Chrome and go to chrome://extensions/"
echo "   2. Enable 'Developer mode' (toggle in top right)"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the extracted ${DIST_NAME} folder"
echo "   5. The extension will be installed and ready to use!"

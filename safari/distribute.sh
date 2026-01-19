#!/bin/bash

# Distribution script for Safari extension
# Creates a ready-to-share package for team distribution

set -e  # Exit on error

VERSION="1.0.0"
PROJECT_NAME="Google Docs Semi Bold"
DIST_NAME="Google-Docs-Semi-Bold-v${VERSION}"

echo "🚀 Building release version..."
xcodebuild -project "${PROJECT_NAME}/${PROJECT_NAME}.xcodeproj" \
           -scheme "${PROJECT_NAME}" \
           -configuration Release \
           -derivedDataPath ./build \
           clean build > /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check the output above for errors."
    exit 1
fi

echo "✅ Build successful!"
echo "📦 Creating distribution package..."

# Clean up old distribution if it exists
rm -rf "${DIST_NAME}" "${DIST_NAME}.zip"

# Create distribution directory
mkdir -p "${DIST_NAME}"

# Copy the built app
cp -R "./build/Build/Products/Release/${PROJECT_NAME}.app" "${DIST_NAME}/"

# Create install instructions
cat > "${DIST_NAME}/INSTALL.txt" << 'EOF'
INSTALLATION INSTRUCTIONS
=========================

1. Double-click "Google Docs Semi Bold.app" to launch it once
   (This registers the extension with Safari)

2. Enable Safari developer features:
   - Safari → Settings → Advanced
   - Check "Show Develop menu in menu bar"

3. Allow unsigned extensions:
   - Develop → Allow Unsigned Extensions
   - Enter your password if prompted

4. Enable the extension:
   - Safari → Settings → Extensions
   - Check the box next to "Google Docs Semi Bold"

5. Test it:
   - Open a Google Docs document
   - Select some text
   - Press Cmd+Ctrl+B

TROUBLESHOOTING
===============
- If the extension doesn't appear, try restarting Safari
- Make sure you launched the app at least once
- Verify "Allow Unsigned Extensions" is enabled
- If you see "App is damaged" error, run:
  xattr -cr "Google Docs Semi Bold.app"
EOF

# Copy README
cp README.md "${DIST_NAME}/"

# Create zip file
echo "📦 Creating zip archive..."
zip -r "${DIST_NAME}.zip" "${DIST_NAME}/" > /dev/null

# Calculate checksum
CHECKSUM=$(shasum -a 256 "${DIST_NAME}.zip" | cut -d' ' -f1)

# Create checksum file
echo "${CHECKSUM}  ${DIST_NAME}.zip" > "${DIST_NAME}.zip.sha256"

echo ""
echo "✅ Distribution package created!"
echo ""
echo "📁 Files created:"
echo "   - ${DIST_NAME}/ (folder with app and instructions)"
echo "   - ${DIST_NAME}.zip (ready to share)"
echo "   - ${DIST_NAME}.zip.sha256 (checksum for verification)"
echo ""
echo "📤 Share ${DIST_NAME}.zip with your team!"
echo ""
echo "🔍 SHA256 checksum: ${CHECKSUM}"
echo "   (Users can verify with: shasum -a 256 -c ${DIST_NAME}.zip.sha256)"

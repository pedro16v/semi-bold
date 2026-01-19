# Team Distribution Guide - Safari Extension

This guide explains how to share the Safari extension with your team without publishing to the App Store.

## Distribution Options

There are three main ways to distribute the extension to your team:

1. **Share Xcode Project** (Recommended if team has Xcode)
2. **Distribute Pre-built App** (Easier for end users, requires one-time setup)
3. **Create Distribution Archive** (Best for updates and version control)

---

## Option 1: Share Xcode Project (Simplest)

### For You (Distributor)

1. **Package the project:**
   ```bash
   cd safari
   zip -r "Google-Docs-Semi-Bold-v1.0.0.zip" "Google Docs Semi Bold/"
   ```

2. **Share the zip file** via:
   - Email attachment
   - Shared drive (Google Drive, Dropbox, etc.)
   - Internal file server
   - Git repository (if using version control)

### For Team Members

1. **Extract the zip file**
2. **Open the Xcode project:**
   ```bash
   open "Google Docs Semi Bold/Google Docs Semi Bold.xcodeproj"
   ```
3. **Build and run:**
   - Press `Cmd+B` to build
   - Press `Cmd+R` to run (registers extension)
   - Quit the app
4. **Enable in Safari:**
   - Safari → Settings → Advanced → Show Develop menu
   - Develop → Allow Unsigned Extensions
   - Safari → Settings → Extensions → Enable "Google Docs Semi Bold"

**Pros:**
- ✅ No signing required
- ✅ Team can build and update themselves
- ✅ Easy to share code changes

**Cons:**
- ❌ Requires Xcode (free but large download)
- ❌ Each team member needs to build

---

## Option 2: Distribute Pre-built App (Easiest for Users)

### For You (Distributor)

1. **Build the app in Xcode:**
   ```bash
   cd safari
   xcodebuild -project "Google Docs Semi Bold/Google Docs Semi Bold.xcodeproj" \
              -scheme "Google Docs Semi Bold" \
              -configuration Release \
              -derivedDataPath ./build \
              build
   ```

2. **Find the built app:**
   ```bash
   # The app will be in:
   ./build/Build/Products/Release/Google\ Docs\ Semi\ Bold.app
   ```

3. **Create a distribution package:**
   ```bash
   # Create a folder for distribution
   mkdir -p "Google-Docs-Semi-Bold-v1.0.0"
   
   # Copy the app
   cp -R "./build/Build/Products/Release/Google Docs Semi Bold.app" \
         "Google-Docs-Semi-Bold-v1.0.0/"
   
   # Create installation instructions
   cat > "Google-Docs-Semi-Bold-v1.0.0/INSTALL.txt" << 'EOF'
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
   EOF
   
   # Create zip file
   zip -r "Google-Docs-Semi-Bold-v1.0.0.zip" "Google-Docs-Semi-Bold-v1.0.0/"
   ```

4. **Share the zip file** with your team

### For Team Members

1. **Download and extract the zip file**
2. **Open the app once** (double-click `Google Docs Semi Bold.app`)
3. **Follow the instructions** in `INSTALL.txt`
4. **Done!** No Xcode required.

**Pros:**
- ✅ No Xcode required for end users
- ✅ One-click installation
- ✅ Easy to update (just replace the app)

**Cons:**
- ❌ You need to rebuild for each update
- ❌ Users need to enable "Allow Unsigned Extensions"
- ❌ macOS may show security warnings (can be bypassed)

---

## Option 3: Developer ID Signed Build (Most Professional)

If you have an Apple Developer account (free or paid), you can sign the app for easier distribution.

### Prerequisites

- Apple Developer account (free or paid)
- Developer ID certificate installed in Keychain

### For You (Distributor)

1. **Get your Developer ID:**
   - Open Xcode → Preferences → Accounts
   - Add your Apple ID
   - Download certificates

2. **Build and sign:**
   ```bash
   cd safari
   xcodebuild -project "Google Docs Semi Bold/Google Docs Semi Bold.xcodeproj" \
              -scheme "Google Docs Semi Bold" \
              -configuration Release \
              CODE_SIGN_IDENTITY="Developer ID Application: Your Name (TEAM_ID)" \
              CODE_SIGN_STYLE=Manual \
              -derivedDataPath ./build \
              build
   ```

3. **Notarize (optional but recommended):**
   ```bash
   # Create a zip for notarization
   ditto -c -k --keepParent \
     "./build/Build/Products/Release/Google Docs Semi Bold.app" \
     "Google-Docs-Semi-Bold-notarize.zip"
   
   # Submit for notarization (requires App Store Connect API key)
   xcrun notarytool submit "Google-Docs-Semi-Bold-notarize.zip" \
     --keychain-profile "notarytool-profile" \
     --wait
   ```

4. **Distribute the signed app** (same as Option 2)

**Pros:**
- ✅ No "Allow Unsigned Extensions" needed
- ✅ Fewer security warnings
- ✅ More professional distribution

**Cons:**
- ❌ Requires Apple Developer account
- ❌ More complex setup

---

## Recommended Workflow for Teams

### Initial Distribution

1. **Use Option 1** (Share Xcode Project) if:
   - Team members are developers
   - You want them to be able to modify code
   - You're actively developing

2. **Use Option 2** (Pre-built App) if:
   - Team members are non-technical
   - You want simplest installation
   - You'll handle all updates

### Updates

1. **Build new version** with updated version number
2. **Share via same method** (replace old files)
3. **Team members:**
   - Option 1: Pull latest code, rebuild
   - Option 2: Replace old app, relaunch once

---

## Version Management

### Update Version Number

1. **In Xcode:**
   - Select project in navigator
   - Select "Google Docs Semi Bold" target
   - General tab → Version: `1.0.1` (or new version)
   - Build: `1` (increment for each build)

2. **In manifest.json:**
   ```json
   {
     "version": "1.0.1"
   }
   ```

### Create Release Notes

Create a `CHANGELOG.md`:

```markdown
# Changelog

## 1.0.1 (2026-01-16)
- Fixed bundle identifier issue
- Improved Safari compatibility

## 1.0.0 (2026-01-16)
- Initial release
- Cmd+Ctrl+B shortcut for Semi Bold
- Fallback to Bold when Semi Bold unavailable
```

---

## Distribution Checklist

Before sharing with team:

- [ ] Version number updated
- [ ] Build succeeds without errors
- [ ] Extension tested on clean macOS install
- [ ] Installation instructions included
- [ ] README updated with distribution method
- [ ] Release notes created (if updating)
- [ ] Distribution package created and tested

---

## Security Considerations

### Unsigned Extensions

- Users must enable "Allow Unsigned Extensions" in Safari
- macOS may show security warnings
- Users need to trust the app manually

### Signed Extensions (Developer ID)

- No "Allow Unsigned Extensions" needed
- Fewer security warnings
- Still requires user trust on first launch

### Best Practices

1. **Share via trusted channels** (company email, internal servers)
2. **Include checksums** (SHA256) so users can verify integrity
3. **Document the source** so users know it's legitimate
4. **Use version control** (Git) for code distribution

---

## Troubleshooting Distribution Issues

### "App is damaged" Error

**Solution:** Users need to remove quarantine attribute:
```bash
xattr -cr "Google Docs Semi Bold.app"
```

### Extension Doesn't Appear

**Solution:** 
1. Make sure app was launched at least once
2. Verify "Allow Unsigned Extensions" is enabled
3. Restart Safari

### Build Errors

**Solution:**
- Clean build folder: `Cmd+Shift+K` in Xcode
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/Google_Docs_Semi_Bold-*`
- Rebuild

---

## Quick Distribution Script

Save this as `distribute.sh` in the `safari/` directory:

```bash
#!/bin/bash

VERSION="1.0.0"
PROJECT_NAME="Google Docs Semi Bold"
DIST_NAME="Google-Docs-Semi-Bold-v${VERSION}"

echo "Building release version..."
xcodebuild -project "${PROJECT_NAME}/${PROJECT_NAME}.xcodeproj" \
           -scheme "${PROJECT_NAME}" \
           -configuration Release \
           -derivedDataPath ./build \
           clean build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Creating distribution package..."
mkdir -p "${DIST_NAME}"
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
EOF

# Create zip
zip -r "${DIST_NAME}.zip" "${DIST_NAME}/"

echo "Distribution package created: ${DIST_NAME}.zip"
echo "Share this file with your team!"
```

Make it executable:
```bash
chmod +x distribute.sh
```

Run it:
```bash
./distribute.sh
```

---

## Support

If team members have issues:

1. Check [safari/README.md](README.md) for installation help
2. Check [safari/TESTING.md](TESTING.md) for troubleshooting
3. Verify they followed all installation steps
4. Check Safari's JavaScript Console for errors

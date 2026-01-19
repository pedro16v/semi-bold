# Google Docs Semi Bold Shortcut - Safari Extension

A Safari browser extension that adds a keyboard shortcut (Cmd+Ctrl+B on Mac) to quickly apply Semi Bold font weight in Google Docs.

## Features

- **Quick Shortcut**: Press `Cmd+Ctrl+B` to apply Semi Bold
- **Smart Fallback**: Automatically falls back to Bold if Semi Bold is not available for the current font
- **Silent Operation**: Never shows errors or interferes with your document
- **Professional Grade**: Built with reliability and team adoption in mind

## Prerequisites

- macOS 11.0 (Big Sur) or later
- Safari 14.0 or later
- Xcode 12.0 or later (for building the extension)

## Installation

### Step 1: Build the Extension in Xcode

1. Open the Xcode project:
   ```bash
   cd safari
   open "Google Docs Semi Bold/Google Docs Semi Bold.xcodeproj"
   ```

2. In Xcode, select the "Google Docs Semi Bold" scheme (top toolbar)

3. Build the project:
   - Press `Cmd+B` or go to **Product → Build**
   - Wait for the build to complete successfully

4. Run the app once (this registers the extension with Safari):
   - Press `Cmd+R` or go to **Product → Run**
   - The app will launch briefly and then you can quit it

### Step 2: Enable Developer Features in Safari

1. Open Safari
2. Go to **Safari → Settings** (or **Preferences**)
3. Click the **Advanced** tab
4. Check **"Show Develop menu in menu bar"**

### Step 3: Allow Unsigned Extensions

1. In Safari, go to **Develop → Allow Unsigned Extensions**
2. If prompted, enter your administrator password
3. You should see a confirmation that unsigned extensions are now allowed

### Step 4: Enable the Extension

1. Go to **Safari → Settings → Extensions**
2. Find **"Google Docs Semi Bold"** in the list
3. Check the box to enable it
4. If prompted, click **"Turn On"** or **"Enable"**

### Step 5: Verify Installation

1. Open a Google Docs document: https://docs.google.com/document/create
2. Type some text and select it
3. Change the font to **Montserrat** (if not already set)
4. Press `Cmd+Ctrl+B`
5. The text should become Semi Bold

## Usage

1. **Select text** in your Google Docs document
2. **Press the shortcut**: `Cmd+Ctrl+B`
3. The text will be formatted with Semi Bold weight (or Bold as fallback)

### Keyboard Shortcut

- **Mac**: `Cmd+Ctrl+B`

## How It Works

The extension:
1. Detects when you press the keyboard shortcut
2. Identifies the current font of the selected text
3. Opens the font menu and navigates to the weight options
4. Applies Semi Bold if available, or Bold as a fallback
5. Silently handles any errors without disrupting your workflow

## Font Compatibility

- **Fonts with Semi Bold**: Montserrat, Roboto, Lora, and many Google Fonts
- **Fonts without Semi Bold**: Arial, Times New Roman, Courier New (will fall back to Bold)
- **Fonts without Bold or Semi Bold**: No action taken (silent failure)

## Troubleshooting

### Extension doesn't appear in Safari Settings

- Make sure you've built and run the app in Xcode at least once
- Check that the build succeeded without errors
- Try restarting Safari

### Extension doesn't activate

- Make sure you're on a Google Docs page (`docs.google.com/document/*`)
- Refresh the page after enabling the extension
- Check that the extension is enabled in **Safari → Settings → Extensions**
- Verify that "Allow Unsigned Extensions" is enabled in **Develop** menu

### Shortcut doesn't work

- Make sure you have text selected first
- Verify you're in editing mode (not viewing or suggesting mode)
- Check that no other extension or app is using the same shortcut
- Try refreshing the Google Docs page
- Check Safari's Console (Develop → Show JavaScript Console) for errors

### Semi Bold not applied

- Check if your current font supports Semi Bold weight
- The extension will fall back to Bold if Semi Bold isn't available
- Some fonts may not have Semi Bold or Bold weights

### Console Errors

- Open Safari's JavaScript Console: **Develop → Show JavaScript Console**
- Look for messages prefixed with `[Semi Bold Extension]`
- Set `CONFIG.DEBUG = true` in `content.js` for detailed logging

### Build Errors in Xcode

- Make sure you have Xcode 12.0 or later installed
- Verify that the project opens without errors
- Try cleaning the build folder: **Product → Clean Build Folder** (`Cmd+Shift+K`)
- Rebuild the project

## Development

### Project Structure

```
safari/
├── Google Docs Semi Bold/
│   ├── Google Docs Semi Bold/          # Main app target
│   ├── Google Docs Semi Bold Extension/  # Extension target
│   │   └── Resources/
│   │       ├── manifest.json          # Extension configuration
│   │       ├── content.js             # Main extension logic
│   │       └── icons/                 # Extension icons
│   └── Google Docs Semi Bold.xcodeproj/  # Xcode project
└── README.md                          # This file
```

### Debugging

To enable debug logging:

1. Open `Google Docs Semi Bold Extension/Resources/content.js` in Xcode
2. Find `DEBUG: false` and change to `DEBUG: true`
3. Rebuild and run the app in Xcode
4. Open Safari's JavaScript Console: **Develop → Show JavaScript Console**
5. Look for messages prefixed with `[Semi Bold Extension]`

### Updating the Extension

If you make changes to the extension code:

1. Edit the files in `Google Docs Semi Bold Extension/Resources/`
2. Rebuild the project in Xcode (`Cmd+B`)
3. Run the app once (`Cmd+R`) to re-register the extension
4. Reload the Google Docs page in Safari

### Code Changes

The Safari version shares the same core logic as the Chrome version. Key differences:

- Uses `browser.*` API namespace (with compatibility shim for `chrome.*`)
- No background service worker (debug logging removed)
- Wrapped in an Xcode project for Safari distribution

## Team Distribution

To share this extension with your team without publishing to the App Store, see **[DISTRIBUTION.md](DISTRIBUTION.md)** for detailed instructions.

Quick options:
- **Share Xcode project** - Team builds it themselves (requires Xcode)
- **Distribute pre-built app** - Easiest for end users (no Xcode needed)
- **Developer ID signed build** - Most professional (requires Apple Developer account)

## FAQ

**Q: What happens if my font doesn't have Semi Bold?**  
A: The extension will apply Bold instead. If Bold isn't available either, nothing happens (same as pressing an unavailable shortcut).

**Q: Why isn't it working?**  
A: Make sure you have text selected first. The extension only works on selected text, just like Cmd+B for Bold.

**Q: Is this safe to use?**  
A: Yes. The extension only triggers when you press Cmd+Ctrl+B and never modifies your document without your explicit action.

**Q: Will this interfere with other shortcuts?**  
A: No. Cmd+Ctrl+B isn't used by Google Docs or Safari by default. If you have another extension using this shortcut, they may conflict.

**Q: Can I customize the keyboard shortcut?**  
A: Not in version 1.0, but this can be added in future versions if there's demand.

**Q: Do I need to rebuild every time Safari updates?**  
A: No. Once built and enabled, the extension should continue working across Safari updates. You only need to rebuild if you make code changes.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Enable debug mode and check Safari's JavaScript Console
3. Report issues with details about your font and document state

## License

This extension is provided as-is for team use.

## Version History

- **1.0.0** (Initial Release)
  - Basic Semi Bold shortcut functionality
  - Fallback to Bold when Semi Bold unavailable
  - Silent error handling
  - Safari support

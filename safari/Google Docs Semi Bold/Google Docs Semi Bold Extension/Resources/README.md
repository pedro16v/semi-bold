# Google Docs Semi Bold Shortcut - Chrome Extension

A Chrome browser extension that adds a keyboard shortcut (Cmd+Ctrl+B on Mac, Ctrl+Alt+B on Windows/Linux) to quickly apply Semi Bold font weight in Google Docs.

## Features

- **Quick Shortcut**: Press `Cmd+Ctrl+B` (Mac) or `Ctrl+Alt+B` (Windows/Linux) to apply Semi Bold
- **Smart Fallback**: Automatically falls back to Bold if Semi Bold is not available for the current font
- **Silent Operation**: Never shows errors or interferes with your document
- **Professional Grade**: Built with reliability and team adoption in mind

## Installation

### Step 1: Enable Developer Mode

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Toggle **"Developer mode"** in the top-right corner

### Step 2: Load the Extension

1. Click **"Load unpacked"** button
2. Select the `chrome/` directory from this project
3. The extension should now appear in your extensions list

### Step 3: Verify Installation

1. Open a Google Docs document
2. Select some text
3. Press `Cmd+Option+Shift+B` (Mac) or `Ctrl+Alt+Shift+B` (Windows/Linux)
4. The selected text should become Semi Bold (or Bold if Semi Bold isn't available)

## Usage

1. **Select text** in your Google Docs document
2. **Press the shortcut**: `Cmd+Option+Shift+B` (Mac) or `Ctrl+Alt+Shift+B` (Windows/Linux)
3. The text will be formatted with Semi Bold weight (or Bold as fallback)

### Keyboard Shortcuts

- **Mac**: `Cmd+Option+Shift+B`
- **Windows/Linux**: `Ctrl+Alt+Shift+B`

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

### Extension doesn't activate

- Make sure you're on a Google Docs page (`docs.google.com/document/*`)
- Refresh the page after installing the extension
- Check that the extension is enabled in `chrome://extensions/`

### Shortcut doesn't work

- Make sure you have text selected first
- Verify you're in editing mode (not viewing or suggesting mode)
- Check that no other extension is using the same shortcut
- Try refreshing the Google Docs page

### Semi Bold not applied

- Check if your current font supports Semi Bold weight
- The extension will fall back to Bold if Semi Bold isn't available
- Some fonts may not have Semi Bold or Bold weights

### Console Errors

- Open Chrome DevTools (F12) and check the Console tab
- Look for messages prefixed with `[Semi Bold Extension]`
- Set `CONFIG.DEBUG = true` in `content.js` for detailed logging

## Development

### Project Structure

```
chrome/
├── manifest.json      # Extension configuration
├── content.js         # Main extension logic
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

### Debugging

To enable debug logging:

1. Open `content.js`
2. Change `DEBUG: false` to `DEBUG: true` in the CONFIG object
3. Reload the extension in `chrome://extensions/`
4. Open Chrome DevTools Console to see debug messages

### Testing Checklist

Before sharing with team, verify:

- [ ] Extension loads without errors
- [ ] Shortcut works with Montserrat font
- [ ] Falls back to Bold when Semi Bold unavailable
- [ ] No console errors appear
- [ ] Works with different font selections
- [ ] Doesn't interfere with native Google Docs shortcuts
- [ ] Works in editing, suggesting, and viewing modes

## FAQ

**Q: What happens if my font doesn't have Semi Bold?**  
A: The extension will apply Bold instead. If Bold isn't available either, nothing happens (same as pressing an unavailable shortcut).

**Q: Why isn't it working?**  
A: Make sure you have text selected first. The extension only works on selected text, just like Cmd+B for Bold.

**Q: Is this safe to use?**  
A: Yes. The extension only triggers when you press Cmd+Option+Shift+B and never modifies your document without your explicit action.

**Q: Will this interfere with other shortcuts?**  
A: No. Cmd+Option+Shift+B isn't used by Google Docs or Chrome by default. If you have another extension using this shortcut, they may conflict.

**Q: Can I customize the keyboard shortcut?**  
A: Not in version 1.0, but this can be added in future versions if there's demand.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Enable debug mode and check console logs
3. Report issues with details about your font and document state

## License

This extension is provided as-is for team use.

## Version History

- **1.0.0** (Initial Release)
  - Basic Semi Bold shortcut functionality
  - Fallback to Bold when Semi Bold unavailable
  - Silent error handling
  - Chrome support

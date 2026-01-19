# Testing Guide

## Quick Verification

### 1. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `chrome/` directory
5. Verify the extension appears in the list (may show a warning about missing icons - this is OK)

### 2. Test Basic Functionality

1. Open a new Google Docs document: https://docs.google.com/document/create
2. Type some text and select it
3. Change the font to **Montserrat** (if not already set)
4. Press `Cmd+Option+Shift+B` (Mac) or `Ctrl+Alt+Shift+B` (Windows/Linux)
5. The text should become Semi Bold

### 3. Test Fallback Behavior

1. Select text with **Arial** font (which doesn't have Semi Bold)
2. Press `Cmd+Option+Shift+B` (Mac) or `Ctrl+Alt+Shift+B` (Windows/Linux)
3. The text should become Bold (fallback)

### 4. Test Silent Failure

1. Don't select any text
2. Press `Cmd+Option+Shift+B` (Mac) or `Ctrl+Alt+Shift+B` (Windows/Linux)
3. Nothing should happen (no errors, no alerts)

## Debug Mode

To enable detailed logging:

1. Open `chrome/content.js`
2. Find `DEBUG: false` and change to `DEBUG: true`
3. Reload the extension in `chrome://extensions/`
4. Open Chrome DevTools (F12) → Console tab
5. Look for messages prefixed with `[Semi Bold Extension]`

## Common Issues

### Extension doesn't load
- Check that `manifest.json` is valid JSON
- Verify all files are in the correct location
- Check Chrome's error console in `chrome://extensions/`

### Shortcut doesn't work
- Make sure you're on a Google Docs page (`docs.google.com/document/*`)
- Verify text is selected
- Check browser console for errors
- Try refreshing the page

### Icons warning
- This is expected if icon files don't exist
- Extension will still work
- Add icon files to `icons/` directory to remove warning

## Next Steps

After basic testing:
1. Test with different fonts (see PRD testing checklist)
2. Test edge cases (no selection, different document modes)
3. Test performance (rapid keypresses, large documents)
4. Verify no console errors appear

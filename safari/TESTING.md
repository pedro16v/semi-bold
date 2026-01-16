# Testing Guide - Safari Extension

## Quick Verification

### 1. Build and Load Extension in Safari

1. Open the Xcode project:
   ```bash
   cd safari
   open "Google Docs Semi Bold/Google Docs Semi Bold.xcodeproj"
   ```

2. Build the project (`Cmd+B` in Xcode)

3. Run the app once (`Cmd+R`) to register the extension with Safari

4. Enable Safari developer features:
   - Safari → Settings → Advanced → Check "Show Develop menu in menu bar"
   - Develop → Allow Unsigned Extensions

5. Enable the extension:
   - Safari → Settings → Extensions
   - Enable "Google Docs Semi Bold"

6. Verify the extension appears in the Extensions list

### 2. Test Basic Functionality

1. Open a new Google Docs document: https://docs.google.com/document/create
2. Type some text and select it
3. Change the font to **Montserrat** (if not already set)
4. Press `Cmd+Ctrl+B`
5. The text should become Semi Bold

### 3. Test Fallback Behavior

1. Select text with **Arial** font (which doesn't have Semi Bold)
2. Press `Cmd+Ctrl+B`
3. The text should become Bold (fallback)

### 4. Test Silent Failure

1. Don't select any text
2. Press `Cmd+Ctrl+B`
3. Nothing should happen (no errors, no alerts)

## Debug Mode

To enable detailed logging:

1. Open `Google Docs Semi Bold Extension/Resources/content.js` in Xcode
2. Find `DEBUG: false` and change to `DEBUG: true`
3. Rebuild the project (`Cmd+B`)
4. Run the app once (`Cmd+R`) to re-register
5. Open Safari's JavaScript Console: **Develop → Show JavaScript Console**
6. Look for messages prefixed with `[Semi Bold Extension]`

## Common Issues

### Extension doesn't appear in Safari Settings

- Make sure you've built and run the app in Xcode at least once
- Check that the build succeeded without errors
- Try restarting Safari
- Verify the Xcode project builds successfully

### Extension doesn't load

- Check that `manifest.json` is valid JSON
- Verify all files are in `Google Docs Semi Bold Extension/Resources/`
- Check Xcode build logs for errors
- Ensure the extension target is included in the build

### Shortcut doesn't work

- Make sure you're on a Google Docs page (`docs.google.com/document/*`)
- Verify text is selected
- Check Safari's JavaScript Console (Develop → Show JavaScript Console) for errors
- Try refreshing the page
- Verify the extension is enabled in Safari → Settings → Extensions
- Check that "Allow Unsigned Extensions" is enabled

### Build errors in Xcode

- Verify Xcode 12.0 or later is installed
- Check that the project opens without errors
- Try cleaning the build folder: **Product → Clean Build Folder** (`Cmd+Shift+K`)
- Rebuild the project
- Check Xcode's Issue Navigator for specific errors

### Extension not activating

- Make sure you've enabled the extension in Safari → Settings → Extensions
- Verify "Allow Unsigned Extensions" is enabled in Develop menu
- Try disabling and re-enabling the extension
- Restart Safari

## Safari-Specific Testing

### Test Extension Registration

1. Build and run the app in Xcode
2. Check Safari → Settings → Extensions
3. Verify "Google Docs Semi Bold" appears in the list
4. Enable it and verify it stays enabled after Safari restart

### Test Console Logging

1. Enable debug mode (see Debug Mode above)
2. Open Safari's JavaScript Console: **Develop → Show JavaScript Console**
3. Navigate to a Google Docs page
4. Press `Cmd+Ctrl+B` with text selected
5. Verify debug messages appear in the console

### Test Extension Persistence

1. Enable the extension
2. Quit Safari completely
3. Reopen Safari
4. Verify the extension is still enabled
5. Test that the shortcut still works

## Next Steps

After basic testing:
1. Test with different fonts (see PRD testing checklist)
2. Test edge cases (no selection, different document modes)
3. Test performance (rapid keypresses, large documents)
4. Verify no console errors appear in Safari's JavaScript Console
5. Test that the extension works after Safari updates

## Comparison with Chrome Version

The Safari extension should behave identically to the Chrome version:

- Same keyboard shortcut: `Cmd+Ctrl+B`
- Same fallback behavior (Semi Bold → Bold)
- Same silent failure handling
- Same font compatibility

Key differences:
- Installation method (Xcode build vs. Chrome's "Load unpacked")
- Debug console location (Safari's JavaScript Console vs. Chrome DevTools)
- Extension management (Safari Settings vs. Chrome Extensions page)

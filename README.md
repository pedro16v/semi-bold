# Semi Bold Browser Extension

Browser extensions for Chrome and Safari that add a keyboard shortcut to quickly apply Semi Bold font weight in Google Docs.

## Overview

This extension enables `Cmd+Ctrl+B` (Mac) to apply Semi Bold formatting to selected text in Google Docs, eliminating the need to navigate through multiple menu clicks.

## Features

- Quick keyboard shortcut for Semi Bold formatting
- Automatic fallback to Bold if Semi Bold is unavailable
- Silent operation with no error dialogs
- Works with fonts that support Semi Bold weight

## Installation

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked"
4. Select the `chrome/` directory from this project
5. The extension is now active on Google Docs pages

### Safari

1. Open the Xcode project in `safari/Google Docs Semi Bold/Google Docs Semi Bold.xcodeproj`
2. Build and run the project (`Cmd+B` then `Cmd+R`)
3. Enable Safari developer features: **Safari → Settings → Advanced → Show Develop menu**
4. Allow unsigned extensions: **Develop → Allow Unsigned Extensions**
5. Enable the extension: **Safari → Settings → Extensions → Enable "Google Docs Semi Bold"**

See [Safari README](safari/README.md) for detailed installation instructions.

## Usage

1. Select text in a Google Docs document
2. Press `Cmd+Ctrl+B` (Mac)
3. The text will be formatted with Semi Bold weight (or Bold as fallback)

## Documentation

- [Chrome Extension README](chrome/README.md) - Detailed Chrome installation and usage instructions
- [Safari Extension README](safari/README.md) - Detailed Safari installation and usage instructions
- [Safari Distribution Guide](safari/DISTRIBUTION.md) - How to share Safari extension with your team
- [Product Requirements Document](semi-bold-PRD.md) - Complete project specifications
- [Chrome Testing Guide](chrome/TESTING.md) - Chrome testing procedures
- [Safari Testing Guide](safari/TESTING.md) - Safari testing procedures

## Project Structure

```
semi-bold/
├── chrome/              # Chrome extension files
│   ├── manifest.json    # Extension configuration
│   ├── content.js       # Main extension logic
│   ├── background.js    # Background service worker
│   └── icons/           # Extension icons
├── safari/              # Safari extension (Xcode project)
│   ├── Google Docs Semi Bold/
│   │   ├── Google Docs Semi Bold Extension/
│   │   │   └── Resources/  # Extension files (manifest.json, content.js, icons)
│   │   └── Google Docs Semi Bold.xcodeproj/
│   ├── README.md        # Safari installation instructions
│   └── TESTING.md       # Safari testing guide
├── semi-bold-PRD.md     # Product requirements document
└── README.md            # This file
```

## License

This extension is provided as-is for team use.

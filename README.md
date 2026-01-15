# Semi Bold Chrome Extension

A Chrome browser extension that adds a keyboard shortcut to quickly apply Semi Bold font weight in Google Docs.

## Overview

This extension enables `Cmd+Option+Shift+B` (Mac) or `Ctrl+Alt+Shift+B` (Windows/Linux) to apply Semi Bold formatting to selected text in Google Docs, eliminating the need to navigate through multiple menu clicks.

## Features

- Quick keyboard shortcut for Semi Bold formatting
- Automatic fallback to Bold if Semi Bold is unavailable
- Silent operation with no error dialogs
- Works with fonts that support Semi Bold weight

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked"
4. Select the `chrome/` directory from this project
5. The extension is now active on Google Docs pages

## Usage

1. Select text in a Google Docs document
2. Press `Cmd+Option+Shift+B` (Mac) or `Ctrl+Alt+Shift+B` (Windows/Linux)
3. The text will be formatted with Semi Bold weight (or Bold as fallback)

## Documentation

- [Chrome Extension README](chrome/README.md) - Detailed installation and usage instructions
- [Product Requirements Document](semi-bold-PRD.md) - Complete project specifications
- [Testing Guide](chrome/TESTING.md) - Testing procedures and checklist

## Project Structure

```
semi-bold/
├── chrome/              # Chrome extension files
│   ├── manifest.json    # Extension configuration
│   ├── content.js       # Main extension logic
│   ├── background.js    # Background service worker
│   └── icons/           # Extension icons
├── semi-bold-PRD.md     # Product requirements document
└── README.md            # This file
```

## License

This extension is provided as-is for team use.

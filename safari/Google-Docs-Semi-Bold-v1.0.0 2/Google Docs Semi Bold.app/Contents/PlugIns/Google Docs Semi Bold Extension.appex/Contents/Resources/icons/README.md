# Extension Icons

This directory should contain three PNG icon files:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can create simple placeholder icons using:

1. **Online tools**: Use an icon generator like [favicon.io](https://favicon.io) or similar
2. **Design software**: Create icons in Figma, Sketch, or Photoshop
3. **Command line**: Use ImageMagick or similar tools

### Quick Placeholder Icons

For development/testing, you can create simple colored squares:

```bash
# Using ImageMagick (if installed)
convert -size 16x16 xc:#4285F4 icon16.png
convert -size 48x48 xc:#4285F4 icon48.png
convert -size 128x128 xc:#4285F4 icon128.png
```

Or use any simple icon representing "Bold" or "Semi Bold" formatting.

The extension will work without icons, but Chrome will show a default placeholder icon.

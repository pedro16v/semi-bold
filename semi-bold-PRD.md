# Product Requirements Document: Google Docs Semi Bold Keyboard Shortcut Extension

## Overview

Browser extensions for Chrome and Safari that enable a keyboard shortcut (Cmd+Shift+B) to apply Semi Bold font weight in Google Docs, eliminating the need to manually navigate through multiple menu clicks.

## Problem Statement

In Google Docs, applying Semi Bold font weight requires:
1. Clicking the font dropdown
2. Hovering/clicking on the current font to expand submenu
3. Clicking "Semi Bold" from the weight options

This multi-step process is time-consuming for bulk formatting tasks. While Bold has a keyboard shortcut (Cmd+B), Semi Bold does not.

## Team Adoption Requirements

### Reliability Standards

This extension must meet professional-grade reliability for team adoption:

**Zero User-Facing Errors:**
- No alert() dialogs
- No console.error() in production
- No broken document functionality
- No interference with native shortcuts

**Graceful Degradation:**
- If Semi Bold unavailable → Fall back to Bold
- If Bold unavailable → Do nothing
- If menus fail → Cancel silently
- If any error → Log debug info only

**Performance:**
- Response time <500ms in 95% of cases
- No document lag or freezing
- Clean memory management (no leaks)
- Minimal CPU usage when idle

### Pre-Release Testing Protocol

Before sharing with team:

1. **Stress Testing:**
   - Test with 10+ different fonts
   - Test with fonts that lack Semi Bold (Arial, Times New Roman, Courier)
   - Test rapid repeated keypresses
   - Test with very large documents (50+ pages)
   - Test with poor network conditions

2. **Compatibility Testing:**
   - Verify on Chrome (latest version)
   - Verify on Safari (latest version)
   - Test on different macOS versions
   - Test with other common extensions enabled

3. **Edge Case Testing:**
   - Switch fonts mid-document
   - Use in comments mode
   - Use in suggestion mode
   - Use while document is loading
   - Use with multiple Google Docs tabs open

4. **Silent Failure Verification:**
   - Disconnect network mid-operation
   - Rapidly switch between tabs during operation
   - Check console for any errors
   - Verify document never breaks

### Team Rollout Strategy

**Phase 1: Alpha (Week 1)**
- Deploy to 1-2 power users
- Gather feedback daily
- Monitor for any issues
- Quick iteration on problems

**Phase 2: Beta (Week 2)**
- Deploy to 5-10 team members
- Create feedback channel (Slack/email)
- Document any font-specific issues
- Build FAQ based on questions

**Phase 3: General Release (Week 3+)**
- Share with entire team
- Provide clear installation instructions
- Set expectations about font compatibility
- Maintain support channel

### Support Documentation for Team

**Installation Guide:**
- Clear step-by-step with screenshots
- Separate guides for Chrome and Safari
- Troubleshooting common issues
- How to report bugs

**User Guide:**
- What the extension does
- Keyboard shortcut reminder
- Which fonts support Semi Bold
- What to expect when Semi Bold unavailable
- How to disable extension if needed

**FAQ Section:**
```
Q: What happens if my font doesn't have Semi Bold?
A: The extension will apply Bold instead. If Bold isn't available either, 
   nothing happens (same as pressing an unavailable shortcut).

Q: Why isn't it working?
A: Make sure you have text selected first. The extension only works on 
   selected text, just like Cmd+B for Bold.

Q: Is this safe to use?
A: Yes. The extension only triggers when you press Cmd+Shift+B and never 
   modifies your document without your explicit action.

Q: Will this interfere with other shortcuts?
A: No. Cmd+Shift+B isn't used by Google Docs by default. If you have 
   another extension using this shortcut, they may conflict.

Q: Can I customize the keyboard shortcut?
A: Not in version 1.0, but we can add this if there's demand.
```

## Goals

- Enable Cmd+Shift+B to apply Semi Bold font weight to selected text in Google Docs
- Support both Chrome and Safari browsers with separate extensions
- Work reliably with Montserrat font (user's primary font)
- Provide smooth, native-feeling interaction without noticeable lag

## Non-Goals

- Support for other Google Workspace applications (Slides, Sheets)
- Custom font weight selection beyond Semi Bold
- Configurable keyboard shortcuts (can be added later)
- Support for other fonts beyond Montserrat initially (though code should be flexible)

## User Stories

### Primary Use Case
**As a** Google Docs user who frequently formats text with Semi Bold,
**I want** a keyboard shortcut to apply Semi Bold font weight,
**So that** I can format documents quickly without repetitive menu navigation.

### Success Criteria
- User selects text in Google Docs
- User presses Cmd+Shift+B
- Selected text changes to Semi Bold weight
- Process completes in <500ms
- Works consistently across document sessions

## Technical Requirements

### Architecture

#### Chrome Extension
- **Manifest Version:** 3
- **Permissions Required:**
  - `activeTab` - to interact with current Google Docs tab
  - No additional permissions needed (content script only)
- **Components:**
  - `manifest.json` - extension configuration
  - `content.js` - main logic, injected into Google Docs pages
  - `README.md` - installation and usage instructions

#### Safari Extension
- **Format:** Safari Web Extension (Xcode project)
- **Minimum Safari Version:** Safari 14+ (macOS 11+)
- **Components:**
  - Xcode project structure
  - `manifest.json` - identical to Chrome where possible
  - `content.js` - shared with Chrome version
  - Swift wrapper files (minimal, auto-generated by Xcode)
  - `README.md` - Safari-specific installation instructions

### Implementation Details

#### Keyboard Shortcut Handling
```javascript
// Listen for Cmd+Shift+B (Mac) or Ctrl+Shift+B (Windows/Linux)
document.addEventListener('keydown', (event) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? event.metaKey : event.ctrlKey;
  
  if (modifierKey && event.shiftKey && event.key === 'B') {
    event.preventDefault();
    event.stopPropagation();
    applySemiBold();
  }
});
```

#### Semi Bold Application Strategy

**Option A: UI Automation (Recommended)**
Programmatically trigger clicks through the Google Docs menu system:

1. Detect current font from selection
2. Find and click font dropdown button
3. Wait for menu to appear
4. Find font submenu (e.g., "Montserrat")
5. Hover/click to expand weight options
6. Click "Semi Bold" option

**Challenges:**
- Google Docs uses complex DOM structure with dynamic class names
- Need to use stable selectors (aria-labels, data attributes)
- Requires careful timing/waiting for menu animations

**Option B: Document Command API**
Investigate if Google Docs exposes any command execution API:
- Check for `document.execCommand()` extensions
- Look for Google Docs internal API hooks
- Likely not available publicly

**Recommendation:** Start with Option A as it's more reliable and doesn't depend on undocumented APIs.

#### DOM Selectors Strategy

Google Docs uses obfuscated class names that change. Use stable selectors:

```javascript
// Example stable selectors (need to verify current structure)
const SELECTORS = {
  fontDropdown: '[aria-label*="Font"]',
  fontMenu: '[role="menu"]',
  fontOption: (fontName) => `[role="menuitem"][aria-label*="${fontName}"]`,
  weightOption: (weight) => `[role="menuitem"][aria-label*="${weight}"]`,
};
```

**Implementation Requirements:**
- Use MutationObserver to wait for menu elements to appear
- Add timeout fallbacks (2-3 seconds)
- Log errors to console for debugging
- Handle cases where menus don't appear

#### Cross-Browser Compatibility

**Shared Code:**
- Core logic in `content.js` should be identical
- Use vanilla JavaScript (no framework dependencies)
- Avoid browser-specific APIs

**Browser-Specific Considerations:**

*Chrome:*
- Standard Web Extensions API
- Easy developer mode installation
- Can use Chrome Extension API if needed

*Safari:*
- Requires Xcode wrapper
- Must enable "Allow Unsigned Extensions" for development
- Limited debugging tools compared to Chrome

### URL Matching

Extensions should only activate on Google Docs URLs:

```json
"content_scripts": [
  {
    "matches": [
      "https://docs.google.com/document/*"
    ],
    "js": ["content.js"],
    "run_at": "document_idle"
  }
]
```

### Error Handling & Safeguards

**Critical Requirement:** Extension must NEVER show errors to users or break document functionality. All failures should be silent and graceful.

#### Safeguard Hierarchy

**Level 1: Prevention**
- Validate environment before attempting action
- Check for text selection
- Verify we're in editing mode (not suggesting/viewing)
- Confirm font dropdown is accessible

**Level 2: Detection**
- Check if current font supports Semi Bold weight
- Detect if menus are already open
- Verify DOM elements exist before interacting
- Timeout all async operations

**Level 3: Graceful Degradation**
- If Semi Bold unavailable → Try Bold → Do nothing
- If menus don't appear → Silently cancel operation
- If timing issues → Retry once, then fail silently
- If any error → Log to console only, never alert user

#### Specific Error Scenarios

1. **Semi Bold Not Available for Current Font**
   ```javascript
   // Check if Semi Bold exists in the weight menu
   const weights = getAvailableWeights();
   if (!weights.includes('Semi Bold')) {
     // Option A: Try Bold as fallback
     if (weights.includes('Bold')) {
       applyWeight('Bold');
       console.log('[Semi Bold Extension] Semi Bold unavailable, applied Bold instead');
       return;
     }
     // Option B: Do nothing silently
     console.log('[Semi Bold Extension] Neither Semi Bold nor Bold available for this font');
     return;
   }
   ```

2. **No Text Selected:**
   - Check selection before starting
   - Exit silently (match Cmd+B behavior)
   ```javascript
   const selection = window.getSelection();
   if (!selection || selection.toString().length === 0) {
     return; // Silent exit, no logging needed
   }
   ```

3. **Menu Not Found / DOM Changes:**
   - All querySelector calls wrapped in try-catch
   - Return null instead of throwing errors
   - Log debug info to console (prefixed with extension name)
   ```javascript
   function findElement(selector, timeout = 2000) {
     try {
       // ... implementation
     } catch (error) {
       console.debug('[Semi Bold Extension] Element not found:', selector);
       return null;
     }
   }
   ```

4. **Timing / Race Conditions:**
   - Maximum 2 second timeout on all operations
   - Single retry allowed on failure
   - Clean up all observers/listeners on timeout
   ```javascript
   const MAX_WAIT = 2000;
   const RETRY_ONCE = true;
   
   async function applySemiBoldWithRetry() {
     try {
       await applySemiBold();
     } catch (error) {
       if (RETRY_ONCE) {
         console.debug('[Semi Bold Extension] Retrying...');
         try {
           await applySemiBold();
         } catch (retryError) {
           console.debug('[Semi Bold Extension] Failed after retry, aborting silently');
         }
       }
     }
   }
   ```

5. **Extension Conflicts:**
   - Check if another extension is modifying the same shortcuts
   - Use `event.stopImmediatePropagation()` to prevent conflicts
   - Add small delay before acting to let native handlers run first

6. **Document Not Ready:**
   - Wait for document to be fully loaded
   - Check for Google Docs canvas/editor presence
   - Don't activate keyboard listener until ready
   ```javascript
   function isDocumentReady() {
     return document.querySelector('.kix-appview-editor') !== null;
   }
   
   // Wait for document before attaching listeners
   if (isDocumentReady()) {
     attachKeyboardListener();
   } else {
     const observer = new MutationObserver(() => {
       if (isDocumentReady()) {
         observer.disconnect();
         attachKeyboardListener();
       }
     });
     observer.observe(document.body, { childList: true, subtree: true });
   }
   ```

7. **User Typing During Operation:**
   - Check if operation is already in progress
   - Prevent multiple simultaneous triggers
   ```javascript
   let operationInProgress = false;
   
   function handleKeyPress(event) {
     if (operationInProgress) {
       return; // Silently ignore
     }
     operationInProgress = true;
     try {
       await applySemiBold();
     } finally {
       operationInProgress = false;
     }
   }
   ```

#### Logging Strategy

**Console Logging Levels:**
- `console.debug()` - Routine operations, element searches (hidden by default)
- `console.log()` - Successful operations (optional, can be disabled)
- `console.warn()` - Degraded functionality (fallbacks used)
- `console.error()` - Should NEVER appear in production (only during development)

**All logs prefixed with:** `[Semi Bold Extension]` for easy filtering

**Debug Mode:**
```javascript
const DEBUG = false; // Set to true for development

function log(message, level = 'debug') {
  if (!DEBUG && level === 'debug') return;
  console[level](`[Semi Bold Extension] ${message}`);
}
```

#### User-Facing Behavior

**What users should experience:**
- Press Cmd+Shift+B → Text becomes Semi Bold (if available)
- Press Cmd+Shift+B → Text becomes Bold (if Semi Bold unavailable)
- Press Cmd+Shift+B → Nothing happens (if neither available)
- **Never:** Error messages, alerts, console errors, or broken document

**Silent failure is success** - The extension should be invisible when it can't help.

### Performance Considerations

- Minimize DOM queries (cache selectors where possible)
- Debounce keyboard events if user holds keys
- Remove event listeners when extension is disabled
- Keep extension size minimal (<50KB total)

## Project Structure

```
google-docs-semibold-extension/
├── chrome/
│   ├── manifest.json
│   ├── content.js
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── README.md
├── safari/
│   ├── GoogleDocsSemiBold/          # Xcode project
│   │   ├── manifest.json
│   │   ├── content.js               # Symlink to chrome/content.js
│   │   ├── Resources/
│   │   └── [Xcode project files]
│   └── README.md
├── shared/
│   └── content.js                    # Actual shared implementation
└── PRD.md
```

**Note:** Use symlinks or build script to keep `content.js` synchronized between Chrome and Safari versions.

## Installation Instructions (for README)

### Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chrome/` directory
5. Extension is now active on Google Docs

### Safari
1. Open Terminal and enable Safari developer features:
   ```bash
   xcodebuild -version  # Verify Xcode is installed
   ```
2. Open the Xcode project in `safari/GoogleDocsSemiBold/`
3. Build the project (Cmd+B)
4. Open Safari → Preferences → Advanced
5. Check "Show Develop menu in menu bar"
6. Develop → Allow Unsigned Extensions
7. Safari → Preferences → Extensions
8. Enable "Google Docs Semi Bold" extension
9. Extension is now active on Google Docs

## Testing Plan

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Extension loads without errors in Chrome
- [ ] Extension loads without errors in Safari
- [ ] Cmd+Shift+B applies Semi Bold to selected text (Montserrat)
- [ ] Works with single word selection
- [ ] Works with multi-paragraph selection
- [ ] Works with partial word selection
- [ ] Shortcut doesn't interfere with native Google Docs shortcuts

**Font Compatibility (CRITICAL):**
- [ ] Montserrat → Semi Bold applied correctly
- [ ] Arial → Falls back to Bold (no Semi Bold available)
- [ ] Times New Roman → Falls back to Bold
- [ ] Roboto → Semi Bold applied correctly
- [ ] Courier New → Falls back to Bold or does nothing
- [ ] Comic Sans → Handles gracefully (no Semi Bold)
- [ ] Lora → Semi Bold applied correctly
- [ ] Font without Bold or Semi Bold → Does nothing silently
- [ ] Custom Google Fonts → Test at least 3 different fonts
- [ ] Switching fonts mid-document → Works correctly

**Silent Failure Testing (CRITICAL):**
- [ ] No console.error() messages appear
- [ ] No alert() or popup dialogs shown
- [ ] Document never becomes unresponsive
- [ ] Can continue typing immediately after shortcut
- [ ] Undo (Cmd+Z) works correctly after applying
- [ ] No JavaScript errors in console (check F12 developer tools)

**Edge Cases:**
- [ ] No text selected → Does nothing (no error)
- [ ] Multiple non-contiguous selections → Handles gracefully
- [ ] Text already in Semi Bold → Idempotent (no change)
- [ ] Text already in Bold → Changes to Semi Bold if available
- [ ] Font without Semi Bold weight → Falls back properly
- [ ] Rapid repeated keypress → Doesn't queue multiple operations
- [ ] Menu already open → Closes gracefully or completes action
- [ ] Pressing shortcut while menus are animating → Handles gracefully

**Document States:**
- [ ] Works in editing mode
- [ ] Does nothing in suggesting mode (or handles gracefully)
- [ ] Does nothing in viewing mode (or handles gracefully)
- [ ] Works in documents with comments
- [ ] Works in documents with tracked changes
- [ ] Works immediately after document loads
- [ ] Works during document loading (or waits gracefully)
- [ ] Works in very large documents (50+ pages)
- [ ] Works in documents with images and tables

**Browser Compatibility:**
- [ ] Chrome on macOS (Cmd+Shift+B)
- [ ] Chrome on Windows (Ctrl+Shift+B)
- [ ] Safari on macOS (Cmd+Shift+B)
- [ ] Works in incognito/private mode
- [ ] Works with other common extensions enabled (Grammarly, etc.)

**Performance:**
- [ ] Extension doesn't slow down document loading
- [ ] Shortcut responds within 500ms (normal case)
- [ ] Shortcut responds within 2000ms (worst case)
- [ ] No memory leaks after 100+ uses
- [ ] Console performance profiling shows no issues
- [ ] CPU usage remains low when idle

**Network Conditions:**
- [ ] Works with fast internet
- [ ] Works with slow internet
- [ ] Works offline (once document is loaded)
- [ ] Handles intermittent connectivity gracefully

**User Experience:**
- [ ] Action feels natural and responsive
- [ ] No visible UI glitches or flashing
- [ ] Selection remains intact after action
- [ ] Cursor position doesn't jump unexpectedly
- [ ] Works consistently across multiple sessions
- [ ] Doesn't conflict with autocomplete/suggestions

**Installation & Updates:**
- [ ] Installation instructions are clear and accurate
- [ ] Extension activates immediately after installation
- [ ] Extension survives browser restart
- [ ] Extension survives browser updates
- [ ] Can be disabled/enabled without issues
- [ ] Can be uninstalled cleanly

### Automated Testing (Future)

Consider adding automated tests for:
- Font detection algorithm
- Fallback logic (Semi Bold → Bold → Nothing)
- Keyboard event handling
- DOM selector robustness
- Timeout behavior

### Beta Testing Metrics

Track during beta phase:
- Success rate (shortcut works / total attempts)
- Fonts used (to prioritize compatibility)
- Failure modes (what errors occur)
- Performance (average response time)
- User satisfaction (survey/feedback)

## Future Enhancements

### Phase 2 (Optional)
- Configurable keyboard shortcuts via options page
- Support for other font weights (Medium, Extra Bold, etc.)
- Visual feedback/notification when action completes
- Support for other fonts beyond Montserrat
- Analytics/usage tracking (privacy-respecting)

### Phase 3 (Optional)
- Support for Google Slides
- Support for Google Sheets
- Font preset system (save favorite font + weight combinations)
- Team/organization deployment via Chrome Web Store

## Success Metrics

- Extension successfully applies Semi Bold in >95% of attempts
- User reports significant time savings in document formatting
- No reported bugs in core functionality after 2 weeks of use
- Extension maintains compatibility with Google Docs updates

## Dependencies

- **Chrome:** Version 88+ (Manifest V3 support)
- **Safari:** Version 14+ (macOS 11+)
- **Xcode:** 12+ (for Safari extension development)
- **Node.js:** Not required (vanilla JavaScript only)

## Development Timeline

Estimated effort: 4-8 hours

- **Chrome extension:** 2-3 hours
  - 1 hour: Basic structure and keyboard listener
  - 1 hour: DOM navigation and Semi Bold application
  - 0.5 hour: Testing and refinement
  - 0.5 hour: Documentation

- **Safari extension:** 2-3 hours
  - 1 hour: Xcode project setup
  - 0.5 hour: Code adaptation (minimal if using shared content.js)
  - 1 hour: Testing and Safari-specific fixes
  - 0.5 hour: Documentation

- **Polish and documentation:** 1-2 hours

## Open Questions

1. Should the extension work with fonts other than Montserrat?
   - **Decision:** Yes, but Montserrat is priority for testing

2. What should happen if Semi Bold isn't available for the current font?
   - **Decision:** Fall back to Bold and log a warning

3. Should there be visual feedback when the shortcut is triggered?
   - **Decision:** Not in MVP, can add later if needed

4. Windows/Linux support for Chrome?
   - **Decision:** Yes, use Ctrl+Shift+B on non-Mac platforms

## Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Google Docs DOM changes break extension | High | Medium | Use stable selectors (aria-labels), add version checking |
| Menus don't appear due to timing issues | Medium | Medium | Add robust waiting logic with timeouts |
| Conflicts with other extensions | Low | Low | Use event.stopPropagation() carefully |
| Safari signing/notarization complexity | Medium | Low | Document unsigned extension workflow clearly |
| Poor performance with large documents | Low | Low | Optimize DOM queries, test with large docs |

## Approval and Sign-off

**Author:** Pedro
**Created:** January 15, 2026
**Status:** Ready for Development

---

## Appendix: Google Docs DOM Investigation

### Research Tasks for Implementation

Before coding, investigate current Google Docs structure:

1. Open Google Docs with developer tools
2. Inspect font dropdown button and note:
   - Element type and attributes
   - Stable identifiers (aria-label, data-* attributes)
   - Parent container structure

3. Click through to Semi Bold and document:
   - Menu container structure
   - Font submenu items
   - Weight option items
   - Any animation/transition timings

4. Test with different fonts to confirm:
   - Menu structure is consistent
   - Semi Bold is labeled consistently

5. Document findings in implementation notes

### Example Implementation with All Safeguards

```javascript
// Configuration
const CONFIG = {
  DEBUG: false,
  MAX_WAIT_MS: 2000,
  RETRY_ON_FAIL: true,
  MENU_ANIMATION_DELAY_MS: 150,
  FALLBACK_TO_BOLD: true
};

// State management
let operationInProgress = false;
let extensionReady = false;

// Logging utility
function log(message, level = 'debug') {
  if (!CONFIG.DEBUG && level === 'debug') return;
  const prefix = '[Semi Bold Extension]';
  console[level](`${prefix} ${message}`);
}

// Initialize extension
function initialize() {
  if (!isGoogleDocsEditor()) {
    log('Not a Google Docs editor, extension inactive', 'debug');
    return;
  }
  
  if (isDocumentReady()) {
    attachKeyboardListener();
    extensionReady = true;
    log('Extension initialized', 'debug');
  } else {
    waitForDocumentReady().then(() => {
      attachKeyboardListener();
      extensionReady = true;
      log('Extension initialized after document ready', 'debug');
    });
  }
}

// Environment checks
function isGoogleDocsEditor() {
  return window.location.hostname === 'docs.google.com' &&
         window.location.pathname.includes('/document/');
}

function isDocumentReady() {
  return document.querySelector('.kix-appview-editor') !== null;
}

function waitForDocumentReady() {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (isDocumentReady()) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Failsafe timeout
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 10000);
  });
}

// Keyboard listener
function attachKeyboardListener() {
  document.addEventListener('keydown', handleKeyPress, true);
  log('Keyboard listener attached', 'debug');
}

function handleKeyPress(event) {
  // Check for Cmd+Shift+B (Mac) or Ctrl+Shift+B (Windows/Linux)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? event.metaKey : event.ctrlKey;
  
  if (!modifierKey || !event.shiftKey || event.key !== 'B') {
    return; // Not our shortcut
  }
  
  // Prevent default and stop propagation
  event.preventDefault();
  event.stopImmediatePropagation();
  
  // Check if operation already in progress
  if (operationInProgress) {
    log('Operation already in progress, ignoring', 'debug');
    return;
  }
  
  // Execute with safeguards
  executeSemiBoldAction();
}

async function executeSemiBoldAction() {
  operationInProgress = true;
  
  try {
    // Pre-flight checks
    if (!hasTextSelection()) {
      log('No text selected, exiting', 'debug');
      return;
    }
    
    if (!isEditingMode()) {
      log('Not in editing mode, exiting', 'debug');
      return;
    }
    
    // Attempt to apply Semi Bold
    const success = await applySemiBold();
    
    if (!success && CONFIG.RETRY_ON_FAIL) {
      log('First attempt failed, retrying once', 'debug');
      await sleep(200);
      await applySemiBold();
    }
    
  } catch (error) {
    // Silent failure - just log
    log(`Operation failed: ${error.message}`, 'debug');
  } finally {
    operationInProgress = false;
  }
}

// Core functionality
async function applySemiBold() {
  try {
    // Step 1: Get current font
    const currentFont = getCurrentFont();
    if (!currentFont) {
      log('Could not determine current font', 'debug');
      return false;
    }
    
    log(`Current font: ${currentFont}`, 'debug');
    
    // Step 2: Open font dropdown
    const fontDropdown = findFontDropdown();
    if (!fontDropdown) {
      log('Font dropdown not found', 'debug');
      return false;
    }
    
    fontDropdown.click();
    log('Clicked font dropdown', 'debug');
    
    // Step 3: Wait for menu to appear
    const menu = await waitForElement('[role="menu"]', CONFIG.MAX_WAIT_MS);
    if (!menu) {
      log('Font menu did not appear', 'debug');
      return false;
    }
    
    await sleep(CONFIG.MENU_ANIMATION_DELAY_MS);
    
    // Step 4: Find and interact with font option
    const fontOption = findFontOption(currentFont);
    if (!fontOption) {
      log(`Font option for ${currentFont} not found`, 'debug');
      closeMenus();
      return false;
    }
    
    // Trigger hover to show weight submenu
    fontOption.dispatchEvent(new MouseEvent('mouseover', { 
      bubbles: true,
      cancelable: true 
    }));
    
    await sleep(CONFIG.MENU_ANIMATION_DELAY_MS);
    
    // Step 5: Get available weights
    const availableWeights = getAvailableWeights();
    log(`Available weights: ${availableWeights.join(', ')}`, 'debug');
    
    // Step 6: Apply weight with fallback logic
    if (availableWeights.includes('Semi Bold')) {
      return clickWeightOption('Semi Bold');
    } else if (CONFIG.FALLBACK_TO_BOLD && availableWeights.includes('Bold')) {
      log('Semi Bold not available, falling back to Bold', 'log');
      return clickWeightOption('Bold');
    } else {
      log('Neither Semi Bold nor Bold available', 'log');
      closeMenus();
      return false;
    }
    
  } catch (error) {
    log(`Error in applySemiBold: ${error.message}`, 'debug');
    closeMenus();
    return false;
  }
}

// Helper functions
function hasTextSelection() {
  const selection = window.getSelection();
  return selection && selection.toString().length > 0;
}

function isEditingMode() {
  // Check if document is in editing mode (not suggesting/viewing)
  const modeIndicator = document.querySelector('[aria-label*="Editing mode"]');
  return modeIndicator !== null || !document.querySelector('[aria-label*="Suggesting"]');
}

function getCurrentFont() {
  try {
    // Try to find font from toolbar
    const fontSelector = document.querySelector('[aria-label*="Font"]');
    if (fontSelector) {
      const fontName = fontSelector.textContent || fontSelector.getAttribute('aria-label');
      // Extract font name from label
      const match = fontName.match(/Font[:\s]+([^,]+)/i);
      if (match) return match[1].trim();
    }
    
    // Fallback: check selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    }
    
    return null;
  } catch (error) {
    log(`Error getting current font: ${error.message}`, 'debug');
    return null;
  }
}

function findFontDropdown() {
  const selectors = [
    '[aria-label*="Font"][role="button"]',
    '.docs-font-family',
    '[aria-label^="Font"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  
  return null;
}

function findFontOption(fontName) {
  const menuItems = document.querySelectorAll('[role="menuitem"]');
  for (const item of menuItems) {
    const text = item.textContent || item.getAttribute('aria-label') || '';
    if (text.includes(fontName)) {
      return item;
    }
  }
  return null;
}

function getAvailableWeights() {
  const weights = [];
  const menuItems = document.querySelectorAll('[role="menuitem"]');
  
  const weightKeywords = [
    'Thin', 'Extra Light', 'Light', 'Normal', 'Regular',
    'Medium', 'Semi Bold', 'Bold', 'Extra Bold', 'Black'
  ];
  
  for (const item of menuItems) {
    const text = item.textContent || item.getAttribute('aria-label') || '';
    for (const weight of weightKeywords) {
      if (text.includes(weight)) {
        weights.push(weight);
        break;
      }
    }
  }
  
  return weights;
}

function clickWeightOption(weight) {
  try {
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    for (const item of menuItems) {
      const text = item.textContent || item.getAttribute('aria-label') || '';
      if (text.includes(weight)) {
        item.click();
        log(`Applied ${weight}`, 'log');
        return true;
      }
    }
    log(`Weight option ${weight} not found`, 'debug');
    return false;
  } catch (error) {
    log(`Error clicking weight option: ${error.message}`, 'debug');
    return false;
  }
}

function closeMenus() {
  try {
    // Click outside menus to close
    const editor = document.querySelector('.kix-appview-editor');
    if (editor) {
      editor.click();
    }
    // Or press Escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  } catch (error) {
    // Silent failure
  }
}

function waitForElement(selector, timeout) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
```

### Key Safeguards in Implementation

1. **Operation Lock:** `operationInProgress` prevents concurrent executions
2. **Pre-flight Checks:** Validates selection and editing mode before starting
3. **Timeout Protection:** All async operations have 2-second max timeout
4. **Font Detection:** Multiple fallback methods to detect current font
5. **Weight Detection:** Scans available weights before attempting to apply
6. **Fallback Chain:** Semi Bold → Bold → Nothing (configurable)
7. **Silent Failures:** All errors logged to console only, never shown to user
8. **Menu Cleanup:** Always attempts to close menus on failure
9. **Retry Logic:** One automatic retry on failure (configurable)
10. **Debug Mode:** Can be enabled for troubleshooting without affecting users


// Google Docs Semi Bold Extension
// Adds Cmd+Ctrl+B keyboard shortcut to apply Semi Bold font weight

// Safari Web Extension API compatibility shim
// Safari uses browser.* namespace, Chrome uses chrome.*
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  window.chrome = browser;
}

// Configuration
const CONFIG = {
  DEBUG: false,
  MAX_WAIT_MS: 2000,
  RETRY_ON_FAIL: true,
  MENU_ANIMATION_DELAY_MS: 300,
  FALLBACK_TO_BOLD: true,
  DEBOUNCE_MS: 100
};

// State management
let operationInProgress = false;
let extensionReady = false;
let lastKeyPressTime = 0;
const eventListeners = []; // Track listeners for cleanup

// Logging utility
function log(message, level = 'debug') {
  // Always log if DEBUG is true, or if level is not 'debug'
  if (!CONFIG.DEBUG && level === 'debug') return;
  const prefix = '[Semi Bold Extension]';
  // Use console.log for all messages when debugging to ensure visibility
  if (CONFIG.DEBUG) {
    console.log(`${prefix} [${level.toUpperCase()}] ${message}`);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

// Debug logging via extension background (avoids page CORS)
function sendDebugLog(payload) {
  if (!CONFIG.DEBUG) return; // Early return in production
  try {
    // Support both chrome.* (Chrome) and browser.* (Safari) APIs
    const runtime = (typeof chrome !== 'undefined' && chrome.runtime) || 
                    (typeof browser !== 'undefined' && browser.runtime);
    if (runtime?.sendMessage) {
      runtime.sendMessage({ type: 'debug-log', payload });
    }
  } catch (error) {
    // Swallow any logging errors
  }
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
  // Check for Google Docs editor elements
  const editor = document.querySelector('.kix-appview-editor') || 
                 document.querySelector('[role="textbox"]') ||
                 document.querySelector('.kix-page-content-wrapper');
  return editor !== null;
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
  // Attach to main document
  const documentHandler = handleKeyPress.bind(this);
  document.addEventListener('keydown', documentHandler, true);
  eventListeners.push({ element: document, event: 'keydown', handler: documentHandler, capture: true });
  
  // Also try to attach to iframe documents (Google Docs uses iframes)
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      // Try to access iframe content (may fail due to cross-origin)
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc && iframeDoc !== document) {
        const iframeHandler = handleKeyPress.bind(this);
        iframeDoc.addEventListener('keydown', iframeHandler, true);
        eventListeners.push({ element: iframeDoc, event: 'keydown', handler: iframeHandler, capture: true });
      }
    } catch (error) {
      // Cross-origin iframe, skip silently
    }
  });
  
  // Also attach to window for global capture
  const windowHandler = handleKeyPress.bind(this);
  window.addEventListener('keydown', windowHandler, true);
  eventListeners.push({ element: window, event: 'keydown', handler: windowHandler, capture: true });
  
  log('Keyboard listener attached', 'debug');
}

// Cleanup event listeners
function cleanup() {
  eventListeners.forEach(({ element, event, handler, capture }) => {
    try {
      element.removeEventListener(event, handler, capture);
    } catch (error) {
      // Silent failure
    }
  });
  eventListeners.length = 0;
}

// Clean up on page unload
window.addEventListener('beforeunload', cleanup);

function handleKeyPress(event) {
  // Debounce rapid keypresses
  const now = Date.now();
  if (now - lastKeyPressTime < CONFIG.DEBOUNCE_MS) {
    return;
  }
  lastKeyPressTime = now;
  
  // Check for Cmd+Ctrl+B (Mac) or Ctrl+Alt+B (Windows/Linux)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  // Mac: Cmd+Ctrl+B, Windows/Linux: Ctrl+Alt+B
  const shortcutMatched = isMac 
    ? (event.metaKey && event.ctrlKey && (event.key === 'B' || event.key === 'b'))
    : (event.ctrlKey && event.altKey && (event.key === 'B' || event.key === 'b'));
  
  if (!shortcutMatched) {
    return; // Not our shortcut
  }
  
  log('Shortcut detected! Cmd+Ctrl+B', 'debug');
  
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

// Core functionality - using keyboard navigation with type-to-search
async function applySemiBold() {
  try {
    const currentFont = getCurrentFont();
    log(`Current font: ${currentFont}`, 'debug');
    
    // Step 1: Open font dropdown with mousedown
    const fontDropdown = document.getElementById('docs-font-family');
    if (!fontDropdown) {
      log('Font dropdown not found', 'debug');
      return false;
    }
    
    fontDropdown.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    
    await sleep(CONFIG.MENU_ANIMATION_DELAY_MS);

    // Step 2: Find the visible font menu and open the weight submenu for current font
    const fontMenu = getVisibleMenus().find(menu => menu.className?.includes('docs-fontmenu'));
    const fontItem = fontMenu ? findMenuItemByText(fontMenu, currentFont) : null;

    if (fontItem) {
      fontItem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
      fontItem.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, view: window }));
      await sleep(CONFIG.MENU_ANIMATION_DELAY_MS);
    }

    // Step 3: Find the weight submenu by detecting a menu with weight items
    const weightMenu = getVisibleMenus().find(menu => menuHasWeightItems(menu));

    if (weightMenu) {
      const weights = getAvailableWeights(weightMenu);
      const didApply = weights.includes('Semi Bold')
        ? await clickWeightOption('Semi Bold', weightMenu)
        : (CONFIG.FALLBACK_TO_BOLD && weights.includes('Bold') ? await clickWeightOption('Bold', weightMenu) : false);
      return didApply;
    }

    log('Weight submenu not found', 'debug');
    return false;
    
  } catch (error) {
    log(`Error in applySemiBold: ${error.message}`, 'debug');
    closeMenus();
    return false;
  }
}

// Helper function to type text (for type-to-search in menus)
function typeText(text) {
  for (const char of text) {
    const keyCode = char.toUpperCase().charCodeAt(0);
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    }));
    document.activeElement.dispatchEvent(new KeyboardEvent('keypress', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: keyCode,
      which: keyCode,
      charCode: char.charCodeAt(0),
      bubbles: true,
      cancelable: true
    }));
    document.activeElement.dispatchEvent(new KeyboardEvent('keyup', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    }));
  }
}

// Helper function to dispatch keyboard events
function dispatchKey(key) {
  const keyCode = {
    'ArrowUp': 38,
    'ArrowDown': 40,
    'ArrowLeft': 37,
    'ArrowRight': 39,
    'Enter': 13,
    'Escape': 27,
    ' ': 32,
    'Space': 32
  }[key] || 0;
  
  const code = key === ' ' ? 'Space' : key;
  
  const target = document.activeElement || document;
  
  target.dispatchEvent(new KeyboardEvent('keydown', {
    key: key,
    code: code,
    keyCode: keyCode,
    which: keyCode,
    bubbles: true,
    cancelable: true,
    view: window
  }));
  
  target.dispatchEvent(new KeyboardEvent('keyup', {
    key: key,
    code: code,
    keyCode: keyCode,
    which: keyCode,
    bubbles: true,
    cancelable: true,
    view: window
  }));
}

// Helper functions
function hasTextSelection() {
  try {
    // Google Docs uses a canvas-based editor, so window.getSelection() doesn't work
    // Instead, check if there's an active selection by looking for selection overlay elements
    // or just return true and let Google Docs handle it
    
    // Try standard selection first
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return true;
    }
    
    // Google Docs-specific: check for selection highlight elements
    const selectionHighlight = document.querySelector('.kix-selection-overlay');
    if (selectionHighlight) {
      return true;
    }
    
    // Check for any selected content in Google Docs canvas
    const canvas = document.querySelector('canvas.kix-canvas-tile-content');
    if (canvas) {
      // If we're in the Google Docs editor, assume text might be selected
      // and let the menu operation handle the case where nothing is selected
      return true;
    }
    
    // Fallback: if we're in an iframe with a textbox, assume we're in the editor
    const textbox = document.querySelector('[role="textbox"]');
    if (textbox) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

function isEditingMode() {
  try {
    // Check if document is in editing mode (not suggesting/viewing)
    const modeIndicator = document.querySelector('[aria-label*="Editing mode"]');
    if (modeIndicator) return true;
    
    // Check for suggesting mode indicator
    const suggestingIndicator = document.querySelector('[aria-label*="Suggesting"]');
    if (suggestingIndicator) return false;
    
    // Default to editing mode if we can't determine
    return true;
  } catch (error) {
    // Default to editing mode on error
    return true;
  }
}

function getCurrentFont() {
  try {
    // Try to find font from toolbar - prioritize #docs-font-family
    const fontSelectors = [
      '#docs-font-family',
      '[aria-label*="Font"]',
      '[aria-label^="Font"]',
      '.docs-font-family',
      '[data-tooltip*="Font"]'
    ];
    
    for (const selector of fontSelectors) {
      const fontElement = document.querySelector(selector);
      if (fontElement) {
        // Get text content - Google Docs shows font name directly (e.g., "Arial")
        const textContent = fontElement.textContent || '';
        const ariaLabel = fontElement.getAttribute('aria-label') || '';
        const dataTooltip = fontElement.getAttribute('data-tooltip') || '';
        
        // Try to extract font name from aria-label (e.g., "Font: Montserrat" -> "Montserrat")
        const match = ariaLabel.match(/Font[:\s]+([^,\n]+)/i);
        if (match) {
          const font = match[1].trim();
          if (font && font.length > 0) {
            log(`Found font from aria-label: ${font}`, 'debug');
            return font;
          }
        }
        
        // Try direct text content - Google Docs shows font name directly
        const trimmedText = textContent.trim();
        if (trimmedText && trimmedText.length > 0) {
          // If it's not "Font" or similar keywords, it's likely the font name
          const lowerText = trimmedText.toLowerCase();
          if (!lowerText.includes('font') && 
              !lowerText.includes('select') && 
              !lowerText.includes('choose') &&
              trimmedText.length < 50) { // Font names are usually short
            log(`Found font from text content: ${trimmedText}`, 'debug');
            return trimmedText;
          }
        }
      }
    }
    
    // Fallback: check selection's computed style
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      try {
        const range = selection.getRangeAt(0);
        const element = range.startContainer.nodeType === 3 
          ? range.startContainer.parentElement 
          : range.startContainer;
        
        if (element) {
          const computedStyle = window.getComputedStyle(element);
          const fontFamily = computedStyle.fontFamily;
          if (fontFamily) {
            // Extract first font name (before comma)
            const firstFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
            if (firstFont) return firstFont;
          }
        }
      } catch (error) {
        // Silent failure
      }
    }
    
    return null;
  } catch (error) {
    log(`Error getting current font: ${error.message}`, 'debug');
    return null;
  }
}

function findFontDropdown() {
  const selectors = [
    '#docs-font-family', // Primary selector - Google Docs uses this ID
    '[aria-label*="Font"][role="button"]',
    '[aria-label^="Font"][role="button"]',
    '.docs-font-family',
    '[aria-label*="Font"]',
    '[data-tooltip*="Font"]',
    'listbox[aria-label="Font"]' // Fallback for listbox structure
  ];
  
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        // Check if element is visible
        log(`Found font dropdown with selector: ${selector}`, 'debug');
        return element;
      }
    } catch (error) {
      // Continue to next selector
    }
  }
  
  return null;
}

function findFontOption(fontName) {
  try {
    // Try multiple selectors for menu items
    const selectors = [
      '[role="menuitem"]',
      '[role="option"]',
      '.goog-menuitem',
      '.docs-menuitem'
    ];
    
    let allItems = [];
    for (const selector of selectors) {
      const items = document.querySelectorAll(selector);
      if (items.length > 0) {
        allItems = [...allItems, ...items];
      }
    }
    
    // Search for font name
    for (const item of allItems) {
      const text = item.textContent || item.getAttribute('aria-label') || '';
      if (text.toLowerCase().includes(fontName.toLowerCase())) {
        return item;
      }
    }
    
    return null;
  } catch (error) {
    log(`Error finding font option: ${error.message}`, 'debug');
    return null;
  }
}

function getAvailableWeights(submenu = null) {
  const weights = [];
  try {
    let allItems = [];
    
    if (submenu) {
      // If we have a specific submenu, only search within it
      const selectors = ['[role="menuitem"]', '[role="option"]', '.goog-menuitem', '.goog-option'];
      for (const selector of selectors) {
        const items = submenu.querySelectorAll(selector);
        allItems = [...allItems, ...items];
      }
    } else {
      // Fallback: search all menus but only visible ones
      const selectors = ['[role="menuitem"]', '[role="option"]', '.goog-menuitem', '.goog-option'];
      for (const selector of selectors) {
        const items = document.querySelectorAll(selector);
        allItems = [...allItems, ...items];
      }
    }
    
    const weightKeywords = [
      'Thin', 'Extra Light', 'ExtraLight', 'Light', 'Normal', 'Regular',
      'Medium', 'Semi Bold', 'SemiBold', 'Semibold', 'Bold', 'Extra Bold', 'ExtraBold', 'Black'
    ];
    
    for (const item of allItems) {
      const text = item.textContent || item.getAttribute('aria-label') || '';
      for (const weight of weightKeywords) {
        if (text.includes(weight)) {
          if (!weights.includes(weight)) {
            weights.push(weight);
          }
          break;
        }
      }
    }
  } catch (error) {
    log(`Error getting available weights: ${error.message}`, 'debug');
  }
  
  return weights;
}

async function clickWeightOption(weight, submenu = null) {
  try {
    let menuItems;
    if (submenu) {
      menuItems = submenu.querySelectorAll('[role="menuitem"], [role="option"], .goog-menuitem, .goog-menuitemcheckbox');
    } else {
      menuItems = document.querySelectorAll('[role="menuitem"], [role="option"], .goog-menuitem, .goog-menuitemcheckbox');
    }
    
    for (const item of menuItems) {
      const text = item.textContent || item.getAttribute('aria-label') || '';
      if (text.includes(weight)) {
        // Use a more reliable click method: dispatch mouse events followed by click
        item.dispatchEvent(new MouseEvent('mousedown', { 
          bubbles: true, cancelable: true, view: window, button: 0 
        }));
        await sleep(10);
        item.dispatchEvent(new MouseEvent('mouseup', { 
          bubbles: true, cancelable: true, view: window, button: 0 
        }));
        await sleep(10);
        item.click();
        
        log(`Applied ${weight}`, 'debug');
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

function getVisibleMenus() {
  return Array.from(document.querySelectorAll('.goog-menu-vertical:not([style*="display: none"])'));
}

function findMenuItemByText(menu, text) {
  if (!menu || !text) return null;
  const items = menu.querySelectorAll('.goog-menuitem, [role="menuitem"], [role="option"]');
  const lower = text.toLowerCase();
  for (const item of items) {
    const itemText = item.textContent?.trim().toLowerCase() || '';
    if (itemText.includes(lower)) return item;
  }
  return null;
}

function menuHasWeightItems(menu) {
  if (!menu) return false;
  const items = menu.querySelectorAll('.goog-menuitem, [role="menuitem"], [role="option"]');
  const weightKeywords = ['Semi Bold', 'SemiBold', 'Semibold', 'Bold', 'Medium', 'Regular', 'Light', 'Thin'];
  return Array.from(items).some(item => {
    const text = item.textContent || item.getAttribute('aria-label') || '';
    return weightKeywords.some(weight => text.includes(weight));
  });
}

function getMenuSampleItems(menu) {
  if (!menu) return [];
  return Array.from(menu.querySelectorAll('.goog-menuitem')).slice(0, 5).map(item => item.textContent?.trim().substring(0, 30));
}

function closeMenus() {
  try {
    // Try pressing Escape to close menus
    document.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'Escape',
      bubbles: true,
      cancelable: true
    }));
    
    // Also try clicking outside menus
    setTimeout(() => {
      const editor = document.querySelector('.kix-appview-editor') || 
                     document.querySelector('[role="textbox"]');
      if (editor) {
        editor.focus();
      }
    }, 100);
  } catch (error) {
    // Silent failure
  }
}

function waitForElement(selector, timeout) {
  return new Promise((resolve) => {
    try {
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
    } catch (error) {
      resolve(null);
    }
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

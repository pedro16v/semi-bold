// Google Docs Semi Bold Extension
// Adds Cmd+Ctrl+B keyboard shortcut to apply Semi Bold font weight
//
// This file is shared: the Safari extension's Resources/content.js is a symlink to it.

// Configuration
const CONFIG = {
  DEBUG: false,
  MENU_TIMEOUT_MS: 300, // Longest wait for a menu to appear before giving up
  RETRY_ON_FAIL: true,
  RETRY_DELAY_MS: 200,
  FALLBACK_TO_BOLD: true,
  DEBOUNCE_MS: 100
};

const IS_MAC = navigator.platform.toUpperCase().includes('MAC');

// Weight labels as they appear in the font submenu, compared letters-only and lowercase
const WEIGHT_KEYS = new Set([
  'thin', 'extralight', 'light', 'normal', 'regular', 'medium',
  'semibold', 'bold', 'extrabold', 'black'
]);

// Outcomes of a single attempt
const Outcome = {
  APPLIED: 'applied',
  NOT_APPLIED: 'not-applied', // Menu opened but the font or weight wasn't there
  MENU_NOT_OPENED: 'menu-not-opened' // Worth retrying, Docs may still be loading
};

// State management
let operationInProgress = false;
let lastShortcutTime = 0;
const listenedDocuments = new WeakSet();

// Logging utility
function log(message, level = 'debug') {
  if (!CONFIG.DEBUG && level === 'debug') return;
  const prefix = '[Semi Bold Extension]';
  if (CONFIG.DEBUG) {
    console.log(`${prefix} [${level.toUpperCase()}] ${message}`);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

// Initialize extension
function initialize() {
  window.addEventListener('keydown', handleKeyPress, true);
  listenInIframes();

  // Docs routes typing through same-origin iframes that may be created after load.
  // Rescan when focus moves into a frame or the user clicks, rather than watching every DOM change.
  window.addEventListener('blur', listenInIframes);
  window.addEventListener('pointerdown', listenInIframes, { capture: true, passive: true });

  log('Extension initialized');
}

// Key events inside an iframe never reach the top window, so listen in each same-origin frame too
function listenInIframes() {
  for (const iframe of document.querySelectorAll('iframe')) {
    // contentDocument is null for cross-origin frames
    const iframeDoc = iframe.contentDocument;
    if (iframeDoc && !listenedDocuments.has(iframeDoc)) {
      listenedDocuments.add(iframeDoc);
      iframeDoc.addEventListener('keydown', handleKeyPress, true);
    }
  }
}

function handleKeyPress(event) {
  // Mac: Cmd+Ctrl+B, Windows/Linux: Ctrl+Alt+B
  const modifiersMatched = IS_MAC
    ? (event.metaKey && event.ctrlKey)
    : (event.ctrlKey && event.altKey);

  if (!modifiersMatched || (event.key !== 'b' && event.key !== 'B')) {
    return; // Not our shortcut
  }

  // Always swallow the shortcut, even when ignoring it below, so Docs never sees it
  event.preventDefault();
  event.stopImmediatePropagation();

  // Debounce rapid presses of the shortcut
  const now = Date.now();
  const tooSoon = now - lastShortcutTime < CONFIG.DEBOUNCE_MS;
  lastShortcutTime = now;

  if (tooSoon || operationInProgress) {
    log('Shortcut pressed too soon or operation in progress, ignoring');
    return;
  }

  log('Shortcut detected');
  executeSemiBoldAction();
}

async function executeSemiBoldAction() {
  operationInProgress = true;

  try {
    if (!isEditingMode()) {
      log('Not in editing mode, exiting');
      return;
    }

    let outcome = await applySemiBold();

    // Only retry when the menu failed to open; a font without the weight won't gain it on a second try
    if (outcome === Outcome.MENU_NOT_OPENED && CONFIG.RETRY_ON_FAIL) {
      log('Font menu did not open, retrying once');
      await sleep(CONFIG.RETRY_DELAY_MS);
      outcome = await applySemiBold();
    }

    log(`Finished: ${outcome}`);
  } catch (error) {
    // Silent failure - just log
    log(`Operation failed: ${error.message}`);
  } finally {
    operationInProgress = false;
  }
}

// Core functionality: open the font menu, hover the current font, click its Semi Bold weight
async function applySemiBold() {
  const fontDropdown = document.getElementById('docs-font-family');
  if (!fontDropdown) {
    log('Font dropdown not found');
    return Outcome.MENU_NOT_OPENED;
  }

  const currentFont = getCurrentFont(fontDropdown);
  log(`Current font: ${currentFont}`);

  fontDropdown.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

  const fontMenu = await waitFor(findFontMenu, CONFIG.MENU_TIMEOUT_MS);
  if (!fontMenu) {
    log('Font menu did not appear');
    return Outcome.MENU_NOT_OPENED;
  }

  let applied = false;
  try {
    const fontItem = findFontItem(fontMenu, currentFont);
    if (!fontItem) {
      log('Current font not found in font menu');
      return Outcome.NOT_APPLIED;
    }

    fontItem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
    fontItem.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, view: window }));

    const weightMenu = await waitFor(
      () => getVisibleMenus().find(menu => menu !== fontMenu && menuHasWeightItems(menu)),
      CONFIG.MENU_TIMEOUT_MS
    );
    if (!weightMenu) {
      log('Weight submenu not found');
      return Outcome.NOT_APPLIED;
    }

    const weightItem = findWeightItem(weightMenu, 'Semi Bold') ||
      (CONFIG.FALLBACK_TO_BOLD ? findWeightItem(weightMenu, 'Bold') : null);
    if (!weightItem) {
      log('Neither Semi Bold nor Bold available');
      return Outcome.NOT_APPLIED;
    }

    await clickMenuItem(weightItem);
    applied = true;
    log(`Applied ${menuItemLabel(weightItem)}`);
    return Outcome.APPLIED;
  } finally {
    // Clicking a weight closes the menus itself; on any other path we opened them, so close them
    if (!applied) {
      await closeMenus(fontDropdown);
    }
  }
}

// Helper functions
function isEditingMode() {
  // Check if document is in editing mode (not suggesting/viewing)
  if (document.querySelector('[aria-label*="Editing mode"]')) return true;
  if (document.querySelector('[aria-label*="Suggesting"]')) return false;

  // Default to editing mode if we can't determine
  return true;
}

function getCurrentFont(fontDropdown) {
  // The aria-label may read "Font: Montserrat"
  const ariaLabel = fontDropdown.getAttribute('aria-label') || '';
  const match = ariaLabel.match(/Font[:\s]+([^,\n]+)/i);
  if (match && match[1].trim()) {
    return match[1].trim();
  }

  // Otherwise the toolbar shows the font name directly (e.g. "Arial")
  const text = normaliseLabel(fontDropdown.textContent);
  return text && text.length < 50 ? text : null;
}

function getVisibleMenus() {
  return Array.from(document.querySelectorAll('.goog-menu-vertical:not([style*="display: none"])'));
}

function findFontMenu() {
  return getVisibleMenus().find(menu => menu.className.includes('docs-fontmenu')) || null;
}

function getMenuItems(menu) {
  return menu.querySelectorAll('.goog-menuitem, [role="menuitem"], [role="option"]');
}

function normaliseLabel(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function menuItemLabel(item) {
  let text = item.textContent || item.getAttribute('aria-label') || '';
  // Fonts with weights end in a submenu arrow ("Montserrat►"); leave it out of the label
  const arrow = item.querySelector('.goog-submenu-arrow');
  if (arrow) {
    text = text.replace(arrow.textContent, '');
  }
  return normaliseLabel(text);
}

// "Semi Bold", "SemiBold" and "Semibold" all become "semibold"
function weightKey(text) {
  return (text || '').toLowerCase().replace(/[^a-z]/g, '');
}

function findFontItem(menu, fontName) {
  if (!fontName) return null;
  const wanted = fontName.toLowerCase();
  const items = Array.from(getMenuItems(menu));

  // Prefer an exact match so "Arial" doesn't pick "Arial Black" from the recent fonts list,
  // then the font the menu marks as current, then a partial match
  return items.find(item => menuItemLabel(item).toLowerCase() === wanted) ||
    menu.querySelector('.goog-option-selected') ||
    items.find(item => menuItemLabel(item).toLowerCase().includes(wanted)) ||
    null;
}

function findWeightItem(menu, weight) {
  const wanted = weightKey(weight);
  return Array.from(getMenuItems(menu)).find(item => weightKey(menuItemLabel(item)) === wanted) || null;
}

function menuHasWeightItems(menu) {
  return Array.from(getMenuItems(menu)).some(item => WEIGHT_KEYS.has(weightKey(menuItemLabel(item))));
}

async function clickMenuItem(item) {
  item.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, cancelable: true, view: window, button: 0
  }));
  await sleep(10);
  item.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true, cancelable: true, view: window, button: 0
  }));
  await sleep(10);
  item.click();
}

async function closeMenus(fontDropdown) {
  try {
    // Docs ignores a synthetic Escape, but a second mousedown on the dropdown toggles the menus shut
    if (findFontMenu()) {
      fontDropdown.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await waitFor(() => !findFontMenu(), 100);
    }

    // Focus is left on the toolbar; hand it back to the iframe Docs types through
    const typingTarget = document.querySelector('.docs-texteventtarget-iframe') ||
                         document.querySelector('.kix-appview-editor');
    if (typingTarget) {
      typingTarget.focus();
    }
  } catch (error) {
    // Silent failure
  }
}

// Resolve with the first truthy value of predicate(), checking about once per frame, or null after timeoutMs.
// Uses setTimeout rather than requestAnimationFrame, which browsers throttle in occluded windows.
function waitFor(predicate, timeoutMs) {
  return new Promise((resolve) => {
    const deadline = performance.now() + timeoutMs;
    const check = () => {
      const result = predicate();
      if (result) {
        resolve(result);
      } else if (performance.now() >= deadline) {
        resolve(null);
      } else {
        setTimeout(check, 16);
      }
    };
    check();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Content script runs at document_idle, so the DOM is already parsed
initialize();

// Debug endpoint - only used when DEBUG is enabled in content script
// Set to null to disable debug logging
const DEBUG_ENDPOINT = null; // 'http://127.0.0.1:7251/ingest/92c8a575-b63b-4b80-bf15-b6b36313727f';

chrome.runtime.onMessage.addListener((message) => {
  if (!DEBUG_ENDPOINT || !message || message.type !== 'debug-log' || !message.payload) {
    return false;
  }

  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message.payload)
  }).catch(() => {});

  return false;
});

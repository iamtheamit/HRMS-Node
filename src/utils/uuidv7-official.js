// uuidv7-official.js
// Wrapper that prefers the official `uuid` v7 implementation when available.
// Falls back to the local `uuidv7` helper for synchronous reliability in CommonJS.

const local = require('./uuidv7');
let official = null;
let loading = false;

async function loadOfficial() {
  if (official || loading) return;
  loading = true;
  try {
    const mod = await import('uuid');
    // official v7 may be on mod.v7 or mod.default?.v7 depending on bundling
    official = mod.v7 || (mod.default && mod.default.v7) || null;
  } catch (e) {
    // ignore — we'll continue to use local fallback
    official = null;
  } finally {
    loading = false;
  }
}

// Start loading in background (non-blocking)
loadOfficial();

// Export a synchronous-looking function. If the official implementation is ready
// and is a function, use it. Otherwise fall back to the local helper.
module.exports = function uuidv7Wrapper() {
  if (official && typeof official === 'function') {
    try {
      return official();
    } catch (e) {
      // If official call fails for any reason, fall back
      return local();
    }
  }
  return local();
};

// Injected into the MAIN world on demand. Reads known framework state globals
// plus other large window objects, and returns a safely-serialised snapshot.
// Self-contained (no imports) because executeScript injects a single function.
function runProbe() {
  // --- inline serialiser (mirrors serialise.js; injection can't import) ---
  function serialise(value, maxDepth, maxItems, maxString, seen) {
    if (value === null) return null;
    const t = typeof value;
    if (t === 'function') return '[function]';
    if (t === 'string') return value.length > maxString ? value.slice(0, maxString) + '…' : value;
    if (t === 'number' || t === 'boolean') return value;
    if (t === 'undefined' || t === 'symbol') return undefined;
    if (maxDepth <= 0) return '[max-depth]';
    if (typeof value === 'object') {
      if (seen.has(value)) return '[circular]';
      seen.add(value);
      if (Array.isArray(value)) {
        const a = value.slice(0, maxItems).map((x) => serialise(x, maxDepth - 1, maxItems, maxString, seen));
        if (value.length > maxItems) a.push('[+' + (value.length - maxItems) + ' more]');
        return a;
      }
      const o = {}; let n = 0;
      for (const k of Object.keys(value)) {
        if (n++ >= maxItems) break;
        try { o[k] = serialise(value[k], maxDepth - 1, maxItems, maxString, seen); } catch { o[k] = '[unreadable]'; }
      }
      return o;
    }
    return String(value);
  }
  const snap = (v) => serialise(v, 6, 100, 2000, new WeakSet());

  const KNOWN = ['__NEXT_DATA__', '__NUXT__', '__INITIAL_STATE__', '__PRELOADED_STATE__',
    '__APOLLO_STATE__', '__remixContext', '__sveltekit', '__NEXT_REDUX_STORE__'];

  const state = {};
  for (const key of KNOWN) {
    try { if (window[key] != null) state[key] = snap(window[key]); } catch {}
  }
  // scan other window keys that hold big-ish objects
  const extra = {};
  try {
    for (const k of Object.keys(window)) {
      if (KNOWN.includes(k) || k.startsWith('webkit') || k.length < 3) continue;
      let v; try { v = window[k]; } catch { continue; }
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        let size = 0; try { size = Object.keys(v).length; } catch {}
        if (size >= 4 && size < 500) extra[k] = snap(v);
      }
    }
  } catch {}
  if (Object.keys(extra).length) state.__window_scan = extra;

  return { url: location.href, host: location.host, takenAt: new Date().toISOString(), state };
}
// Export for executeScript (func: runProbe). Also callable in tests via globalThis.
globalThis.runProbe = runProbe;

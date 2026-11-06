// Pure, cycle-safe serialiser with depth / size / string caps so reading a
// huge live state object can't blow up. Drops functions. Node-testable.
export function serialise(value, opts = {}) {
  const maxDepth = opts.maxDepth ?? 6;
  const maxItems = opts.maxItems ?? 100;
  const maxString = opts.maxString ?? 2000;
  const seen = new WeakSet();

  function walk(v, depth) {
    if (v === null) return null;
    const t = typeof v;
    if (t === 'function') return '[function]';
    if (t === 'string') return v.length > maxString ? v.slice(0, maxString) + '…[+' + (v.length - maxString) + ']' : v;
    if (t === 'number' || t === 'boolean') return v;
    if (t === 'bigint') return String(v) + 'n';
    if (t === 'symbol' || t === 'undefined') return undefined;
    if (depth >= maxDepth) return '[max-depth]';
    if (typeof v === 'object') {
      if (seen.has(v)) return '[circular]';
      seen.add(v);
      if (Array.isArray(v)) {
        const arr = v.slice(0, maxItems).map((x) => walk(x, depth + 1));
        if (v.length > maxItems) arr.push(`[+${v.length - maxItems} more]`);
        return arr;
      }
      const out = {};
      let n = 0;
      for (const k of Object.keys(v)) {
        if (n++ >= maxItems) { out['…'] = `[+${Object.keys(v).length - maxItems} more keys]`; break; }
        try { out[k] = walk(v[k], depth + 1); } catch { out[k] = '[unreadable]'; }
      }
      return out;
    }
    return String(v);
  }
  return walk(value, 0);
}

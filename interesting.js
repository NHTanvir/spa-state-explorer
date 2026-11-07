// Pure: walk a serialised state object and collect paths whose key (or value)
// looks security-relevant. Node-testable.
const KEY_RE = /^(is_?admin|admin|role|roles|permission|permissions|scope|scopes|plan|tier|subscription|tenant|tenant_?id|org|org_?id|account_?id|feature|features|flag|flags|price|amount|discount|email|phone|api_?key|apikey|secret|token|access_?token|password)$/i;
const VALUE_RE = /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/; // jwt

export function findInteresting(state, maxHits = 500) {
  const hits = [];
  function walk(v, path) {
    if (hits.length >= maxHits) return;
    if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        const p = path ? `${path}.${k}` : k;
        if (KEY_RE.test(k)) hits.push({ path: p, key: k, value: preview(v[k]) });
        walk(v[k], p);
      }
    } else if (typeof v === 'string' && VALUE_RE.test(v)) {
      hits.push({ path, key: '(jwt)', value: preview(v) });
    }
  }
  function preview(v) {
    if (v && typeof v === 'object') return Array.isArray(v) ? `[${v.length} items]` : `{${Object.keys(v).length} keys}`;
    return String(v).slice(0, 120);
  }
  walk(state, '');
  return hits;
}

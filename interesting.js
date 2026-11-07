// Pure: walk a serialised state object and collect paths whose key or value
// looks security-relevant. Tiered per the research notes, with value-shape
// signatures and an exposure-vs-lead label (exposure = reportable as-is;
// lead = needs a server request to confirm). Node-testable.
const CATS = [
  { cat: 'authorization', kind: 'lead', sev: 'high',
    re: /^(is_?admin|is_?superuser|admin|role|roles|permission|permissions|perms|scope|scopes|acl|capabilities|grants)$/i },
  { cat: 'plan-billing', kind: 'lead', sev: 'high',
    re: /^(plan|tier|subscription|entitlements|feature|features|featureflags|flags|price|amount|discount|coupon|is_?paid|is_?pro|is_?enterprise|trial|quota|limit)$/i },
  { cat: 'tenant', kind: 'lead', sev: 'high',
    re: /^(tenant|tenant_?id|org|org_?id|organization_?id|account_?id|workspace_?id|company_?id)$/i },
  { cat: 'secret-pii', kind: 'exposure', sev: 'critical',
    re: /^(token|access_?token|refresh_?token|id_?token|jwt|api_?key|apikey|secret|client_?secret|password|session_?id|email|phone|ssn)$/i },
];
const JWT_RE = /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{2,}\.[A-Za-z0-9_-]{5,}\b/;
const PROVIDER_KEY_RE = /\b(sk_live_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{20,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/;

function catFor(key) {
  for (const c of CATS) if (c.re.test(key)) return c;
  return null;
}

export function findInteresting(state, maxHits = 500) {
  const hits = [];
  function preview(v) {
    if (v && typeof v === 'object') return Array.isArray(v) ? `[${v.length} items]` : `{${Object.keys(v).length} keys}`;
    return String(v).slice(0, 120);
  }
  function push(path, key, value, cat, kind, sev) { hits.push({ path, key, value: preview(value), category: cat, kind, severity: sev }); }
  function walk(v, path) {
    if (hits.length >= maxHits) return;
    if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        const p = path ? `${path}.${k}` : k;
        const c = catFor(k);
        if (c) push(p, k, v[k], c.cat, c.kind, c.sev);
        walk(v[k], p);
      }
    } else if (typeof v === 'string') {
      if (JWT_RE.test(v)) push(path, '(jwt)', v, 'secret-pii', 'exposure', 'critical');
      else if (PROVIDER_KEY_RE.test(v)) push(path, '(provider-key)', v, 'secret-pii', 'exposure', 'critical');
    }
  }
  walk(state, '');
  return hits;
}

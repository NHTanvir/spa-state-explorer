// Pure extractors for route-like and endpoint-like strings in script text /
// state. Node-testable; the worker feeds them already-fetched script text.
const ROUTE_RE = /["'`](\/[A-Za-z0-9_\-:/]*(?:admin|internal|beta|settings|dashboard|account|billing|api)[A-Za-z0-9_\-:/]*)["'`]/gi;
const PATH_RE = /["'`](\/[A-Za-z0-9_\-/]{2,}(?:\/:[A-Za-z]+)?)["'`]/g;
const API_RE = /["'`]((?:\/api\/|\/v\d\/|\/graphql|\/trpc\/|\/bff\/|\/rpc\/)[A-Za-z0-9_\-/.]*)["'`]/gi;
const NEXT_DATA_RE = /(\/_next\/data\/[A-Za-z0-9_\-]+\/[A-Za-z0-9_\-/.]+\.json|\/_payload\.json)/g;
const GQL_RE = /\b(?:query|mutation)\s+([A-Za-z][A-Za-z0-9_]*)/g;

function collect(re, text, idx = 1) {
  const out = new Set(); let m;
  re.lastIndex = 0;
  while ((m = re.exec(text))) out.add(m[idx]);
  return [...out];
}

export function extractRoutes(text) {
  const interesting = collect(ROUTE_RE, text);
  const all = collect(PATH_RE, text).filter((p) => p.length <= 80);
  return [...new Set([...interesting, ...all])].sort();
}

export function extractEndpoints(text) {
  const apis = collect(API_RE, text);
  const nextData = collect(NEXT_DATA_RE, text, 0);
  const gql = collect(GQL_RE, text).map((n) => `graphql:${n}`);
  return [...new Set([...apis, ...nextData, ...gql])].sort();
}

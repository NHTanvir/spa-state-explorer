import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractRoutes, extractEndpoints } from '../routes.js';

const js = `const r=[{path:'/admin/users'},{path:'/beta'},{path:'/home'}];
fetch('/api/v2/users'); fetch('/graphql');
const q = 'query GetSecret { me { role } }';`;

test('extracts interesting + general routes', () => {
  const routes = extractRoutes(js);
  assert.ok(routes.includes('/admin/users'));
  assert.ok(routes.includes('/beta'));
  assert.ok(routes.includes('/home'));
});
test('extracts api endpoints and graphql ops', () => {
  const eps = extractEndpoints(js);
  assert.ok(eps.includes('/api/v2/users'));
  assert.ok(eps.includes('/graphql'));
  assert.ok(eps.includes('graphql:GetSecret'));
});

test('next data and nuxt payload endpoints extracted', () => {
  const js = `fetch('/_next/data/abc123/dashboard.json'); fetch('/_payload.json');`;
  const eps = extractEndpoints(js);
  assert.ok(eps.some((e) => e.includes('/_next/data/')));
  assert.ok(eps.includes('/_payload.json'));
});

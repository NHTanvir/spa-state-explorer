import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findInteresting } from '../interesting.js';

test('finds role/plan/flags/email by key', () => {
  const hits = findInteresting({ user: { role: 'admin', email: 'a@b.com' }, features: { beta: true }, plan: 'free' });
  const keys = hits.map((h) => h.key);
  assert.ok(keys.includes('role'));
  assert.ok(keys.includes('email'));
  assert.ok(keys.includes('features'));
  assert.ok(keys.includes('plan'));
});
test('finds jwt by value', () => {
  const hits = findInteresting({ auth: { t: 'eyJhbGciOi.eyJzdWIiOi.sigPART123' } });
  assert.ok(hits.some((h) => h.key === '(jwt)'));
});
test('ignores boring keys', () => {
  assert.equal(findInteresting({ title: 'x', count: 3 }).length, 0);
});

import { toMarkdown } from '../markdown.js';
test('markdown includes interesting values, routes and endpoints', () => {
  const md = toMarkdown({ probe: { state: { role: 'admin' } }, routes: ['/admin'], endpoints: ['/api/v1/x'] }, { host: 'x' });
  assert.ok(md.includes('role'));
  assert.ok(md.includes('/admin'));
  assert.ok(md.includes('/api/v1/x'));
});

test('hits carry category, kind and severity', () => {
  const hits = findInteresting({ user: { role: 'admin' }, auth: { token: 'eyJhbGciOiJIUzI.eyJzdWIiOiIxMjM.sigPART12345' } });
  const role = hits.find((h) => h.key === 'role');
  assert.equal(role.category, 'authorization');
  assert.equal(role.kind, 'lead');
  const jwt = hits.find((h) => h.key === '(jwt)');
  assert.equal(jwt.kind, 'exposure');
  assert.equal(jwt.severity, 'critical');
});
test('provider key signature detected', () => {
  const hits = findInteresting({ cfg: { k: 'sk_live_abcdef0123456789' } });
  assert.ok(hits.some((h) => h.key === '(provider-key)'));
});

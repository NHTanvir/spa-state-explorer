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

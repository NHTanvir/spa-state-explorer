import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serialise } from '../serialise.js';

test('drops functions, keeps data', () => {
  assert.deepEqual(serialise({ a: 1, f: () => {}, s: 'x' }), { a: 1, f: '[function]', s: 'x' });
});
test('handles cycles', () => {
  const o = { a: 1 }; o.self = o;
  assert.equal(serialise(o).self, '[circular]');
});
test('caps depth', () => {
  const deep = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
  assert.equal(serialise(deep, { maxDepth: 2 }).a.b, '[max-depth]');
});
test('caps array items and string length', () => {
  assert.equal(serialise(Array.from({ length: 10 }, (_, i) => i), { maxItems: 3 }).length, 4);
  assert.ok(serialise('x'.repeat(50), { maxString: 10 }).includes('…[+40]'));
});

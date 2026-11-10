import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import en from '../src/locales/en.ts';
import ko from '../src/locales/ko.ts';

test('English and Korean translations cover the same UI and interpolation values', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ko).sort());
  for (const key of Object.keys(en)) {
    assert.ok(en[key].trim() && ko[key].trim(), key);
    const placeholders = (value: string) =>
      [...value.matchAll(/{{(\w+)}}/g)].map((m) => m[1]).sort();
    assert.deepEqual(placeholders(en[key]), placeholders(ko[key]), key);
  }
});

test('Every catalog option and its shortened UI label has an English and Korean translation', () => {
  function check(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) check(path);
      else if (entry.name === 'prompt.md') {
        const text = readFileSync(path, 'utf8');
        const label = text.match(/^## (.+)$/m)?.[1];
        const category = text.match(/\*\*Category:\*\* (.+)/)?.[1];
        assert.ok(label, path);
        // Detail levels use their own keys; every other option also keeps its full label key.
        const keys =
          category === 'Depiction'
            ? [`Detail ${label}`]
            : [label, label.replace(' Modern', '').replace(/\s+illustration\b/gi, '')];
        for (const value of keys) {
          assert.ok(en[value] && ko[value], `${path}: ${value}`);
        }
      }
    }
  }
  check('reference');
});

test('Option labels map to translation keys without type suffixes', async () => {
  const { optionLabelKey } = await import('../src/utils/optionChoices.ts');
  assert.equal(optionLabelKey({ label: 'Botanical Illustration' }), 'Botanical');
  assert.equal(optionLabelKey({ label: 'Mid-century Modern' }), 'Mid-century');
  assert.equal(ko.Grayscale, '흑백');
  assert.equal(ko.Pastel, '파스텔');
});

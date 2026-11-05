import test from 'node:test';
import assert from 'node:assert/strict';
import { prioritizeSelectedOptions } from '../src/utils/optionChoices.ts';

test('Selected choices lead without losing canonical order and deselection restores their position', () => {
  const options = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
  const ids = (selected: string[]) =>
    prioritizeSelectedOptions(options, selected).map((option) => option.id);
  assert.deepEqual(ids(['d', 'b']), ['b', 'd', 'a', 'c']);
  assert.deepEqual(ids(['d']), ['d', 'a', 'b', 'c']);
  assert.deepEqual(ids([]), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids(['unknown', 'b', 'b']), ['b', 'a', 'c', 'd']);
  assert.deepEqual(
    options.map((option) => option.id),
    ['a', 'b', 'c', 'd'],
  );
});

test('Single-select choices always retain their original order', () => {
  const options = ['a', 'b', 'c'].map((id) => ({ id }));
  assert.equal(prioritizeSelectedOptions(options, ['c'], false), options);
});

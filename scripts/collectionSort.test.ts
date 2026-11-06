import test from 'node:test';
import assert from 'node:assert/strict';
import { sortCollection } from '../src/utils/collectionSort.ts';

test('Collection sort handles bookmark order and newest-first preset storage without mutating either', () => {
  const bookmarks = [{ name: 'Image 10' }, { name: 'Image 2' }, { name: 'Image 1' }];
  const names = (items: typeof bookmarks) => items.map((item) => item.name);
  const rank = (item: (typeof bookmarks)[number]) => bookmarks.indexOf(item);
  assert.deepEqual(names(sortCollection(bookmarks, 'newest', rank)), [
    'Image 1',
    'Image 2',
    'Image 10',
  ]);
  assert.deepEqual(names(sortCollection(bookmarks, 'oldest', rank)), [
    'Image 10',
    'Image 2',
    'Image 1',
  ]);
  assert.deepEqual(names(bookmarks), ['Image 10', 'Image 2', 'Image 1']);
  const presets = [...bookmarks].reverse();
  assert.deepEqual(
    names(sortCollection(presets, 'newest', (item) => -presets.indexOf(item))),
    names(presets),
  );
  assert.deepEqual(sortCollection([], 'newest', rank), []);
});

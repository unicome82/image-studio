import test from 'node:test';
import assert from 'node:assert/strict';
import { selectedBuilderOptions } from '../src/utils/selectedOptions.ts';
const catalog = [
  {
    id: 'style',
    category: 'Illustration Style',
    label: 'Style',
    path: 'style',
    prompt: 'CONTENT_style',
  },
  { id: 'same', category: 'Color', label: 'Color', path: 'color', prompt: 'CONTENT_color' },
  { id: 'same', category: 'Texture', label: 'Texture', path: 'texture', prompt: 'CONTENT_texture' },
  { id: 'type', category: 'Typography', label: 'Type', path: 'type', prompt: 'CONTENT_type' },
  { id: 'film', category: 'Photo Style', label: 'Film', path: 'film', prompt: 'CONTENT_film' },
];
test('Summary follows the active image type and category-scoped selection IDs', () => {
  const selection = {
    'Illustration Style': ['style'],
    Color: ['same'],
    Texture: ['same'],
    Typography: ['type'],
    'Photo Style': ['film'],
  };
  assert.deepEqual(
    selectedBuilderOptions(catalog, selection, false).map((o) => o.path),
    ['style', 'color'],
  );
  assert.deepEqual(
    selectedBuilderOptions(catalog, selection, true, false, true).map((o) => o.path),
    ['film', 'color', 'texture'],
  );
  const removed = { ...selection, Color: [] };
  assert(!selectedBuilderOptions(catalog, removed, false).some((o) => o.path === 'color'));
});

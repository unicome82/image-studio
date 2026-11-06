import test from 'node:test';
import assert from 'node:assert/strict';
import { selectedBuilderOptions } from '../src/utils/selectedOptions.ts';
const catalog = [
  { id: 'style', category: 'Base Style', label: 'Style', path: 'style', prompt: 'CONTENT_style' },
  { id: 'same', category: 'Color', label: 'Color', path: 'color', prompt: 'CONTENT_color' },
  { id: 'same', category: 'Texture', label: 'Texture', path: 'texture', prompt: 'CONTENT_texture' },
  { id: 'type', category: 'Typography', label: 'Type', path: 'type', prompt: 'CONTENT_type' },
  { id: 'film', category: 'Photography', label: 'Film', path: 'film', prompt: 'CONTENT_film' },
  {
    id: 'outline',
    category: 'Outline',
    label: 'Outline',
    path: 'outline',
    prompt: 'CONTENT_outline',
  },
];
test('Summary follows active image type, Typography switch, and category-scoped selection IDs', () => {
  const selection = {
    'Base Style': ['style'],
    Color: ['same'],
    Texture: ['same'],
    Typography: ['type'],
    Photography: ['film'],
    Outline: ['outline'],
  };
  assert.deepEqual(
    selectedBuilderOptions(catalog, selection, {}, false).map((o) => o.path),
    ['style', 'color', 'texture', 'outline'],
  );
  assert.deepEqual(
    selectedBuilderOptions(catalog, selection, { 'Typography Enabled': 'true' }, true).map(
      (o) => o.path,
    ),
    ['film', 'color', 'texture', 'type'],
  );
  const removed = { ...selection, Color: [] };
  assert(!selectedBuilderOptions(catalog, removed, {}, false).some((o) => o.path === 'color'));
  assert(selectedBuilderOptions(catalog, removed, {}, false).some((o) => o.path === 'texture'));
});

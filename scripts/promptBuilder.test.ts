import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  builderCategories,
  compactFields,
  makeImagePrompt,
  makeMockupPrompt,
  makeRecreatePrompt,
  toggleOption,
  type Option,
} from '../src/utils/promptBuilder.ts';
import { parsePresets } from '../src/utils/presets.ts';
function catalogAt(dir: string): Option[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return catalogAt(path);
    if (entry.name !== 'prompt.md') return [];
    const text = readFileSync(path, 'utf8');
    return [
      {
        id: text.match(/\*\*Style ID:\*\* `([^`]+)`/)![1],
        category: text.match(/\*\*Category:\*\* (.+)/)![1],
        label: text.match(/^## (.+)$/m)![1],
        cue: text.match(/\*\*Cue:\*\* (.+)/)?.[1]?.trim(),
        path,
        prompt: '',
      },
    ];
  });
}
const catalog = catalogAt('reference');

test('each type keeps only its lead style, color, texture and illustration outline', () => {
  assert.deepEqual(builderCategories(false), ['Illustration Style', 'Color', 'Texture', 'Outline']);
  assert.deepEqual(builderCategories(true), ['Photo Style', 'Color', 'Texture']);
  assert.deepEqual(builderCategories(false, true), [
    'Design Format',
    'Design Style',
    'Color',
    'Texture',
  ]);
  const categories = new Set(catalog.map((o) => o.category));
  for (const category of categories)
    assert.ok(
      [
        ...builderCategories(false),
        ...builderCategories(true),
        ...builderCategories(false, true),
      ].includes(category),
      category,
    );
});

test('every source MD carries a short Cue', () => {
  for (const option of catalog)
    assert.ok(option.cue && option.cue.split(' ').length <= 15, option.path);
});

test('mockup prompt sets a minimal gallery of ten images in one style with label and cue', () => {
  const text = makeMockupPrompt(
    catalog,
    {
      'Illustration Style': ['pixelart'],
      Color: ['pastel'],
      Texture: ['papergrain'],
      Outline: ['coloronly'],
      'Photo Style': ['portrait'],
    },
    'illustration',
  );
  const lines = text.split('\n');
  assert.equal(
    lines[0],
    'Design a mockup of a minimal gallery website: white background, simple header, a clean grid of 10 illustrations.',
  );
  assert.equal(lines[1], 'All 10 illustrations share one style:');
  assert.match(lines[2], /^Illustration Style: Pixel Art — /);
  assert.match(lines[3], /^Color: Pastel — /);
  assert.match(lines[4], /^Texture: Paper Grain — /);
  assert.match(lines[5], /^Rendering Mode: Color Only — /);
  assert.equal(lines.at(-1), 'Each illustration shows a different subject.');
  assert.ok(!text.includes('Portrait'));
  assert.ok(!text.includes('Aspect Ratio'));
  assert.ok(makeMockupPrompt(catalog, {}, 'photo').includes('photography portfolio website'));
  assert.ok(
    makeMockupPrompt(catalog, { 'Design Format': ['poster'] }, 'design').includes(
      'Design Format: Poster — ',
    ),
  );
});

test('single-image prompts keep the subject verbatim and state the ratio', () => {
  const recreate = makeRecreatePrompt(
    { Subject: 'the sleeping cat', 'Aspect Ratio': '4:5' },
    'illustration',
  );
  assert.ok(recreate.startsWith('Recreate "the sleeping cat" from this gallery mockup'));
  assert.ok(recreate.endsWith('Aspect Ratio: 4:5'));
  assert.ok(makeRecreatePrompt({}, 'photo').includes('the image I like best'));
  const image = makeImagePrompt(
    catalog,
    { 'Illustration Style': ['risograph'], Color: ['pastel'] },
    { Subject: 'A cat', 'Aspect Ratio': '3:4' },
    'illustration',
  );
  assert.ok(image.startsWith('Create a standalone illustration of "A cat".'));
  assert.ok(image.includes('\nColor: Pastel — '));
  assert.ok(image.endsWith('Aspect Ratio: 3:4'));
});

test('single choice per category; required categories stay selected', () => {
  assert.deepEqual(toggleOption({ Color: ['muted'] }, 'Color', 'vivid').Color, ['vivid']);
  assert.deepEqual(toggleOption({ Color: ['muted'] }, 'Color', 'muted').Color, []);
  assert.deepEqual(toggleOption({ Outline: ['coloronly'] }, 'Outline', 'coloronly').Outline, [
    'coloronly',
  ]);
  assert.deepEqual(compactFields({ Subject: 'A', Text: 'B', 'Typography Enabled': 'true' }), {
    Subject: 'A',
    'Aspect Ratio': '1:1',
  });
});

test('saved mockups keep only offered categories and migrate removed styles', () => {
  const raw = JSON.stringify([
    {
      id: '1',
      photo: false,
      selection: {
        'Illustration Style': ['celshadedanime'],
        Technique: ['watercolor'],
        Color: ['muted'],
      },
      fields: { Subject: 'A tree', Text: 'TREE', 'Aspect Ratio': '3:4' },
    },
    { id: '2', photo: true, selection: { 'Photo Style': ['film'] }, fields: {} },
    { id: '3', photo: false, selection: { Technique: ['risograph'] }, fields: {} },
  ]);
  const [illustration, photo, riso] = parsePresets(raw, catalog);
  assert.deepEqual(illustration.selection, {
    'Illustration Style': ['contemporaryflat'],
    Color: ['muted'],
  });
  assert.deepEqual(illustration.fields, { Subject: 'A tree', 'Aspect Ratio': '3:4' });
  assert.deepEqual(photo.selection, {
    'Photo Style': [],
    Texture: ['filmgrain'],
    Color: ['muted'],
  });
  assert.deepEqual(riso.selection, { 'Illustration Style': ['risograph'] });
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  builderCategories,
  compactFields,
  defaultDepiction,
  depictionLevels,
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
  const offered = new Set([
    ...builderCategories(false),
    ...builderCategories(true),
    ...builderCategories(false, true),
    'Depiction',
  ]);
  for (const option of catalog) assert.ok(offered.has(option.category), option.path);
  const levels = catalog.filter((o) => o.category === 'Depiction').map((o) => o.id);
  assert.deepEqual(levels.sort(), [...depictionLevels].sort());
});

test('every source MD carries a short Cue', () => {
  for (const option of catalog)
    assert.ok(option.cue && option.cue.split(' ').length <= 15, option.path);
});

test('mockup prompt names one style, the depiction level and the subject without a ratio', () => {
  const text = makeMockupPrompt(
    catalog,
    { 'Illustration Style': ['geometricillustration'], Depiction: ['verysimple'] },
    { Subject: 'building', 'Aspect Ratio': '4:5' },
    'illustration',
  );
  assert.equal(
    text,
    [
      'Design a mockup of a minimal gallery website: white background, simple header, a clean grid of 10 images.',
      '',
      'All 10 images share one style: Geometric Illustration',
      'Each image shows a different very simple building.',
    ].join('\n'),
  );
  const rich = makeMockupPrompt(
    catalog,
    {
      'Illustration Style': ['risograph'],
      Color: ['pastel'],
      Texture: ['papergrain'],
      Outline: ['outlineonly'],
      Depiction: ['verycomplex'],
      'Photo Style': ['portrait'],
    },
    {},
    'illustration',
  );
  assert.ok(rich.includes('\nColor: Pastel\nTexture: Paper Grain\nRendering Mode: Outline Only\n'));
  assert.ok(rich.endsWith('Each image shows a different very complex subject.'));
  assert.ok(!rich.includes('Portrait') && !rich.includes('Aspect Ratio'));
  assert.ok(
    makeMockupPrompt(catalog, {}, {}, 'illustration').includes('a different simple subject'),
  );
  assert.ok(
    makeMockupPrompt(
      catalog,
      { 'Design Format': ['poster'], 'Design Style': ['swiss'] },
      {},
      'design',
    ).includes('share one style: Swiss Graphic Design Poster'),
  );
  assert.ok(makeMockupPrompt(catalog, {}, {}, 'photo').includes('photography portfolio website'));
});

test('single-image prompts pick an image number and state the ratio', () => {
  const recreate = makeRecreatePrompt({ Image: '3', 'Aspect Ratio': '4:5' }, 'illustration');
  assert.ok(recreate.startsWith('Recreate image 3 of 10 from this gallery mockup'));
  assert.ok(recreate.endsWith('Aspect Ratio: 4:5'));
  assert.ok(makeRecreatePrompt({ Image: 'x' }, 'photo').startsWith('Recreate image 1 of 10'));
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
  assert.deepEqual(toggleOption({ Outline: ['coloronly'] }, 'Outline', 'coloronly').Outline, []);
  assert.deepEqual(toggleOption({ Depiction: ['rich'] }, 'Depiction', 'rich').Depiction, ['rich']);
  assert.equal(defaultDepiction, 'simple');
  assert.deepEqual(compactFields({ Subject: 'A', Text: 'B', 'Typography Enabled': 'true' }), {
    Subject: 'A',
    Image: '',
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
        Depiction: ['complex'],
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
    Depiction: ['complex'],
  });
  assert.deepEqual(illustration.fields, { Subject: 'A tree', Image: '', 'Aspect Ratio': '3:4' });
  assert.deepEqual(photo.selection, {
    'Photo Style': [],
    Texture: ['filmgrain'],
    Color: ['muted'],
  });
  assert.deepEqual(riso.selection, { 'Illustration Style': ['risograph'] });
});

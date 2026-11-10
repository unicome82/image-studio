import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  builderCategories,
  compactFields,
  defaultDepiction,
  imageCategories,
  depictionLevels,
  makeImagePrompt,
  makeMockupPrompt,
  optionOrder,
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

test('each type keeps its lead style, technique, color, tone and illustration outline; images add texture', () => {
  assert.deepEqual(builderCategories(false), [
    'Illustration Style',
    'Color',
    'Tone',
    'Outline',
    'Typography',
  ]);
  assert.deepEqual(builderCategories(true), [
    'Photo Style',
    'Photo Technique',
    'Color',
    'Tone',
    'Typography',
  ]);
  assert.deepEqual(builderCategories(false, true), [
    'Design Format',
    'Design Style',
    'Design Graphic',
    'Color',
    'Tone',
    'Typography',
  ]);
  assert.deepEqual(imageCategories(true), [
    'Photo Style',
    'Photo Technique',
    'Color',
    'Tone',
    'Typography',
    'Texture',
  ]);
  const offered = new Set([
    ...imageCategories(false),
    ...imageCategories(true),
    ...imageCategories(false, true),
    'Depiction',
  ]);
  for (const option of catalog) assert.ok(offered.has(option.category), option.path);
  const levels = catalog.filter((o) => o.category === 'Depiction');
  assert.deepEqual(levels.map((o) => o.id).sort(), [...depictionLevels].sort());
  // The prompt uses each level's lowercase Cue phrase; the screen label may be shorter.
  assert.deepEqual(
    depictionLevels.map((id) => levels.find((o) => o.id === id)?.cue),
    ['very simple', 'simple', 'moderately complex', 'complex', 'very complex'],
  );
});

test('every source MD carries a short Cue', () => {
  for (const option of catalog)
    assert.ok(option.cue && option.cue.split(' ').length <= 15, option.path);
});

test('mockup prompt names one style, the depiction level and the subject without a ratio', () => {
  const text = makeMockupPrompt(
    catalog,
    { 'Illustration Style': ['geometricillustration'], Depiction: ['verysimple'] },
    { Subject: 'A tall building' },
    'illustration',
  );
  assert.equal(
    text,
    [
      'Design a mockup of a minimal gallery website: white background, only a simple header and a masonry gallery of 9 to 12 illustrations in mixed aspect ratios.',
      'The header shows the style and options as text: Geometric Illustration · Very Simple',
      '',
      'All illustrations share one style: Geometric Illustration',
      'Mood: modern and chic, refined and grown-up',
      'Color: different colors for each image',
      'Each image shows a different very simple take on the subject: A tall building',
    ].join('\n'),
  );
  const rich = makeMockupPrompt(
    catalog,
    {
      'Illustration Style': ['risograph'],
      Color: ['pastel'],
      Tone: ['hazy'],
      Texture: ['papergrain'],
      Outline: ['outlineonly'],
      Depiction: ['verycomplex'],
      'Photo Style': ['street'],
    },
    {},
    'illustration',
  );
  assert.ok(
    rich.includes(
      '\nColor: Pastel, with different colors for each image\nTone: Hazy\nRendering Mode: Outline Only\nEach image',
    ),
  );
  assert.ok(
    rich.includes(
      'The header shows the style and options as text: Risograph · Pastel · Hazy · Outline Only · Very Complex\n',
    ),
  );
  assert.ok(!rich.includes('Texture'));
  const tone = (id: string) =>
    makeMockupPrompt(catalog, { Color: [id] }, {}, 'photo').split('\n')[5];
  assert.equal(
    tone('blackwhite'),
    'Color: Grayscale, with a different grayscale tone for each image',
  );
  assert.equal(tone('monochrome'), 'Color: Monochrome, with a different hue for each image');
  assert.ok(rich.endsWith('Each image shows a different very complex subject.'));
  assert.ok(!rich.includes('Street') && !rich.includes('Aspect Ratio'));
  assert.ok(
    makeMockupPrompt(catalog, {}, {}, 'illustration').includes('a different simple subject'),
  );
  assert.ok(
    makeMockupPrompt(
      catalog,
      { 'Design Format': ['poster'], 'Design Style': ['swiss'] },
      {},
      'design',
    ).includes('share one style: Swiss Poster'),
  );
  const technique = makeMockupPrompt(
    catalog,
    { 'Photo Style': ['editorial'], 'Photo Technique': ['film'], Tone: ['soft'] },
    {},
    'photo',
  );
  assert.ok(technique.includes('as text: Editorial · Film · Soft · Simple\n'));
  assert.ok(technique.includes('\nTone: Soft\nTechnique: Film\nEach image'));
  assert.ok(
    makeMockupPrompt(
      catalog,
      { 'Design Format': ['poster'], 'Design Style': ['retro'], 'Design Graphic': ['halftone'] },
      {},
      'design',
    ).includes(
      'share one style: Retro Poster\nMood: modern and chic, refined and grown-up\nColor: different colors for each image\nGraphic: Halftone\n',
    ),
  );
  assert.ok(makeMockupPrompt(catalog, {}, {}, 'photo').includes('photography portfolio website'));
});

test('gallery image prompts list texture and the image ratio', () => {
  const image = makeImagePrompt(
    catalog,
    { 'Illustration Style': ['risograph'], Color: ['pastel'], Texture: ['papergrain'] },
    { Subject: 'A cat', 'Aspect Ratio': '3:4' },
    'illustration',
  );
  assert.ok(image.startsWith('Create a standalone illustration of "A cat".'));
  assert.ok(image.includes('\nColor: Pastel — '));
  assert.match(image, /\nTexture: Paper Grain — /);
  assert.ok(image.endsWith('Aspect Ratio: 3:4'));
});

test('single choice per category; required categories stay selected', () => {
  assert.deepEqual(toggleOption({ Color: ['muted'] }, 'Color', 'vivid').Color, ['vivid']);
  assert.deepEqual(toggleOption({ Color: ['muted'] }, 'Color', 'muted').Color, []);
  assert.deepEqual(toggleOption({ Outline: ['coloronly'] }, 'Outline', 'coloronly').Outline, []);
  assert.deepEqual(toggleOption({ Depiction: ['rich'] }, 'Depiction', 'rich').Depiction, ['rich']);
  for (const category of ['Illustration Style', 'Photo Style', 'Design Style'])
    assert.deepEqual(toggleOption({ [category]: ['a'] }, category, 'a')[category], ['a']);
  assert.equal(defaultDepiction, 'simple');
  assert.deepEqual(
    compactFields({ Subject: 'A', Text: 'B', 'Typography Enabled': 'true', Extra: 'C' }),
    { Subject: 'A', 'Typography Enabled': 'true', Text: 'B' },
  );
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
    { id: '4', photo: true, selection: { Color: ['highkey'] }, fields: {} },
    { id: '5', photo: false, selection: { 'Illustration Style': ['lowpoly'] }, fields: {} },
    { id: '6', photo: true, selection: { 'Photo Style': ['portrait'] }, fields: {} },
    {
      id: '7',
      photo: false,
      design: true,
      selection: { 'Design Format': ['poster'], 'Design Style': ['gradientglass'] },
      fields: {},
    },
    { id: '8', photo: false, design: true, selection: {}, fields: {} },
  ]);
  const [illustration, photo, riso, highkey, lowpoly, portrait, glass, design] = parsePresets(
    raw,
    catalog,
  );
  assert.deepEqual(illustration.selection, {
    'Illustration Style': ['contemporaryflat'],
    Color: ['muted'],
    Depiction: ['complex'],
  });
  assert.deepEqual(illustration.fields, { Subject: 'A tree', Text: 'TREE' });
  // Film moved from photo styles to techniques; the empty style takes the default.
  assert.deepEqual(photo.selection, {
    'Photo Style': ['editorial'],
    'Photo Technique': ['film'],
  });
  assert.deepEqual(riso.selection, { 'Illustration Style': ['risograph'] });
  assert.deepEqual(highkey.selection, {
    Color: [],
    Tone: ['highkey'],
    'Photo Style': ['editorial'],
  });
  assert.deepEqual(lowpoly.selection, { 'Illustration Style': ['geometricillustration'] });
  assert.deepEqual(portrait.selection, { 'Photo Style': ['editorial'] });
  assert.deepEqual(glass.selection, {
    'Design Format': ['poster'],
    'Design Style': ['minimalist'],
    'Design Graphic': ['glassmorphism'],
  });
  assert.deepEqual(design.selection, {
    'Design Format': ['poster'],
    'Design Style': ['minimalist'],
  });
});

test('typography works for every type only while its switch is on', () => {
  const selection = { 'Photo Style': ['editorial'], Typography: ['boldgrotesk'] };
  const off = makeMockupPrompt(catalog, selection, { Text: 'HELLO' }, 'photo');
  assert.ok(!off.includes('Typography') && !off.includes('HELLO') && !off.includes('Bold Grotesk'));
  const on = makeMockupPrompt(
    catalog,
    selection,
    { 'Typography Enabled': 'true', Text: 'HELLO' },
    'photo',
  );
  assert.ok(on.includes('as text: Editorial · Bold Grotesk · Simple\n'));
  assert.ok(on.includes('\nTypography: Bold Grotesk\nText: HELLO\nEach image'));
  for (const type of ['illustration', 'design'] as const)
    assert.ok(
      makeMockupPrompt(catalog, {}, { 'Typography Enabled': 'true' }, type).includes(
        `\nTypography: On\nText: Not specified. Choose suitable wording freely to complement each ${type}.\n`,
      ),
    );
  const image = makeImagePrompt(
    catalog,
    selection,
    { 'Typography Enabled': 'true', 'Aspect Ratio': '1:1' },
    'photo',
  );
  assert.match(
    image,
    /\nTypography: Bold Grotesk — .+\nText: Not specified\. .+ the photograph\.\n/,
  );
});

test('every option has a short positive Cue and curated orders list exactly the catalog IDs', () => {
  for (const option of catalog) {
    assert.ok(option.cue, option.path);
    assert.ok(option.cue.split(/\s+/).length <= 15, option.path);
    assert.doesNotMatch(option.cue, /\b(no|not|avoid|without|never)\b/i, option.path);
  }
  for (const [category, order] of Object.entries(optionOrder))
    assert.deepEqual(
      [...order].sort(),
      catalog
        .filter((o) => o.category === category)
        .map((o) => o.id)
        .sort(),
      category,
    );
});

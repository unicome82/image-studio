import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  builderCategories,
  compactFields,
  defaultDepiction,
  depictionPhrase,
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

test('each type keeps its lead style, technique, color and tone; images add texture', () => {
  assert.deepEqual(builderCategories(false), ['Illustration Style', 'Color', 'Tone']);
  assert.deepEqual(builderCategories(true), ['Photo Style', 'Photo Technique', 'Color', 'Tone']);
  assert.deepEqual(builderCategories(false, true), [
    'Design Format',
    'Design Style',
    'Design Graphic',
    'Color',
    'Tone',
  ]);
  assert.deepEqual(imageCategories(true), [
    'Photo Style',
    'Photo Technique',
    'Color',
    'Tone',
    'Texture',
  ]);
  const offered = new Set([
    ...imageCategories(false),
    ...imageCategories(true),
    ...imageCategories(false, true),
    'Depiction',
    // Typography options stay in the catalog as the random typeface and weight pool.
    'Typography',
    'Typography Weight',
  ]);
  for (const option of catalog) assert.ok(offered.has(option.category), option.path);
  const levels = catalog.filter((o) => o.category === 'Depiction');
  assert.deepEqual(levels.map((o) => o.id).sort(), [...depictionLevels].sort());
  // The Detail line uses each level's Cue; Balanced adds no line.
  assert.deepEqual(
    depictionLevels.map((id) => depictionPhrase(catalog, { Depiction: [id] })),
    [
      'minimal composition, very few elements',
      'simple composition, limited details',
      '',
      'detailed composition, rich visual elements',
      'intricate composition, elaborate fine details',
    ],
  );
  assert.ok(
    makeMockupPrompt(catalog, { Depiction: ['balanced'] }, { Subject: 'A cat' }, 'photo').endsWith(
      '\nEach image shows a different take on the subject: A cat',
    ),
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
      'The header shows the style and options as text: Geometric Illustration · Minimal',
      '',
      'All illustrations share one style: Geometric Illustration',
      'Mood: modern and chic, refined and grown-up',
      'Color: different colors for each image',
      'Detail: minimal composition, very few elements',
      'Each image shows a different take on the subject: A tall building',
    ].join('\n'),
  );
  const rich = makeMockupPrompt(
    catalog,
    {
      'Illustration Style': ['risograph'],
      Color: ['pastel'],
      Tone: ['hazy'],
      Texture: ['papergrain'],
      Depiction: ['verycomplex'],
      'Photo Style': ['street'],
    },
    {},
    'illustration',
  );
  assert.ok(
    rich.includes('\nColor: Pastel, with different colors for each image\nTone: Hazy\nDetail: '),
  );
  assert.ok(
    rich.includes(
      'The header shows the style and options as text: Risograph · Pastel · Hazy · Intricate\n',
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
  assert.ok(
    rich.endsWith(
      '\nDetail: intricate composition, elaborate fine details\nEach image shows a different subject.',
    ),
  );
  assert.ok(!rich.includes('Street') && !rich.includes('Aspect Ratio'));
  assert.ok(
    makeMockupPrompt(catalog, {}, {}, 'illustration').includes(
      '\nDetail: simple composition, limited details\nEach image shows a different subject.',
    ),
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
  assert.ok(technique.includes('\nTone: Soft\nTechnique: Film\nDetail: simple composition'));
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
        Outline: ['outlineonly'],
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
    {
      id: '9',
      photo: false,
      design: true,
      selection: { 'Design Format': ['logo'], 'Design Style': ['postmodernism'] },
      fields: {},
    },
  ]);
  const [illustration, photo, riso, highkey, lowpoly, portrait, glass, design, movement] =
    parsePresets(raw, catalog);
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
  // Art-movement design styles load as the working styles that absorbed them.
  assert.deepEqual(movement.selection, { 'Design Format': ['logo'], 'Design Style': ['acid'] });
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

test('typography picks a different typeface and weight per image from the catalog pool', () => {
  const faces =
    'Sans-serif, Serif, Display, Monospace, Outline Type, Bubble Lettering, Calligraphy, Hand Lettering, Childlike Handwriting, Experimental Typography';
  const on = { 'Typography Enabled': 'true', Text: 'HELLO' };
  for (const type of ['illustration', 'photo', 'design'] as const)
    assert.ok(
      makeMockupPrompt(catalog, {}, on, type).includes(
        `\nTypography: a different typeface and lettering style for each image, picked at random from ${faces}, in a thin or bold weight\nText: HELLO\nEach image`,
      ),
    );
  const off = makeMockupPrompt(catalog, { Typography: ['serif'] }, { Text: 'HELLO' }, 'photo');
  assert.ok(!off.includes('Typography') && !off.includes('HELLO'));
  assert.ok(
    makeMockupPrompt(catalog, {}, { 'Typography Enabled': 'true' }, 'design').includes(
      '\nText: Not specified. Choose suitable wording freely to complement each image.\n',
    ),
  );
  assert.ok(
    makeImagePrompt(catalog, {}, { 'Typography Enabled': 'true' }, 'photo').includes(
      `\nTypography: one typeface and lettering style, picked at random from ${faces}, in a thin or bold weight\nText: Not specified. Choose suitable wording freely to complement the image.\n`,
    ),
  );
  // Saved typography choices are dropped; the switch and text stay.
  const [preset] = parsePresets(
    JSON.stringify([
      {
        id: '1',
        photo: true,
        selection: { Typography: ['serif'], 'Typography Weight': ['bold'] },
        fields: { 'Typography Enabled': 'true', Text: 'HI' },
      },
    ]),
    catalog,
  );
  assert.deepEqual(preset.selection, { 'Photo Style': ['editorial'] });
  assert.deepEqual(preset.fields, { Subject: '', 'Typography Enabled': 'true', Text: 'HI' });
});

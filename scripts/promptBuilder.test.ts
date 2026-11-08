import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aspectRatios,
  builderCategories,
  instructions,
  makePrompt,
  optionLimit,
  toggleOption,
} from '../src/utils/promptBuilder.ts';
test('outline remains single selection and independent of palette', () => {
  const result = toggleOption(
    { Outline: ['coloronly'], Color: ['muted'] },
    'Outline',
    'outlineonly',
  );
  assert.deepEqual(result.Outline, ['outlineonly']);
  assert.deepEqual(result.Color, ['muted']);
});
test('conflicts prefer newest selection; style mixes cap at three', () => {
  assert.deepEqual(toggleOption({ Color: ['muted'] }, 'Color', 'vivid').Color, ['vivid']);
  assert.deepEqual(
    toggleOption({ 'Illustration Style': ['a', 'b', 'c'] }, 'Illustration Style', 'd')[
      'Illustration Style'
    ],
    ['a', 'b', 'c'],
  );
});
test('only selected prompt bodies; typography requires its switch, photography requires photo', () => {
  const catalog = [
    {
      id: 'folk',
      label: 'Folk',
      category: 'Illustration Style',
      path: 'reference/folk/prompt.md',
      prompt: 'CONTENT_reference_folk_prompt_md',
    },
    {
      id: 'groovy',
      label: 'Groovy',
      category: 'Typography',
      path: 'reference/options/typography/groovy/prompt.md',
      prompt: 'CONTENT_reference_options_typography_groovy_prompt_md',
    },
    {
      id: 'film',
      label: 'Film',
      category: 'Photo Style',
      path: 'reference/options/photography/film/prompt.md',
      prompt: 'CONTENT_reference_options_photography_film_prompt_md',
    },
  ];
  const sel = {
    'Illustration Style': ['folk', 'missing'],
    Typography: ['groovy'],
    'Photo Style': ['film'],
  };
  const text = makePrompt(catalog, sel, 3, { Text: '' }, false);
  assert.ok(text.includes('CONTENT_reference_folk_prompt_md'));
  assert.ok(!text.includes('/missing/'));
  assert.ok(!text.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(!text.includes('CONTENT_reference_options_photography_film_prompt_md'));
  const full = makePrompt(
    catalog,
    sel,
    3,
    { Text: 'EXACT TEXT', 'Typography Enabled': 'true' },
    true,
  );
  assert.ok(full.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(full.includes('CONTENT_reference_options_photography_film_prompt_md'));
  assert.ok(full.includes('Text: EXACT TEXT'));
});
test('Photo prompt excludes hidden illustration options and preserves shared options', () => {
  const catalog = [
    {
      id: 'folk',
      label: 'Folk',
      category: 'Illustration Style',
      path: 'reference/folk/prompt.md',
      prompt: 'CONTENT_reference_folk_prompt_md',
    },
    {
      id: 'risograph',
      label: 'Risograph',
      category: 'Technique',
      path: 'reference/options/technique/risograph/prompt.md',
      prompt: 'CONTENT_reference_options_technique_risograph_prompt_md',
    },
    {
      id: 'coloronly',
      label: 'Color Only',
      category: 'Outline',
      path: 'reference/options/outline/coloronly/prompt.md',
      prompt: 'CONTENT_reference_options_outline_coloronly_prompt_md',
    },
    {
      id: 'film',
      label: 'Film',
      category: 'Photo Style',
      path: 'reference/options/photography/film/prompt.md',
      prompt: 'CONTENT_reference_options_photography_film_prompt_md',
    },
    {
      id: 'muted',
      label: 'Muted',
      category: 'Color',
      path: 'reference/options/color/muted/prompt.md',
      prompt: 'CONTENT_reference_options_color_muted_prompt_md',
    },
  ];
  const result = makePrompt(
    catalog,
    {
      'Illustration Style': ['folk'],
      Technique: ['risograph'],
      Outline: ['coloronly'],
      'Photo Style': ['film'],
      Color: ['muted'],
    },
    3,
    {},
    true,
  );
  assert.ok(result.includes('CONTENT_reference_options_photography_film_prompt_md'));
  assert.ok(result.includes('CONTENT_reference_options_color_muted_prompt_md'));
  assert.ok(!result.includes('CONTENT_reference_folk_prompt_md'));
  assert.ok(!result.includes('CONTENT_reference_options_technique_risograph_prompt_md'));
  assert.ok(!result.includes('CONTENT_reference_options_outline_coloronly_prompt_md'));
  assert.ok(!result.includes('Rendering Mode'));
});
import { parsePresets } from '../src/utils/presets.ts';
test('saved style sets validate storage, remove stale IDs and retain fields and type', () => {
  const catalog = [
    {
      id: 'folk',
      label: 'Folk',
      category: 'Illustration Style',
      path: 'reference/folk/prompt.md',
      prompt: 'CONTENT_reference_folk_prompt_md',
    },
  ];
  const valid = {
    id: '1',
    name: ' My set ',
    photo: false,
    complexity: 4,
    selection: { 'Illustration Style': ['folk', 'missing', 'folk'] },
    fields: { Subject: 'A tree', Text: 'TREE', 'Aspect Ratio': '3:4' },
  };
  const parsed = parsePresets(
    JSON.stringify([valid, valid, { ...valid, id: '2', complexity: 9 }]),
    catalog,
  );
  assert.equal(parsed.length, 1);
  assert.equal('name' in parsed[0], false);
  assert.deepEqual(parsed[0].selection['Illustration Style'], ['folk']);
  assert.equal(parsed[0].fields.Subject, 'A tree');
  assert.equal(parsed[0].complexity, 4);
  assert.equal(parsed[0].photo, false);
  assert.deepEqual(parsePresets('invalid JSON', catalog), []);
  assert.deepEqual(parsePresets('{}', catalog), []);
});
import { compactFields } from '../src/utils/promptBuilder.ts';
test('compact direction preserves legacy preset fields and typography text', () => {
  const fields = compactFields({
    Subject: 'A garden',
    Text: 'FLOWER',
    'Aspect Ratio': '3:4',
    'Additional Instructions': 'Muted light',
    'Negative Prompt': 'No frame',
  });
  assert.equal(fields['Aspect Ratio'], '3:4');
  assert.equal(Object.keys(fields).length, 5);
  assert.equal(fields.Subject, 'A garden');
  assert.ok(makePrompt([], {}, 3, fields, false).includes('Subject: A garden'));
  assert.ok(!fields['Additional Instructions'].includes('Subject:'));
  assert.equal(fields.Text, 'FLOWER');
  assert.equal(fields['Typography Enabled'], 'false');
  assert.ok(fields['Additional Instructions'].includes('Negative Prompt: No frame'));
  assert.deepEqual(compactFields(fields), fields);
  const catalog = [
    {
      id: 'groovy',
      label: 'Groovy',
      category: 'Typography',
      path: 'reference/options/typography/groovy/prompt.md',
      prompt: 'CONTENT_reference_options_typography_groovy_prompt_md',
    },
    {
      id: 'detailed',
      label: 'Detailed',
      category: 'Complexity',
      path: 'reference/options/complexity/detailed/prompt.md',
      prompt: 'CONTENT_reference_options_complexity_detailed_prompt_md',
    },
  ];
  const result = makePrompt(
    catalog,
    { Typography: ['groovy'] },
    4,
    { ...fields, 'Typography Enabled': 'true' },
    false,
  );
  assert.ok(result.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(result.includes('Complexity: Detailed'));
  assert.ok(!/Complexity:\s*\d/.test(result));
  assert.ok(result.includes('Muted light'));
});

test('Typography defaults off, supports automatic text when enabled, and restores saved settings', () => {
  const catalog = [
    {
      id: 'groovy',
      label: 'Groovy',
      category: 'Typography',
      path: 'reference/options/typography/groovy/prompt.md',
      prompt: 'CONTENT_reference_options_typography_groovy_prompt_md',
    },
  ];
  const selection = { Typography: ['groovy'] };
  const off = makePrompt(catalog, selection, 3, { Text: 'HIDDEN' }, false);
  assert.ok(!off.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(!off.includes('HIDDEN'));
  const auto = makePrompt(catalog, selection, 3, { 'Typography Enabled': 'true', Text: '' }, false);
  assert.ok(auto.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(auto.includes('Choose suitable wording freely'));
  assert.ok(!auto.includes('Typography Enabled:'));
  const exact = makePrompt(
    catalog,
    selection,
    3,
    { 'Typography Enabled': 'true', Text: 'HELLO' },
    false,
  );
  assert.ok(exact.includes('Text: HELLO'));
  assert.ok(!exact.includes('Choose suitable wording freely'));
  const restored = compactFields({
    'Typography Enabled': 'true',
    Text: 'HELLO',
    'Aspect Ratio': '3:4',
  });
  assert.equal(restored['Typography Enabled'], 'true');
  assert.equal(restored.Text, 'HELLO');
  assert.deepEqual(compactFields(restored), restored);
});

test('The three-option limit preserves existing choices, permits deselection, and blocks conflicting replacements at the limit', () => {
  const full = { Color: ['warm', 'muted', 'earthy'] };
  assert.equal(toggleOption(full, 'Color', 'cool'), full);
  assert.deepEqual(toggleOption(full, 'Color', 'warm').Color, ['muted', 'earthy']);
  assert.deepEqual(toggleOption({ Color: ['warm'] }, 'Color', 'cool').Color, ['cool']);
});

test('Blank subjects request random image content while explicit subjects remain unchanged', () => {
  for (const photo of [false, true]) {
    for (const Subject of [undefined, '', '   ']) {
      const fields: Record<string, string> = Subject === undefined ? {} : { Subject };
      const prompt = makePrompt([], {}, 3, fields, photo);
      assert.ok(prompt.includes('Subject: Not specified. Choose a random subject and scene'));
      assert.ok(prompt.includes(`create the ${photo ? 'photograph' : 'image'} without asking`));
    }
    const prompt = makePrompt([], {}, 3, { Subject: 'A cat in Seoul' }, photo);
    assert.ok(prompt.includes('Subject: A cat in Seoul'));
    assert.ok(!prompt.includes('Choose a random subject'));
  }
});

import { readdirSync, readFileSync } from 'node:fs';
import type { Option } from '../src/utils/promptBuilder.ts';
test('copied prompts contain canonical MD bodies, selected complexity and no file-reading instructions', () => {
  const paths = [
    'reference/naivefolk/prompt.md',
    'reference/options/color/muted/prompt.md',
    'reference/options/complexity/balanced/prompt.md',
    'reference/options/typography/groovy/prompt.md',
    'reference/options/photography/portrait/prompt.md',
  ];
  const catalog: Option[] = paths.map((path) => {
    const prompt = readFileSync(path, 'utf8').trim();
    return {
      path,
      prompt,
      label: prompt.match(/^## (.+)$/m)![1],
      category: prompt.match(/\*\*Category:\*\* (.+)/)![1],
      id: prompt.match(/\*\*Style ID:\*\* `([^`]+)`/)![1],
    };
  });
  const selection = {
    'Illustration Style': ['naivefolk'],
    Color: ['muted'],
    Typography: ['groovy'],
    'Photo Style': ['portrait'],
  };
  for (const photo of [false, true]) {
    const result = makePrompt(
      catalog,
      selection,
      3,
      { Subject: 'A fox', 'Typography Enabled': 'true', Text: 'FOX' },
      photo,
    );
    for (const option of catalog) {
      const included = photo
        ? option.category !== 'Illustration Style'
        : option.category !== 'Photo Style';
      assert.equal(result.includes(instructions(option)), included, option.path);
      assert.equal(
        result.includes(`## ${option.category}: ${option.label}`),
        included,
        option.path,
      );
    }
    assert.ok(!result.includes('.md'));
    assert.ok(!result.includes('Read only'));
    assert.ok(!result.includes('**Category:**'));
    assert.ok(!result.includes('**Style ID:**'));
    assert.ok(result.includes('Subject: A fox'));
    assert.ok(result.includes('Text: FOX'));
  }
  const withoutTypography = makePrompt(catalog, selection, 3, {}, false);
  assert.ok(
    !withoutTypography.includes(instructions(catalog.find((o) => o.category === 'Typography')!)),
  );
});

test('Final instructions only preserve what was requested and name Outline as Rendering Mode', () => {
  const catalog: Option[] = [
    {
      id: 'outlineonly',
      label: 'Outline Only',
      category: 'Outline',
      path: 'reference/options/outline/outlineonly/prompt.md',
      prompt:
        '## Outline Only\n\n- **Category:** Outline\n- **Style ID:** `outlineonly`\n\n### Apply\n- Lines only.',
    },
  ];
  const random = makePrompt(catalog, { Outline: ['outlineonly'] }, 3, {}, false);
  assert.ok(random.includes('## Rendering Mode: Outline Only\n### Apply\n- Lines only.'));
  assert.ok(random.includes('Rendering Mode: Outline Only'));
  assert.ok(random.includes('apply the color palette to the line colors'));
  assert.ok(random.includes('Preserve the aspect ratio.'));
  assert.ok(!random.includes('requested subject'));
  assert.ok(!random.includes('exact text'));
  assert.ok(!random.includes('## Outline'));
  const exact = makePrompt(
    [],
    {},
    3,
    { Subject: 'A fox', 'Typography Enabled': 'true', Text: 'FOX' },
    false,
  );
  assert.ok(exact.includes('Preserve the requested subject, the exact text and the aspect ratio.'));
  assert.ok(!exact.includes('Rendering Mode'));
  const design = makePrompt([], {}, 3, {}, false, true);
  assert.ok(design.startsWith('Create a finished graphic design'));
  assert.ok(design.includes('create the graphic design without asking for a subject'));
  assert.ok(makePrompt([], {}, 3, {}, true).startsWith('Create a photograph'));
});

test('Saved sets using the former category names load under the aligned names', () => {
  const catalog: Option[] = [
    { id: 'folk', label: 'Folk', category: 'Illustration Style', path: 'folk', prompt: 'F' },
    { id: 'film', label: 'Film', category: 'Photo Style', path: 'film', prompt: 'P' },
  ];
  const base = { photo: false, complexity: 3, fields: {} };
  const [illustration, photo] = parsePresets(
    JSON.stringify([
      { ...base, id: '1', selection: { 'Base Style': ['folk'] } },
      { ...base, id: '2', photo: true, selection: { Photography: ['film'] } },
    ]),
    catalog,
  );
  assert.deepEqual(illustration.selection, { 'Illustration Style': ['folk'] });
  assert.deepEqual(photo.selection, { 'Photo Style': ['film'] });
});

test('Direct contradictions replace each other in both directions; softer tensions stay selectable', () => {
  for (const [category, a, b] of [
    ['Color', 'duotone', 'primarycolors'],
    ['Color', 'monochrome', 'complementary'],
    ['Composition', 'minimal', 'layered'],
  ]) {
    assert.deepEqual(toggleOption({ [category]: [a] }, category, b)[category], [b]);
    assert.deepEqual(toggleOption({ [category]: [b] }, category, a)[category], [a]);
  }
  assert.deepEqual(
    toggleOption({ Composition: ['symmetric'] }, 'Composition', 'dynamic').Composition,
    ['symmetric', 'dynamic'],
  );
});

test('Prompts state the typography setting, blending, and a conflict priority', () => {
  const option = (category: string, id: string): Option => ({
    id,
    label: id,
    category,
    path: id,
    prompt: `## ${id}\n\n### Apply\n- ${id}`,
  });
  const catalog = [
    option('Illustration Style', 'maximalism'),
    option('Illustration Style', 'folk'),
    option('Color', 'muted'),
  ];
  const off = makePrompt(
    catalog,
    { 'Illustration Style': ['maximalism', 'folk'], Color: ['muted'] },
    1,
    {},
    false,
  );
  assert.ok(off.includes('Typography: Off'));
  assert.ok(
    off.includes(
      'Typography is Off: do not add any readable text, letters, or numbers to the image.',
    ),
  );
  assert.ok(off.includes('blend them into one unified treatment'));
  assert.ok(
    off.includes(
      'If selected instructions conflict, follow this priority: Color, then the style and technique instructions.',
    ),
  );
  const on = makePrompt(catalog, { Color: ['muted'] }, 1, { 'Typography Enabled': 'true' }, true);
  assert.ok(on.includes('Typography: On'));
  assert.ok(on.includes('Render all text legibly'));
  assert.ok(!on.includes('blend them'));
  assert.ok(!on.includes('follow this priority'));
});

test('Source prompts never depend on builder state the image model cannot see', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? files(`${dir}/${entry.name}`)
        : entry.name === 'prompt.md'
          ? [`${dir}/${entry.name}`]
          : [],
    );
  for (const path of files('reference')) {
    const text = readFileSync(path, 'utf8');
    assert.ok(
      !/typography is enabled|selected palette|selected texture|supplied wording/i.test(text),
      path,
    );
    // Negative sections were removed: they repeated Apply and over-constrained results.
    assert.ok(!text.includes('### Avoid'), path);
  }
});

test('Removed options in saved sets move to the options that absorbed them', () => {
  const option = (category: string, id: string): Option => ({
    id,
    label: id,
    category,
    path: id,
    prompt: id,
  });
  const catalog = [
    option('Technique', 'woodcut'),
    option('Technique', 'risograph'),
    option('Texture', 'filmgrain'),
    option('Texture', 'clean'),
    option('Color', 'vintage'),
    option('Color', 'blackwhite'),
    option('Color', 'vivid'),
    option('Photo Style', 'street'),
    option('Typography', 'experimentaltypography'),
  ];
  const base = { complexity: 3, fields: {} };
  const [illustration, photo] = parsePresets(
    JSON.stringify([
      {
        ...base,
        id: '1',
        photo: false,
        selection: {
          Technique: ['linocut', 'screenprinting', 'woodcut'],
          Typography: ['distortedtypography', 'kinetictypography'],
        },
      },
      {
        ...base,
        id: '2',
        photo: true,
        selection: {
          'Photo Style': ['film', 'monochrome', 'street'],
          Texture: ['clean'],
          Color: ['vivid'],
        },
      },
    ]),
    catalog,
  );
  assert.deepEqual(illustration.selection, {
    Technique: ['woodcut', 'risograph'],
    Typography: ['experimentaltypography'],
  });
  // Film Grain replaces Clean; Black & White replaces the hue-based palettes it contradicts.
  assert.deepEqual(photo.selection, {
    'Photo Style': ['street'],
    Texture: ['filmgrain'],
    Color: ['blackwhite'],
  });
});

test('Mood is an optional single choice and Lighting allows several', () => {
  assert.equal(optionLimit('Mood'), 1);
  assert.equal(optionLimit('Lighting'), 3);
  const cute = toggleOption({}, 'Mood', 'cute');
  assert.deepEqual(cute.Mood, ['cute']);
  assert.deepEqual(toggleOption(cute, 'Mood', 'epic').Mood, ['epic']);
  assert.deepEqual(toggleOption(cute, 'Mood', 'cute').Mood, []);
  assert.deepEqual(toggleOption({ 'Design Format': ['poster'] }, 'Design Format', 'poster'), {
    'Design Format': ['poster'],
  });
  for (const [photo, design] of [
    [false, false],
    [true, false],
    [false, true],
  ])
    for (const category of ['Mood', 'Lighting'])
      assert.ok(builderCategories(photo, design).includes(category));
  for (const [category, a, b] of [
    ['Color', 'highkey', 'lowkey'],
    ['Color', 'blackwhite', 'warm'],
    ['Lighting', 'goldenhour', 'neonnight'],
  ]) {
    assert.deepEqual(toggleOption({ [category]: [a] }, category, b)[category], [b]);
    assert.deepEqual(toggleOption({ [category]: [b] }, category, a)[category], [a]);
  }
  assert.deepEqual(toggleOption({ Lighting: ['goldenhour'] }, 'Lighting', 'backlit').Lighting, [
    'goldenhour',
    'backlit',
  ]);
  assert.deepEqual(aspectRatios, ['1:1', '4:5', '3:4', '2:3', '9:16', '4:3', '3:2', '16:9']);
});

test('Mood and Lighting appear in the prompt, summary and conflict priority', () => {
  const option = (category: string, id: string): Option => ({
    id,
    label: id,
    category,
    path: id,
    prompt: `## ${id}\n\n### Apply\n- ${id} body`,
  });
  const catalog = [
    option('Color', 'muted'),
    option('Lighting', 'backlit'),
    option('Mood', 'cute'),
    option('Composition', 'centered'),
  ];
  const text = makePrompt(
    catalog,
    { Color: ['muted'], Lighting: ['backlit'], Mood: ['cute'], Composition: ['centered'] },
    3,
    {},
    false,
  );
  const order = [
    '## Color: muted',
    '## Lighting: backlit',
    '## Composition: centered',
    '## Mood: cute',
  ];
  assert.deepEqual(
    order.map((heading) => text.indexOf(heading)),
    order.map((heading) => text.indexOf(heading)).sort((a, b) => a - b),
  );
  assert.ok(text.includes('Lighting: backlit\nComposition: centered\nMood: cute'));
  assert.ok(text.includes('follow this priority: Color, Lighting, Composition, Mood.'));
});

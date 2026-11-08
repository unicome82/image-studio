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
test('every category keeps one choice and older multi-choice drafts collapse to the newest', () => {
  assert.deepEqual(toggleOption({ Color: ['muted'] }, 'Color', 'vivid').Color, ['vivid']);
  assert.deepEqual(
    toggleOption({ 'Illustration Style': ['a', 'b'] }, 'Illustration Style', 'd')[
      'Illustration Style'
    ],
    ['d'],
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
  const text = makePrompt(catalog, sel, { Text: '' }, false);
  assert.ok(text.includes('CONTENT_reference_folk_prompt_md'));
  assert.ok(!text.includes('/missing/'));
  assert.ok(!text.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(!text.includes('CONTENT_reference_options_photography_film_prompt_md'));
  const full = makePrompt(catalog, sel, { Text: 'EXACT TEXT', 'Typography Enabled': 'true' }, true);
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
    JSON.stringify([valid, valid, { ...valid, id: '2', photo: 'yes' }]),
    catalog,
  );
  assert.equal(parsed.length, 1);
  assert.equal('name' in parsed[0], false);
  assert.deepEqual(parsed[0].selection['Illustration Style'], ['folk']);
  assert.equal(parsed[0].fields.Subject, 'A tree');
  // Removed fields such as the old complexity level are dropped on load.
  assert.equal('complexity' in parsed[0], false);
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
  assert.ok(makePrompt([], {}, fields, false).includes('Subject: A garden'));
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
  ];
  const result = makePrompt(
    catalog,
    { Typography: ['groovy'] },
    { ...fields, 'Typography Enabled': 'true' },
    false,
  );
  assert.ok(result.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(!result.includes('Complexity'));
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
  const off = makePrompt(catalog, selection, { Text: 'HIDDEN' }, false);
  assert.ok(!off.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(!off.includes('HIDDEN'));
  const auto = makePrompt(catalog, selection, { 'Typography Enabled': 'true', Text: '' }, false);
  assert.ok(auto.includes('CONTENT_reference_options_typography_groovy_prompt_md'));
  assert.ok(auto.includes('Choose suitable wording freely'));
  assert.ok(!auto.includes('Typography Enabled:'));
  const exact = makePrompt(
    catalog,
    selection,
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

test('A new choice replaces the previous one and choosing it again clears it', () => {
  assert.deepEqual(toggleOption({ Texture: ['papergrain'] }, 'Texture', 'clean').Texture, [
    'clean',
  ]);
  assert.deepEqual(toggleOption({ Texture: ['clean'] }, 'Texture', 'clean').Texture, []);
  assert.deepEqual(toggleOption({ Outline: ['coloronly'] }, 'Outline', 'coloronly').Outline, [
    'coloronly',
  ]);
});

test('Blank subjects request random image content while explicit subjects remain unchanged', () => {
  for (const photo of [false, true]) {
    for (const Subject of [undefined, '', '   ']) {
      const fields: Record<string, string> = Subject === undefined ? {} : { Subject };
      const prompt = makePrompt([], {}, fields, photo);
      assert.ok(prompt.includes('Subject: Not specified. Choose a random subject and scene'));
      assert.ok(prompt.includes(`create the ${photo ? 'photograph' : 'image'} without asking`));
    }
    const prompt = makePrompt([], {}, { Subject: 'A cat in Seoul' }, photo);
    assert.ok(prompt.includes('Subject: A cat in Seoul'));
    assert.ok(!prompt.includes('Choose a random subject'));
  }
});

import { readdirSync, readFileSync } from 'node:fs';
import type { Option } from '../src/utils/promptBuilder.ts';
test('copied prompts contain canonical MD bodies, the simple depiction and no file-reading instructions', () => {
  const paths = [
    'reference/naivefolk/prompt.md',
    'reference/options/color/muted/prompt.md',
    'reference/options/depiction/simple/prompt.md',
    'reference/options/typography/bubblelettering/prompt.md',
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
    Typography: ['bubblelettering'],
    'Photo Style': ['portrait'],
  };
  for (const photo of [false, true]) {
    const result = makePrompt(
      catalog,
      selection,
      { Subject: 'A fox', 'Typography Enabled': 'true', Text: 'FOX' },
      photo,
    );
    for (const option of catalog) {
      // The simple depiction is a fixed default, so it is always included.
      const included = photo
        ? option.category !== 'Illustration Style'
        : option.category !== 'Photo Style';
      // Color is selected, so style fallback lines for open Color/Lighting/Texture are dropped.
      assert.equal(result.includes(instructions(option, true)), included, option.path);
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
  const withoutTypography = makePrompt(catalog, selection, {}, false);
  assert.ok(
    !withoutTypography.includes(instructions(catalog.find((o) => o.category === 'Typography')!)),
  );
});

test('Prompts end at Settings without final instructions and name Outline as Rendering Mode', () => {
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
  const random = makePrompt(catalog, { Outline: ['outlineonly'] }, {}, false);
  assert.ok(random.includes('## Rendering Mode: Outline Only\n### Apply\n- Lines only.'));
  assert.ok(random.includes('Rendering Mode: Outline Only'));
  assert.ok(!random.includes('Final Instructions'));
  assert.ok(random.endsWith('Rendering Mode: Outline Only'));
  assert.ok(!random.includes('requested subject'));
  assert.ok(!random.includes('exact text'));
  assert.ok(!random.includes('## Outline'));
  const exact = makePrompt(
    [],
    {},
    { Subject: 'A fox', 'Typography Enabled': 'true', Text: 'FOX' },
    false,
  );
  assert.ok(exact.includes('Text: FOX'));
  assert.ok(!exact.includes('Rendering Mode'));
  const design = makePrompt([], {}, {}, false, true);
  assert.ok(design.startsWith('Create a finished graphic design'));
  assert.ok(design.includes('create the graphic design without asking for a subject'));
  assert.ok(makePrompt([], {}, {}, true).startsWith('Create a photograph'));
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

test('Prompts state the typography setting without a conflict priority', () => {
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
    { 'Illustration Style': ['maximalism'], Color: ['muted'] },
    {},
    false,
  );
  assert.ok(!off.includes('Typograph'));
  assert.ok(!off.includes('follow this priority'));
  const on = makePrompt(catalog, { Color: ['muted'] }, { 'Typography Enabled': 'true' }, true);
  assert.ok(on.includes('Typography: On'));
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
    option('Technique', 'risograph'),
    option('Technique', 'marker'),
    option('Texture', 'filmgrain'),
    option('Texture', 'clean'),
    option('Color', 'muted'),
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
          Technique: ['linocut', 'woodcut', 'handdrawn'],
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
    Technique: ['risograph'],
    Typography: ['experimentaltypography'],
  });
  // Replacements only fill empty categories, so kept choices win.
  assert.deepEqual(photo.selection, {
    'Photo Style': ['street'],
    Texture: ['clean'],
    Color: ['vivid'],
  });
});

test('Every Builder category is an optional single choice', () => {
  assert.equal(optionLimit(), 1);
  const cute = toggleOption({}, 'Mood', 'cute');
  assert.deepEqual(cute.Mood, ['cute']);
  assert.deepEqual(toggleOption(cute, 'Mood', 'bold').Mood, ['bold']);
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
    'backlit',
  ]);
  assert.deepEqual(aspectRatios, ['1:1', '4:5', '3:4', '2:3', '9:16', '4:3', '3:2', '16:9']);
});

test('Mood and Lighting appear in the prompt and summary', () => {
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
});

test('Lead style comes first, key direction opens the prompt, fallbacks drop when chosen', () => {
  const option = (category: string, id: string, prompt: string) => ({
    id,
    label: id,
    category,
    path: `reference/${id}/prompt.md`,
    prompt,
  });
  const catalog = [
    option(
      'Photo Style',
      'Portrait',
      '## Portrait\n- Lead.\n- When no Color, Lighting, or Texture instructions are given, use soft light.',
    ),
    option('Camera', 'Lens', '## Lens\n- Lens.'),
    option('Color', 'Dark', '## Dark\n- Dark.'),
  ];
  const sel = { 'Photo Style': ['Portrait'], Camera: ['Lens'] };
  const open = makePrompt(catalog, sel, { Subject: 'A fox', 'Aspect Ratio': '4:5' }, true);
  assert.ok(open.includes('use soft light'));
  const result = makePrompt(
    catalog,
    { ...sel, Color: ['Dark'] },
    { Subject: 'A fox', 'Aspect Ratio': '4:5' },
    true,
  );
  assert.ok(!result.includes('use soft light'));
  assert.ok(result.indexOf('## Photo Style') < result.indexOf('## Camera'));
  assert.ok(result.indexOf('## Camera') < result.indexOf('## Color'));
  const key = 'Subject "A fox"; Photo Style: Portrait; Camera: Lens; Aspect Ratio: 4:5';
  const lines = result.split('\n');
  assert.equal(lines[1], `Key direction: ${key}.`);
  assert.equal(lines.filter((line) => line.includes(key)).length, 1);
  assert.ok(!result.includes('Complexity'));
});

test('Every prompt adds the fixed simple depiction after the chosen options', () => {
  const depiction = {
    id: 'simple',
    label: 'Simple',
    category: 'Depiction',
    path: 'reference/options/depiction/simple/prompt.md',
    prompt: '## Simple\n\n- **Category:** Depiction\n- **Style ID:** `simple`\n\n- Keep it simple.',
  };
  const color = { id: 'muted', label: 'Muted', category: 'Color', path: 'c', prompt: '- Muted.' };
  const prompt = makePrompt([color, depiction], { Color: ['muted'] }, {}, false);
  assert.ok(prompt.indexOf('## Color: Muted') < prompt.indexOf('## Depiction: Simple'));
  assert.ok(prompt.includes('## Depiction: Simple\n- Keep it simple.'));
  assert.ok(prompt.endsWith('\nDepiction: Simple'));
});

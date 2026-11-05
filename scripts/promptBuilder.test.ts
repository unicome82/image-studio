import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePrompt, toggleOption } from '../src/utils/promptBuilder.ts';
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
    toggleOption({ 'Base Style': ['a', 'b', 'c'] }, 'Base Style', 'd')['Base Style'],
    ['a', 'b', 'c'],
  );
});
test('only existing selected paths; typography requires its switch, photography requires photo', () => {
  const catalog = [
    { id: 'folk', label: 'Folk', category: 'Base Style', path: 'reference/folk/prompt.md' },
    {
      id: 'groovy',
      label: 'Groovy',
      category: 'Typography',
      path: 'reference/options/typography/groovy/prompt.md',
    },
    {
      id: 'film',
      label: 'Film',
      category: 'Photography',
      path: 'reference/options/photography/film/prompt.md',
    },
  ];
  const sel = { 'Base Style': ['folk', 'missing'], Typography: ['groovy'], Photography: ['film'] };
  const text = makePrompt(catalog, sel, 3, { Text: '' }, false);
  assert.ok(text.includes('reference/folk/prompt.md'));
  assert.ok(!text.includes('/missing/'));
  assert.ok(!text.includes('/groovy/'));
  assert.ok(!text.includes('/film/'));
  const full = makePrompt(
    catalog,
    sel,
    3,
    { Text: 'EXACT TEXT', 'Typography Enabled': 'true' },
    true,
  );
  assert.ok(full.includes('/groovy/'));
  assert.ok(full.includes('/film/'));
  assert.ok(full.includes('Text: EXACT TEXT'));
});
test('Photo prompt excludes hidden illustration options and preserves shared options', () => {
  const catalog = [
    { id: 'folk', label: 'Folk', category: 'Base Style', path: 'reference/folk/prompt.md' },
    {
      id: 'risograph',
      label: 'Risograph',
      category: 'Technique',
      path: 'reference/options/technique/risograph/prompt.md',
    },
    {
      id: 'coloronly',
      label: 'Color Only',
      category: 'Outline',
      path: 'reference/options/outline/coloronly/prompt.md',
    },
    {
      id: 'film',
      label: 'Film',
      category: 'Photography',
      path: 'reference/options/photography/film/prompt.md',
    },
    {
      id: 'muted',
      label: 'Muted',
      category: 'Color',
      path: 'reference/options/color/muted/prompt.md',
    },
  ];
  const result = makePrompt(
    catalog,
    {
      'Base Style': ['folk'],
      Technique: ['risograph'],
      Outline: ['coloronly'],
      Photography: ['film'],
      Color: ['muted'],
    },
    3,
    {},
    true,
  );
  assert.ok(result.includes('/photography/film/'));
  assert.ok(result.includes('/color/muted/'));
  assert.ok(!result.includes('/folk/'));
  assert.ok(!result.includes('/technique/'));
  assert.ok(!result.includes('/outline/'));
  assert.ok(!result.includes('Rendering Mode'));
});
import { parsePresets } from '../src/utils/presets.ts';
test('saved style sets validate storage, remove stale IDs and retain fields and type', () => {
  const catalog = [
    { id: 'folk', label: 'Folk', category: 'Base Style', path: 'reference/folk/prompt.md' },
  ];
  const valid = {
    id: '1',
    name: ' My set ',
    photo: false,
    complexity: 4,
    selection: { 'Base Style': ['folk', 'missing', 'folk'] },
    fields: { Subject: 'A tree', Text: 'TREE', 'Aspect Ratio': '3:4' },
  };
  const parsed = parsePresets(
    JSON.stringify([valid, valid, { ...valid, id: '2', complexity: 9 }]),
    catalog,
  );
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, 'My set');
  assert.deepEqual(parsed[0].selection['Base Style'], ['folk']);
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
    },
    {
      id: 'detailed',
      label: 'Detailed',
      category: 'Complexity',
      path: 'reference/options/complexity/detailed/prompt.md',
    },
  ];
  const result = makePrompt(
    catalog,
    { Typography: ['groovy'] },
    4,
    { ...fields, 'Typography Enabled': 'true' },
    false,
  );
  assert.ok(result.includes('/typography/groovy/'));
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
    },
  ];
  const selection = { Typography: ['groovy'] };
  const off = makePrompt(catalog, selection, 3, { Text: 'HIDDEN' }, false);
  assert.ok(!off.includes('/groovy/'));
  assert.ok(!off.includes('HIDDEN'));
  const auto = makePrompt(catalog, selection, 3, { 'Typography Enabled': 'true', Text: '' }, false);
  assert.ok(auto.includes('/groovy/'));
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
    for (const Subject of ['', '   ']) {
      const prompt = makePrompt([], {}, 3, { Subject }, photo);
      assert.ok(prompt.includes('Choose a random subject and scene'));
      assert.ok(prompt.includes('without asking for a subject'));
    }
    const prompt = makePrompt([], {}, 3, { Subject: 'A cat in Seoul' }, photo);
    assert.ok(prompt.includes('Subject: A cat in Seoul'));
    assert.ok(!prompt.includes('Choose a random subject'));
  }
});

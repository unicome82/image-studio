import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  makePrompt,
  instructions,
  builderCategories,
  toggleOption,
  designFormatRatios,
  type Option,
} from '../src/utils/promptBuilder.ts';
import { parsePresets } from '../src/utils/presets.ts';
import { filterCategories, filterMetadata, pendingBuilderFilters } from '../src/utils/filters.ts';
function catalogAt(dir: string): Option[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return catalogAt(path);
    if (entry.name !== 'prompt.md') return [];
    const prompt = readFileSync(path, 'utf8').trim();
    return [
      {
        id: prompt.match(/\*\*Style ID:\*\* `([^`]+)`/)![1],
        category: prompt.match(/\*\*Category:\*\* (.+)/)![1],
        label: prompt.match(/^## (.+)$/m)![1],
        path,
        prompt,
      },
    ];
  });
}
const catalog = catalogAt('reference');
test('design prompts use canonical format/style instructions, shared options and exact subject', () => {
  const selection = {
    'Design Format': ['poster'],
    'Design Style': ['swiss'],
    Color: ['muted'],
    Outline: ['coloronly'],
    'Illustration Style': ['naivefolk'],
  };
  const fields = {
    Subject: 'A spring exhibition',
    'Aspect Ratio': '3:4',
    'Typography Enabled': 'true',
    Text: 'SPRING 2027',
  };
  const prompt = makePrompt(catalog, selection, fields, false, true);
  assert.match(prompt, /Create a finished graphic design/);
  for (const [category, id] of [
    ['Design Format', 'poster'],
    ['Design Style', 'swiss'],
    ['Color', 'muted'],
  ])
    assert.ok(
      prompt.includes(
        instructions(catalog.find((o) => o.category === category && o.id === id)!, true),
      ),
    );
  assert.match(prompt, /Subject: A spring exhibition/);
  assert.match(prompt, /Text: SPRING 2027/);
  assert.ok(
    !prompt.includes(
      instructions(
        catalog.find((o) => o.category === 'Illustration Style' && o.id === 'naivefolk')!,
      ),
    ),
  );
  assert.ok(
    !prompt.includes(
      instructions(catalog.find((o) => o.category === 'Outline' && o.id === 'coloronly')!),
    ),
  );
  assert.doesNotMatch(
    makePrompt(catalog, selection, { ...fields, 'Typography Enabled': 'false' }, false, true),
    /Typograph/,
  );
});
test('design presets round-trip with their type and rebuild the same prompt; legacy sets remain valid', () => {
  const preset = {
    id: 'design',
    name: 'Poster set',
    photo: false,
    design: true,
    selection: { 'Design Format': ['poster'], 'Design Style': ['swiss'] },
    fields: { Subject: 'Spring' },
  };
  const parsed = parsePresets(
    JSON.stringify([
      preset,
      {
        ...preset,
        id: 'legacy',
        design: undefined,
        selection: { 'Illustration Style': ['naivefolk'] },
      },
    ]),
    catalog,
  );
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].design, true);
  assert.equal(parsed[1].design, undefined);
  assert.equal(
    makePrompt(catalog, parsed[0].selection, parsed[0].fields, parsed[0].photo, parsed[0].design),
    makePrompt(catalog, preset.selection, preset.fields, false, true),
  );
  assert.deepEqual(filterMetadata(parsed[0].selection, false, '1:1', true).Type, ['design']);
});
test('design categories are separate; format and style each take one choice', () => {
  assert.ok(builderCategories(false, true).includes('Design Format'));
  assert.ok(filterCategories('design').includes('Design Style'));
  assert.ok(!filterCategories('all').includes('Design Style'));
  assert.deepEqual(
    toggleOption({ 'Design Format': ['poster'] }, 'Design Format', 'logo')['Design Format'],
    ['logo'],
  );
  assert.deepEqual(
    toggleOption({ 'Design Style': ['swiss'] }, 'Design Style', 'memphis')['Design Style'],
    ['memphis'],
  );
  assert.deepEqual(
    pendingBuilderFilters(
      {
        'Design Format': ['poster', 'logo'],
        'Design Style': ['swiss', 'bauhaus', 'retro', 'memphis'],
      },
      false,
      true,
    ),
    {
      'Design Format': ['poster', 'logo'],
      'Design Style': ['swiss', 'bauhaus', 'retro', 'memphis'],
    },
  );
});
test('every design format has a suggested default ratio', () => {
  const formats = readdirSync('reference/design/format');
  assert.equal(formats.length, 13);
  assert.deepEqual(Object.keys(designFormatRatios).sort(), [...formats].sort());
  assert.equal(designFormatRatios.website, '16:9');
  assert.equal(designFormatRatios.appscreen, '9:16');
});

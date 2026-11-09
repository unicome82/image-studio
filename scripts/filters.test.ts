import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterMetadata,
  filterCategories,
  matchesFilters,
  normalizeRatio,
  toggleFilter,
  retainFilters,
  activeFilters,
  pendingBuilderFilters,
} from '../src/utils/filters.ts';

test('selecting all options removes only that category constraint, including missing metadata', () => {
  const catalog = [
    { category: 'Color', id: 'muted' },
    { category: 'Color', id: 'vivid' },
    { category: 'Illustration Style', id: 'naivefolk' },
    { category: 'Illustration Style', id: 'bauhaus' },
  ];
  const effective = activeFilters(
    { Color: ['muted', 'vivid'], 'Illustration Style': ['naivefolk'] },
    catalog,
  );
  assert.deepEqual(effective, { 'Illustration Style': ['naivefolk'] });
  assert.equal(matchesFilters({ 'Illustration Style': ['naivefolk'] }, effective), true);
  assert.equal(matchesFilters({ 'Illustration Style': ['bauhaus'] }, effective), false);
  assert.deepEqual(activeFilters({ Color: [] }, catalog), {});
});

test('filters have no selection limit and builder handoff retains every unresolved candidate', () => {
  let filters = {};
  for (const id of ['a', 'b', 'c', 'd', 'e']) filters = toggleFilter(filters, 'Color', id);
  assert.deepEqual(pendingBuilderFilters(filters, false), { Color: ['a', 'b', 'c', 'd', 'e'] });
  assert.deepEqual(pendingBuilderFilters({ Color: ['a'] }, false), {});
  // Texture and ratio are gallery-only filters and never reach the mockup Builder.
  assert.deepEqual(
    pendingBuilderFilters({ Texture: ['a', 'b'], 'Aspect Ratio': ['1:1', '4:5'] }, false),
    {},
  );
  const singles = { Outline: ['coloronly', 'outlineonly'] };
  assert.deepEqual(pendingBuilderFilters(singles, false), singles);
  assert.deepEqual(pendingBuilderFilters({ Outline: singles.Outline }, true), {});
});

test('no type shows every style; chosen types show only their own styles', () => {
  const all = filterCategories({});
  for (const category of ['Illustration Style', 'Photo Style', 'Design Format', 'Design Style'])
    assert.ok(all.includes(category), category);
  const photoDesign = filterCategories({ Type: ['photo', 'design'] });
  assert.ok(photoDesign.includes('Photo Style') && photoDesign.includes('Design Style'));
  assert.ok(!photoDesign.includes('Illustration Style') && !photoDesign.includes('Outline'));
  assert.deepEqual(filterCategories({ Type: ['photo'] }), [
    'Type',
    'Aspect Ratio',
    'Photo Style',
    'Color',
    'Texture',
  ]);
});

test('changing type preserves shared selections and drops incompatible filters without mutation', () => {
  const filters = {
    'Illustration Style': ['naivefolk'],
    Outline: ['coloronly'],
    Color: ['muted'],
    'Aspect Ratio': ['4:5'],
  };
  const expected = { Type: ['photo'], Color: ['muted'], 'Aspect Ratio': ['4:5'] };
  assert.deepEqual(retainFilters({ ...filters, Type: ['photo'] }), expected);
  assert.deepEqual(retainFilters(filters), filters);
  assert.deepEqual(filters['Illustration Style'], ['naivefolk']);
});

test('styles of different types are alternatives; a style choice shows only that style', () => {
  const pop = filterMetadata({ 'Illustration Style': ['popart'] }, false, '1:1');
  const portrait = filterMetadata({ 'Photo Style': ['portrait'] }, true, '1:1');
  const onlyPop = { 'Illustration Style': ['popart'] };
  assert.equal(matchesFilters(pop, onlyPop), true);
  assert.equal(matchesFilters(portrait, onlyPop), false);
  const either = { 'Illustration Style': ['popart'], 'Photo Style': ['portrait'] };
  assert.equal(matchesFilters(pop, either), true);
  assert.equal(matchesFilters(portrait, either), true);
  const poster = filterMetadata(
    { 'Design Format': ['poster'], 'Design Style': ['swiss'] },
    false,
    '3:4',
    true,
  );
  assert.equal(
    matchesFilters(poster, { 'Design Format': ['poster'], 'Design Style': ['swiss'] }),
    true,
  );
  assert.equal(
    matchesFilters(poster, { 'Design Format': ['poster'], 'Design Style': ['retro'] }),
    false,
  );
});

test('empty filters include records even when they have no option metadata', () => {
  assert.equal(matchesFilters({}, {}), true);
  assert.equal(matchesFilters({}, { Color: [] }), true);
});

test('filters combine alternatives within categories and require every selected category', () => {
  const filters = { 'Illustration Style': ['bauhaus', 'naivefolk'], Color: ['muted'] };
  assert.equal(
    matchesFilters({ 'Illustration Style': ['naivefolk'], Color: ['muted'] }, filters),
    true,
  );
  assert.equal(
    matchesFilters({ 'Illustration Style': ['bauhaus'], Color: ['vivid'] }, filters),
    false,
  );
  assert.equal(matchesFilters({ 'Illustration Style': ['bauhaus'] }, filters), false);
  assert.equal(
    matchesFilters({ 'Illustration Style': ['midcentury'], Color: ['muted'] }, filters),
    false,
  );
});

test('removing the last filter restores all records without mutating prior state', () => {
  const filters = { Technique: ['risograph'] };
  const cleared = toggleFilter(filters, 'Technique', 'risograph');
  assert.equal(matchesFilters({}, cleared), true);
  assert.deepEqual(filters, { Technique: ['risograph'] });
});

test('image dimensions and saved aspect ratios match equivalent reduced ratios', () => {
  assert.equal(normalizeRatio('1200:1500'), '4:5');
  assert.equal(normalizeRatio('1:1'), '1:1');
  assert.equal(normalizeRatio('invalid'), 'invalid');
  const image = filterMetadata({ Technique: ['risograph'] }, false, '1200:1500');
  assert.equal(matchesFilters(image, { Type: ['illustration'], 'Aspect Ratio': ['4:5'] }), true);
  assert.equal(matchesFilters(image, { 'Aspect Ratio': ['1:1'] }), false);
  const preset = filterMetadata({ 'Photo Style': ['film'] }, true, '1200:1500');
  assert.equal(matchesFilters(preset, { Type: ['photo'], 'Aspect Ratio': ['4:5'] }), true);
});

test('image types are multi-select filter buttons; one type unlocks its own options', async () => {
  const { filterTypeOf } = await import('../src/utils/filters.ts');
  assert.equal(filterTypeOf({}), 'all');
  assert.equal(filterTypeOf({ Type: ['photo'] }), 'photo');
  assert.equal(filterTypeOf({ Type: ['photo', 'design'] }), 'all');
  assert.equal(filterCategories({})[0], 'Type');
  const both = { Type: ['illustration', 'photo'] };
  assert.equal(matchesFilters(filterMetadata({}, true, '1:1'), both), true);
  assert.equal(matchesFilters(filterMetadata({}, false, '1:1', true), both), false);
});

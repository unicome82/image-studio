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
  assert.deepEqual(pendingBuilderFilters({ Texture: ['a'] }, false), {});
  assert.deepEqual(pendingBuilderFilters({ Texture: ['a', 'b'] }, false), {
    Texture: ['a', 'b'],
  });
  const singles = {
    Outline: ['coloronly', 'outlineonly'],
    'Aspect Ratio': ['1:1', '4:5'],
  };
  assert.deepEqual(pendingBuilderFilters(singles, false), singles);
  assert.deepEqual(pendingBuilderFilters({ Outline: singles.Outline }, true), {});
});

test('All and Design show shared filters while illustration and photo expose their own options', () => {
  for (const type of ['all', 'design'] as const) {
    assert.ok(filterCategories(type).includes('Color'));
    assert.ok(!filterCategories(type).includes('Illustration Style'));
    assert.ok(!filterCategories(type).includes('Photo Style'));
    assert.ok(!filterCategories(type).includes('Outline'));
  }
  assert.ok(filterCategories('illustration').includes('Illustration Style'));
  assert.ok(filterCategories('photo').includes('Photo Style'));
});

test('changing type preserves shared selections and drops incompatible filters without mutation', () => {
  const filters = {
    'Illustration Style': ['naivefolk'],
    Outline: ['coloronly'],
    Color: ['muted'],
    'Aspect Ratio': ['4:5'],
  };
  const expected = { Color: ['muted'], 'Aspect Ratio': ['4:5'] };
  assert.deepEqual(retainFilters(filters, 'photo'), expected);
  assert.deepEqual(retainFilters(filters, 'all'), expected);
  assert.deepEqual(retainFilters(filters, 'illustration'), filters);
  assert.deepEqual(filters['Illustration Style'], ['naivefolk']);
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

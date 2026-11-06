import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterMetadata,
  matchesFilters,
  normalizeRatio,
  toggleFilter,
} from '../src/utils/filters.ts';

test('empty filters include records even when they have no option metadata', () => {
  assert.equal(matchesFilters({}, {}), true);
  assert.equal(matchesFilters({}, { Color: [] }), true);
});

test('filters combine alternatives within categories and require every selected category', () => {
  const filters = { 'Base Style': ['bauhaus', 'naivefolk'], Color: ['muted'] };
  assert.equal(matchesFilters({ 'Base Style': ['naivefolk'], Color: ['muted'] }, filters), true);
  assert.equal(matchesFilters({ 'Base Style': ['bauhaus'], Color: ['vivid'] }, filters), false);
  assert.equal(matchesFilters({ 'Base Style': ['bauhaus'] }, filters), false);
  assert.equal(matchesFilters({ 'Base Style': ['midcentury'], Color: ['muted'] }, filters), false);
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
  assert.equal(matchesFilters(image, { Complexity: ['3'] }), false);
  const preset = filterMetadata({ Photography: ['film'] }, true, '1200:1500', 3);
  assert.equal(
    matchesFilters(preset, { Type: ['photo'], 'Aspect Ratio': ['4:5'], Complexity: ['3'] }),
    true,
  );
});

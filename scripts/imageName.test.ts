import test from 'node:test';
import assert from 'node:assert/strict';
import { imageName } from '../src/utils/imageName.ts';
test('Image names preserve exact filenames instead of translating labels or adding sequence numbers', () => {
  assert.equal(
    imageName({ fileName: 'Summer.Flowers-01.PNG', label: 'Botanical Illustration', index: 3 }),
    'Summer.Flowers-01.PNG',
  );
  assert.equal(imageName({ label: 'Naive Folk Art', index: 0 }), 'Naive Folk Art 01');
  assert.equal(imageName({ label: 'Untitled' }), 'Untitled');
});

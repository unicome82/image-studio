import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { recipes, matchesRecipe } from '../src/utils/recipes.ts';
import {
  aspectRatios,
  builderCategories,
  makePrompt,
  optionLimit,
} from '../src/utils/promptBuilder.ts';
import en from '../src/locales/en.ts';
import ko from '../src/locales/ko.ts';

function catalog(dir = 'reference'): { category: string; id: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return catalog(path);
    if (entry.name !== 'prompt.md') return [];
    const text = readFileSync(path, 'utf8');
    return [
      {
        category: text.match(/\*\*Category:\*\* (.+)/)![1],
        id: text.match(/\*\*Style ID:\*\* `([^`]+)`/)![1],
      },
    ];
  });
}

test('Recipes use real catalog options within Builder limits and translated names', () => {
  const options = catalog();
  for (const recipe of recipes) {
    const photo = recipe.type === 'photo';
    const design = recipe.type === 'design';
    assert.ok(aspectRatios.includes(recipe.ratio), recipe.id);
    assert.ok(en[recipe.label] && ko[recipe.label], recipe.label);
    for (const [category, ids] of Object.entries(recipe.selection)) {
      assert.ok(builderCategories(photo, design).includes(category), `${recipe.id} ${category}`);
      assert.ok(ids.length <= optionLimit(), `${recipe.id} ${category}`);
      for (const id of ids)
        assert.ok(
          options.some((o) => o.category === category && o.id === id),
          `${recipe.id} ${category}:${id}`,
        );
    }
    assert.ok(matchesRecipe(recipe, recipe.selection, recipe.complexity, recipe.ratio));
    assert.ok(!matchesRecipe(recipe, recipe.selection, recipe.complexity, '16:9'));
  }
});

test('Every prompt carries the lead, scene direction and quality standard', () => {
  const style = { id: 'x', label: 'X', category: 'Photo Style', path: 'x', prompt: 'x' };
  const prompt = makePrompt([style], { 'Photo Style': ['x'] }, 3, { Subject: 'A cup' }, true);
  assert.ok(prompt.includes('Let the Photo Style define the overall concept'));
  assert.ok(
    prompt.includes('Art-direct the requested subject as a specific, fully realized scene'),
  );
  assert.ok(prompt.includes('high-end editorial or portfolio photograph'));
  const random = makePrompt([], {}, 3, {}, false);
  assert.ok(!random.includes('define the overall concept'));
  assert.ok(random.includes('Art-direct the chosen subject'));
});

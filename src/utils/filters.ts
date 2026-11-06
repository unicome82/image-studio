import type { Selection } from './promptBuilder';

// OR within a category, AND between categories. Missing metadata never implies a match.
export function matchesFilters(metadata: Selection, filters: Selection): boolean {
  return Object.entries(filters).every(
    ([category, ids]) => ids.length === 0 || ids.some((id) => metadata[category]?.includes(id)),
  );
}

export function toggleFilter(filters: Selection, category: string, id: string): Selection {
  const ids = filters[category] ?? [];
  return {
    ...filters,
    [category]: ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
  };
}

export function normalizeRatio(ratio: string): string {
  const [width, height] = ratio.split(':').map(Number);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0)
    return ratio;
  let a = width;
  let b = height;
  while (b) [a, b] = [b, a % b];
  return `${width / a}:${height / a}`;
}

export function filterMetadata(
  selection: Selection,
  photo: boolean,
  ratio: string,
  complexity?: number,
): Selection {
  return {
    ...selection,
    Type: [photo ? 'photo' : 'illustration'],
    'Aspect Ratio': [normalizeRatio(ratio)],
    ...(complexity === undefined ? {} : { Complexity: [String(complexity)] }),
  };
}

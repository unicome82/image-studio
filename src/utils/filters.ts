import { builderCategories, optionLimit, type Option, type Selection } from './promptBuilder.ts';

export type FilterType = 'all' | 'illustration' | 'photo' | 'design';

export function filterCategories(type: FilterType): string[] {
  return [
    'Aspect Ratio',
    ...(type === 'illustration'
      ? builderCategories(false)
      : type === 'design'
        ? builderCategories(false, true)
        : type === 'photo'
          ? builderCategories(true)
          : ['Mood', 'Color', 'Lighting', 'Composition', 'Texture', 'Typography']),
  ];
}

export function retainFilters(filters: Selection, type: FilterType): Selection {
  const allowed = new Set(filterCategories(type));
  return Object.fromEntries(Object.entries(filters).filter(([category]) => allowed.has(category)));
}

export function activeFilters(
  filters: Selection,
  catalog: Pick<Option, 'category' | 'id'>[],
): Selection {
  return Object.fromEntries(
    Object.entries(filters).filter(([category, ids]) => {
      const options = catalog.filter((option) => option.category === category);
      return (
        ids.length > 0 &&
        !(options.length > 0 && options.every((option) => ids.includes(option.id)))
      );
    }),
  );
}

export function pendingBuilderFilters(
  filters: Selection,
  photo: boolean,
  design = false,
): Selection {
  const categories = [...builderCategories(photo, design), 'Aspect Ratio'];
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([category, ids]) => categories.includes(category) && ids.length > optionLimit(),
    ),
  );
}

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
  design = false,
): Selection {
  return {
    ...selection,
    Type: [design ? 'design' : photo ? 'photo' : 'illustration'],
    'Aspect Ratio': [normalizeRatio(ratio)],
  };
}

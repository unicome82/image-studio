import {
  builderCategories,
  optionLimit,
  type ImageType,
  type Option,
  type Selection,
} from './promptBuilder.ts';

export type FilterType = 'all' | 'illustration' | 'photo' | 'design';

export const imageTypes: ImageType[] = ['illustration', 'photo', 'design'];
// Each type's own style categories; the remaining filter categories are shared.
const styleCategories: Record<ImageType, string[]> = {
  illustration: ['Illustration Style'],
  photo: ['Photo Style'],
  design: ['Design Format', 'Design Style'],
};
/** The chosen image types, or every type when none is chosen. */
export function filterTypes(filters: Selection): ImageType[] {
  const chosen = imageTypes.filter((type) => filters.Type?.includes(type));
  return chosen.length ? chosen : imageTypes;
}
// The Builder and saved mockups follow a single chosen type; several or none read as all.
export function filterTypeOf(filters: Selection): FilterType {
  const chosen = imageTypes.filter((type) => filters.Type?.includes(type));
  return chosen.length === 1 ? chosen[0] : 'all';
}

// Styles of every chosen type (all types when none is chosen) plus the shared options.
export function filterCategories(filters: Selection): string[] {
  const types = filterTypes(filters);
  return [
    'Type',
    'Aspect Ratio',
    ...types.flatMap((type) => styleCategories[type]),
    'Color',
    'Tone',
    ...(types.includes('illustration') ? ['Outline'] : []),
    'Texture',
  ];
}

export function retainFilters(filters: Selection): Selection {
  const allowed = new Set(filterCategories(filters));
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
  const categories = builderCategories(photo, design);
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([category, ids]) => categories.includes(category) && ids.length > optionLimit(),
    ),
  );
}

// OR within a category, AND between categories. Missing metadata never implies a match.
// Style filters of different types are alternatives: an image matches the styles of its own type.
export function matchesFilters(metadata: Selection, filters: Selection): boolean {
  const matches = ([category, ids]: [string, string[]]) =>
    ids.length === 0 || ids.some((id) => metadata[category]?.includes(id));
  const styled = imageTypes
    .map((type) => styleCategories[type].filter((category) => filters[category]?.length))
    .filter((categories) => categories.length);
  const styleMatch =
    styled.length === 0 ||
    styled.some((categories) =>
      categories.every((category) => matches([category, filters[category]])),
    );
  const styles = new Set(Object.values(styleCategories).flat());
  return (
    styleMatch &&
    Object.entries(filters)
      .filter(([category]) => !styles.has(category))
      .every(matches)
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

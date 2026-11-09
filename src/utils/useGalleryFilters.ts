import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from 'virtual:prompt-catalog';
import { sortCollection, type CollectionSort } from './collectionSort';
import { imageName } from './imageName';
import { optionLabelKey } from './optionChoices';
import {
  activeFilters,
  filterMetadata,
  filterTypeOf,
  imageTypes,
  matchesFilters,
  normalizeRatio,
  retainFilters,
  toggleFilter,
} from './filters';
import { aspectRatios, type Selection } from './promptBuilder';
import { sampleImages } from './sampleImages';

const leadCategory = {
  illustration: 'Illustration Style',
  photo: 'Photo Style',
  design: 'Design Format',
};
const typeLabel = { illustration: 'Illustration', photo: 'Photo', design: 'Design' };
export const filterCatalog = [
  // Image types are multi-select buttons like any other filter category.
  ...imageTypes.map((id) => ({ id, label: typeLabel[id], category: 'Type', path: '', prompt: '' })),
  ...catalog,
  // Ratios cover the Builder choices plus any generated image's own shape.
  ...[
    ...new Set([
      ...aspectRatios,
      ...sampleImages.map((image) => normalizeRatio(`${image.width}:${image.height}`)),
    ]),
  ].map((ratio) => ({ id: ratio, label: ratio, category: 'Aspect Ratio', path: '', prompt: '' })),
];
// Every gallery tile is a generated image carrying the settings that made it.
const tiles = sampleImages.map((image, index) => {
  const category = leadCategory[image.type];
  const id = image.selection[category]?.[0] ?? image.type;
  return {
    id: `image-${image.fileName.replace(/\.\w+$/, '')}`,
    type: image.type,
    group: id,
    label: catalog.find((o) => o.category === category && o.id === id)?.label ?? id,
    fileName: image.fileName,
    src: `${import.meta.env.BASE_URL}samples/${image.fileName}`,
    color: image.color,
    index,
    width: image.width,
    height: image.height,
    fields: image.fields,
    selection: image.selection,
  };
});

interface Options {
  onlySaved: boolean;
  bookmarks: string[];
  favoriteSort: CollectionSort;
  // Runs after any filter, type or query change, e.g. to close the image detail.
  onChange: () => void;
}

export function useGalleryFilters({ onlySaved, bookmarks, favoriteSort, onChange }: Options) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Selection>({});
  const filterType = filterTypeOf(filters);
  const [query, setQuery] = useState('');
  const effectiveFilters = activeFilters(filters, filterCatalog);
  // Every word must appear in the image name or one of its tags; a leading # is ignored.
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/^#+/, ''))
    .filter(Boolean);
  const label = (option?: { label: string; category?: string }) =>
    option ? [option.label, t(optionLabelKey(option))] : [];
  // Categories some image actually carries; the filter panel hides the rest.
  const availableCategories = new Set<string>();
  const visible = tiles.filter((tile) => {
    [...Object.keys(tile.selection), 'Type', 'Aspect Ratio'].forEach((category) =>
      availableCategories.add(category),
    );
    const ratio = `${tile.width}:${tile.height}`;
    const applied = Object.entries(tile.selection).flatMap(([category, ids]) =>
      ids.map((id) => catalog.find((o) => o.category === category && o.id === id)),
    );
    // Mirrors the thumbnail and detail tags: name, subject, type, ratio and every applied option.
    const text = [
      imageName(tile),
      tile.fields.Subject ?? '',
      tile.group,
      ...applied.flatMap(label),
      typeLabel[tile.type],
      t(typeLabel[tile.type]),
      ratio,
      normalizeRatio(ratio),
    ]
      .join(' ')
      .toLowerCase();
    return (
      terms.every((term) => text.includes(term)) &&
      (!onlySaved || bookmarks.includes(tile.id)) &&
      matchesFilters(
        filterMetadata(tile.selection, tile.type === 'photo', ratio, tile.type === 'design'),
        effectiveFilters,
      )
    );
  });
  const displayGroups = onlySaved
    ? [
        {
          id: 'favorites',
          label: 'Favorites',
          tiles: sortCollection(visible, favoriteSort, (tile) => bookmarks.indexOf(tile.id)),
        },
      ]
    : [{ id: 'all', label: 'All', tiles: visible }];
  return {
    filters,
    effectiveFilters,
    availableCategories: [...availableCategories],
    filterType,
    query,
    displayGroups,
    toggle(category: string, id: string) {
      const next = toggleFilter(filters, category, id);
      // Changing the types keeps shared choices and drops options the new type set lacks.
      setFilters(category === 'Type' ? retainFilters(next, filterTypeOf(next)) : next);
      onChange();
    },
    reset() {
      setFilters({});
      setQuery('');
      onChange();
    },
    search(value: string) {
      setQuery(value);
      onChange();
    },
    // Header navigation clears the query or the whole filter state without other side effects.
    clearQuery: () => setQuery(''),
    clearAll() {
      setFilters({});
      setQuery('');
    },
  };
}

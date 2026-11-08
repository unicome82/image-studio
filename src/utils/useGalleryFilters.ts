import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from 'virtual:prompt-catalog';
import { sortCollection, type CollectionSort } from './collectionSort';
import { imageName } from './imageName';
import { optionLabelKey } from './optionChoices';
import {
  activeFilters,
  filterMetadata,
  matchesFilters,
  normalizeRatio,
  retainFilters,
  toggleFilter,
  type FilterType,
} from './filters';
import { aspectRatios, toggleOption, type Selection } from './promptBuilder';
import { sampleImages } from './sampleImages';

// Sample tile heights at a 1200px width; their ratios also seed the ratio filter.
const sampleHeights = [1500, 900, 1800, 1200, 1600, 1000, 1400, 1900];
export const filterCatalog = [
  ...catalog.filter((option) => option.category !== 'Depiction'),
  ...[
    {
      category: 'Aspect Ratio',
      options: [
        ...new Set([
          ...aspectRatios,
          ...sampleHeights.map((height) => normalizeRatio(`1200:${height}`)),
        ]),
      ].map((ratio) => ({ id: ratio, label: ratio })),
    },
  ].flatMap(({ category, options }) =>
    options.map((option) => ({ ...option, category, path: '', prompt: '' })),
  ),
];
const groups = [
  {
    id: 'naivefolk',
    label: 'Naive Folk Art',
    colors: [
      '#e9d5bb',
      '#d4dbce',
      '#d8b5a6',
      '#e6d6aa',
      '#c5cfd0',
      '#e0bfa9',
      '#d5cfb5',
      '#c6c3b4',
    ],
  },
  {
    id: 'midcentury',
    label: 'Mid-century',
    colors: [
      '#d2b28a',
      '#a9b1a0',
      '#cfaa8c',
      '#c1bca0',
      '#d6c3a2',
      '#a6b8b7',
      '#d8bd9f',
      '#bab69c',
    ],
  },
  {
    id: 'bauhaus',
    label: 'Bauhaus',
    colors: [
      '#c3cbd4',
      '#d6b5a3',
      '#dec99a',
      '#b1b9aa',
      '#d7bca5',
      '#c2b4a8',
      '#b9c6c5',
      '#d3c9b4',
    ],
  },
  {
    id: 'risograph',
    label: 'Risograph',
    colors: [
      '#dbb4b4',
      '#b8c3c9',
      '#e0c599',
      '#bcc6ac',
      '#d4b6a0',
      '#c8becd',
      '#b6c4bc',
      '#d9cbb3',
    ],
  },
];
// Styles that only have generated images come first, ahead of the color placeholders.
const illustrationGroups = [
  ...Object.keys(sampleImages)
    .filter((id) => !groups.some((group) => group.id === id))
    .map((id) => ({
      id,
      label: catalog.find((o) => o.category === 'Illustration Style' && o.id === id)!.label,
      colors: [] as string[],
    })),
  ...groups,
];
const photoGroups = ['portrait', 'cinematic', 'editorial', 'stilllife'].map((id, i) => ({
  id,
  label: catalog.find((o) => o.category === 'Photo Style' && o.id === id)!.label,
  colors: groups[i].colors,
}));

// Sample tiles get stable pseudo-random options so every filterable category has real values.
const sampleCategories = ['Mood', 'Color', 'Lighting', 'Composition', 'Texture'];
function seeded(key: string) {
  let seed = [...key].reduce(
    (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619),
    2166136261,
  );
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 2246822507);
    seed = Math.imul(seed ^ (seed >>> 13), 3266489909);
    return ((seed ^= seed >>> 16) >>> 0) / 4294967296;
  };
}
function sampleOptions(id: string, style: Selection, photo: boolean) {
  const random = seeded(id);
  const pick = (selection: Selection, category: string, count: number) => {
    const ids = catalog.filter((option) => option.category === category).map((option) => option.id);
    let next = selection;
    for (let i = 0; i < count && ids.length; i++)
      next = toggleOption(next, category, ids[Math.floor(random() * ids.length)]);
    return next;
  };
  let selection = style;
  if (!photo) {
    if (!style.Technique) selection = pick(selection, 'Technique', 1);
    selection = pick(selection, 'Outline', 1);
  }
  for (const category of sampleCategories)
    selection = pick(selection, category, category === 'Color' ? 2 : 1);
  return { selection };
}

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
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [query, setQuery] = useState('');
  const effectiveFilters = activeFilters(filters, filterCatalog);
  const sources = [
    { photo: false, groups: illustrationGroups },
    { photo: true, groups: photoGroups },
  ].filter(
    (source) =>
      filterType === 'all' ||
      (source.photo ? filterType === 'photo' : filterType === 'illustration'),
  );
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
  const tileGroups = sources.flatMap((source) =>
    source.groups.map((group) => {
      const styleCategory = source.photo
        ? 'Photo Style'
        : group.id === 'risograph'
          ? 'Technique'
          : 'Illustration Style';
      const type = source.photo ? 'Photo' : 'Illustration';
      return {
        id: group.id,
        label: group.label,
        tiles: [
          ...(source.photo ? [] : (sampleImages[group.id] ?? [])).map((image, index) => ({
            id: `image-${group.id}-${index}`,
            group: group.id,
            label: group.label,
            fileName: image.fileName,
            src: `${import.meta.env.BASE_URL}samples/${image.fileName}`,
            color: image.color,
            index,
            width: image.width,
            height: image.height,
            selection: image.selection,
          })),
          ...group.colors.map((color, index) => {
            const id = `${source.photo ? 'photo' : 'illustration'}-${group.id}-${index}`;
            return {
              id,
              group: group.id,
              label: group.label,
              color,
              index,
              width: 1200,
              height: sampleHeights[index],
              ...sampleOptions(id, { [styleCategory]: [group.id] }, source.photo),
            };
          }),
        ].filter((tile) => {
          [...Object.keys(tile.selection), 'Aspect Ratio'].forEach((category) =>
            availableCategories.add(category),
          );
          const ratio = `${tile.width}:${tile.height}`;
          const applied = Object.entries(tile.selection).flatMap(([category, ids]) =>
            ids.map((id) => catalog.find((o) => o.category === category && o.id === id)),
          );
          // Mirrors the thumbnail and detail tags: name, type, ratio and every applied option.
          const text = [
            imageName(tile),
            group.label,
            t(group.label),
            group.id,
            ...applied.flatMap(label),
            type,
            t(type),
            ratio,
            normalizeRatio(ratio),
          ]
            .join(' ')
            .toLowerCase();
          return (
            terms.every((term) => text.includes(term)) &&
            (!onlySaved || bookmarks.includes(tile.id)) &&
            matchesFilters(filterMetadata(tile.selection, source.photo, ratio), effectiveFilters)
          );
        }),
      };
    }),
  );
  const displayGroups = onlySaved
    ? [
        {
          id: 'favorites',
          label: 'Favorites',
          tiles: sortCollection(
            tileGroups.flatMap((group) => group.tiles),
            favoriteSort,
            (tile) => bookmarks.indexOf(tile.id),
          ),
        },
      ]
    : [{ id: 'all', label: 'All', tiles: tileGroups.flatMap((group) => group.tiles) }];
  return {
    filters,
    effectiveFilters,
    availableCategories: [...availableCategories],
    filterType,
    query,
    displayGroups,
    toggle(category: string, id: string) {
      setFilters(toggleFilter(filters, category, id));
      onChange();
    },
    reset() {
      setFilters({});
      setQuery('');
      onChange();
    },
    changeType(type: FilterType) {
      setFilterType(type);
      setFilters((previous) => retainFilters(previous, type));
      onChange();
    },
    search(value: string) {
      setQuery(value);
      onChange();
    },
    // Header navigation clears the query or the whole filter state without other side effects.
    clearQuery: () => setQuery(''),
    clearAll() {
      setFilterType('all');
      setFilters({});
      setQuery('');
    },
  };
}

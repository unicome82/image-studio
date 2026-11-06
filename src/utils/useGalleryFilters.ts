import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from 'virtual:prompt-catalog';
import { sortCollection, type CollectionSort } from './collectionSort';
import {
  activeFilters,
  filterMetadata,
  matchesFilters,
  normalizeRatio,
  retainFilters,
  toggleFilter,
  type FilterType,
} from './filters';
import { aspectRatios, complexityUiLabels, type Selection } from './promptBuilder';

// Sample tile heights at a 1200px width; their ratios also seed the ratio filter.
const sampleHeights = [1500, 900, 1800, 1200, 1600, 1000, 1400, 1900];
export const filterCatalog = [
  ...catalog.filter((option) => option.category !== 'Complexity'),
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
    {
      category: 'Complexity',
      options: complexityUiLabels.map((label, index) => ({ id: String(index + 1), label })),
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
const photoGroups = ['film', 'cinematic', 'editorial', 'stilllife'].map((id, i) => ({
  id,
  label: catalog.find((o) => o.category === 'Photography' && o.id === id)!.label,
  colors: groups[i].colors,
}));

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
    { photo: false, groups },
    { photo: true, groups: photoGroups },
  ].filter(
    (source) =>
      filterType === 'all' ||
      (source.photo ? filterType === 'photo' : filterType === 'illustration'),
  );
  const tileGroups = sources.flatMap((source) =>
    source.groups
      .filter((group) =>
        `${group.label} ${t(group.label)} ${group.id}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
      .map((group) => ({
        id: group.id,
        label: group.label,
        tiles: group.colors
          .map((color, index) => ({
            id: `${source.photo ? 'photo' : 'illustration'}-${group.id}-${index}`,
            group: group.id,
            label: group.label,
            color,
            index,
            width: 1200,
            height: sampleHeights[index],
          }))
          .filter(
            (tile) =>
              (!onlySaved || bookmarks.includes(tile.id)) &&
              matchesFilters(
                filterMetadata(
                  {
                    [source.photo
                      ? 'Photography'
                      : group.id === 'risograph'
                        ? 'Technique'
                        : 'Base Style']: [group.id],
                  },
                  source.photo,
                  `${tile.width}:${tile.height}`,
                ),
                effectiveFilters,
              ),
          ),
      })),
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

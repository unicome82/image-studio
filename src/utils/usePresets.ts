import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from 'virtual:prompt-catalog';
import { sortCollection, type CollectionSort } from './collectionSort';
import { filterMetadata, matchesFilters, type FilterType } from './filters';
import { parsePresets, presetKey, type StylePreset } from './presets';
import type { Selection } from './promptBuilder';
import type { PresetSettings } from './useBuilderDraft';

interface Options {
  filterType: FilterType;
  query: string;
  effectiveFilters: Selection;
  showToast: (message: string) => void;
}

export function usePresets({ filterType, query, effectiveFilters, showToast }: Options) {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<StylePreset[]>(() => {
    try {
      return parsePresets(localStorage.getItem(presetKey), catalog);
    } catch {
      return [];
    }
  });
  const [presetSort, setPresetSort] = useState<CollectionSort>('newest');
  useEffect(() => {
    // Drop legacy fields such as saved names; only parsed settings remain in storage.
    try {
      localStorage.setItem(presetKey, JSON.stringify(presets));
    } catch {
      /* Storage may be disabled. */
    }
  }, []);
  const presetTitle = (preset: StylePreset) => preset.fields.Subject?.trim() || t('Random image');
  const visiblePresets = sortCollection(
    presets.filter(
      (preset) =>
        (filterType === 'all' ||
          (preset.design
            ? filterType === 'design'
            : preset.photo
              ? filterType === 'photo'
              : filterType === 'illustration')) &&
        presetTitle(preset).toLowerCase().includes(query.trim().toLowerCase()) &&
        matchesFilters(
          filterMetadata(
            preset.selection,
            preset.photo,
            preset.fields['Aspect Ratio'] || '1:1',
            preset.complexity,
            preset.design,
          ),
          effectiveFilters,
        ),
    ),
    presetSort,
    (preset) => -presets.indexOf(preset),
  );
  function persist(next: StylePreset[]) {
    try {
      localStorage.setItem(presetKey, JSON.stringify(next));
      setPresets(next);
      return true;
    } catch {
      showToast('Could not save. Browser storage is unavailable or full.');
      return false;
    }
  }
  // Saves a new style set, or overwrites the one with the given id.
  function save(settings: PresetSettings, id?: string) {
    const value: StylePreset = {
      id: id ?? crypto.randomUUID(),
      photo: settings.photo,
      design: !!settings.design,
      selection: structuredClone(settings.selection),
      complexity: settings.complexity,
      fields: { ...settings.fields },
    };
    const saved = persist(id ? presets.map((p) => (p.id === id ? value : p)) : [value, ...presets]);
    if (saved) showToast(id ? 'Style set updated' : 'Style set saved');
    return saved;
  }
  function remove(id: string) {
    if (persist(presets.filter((p) => p.id !== id))) showToast('Style set deleted');
  }
  return { visiblePresets, presetSort, setPresetSort, save, remove };
}

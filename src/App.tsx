import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from './components/Icon';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import catalog from 'virtual:prompt-catalog';
import Header from './components/Header';
import Gallery from './components/Gallery';
import CollectionSort from './components/CollectionSort';
import { sortCollection, type CollectionSort as SortOrder } from './utils/collectionSort';
import Filter, { FilterTypeSelect, SelectedFilters } from './components/Filter';
import SelectionSummary from './components/SelectionSummary';
import {
  activeFilters,
  builderFilterLimit,
  pendingBuilderFilters,
  filterMetadata,
  matchesFilters,
  normalizeRatio,
  retainFilters,
  toggleFilter,
  type FilterType,
} from './utils/filters';
import ImageDetail from './components/ImageDetail';
import type { GalleryTile as Tile } from './types';
import ImagePreview from './components/ImagePreview';
import Presets from './components/promptbuilder/Presets';
import { parsePresets, presetKey, type StylePreset } from './utils/presets';
import Builder from './components/promptbuilder/Builder';
import {
  builderCategories,
  complexityUiLabels as complexityLabels,
  makePrompt,
  toggleOption,
  designFormatRatios,
  type Selection,
} from './utils/promptBuilder';
const initial: Selection = {
  'Base Style': ['naivefolk'],
  Technique: ['risograph'],
  Color: ['muted'],
  Outline: ['coloronly'],
  Composition: ['asymmetric'],
};
const filterCatalog = [
  ...catalog.filter((option) => option.category !== 'Complexity'),
  ...[
    {
      category: 'Aspect Ratio',
      options: [
        ...new Set([
          '1:1',
          '4:3',
          '3:4',
          '16:9',
          '9:16',
          ...[1500, 900, 1800, 1200, 1600, 1000, 1400, 1900].map((height) =>
            normalizeRatio(`1200:${height}`),
          ),
        ]),
      ].map((ratio) => ({ id: ratio, label: ratio })),
    },
    {
      category: 'Complexity',
      options: complexityLabels.map((label, index) => ({ id: String(index + 1), label })),
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
function storedBookmarks(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem('image-studio-bookmarks') ?? '[]');
    return Array.isArray(data) ? data.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
const defaultFields: Record<string, string> = {
  Subject: '',
  'Aspect Ratio': '1:1',
  'Additional Instructions': '',
  'Typography Enabled': 'false',
  Text: '',
};
export default function App() {
  const { t } = useTranslation();
  const [copyFallback, setCopyFallback] = useState('');
  const [builderWidth, setBuilderWidth] = useState(280);
  const [builder, setBuilder] = useState(() => window.innerWidth > 1100);
  const [filterClosing, setFilterClosing] = useState(false);
  const afterFilterClose = useRef<(() => void) | null>(null);
  function finishFilterClose() {
    setBuilder(false);
    setFilterClosing(false);
    const after = afterFilterClose.current;
    afterFilterClose.current = null;
    after?.();
  }
  function closeFilter(after?: () => void) {
    if (filterClosing) return;
    if (
      builder &&
      matchMedia('(max-width: 600px)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      afterFilterClose.current = after ?? null;
      setFilterClosing(true);
    } else {
      setBuilder(false);
      after?.();
    }
  }
  useEffect(() => {
    if (!filterClosing) return;
    const timer = setTimeout(finishFilterClose, 350);
    return () => clearTimeout(timer);
  }, [filterClosing]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [filters, setFilters] = useState<Selection>({});
  const effectiveFilters = activeFilters(filters, filterCatalog);
  const [pendingChoices, setPendingChoices] = useState<Selection>({});
  const [pendingSelection, setPendingSelection] = useState<Selection>({});
  const appliedFilters = useRef('');
  const [presetOpen, setPresetOpen] = useState(false);
  const [favoriteSort, setFavoriteSort] = useState<SortOrder>('newest');
  const [presetSort, setPresetSort] = useState<SortOrder>('newest');
  const [presets, setPresets] = useState<StylePreset[]>(() => {
    try {
      return parsePresets(localStorage.getItem(presetKey), catalog);
    } catch {
      return [];
    }
  });
  useEffect(() => {
    // Drop legacy fields such as saved names; only parsed settings remain in storage.
    try {
      localStorage.setItem(presetKey, JSON.stringify(presets));
    } catch {
      /* Storage may be disabled. */
    }
  }, []);
  const presetTitle = (preset: StylePreset) => preset.fields.Subject?.trim() || t('Random image');
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const builderBackup = useRef<(() => void) | null>(null);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [builderType, setBuilderType] = useState<'illustration' | 'photo' | 'design'>(
    'illustration',
  );
  const builderPhoto = builderType === 'photo';
  const builderDesign = builderType === 'design';
  const [designSelection, setDesignSelection] = useState<Selection>({
    'Design Format': ['poster'],
    'Design Style': ['minimalist'],
  });
  const [largeThumbnails, setLargeThumbnails] = useState(false);
  const [illustrationSelection, setIllustrationSelection] = useState(initial);
  const [photoSelection, setPhotoSelection] = useState<Selection>({
    Photography: ['film'],
    Color: ['muted'],
    Composition: ['asymmetric'],
  });
  const [complexity, setComplexity] = useState(3);
  const [fields, setFields] = useState<Record<string, string>>(defaultFields);
  // Once the user picks a ratio, design formats stop suggesting their default ratio.
  const ratioChosen = useRef(false);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [bookmarks, setBookmarks] = useState(storedBookmarks);
  const [onlySaved, setOnlySaved] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVersion, setToastVersion] = useState(0);
  const [modal, setModal] = useState<'prompt' | 'image' | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const selection = builderDesign
    ? designSelection
    : builderPhoto
      ? photoSelection
      : illustrationSelection;
  const setSelection = builderDesign
    ? setDesignSelection
    : builderPhoto
      ? setPhotoSelection
      : setIllustrationSelection;
  const prompt =
    Object.keys(pendingChoices).length > 0
      ? ''
      : makePrompt(catalog, selection, complexity, fields, builderPhoto, builderDesign);
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
            height: [1500, 900, 1800, 1200, 1600, 1000, 1400, 1900][index],
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
  const resultCount = presetOpen ? visiblePresets.length : displayGroups[0].tiles.length;
  function chooseFilter(category: string, id: string) {
    const next = toggleFilter(filters, category, id);
    setFilters(next);
    setSelected(null);
  }
  function resetFilters() {
    setFilters({});
    setQuery('');
    setSelected(null);
  }
  function changeFilterType(type: FilterType) {
    setFilterType(type);
    setFilters((previous) => retainFilters(previous, type));
    setSelected(null);
  }
  function openComposer() {
    const composerPhoto = filterType === 'photo';
    const composerDesign = filterType === 'design';
    const signature = JSON.stringify([effectiveFilters, filterType]);
    const unresolved = pendingBuilderFilters(effectiveFilters, composerPhoto, composerDesign);
    const relevant = Object.fromEntries(
      Object.entries(effectiveFilters).filter(
        ([category, ids]) =>
          builderCategories(composerPhoto, composerDesign).includes(category) &&
          ids.length <= builderFilterLimit(category),
      ),
    );
    if (signature !== appliedFilters.current) {
      setPendingChoices(unresolved);
      setPendingSelection({});
      setFields((previous) => ({
        ...previous,
        ...(effectiveFilters['Aspect Ratio']?.length === 1
          ? { 'Aspect Ratio': effectiveFilters['Aspect Ratio'][0] }
          : {}),
        ...(effectiveFilters.Typography?.length ? { 'Typography Enabled': 'true' } : {}),
      }));
      if (effectiveFilters['Aspect Ratio']?.length === 1) ratioChosen.current = true;
      if (effectiveFilters.Complexity?.length === 1)
        setComplexity(Number(effectiveFilters.Complexity[0]));
      const update = composerDesign
        ? setDesignSelection
        : composerPhoto
          ? setPhotoSelection
          : setIllustrationSelection;
      update((previous) => ({ ...previous, ...relevant }));
      setBuilderType(filterType === 'design' ? 'design' : composerPhoto ? 'photo' : 'illustration');
    }
    appliedFilters.current = signature;
    if (builder && matchMedia('(max-width: 600px)').matches) {
      closeFilter(() => setComposerOpen(true));
      return;
    }
    if (matchMedia('(max-width: 1000px)').matches) setBuilder(false);
    setComposerOpen(true);
  }
  function choosePending(category: string, id: string) {
    if (builderFilterLimit(category) === 1) {
      setPendingSelection((previous) => ({ ...previous, [category]: [id] }));
      return;
    }
    const next = toggleFilter(pendingSelection, category, id);
    if (next[category].length > 3) {
      setToast('You can select up to 3 options.');
      setToastVersion((version) => version + 1);
      return;
    }
    setPendingSelection(next);
  }
  function applyPending() {
    if (
      Object.entries(pendingChoices).some(([category, ids]) => {
        const chosen = pendingSelection[category] ?? [];
        return (
          chosen.length === 0 ||
          chosen.length > builderFilterLimit(category) ||
          chosen.some((id) => !ids.includes(id))
        );
      })
    )
      return;
    const resolved = Object.fromEntries(
      Object.entries(pendingSelection).filter(([category]) =>
        builderCategories(builderPhoto, builderDesign).includes(category),
      ),
    );
    setSelection((previous) => ({ ...previous, ...resolved }));
    if (pendingSelection['Aspect Ratio']?.length) {
      ratioChosen.current = true;
      setFields((previous) => ({
        ...previous,
        'Aspect Ratio': pendingSelection['Aspect Ratio'][0],
      }));
    }
    if (pendingSelection.Complexity?.length) setComplexity(Number(pendingSelection.Complexity[0]));
    setPendingChoices({});
    setPendingSelection({});
  }
  const toggleBookmark = (id: string) =>
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  useEffect(() => {
    try {
      localStorage.setItem('image-studio-bookmarks', JSON.stringify(bookmarks));
    } catch {
      /* Storage may be disabled. */
    }
  }, [bookmarks]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast, toastVersion]);
  useEffect(() => {
    if (modal === 'prompt') modalRef.current?.showModal();
    else modalRef.current?.close();
  }, [modal]);
  useEffect(() => {
    const update = () => {
      const header = document.querySelector('.header')?.getBoundingClientRect();
      document.documentElement.style.setProperty(
        '--header-visible',
        `${Math.max(0, header?.bottom ?? 0)}px`,
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.documentElement.style.removeProperty('--header-visible');
    };
  }, []);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard');
    } catch {
      setToast('Clipboard unavailable. Select and copy the prompt manually.');
      setCopyFallback(text);
      setModal('prompt');
    }
  }
  function persistPresets(next: StylePreset[]) {
    try {
      localStorage.setItem(presetKey, JSON.stringify(next));
      setPresets(next);
      return true;
    } catch {
      setToast('Could not save. Browser storage is unavailable or full.');
      return false;
    }
  }
  function savePreset(
    snapshot?: Pick<StylePreset, 'photo' | 'design' | 'selection' | 'complexity' | 'fields'>,
  ) {
    if (!snapshot && Object.keys(pendingChoices).length > 0) return false;
    const id = snapshot ? undefined : (editingPreset ?? undefined);
    const value: StylePreset = {
      id: id ?? crypto.randomUUID(),
      photo: builderPhoto,
      design: snapshot ? !!snapshot.design : builderDesign,
      selection: structuredClone(selection),
      complexity,
      fields: { ...fields },
      ...snapshot,
    };
    const saved = persistPresets(
      id ? presets.map((p) => (p.id === id ? value : p)) : [value, ...presets],
    );
    if (saved) setToast(id ? 'Style set updated' : 'Style set saved');
    if (saved && id) closeComposer();
    return saved;
  }
  function editPreset(preset: StylePreset) {
    if (!editingPreset) {
      // Keep the current Builder draft and restore it after editing the saved settings.
      const draft = {
        builderType,
        illustrationSelection,
        photoSelection,
        designSelection,
        complexity,
        fields,
        pendingChoices,
        pendingSelection,
        ratioChosen: ratioChosen.current,
      };
      builderBackup.current = () => {
        ratioChosen.current = draft.ratioChosen;
        setBuilderType(draft.builderType);
        setIllustrationSelection(draft.illustrationSelection);
        setPhotoSelection(draft.photoSelection);
        setDesignSelection(draft.designSelection);
        setComplexity(draft.complexity);
        setFields(draft.fields);
        setPendingChoices(draft.pendingChoices);
        setPendingSelection(draft.pendingSelection);
      };
    }
    const type = preset.design ? 'design' : preset.photo ? 'photo' : 'illustration';
    const update =
      type === 'design'
        ? setDesignSelection
        : type === 'photo'
          ? setPhotoSelection
          : setIllustrationSelection;
    setBuilderType(type);
    update(structuredClone(preset.selection));
    setComplexity(preset.complexity);
    setFields({ ...defaultFields, ...preset.fields });
    ratioChosen.current = true;
    setPendingChoices({});
    setPendingSelection({});
    setEditingPreset(preset.id);
    setComposerOpen(true);
  }
  function closeComposer() {
    setComposerOpen(false);
    if (!editingPreset) return;
    builderBackup.current?.();
    builderBackup.current = null;
    setEditingPreset(null);
  }
  const detailPhoto = selected ? selected.id.startsWith('photo-') : filterType === 'photo';
  const selectedOption = selected
    ? catalog.find(
        (o) =>
          o.category ===
            (detailPhoto
              ? 'Photography'
              : selected.group === 'risograph'
                ? 'Technique'
                : 'Base Style') && o.id === selected.group,
      )
    : undefined;
  const detailPreset = {
    photo: detailPhoto,
    selection: selectedOption ? { [selectedOption.category]: [selectedOption.id] } : {},
    complexity: 3,
    fields: {
      'Aspect Ratio': selected ? `${selected.width}:${selected.height}` : '1:1',
      'Additional Instructions': '',
    },
  };
  const detailSavePrompt = makePrompt(
    catalog,
    detailPreset.selection,
    detailPreset.complexity,
    detailPreset.fields,
    detailPhoto,
  );
  const detailPrompt = selectedOption?.prompt ?? '';
  return (
    <>
      <Header
        home={() => {
          setFilterType('all');
          setFilters({});
          closeComposer();
          setQuery('');
          setOnlySaved(false);
          setPresetOpen(false);
          setSelected(null);
          setModal(null);
          setCopyFallback('');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        query={query}
        search={(value) => {
          setQuery(value);
          setSelected(null);
        }}
        showBookmarks={onlySaved}
        showPrompts={presetOpen}
        toggleBookmarks={() => {
          setOnlySaved(!onlySaved);
          setQuery('');
          setPresetOpen(false);
          setSelected(null);
          window.scrollTo({ top: 0 });
        }}
        togglePrompts={() => {
          setPresetOpen(!presetOpen);
          setQuery('');
          setOnlySaved(false);
          setSelected(null);
          window.scrollTo({ top: 0 });
        }}
      />
      <div
        className={
          'workspace ' + (builder ? 'with-builder ' : '') + (selected ? 'with-detail' : '')
        }
        style={{ '--builder-width': `${builderWidth}px` } as CSSProperties}
      >
        {builder && (
          <>
            <button
              className="mobile-scrim"
              aria-label={t('Close filters')}
              onClick={() => closeFilter()}
            />
            <Filter
              width={builderWidth}
              resize={setBuilderWidth}
              catalog={filterCatalog}
              filters={filters}
              type={filterType}
              setType={changeFilterType}
              toggle={chooseFilter}
              reset={resetFilters}
              close={() => closeFilter()}
              closing={filterClosing}
              closed={finishFilterClose}
              compose={openComposer}
            />
          </>
        )}
        <main
          className="gallery"
          aria-label={t(
            presetOpen ? 'Saved style sets' : onlySaved ? 'Favorites' : 'Image gallery',
          )}
        >
          <div className="results-heading">
            <div className="section-heading">
              <div className="results-heading-start">
                <button
                  className="icon-button filter-toggle"
                  aria-label={t('Toggle filters')}
                  aria-pressed={builder}
                  aria-expanded={builder}
                  onClick={() => (builder ? closeFilter() : setBuilder(true))}
                >
                  <Icon name="filter_list" size="20" />
                </button>
                {!builder && <FilterTypeSelect type={filterType} setType={changeFilterType} />}
                <span className="result-count" role="status" aria-live="polite">
                  {resultCount}
                </span>
              </div>
              <div className="gallery-heading-actions">
                {presetOpen ? (
                  <CollectionSort value={presetSort} change={setPresetSort} />
                ) : onlySaved ? (
                  <CollectionSort value={favoriteSort} change={setFavoriteSort} />
                ) : null}
                {!presetOpen && (
                  <div className="thumbnail-sizes" role="group" aria-label={t('Thumbnail size')}>
                    <button
                      className="icon-button"
                      aria-label={t('Small thumbnails')}
                      title={t('Small thumbnails')}
                      aria-pressed={!largeThumbnails}
                      onClick={() => setLargeThumbnails(false)}
                    >
                      <Icon name="grid_view" size="20" className={!largeThumbnails ? 'fill' : ''} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={t('Large thumbnails')}
                      title={t('Large thumbnails')}
                      aria-pressed={largeThumbnails}
                      onClick={() => setLargeThumbnails(true)}
                    >
                      <Icon
                        name="view_agenda"
                        size="20"
                        className={largeThumbnails ? 'fill' : ''}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {Object.keys(effectiveFilters).length > 0 && (
              <SelectionSummary label={t('Selected filters')}>
                <SelectedFilters
                  catalog={filterCatalog}
                  filters={effectiveFilters}
                  remove={chooseFilter}
                />
              </SelectionSummary>
            )}
          </div>
          {presetOpen ? (
            <Presets
              presets={visiblePresets}
              catalog={catalog}
              edit={editPreset}
              remove={(id) => {
                if (persistPresets(presets.filter((p) => p.id !== id)))
                  setToast('Style set deleted');
              }}
              copy={copy}
            />
          ) : (
            <Gallery
              largeThumbnails={largeThumbnails}
              groups={displayGroups.filter((group) => group.id === 'all' || group.tiles.length > 0)}
              bookmarks={bookmarks}
              selectedId={selected?.id}
              emptyMessage={
                query || Object.values(effectiveFilters).some((ids) => ids.length)
                  ? 'No results'
                  : onlySaved
                    ? 'No bookmarks'
                    : 'No images'
              }
              select={(tile) => {
                if (matchMedia('(max-width: 600px)').matches) setBuilder(false);
                setSelected(tile);
              }}
              toggleBookmark={toggleBookmark}
            />
          )}
          <footer className="site-footer">
            {t('Copyright notice', { year: new Date().getFullYear() })}
          </footer>
          <button
            className="primary compose-floating"
            onClick={openComposer}
            aria-label={t('Generate prompt')}
          >
            <Icon name="auto_awesome" size="24" className="fill" />
            <span className="compose-floating-label" aria-hidden="true">
              {t('Generate Prompt label')}
            </span>
          </button>
        </main>
        {selected && (
          <>
            <button
              className="detail-scrim"
              aria-label={t('Close image detail')}
              onClick={() => setSelected(null)}
            />
            <ImageDetail
              image={selected}
              photo={detailPhoto}
              bookmarked={bookmarks.includes(selected.id)}
              stylePrompt={detailPrompt}
              savePreview={detailSavePrompt}
              saveOptions={{ catalog, ...detailPreset }}
              save={() => savePreset(detailPreset)}
              copy={copy}
              toggleBookmark={() => toggleBookmark(selected.id)}
              close={() => setSelected(null)}
              preview={() => setModal('image')}
            />
          </>
        )}
      </div>
      {composerOpen && (
        <Builder
          reset={() => {
            setPendingChoices({});
            setPendingSelection({});
            setIllustrationSelection({ Outline: ['coloronly'] });
            setPhotoSelection({});
            setDesignSelection({});
            setComplexity(3);
            setFields(defaultFields);
            ratioChosen.current = false;
          }}
          catalog={catalog}
          filterCatalog={filterCatalog}
          pending={pendingChoices}
          pendingSelection={pendingSelection}
          choosePending={choosePending}
          applyPending={applyPending}
          selection={selection}
          toggle={(cat, id) => {
            const next = toggleOption(selection, cat, id);
            if (next === selection) {
              setToast('You can select up to 3 options.');
              setToastVersion((version) => version + 1);
            } else setSelection(next);
            if (cat === 'Design Format' && !ratioChosen.current && designFormatRatios[id])
              setFields({ ...fields, 'Aspect Ratio': designFormatRatios[id] });
          }}
          removeOption={(category, id) =>
            setSelection((previous) => ({
              ...previous,
              [category]: (previous[category] ?? []).filter((value) => value !== id),
            }))
          }
          complexity={complexity}
          setComplexity={setComplexity}
          fields={fields}
          setFields={(next) => {
            if (next['Aspect Ratio'] !== fields['Aspect Ratio']) ratioChosen.current = true;
            setFields(next);
          }}
          photo={builderPhoto}
          type={builderType}
          setType={setBuilderType}
          close={closeComposer}
          prompt={prompt}
          copy={copy}
          save={() => savePreset()}
          editing={!!editingPreset}
        />
      )}
      <dialog
        ref={modalRef}
        className="modal"
        aria-label={t('Full prompt')}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <div className="panel-heading">
          <span className="uppercase">{t('YOUR PROMPT')}</span>
          <button
            className="icon-button close-button"
            aria-label={t('Close dialog')}
            onClick={() => setModal(null)}
          >
            <Icon name="close" size="24" className="w200" />
          </button>
        </div>
        <div className="prompt-textarea" aria-label={t('Full prompt')} role="region" tabIndex={0}>
          {copyFallback || prompt}
        </div>
        <button className="primary" onClick={() => copy(copyFallback || prompt)}>
          <Icon name="content_copy" size="14" />
          {t('Copy')}
        </button>
      </dialog>
      {modal === 'image' && selected && (
        <ImagePreview image={selected} close={() => setModal(null)} />
      )}
      {toast &&
        createPortal(
          <div className="toast" role="status">
            <Icon name="check" size="16" />
            <span className="toast-message">{t(toast)}</span>
          </div>,
          Array.from(document.querySelectorAll('dialog[open]')).at(-1) ?? document.body,
        )}
    </>
  );
}

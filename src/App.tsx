import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from './components/Icon';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import catalog from 'virtual:prompt-catalog';
import Header from './components/Header';
import Gallery from './components/Gallery';
import CollectionSort from './components/CollectionSort';
import type { CollectionSort as SortOrder } from './utils/collectionSort';
import Filter, { FilterTypeSelect, SelectedFilters } from './components/Filter';
import SelectionSummary from './components/SelectionSummary';
import ImageDetail from './components/ImageDetail';
import type { GalleryTile as Tile } from './types';
import ImagePreview from './components/ImagePreview';
import Presets from './components/promptbuilder/Presets';
import Builder from './components/promptbuilder/Builder';
import { makePrompt } from './utils/promptBuilder';
import { normalizeRatio } from './utils/filters';
import { compactQuery, mobileQuery } from './utils/useMediaQuery';
import { filterCatalog, useGalleryFilters } from './utils/useGalleryFilters';
import { useBuilderDraft } from './utils/useBuilderDraft';
import { usePresets } from './utils/usePresets';
function storedBookmarks(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem('image-studio-bookmarks') ?? '[]');
    return Array.isArray(data) ? data.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
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
      matchMedia(mobileQuery).matches &&
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
  const [presetOpen, setPresetOpen] = useState(false);
  const [favoriteSort, setFavoriteSort] = useState<SortOrder>('newest');
  const [largeThumbnails, setLargeThumbnails] = useState(false);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [bookmarks, setBookmarks] = useState(storedBookmarks);
  const [onlySaved, setOnlySaved] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVersion, setToastVersion] = useState(0);
  const [modal, setModal] = useState<'prompt' | 'image' | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  // Bump the version so a repeated message restarts its timer.
  function showToast(message: string) {
    setToast(message);
    setToastVersion((version) => version + 1);
  }
  const gallery = useGalleryFilters({
    onlySaved,
    bookmarks,
    favoriteSort,
    onChange: () => setSelected(null),
  });
  const { effectiveFilters, filterType, query, displayGroups } = gallery;
  const draft = useBuilderDraft(() => showToast('You can select up to 3 options.'));
  const presets = usePresets({ filterType, query, effectiveFilters, showToast });
  const resultCount = presetOpen ? presets.visiblePresets.length : displayGroups[0].tiles.length;
  function openComposer() {
    draft.applyFilters(effectiveFilters, filterType);
    if (builder && matchMedia(mobileQuery).matches) {
      closeFilter(() => setComposerOpen(true));
      return;
    }
    if (matchMedia(compactQuery).matches) setBuilder(false);
    setComposerOpen(true);
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
    // Measure at most once per frame however often scroll and resize fire.
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector('.header')?.getBoundingClientRect();
      document.documentElement.style.setProperty(
        '--header-visible',
        `${Math.max(0, header?.bottom ?? 0)}px`,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.documentElement.style.removeProperty('--header-visible');
    };
  }, []);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      showToast('Clipboard unavailable. Select and copy the prompt manually.');
      setCopyFallback(text);
      setModal('prompt');
    }
  }
  function saveDraft() {
    if (draft.pending) return false;
    const id = draft.editingId ?? undefined;
    const saved = presets.save(draft.settings, id);
    if (saved && id) closeComposer();
    return saved;
  }
  function closeComposer() {
    setComposerOpen(false);
    draft.endEdit();
  }
  const detailPhoto = selected ? selected.id.startsWith('photo-') : filterType === 'photo';
  const selectedOption = selected
    ? catalog.find(
        (o) =>
          o.category ===
            (detailPhoto
              ? 'Photo Style'
              : selected.group === 'risograph'
                ? 'Technique'
                : 'Illustration Style') && o.id === selected.group,
      )
    : undefined;
  const detailPreset = {
    photo: detailPhoto,
    selection:
      selected?.selection ??
      (selectedOption ? { [selectedOption.category]: [selectedOption.id] } : {}),
    complexity: selected?.complexity ?? 3,
    fields: {
      'Aspect Ratio': selected ? normalizeRatio(`${selected.width}:${selected.height}`) : '1:1',
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
          gallery.clearAll();
          closeComposer();
          setOnlySaved(false);
          setPresetOpen(false);
          setSelected(null);
          setModal(null);
          setCopyFallback('');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        query={query}
        search={gallery.search}
        showBookmarks={onlySaved}
        showPrompts={presetOpen}
        toggleBookmarks={() => {
          setOnlySaved(!onlySaved);
          gallery.clearQuery();
          setPresetOpen(false);
          setSelected(null);
          window.scrollTo({ top: 0 });
        }}
        togglePrompts={() => {
          setPresetOpen(!presetOpen);
          gallery.clearQuery();
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
              filters={gallery.filters}
              type={filterType}
              available={gallery.availableCategories}
              setType={gallery.changeType}
              toggle={gallery.toggle}
              reset={gallery.reset}
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
                {!builder && <FilterTypeSelect type={filterType} setType={gallery.changeType} />}
                <span className="result-count" role="status" aria-live="polite">
                  {resultCount}
                </span>
              </div>
              <div className="gallery-heading-actions">
                {presetOpen ? (
                  <CollectionSort value={presets.presetSort} change={presets.setPresetSort} />
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
                  remove={gallery.toggle}
                />
              </SelectionSummary>
            )}
          </div>
          {presetOpen ? (
            <Presets
              presets={presets.visiblePresets}
              catalog={catalog}
              edit={(preset) => {
                draft.startEdit(preset);
                setComposerOpen(true);
              }}
              remove={presets.remove}
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
                if (matchMedia(mobileQuery).matches) setBuilder(false);
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
              save={() => presets.save(detailPreset)}
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
          reset={draft.reset}
          catalog={catalog}
          filterCatalog={filterCatalog}
          pending={draft.pendingChoices}
          pendingSelection={draft.pendingSelection}
          choosePending={draft.choosePending}
          applyPending={draft.applyPending}
          selection={draft.selection}
          toggle={draft.toggle}
          removeOption={draft.removeOption}
          complexity={draft.complexity}
          setComplexity={draft.setComplexity}
          fields={draft.fields}
          setFields={draft.setFields}
          photo={draft.photo}
          type={draft.type}
          setType={draft.setType}
          close={closeComposer}
          prompt={draft.prompt}
          copy={copy}
          save={saveDraft}
          editing={!!draft.editingId}
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
          {copyFallback || draft.prompt}
        </div>
        <button className="primary" onClick={() => copy(copyFallback || draft.prompt)}>
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

import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from './components/Icon';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import catalog from 'virtual:prompt-catalog';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Gallery from './components/Gallery';
import ImageDetail from './components/ImageDetail';
import type { GalleryTile as Tile } from './types';
import ImagePreview from './components/ImagePreview';
import Presets from './components/promptbuilder/Presets';
import { parsePresets, presetKey, type StylePreset } from './utils/presets';
import Builder from './components/promptbuilder/Builder';
import { makePrompt, toggleOption, type Selection } from './utils/promptBuilder';
const initial: Selection = {
  'Base Style': ['naivefolk'],
  Technique: ['risograph'],
  Color: ['muted'],
  Outline: ['coloronly'],
  Composition: ['asymmetric'],
};
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
export default function App() {
  const { t } = useTranslation();
  const [copyFallback, setCopyFallback] = useState('');
  const [builderWidth, setBuilderWidth] = useState(248);
  const [builder, setBuilder] = useState(() => window.innerWidth > 1100);
  const [presetOpen, setPresetOpen] = useState(false);
  const [presets, setPresets] = useState<StylePreset[]>(() => {
    try {
      return parsePresets(localStorage.getItem(presetKey), catalog);
    } catch {
      return [];
    }
  });
  const [query, setQuery] = useState('');
  const [photo, setPhoto] = useState(false);
  const [active, setActive] = useState('all');
  const [illustrationSelection, setIllustrationSelection] = useState(initial);
  const [photoSelection, setPhotoSelection] = useState<Selection>({
    Photography: ['film'],
    Color: ['muted'],
    Composition: ['asymmetric'],
  });
  const [complexity, setComplexity] = useState(3);
  const [fields, setFields] = useState<Record<string, string>>({
    'Aspect Ratio': '1:1',
    'Additional Instructions': '',
    'Typography Enabled': 'false',
    Text: '',
  });
  const [selected, setSelected] = useState<Tile | null>(null);
  const [bookmarks, setBookmarks] = useState(storedBookmarks);
  const [onlySaved, setOnlySaved] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVersion, setToastVersion] = useState(0);
  const [modal, setModal] = useState<'prompt' | 'image' | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const selection = photo ? photoSelection : illustrationSelection;
  const setSelection = photo ? setPhotoSelection : setIllustrationSelection;
  const currentGroups = photo ? photoGroups : groups;
  const prompt = makePrompt(catalog, selection, complexity, fields, photo);
  const visibleGroups = currentGroups.filter(
    (g) =>
      (active === 'all' || g.id === active) &&
      `${g.label} ${t(g.label)} ${g.id}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const tileGroups = visibleGroups.map((group) => ({
    ...group,
    tiles: group.colors
      .map((color, index) => ({
        id: `${photo ? 'photo' : 'illustration'}-${group.id}-${index}`,
        group: group.id,
        label: group.label,
        color,
        index,
        width: 1200,
        height: [1500, 900, 1800, 1200, 1600, 1000, 1400, 1900][index],
      }))
      .filter((t) => !onlySaved || bookmarks.includes(t.id)),
  }));
  const displayGroups =
    active === 'all'
      ? [{ id: 'all', label: 'All', tiles: tileGroups.flatMap((g) => g.tiles) }]
      : tileGroups;
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
  function navigate(id: string) {
    setPresetOpen(false);
    setActive(id);
    setSelected(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function switchType(value: boolean) {
    setPresetOpen(false);
    setPhoto(value);
    setSelected(null);
    setActive('all');
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
    name: string,
    id?: string,
    snapshot?: Pick<StylePreset, 'photo' | 'selection' | 'complexity' | 'fields'>,
  ) {
    if (!name.trim()) return false;
    if (presets.some((p) => p.id !== id && p.name.toLowerCase() === name.trim().toLowerCase())) {
      setToast('A style set with this name already exists.');
      return false;
    }
    const value: StylePreset = {
      id: id ?? crypto.randomUUID(),
      name: name.trim(),
      photo,
      selection: structuredClone(selection),
      complexity,
      fields: { ...fields },
      ...snapshot,
    };
    const saved = persistPresets(
      id ? presets.map((p) => (p.id === id ? value : p)) : [value, ...presets],
    );
    if (saved) setToast(id ? 'Style set updated' : 'Style set saved');
    return saved;
  }
  function renamePreset(id: string, name: string) {
    if (presets.some((p) => p.id !== id && p.name.toLowerCase() === name.trim().toLowerCase())) {
      setToast('A style set with this name already exists.');
      return false;
    }
    return persistPresets(presets.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
  }
  const selectedOption = selected
    ? catalog.find(
        (o) =>
          o.category ===
            (photo ? 'Photography' : selected.group === 'risograph' ? 'Technique' : 'Base Style') &&
          o.id === selected.group,
      )
    : undefined;
  const detailPreset = {
    photo,
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
    photo,
  );
  const detailPrompt = selectedOption ? `Read ${selectedOption.path}.` : '';
  return (
    <>
      <Header
        home={() => {
          setPhoto(false);
          setActive('all');
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
        bookmarksCount={bookmarks.length}
        showBookmarks={onlySaved}
        showPrompts={presetOpen}
        toggleBookmarks={() => {
          setOnlySaved(!onlySaved);
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
      <Navigation
        builder={builder}
        photo={photo}
        active={active}
        groups={currentGroups}
        toggleBuilder={() => setBuilder(!builder)}
        switchType={switchType}
        navigate={navigate}
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
              aria-label={t('Close Builder')}
              onClick={() => setBuilder(false)}
            />
            <Builder
              width={builderWidth}
              resize={setBuilderWidth}
              catalog={catalog}
              selection={selection}
              toggle={(cat, id) => {
                const next = toggleOption(selection, cat, id);
                if (next === selection) {
                  setToast('You can select up to 3 options.');
                  setToastVersion((version) => version + 1);
                } else setSelection(next);
              }}
              complexity={complexity}
              setComplexity={setComplexity}
              fields={fields}
              setFields={setFields}
              photo={photo}
              close={() => setBuilder(false)}
              prompt={prompt}
              copy={copy}
              save={savePreset}
            />
          </>
        )}
        <main className="gallery" aria-label={t(presetOpen ? 'Saved prompts' : 'Image gallery')}>
          {presetOpen ? (
            <Presets
              presets={presets.filter((p) =>
                p.name.toLowerCase().includes(query.trim().toLowerCase()),
              )}
              catalog={catalog}
              rename={renamePreset}
              remove={(id) => {
                if (persistPresets(presets.filter((p) => p.id !== id)))
                  setToast('Style set deleted');
              }}
              copy={copy}
            />
          ) : (
            <Gallery
              groups={displayGroups.filter((group) => group.id === 'all' || group.tiles.length > 0)}
              bookmarks={bookmarks}
              selectedId={selected?.id}
              emptyMessage={query ? 'No results' : onlySaved ? 'No bookmarks' : 'No images'}
              select={(tile) => {
                if (matchMedia('(max-width: 600px)').matches) setBuilder(false);
                setSelected(tile);
              }}
              toggleBookmark={toggleBookmark}
            />
          )}
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
              photo={photo}
              bookmarked={bookmarks.includes(selected.id)}
              stylePrompt={detailPrompt}
              savePreview={detailSavePrompt}
              save={(name) => savePreset(name, undefined, detailPreset)}
              copy={copy}
              toggleBookmark={() => toggleBookmark(selected.id)}
              close={() => setSelected(null)}
              preview={() => setModal('image')}
            />
          </>
        )}
      </div>
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
            className="icon-button"
            aria-label={t('Close dialog')}
            onClick={() => setModal(null)}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <textarea
          className="prompt-textarea"
          readOnly
          aria-label={t('Full prompt')}
          value={copyFallback || prompt}
        />
        <button className="primary" onClick={() => copy(copyFallback || prompt)}>
          <Icon name="content_copy" size={14} />
          {t('Copy')}
        </button>
      </dialog>
      {modal === 'image' && selected && (
        <ImagePreview image={selected} close={() => setModal(null)} />
      )}
      {toast &&
        createPortal(
          <div className="toast" role="status">
            <Icon name="check" size={16} />
            {t(toast)}
          </div>,
          Array.from(document.querySelectorAll('dialog[open]')).at(-1) ?? document.body,
        )}
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../utils/useMediaQuery';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import LanguageMenu from './LanguageMenu';
interface Props {
  home: () => void;
  query: string;
  search: (value: string) => void;
  showBookmarks: boolean;
  showPrompts: boolean;
  toggleBookmarks: () => void;
  togglePrompts: () => void;
}
export default function Header(p: Props) {
  const { t } = useTranslation();
  const mobile = useMediaQuery('(max-width: 600px)');
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritePulse, setFavoritePulse] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const searchArea = useRef<HTMLLabelElement>(null);
  const closeSearch = () => {
    setSearchOpen(false);
    searchTrigger.current?.focus();
  };
  useEffect(() => {
    if (mobile && searchOpen) searchInput.current?.focus();
  }, [mobile, searchOpen]);
  useEffect(() => {
    if (!mobile || !searchOpen) return;
    function outside(event: PointerEvent) {
      if (!searchArea.current?.contains(event.target as Node)) setSearchOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [mobile, searchOpen]);
  return (
    <header className="header">
      <a
        className="brand"
        href="./"
        aria-label={t('Image Studio home')}
        onClick={(event) => {
          event.preventDefault();
          p.home();
        }}
      >
        IMAGE STUDIO
      </a>
      {mobile && (
        <button
          ref={searchTrigger}
          className="icon-button mobile-search-trigger"
          aria-label={t('Search gallery')}
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen(true)}
        >
          <Icon name="search" size="20" />
        </button>
      )}
      {(!mobile || searchOpen) && (
        <label
          ref={searchArea}
          onKeyDown={(event) => {
            if (mobile && event.key === 'Escape') {
              event.preventDefault();
              closeSearch();
            }
          }}
          className={'header-search' + (mobile ? ' mobile-search-overlay' : '')}
        >
          <Icon name="search" size="16" />
          <input
            ref={searchInput}
            type="search"
            aria-label={t('Search gallery')}
            placeholder={t('Search')}
            value={p.query}
            onChange={(e) => p.search(e.target.value)}
          />
          {p.query && (
            <button
              className="icon-button close-button"
              aria-label={t('Clear search')}
              onClick={() => {
                p.search('');
                searchInput.current?.focus();
              }}
            >
              <Icon name="close" size="14" />
            </button>
          )}
          {mobile && (
            <button
              className="icon-button close-button"
              aria-label={t('Close search')}
              onClick={closeSearch}
            >
              <Icon name="close" size="24" className="w200" />
            </button>
          )}
        </label>
      )}
      <div className="header-actions">
        <button
          className={
            'icon-button saved-toggle ' +
            (p.showBookmarks ? 'active ' : '') +
            (favoritePulse ? 'favorite-pulse' : '')
          }
          aria-label={t('Show bookmarks')}
          aria-pressed={p.showBookmarks}
          onAnimationEnd={() => setFavoritePulse(false)}
          onClick={() => {
            setFavoritePulse(!p.showBookmarks);
            p.toggleBookmarks();
          }}
        >
          <Icon name="favorite" size="20" className={p.showBookmarks ? 'fill' : ''} />
        </button>
        <button
          className={'icon-button preset-toggle ' + (p.showPrompts ? 'active' : '')}
          aria-label={t('Open saved style sets')}
          aria-pressed={p.showPrompts}
          onClick={p.togglePrompts}
        >
          <Icon name="format_list_bulleted" size="20" />
        </button>
        <LanguageMenu />
      </div>
    </header>
  );
}

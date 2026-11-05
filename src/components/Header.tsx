import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import './Header.scss';
interface Props {
  query: string;
  search: (value: string) => void;
  bookmarksCount: number;
  showBookmarks: boolean;
  showPrompts: boolean;
  toggleBookmarks: () => void;
  togglePrompts: () => void;
}
export default function Header(p: Props) {
  const { t, i18n } = useTranslation();
  return (
    <header className="header">
      <a className="brand" href="#" aria-label={t('Image Studio home')}>
        IMAGE STUDIO
      </a>
      <label className="header-search">
        <Icon name="search" size={16} />
        <input
          type="search"
          aria-label={t('Search gallery')}
          placeholder={t('Search')}
          value={p.query}
          onChange={(e) => p.search(e.target.value)}
        />
        {p.query && (
          <button
            className="icon-button"
            aria-label={t('Clear search')}
            onClick={() => p.search('')}
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </label>
      <button
        className={'icon-button saved-toggle ' + (p.showBookmarks ? 'active' : '')}
        aria-label={t('Show bookmarks')}
        aria-pressed={p.showBookmarks}
        onClick={p.toggleBookmarks}
      >
        <Icon name="bookmark" size={19} />
        <span className="saved-count">{p.bookmarksCount || ''}</span>
      </button>
      <button
        className={'icon-button preset-toggle ' + (p.showPrompts ? 'active' : '')}
        aria-label={t('Open saved style sets')}
        aria-pressed={p.showPrompts}
        onClick={p.togglePrompts}
      >
        <Icon name="format_list_bulleted" size={20} />
      </button>
      <select
        className="language-select"
        aria-label={t('Language')}
        value={i18n.resolvedLanguage ?? 'en'}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="ko" lang="ko">
          한국어
        </option>
      </select>
    </header>
  );
}

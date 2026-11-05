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
  return (
    <header className="header">
      <a className="brand" href="#" aria-label="Image Studio home">
        IMAGE STUDIO
      </a>
      <label className="header-search">
        <Icon name="search" size={16} />
        <input
          type="search"
          aria-label="Search gallery"
          placeholder="Search"
          value={p.query}
          onChange={(e) => p.search(e.target.value)}
        />
        {p.query && (
          <button className="icon-button" aria-label="Clear search" onClick={() => p.search('')}>
            <Icon name="close" size={14} />
          </button>
        )}
      </label>
      <button
        className={'icon-button saved-toggle ' + (p.showBookmarks ? 'active' : '')}
        aria-label="Show bookmarks"
        aria-pressed={p.showBookmarks}
        onClick={p.toggleBookmarks}
      >
        <Icon name="bookmark" size={19} />
        <span className="saved-count">{p.bookmarksCount || ''}</span>
      </button>
      <button
        className={'icon-button preset-toggle ' + (p.showPrompts ? 'active' : '')}
        aria-label="Open saved style sets"
        aria-pressed={p.showPrompts}
        onClick={p.togglePrompts}
      >
        <Icon name="format_list_bulleted" size={20} />
      </button>
    </header>
  );
}

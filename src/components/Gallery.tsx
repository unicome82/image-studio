import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';
import { imageName } from '../utils/imageName';
import type { GallerySection, GalleryTile } from '../types';
interface Props {
  largeThumbnails: boolean;
  groups: GallerySection[];
  bookmarks: string[];
  selectedId?: string;
  emptyMessage: string;
  select: (tile: GalleryTile) => void;
  toggleBookmark: (id: string) => void;
}
export default function Gallery(p: Props) {
  const { t } = useTranslation();
  const total = p.groups.reduce((sum, group) => sum + group.tiles.length, 0);
  return (
    <>
      {p.groups.map((group) => (
        <section className="gallery-section" id={'section-' + group.id} key={group.id}>
          <div className={'image-grid' + (p.largeThumbnails ? ' large' : '')}>
            {group.tiles.map((tile) => (
              <article
                className={'tile ' + (p.selectedId === tile.id ? 'selected' : '')}
                key={tile.id}
                style={{
                  backgroundColor: tile.color,
                  aspectRatio: `${tile.width} / ${tile.height}`,
                }}
              >
                {tile.src && (
                  <img
                    className="tile-image"
                    src={tile.thumb}
                    // Small tiles always take the 480px copy to save data, even on 3x phones;
                    // large tiles may switch to the original where 480px would look soft.
                    srcSet={
                      p.largeThumbnails
                        ? `${tile.thumb} 480w, ${tile.src} ${tile.width}w`
                        : undefined
                    }
                    sizes={p.largeThumbnails ? '(max-width: 600px) 100vw, 400px' : undefined}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <button
                  className="tile-main"
                  aria-label={t('View {{name}}', { name: imageName(tile) })}
                  aria-pressed={p.selectedId === tile.id}
                  onClick={() => p.select(tile)}
                >
                  <span className="tile-caption" aria-hidden="true">
                    <span className="tile-title">{imageName(tile)}</span>
                    <span className="tags">
                      <span>#{tile.group}</span>
                    </span>
                  </span>
                </button>
                <FavoriteButton
                  className={'tile-bookmark ' + (p.bookmarks.includes(tile.id) ? 'bookmarked' : '')}
                  active={p.bookmarks.includes(tile.id)}
                  label={t(
                    p.bookmarks.includes(tile.id)
                      ? 'Remove {{name}} from favorites'
                      : 'Add {{name}} to favorites',
                    { name: imageName(tile) },
                  )}
                  toggle={() => p.toggleBookmark(tile.id)}
                />
              </article>
            ))}
          </div>
        </section>
      ))}
      {!total && (
        <div className="empty-state" role="status">
          <h2>{t(p.emptyMessage)}</h2>
          <p>
            {t(
              p.emptyMessage === 'No results'
                ? 'Try another keyword or explore a different style.'
                : p.emptyMessage === 'No bookmarks'
                  ? 'Tap the heart on an image to collect your favorites here.'
                  : 'Explore another style to find your next inspiration.',
            )}
          </p>
        </div>
      )}
    </>
  );
}

import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import type { ReactNode } from 'react';
import FavoriteButton from './FavoriteButton';
import { imageName } from '../utils/imageName';
import type { GallerySection, GalleryTile } from '../types';
interface Props {
  headingAction?: ReactNode;
  largeThumbnails: boolean;
  setLargeThumbnails: (large: boolean) => void;
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
          <div className="section-heading">
            <h2>
              {t(group.label)}
              <span>{group.tiles.length}</span>
            </h2>
            <div className="gallery-heading-actions">
              {p.headingAction}
              <div className="thumbnail-sizes" role="group" aria-label={t('Thumbnail size')}>
                <button
                  className="icon-button"
                  aria-label={t('Small thumbnails')}
                  title={t('Small thumbnails')}
                  aria-pressed={!p.largeThumbnails}
                  onClick={() => p.setLargeThumbnails(false)}
                >
                  <Icon name="grid_view" size="20" className={!p.largeThumbnails ? 'fill' : ''} />
                </button>
                <button
                  className="icon-button"
                  aria-label={t('Large thumbnails')}
                  title={t('Large thumbnails')}
                  aria-pressed={p.largeThumbnails}
                  onClick={() => p.setLargeThumbnails(true)}
                >
                  <Icon name="view_agenda" size="20" className={p.largeThumbnails ? 'fill' : ''} />
                </button>
              </div>
            </div>
          </div>
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
                      <span>#{t(tile.id.startsWith('photo-') ? 'Photo' : 'Illustration')}</span>
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

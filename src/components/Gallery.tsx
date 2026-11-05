import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';
import { imageName } from '../utils/imageName';
import type { GallerySection, GalleryTile } from '../types';
import './Gallery.scss';
interface Props {
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
          </div>
          <div className="image-grid">
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
                  onClick={() => p.select(tile)}
                />
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
        <div className="empty-state">
          <h2>{t(p.emptyMessage)}</h2>
        </div>
      )}
    </>
  );
}

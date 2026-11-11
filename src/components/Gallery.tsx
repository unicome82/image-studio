import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
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
// Column count follows the grid's CSS: a fixed --grid-columns on mobile, else as many
// --grid-column-width columns as fit, matching the old CSS multi-column behavior.
function useColumnCount(ref: RefObject<HTMLDivElement | null>, large: boolean) {
  const [count, setCount] = useState(1);
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const measure = () => {
      const style = getComputedStyle(grid);
      const fixed = parseInt(style.getPropertyValue('--grid-columns'), 10);
      const width = parseFloat(style.getPropertyValue('--grid-column-width')) || 1;
      const gap = parseFloat(style.columnGap) || 0;
      setCount(
        fixed > 0 ? fixed : Math.max(1, Math.floor((grid.clientWidth + gap) / (width + gap))),
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    measure();
    return () => observer.disconnect();
  }, [ref, large]);
  return count;
}

// Deals tiles in order into the shortest column, so the sort order reads left to right.
function MasonryGrid({
  tiles,
  large,
  render,
}: {
  tiles: GalleryTile[];
  large: boolean;
  render: (tile: GalleryTile) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const count = useColumnCount(ref, large);
  const columns: GalleryTile[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);
  for (const tile of tiles) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(tile);
    heights[shortest] += tile.height / tile.width;
  }
  return (
    <div ref={ref} className={'image-grid' + (large ? ' large' : '')}>
      {columns.map((column, index) => (
        <div className="image-column" key={index}>
          {column.map(render)}
        </div>
      ))}
    </div>
  );
}

export default function Gallery(p: Props) {
  const { t } = useTranslation();
  const total = p.groups.reduce((sum, group) => sum + group.tiles.length, 0);
  return (
    <>
      {p.groups.map((group) => (
        <section className="gallery-section" id={'section-' + group.id} key={group.id}>
          <MasonryGrid
            tiles={group.tiles}
            large={p.largeThumbnails}
            render={(tile) => (
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
            )}
          />
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

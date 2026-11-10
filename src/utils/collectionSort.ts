export type CollectionSort = 'newest' | 'oldest';
/** The gallery also offers its per-visit random order. */
export type GallerySort = CollectionSort | 'random';
/** Saved rank increases with recency; sorting never changes the stored order. */
export function sortCollection<T>(
  items: T[],
  order: CollectionSort,
  rank: (item: T) => number,
): T[] {
  return [...items].sort((a, b) => (order === 'newest' ? rank(b) - rank(a) : rank(a) - rank(b)));
}

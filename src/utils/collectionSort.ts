export type CollectionSort = 'newest' | 'oldest' | 'name-asc' | 'name-desc';
/** Saved rank increases with recency; sorting never changes the stored order. */
export function sortCollection<T>(
  items: T[],
  order: CollectionSort,
  name: (item: T) => string,
  rank: (item: T) => number,
  locale: string,
): T[] {
  return [...items].sort((a, b) => {
    if (order === 'newest') return rank(b) - rank(a);
    if (order === 'oldest') return rank(a) - rank(b);
    const result = name(a).localeCompare(name(b), locale, { numeric: true, sensitivity: 'base' });
    return order === 'name-desc' ? -result : result;
  });
}

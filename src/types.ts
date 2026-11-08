export interface GalleryTile {
  fileName?: string;
  id: string;
  group: string;
  label: string;
  color: string;
  index: number;
  width: number;
  height: number;
  // Applied Builder options; samples carry seeded values drawn from the real catalog.
  selection?: Record<string, string[]>;
  complexity?: number;
}
export interface GallerySection {
  id: string;
  label: string;
  tiles: GalleryTile[];
}

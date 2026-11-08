export interface GalleryTile {
  fileName?: string;
  // Generated image URL; tiles without one render their placeholder color.
  src?: string;
  id: string;
  group: string;
  label: string;
  color: string;
  index: number;
  width: number;
  height: number;
  // Applied Builder options; samples carry seeded values drawn from the real catalog.
  selection?: Record<string, string[]>;
}
export interface GallerySection {
  id: string;
  label: string;
  tiles: GalleryTile[];
}

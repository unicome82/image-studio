export interface GalleryTile {
  id: string;
  group: string;
  label: string;
  color: string;
  index: number;
  width: number;
  height: number;
}
export interface GallerySection {
  id: string;
  label: string;
  tiles: GalleryTile[];
}

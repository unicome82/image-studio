export interface GalleryTile {
  fileName: string;
  // Generated image URL; the placeholder color shows until it loads.
  src: string;
  id: string;
  type: 'illustration' | 'photo' | 'design';
  // Lead style or format ID and its catalog name.
  group: string;
  label: string;
  color: string;
  index: number;
  width: number;
  height: number;
  // Builder fields and options that produced the image.
  fields: Record<string, string>;
  selection: Record<string, string[]>;
}
export interface GallerySection {
  id: string;
  label: string;
  tiles: GalleryTile[];
}

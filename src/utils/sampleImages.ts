import type { Selection } from './promptBuilder';

/** Generated images in public/samples, each tagged with the exact Builder settings that made it. */
export interface SampleImage {
  type: 'illustration' | 'photo' | 'design';
  fileName: string;
  width: number;
  height: number;
  /** Placeholder color shown until the image loads. */
  color: string;
  /** Builder fields used for the prompt; the ratio comes from the image size. */
  fields: Record<string, string>;
  selection: Selection;
}
export const sampleImages: SampleImage[] = [
  {
    type: 'illustration',
    fileName: 'blank-sample.webp',
    width: 1200,
    height: 1200,
    color: '#f0f0f3',
    fields: { Subject: '' },
    selection: { Depiction: ['simple'] },
  },
];

/** Placeholder color with the real image layered on top when the tile has one. */
export function imageStyle(image: { color: string; src?: string }) {
  return {
    backgroundColor: image.color,
    ...(image.src ? { backgroundImage: `url("${image.src}")` } : {}),
  };
}

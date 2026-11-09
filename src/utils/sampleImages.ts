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
    fileName: 'risograph-calico-cat-windowsill.webp',
    width: 960,
    height: 1280,
    color: '#bac4d4',
    fields: { Subject: 'A calico cat napping on a sunny windowsill' },
    selection: {
      'Illustration Style': ['risograph'],
      Color: ['complementary'],
      Tone: ['bright'],
      Outline: ['coloroutline'],
      Texture: ['papergrain'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'photo',
    fileName: 'stilllife-lemon-sparkling-water.webp',
    width: 960,
    height: 1200,
    color: '#a9906a',
    fields: { Subject: 'A glass of sparkling water with lemon' },
    selection: {
      'Photo Style': ['stilllife'],
      Color: ['earthy'],
      Tone: ['highcontrast'],
      Texture: ['softmatte'],
      Depiction: ['simple'],
    },
  },
];

/** Placeholder color with the real image layered on top when the tile has one. */
export function imageStyle(image: { color: string; src?: string }) {
  return {
    backgroundColor: image.color,
    ...(image.src ? { backgroundImage: `url("${image.src}")` } : {}),
  };
}

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
    fileName: 'risograph-bicycle-flower-basket.webp',
    width: 960,
    height: 1280,
    color: '#cfccc0',
    fields: { Subject: 'A bicycle with a flower basket against a sunlit wall' },
    selection: {
      'Illustration Style': ['risograph'],
      Color: ['vivid'],
      Tone: ['bright'],
      Outline: ['coloronly'],
      Texture: ['papergrain'],
      Depiction: ['balanced'],
    },
  },
  {
    type: 'illustration',
    fileName: 'risograph-moka-pot-croissant.webp',
    width: 960,
    height: 1280,
    color: '#e3d7da',
    fields: { Subject: 'A moka pot, a coffee mug and a croissant on a checkered tablecloth' },
    selection: {
      'Illustration Style': ['risograph'],
      Color: ['complementary'],
      Tone: ['bright'],
      Outline: ['coloronly'],
      Texture: ['papergrain'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'illustration',
    fileName: 'risograph-books-glasses-lamp.webp',
    width: 960,
    height: 1280,
    color: '#ddd6ca',
    fields: { Subject: 'A stack of books with glasses beside a yellow desk lamp' },
    selection: {
      'Illustration Style': ['risograph'],
      Color: ['primarycolors'],
      Tone: ['bright'],
      Outline: ['coloronly'],
      Texture: ['papergrain'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'illustration',
    fileName: 'risograph-lemon-bowl.webp',
    width: 960,
    height: 1280,
    color: '#d1ceb5',
    fields: { Subject: 'A blue bowl of lemons on a checkered tablecloth' },
    selection: {
      'Illustration Style': ['risograph'],
      Color: ['primarycolors'],
      Tone: ['bright'],
      Outline: ['coloronly'],
      Texture: ['papergrain'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'illustration',
    fileName: 'risograph-iced-drink-strawberry-cake.webp',
    width: 960,
    height: 1280,
    color: '#eecfbf',
    fields: { Subject: 'An iced drink and a slice of strawberry cake' },
    selection: {
      'Illustration Style': ['risograph'],
      Color: ['warm'],
      Tone: ['bright'],
      Outline: ['coloroutline'],
      Texture: ['papergrain'],
      Depiction: ['simple'],
    },
  },
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

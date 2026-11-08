import type { Selection } from './promptBuilder';

/** Generated sample images in public/samples, tagged with the exact Builder settings that made them. */
export interface SampleImage {
  fileName: string;
  width: number;
  height: number;
  color: string;
  selection: Selection;
}
export const sampleImages: Record<string, SampleImage[]> = {
  artdeco: [
    {
      fileName: 'artdeco-train-station.webp',
      width: 1086,
      height: 1448,
      color: '#d9a46e',
      selection: {
        'Illustration Style': ['artdeco'],
        Technique: ['gouache'],
        Outline: ['coloronly'],
        Color: ['warm'],
        Lighting: ['goldenhour'],
        Composition: ['symmetric'],
        Mood: ['luxe'],
      },
    },
  ],
};

/** Placeholder color with the real image layered on top when the tile has one. */
export function imageStyle(image: { color: string; src?: string }) {
  return {
    backgroundColor: image.color,
    ...(image.src ? { backgroundImage: `url("${image.src}")` } : {}),
  };
}

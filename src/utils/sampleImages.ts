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
    fileName: 'popart-dog-astronaut.webp',
    width: 960,
    height: 1200,
    color: '#9c937b',
    fields: { Subject: 'A dog astronaut' },
    selection: {
      'Illustration Style': ['popart'],
      Outline: ['coloroutline'],
      Color: ['vivid'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'illustration',
    fileName: 'isometric-tiny-rooftop-garden-cafe.webp',
    width: 1200,
    height: 1200,
    color: '#cac8ba',
    fields: { Subject: 'A tiny rooftop garden cafe' },
    selection: {
      'Illustration Style': ['isometric'],
      Outline: ['coloronly'],
      Color: ['pastel'],
      Texture: ['clean'],
      Depiction: ['verycomplex'],
    },
  },
  {
    type: 'illustration',
    fileName: 'pixelart-cat-in-front-of-an-arcade.webp',
    width: 1200,
    height: 675,
    color: '#7950a1',
    fields: { Subject: 'A cat in front of an arcade' },
    selection: {
      'Illustration Style': ['pixelart'],
      Outline: ['coloronly'],
      Color: ['neon'],
      Depiction: ['verycomplex'],
    },
  },
  {
    type: 'illustration',
    fileName: 'impressionism-rowing-boat-on-a-misty-lake.webp',
    width: 1200,
    height: 800,
    color: '#cfa299',
    fields: { Subject: 'A rowing boat on a misty lake' },
    selection: {
      'Illustration Style': ['impressionism'],
      Outline: ['coloronly'],
      Color: ['analogous'],
      Texture: ['canvas'],
      Depiction: ['complex'],
    },
  },
  {
    type: 'illustration',
    fileName: 'geometricillustration-jeweled-peacock.webp',
    width: 1200,
    height: 1200,
    color: '#2d4054',
    fields: { Subject: 'A jeweled peacock' },
    selection: {
      'Illustration Style': ['geometricillustration'],
      Outline: ['coloronly'],
      Depiction: ['balanced'],
    },
  },
  {
    type: 'illustration',
    fileName: 'continuousline-jazz-pianist.webp',
    width: 800,
    height: 1200,
    color: '#e7e1db',
    fields: { Subject: 'A jazz pianist' },
    selection: {
      'Illustration Style': ['continuousline'],
      Outline: ['outlineonly'],
      Color: ['monochrome'],
      Depiction: ['verysimple'],
    },
  },
  {
    type: 'illustration',
    fileName: 'maximalism-cats-birthday-party.webp',
    width: 1200,
    height: 900,
    color: '#b08d7c',
    fields: { Subject: "A cat's birthday party" },
    selection: {
      'Illustration Style': ['maximalism'],
      Outline: ['coloroutline'],
      Color: ['complementary'],
      Depiction: ['verycomplex'],
    },
  },
  {
    type: 'illustration',
    fileName: 'grunge-skateboarder-under-a-bridge.webp',
    width: 900,
    height: 1200,
    color: '#5c4e42',
    fields: { Subject: 'A skateboarder under a bridge' },
    selection: {
      'Illustration Style': ['grunge'],
      Outline: ['coloronly'],
      Color: ['lowkey'],
      Texture: ['brushstroke'],
      Depiction: ['complex'],
    },
  },
  {
    type: 'illustration',
    fileName: 'contemporaryflat-working-from-home.webp',
    width: 960,
    height: 1200,
    color: '#c2a97d',
    fields: { Subject: 'A woman working from home among plants' },
    selection: {
      'Illustration Style': ['contemporaryflat'],
      Outline: ['coloronly'],
      Color: ['neutralaccent'],
      Depiction: ['complex'],
    },
  },
  {
    type: 'illustration',
    fileName: 'brutalism-tiny-concrete-house.webp',
    width: 1200,
    height: 1200,
    color: '#c8ad90',
    fields: { Subject: 'A tiny concrete house' },
    selection: {
      'Illustration Style': ['brutalism'],
      Outline: ['coloronly'],
      Color: ['earthy'],
      Texture: ['softmatte'],
      Depiction: ['balanced'],
    },
  },
  {
    type: 'illustration',
    fileName: 'minimalism-lighthouse-in-winter.webp',
    width: 675,
    height: 1200,
    color: '#adbce7',
    fields: { Subject: 'A lighthouse in winter' },
    selection: {
      'Illustration Style': ['minimalism'],
      Outline: ['coloronly'],
      Color: ['cool'],
      Texture: ['papergrain'],
      Depiction: ['verysimple'],
    },
  },
  {
    type: 'photo',
    fileName: 'fashion-model-in-a-red-trench-coat.webp',
    width: 960,
    height: 1200,
    color: '#682e30',
    fields: { Subject: 'A model in a red trench coat' },
    selection: {
      'Photo Style': ['fashion'],
      Depiction: ['balanced'],
    },
  },
  {
    type: 'photo',
    fileName: 'architectural-spiral-staircase.webp',
    width: 900,
    height: 1200,
    color: '#c7bdb3',
    fields: { Subject: 'A spiral staircase' },
    selection: {
      'Photo Style': ['architectural'],
      Color: ['highkey'],
      Depiction: ['balanced'],
    },
  },
  {
    type: 'photo',
    fileName: 'documentary-street-market-vendor-at-dawn.webp',
    width: 1200,
    height: 800,
    color: '#826045',
    fields: { Subject: 'A street market vendor at dawn' },
    selection: {
      'Photo Style': ['documentary'],
      Color: ['earthy'],
      Texture: ['filmgrain'],
      Depiction: ['verycomplex'],
    },
  },
  {
    type: 'photo',
    fileName: 'stilllife-lemon-slice-in-a-glass.webp',
    width: 1200,
    height: 1200,
    color: '#c9ceb9',
    fields: { Subject: 'A lemon slice in a glass' },
    selection: {
      'Photo Style': ['stilllife'],
      Color: ['pastel'],
      Texture: ['frostedglass'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'photo',
    fileName: 'fineart-dancer-in-flowing-fabric.webp',
    width: 800,
    height: 1200,
    color: '#373736',
    fields: { Subject: 'A dancer in flowing fabric' },
    selection: {
      'Photo Style': ['fineart'],
      Color: ['blackwhite'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'design',
    fileName: 'packaging-lemon-soda.webp',
    width: 960,
    height: 1200,
    color: '#7fa9ac',
    fields: { Subject: 'Packaging for a lemon soda' },
    selection: {
      'Design Format': ['packaging'],
      'Design Style': ['retro'],
      Color: ['vivid'],
      Depiction: ['simple'],
    },
  },
  {
    type: 'design',
    fileName: 'iconset-weather-icon-set.webp',
    width: 1200,
    height: 1200,
    color: '#c9d5e1',
    fields: { Subject: 'A weather icon set' },
    selection: {
      'Design Format': ['iconset'],
      'Design Style': ['boldgeometric'],
      Color: ['primarycolors'],
      Depiction: ['verysimple'],
    },
  },
  {
    type: 'design',
    fileName: 'emblem-mountain-hiking-club.webp',
    width: 1200,
    height: 1200,
    color: '#bd9f96',
    fields: { Subject: 'An emblem for a mountain hiking club' },
    selection: {
      'Design Format': ['emblem'],
      'Design Style': ['bauhaus'],
      Color: ['duotone'],
      Texture: ['clean'],
      Depiction: ['verysimple'],
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

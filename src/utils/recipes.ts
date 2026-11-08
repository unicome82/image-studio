import type { Selection } from './promptBuilder.ts';

/** Curated starting points; they only set Builder values, so hand-picked settings use the same prompt rules. */
export interface Recipe {
  id: string;
  label: string;
  /** Shown on hover in place of the name; also a translation key. */
  description: string;
  /** Card swatch until the recipe has a sample image. */
  color: string;
  type: 'illustration' | 'photo' | 'design';
  selection: Selection;
  complexity: number;
  ratio: string;
  typography?: boolean;
}
export const recipes: Recipe[] = [
  {
    id: 'softminimaleditorial',
    label: 'Soft Minimal Editorial',
    description: 'Calm flat editorial with one accent',
    color: '#e9e7e1',
    type: 'illustration',
    selection: {
      'Illustration Style': ['editorialillustration'],
      Technique: ['flatcolor'],
      Outline: ['coloronly'],
      Color: ['neutralaccent'],
      Texture: ['clean'],
      Composition: ['minimal'],
      Mood: ['serene'],
    },
    complexity: 2,
    ratio: '4:5',
  },
  {
    id: 'cozystorybook',
    label: 'Cozy Storybook',
    description: 'Warm painted picture-book scenes',
    color: '#f2dcc4',
    type: 'illustration',
    selection: {
      'Illustration Style': ['storybookillustration'],
      Technique: ['digitalpainting'],
      Outline: ['coloronly'],
      Color: ['pastel'],
      Lighting: ['softdaylight'],
      Mood: ['cozy'],
    },
    complexity: 3,
    ratio: '4:5',
  },
  {
    id: 'playfulclay',
    label: 'Playful Clay 3D',
    description: 'Soft matte clay 3D in pastel',
    color: '#f5cfdc',
    type: 'illustration',
    selection: {
      'Illustration Style': ['contemporaryflat'],
      Technique: ['clayrender'],
      Outline: ['coloronly'],
      Color: ['pastel'],
      Lighting: ['studio'],
      Texture: ['softmatte'],
      Mood: ['playful'],
    },
    complexity: 2,
    ratio: '1:1',
  },
  {
    id: 'boldriso',
    label: 'Bold Riso Print',
    description: 'Punchy geometric risograph print',
    color: '#ff6b4a',
    type: 'illustration',
    selection: {
      'Illustration Style': ['geometricillustration'],
      Technique: ['risograph'],
      Outline: ['coloronly'],
      Color: ['complementary'],
      Composition: ['dynamic'],
      Mood: ['bold'],
    },
    complexity: 3,
    ratio: '4:5',
  },
  {
    id: 'quietluxuryproduct',
    label: 'Quiet Luxury Product',
    description: 'Minimal product shot, soft depth',
    color: '#ddd5ca',
    type: 'photo',
    selection: {
      'Photo Style': ['product'],
      Camera: ['shallowdepth'],
      Color: ['neutralaccent'],
      Lighting: ['softdaylight'],
      Texture: ['clean'],
      Composition: ['minimal'],
      Mood: ['luxe'],
    },
    complexity: 2,
    ratio: '4:5',
  },
  {
    id: 'airyfood',
    label: 'Airy Food Flat Lay',
    description: 'Bright overhead food shot',
    color: '#eef0e6',
    type: 'photo',
    selection: {
      'Photo Style': ['food'],
      Camera: ['flatlay'],
      Color: ['highkey'],
      Lighting: ['softdaylight'],
      Mood: ['fresh'],
    },
    complexity: 3,
    ratio: '4:5',
  },
  {
    id: 'moodyfilmportrait',
    label: 'Moody Film Portrait',
    description: 'Backlit portrait with film grain',
    color: '#4a4550',
    type: 'photo',
    selection: {
      'Photo Style': ['portrait'],
      Camera: ['portraitlens'],
      Color: ['muted'],
      Lighting: ['backlit'],
      Texture: ['filmgrain'],
      Mood: ['moody'],
    },
    complexity: 3,
    ratio: '2:3',
  },
  {
    id: 'flashfashion',
    label: 'Raw Flash Fashion',
    description: 'Vivid direct-flash fashion',
    color: '#ff4f8b',
    type: 'photo',
    selection: {
      'Photo Style': ['fashion'],
      Camera: ['wideangle'],
      Color: ['vivid'],
      Lighting: ['hardflash'],
      Mood: ['raw'],
    },
    complexity: 3,
    ratio: '2:3',
  },
  {
    id: 'swissposter',
    label: 'Swiss Type Poster',
    description: 'Grid poster with bold type',
    color: '#e63022',
    type: 'design',
    selection: {
      'Design Format': ['poster'],
      'Design Style': ['swiss'],
      Typography: ['boldgrotesk'],
      Composition: ['grid'],
      Mood: ['bold'],
    },
    complexity: 2,
    ratio: '3:4',
    typography: true,
  },
  {
    id: 'gradientglassposter',
    label: 'Gradient Glass Poster',
    description: 'Iridescent frosted-glass poster',
    color: '#b9a7ff',
    type: 'design',
    selection: {
      'Design Format': ['poster'],
      'Design Style': ['gradientglass'],
      Color: ['iridescent'],
      Texture: ['frostedglass'],
      Mood: ['futuristic'],
    },
    complexity: 2,
    ratio: '4:5',
  },
  {
    id: 'playfulpattern',
    label: 'Playful Pattern',
    description: 'Vivid Memphis repeat pattern',
    color: '#3ec7b1',
    type: 'design',
    selection: {
      'Design Format': ['pattern'],
      'Design Style': ['memphis'],
      Color: ['vivid'],
      Mood: ['playful'],
    },
    complexity: 3,
    ratio: '1:1',
  },
  {
    id: 'minimalpackaging',
    label: 'Minimal Packaging',
    description: 'Quiet luxe matte packaging',
    color: '#d6d2c8',
    type: 'design',
    selection: {
      'Design Format': ['packaging'],
      'Design Style': ['minimalist'],
      Color: ['neutralaccent'],
      Lighting: ['studio'],
      Texture: ['softmatte'],
      Mood: ['luxe'],
    },
    complexity: 2,
    ratio: '4:5',
  },
];
/** A recipe stays marked while the draft still matches it exactly. */
export function matchesRecipe(
  recipe: Recipe,
  selection: Selection,
  complexity: number,
  ratio: string,
): boolean {
  const ids = (value: Selection) =>
    JSON.stringify(
      Object.entries(value)
        .filter(([, list]) => list.length)
        .map(([category, list]) => [category, [...list].sort()])
        .sort(),
    );
  return (
    complexity === recipe.complexity &&
    ratio === recipe.ratio &&
    ids(selection) === ids(recipe.selection)
  );
}

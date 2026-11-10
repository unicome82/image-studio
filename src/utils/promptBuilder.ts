export interface Option {
  id: string;
  label: string;
  category: string;
  path: string;
  prompt: string;
  /** One-line rule from the source MD, printed after the label in the prompt. */
  cue?: string;
}
export type Selection = Record<string, string[]>;
export type ImageType = 'illustration' | 'photo' | 'design';
// Curated display order of design formats.
export const designFormatOrder = [
  'poster',
  'logo',
  'packaging',
  'infographic',
  'iconset',
  'pattern',
  'greetingcard',
  'website',
  'emblem',
  'product',
  'character',
  'appscreen',
  'signage',
];
// Curated display order of tones: light and contrast, shadow finish, light quality, then mood.
export const toneOrder = [
  'highkey',
  'lowkey',
  'highcontrast',
  'lowcontrast',
  'faded',
  'matte',
  'soft',
  'hazy',
  'backlit',
  'dramatic',
  'moody',
  'calm',
  'dreamy',
  'elegant',
];
// Curated display orders of the photo and design style and technique choices.
export const photoStyleOrder = [
  'editorial',
  'fashion',
  'cinematic',
  'minimal',
  'fineart',
  'street',
  'stilllife',
  'abstract',
];
export const photoTechniqueOrder = [
  'film',
  'lofi',
  'motionblur',
  'flash',
  'softfocus',
  'longexposure',
];
export const designStyleOrder = [
  'minimalist',
  'maximalism',
  'swiss',
  'midcentury',
  'brutalist',
  'y2k',
  'avantgarde',
  'retro',
  'futurism',
  'postmodernism',
];
export const designGraphicOrder = [
  'geometric',
  'abstract',
  'risograph',
  'halftone',
  'gradient',
  'glassmorphism',
  'chrome',
  'collage',
  '3d',
  'generative',
];
// Typography runs from sans and serif families to display, effect and hand-made letters.
export const typographyOrder = [
  'sansserif',
  'serif',
  'boldgrotesk',
  'display',
  'monospace',
  'outlinetype',
  'bubblelettering',
  'calligraphy',
  'handlettering',
  'childlikehandwriting',
  'experimentaltypography',
];
// The letter weight sits before the typography styles and takes at most one choice.
export const typographyWeights = ['thin', 'bold'];
// Categories whose options follow a curated order instead of folder names.
export const optionOrder: Record<string, string[]> = {
  'Photo Style': photoStyleOrder,
  'Photo Technique': photoTechniqueOrder,
  'Design Format': designFormatOrder,
  'Design Style': designStyleOrder,
  'Design Graphic': designGraphicOrder,
  Tone: toneOrder,
  Typography: typographyOrder,
  'Typography Weight': typographyWeights,
};
export const aspectRatios = ['1:1', '4:5', '3:4', '2:3', '9:16', '4:3', '3:2', '16:9'];
// Every Builder category takes one decisive choice; choosing it again clears it,
// except required categories, which always keep one choice.
export const requiredCategories = [
  'Illustration Style',
  'Photo Style',
  'Design Format',
  'Design Style',
  'Depiction',
];
// The style each type starts with, also filled into saved mockups that lack one.
export const defaultLeadOptions: Selection = {
  'Illustration Style': ['contemporaryflat'],
  'Photo Style': ['editorial'],
  'Design Format': ['poster'],
  'Design Style': ['minimalist'],
};
// How simply or richly each mockup image depicts its subject; every mockup states one level.
export const depictionLevels = ['verysimple', 'simple', 'balanced', 'complex', 'verycomplex'];
export const defaultDepiction = 'simple';
export function optionLimit(): number {
  return 1;
}
// Saved mockups keep the subject and the typography switch and text.
export function compactFields(fields: Record<string, string>): Record<string, string> {
  return {
    Subject: fields.Subject ?? '',
    ...(isTypographyEnabled(fields) ? { 'Typography Enabled': 'true' } : {}),
    ...(fields.Text ? { Text: fields.Text } : {}),
  };
}
/** Typography is optional for every type and applies only while its switch is on. */
export function isTypographyEnabled(fields: Record<string, string>): boolean {
  return fields['Typography Enabled'] === 'true';
}
// The weight and the typography style share the Typography section and its switch.
export const typographyCategories = ['Typography Weight', 'Typography'];
/** The selection that applies: a typography style counts only while typography is on. */
export function activeSelection(selection: Selection, fields: Record<string, string>): Selection {
  if (isTypographyEnabled(fields)) return selection;
  return Object.fromEntries(
    Object.entries(selection).filter(([category]) => !typographyCategories.includes(category)),
  );
}
export function imageType(photo: boolean, design = false): ImageType {
  return design ? 'design' : photo ? 'photo' : 'illustration';
}
// The lead style and its optional technique come first so the defining look is read before color;
// every type ends with the optional typography.
export function builderCategories(photo: boolean, design = false): string[] {
  return design
    ? ['Design Format', 'Design Style', 'Design Graphic', 'Color', 'Tone', ...typographyCategories]
    : photo
      ? ['Photo Style', 'Photo Technique', 'Color', 'Tone', ...typographyCategories]
      : ['Illustration Style', 'Color', 'Tone', 'Outline', ...typographyCategories];
}
// Gallery images also carry the texture they were made with.
export function imageCategories(photo: boolean, design = false): string[] {
  return [...builderCategories(photo, design), 'Texture'];
}
export function toggleOption(selection: Selection, category: string, id: string): Selection {
  const current = selection[category] ?? [];
  return {
    ...selection,
    [category]: !requiredCategories.includes(category) && current.includes(id) ? [] : [id],
  };
}
// The prompt names Outline by its role and drops the type from technique categories.
const promptNames: Record<string, string> = {
  Outline: 'Rendering Mode',
  'Photo Technique': 'Technique',
  'Design Graphic': 'Graphic',
};
const promptCategory = (category: string) => promptNames[category] ?? category;
// Option lines after Color: tone and rendering first, then the photo technique or graphic treatment.
const mockupLineOrder = ['Tone', 'Outline', 'Photo Technique', 'Design Graphic'];
// Each option prints its label plus the MD's one-line cue so the model gets the decisive rule.
const optionLine = (o: Option) =>
  `${promptCategory(o.category)}: ${o.label}${o.cue ? ` — ${o.cue}` : ''}`;
function chosenOptions(categories: string[], catalog: Option[], selection: Selection): Option[] {
  return categories.flatMap((category) =>
    (selection[category] ?? []).flatMap((id) =>
      catalog.filter((o) => o.category === category && o.id === id),
    ),
  );
}
const words: Record<ImageType, { site: string; one: string }> = {
  illustration: { site: 'minimal gallery website', one: 'illustration' },
  photo: { site: 'minimal photography portfolio website', one: 'photograph' },
  design: { site: 'minimal design studio portfolio website', one: 'design' },
};
// The lead style names the look; design reads as "Swiss Poster".
function styleName(catalog: Option[], selection: Selection, type: ImageType) {
  const lead =
    type === 'design'
      ? ['Design Style', 'Design Format']
      : [builderCategories(type === 'photo')[0]];
  return lead
    .map(
      (category) =>
        catalog.find((o) => o.category === category && o.id === selection[category]?.[0])?.label,
    )
    .filter(Boolean)
    .join(' ');
}
/** The level phrase (its Cue) such as "very simple"; missing levels read as Simple. */
export function depictionPhrase(catalog: Option[], selection: Selection) {
  const id = selection.Depiction?.[0] ?? defaultDepiction;
  return catalog.find((o) => o.category === 'Depiction' && o.id === id)?.cue ?? 'simple';
}
// The subject follows a colon so any input, with or without an article, reads naturally.
// Typography is mentioned only when on; naming it when off can itself invite lettering.
function typographyLines(
  catalog: Option[],
  selection: Selection,
  fields: Record<string, string>,
  target: string,
  cue = false,
) {
  if (!isTypographyEnabled(fields)) return [];
  const [weight, style] = typographyCategories.map(
    (category) => chosenOptions([category], catalog, selection)[0],
  );
  // The mockup reads the weight and style as one phrase such as "Thin Serif".
  const look = [weight?.label, style?.label].filter(Boolean).join(' ');
  return [
    ...(cue && (weight || style)
      ? [weight, style].filter((o): o is Option => !!o).map(optionLine)
      : [`Typography: ${look || 'On'}`]),
    fields.Text?.trim()
      ? `Text: ${fields.Text}`
      : `Text: Not specified. Choose suitable wording freely to complement ${target}.`,
  ];
}
const subjectLine = (depiction: string, subject?: string) =>
  subject
    ? `Each image shows a different ${depiction} take on the subject: ${subject}`
    : `Each image shows a different ${depiction} subject.`;
// Every mockup keeps a grown-up, modern and chic tone.
const mockupMood = 'Mood: modern and chic, refined and grown-up';
// Each image gets its own colors so the gallery does not settle on one color;
// black and white varies its grayscale tone and monochrome varies its hue.
const colorVariation: Record<string, string> = {
  blackwhite: 'a different grayscale tone',
  monochrome: 'a different hue',
};
const colorLine = (color?: Option) =>
  color
    ? `Color: ${color.label}, with ${colorVariation[color.id] ?? 'different colors'} for each image`
    : 'Color: different colors for each image';
/** One mockup of a minimal gallery site whose 9 to 12 images share the chosen style. */
export function makeMockupPrompt(
  catalog: Option[],
  selection: Selection,
  fields: Record<string, string>,
  type: ImageType,
) {
  selection = activeSelection(selection, fields);
  const style = styleName(catalog, selection, type);
  // Naming the medium keeps an illustration style such as Minimalism from turning into photos.
  const media = `${words[type].one}s`;
  // Optional options are listed only when chosen; color always asks for different colors per image.
  const extras = chosenOptions(
    builderCategories(type === 'photo', type === 'design'),
    catalog,
    selection,
  ).filter(
    (o) =>
      !['Illustration Style', 'Photo Style', 'Design Format', 'Design Style'].includes(o.category),
  );
  // The header spells out the chosen look so each mockup labels its own settings.
  const depictionId = selection.Depiction?.[0] ?? defaultDepiction;
  const depiction = catalog.find((o) => o.category === 'Depiction' && o.id === depictionId);
  const headerText = [style, ...extras.map((o) => o.label), depiction?.label]
    .filter(Boolean)
    .join(' · ');
  return [
    `Design a mockup of a ${words[type].site}: white background, only a simple header and a masonry gallery of 9 to 12 ${media} in mixed aspect ratios.`,
    `The header shows the style and options as text: ${headerText}`,
    '',
    style ? `All ${media} share one style: ${style}` : `All ${media} share one consistent style.`,
    mockupMood,
    colorLine(extras.find((o) => o.category === 'Color')),
    ...extras
      .filter((o) => !['Color', ...typographyCategories].includes(o.category))
      .sort((a, b) => mockupLineOrder.indexOf(a.category) - mockupLineOrder.indexOf(b.category))
      .map((o) => `${promptCategory(o.category)}: ${o.label}`),
    ...typographyLines(catalog, selection, fields, `each ${words[type].one}`),
    subjectLine(depictionPhrase(catalog, selection), fields.Subject?.trim()),
  ].join('\n');
}
/** A standalone prompt for one gallery image, usable without the mockup chat. */
export function makeImagePrompt(
  catalog: Option[],
  selection: Selection,
  fields: Record<string, string>,
  type: ImageType,
) {
  const subject = fields.Subject?.trim();
  const categories = imageCategories(type === 'photo', type === 'design').filter(
    (category) => !typographyCategories.includes(category),
  );
  return [
    `Create a standalone ${words[type].one} of ${subject ? `"${subject}"` : 'a subject you choose'}.`,
    ...chosenOptions(categories, catalog, selection).map(optionLine),
    ...typographyLines(catalog, selection, fields, `the ${words[type].one}`, true),
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
  ].join('\n');
}

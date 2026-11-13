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
  'artdeco',
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
// The typeface pool runs from sans and serif families to display, effect and hand-made letters.
export const typographyOrder = [
  'sansserif',
  'serif',
  'display',
  'monospace',
  'outlinetype',
  'bubblelettering',
  'calligraphy',
  'handlettering',
  'childlikehandwriting',
  'experimentaltypography',
];
// Letter weights that typography picks from at random.
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
export function imageType(photo: boolean, design = false): ImageType {
  return design ? 'design' : photo ? 'photo' : 'illustration';
}
// The lead style and its optional technique come first so the defining look is read before color.
export function builderCategories(photo: boolean, design = false): string[] {
  return design
    ? ['Design Format', 'Design Style', 'Design Graphic', 'Color', 'Tone']
    : photo
      ? ['Photo Style', 'Photo Technique', 'Color', 'Tone']
      : ['Illustration Style', 'Color', 'Tone'];
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
// The prompt drops the type from technique categories.
const promptNames: Record<string, string> = {
  'Photo Technique': 'Technique',
  'Design Graphic': 'Graphic',
};
const promptCategory = (category: string) => promptNames[category] ?? category;
// Option lines after Color: tone first, then the photo technique or graphic treatment.
const mockupLineOrder = ['Tone', 'Photo Technique', 'Design Graphic'];
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
// The middle level leaves the detail to the style, so it adds no Detail line.
const plainDepiction = 'balanced';
/** The detail level's Cue such as "simple composition, limited details"; missing levels read as Simple, Balanced as none. */
export function depictionPhrase(catalog: Option[], selection: Selection) {
  const id = selection.Depiction?.[0] ?? defaultDepiction;
  if (id === plainDepiction) return '';
  return catalog.find((o) => o.category === 'Depiction' && o.id === id)?.cue ?? '';
}
// The subject follows a colon so any input, with or without an article, reads naturally.
// Typography is mentioned only when on; naming it when off can itself invite lettering.
// No style is chosen: the image picks its typeface and weight at random from the catalog's pool.
function typographyLines(catalog: Option[], fields: Record<string, string>, mockup: boolean) {
  if (!isTypographyEnabled(fields)) return [];
  const labels = (category: string, order: string[]) =>
    catalog
      .filter((o) => o.category === category)
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
      .map((o) => o.label);
  const faces = labels('Typography', typographyOrder).join(', ');
  const weights = labels('Typography Weight', typographyWeights)
    .map((label) => label.toLowerCase())
    .join(' or ');
  const target = mockup ? 'each image' : 'the image';
  return [
    `Typography: ${mockup ? 'a different typeface and lettering style for each image' : 'one typeface and lettering style'}, picked at random from ${faces}, in a ${weights} weight`,
    fields.Text?.trim()
      ? `Text: ${fields.Text}`
      : `Text: Not specified. Choose suitable wording freely to complement ${target}.`,
  ];
}
const ratioListLine =
  'After the image, list every image in reading order (left to right, top to bottom) as text with its number and the closest aspect ratio of 1:1, 2:3, 3:4 or 16:9, e.g. "1 — 3:4".';
// One theme runs through the gallery; each image picks its own person, scene or object from it.
const subjectVariation =
  'Each image shows a different person, scene or object from that theme, and all share one consistent style and mood.';
const subjectLine = (subject?: string) =>
  subject
    ? `All images explore the same theme: ${subject}. ${subjectVariation}`
    : `All images explore one shared theme of your choice. ${subjectVariation}`;
// Every mockup keeps an editorial, refined magazine mood.
const mockupMood = 'Mood: editorial, refined magazine feel';
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
  const style = styleName(catalog, selection, type);
  // The style's cue spells out its form, line and surface; a design uses its Design Style cue.
  const styleCategory =
    type === 'design' ? 'Design Style' : type === 'photo' ? 'Photo Style' : 'Illustration Style';
  const styleCue = chosenOptions([styleCategory], catalog, selection)[0]?.cue;
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
  const detail = depictionPhrase(catalog, selection);
  const headerText = [style, ...extras.map((o) => o.label), depiction?.label]
    .filter(Boolean)
    .join(' · ');
  return [
    `Design a mockup of a ${words[type].site}: white background, only a simple header and a masonry gallery of 9 to 12 ${media} in mixed aspect ratios.`,
    `The header shows the style and options as text: ${headerText}`,
    '',
    style
      ? `All ${media} share one style: ${style}${styleCue ? ` — ${styleCue}` : ''}`
      : `All ${media} share one consistent style.`,
    mockupMood,
    colorLine(extras.find((o) => o.category === 'Color')),
    ...extras
      .filter((o) => o.category !== 'Color')
      .sort((a, b) => mockupLineOrder.indexOf(a.category) - mockupLineOrder.indexOf(b.category))
      .map((o) => `${promptCategory(o.category)}: ${o.label}`),
    // The detail level explains how much each image holds; Balanced leaves it to the style.
    ...(detail ? [`Detail: ${detail}`] : []),
    ...typographyLines(catalog, fields, true),
    subjectLine(fields.Subject?.trim()),
    // The ratio list lets each numbered image be upscaled at its own ratio.
    ratioListLine,
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
  return [
    `Create a standalone ${words[type].one} of ${subject ? `"${subject}"` : 'a subject you choose'}.`,
    ...chosenOptions(imageCategories(type === 'photo', type === 'design'), catalog, selection).map(
      optionLine,
    ),
    ...typographyLines(catalog, fields, false),
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
  ].join('\n');
}

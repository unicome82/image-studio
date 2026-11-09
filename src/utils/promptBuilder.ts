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
export const aspectRatios = ['1:1', '4:5', '3:4', '2:3', '9:16', '4:3', '3:2', '16:9'];
// Every Builder category takes one decisive choice; choosing it again clears it.
const requiredCategories = ['Design Format', 'Depiction'];
// How simply or richly each mockup image depicts its subject; every mockup states one level.
export const depictionLevels = ['verysimple', 'simple', 'balanced', 'complex', 'verycomplex'];
export const defaultDepiction = 'simple';
export function optionLimit(): number {
  return 1;
}
// Saved mockups keep only the subject.
export function compactFields(fields: Record<string, string>): Record<string, string> {
  return { Subject: fields.Subject ?? '' };
}
export function imageType(photo: boolean, design = false): ImageType {
  return design ? 'design' : photo ? 'photo' : 'illustration';
}
// The lead style comes first so the defining look is read before color.
export function builderCategories(photo: boolean, design = false): string[] {
  return design
    ? ['Design Format', 'Design Style', 'Color', 'Tone']
    : photo
      ? ['Photo Style', 'Color', 'Tone']
      : ['Illustration Style', 'Color', 'Tone', 'Outline'];
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
// The prompt names Outline by its role so the option list and summary agree.
const promptCategory = (category: string) => (category === 'Outline' ? 'Rendering Mode' : category);
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
  const style = styleName(catalog, selection, type);
  // Naming the medium keeps an illustration style such as Minimalism from turning into photos.
  const media = `${words[type].one}s`;
  // Outline is listed only when chosen; color always asks for different colors per image.
  const extras = chosenOptions(
    builderCategories(type === 'photo', type === 'design'),
    catalog,
    selection,
  ).filter(
    (o) =>
      !['Illustration Style', 'Photo Style', 'Design Format', 'Design Style'].includes(o.category),
  );
  return [
    `Design a mockup of a ${words[type].site}: white background, only a simple header and a masonry gallery of 9 to 12 ${media} in mixed aspect ratios.`,
    '',
    style ? `All ${media} share one style: ${style}` : `All ${media} share one consistent style.`,
    mockupMood,
    colorLine(extras.find((o) => o.category === 'Color')),
    ...extras
      .filter((o) => o.category !== 'Color')
      .map((o) => `${promptCategory(o.category)}: ${o.label}`),
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
  return [
    `Create a standalone ${words[type].one} of ${subject ? `"${subject}"` : 'a subject you choose'}.`,
    ...chosenOptions(imageCategories(type === 'photo', type === 'design'), catalog, selection).map(
      optionLine,
    ),
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
  ].join('\n');
}

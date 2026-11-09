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
// Suggested ratio when a design format is chosen; a ratio the user picked stays.
export const designFormatRatios: Record<string, string> = {
  poster: '3:4',
  logo: '1:1',
  packaging: '3:4',
  infographic: '3:4',
  iconset: '1:1',
  pattern: '1:1',
  greetingcard: '3:4',
  website: '16:9',
  emblem: '1:1',
  product: '1:1',
  character: '3:4',
  appscreen: '9:16',
  signage: '16:9',
};
export const aspectRatios = ['1:1', '4:5', '3:4', '2:3', '9:16', '4:3', '3:2', '16:9'];
// Every Builder category takes one decisive choice; choosing it again clears it.
const requiredCategories = ['Design Format', 'Depiction'];
// How simply or richly each mockup image depicts its subject; every mockup states one level.
export const depictionLevels = ['verysimple', 'simple', 'balanced', 'complex', 'verycomplex'];
export const defaultDepiction = 'simple';
export function optionLimit(): number {
  return 1;
}
// Subject feeds the mockup; the ratio feeds the single-image step.
export function compactFields(fields: Record<string, string>): Record<string, string> {
  return {
    Subject: fields.Subject ?? '',
    'Aspect Ratio': fields['Aspect Ratio'] || '1:1',
  };
}
export function imageType(photo: boolean, design = false): ImageType {
  return design ? 'design' : photo ? 'photo' : 'illustration';
}
// The lead style comes first so the defining look is read before color and texture.
export function builderCategories(photo: boolean, design = false): string[] {
  return design
    ? ['Design Format', 'Design Style', 'Color', 'Texture']
    : photo
      ? ['Photo Style', 'Color', 'Texture']
      : ['Illustration Style', 'Color', 'Outline', 'Texture'];
}
// Texture is applied only when a picked image is recreated, not in the mockup.
export const recreateCategories = ['Texture'];
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
function chosenOptions(catalog: Option[], selection: Selection, type: ImageType): Option[] {
  return builderCategories(type === 'photo', type === 'design').flatMap((category) =>
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
/** Step 1: one mockup of a minimal gallery site whose ten images share the chosen style. */
export function makeMockupPrompt(
  catalog: Option[],
  selection: Selection,
  fields: Record<string, string>,
  type: ImageType,
) {
  const style = styleName(catalog, selection, type);
  // Color and outline are optional extras listed only when chosen.
  const extras = chosenOptions(catalog, selection, type).filter(
    (o) =>
      ![
        'Illustration Style',
        'Photo Style',
        'Design Format',
        'Design Style',
        ...recreateCategories,
      ].includes(o.category),
  );
  return [
    `Design a mockup of a ${words[type].site}: white background, simple header, a clean grid of 10 images.`,
    '',
    style ? `All 10 images share one style: ${style}` : 'All 10 images share one consistent style.',
    ...extras.map((o) => `${promptCategory(o.category)}: ${o.label}`),
    `Each image shows a different ${depictionPhrase(catalog, selection)} ${fields.Subject?.trim() || 'subject'}.`,
  ].join('\n');
}
/** Step 2: recreate the image picked in the mockup chat, adding texture and a ratio. */
export function makeRecreatePrompt(
  catalog: Option[],
  selection: Selection,
  fields: Record<string, string>,
  type: ImageType,
) {
  const texture = chosenOptions(catalog, selection, type).filter((o) =>
    recreateCategories.includes(o.category),
  );
  return [
    `Recreate the image I choose from this gallery mockup as a standalone ${words[type].one}.`,
    'Keep the same style and colors, and show the full composition inside the frame.',
    ...texture.map(optionLine),
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
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
    ...chosenOptions(catalog, selection, type).map(optionLine),
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
  ].join('\n');
}

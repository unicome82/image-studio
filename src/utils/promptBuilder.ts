export interface Option {
  id: string;
  label: string;
  category: string;
  path: string;
  prompt: string;
}
export type Selection = Record<string, string[]>;
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
const requiredCategories = ['Outline', 'Design Format'];
// Past this many choices the Builder suggests trimming; it is guidance, not a limit.
export const recommendedTotal = 6;
export function optionLimit(): number {
  return 1;
}
// Keep the subject editable while preserving older presets' negative instructions.
export function compactFields(fields: Record<string, string>): Record<string, string> {
  const direction = ['Negative Prompt']
    .filter((key) => fields[key]?.trim())
    .map((key) => `${key}: ${fields[key]}`);
  if (fields['Additional Instructions']?.trim()) direction.push(fields['Additional Instructions']);
  return {
    Subject: fields.Subject ?? '',
    'Aspect Ratio': fields['Aspect Ratio'] || '1:1',
    'Additional Instructions': direction.join('\n'),
    'Typography Enabled': fields['Typography Enabled'] === 'true' ? 'true' : 'false',
    Text: fields.Text ?? '',
  };
}
export function isTypographyEnabled(fields: Record<string, string>): boolean {
  return fields['Typography Enabled'] === 'true';
}
export function builderCategories(photo: boolean, design = false): string[] {
  return design
    ? [
        'Design Format',
        'Design Style',
        'Mood',
        'Color',
        'Lighting',
        'Composition',
        'Texture',
        'Typography',
      ]
    : photo
      ? [
          'Photo Style',
          'Camera',
          'Mood',
          'Color',
          'Lighting',
          'Composition',
          'Texture',
          'Typography',
        ]
      : [
          'Illustration Style',
          'Technique',
          'Mood',
          'Color',
          'Lighting',
          'Composition',
          'Texture',
          'Typography',
          'Outline',
        ];
}
export function toggleOption(selection: Selection, category: string, id: string): Selection {
  const current = selection[category] ?? [];
  return {
    ...selection,
    [category]: !requiredCategories.includes(category) && current.includes(id) ? [] : [id],
  };
}
// The prompt names Outline by its role so the option heading, summary and final rules agree.
const promptCategory = (category: string) => (category === 'Outline' ? 'Rendering Mode' : category);
// Style fallbacks that only apply while the user leaves these categories open.
const fallbackLine = /^- When no Color, Lighting, or Texture instructions are given/;
// Option instructions without the source title, catalog metadata lines and, when asked, the fallbacks.
export function instructions(option: Option, dropFallbacks = false): string {
  return option.prompt
    .split('\n')
    .filter(
      (line) =>
        !/^## |^- \*\*(Category|Style ID):\*\*/.test(line) &&
        !(dropFallbacks && fallbackLine.test(line)),
    )
    .join('\n')
    .trim();
}
export function makePrompt(
  catalog: Option[],
  selection: Selection,
  fields: Record<string, string>,
  photo: boolean,
  design = false,
) {
  // Lead categories come first so the defining style is read before supporting details.
  const leadCategories = design
    ? ['Design Format', 'Design Style']
    : photo
      ? ['Photo Style', 'Camera']
      : ['Illustration Style', 'Technique'];
  const categories = [
    ...leadCategories,
    'Typography',
    'Outline',
    'Color',
    'Lighting',
    'Texture',
    'Composition',
    'Mood',
  ].filter((category) => builderCategories(photo, design).includes(category));
  const typography = isTypographyEnabled(fields);
  const chosen = categories.flatMap((category) => {
    if (category === 'Typography' && !typography) return [];
    return (selection[category] ?? []).flatMap((id) =>
      catalog.filter((o) => o.category === category && o.id === id),
    );
  });
  // Every prompt asks for a simple depiction; it is a fixed default, not a Builder choice.
  const depiction = catalog.filter((o) => o.category === 'Depiction');
  const options = [...chosen, ...depiction];
  const output = design ? 'graphic design' : photo ? 'photograph' : 'image';
  const subject = fields.Subject?.trim();
  const text = typography ? fields.Text?.trim() : '';
  const extra = Object.entries(fields).filter(
    ([key, value]) =>
      !['Subject', 'Aspect Ratio', 'Typography Enabled', 'Text'].includes(key) && value.trim(),
  );
  const outline = chosen.find((o) => o.category === 'Outline');
  const preserve = [
    ...(subject ? ['the requested subject'] : []),
    ...(text ? ['the exact text'] : []),
    'the aspect ratio',
  ];
  const present = new Set(options.map((o) => o.category));
  const dropFallbacks = ['Color', 'Lighting', 'Texture'].some((category) => present.has(category));
  // The subject and lead style open and close the prompt so they carry the most weight.
  const keyDirection = [
    subject ? `Subject "${fields.Subject}"` : 'a random subject you choose',
    ...chosen
      .filter((o) => leadCategories.includes(o.category))
      .map((o) => `${o.category}: ${o.label}`),
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
  ].join('; ');
  // The defining style leads conflicts too, matching the key direction that opens and closes the prompt.
  const priority = [
    ...([
      'Illustration Style',
      'Technique',
      'Photo Style',
      'Camera',
      'Design Style',
      'Typography',
    ].some((category) => present.has(category))
      ? ['the style and technique instructions']
      : []),
    ...['Design Format', 'Outline', 'Color', 'Lighting', 'Composition', 'Texture', 'Mood']
      .filter((category) => present.has(category))
      .map(promptCategory),
  ];
  // One lead direction keeps many selections reading as a single concept.
  const lead = (
    design ? ['Design Format', 'Design Style'] : [photo ? 'Photo Style' : 'Illustration Style']
  ).filter((category) => present.has(category));
  const final = [
    design
      ? 'Combine the selected design format, style, palette, layout, and surface instructions into one coherent graphic design. Produce the flat design artwork itself as the full image.'
      : `Combine the selected instructions into one coherent ${output}.`,
    ...(lead.length
      ? [
          `Let the ${lead.join(' and ')} define the overall concept and treat the other selections as supporting details within it.`,
        ]
      : []),
    `Show ${subject ? 'the requested subject' : 'the chosen subject'} plainly with one clear focal point, adding only the elements it needs.`,
    ...(outline
      ? [
          `Rendering Mode takes priority for fills and outlines${outline.id === 'outlineonly' ? '; apply the color palette to the line colors' : ''}.`,
        ]
      : []),
    ...(priority.length > 1
      ? [`If selected instructions conflict, follow this priority: ${priority.join(', ')}.`]
      : []),
    typography
      ? `Render all text legibly${present.has('Typography') ? ', applying the Typography instructions' : ''} with a clear typographic hierarchy.`
      : `Typography is Off: do not add any readable text, letters, or numbers to the ${output}.`,
    `Preserve ${preserve.length > 1 ? `${preserve.slice(0, -1).join(', ')} and ${preserve.at(-1)}` : preserve[0]}.`,
    `Most important, restated: ${keyDirection}.`,
  ];
  return [
    `Create ${design ? 'a finished graphic design' : photo ? 'a photograph' : 'an image'} using the instructions below.`,
    `Key direction: ${keyDirection}.`,
    ...options.flatMap((o) => [
      '',
      `## ${promptCategory(o.category)}: ${o.label}`,
      instructions(o, dropFallbacks),
    ]),
    '',
    '## Settings',
    subject
      ? `Subject: ${fields.Subject}`
      : `Subject: Not specified. Choose a random subject and scene consistent with the selected settings${extra.length ? ' and additional instructions' : ''}, and create the ${output} without asking for a subject.`,
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
    ...extra.map(([key, value]) => `${key}: ${value}`),
    `Typography: ${typography ? 'On' : 'Off'}`,
    ...(typography
      ? [
          text
            ? `Text: ${fields.Text}`
            : `Text: Not specified. Choose suitable wording freely to complement the ${output}.`,
        ]
      : []),
    ...chosen.map((o) => `${promptCategory(o.category)}: ${o.label}`),
    ...depiction.map((o) => `${o.category}: ${o.label}`),
    '',
    '## Final Instructions',
    final.join(' '),
  ].join('\n');
}

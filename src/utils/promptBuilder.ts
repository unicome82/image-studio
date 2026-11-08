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
// Every illustration is built on this style; a chosen Illustration Style becomes a light accent on it.
export const baseIllustrationStyle = 'midcentury';
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
  // Illustrations always lead with the base style; another chosen style only accents it.
  const base =
    photo || design
      ? undefined
      : catalog.find((o) => o.category === 'Illustration Style' && o.id === baseIllustrationStyle);
  const accent = base
    ? chosen.find((o) => o.category === 'Illustration Style' && o.id !== base.id)
    : undefined;
  const heading = (o: Option) =>
    base && o.category === 'Illustration Style'
      ? `${o === accent ? 'Accent Style' : 'Base Style'}: ${o.label}`
      : `${promptCategory(o.category)}: ${o.label}`;
  const blocks = base
    ? [base, ...options.filter((o) => o.category !== 'Illustration Style' || o === accent)]
    : options;
  const output = design ? 'graphic design' : photo ? 'photograph' : 'image';
  const subject = fields.Subject?.trim();
  const text = typography ? fields.Text?.trim() : '';
  const extra = Object.entries(fields).filter(
    ([key, value]) =>
      !['Subject', 'Aspect Ratio', 'Typography Enabled', 'Text'].includes(key) && value.trim(),
  );
  const present = new Set(options.map((o) => o.category));
  const dropFallbacks = ['Color', 'Lighting', 'Texture'].some((category) => present.has(category));
  // The subject and lead style open the prompt so they carry the most weight.
  const keyDirection = [
    subject ? `Subject "${fields.Subject}"` : 'a random subject you choose',
    ...(base ? [base, ...(accent ? [accent] : [])].map(heading) : []),
    ...chosen
      .filter(
        (o) =>
          leadCategories.includes(o.category) && !(base && o.category === 'Illustration Style'),
      )
      .map((o) => `${o.category}: ${o.label}`),
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
  ].join('; ');
  const settings = [
    ...(subject
      ? []
      : [
          `Subject: Not specified. Choose a random subject and scene consistent with the selected settings${extra.length ? ' and additional instructions' : ''}, and create the ${output} without asking for a subject.`,
        ]),
    ...extra.map(([key, value]) => `${key}: ${value}`),
    // Typography is mentioned only when on; naming it when off can itself invite lettering.
    ...(typography
      ? [
          'Typography: On',
          text
            ? `Text: ${fields.Text}`
            : `Text: Not specified. Choose suitable wording freely to complement the ${output}.`,
        ]
      : []),
  ];
  return [
    `Create ${design ? 'a finished graphic design' : photo ? 'a photograph' : 'an image'} using the instructions below.`,
    `Key direction: ${keyDirection}.`,
    ...blocks.flatMap((o) => [
      '',
      `## ${heading(o)}`,
      // The accent keeps only its own cues: palette fallbacks and lines the base already states drop.
      o === accent
        ? [
            instructions(o, true)
              .split('\n')
              .filter((line) => !line.startsWith('- ') || !instructions(base!).includes(line))
              .join('\n'),
            '',
            '### Blend',
            `- Let ${base!.label} lead the shapes and layout, and add ${accent.label} as a light accent in motifs and details.`,
          ].join('\n')
        : instructions(o, dropFallbacks),
    ]),
    // Settings carries only what the key direction and option headings above do not already state.
    ...(settings.length ? ['', '## Settings', ...settings] : []),
  ].join('\n');
}

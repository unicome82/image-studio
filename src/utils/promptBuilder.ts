export interface Option {
  id: string;
  label: string;
  category: string;
  path: string;
  prompt: string;
}
export type Selection = Record<string, string[]>;
export const levels = ['verysimple', 'simple', 'balanced', 'detailed', 'intricate'];
export const complexityLabels = ['Very Simple', 'Simple', 'Balanced', 'Detailed', 'Intricate'];
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
export const aspectRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
export const maxSelections = 3;
// Single-select categories take one option; the rest allow up to maxSelections.
export function optionLimit(category: string): number {
  return category === 'Outline' || category === 'Design Format' ? 1 : maxSelections;
}
const conflicts: Record<string, string[]> = {
  warm: ['cool'],
  cool: ['warm'],
  vivid: ['muted', 'pastel'],
  muted: ['vivid', 'neon'],
  pastel: ['vivid', 'neon'],
  neon: ['muted', 'pastel'],
  clean: ['papergrain', 'filmgrain', 'distressed', 'digitalnoise', 'roughprint'],
  symmetric: ['asymmetric'],
  asymmetric: ['symmetric'],
  centered: ['diagonal'],
  diagonal: ['centered'],
};
export const complexityUiLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
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
    ? ['Design Format', 'Design Style', 'Color', 'Composition', 'Texture', 'Typography']
    : photo
      ? ['Photo Style', 'Color', 'Composition', 'Texture', 'Typography']
      : [
          'Illustration Style',
          'Technique',
          'Color',
          'Composition',
          'Texture',
          'Typography',
          'Outline',
        ];
}
export function toggleOption(selection: Selection, category: string, id: string): Selection {
  const current = selection[category] ?? [];
  if (optionLimit(category) === 1) return { ...selection, [category]: [id] };
  if (!current.includes(id) && current.length >= maxSelections) return selection;
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [
        ...current.filter(
          (x) => !(conflicts[id] ?? []).includes(x) && !(conflicts[x] ?? []).includes(id),
        ),
        id,
      ];
  return { ...selection, [category]: next };
}
// The prompt names Outline by its role so the option heading, summary and final rules agree.
const promptCategory = (category: string) => (category === 'Outline' ? 'Rendering Mode' : category);
// Option instructions without the source title and catalog metadata lines.
export function instructions(option: Option): string {
  return option.prompt
    .split('\n')
    .filter((line) => !/^## |^- \*\*(Category|Style ID):\*\*/.test(line))
    .join('\n')
    .trim();
}
export function makePrompt(
  catalog: Option[],
  selection: Selection,
  complexity: number,
  fields: Record<string, string>,
  photo: boolean,
  design = false,
) {
  const categories = [
    'Illustration Style',
    'Technique',
    'Typography',
    'Outline',
    'Color',
    'Texture',
    'Composition',
    'Photo Style',
    'Design Format',
    'Design Style',
  ].filter((category) => builderCategories(photo, design).includes(category));
  const typography = isTypographyEnabled(fields);
  const chosen = categories.flatMap((category) => {
    if (category === 'Typography' && !typography) return [];
    return (selection[category] ?? []).flatMap((id) =>
      catalog.filter((o) => o.category === category && o.id === id),
    );
  });
  const level = catalog.find((o) => o.category === 'Complexity' && o.id === levels[complexity - 1]);
  const options = [...chosen, ...(level ? [level] : [])];
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
  const final = [
    design
      ? 'Combine the selected design format, style, palette, layout, and surface instructions into one coherent graphic design. Produce the design itself, not a presentation mockup.'
      : `Combine the selected instructions into one coherent ${output}.`,
    ...(outline
      ? [
          `Rendering Mode takes priority for fills and outlines${outline.id === 'outlineonly' ? '; apply the color palette to the line colors' : ''}.`,
        ]
      : []),
    ...(design
      ? [
          typography
            ? 'Establish clear typographic hierarchy and readable lettering.'
            : 'Do not add unsolicited readable text; use unlettered visual hierarchy unless the additional instructions explicitly request text.',
        ]
      : []),
    `Preserve ${preserve.length > 1 ? `${preserve.slice(0, -1).join(', ')} and ${preserve.at(-1)}` : preserve[0]}.`,
  ];
  return [
    `Create ${design ? 'a finished graphic design' : photo ? 'a photograph' : 'an image'} using the instructions below.`,
    ...options.flatMap((o) => [
      '',
      `## ${promptCategory(o.category)}: ${o.label}`,
      instructions(o),
    ]),
    '',
    '## Settings',
    subject
      ? `Subject: ${fields.Subject}`
      : `Subject: Not specified. Choose a random subject and scene consistent with the selected settings${extra.length ? ' and additional instructions' : ''}, and create the ${output} without asking for a subject.`,
    `Aspect Ratio: ${fields['Aspect Ratio']?.trim() || '1:1'}`,
    ...extra.map(([key, value]) => `${key}: ${value}`),
    ...(typography
      ? [
          text
            ? `Text: ${fields.Text}`
            : `Text: Not specified. Choose suitable wording freely to complement the ${output}.`,
        ]
      : []),
    ...chosen.map((o) => `${promptCategory(o.category)}: ${o.label}`),
    `Complexity: ${level?.label ?? complexityLabels[complexity - 1] ?? 'Balanced'}`,
    '',
    '## Final Instructions',
    final.join(' '),
  ].join('\n');
}

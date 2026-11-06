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
      ? ['Photography', 'Color', 'Composition', 'Texture', 'Typography']
      : ['Base Style', 'Technique', 'Color', 'Composition', 'Texture', 'Typography', 'Outline'];
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
export function makePrompt(
  catalog: Option[],
  selection: Selection,
  complexity: number,
  fields: Record<string, string>,
  photo: boolean,
  design = false,
) {
  const categories = [
    'Base Style',
    'Technique',
    'Typography',
    'Outline',
    'Color',
    'Texture',
    'Composition',
    'Photography',
    'Design Format',
    'Design Style',
  ].filter((category) => builderCategories(photo, design).includes(category));
  const chosen = categories.flatMap((category) => {
    if (
      (category === 'Typography' && !isTypographyEnabled(fields)) ||
      (category === 'Photography' && !photo)
    )
      return [];
    return (selection[category] ?? []).flatMap((id) =>
      catalog.filter((o) => o.category === category && o.id === id),
    );
  });
  const level = catalog.find((o) => o.category === 'Complexity' && o.id === levels[complexity - 1]);
  const options = [...chosen, ...(level ? [level] : [])];
  return [
    design
      ? 'Create a finished graphic design using the selected prompt instructions below.'
      : 'Create an image using the selected prompt instructions below.',
    ...options.map((o) => o.prompt),
    '',
    ...(!fields.Subject?.trim()
      ? [
          'Subject: Generate an image with a random subject and scene consistent with the selected settings and additional instructions, without asking for a subject.',
        ]
      : []),
    ...Object.entries(fields)
      .filter(([key, value]) => key !== 'Typography Enabled' && key !== 'Text' && value.trim())
      .map(([key, value]) => `${key}: ${value}`),
    ...(isTypographyEnabled(fields)
      ? [
          fields.Text?.trim()
            ? `Text: ${fields.Text}`
            : 'Typography text: Choose suitable wording freely to complement the image.',
        ]
      : []),
    ...chosen.map((o) => `${o.category === 'Outline' ? 'Rendering Mode' : o.category}: ${o.label}`),
    `Complexity: ${level?.label ?? complexityLabels[complexity - 1] ?? 'Balanced'}`,
    '',
    design
      ? `Combine the selected design format, style, palette, layout, and surface instructions into one coherent graphic design. Produce the design itself, not a presentation mockup. Preserve the requested subject, exact text, and aspect ratio. ${isTypographyEnabled(fields) ? 'Establish clear typographic hierarchy and readable lettering.' : 'Do not add unsolicited readable text; use unlettered visual hierarchy unless the additional instructions explicitly request text.'}`
      : photo
        ? 'Create a photograph using the selected photography instructions. Preserve the requested subject, exact text, and aspect ratio.'
        : 'Combine the selected instructions. Rendering Mode takes priority for fills and outlines; apply the color palette to line colors in Outline Only. Preserve the requested subject, exact text, and aspect ratio.',
  ].join('\n');
}

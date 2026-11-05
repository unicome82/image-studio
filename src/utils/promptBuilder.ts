export interface Option {
  id: string;
  label: string;
  category: string;
  path: string;
}
export type Selection = Record<string, string[]>;
export const levels = ['verysimple', 'simple', 'balanced', 'detailed', 'intricate'];
export const complexityLabels = ['Very Simple', 'Simple', 'Balanced', 'Detailed', 'Intricate'];
// Preserve older presets' separate inputs inside the single direction field.
export function compactFields(fields: Record<string, string>): Record<string, string> {
  const direction = ['Subject', 'Negative Prompt']
    .filter((key) => fields[key]?.trim())
    .map((key) => `${key}: ${fields[key]}`);
  if (fields['Additional Instructions']?.trim()) direction.push(fields['Additional Instructions']);
  return {
    'Aspect Ratio': fields['Aspect Ratio'] || '1:1',
    'Additional Instructions': direction.join('\n'),
    'Typography Enabled': fields['Typography Enabled'] === 'true' ? 'true' : 'false',
    Text: fields.Text ?? '',
  };
}
export function isTypographyEnabled(fields: Record<string, string>): boolean {
  return fields['Typography Enabled'] === 'true';
}
export function builderCategories(photo: boolean): string[] {
  return photo
    ? ['Photography', 'Color', 'Composition', 'Texture', 'Typography']
    : ['Base Style', 'Technique', 'Color', 'Composition', 'Texture', 'Typography', 'Outline'];
}
export function toggleOption(selection: Selection, category: string, id: string): Selection {
  const current = selection[category] ?? [];
  if (category === 'Outline') return { ...selection, [category]: [id] };
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
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [
        ...current.filter(
          (x) => !(conflicts[id] ?? []).includes(x) && !(conflicts[x] ?? []).includes(id),
        ),
        id,
      ].slice(-3);
  return { ...selection, [category]: next };
}
export function makePrompt(
  catalog: Option[],
  selection: Selection,
  complexity: number,
  fields: Record<string, string>,
  photo: boolean,
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
  ].filter((category) => builderCategories(photo).includes(category));
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
    'Read only the selected prompt files below. Do not assume missing files exist.',
    ...options.map((o) => o.path),
    '',
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
    photo
      ? 'Create a photograph using the selected photography instructions. Preserve the requested subject, exact text, and aspect ratio.'
      : 'Combine the selected instructions. Rendering Mode takes priority for fills and outlines; apply the color palette to line colors in Outline Only. Preserve the requested subject, exact text, and aspect ratio.',
  ].join('\n');
}

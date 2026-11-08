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
const requiredCategories = ['Outline', 'Design Format', 'Depiction'];
// How simply or richly the subject is depicted; every prompt states one level.
export const depictionLevels = ['verysimple', 'simple', 'balanced', 'complex', 'verycomplex'];
export const defaultDepiction = 'simple';
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
// The prompt names Outline by its role so the option list and summary agree.
const promptCategory = (category: string) => (category === 'Outline' ? 'Rendering Mode' : category);
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
  // Older drafts and recipes carry no depiction, so they read as the Simple default.
  const depictionId = selection.Depiction?.[0] ?? defaultDepiction;
  const depiction = catalog.find((o) => o.category === 'Depiction' && o.id === depictionId);
  const output = design ? 'graphic design' : photo ? 'photograph' : 'image';
  const subject = fields.Subject?.trim();
  const text = typography ? fields.Text?.trim() : '';
  const extra = Object.entries(fields).filter(
    ([key, value]) =>
      !['Subject', 'Aspect Ratio', 'Typography Enabled', 'Text'].includes(key) && value.trim(),
  );
  // The subject and lead style open the prompt so they carry the most weight.
  const keyDirection = [
    subject ? `Subject "${fields.Subject}"` : 'a random subject you choose',
    ...chosen
      .filter((o) => leadCategories.includes(o.category))
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
  // Options are keywords only; the source MD bodies stay in reference/ and are not copied in.
  return [
    `Create ${design ? 'a finished graphic design' : photo ? 'a photograph' : 'an image'} using the instructions below.`,
    `Key direction: ${keyDirection}.`,
    '',
    '## Options',
    ...chosen.map((o) => `${promptCategory(o.category)}: ${o.label}`),
    ...(depiction ? [`Depiction: ${depiction.label}`] : []),
    ...(settings.length ? ['', '## Settings', ...settings] : []),
  ].join('\n');
}

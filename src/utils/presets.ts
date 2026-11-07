import { optionLimit, toggleOption, type Option, type Selection } from './promptBuilder.ts';
export interface StylePreset {
  id: string;
  photo: boolean;
  design?: boolean;
  selection: Selection;
  complexity: number;
  fields: Record<string, string>;
}
export const presetKey = 'image-studio-presets';
// Older saves used these category names before they were aligned per image type.
const legacyCategories: Record<string, string> = {
  'Base Style': 'Illustration Style',
  Photography: 'Photo Style',
};
// Removed options map to the options that absorbed them, as [category, id] pairs.
const legacyOptions: Record<string, [string, string][]> = {
  'Technique:linocut': [['Technique', 'woodcut']],
  'Technique:screenprinting': [['Technique', 'risograph']],
  'Photo Style:film': [
    ['Texture', 'filmgrain'],
    ['Color', 'vintage'],
  ],
  'Photo Style:analog': [
    ['Texture', 'filmgrain'],
    ['Color', 'vintage'],
  ],
  'Photo Style:monochrome': [['Color', 'blackwhite']],
  'Composition:diagonal': [['Composition', 'dynamic']],
  'Texture:roughprint': [['Texture', 'distressed']],
  'Typography:psychedeliclettering': [['Typography', 'groovy']],
  'Typography:distortedtypography': [['Typography', 'experimentaltypography']],
  'Typography:kinetictypography': [['Typography', 'experimentaltypography']],
};
export function parsePresets(raw: string | null, catalog: Option[]): StylePreset[] {
  const exists = (category: string, id: string) =>
    catalog.some((o) => o.category === category && o.id === id);
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value.flatMap((item) => {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.id !== 'string' ||
        seen.has(item.id) ||
        typeof item.photo !== 'boolean' ||
        (item.design !== undefined && typeof item.design !== 'boolean') ||
        (item.design === true && item.photo) ||
        !Number.isInteger(item.complexity) ||
        item.complexity < 1 ||
        item.complexity > 5 ||
        !item.selection ||
        typeof item.selection !== 'object' ||
        Array.isArray(item.selection) ||
        !item.fields ||
        typeof item.fields !== 'object' ||
        Array.isArray(item.fields)
      )
        return [];
      let selection: Selection = {};
      const migrated: [string, string][] = [];
      for (const [saved, ids] of Object.entries(item.selection)) {
        if (!Array.isArray(ids)) return [];
        const category = legacyCategories[saved] ?? saved;
        for (const id of ids)
          if (typeof id === 'string' && !exists(category, id))
            migrated.push(...(legacyOptions[`${category}:${id}`] ?? []));
        selection[category] = [
          ...new Set(
            ids.filter(
              (id): id is string =>
                typeof id === 'string' &&
                catalog.some((o) => o.category === category && o.id === id),
            ),
          ),
        ].slice(0, optionLimit(category));
      }
      // Replacements join after the kept choices, within limits and conflict rules.
      for (const [category, id] of migrated)
        if (exists(category, id) && !selection[category]?.includes(id))
          selection = toggleOption(selection, category, id);
      const fields = Object.fromEntries(
        Object.entries(item.fields).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      );
      seen.add(item.id);
      return [
        {
          id: item.id,
          photo: item.photo,
          ...(item.design === true ? { design: true } : {}),
          selection,
          complexity: item.complexity,
          fields,
        },
      ];
    });
  } catch {
    return [];
  }
}

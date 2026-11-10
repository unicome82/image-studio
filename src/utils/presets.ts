import {
  builderCategories,
  compactFields,
  defaultLeadOptions,
  optionLimit,
  toggleOption,
  type Option,
  type Selection,
} from './promptBuilder.ts';
export interface StylePreset {
  id: string;
  photo: boolean;
  design?: boolean;
  selection: Selection;
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
  'Illustration Style:constructivism': [['Illustration Style', 'bauhaus']],
  'Illustration Style:suprematism': [['Illustration Style', 'geometricillustration']],
  'Illustration Style:dadaism': [['Illustration Style', 'surrealism']],
  'Illustration Style:cubism': [['Illustration Style', 'geometricillustration']],
  'Illustration Style:fauvism': [['Illustration Style', 'expressionism']],
  'Illustration Style:artnouveau': [['Illustration Style', 'artdeco']],
  'Illustration Style:opticalart': [['Illustration Style', 'geometricillustration']],
  'Illustration Style:retrographicdesign': [['Illustration Style', 'midcentury']],
  'Illustration Style:swissgraphicdesign': [['Illustration Style', 'geometricillustration']],
  'Illustration Style:celshadedanime': [['Illustration Style', 'contemporaryflat']],
  'Illustration Style:storybookillustration': [['Illustration Style', 'naivefolk']],
  'Technique:risograph': [['Illustration Style', 'risograph']],
  'Technique:linocut': [['Illustration Style', 'risograph']],
  'Technique:woodcut': [['Illustration Style', 'risograph']],
  'Technique:screenprinting': [['Illustration Style', 'risograph']],
  'Technique:halftoneprinting': [['Illustration Style', 'risograph']],
  'Color:vintage': [['Color', 'muted']],
  'Color:midcenturypalette': [['Color', 'muted']],
  'Color:jeweltones': [['Color', 'vivid']],
  'Color:highkey': [['Tone', 'highkey']],
  'Color:lowkey': [['Tone', 'lowkey']],
  'Tone:bright': [['Tone', 'highkey']],
  'Tone:dark': [['Tone', 'lowkey']],
  'Tone:deep': [['Tone', 'lowkey']],
  'Tone:subtle': [['Tone', 'lowcontrast']],
  'Illustration Style:lowpoly': [['Illustration Style', 'geometricillustration']],
  'Photo Style:film': [['Photo Technique', 'film']],
  'Photo Style:analog': [['Photo Technique', 'film']],
  'Photo Style:monochrome': [['Color', 'blackwhite']],
  'Photo Style:portrait': [['Photo Style', 'editorial']],
  'Photo Style:landscape': [['Photo Style', 'fineart']],
  'Photo Style:architectural': [['Photo Style', 'minimal']],
  'Photo Style:documentary': [['Photo Style', 'street']],
  'Photo Style:food': [['Photo Style', 'stilllife']],
  'Photo Style:product': [['Photo Style', 'stilllife']],
  'Design Style:bauhaus': [['Design Style', 'swiss']],
  'Design Style:memphis': [['Design Style', 'postmodernism']],
  'Design Style:boldgeometric': [['Design Graphic', 'geometric']],
  'Design Style:gradientglass': [['Design Graphic', 'glassmorphism']],
  'Outline:outlineonly': [['Illustration Style', 'outlineillustration']],
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
      // Only the categories the mockup Builder still offers are kept.
      const categories = [...builderCategories(item.photo, item.design === true), 'Depiction'];
      for (const [saved, ids] of Object.entries(item.selection)) {
        if (!Array.isArray(ids)) return [];
        const category = legacyCategories[saved] ?? saved;
        for (const id of ids)
          if (typeof id === 'string' && !exists(category, id))
            migrated.push(...(legacyOptions[`${category}:${id}`] ?? []));
        if (!categories.includes(category)) continue;
        selection[category] = [
          ...new Set(
            ids.filter(
              (id): id is string =>
                typeof id === 'string' &&
                catalog.some((o) => o.category === category && o.id === id),
            ),
          ),
        ].slice(0, optionLimit());
      }
      // Replacements only fill categories the kept choices left empty.
      for (const [category, id] of migrated)
        if (categories.includes(category) && exists(category, id) && !selection[category]?.length)
          selection = toggleOption(selection, category, id);
      // Every saved mockup keeps its type's required lead style, so none is left untitled.
      for (const [category, ids] of Object.entries(defaultLeadOptions))
        if (categories.includes(category) && !selection[category]?.length)
          selection = { ...selection, [category]: ids };
      const fields = compactFields(
        Object.fromEntries(
          Object.entries(item.fields).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          ),
        ),
      );
      seen.add(item.id);
      return [
        {
          id: item.id,
          photo: item.photo,
          ...(item.design === true ? { design: true } : {}),
          selection,
          fields,
        },
      ];
    });
  } catch {
    return [];
  }
}

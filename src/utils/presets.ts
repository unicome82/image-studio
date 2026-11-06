import { optionLimit, type Option, type Selection } from './promptBuilder.ts';
export interface StylePreset {
  id: string;
  photo: boolean;
  design?: boolean;
  selection: Selection;
  complexity: number;
  fields: Record<string, string>;
}
export const presetKey = 'image-studio-presets';
export function parsePresets(raw: string | null, catalog: Option[]): StylePreset[] {
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
      const selection: Selection = {};
      for (const [category, ids] of Object.entries(item.selection)) {
        if (!Array.isArray(ids)) return [];
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

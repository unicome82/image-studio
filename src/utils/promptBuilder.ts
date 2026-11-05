export interface Option { id: string; label: string; category: string; path: string }
export type Selection = Record<string, string[]>;
export const levels = ['verysimple', 'simple', 'balanced', 'detailed', 'intricate'];
export function toggleOption(selection: Selection, category: string, id: string): Selection {
  const current = selection[category] ?? [];
  if (category === 'Outline') return { ...selection, [category]: [id] };
  const conflicts: Record<string, string[]> = { warm: ['cool'], cool: ['warm'], vivid: ['muted', 'pastel'], muted: ['vivid', 'neon'], pastel: ['vivid', 'neon'], neon: ['muted', 'pastel'], clean: ['papergrain', 'filmgrain', 'distressed', 'digitalnoise', 'roughprint'], symmetric: ['asymmetric'], asymmetric: ['symmetric'], centered: ['diagonal'], diagonal: ['centered'] };
  const next = current.includes(id) ? current.filter(x => x !== id) : [...current.filter(x => !(conflicts[id] ?? []).includes(x) && !(conflicts[x] ?? []).includes(id)), id].slice(-3);
  return { ...selection, [category]: next };
}
export function makePrompt(catalog: Option[], selection: Selection, complexity: number, fields: Record<string, string>, photo: boolean) {
  const categories = ['Base Style', 'Technique', 'Typography', 'Outline', 'Color', 'Texture', 'Composition', 'Photography'];
  const chosen = categories.flatMap(category => {
    if (category === 'Typography' && !fields.Text?.trim() || category === 'Photography' && !photo) return [];
    return (selection[category] ?? []).flatMap(id => catalog.filter(o => o.category === category && o.id === id));
  });
  const level = catalog.find(o => o.category === 'Complexity' && o.id === levels[complexity - 1]);
  const options = [...chosen, ...(level ? [level] : [])];
  return ['Read only the selected prompt files below. Do not assume missing files exist.', ...options.map(o => o.path), '', ...Object.entries(fields).filter(([, value]) => value.trim()).map(([key, value]) => `${key}: ${value}`), ...chosen.map(o => `${o.category === 'Outline' ? 'Rendering Mode' : o.category}: ${o.label}`), `Complexity: ${complexity} (${level?.label ?? 'Balanced'})`, '', 'Combine the selected instructions. Rendering Mode takes priority for fills and outlines; apply the color palette to line colors in Outline Only. Preserve the requested subject, exact text, and aspect ratio.'].join('\n');
}

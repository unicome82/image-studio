/** Translation key for an option's shortened UI label. */
export function optionLabelKey(option: { label: string; category?: string }): string {
  // Detail levels share words such as Minimal with styles, so they get their own keys.
  if (option.category === 'Depiction') return `Detail ${option.label}`;
  return option.label.replace(' Modern', '').replace(/\s+illustration\b/gi, '');
}

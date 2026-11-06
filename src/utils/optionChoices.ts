/** Selected choices lead in canonical order; deselected choices return to their original position. */
export function prioritizeSelectedOptions<T extends { id: string }>(
  options: T[],
  selected: string[],
  multiple = true,
): T[] {
  if (!multiple) return options;
  const ids = new Set(selected);
  return [
    ...options.filter((option) => ids.has(option.id)),
    ...options.filter((option) => !ids.has(option.id)),
  ];
}

/** Translation key for an option's shortened UI label; photo Monochrome reads as black and white. */
export function optionLabelKey(option: { label: string; category?: string }): string {
  const label = option.label.replace(' Modern', '').replace(/\s+illustration\b/gi, '');
  return option.category === 'Photography' && label === 'Monochrome'
    ? 'Monochrome Photography'
    : label;
}

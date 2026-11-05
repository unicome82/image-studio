/** Selected choices lead in canonical order; deselected choices return to their original position. */
export function prioritizeSelectedOptions<T extends { id: string }>(
  options: T[],
  selected: string[],
): T[] {
  const ids = new Set(selected);
  return [
    ...options.filter((option) => ids.has(option.id)),
    ...options.filter((option) => !ids.has(option.id)),
  ];
}

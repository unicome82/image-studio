/** Translation key for an option's shortened UI label. */
export function optionLabelKey(option: { label: string }): string {
  return option.label.replace(' Modern', '').replace(/\s+illustration\b/gi, '');
}

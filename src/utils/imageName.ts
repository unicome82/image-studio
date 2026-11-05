/** File names are data, never translation keys. Samples keep their original English labels. */
export function imageName(image: { fileName?: string; label: string; index?: number }): string {
  if (image.fileName) return image.fileName;
  return image.index === undefined
    ? image.label
    : `${image.label} ${String(image.index + 1).padStart(2, '0')}`;
}

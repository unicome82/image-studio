import {
  builderCategories,
  isTypographyEnabled,
  type Option,
  type Selection,
} from './promptBuilder.ts';
/** The summary mirrors active Builder categories; hidden photo/illustration/typography choices stay out. */
export function selectedBuilderOptions(
  catalog: Option[],
  selection: Selection,
  fields: Record<string, string>,
  photo: boolean,
): Option[] {
  return builderCategories(photo).flatMap((category) => {
    if (category === 'Typography' && !isTypographyEnabled(fields)) return [];
    return (selection[category] ?? []).flatMap((id) =>
      catalog.filter((option) => option.category === category && option.id === id),
    );
  });
}

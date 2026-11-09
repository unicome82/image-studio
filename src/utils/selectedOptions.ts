import {
  builderCategories,
  imageCategories,
  type Option,
  type Selection,
} from './promptBuilder.ts';
/** The summary mirrors active Builder categories (gallery images add texture); hidden choices stay out. */
export function selectedBuilderOptions(
  catalog: Option[],
  selection: Selection,
  photo: boolean,
  design = false,
  image = false,
): Option[] {
  return (image ? imageCategories : builderCategories)(photo, design).flatMap((category) =>
    (selection[category] ?? []).flatMap((id) =>
      catalog.filter((option) => option.category === category && option.id === id),
    ),
  );
}

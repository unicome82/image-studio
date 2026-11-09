import { builderCategories, type Option, type Selection } from './promptBuilder.ts';
/** The summary mirrors active Builder categories; hidden photo/illustration choices stay out. */
export function selectedBuilderOptions(
  catalog: Option[],
  selection: Selection,
  photo: boolean,
  design = false,
): Option[] {
  return builderCategories(photo, design).flatMap((category) =>
    (selection[category] ?? []).flatMap((id) =>
      catalog.filter((option) => option.category === category && option.id === id),
    ),
  );
}

import { useRef, useState } from 'react';
import catalog from 'virtual:prompt-catalog';
import { pendingBuilderFilters, type FilterType } from './filters';
import type { StylePreset } from './presets';
import {
  builderCategories,
  designFormatRatios,
  imageType,
  makeMockupPrompt,
  makeRecreatePrompt,
  optionLimit,
  toggleOption,
  type ImageType,
  type Selection,
} from './promptBuilder';

export type BuilderType = ImageType;
export type PresetSettings = Pick<StylePreset, 'photo' | 'design' | 'selection' | 'fields'>;

const defaultFields: Record<string, string> = { Subject: '', 'Aspect Ratio': '4:5' };

export function useBuilderDraft() {
  const [builderType, setBuilderType] = useState<BuilderType>('illustration');
  const photo = builderType === 'photo';
  const design = builderType === 'design';
  const [illustrationSelection, setIllustrationSelection] = useState<Selection>({
    'Illustration Style': ['contemporaryflat'],
  });
  const [photoSelection, setPhotoSelection] = useState<Selection>({
    'Photo Style': ['portrait'],
  });
  const [designSelection, setDesignSelection] = useState<Selection>({
    'Design Format': ['poster'],
    'Design Style': ['minimalist'],
  });
  const [fields, setFields] = useState<Record<string, string>>(defaultFields);
  const [pendingChoices, setPendingChoices] = useState<Selection>({});
  const [pendingSelection, setPendingSelection] = useState<Selection>({});
  // Once the user picks a ratio, design formats stop suggesting their default ratio.
  const ratioChosen = useRef(false);
  const appliedFilters = useRef('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const backup = useRef<(() => void) | null>(null);
  const selections = {
    illustration: [illustrationSelection, setIllustrationSelection],
    photo: [photoSelection, setPhotoSelection],
    design: [designSelection, setDesignSelection],
  } as const;
  const [selection, setSelection] = selections[builderType];
  const pending = Object.keys(pendingChoices).length > 0;
  const mockupPrompt = pending ? '' : makeMockupPrompt(catalog, selection, fields, builderType);
  const recreatePrompt = makeRecreatePrompt(catalog, selection, fields, builderType);

  // Seed the draft from gallery filters that changed since the last time the Builder opened.
  function applyFilters(effectiveFilters: Selection, filterType: FilterType) {
    const composerPhoto = filterType === 'photo';
    const composerDesign = filterType === 'design';
    const signature = JSON.stringify([effectiveFilters, filterType]);
    if (signature !== appliedFilters.current) {
      const relevant = Object.fromEntries(
        Object.entries(effectiveFilters).filter(
          ([category, ids]) =>
            builderCategories(composerPhoto, composerDesign).includes(category) &&
            ids.length <= optionLimit(),
        ),
      );
      setPendingChoices(pendingBuilderFilters(effectiveFilters, composerPhoto, composerDesign));
      setPendingSelection({});
      if (effectiveFilters['Aspect Ratio']?.length === 1) {
        ratioChosen.current = true;
        setFields((previous) => ({
          ...previous,
          'Aspect Ratio': effectiveFilters['Aspect Ratio'][0],
        }));
      }
      const composerType = imageType(composerPhoto, composerDesign);
      selections[composerType][1]((previous) => ({ ...previous, ...relevant }));
      setBuilderType(composerType);
    }
    appliedFilters.current = signature;
  }
  function choosePending(category: string, id: string) {
    setPendingSelection((previous) => ({ ...previous, [category]: [id] }));
  }
  function applyPending() {
    if (
      Object.entries(pendingChoices).some(([category, ids]) => {
        const chosen = pendingSelection[category] ?? [];
        return (
          chosen.length === 0 ||
          chosen.length > optionLimit() ||
          chosen.some((id) => !ids.includes(id))
        );
      })
    )
      return;
    const resolved = Object.fromEntries(
      Object.entries(pendingSelection).filter(([category]) =>
        builderCategories(photo, design).includes(category),
      ),
    );
    setSelection((previous) => ({ ...previous, ...resolved }));
    if (pendingSelection['Aspect Ratio']?.length) {
      ratioChosen.current = true;
      setFields((previous) => ({
        ...previous,
        'Aspect Ratio': pendingSelection['Aspect Ratio'][0],
      }));
    }
    setPendingChoices({});
    setPendingSelection({});
  }
  function toggle(category: string, id: string) {
    setSelection(toggleOption(selection, category, id));
    if (category === 'Design Format' && !ratioChosen.current && designFormatRatios[id])
      setFields({ ...fields, 'Aspect Ratio': designFormatRatios[id] });
  }
  function removeOption(category: string, id: string) {
    setSelection((previous) => ({
      ...previous,
      [category]: (previous[category] ?? []).filter((value) => value !== id),
    }));
  }
  function changeFields(next: Record<string, string>) {
    if (next['Aspect Ratio'] !== fields['Aspect Ratio']) ratioChosen.current = true;
    setFields(next);
  }
  // Load a saved mockup, keeping the current draft to restore after editing.
  function startEdit(preset: StylePreset) {
    if (!editingId) {
      const draft = {
        builderType,
        illustrationSelection,
        photoSelection,
        designSelection,
        fields,
        pendingChoices,
        pendingSelection,
        ratioChosen: ratioChosen.current,
      };
      backup.current = () => {
        ratioChosen.current = draft.ratioChosen;
        setBuilderType(draft.builderType);
        setIllustrationSelection(draft.illustrationSelection);
        setPhotoSelection(draft.photoSelection);
        setDesignSelection(draft.designSelection);
        setFields(draft.fields);
        setPendingChoices(draft.pendingChoices);
        setPendingSelection(draft.pendingSelection);
      };
    }
    const type = imageType(preset.photo, preset.design);
    setBuilderType(type);
    selections[type][1](structuredClone(preset.selection));
    setFields({ ...defaultFields, ...preset.fields });
    ratioChosen.current = true;
    setPendingChoices({});
    setPendingSelection({});
    setEditingId(preset.id);
  }
  function endEdit() {
    if (!editingId) return;
    backup.current?.();
    backup.current = null;
    setEditingId(null);
  }
  const settings: PresetSettings = { photo, design, selection, fields };
  return {
    type: builderType,
    setType: setBuilderType,
    photo,
    selection,
    fields,
    setFields: changeFields,
    pendingChoices,
    pendingSelection,
    pending,
    mockupPrompt,
    recreatePrompt,
    settings,
    editingId,
    applyFilters,
    choosePending,
    applyPending,
    toggle,
    removeOption,
    startEdit,
    endEdit,
  };
}

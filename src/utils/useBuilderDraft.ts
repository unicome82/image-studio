import { useRef, useState } from 'react';
import catalog from 'virtual:prompt-catalog';
import { pendingBuilderFilters, type FilterType } from './filters';
import type { StylePreset } from './presets';
import {
  builderCategories,
  designFormatRatios,
  makePrompt,
  optionLimit,
  recommendedTotal,
  toggleOption,
  type Selection,
} from './promptBuilder';
import type { Recipe } from './recipes';

export type BuilderType = 'illustration' | 'photo' | 'design';
/** The Builder opens on recipe cards; the editor lists every option. */
export type BuilderStep = 'recipes' | 'editor';
export type PresetSettings = Pick<
  StylePreset,
  'photo' | 'design' | 'selection' | 'complexity' | 'fields'
>;

const initial: Selection = {
  'Illustration Style': ['contemporaryflat'],
  Technique: ['digitalpainting'],
  Color: ['neutralaccent'],
  Outline: ['coloronly'],
  Composition: ['minimal'],
};
const defaultFields: Record<string, string> = {
  Subject: '',
  'Aspect Ratio': '2:3',
  'Additional Instructions': '',
  'Typography Enabled': 'false',
  Text: '',
};

export function useBuilderDraft(onCrowded: () => void) {
  const [builderType, setBuilderType] = useState<BuilderType>('illustration');
  const [step, setStep] = useState<BuilderStep>('recipes');
  const photo = builderType === 'photo';
  const design = builderType === 'design';
  const [illustrationSelection, setIllustrationSelection] = useState(initial);
  const [photoSelection, setPhotoSelection] = useState<Selection>({
    'Photo Style': ['portrait'],
    Camera: ['portraitlens'],
    Lighting: ['softdaylight'],
  });
  const [designSelection, setDesignSelection] = useState<Selection>({
    'Design Format': ['poster'],
    'Design Style': ['minimalist'],
  });
  const [complexity, setComplexity] = useState(3);
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
  const prompt = pending ? '' : makePrompt(catalog, selection, complexity, fields, photo, design);

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
      setFields((previous) => ({
        ...previous,
        ...(effectiveFilters['Aspect Ratio']?.length === 1
          ? { 'Aspect Ratio': effectiveFilters['Aspect Ratio'][0] }
          : {}),
        ...(effectiveFilters.Typography?.length ? { 'Typography Enabled': 'true' } : {}),
      }));
      if (effectiveFilters['Aspect Ratio']?.length === 1) ratioChosen.current = true;
      if (effectiveFilters.Complexity?.length === 1)
        setComplexity(Number(effectiveFilters.Complexity[0]));
      const composerType = composerDesign ? 'design' : composerPhoto ? 'photo' : 'illustration';
      selections[composerType][1]((previous) => ({ ...previous, ...relevant }));
      setBuilderType(composerType);
      // Gallery filters are hand-picked settings, so they open the editor instead of recipes.
      if (Object.values(effectiveFilters).some((ids) => ids.length)) setStep('editor');
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
    if (pendingSelection.Complexity?.length) setComplexity(Number(pendingSelection.Complexity[0]));
    setPendingChoices({});
    setPendingSelection({});
  }
  function toggle(category: string, id: string) {
    const next = toggleOption(selection, category, id);
    const total = (value: Selection) =>
      Object.entries(value)
        .filter(([key]) => key !== 'Outline' && builderCategories(photo, design).includes(key))
        .reduce((sum, [, ids]) => sum + ids.length, 0);
    setSelection(next);
    if (total(next) > recommendedTotal && total(next) > total(selection)) onCrowded();
    if (category === 'Design Format' && !ratioChosen.current && designFormatRatios[id])
      setFields({ ...fields, 'Aspect Ratio': designFormatRatios[id] });
  }
  // A recipe replaces this type's choices and framing but keeps the subject and direction.
  function applyRecipe(recipe: Recipe) {
    selections[recipe.type][1](structuredClone(recipe.selection));
    setBuilderType(recipe.type);
    setComplexity(recipe.complexity);
    ratioChosen.current = true;
    setFields({
      ...fields,
      'Aspect Ratio': recipe.ratio,
      'Typography Enabled': recipe.typography ? 'true' : 'false',
    });
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
  // Load a saved style set, keeping the current draft to restore after editing.
  function startEdit(preset: StylePreset) {
    if (!editingId) {
      const draft = {
        builderType,
        step,
        illustrationSelection,
        photoSelection,
        designSelection,
        complexity,
        fields,
        pendingChoices,
        pendingSelection,
        ratioChosen: ratioChosen.current,
      };
      backup.current = () => {
        ratioChosen.current = draft.ratioChosen;
        setBuilderType(draft.builderType);
        setStep(draft.step);
        setIllustrationSelection(draft.illustrationSelection);
        setPhotoSelection(draft.photoSelection);
        setDesignSelection(draft.designSelection);
        setComplexity(draft.complexity);
        setFields(draft.fields);
        setPendingChoices(draft.pendingChoices);
        setPendingSelection(draft.pendingSelection);
      };
    }
    const type = preset.design ? 'design' : preset.photo ? 'photo' : 'illustration';
    setBuilderType(type);
    setStep('editor');
    selections[type][1](structuredClone(preset.selection));
    setComplexity(preset.complexity);
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
  const settings: PresetSettings = { photo, design, selection, complexity, fields };
  return {
    type: builderType,
    setType: setBuilderType,
    step,
    setStep,
    photo,
    selection,
    complexity,
    setComplexity,
    fields,
    setFields: changeFields,
    pendingChoices,
    pendingSelection,
    pending,
    prompt,
    settings,
    editingId,
    applyFilters,
    choosePending,
    applyPending,
    toggle,
    applyRecipe,
    removeOption,
    startEdit,
    endEdit,
  };
}

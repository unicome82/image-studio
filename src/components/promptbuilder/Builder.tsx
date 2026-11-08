import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import OptionChoices from './OptionChoices';
import SelectedOptions from './SelectedOptions';
import SavePrompt from './SavePrompt';
import Panel from '../Panel';
import SelectionSummary from '../SelectionSummary';
import { mobileQuery, useMediaQuery } from '../../utils/useMediaQuery';
import {
  aspectRatios,
  builderCategories,
  complexityUiLabels as complexityLabels,
  isTypographyEnabled,
  optionLimit,
} from '../../utils/promptBuilder';
import { matchesRecipe, recipes, type Recipe } from '../../utils/recipes';
import type { BuilderStep } from '../../utils/useBuilderDraft';
import type { Option, Selection } from '../../utils/promptBuilder';
interface Props {
  step: BuilderStep;
  setStep: (step: BuilderStep) => void;
  catalog: Option[];
  filterCatalog: Option[];
  pending: Selection;
  pendingSelection: Selection;
  choosePending: (category: string, id: string) => void;
  applyPending: () => void;
  selection: Selection;
  toggle: (category: string, id: string) => void;
  applyRecipe: (recipe: Recipe) => void;
  removeOption: (category: string, id: string) => void;
  complexity: number;
  setComplexity: (n: number) => void;
  fields: Record<string, string>;
  setFields: (fields: Record<string, string>) => void;
  photo: boolean;
  type: 'illustration' | 'photo' | 'design';
  setType: (type: 'illustration' | 'photo' | 'design') => void;
  close: () => void;
  prompt: string;
  copy: (text: string) => void;
  save: () => boolean;
  editing?: boolean;
}
export default function Builder(p: Props) {
  const { t } = useTranslation();
  const design = p.type === 'design';
  const pending = Object.entries(p.pending);
  const resolving = pending.length > 0;
  const canApply = pending.every(([category]) => {
    const count = p.pendingSelection[category]?.length ?? 0;
    return count > 0 && count <= optionLimit();
  });
  const tabsId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const measure = () => {
      if (heading.offsetHeight > 0)
        viewportRef.current?.style.setProperty(
          '--composer-heading-height',
          `${heading.offsetHeight}px`,
        );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    measure();
    return () => observer.disconnect();
  }, []);
  const mobile = useMediaQuery(mobileQuery);
  const [promptCollapsed, setPromptCollapsed] = useState(mobile);
  const types = [
    { id: 'illustration', label: 'Illustration' },
    { id: 'photo', label: 'Photo' },
    { id: 'design', label: 'Design' },
  ] as const;
  const chosenRecipe = recipes.find(
    (recipe) =>
      recipe.type === p.type &&
      matchesRecipe(recipe, p.selection, p.complexity, p.fields['Aspect Ratio'] ?? ''),
  );
  const editor = p.step === 'editor';
  // Recipe cards show the output only once a recipe is chosen.
  const showOutput = !resolving && (editor || !!chosenRecipe);
  const categories = builderCategories(p.photo, design).filter(
    (category) => category !== 'Outline',
  );
  const selectedOptions = (
    <SelectedOptions
      catalog={p.catalog}
      selection={p.selection}
      fields={p.fields}
      photo={p.photo}
      design={design}
      complexity={p.complexity}
      remove={p.removeOption}
    />
  );
  const promptActions = (
    <div className="prompt-actions">
      {!editor && (
        <button
          className="secondary edit-options-button"
          aria-label={t('Edit options')}
          title={t('Edit options')}
          onClick={() => p.setStep('editor')}
        >
          <Icon name="edit" size="20" />
        </button>
      )}
      {editor && (
        <SavePrompt
          save={p.save}
          editing={p.editing}
          disabled={resolving}
          iconOnly
          prompt={p.prompt}
          selected={{
            catalog: p.catalog,
            selection: p.selection,
            fields: p.fields,
            photo: p.photo,
            design,
            complexity: p.complexity,
          }}
        />
      )}
      <button className="primary" disabled={resolving} onClick={() => p.copy(p.prompt)}>
        <Icon name="content_copy" size="14" />
        {t('Copy prompt')}
      </button>
    </div>
  );
  return (
    <Panel
      className={'builder builder-fullscreen' + (showOutput ? '' : ' no-output')}
      label={t('Prompt Builder')}
      fullscreen
      close={p.close}
    >
      <div className="builder-viewport" ref={viewportRef}>
        <div className="builder-wrap builder-heading sticky-heading" ref={headingRef}>
          <h2 className="builder-title">
            {resolving ? t('Refine filter choices') : t('What would you like to draw?')}
            {!resolving && editor && (
              <button
                className="icon-button"
                aria-label={t('Start over')}
                title={t('Start over')}
                onClick={() => p.setStep('recipes')}
              >
                <Icon name="refresh" size="20" />
              </button>
            )}
          </h2>
          <div className="builder-composer-close">
            <button
              className="icon-button close-button"
              aria-label={t('Close Builder')}
              onClick={p.close}
            >
              <Icon name="close" size="24" className="w200" />
            </button>
          </div>
        </div>
        <div className="builder-scroll">
          <div className="builder-wrap">
            {resolving ? (
              <section className="builder-resolution">
                <p>{t('Choose builder options to generate a prompt.')}</p>
                {pending.map(([category, ids]) => (
                  <section className="option-section" key={category}>
                    <OptionChoices
                      title={
                        category === 'Illustration Style'
                          ? 'Style'
                          : category === 'Aspect Ratio'
                            ? 'Aspect ratio'
                            : category
                      }
                      options={ids.map((id) => ({
                        id,
                        label: (
                          p.filterCatalog.find(
                            (option) => option.category === category && option.id === id,
                          )?.label ?? id
                        ).replace(' Modern', ''),
                        category,
                      }))}
                      selected={p.pendingSelection[category] ?? []}
                      choose={(id) => p.choosePending(category, id)}
                      multiple={false}
                      collapsible={false}
                    />
                  </section>
                ))}
                <button
                  className="primary builder-resolution-action"
                  disabled={!canApply}
                  onClick={p.applyPending}
                >
                  {t('Apply choices')}
                </button>
              </section>
            ) : (
              <>
                <label className="builder-subject-label" htmlFor={`${tabsId}-subject`}>
                  {t('Describe the image you want to create.')}
                </label>
                <p className="builder-subject-hint" id={`${tabsId}-subject-hint`}>
                  {t('Random generation if left blank')}
                </p>
                <input
                  id={`${tabsId}-subject`}
                  className="builder-subject"
                  aria-describedby={`${tabsId}-subject-hint`}
                  placeholder={t('Subject example placeholder')}
                  value={p.fields.Subject ?? ''}
                  onChange={(e) => p.setFields({ ...p.fields, Subject: e.target.value })}
                />
                {editor ? (
                  <div className="type-tabs" role="group" aria-label={t('Type')}>
                    {types.map((type) => (
                      <button
                        key={type.id}
                        aria-pressed={p.type === type.id}
                        onClick={() => p.setType(type.id)}
                      >
                        {t(type.label)}
                      </button>
                    ))}
                  </div>
                ) : (
                  types.map((type) => (
                    <section className="recipe-section" key={type.id}>
                      <h3 className="builder-section-title">{t(type.label)}</h3>
                      <ul className="recipe-cards">
                        {recipes
                          .filter((recipe) => recipe.type === type.id)
                          .map((recipe) => (
                            <li key={recipe.id}>
                              <button
                                className="recipe-card"
                                style={{ backgroundColor: recipe.color }}
                                aria-pressed={recipe === chosenRecipe}
                                onClick={() => p.applyRecipe(recipe)}
                              >
                                <span className="recipe-card-name">{t(recipe.label)}</span>
                                <span className="recipe-card-description">
                                  {t(recipe.description)}
                                </span>
                              </button>
                            </li>
                          ))}
                        <li>
                          <button
                            className="recipe-card recipe-new"
                            onClick={() => {
                              p.setType(type.id);
                              p.setStep('editor');
                            }}
                          >
                            <Icon name="add" size="20" />
                            {t('New')}
                          </button>
                        </li>
                      </ul>
                    </section>
                  ))
                )}
                {editor && !p.photo && !design && (
                  <section className="option-section">
                    <OptionChoices
                      title="Outline"
                      multiple={false}
                      options={p.catalog
                        .filter((o) => o.category === 'Outline')
                        .map((o) => ({ id: o.id, label: o.label }))}
                      selected={p.selection.Outline ?? ['coloronly']}
                      choose={(id) => p.toggle('Outline', id)}
                    />
                  </section>
                )}
                {editor && (
                  <>
                    <section className="option-section">
                      <OptionChoices
                        title="Aspect ratio"
                        multiple={false}
                        options={[...new Set([...aspectRatios, p.fields['Aspect Ratio']])]
                          .filter(Boolean)
                          .map((ratio) => ({ id: ratio, label: ratio }))}
                        selected={[p.fields['Aspect Ratio'] || '2:3']}
                        choose={(ratio) => p.setFields({ ...p.fields, 'Aspect Ratio': ratio })}
                      />
                    </section>
                    <section className="option-section">
                      <OptionChoices
                        title="Complexity"
                        multiple={false}
                        options={complexityLabels.map((label, index) => ({
                          id: String(index + 1),
                          label,
                        }))}
                        selected={[String(p.complexity)]}
                        choose={(level) => p.setComplexity(Number(level))}
                      />
                    </section>
                    {categories.map((category) => {
                      const preferred = [
                        'contemporaryflat',
                        'isometric',
                        'midcentury',
                        'flatcolor',
                        'digitalpainting',
                        'risograph',
                        'vivid',
                        'pastel',
                        'muted',
                        'minimal',
                        'centered',
                        'asymmetric',
                        'cute',
                        'chic',
                        'fresh',
                      ];
                      const options = p.catalog
                        .filter((o) => o.category === category)
                        .sort(
                          (a, b) =>
                            (preferred.indexOf(a.id) < 0 ? 100 : preferred.indexOf(a.id)) -
                            (preferred.indexOf(b.id) < 0 ? 100 : preferred.indexOf(b.id)),
                        );
                      return (
                        <section className="option-section" key={category}>
                          <OptionChoices
                            title={category === 'Illustration Style' ? 'Style' : category}
                            options={options.map((o) => ({
                              id: o.id,
                              label: o.label.replace(' Modern', ''),
                              category,
                            }))}
                            selected={p.selection[category] ?? []}
                            headerControl={
                              category === 'Typography' ? (
                                <button
                                  className="typography-toggle"
                                  role="switch"
                                  aria-label={t('Typography')}
                                  aria-checked={isTypographyEnabled(p.fields)}
                                  onClick={() =>
                                    p.setFields({
                                      ...p.fields,
                                      'Typography Enabled': isTypographyEnabled(p.fields)
                                        ? 'false'
                                        : 'true',
                                    })
                                  }
                                >
                                  <span />
                                </button>
                              ) : undefined
                            }
                            showOptions={category !== 'Typography' || isTypographyEnabled(p.fields)}
                            multiple={false}
                            afterHeading={
                              category === 'Typography' && isTypographyEnabled(p.fields) ? (
                                <input
                                  className="typography-input"
                                  aria-label={t('Typography text')}
                                  placeholder={t('Text (optional)')}
                                  value={p.fields.Text ?? ''}
                                  onChange={(e) =>
                                    p.setFields({ ...p.fields, Text: e.target.value })
                                  }
                                />
                              ) : undefined
                            }
                            choose={(id) => p.toggle(category, id)}
                          />
                        </section>
                      );
                    })}
                    <section className="option-section inputs">
                      <h3>
                        <label htmlFor="builder-direction">{t('Your direction')}</label>
                      </h3>
                      <textarea
                        id="builder-direction"
                        rows={4}
                        value={p.fields['Additional Instructions'] ?? ''}
                        onChange={(e) =>
                          p.setFields({ ...p.fields, 'Additional Instructions': e.target.value })
                        }
                        placeholder={t('Add your direction\u2026')}
                      />
                    </section>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {showOutput && (
          <div className="builder-fullscreen-output">
            <div className="builder-fullscreen-output-scroll">
              <SelectionSummary label={t('Selected')}>{selectedOptions}</SelectionSummary>
              <section
                className={'builder-fullscreen-prompt' + (promptCollapsed ? ' collapsed' : '')}
              >
                <h3>
                  {t('Prompt')}
                  <button
                    className="choice-toggle"
                    aria-label={t(
                      promptCollapsed ? 'Expand {{title}} section' : 'Collapse {{title}} section',
                      { title: t('Prompt') },
                    )}
                    aria-expanded={!promptCollapsed}
                    aria-controls={`${tabsId}-prompt-content`}
                    onClick={() => setPromptCollapsed(!promptCollapsed)}
                  >
                    <Icon name={promptCollapsed ? 'expand_more' : 'expand_less'} size="16" />
                  </button>
                </h3>
                <div
                  id={`${tabsId}-prompt-content`}
                  className="builder-fullscreen-prompt-content"
                  hidden={promptCollapsed}
                >
                  <div
                    id={`${tabsId}-fullscreen-prompt`}
                    className="prompt-textarea"
                    aria-label={t('Builder prompt')}
                    role="region"
                    tabIndex={0}
                  >
                    {p.prompt}
                  </div>
                </div>
              </section>
            </div>
            {promptActions}
          </div>
        )}
      </div>
    </Panel>
  );
}

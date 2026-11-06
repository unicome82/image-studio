import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import OptionChoices from './OptionChoices';
import SelectedOptions from './SelectedOptions';
import SavePrompt from './SavePrompt';
import Panel from '../Panel';
import {
  builderCategories,
  complexityUiLabels as complexityLabels,
  isTypographyEnabled,
} from '../../utils/promptBuilder';
import { builderFilterLimit } from '../../utils/filters';
import type { Option, Selection } from '../../utils/promptBuilder';
interface Props {
  reset: () => void;
  catalog: Option[];
  filterCatalog: Option[];
  pending: Selection;
  pendingSelection: Selection;
  choosePending: (category: string, id: string) => void;
  applyPending: () => void;
  selection: Selection;
  toggle: (category: string, id: string) => void;
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
  save: (name: string) => boolean;
}
export default function Builder(p: Props) {
  const { t } = useTranslation();
  const design = p.type === 'design';
  const pending = Object.entries(p.pending);
  const resolving = pending.length > 0;
  const canApply = pending.every(([category]) => {
    const count = p.pendingSelection[category]?.length ?? 0;
    return count > 0 && count <= builderFilterLimit(category);
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
  const [selectedCollapsed, setSelectedCollapsed] = useState(false);
  const [promptCollapsed, setPromptCollapsed] = useState(false);
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
      <SavePrompt
        save={p.save}
        disabled={resolving}
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
      <button className="primary" disabled={resolving} onClick={() => p.copy(p.prompt)}>
        <Icon name="content_copy" size="14" />
        {t('Copy')}
      </button>
    </div>
  );
  return (
    <Panel
      className={'builder builder-fullscreen' + (resolving ? ' resolving' : '')}
      label={t('Prompt Builder')}
      fullscreen
      close={p.close}
    >
      <div className="builder-viewport" ref={viewportRef}>
        <div className="builder-wrap builder-heading" ref={headingRef}>
          <h2 className="builder-title">
            {resolving ? (
              t('Refine filter choices')
            ) : (
              <label htmlFor={`${tabsId}-subject`}>{t('What would you like to draw?')}</label>
            )}
            <button
              className="icon-button"
              aria-label={t('Reset Builder')}
              title={t('Reset Builder')}
              onClick={p.reset}
            >
              <Icon name="refresh" size="20" />
            </button>
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
                    {builderFilterLimit(category) === 1 && (
                      <p className="builder-resolution-limit">
                        {t('Choose up to {{limit}} for {{category}}.', {
                          limit: builderFilterLimit(category),
                          category: t(
                            category === 'Base Style'
                              ? 'Style'
                              : category === 'Aspect Ratio'
                                ? 'Aspect ratio'
                                : category,
                          ),
                        })}
                      </p>
                    )}
                    <OptionChoices
                      title={
                        category === 'Base Style'
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
                      }))}
                      selected={p.pendingSelection[category] ?? []}
                      choose={(id) => p.choosePending(category, id)}
                      multiple={builderFilterLimit(category) > 1}
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
                <input
                  id={`${tabsId}-subject`}
                  className="builder-subject"
                  placeholder={t('Random generation if left blank')}
                  value={p.fields.Subject ?? ''}
                  onChange={(e) => p.setFields({ ...p.fields, Subject: e.target.value })}
                />
                <section className="option-section builder-type">
                  <OptionChoices
                    title="Type"
                    multiple={false}
                    options={[
                      { id: 'illustration', label: 'Illustration' },
                      { id: 'photo', label: 'Photo' },
                      { id: 'design', label: 'Design' },
                    ]}
                    selected={[p.type]}
                    choose={(type) => p.setType(type as Props['type'])}
                  />
                </section>
                {!p.photo && !design && (
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
                <section className="option-section">
                  <OptionChoices
                    title="Aspect ratio"
                    multiple={false}
                    options={[
                      ...new Set(['1:1', '4:3', '3:4', '16:9', '9:16', p.fields['Aspect Ratio']]),
                    ]
                      .filter(Boolean)
                      .map((ratio) => ({ id: ratio, label: ratio }))}
                    selected={[p.fields['Aspect Ratio'] || '1:1']}
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
                    'naivefolk',
                    'midcentury',
                    'bauhaus',
                    'flatcolor',
                    'handdrawn',
                    'risograph',
                    'vivid',
                    'pastel',
                    'muted',
                    'minimal',
                    'centered',
                    'asymmetric',
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
                        title={category === 'Base Style' ? 'Style' : category}
                        options={options.map((o) => ({
                          id: o.id,
                          label: o.label.replace(' Modern', ''),
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
                        multiple={category !== 'Design Format'}
                        afterHeading={
                          category === 'Typography' && isTypographyEnabled(p.fields) ? (
                            <input
                              className="typography-input"
                              aria-label={t('Typography text')}
                              placeholder={t('Text (optional)')}
                              value={p.fields.Text ?? ''}
                              onChange={(e) => p.setFields({ ...p.fields, Text: e.target.value })}
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
          </div>
        </div>
        {!resolving && (
          <div className="builder-fullscreen-output">
            <div className="builder-fullscreen-output-scroll">
              <section className="builder-fullscreen-selected" aria-label={t('Selected')}>
                <h3>
                  {t('Selected')}
                  <button
                    className="choice-toggle"
                    aria-label={t(
                      selectedCollapsed ? 'Expand {{title}} section' : 'Collapse {{title}} section',
                      { title: t('Selected') },
                    )}
                    aria-expanded={!selectedCollapsed}
                    aria-controls={`${tabsId}-selected-content`}
                    onClick={() => setSelectedCollapsed(!selectedCollapsed)}
                  >
                    <Icon name={selectedCollapsed ? 'expand_more' : 'expand_less'} size="16" />
                  </button>
                </h3>
                <div id={`${tabsId}-selected-content`} hidden={selectedCollapsed}>
                  {selectedOptions}
                </div>
              </section>
              <section
                className={'builder-fullscreen-prompt' + (promptCollapsed ? ' collapsed' : '')}
              >
                <h3>
                  <label htmlFor={`${tabsId}-fullscreen-prompt`}>{t('Prompt')}</label>
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
                  <textarea
                    id={`${tabsId}-fullscreen-prompt`}
                    className="prompt-textarea"
                    aria-label={t('Builder prompt')}
                    readOnly
                    value={p.prompt}
                  />
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

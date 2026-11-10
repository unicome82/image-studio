import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import OptionChoices from './OptionChoices';
import SelectedOptions from './SelectedOptions';
import SavePrompt from './SavePrompt';
import Panel from '../Panel';
import SelectionSummary from '../SelectionSummary';
import { mobileQuery, useMediaQuery } from '../../utils/useMediaQuery';

/** Number of 'Mockup subject example N' strings in each locale. */
const subjectExampleCount = 8;
import {
  builderCategories,
  defaultDepiction,
  depictionLevels,
  isTypographyEnabled,
  optionLimit,
} from '../../utils/promptBuilder';
import type { ImageType, Option, Selection } from '../../utils/promptBuilder';
interface Props {
  catalog: Option[];
  filterCatalog: Option[];
  pending: Selection;
  pendingSelection: Selection;
  choosePending: (category: string, id: string) => void;
  applyPending: () => void;
  selection: Selection;
  toggle: (category: string, id: string) => void;
  removeOption: (category: string, id: string) => void;
  fields: Record<string, string>;
  setFields: (fields: Record<string, string>) => void;
  photo: boolean;
  type: ImageType;
  setType: (type: ImageType) => void;
  close: () => void;
  mockupPrompt: string;
  copy: (text: string) => void;
  save: () => boolean;
  editing?: boolean;
}
export default function Builder(p: Props) {
  const { t } = useTranslation();
  // Each opening suggests one of the gallery theme examples at random.
  const [subjectExample] = useState(() => 1 + Math.floor(Math.random() * subjectExampleCount));
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
  const prompt = p.mockupPrompt;
  const types = [
    { id: 'illustration', label: 'Illustration' },
    { id: 'photo', label: 'Photo' },
    { id: 'design', label: 'Design' },
  ] as const;
  // The subject is shared by every type and sits above the type tabs; lead styles follow the tabs.
  const categories = builderCategories(p.photo, design);
  const leadCategories = [
    'Illustration Style',
    'Photo Style',
    'Photo Technique',
    'Design Format',
    'Design Style',
    'Design Graphic',
  ];
  const lead = categories.filter((category) => leadCategories.includes(category));
  const rest = categories.filter(
    (category) => !leadCategories.includes(category) && category !== 'Typography',
  );
  const typography = isTypographyEnabled(p.fields);
  const choices = (category: string) => (
    <section className="option-section" key={category}>
      <OptionChoices
        title={['Illustration Style', 'Photo Style'].includes(category) ? 'Style' : category}
        options={p.catalog
          .filter((o) => o.category === category)
          .map((o) => ({ id: o.id, label: o.label.replace(' Modern', ''), category }))}
        selected={p.selection[category] ?? []}
        choose={(id) => p.toggle(category, id)}
      />
    </section>
  );
  return (
    <Panel
      className={'builder builder-fullscreen' + (resolving ? ' no-output' : '')}
      label={t('Prompt Builder')}
      fullscreen
      close={p.close}
    >
      <div className="builder-viewport" ref={viewportRef}>
        <div className="builder-wrap builder-heading sticky-heading" ref={headingRef}>
          <h2 className="builder-title">
            {resolving ? t('Refine filter choices') : t('Which style should we make?')}
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
                        ['Illustration Style', 'Photo Style'].includes(category)
                          ? 'Style'
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
                <section className="option-section">
                  <h3>
                    <label htmlFor={`${tabsId}-subject`}>{t('Subject')}</label>
                  </h3>
                  <input
                    id={`${tabsId}-subject`}
                    className="builder-subject"
                    placeholder={t('Mockup subject placeholder', {
                      example: t(`Mockup subject example ${subjectExample}`),
                    })}
                    value={p.fields.Subject ?? ''}
                    onChange={(e) => p.setFields({ ...p.fields, Subject: e.target.value })}
                  />
                </section>
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
                {lead.map(choices)}
                <section className="option-section">
                  <OptionChoices
                    title="Depiction"
                    options={p.catalog
                      .filter((o) => o.category === 'Depiction')
                      .sort((a, b) => depictionLevels.indexOf(a.id) - depictionLevels.indexOf(b.id))
                      .map((o) => ({ id: o.id, label: o.label, category: o.category }))}
                    selected={p.selection.Depiction ?? [defaultDepiction]}
                    choose={(id) => p.toggle('Depiction', id)}
                  />
                </section>
                {rest.map(choices)}
                {/* Typography stays off until its switch turns on the text input and styles. */}
                <section className="option-section">
                  <OptionChoices
                    title="Typography"
                    options={p.catalog
                      .filter((o) => o.category === 'Typography')
                      .map((o) => ({ id: o.id, label: o.label, category: o.category }))}
                    selected={p.selection.Typography ?? []}
                    choose={(id) => p.toggle('Typography', id)}
                    showOptions={typography}
                    headerControl={
                      <button
                        className="typography-toggle"
                        role="switch"
                        aria-label={t('Typography')}
                        aria-checked={typography}
                        onClick={() =>
                          p.setFields({
                            ...p.fields,
                            'Typography Enabled': typography ? 'false' : 'true',
                          })
                        }
                      >
                        <span />
                      </button>
                    }
                    afterHeading={
                      <input
                        className="typography-input"
                        aria-label={t('Typography text')}
                        placeholder={t('Text (optional)')}
                        value={p.fields.Text ?? ''}
                        onChange={(e) => p.setFields({ ...p.fields, Text: e.target.value })}
                      />
                    }
                  />
                </section>
              </>
            )}
          </div>
        </div>
        {!resolving && (
          <div className="builder-fullscreen-output">
            <div className="builder-fullscreen-output-scroll">
              <SelectionSummary label={t('Selected')}>
                <SelectedOptions
                  catalog={p.catalog}
                  selection={p.selection}
                  fields={p.fields}
                  photo={p.photo}
                  design={design}
                  remove={p.removeOption}
                  mockup
                />
              </SelectionSummary>
              <section
                className={'builder-fullscreen-prompt' + (promptCollapsed ? ' collapsed' : '')}
              >
                <h3>
                  <span>{t('Prompt')}</span>
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
                    className="prompt-textarea"
                    aria-label={t('Builder prompt')}
                    role="region"
                    tabIndex={0}
                  >
                    {prompt}
                  </div>
                </div>
              </section>
            </div>
            <div className="prompt-actions">
              <SavePrompt
                save={p.save}
                editing={p.editing}
                iconOnly
                prompt={p.mockupPrompt}
                selected={{
                  catalog: p.catalog,
                  selection: p.selection,
                  fields: p.fields,
                  photo: p.photo,
                  design,
                  mockup: true,
                }}
              />
              <button className="primary" onClick={() => p.copy(prompt)}>
                <Icon name="content_copy" size="14" />
                {t('Copy prompt')}
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

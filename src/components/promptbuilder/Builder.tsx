import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import OptionChoices from './OptionChoices';
import SelectedOptions from './SelectedOptions';
import SavePrompt from './SavePrompt';
import Panel from '../Panel';
import SelectionSummary from '../SelectionSummary';
import { mobileQuery, useMediaQuery } from '../../utils/useMediaQuery';
import { aspectRatios, builderCategories, optionLimit } from '../../utils/promptBuilder';
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
  recreatePrompt: string;
  copy: (text: string) => void;
  save: () => boolean;
  editing?: boolean;
}
type Output = 'mockup' | 'image';
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
  // Style choices shape the mockup; the subject and ratio shape the single image.
  const [output, setOutput] = useState<Output>('mockup');
  const prompt = output === 'mockup' ? p.mockupPrompt : p.recreatePrompt;
  const types = [
    { id: 'illustration', label: 'Illustration' },
    { id: 'photo', label: 'Photo' },
    { id: 'design', label: 'Design' },
  ] as const;
  const categories = builderCategories(p.photo, design).filter(
    (category) => category !== 'Outline',
  );
  function toggle(category: string, id: string) {
    p.toggle(category, id);
    setOutput('mockup');
  }
  function setFields(next: Record<string, string>) {
    p.setFields(next);
    setOutput('image');
  }
  const outputs: { id: Output; label: string }[] = [
    { id: 'mockup', label: 'Gallery mockup' },
    { id: 'image', label: 'Single image' },
  ];
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
                <div className="type-tabs" role="group" aria-label={t('Type')}>
                  {types.map((type) => (
                    <button
                      key={type.id}
                      aria-pressed={p.type === type.id}
                      onClick={() => {
                        p.setType(type.id);
                        setOutput('mockup');
                      }}
                    >
                      {t(type.label)}
                    </button>
                  ))}
                </div>
                {!p.photo && !design && (
                  <section className="option-section">
                    <OptionChoices
                      title="Outline"
                      multiple={false}
                      options={p.catalog
                        .filter((o) => o.category === 'Outline')
                        .map((o) => ({ id: o.id, label: o.label }))}
                      selected={p.selection.Outline ?? ['coloronly']}
                      choose={(id) => toggle('Outline', id)}
                    />
                  </section>
                )}
                {categories.map((category) => (
                  <section className="option-section" key={category}>
                    <OptionChoices
                      title={category === 'Illustration Style' ? 'Style' : category}
                      options={p.catalog
                        .filter((o) => o.category === category)
                        .map((o) => ({
                          id: o.id,
                          label: o.label.replace(' Modern', ''),
                          category,
                        }))}
                      selected={p.selection[category] ?? []}
                      multiple={false}
                      choose={(id) => toggle(category, id)}
                    />
                  </section>
                ))}
                <section className="option-section single-image">
                  <h3>
                    <label htmlFor={`${tabsId}-subject`}>{t('Single image')}</label>
                  </h3>
                  <p className="builder-subject-hint" id={`${tabsId}-subject-hint`}>
                    {t('Describe the image you picked from the mockup.')}
                  </p>
                  <input
                    id={`${tabsId}-subject`}
                    className="builder-subject"
                    aria-describedby={`${tabsId}-subject-hint`}
                    placeholder={t('Subject example placeholder')}
                    value={p.fields.Subject ?? ''}
                    onChange={(e) => setFields({ ...p.fields, Subject: e.target.value })}
                  />
                </section>
                <section className="option-section">
                  <OptionChoices
                    title="Aspect ratio"
                    multiple={false}
                    options={[...new Set([...aspectRatios, p.fields['Aspect Ratio']])]
                      .filter(Boolean)
                      .map((ratio) => ({ id: ratio, label: ratio }))}
                    selected={[p.fields['Aspect Ratio'] || '4:5']}
                    choose={(ratio) => setFields({ ...p.fields, 'Aspect Ratio': ratio })}
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
                />
              </SelectionSummary>
              <section
                className={'builder-fullscreen-prompt' + (promptCollapsed ? ' collapsed' : '')}
              >
                <h3>
                  <span className="prompt-tabs" role="group" aria-label={t('Prompt')}>
                    {outputs.map((item) => (
                      <button
                        key={item.id}
                        aria-pressed={output === item.id}
                        onClick={() => setOutput(item.id)}
                      >
                        {t(item.label)}
                      </button>
                    ))}
                  </span>
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

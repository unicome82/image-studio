import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import OptionChoices from './OptionChoices';
import SelectedOptions from './SelectedOptions';
import ResizeHandle from './ResizeHandle';
import SavePrompt from './SavePrompt';
import Panel from '../Panel';
import { useMediaQuery } from '../../utils/useMediaQuery';
import {
  builderCategories,
  complexityLabels,
  isTypographyEnabled,
} from '../../utils/promptBuilder';
import type { Option, Selection } from '../../utils/promptBuilder';
interface Props {
  width: number;
  resize: (width: number) => void;
  catalog: Option[];
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
  const [fullscreen, setFullscreen] = useState(false);
  const mobile = useMediaQuery('(max-width: 600px)');
  const fullscreenView = fullscreen && !mobile;
  const design = p.type === 'design';
  const configuration = JSON.stringify([p.selection, p.fields, p.complexity, p.type]);
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const showPrompt = generated === configuration;
  useEffect(() => {
    setGenerated(null);
  }, [configuration]);
  const tabsId = useId();
  const categories = builderCategories(p.photo).filter((category) => category !== 'Outline');
  const selectedOptions = (
    <SelectedOptions
      catalog={p.catalog}
      selection={p.selection}
      fields={p.fields}
      photo={p.photo}
      complexity={p.complexity}
      remove={p.removeOption}
    />
  );
  const promptActions = (
    <div className="prompt-actions">
      <SavePrompt
        save={p.save}
        prompt={p.prompt}
        selected={{
          catalog: p.catalog,
          selection: p.selection,
          fields: p.fields,
          photo: p.photo,
          complexity: p.complexity,
        }}
      />
      <button className="primary builder-copy" onClick={() => p.copy(p.prompt)}>
        <Icon name="content_copy" size="14" />
        {t('Copy')}
      </button>
    </div>
  );
  return (
    <Panel
      className={'builder' + (fullscreenView ? ' builder-fullscreen' : '')}
      label={t('Prompt Builder')}
      fullscreen={fullscreenView}
      close={() => (fullscreenView ? setFullscreen(false) : p.close())}
    >
      {!fullscreenView && <ResizeHandle width={p.width} resize={p.resize} />}
      <div className="builder-viewport">
        <div className="builder-wrap builder-heading">
          <h2 className="builder-title">
            <label htmlFor={`${tabsId}-subject`}>{t('What would you like to draw?')}</label>
            <button
              className={
                'icon-button builder-fullscreen-toggle' + (fullscreenView ? ' close-button' : '')
              }
              aria-label={t(fullscreenView ? 'Exit Builder fullscreen' : 'View Builder fullscreen')}
              aria-pressed={fullscreenView}
              onClick={() => setFullscreen(!fullscreen)}
            >
              <Icon
                name={fullscreenView ? 'close' : 'fullscreen'}
                size={fullscreenView ? '24' : '20'}
                className={fullscreenView ? 'w200' : ''}
              />
            </button>
          </h2>
          <div className="builder-mobile-close">
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
            {!design && (
              <input
                id={`${tabsId}-subject`}
                className="builder-subject"
                placeholder={t('Random generation if left blank')}
                value={p.fields.Subject ?? ''}
                onChange={(e) => p.setFields({ ...p.fields, Subject: e.target.value })}
              />
            )}
            <section className="option-section builder-type">
              <OptionChoices
                title="Type"
                multiple={false}
                collapsible={false}
                options={[
                  { id: 'illustration', label: 'Illustration' },
                  { id: 'photo', label: 'Photo' },
                  { id: 'design', label: 'Design' },
                ]}
                selected={[p.type]}
                choose={(type) => p.setType(type as Props['type'])}
              />
            </section>
            {design ? (
              <p className="builder-unavailable">{t('Design prompts are not available yet.')}</p>
            ) : (
              <>
                {!p.photo && (
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
                    collapsible={false}
                    options={[
                      ...new Set(['1:1', '4:3', '3:4', '16:9', '9:16', p.fields['Aspect Ratio']]),
                    ]
                      .filter(Boolean)
                      .map((ratio) => ({ id: ratio, label: ratio }))}
                    selected={[p.fields['Aspect Ratio'] || '1:1']}
                    choose={(ratio) => p.setFields({ ...p.fields, 'Aspect Ratio': ratio })}
                  />
                </section>
                <section className="option-section complexity-option">
                  <OptionChoices
                    title="Complexity"
                    multiple={false}
                    collapsible={false}
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
                        collapsible={category !== 'Typography'}
                        multiple
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
        {!design &&
          (fullscreenView ? (
            <div className="builder-fullscreen-output">
              <div className="builder-fullscreen-output-scroll">
                <section className="builder-fullscreen-selected" aria-label={t('Selected')}>
                  <h3>{t('Selected')}</h3>
                  {selectedOptions}
                </section>
                <section className="builder-fullscreen-prompt">
                  <h3>
                    <label htmlFor={`${tabsId}-fullscreen-prompt`}>{t('Prompt')}</label>
                  </h3>
                  <textarea
                    id={`${tabsId}-fullscreen-prompt`}
                    className="prompt-textarea"
                    aria-label={t('Builder prompt')}
                    readOnly
                    value={p.prompt}
                  />
                </section>
              </div>
              {promptActions}
            </div>
          ) : (
            <div className={'builder-footer' + (outputCollapsed ? ' collapsed' : '')}>
              <div className="builder-wrap">
                <div className="builder-footer-heading">
                  <div
                    className="builder-footer-tabs"
                    role="tablist"
                    aria-label={t('Builder output')}
                  >
                    {['Selected', 'Prompt'].map((tab, index) => (
                      <button
                        key={tab}
                        id={`${tabsId}-tab-${index}`}
                        role="tab"
                        aria-selected={showPrompt === (index === 1)}
                        aria-controls={`${tabsId}-panel`}
                        tabIndex={showPrompt === (index === 1) ? 0 : -1}
                        onClick={() => {
                          setGenerated(index === 1 ? configuration : null);
                          setOutputCollapsed(false);
                        }}
                        onKeyDown={(event) => {
                          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
                            return;
                          event.preventDefault();
                          const next =
                            event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
                          setGenerated(next === 1 ? configuration : null);
                          setOutputCollapsed(false);
                          document.getElementById(`${tabsId}-tab-${next}`)?.focus();
                        }}
                      >
                        {t(tab)}
                      </button>
                    ))}
                  </div>
                  <button
                    className="choice-toggle builder-output-toggle"
                    aria-label={t(
                      outputCollapsed ? 'Expand Builder output' : 'Collapse Builder output',
                    )}
                    aria-expanded={!outputCollapsed}
                    aria-controls={`${tabsId}-content`}
                    onClick={() => setOutputCollapsed(!outputCollapsed)}
                  >
                    <Icon name={outputCollapsed ? 'expand_more' : 'expand_less'} size="16" />
                  </button>
                </div>
                <div
                  className="builder-output"
                  key={showPrompt ? 'prompt' : 'selected'}
                  id={`${tabsId}-panel`}
                  role="tabpanel"
                  aria-labelledby={`${tabsId}-tab-${showPrompt ? 1 : 0}`}
                >
                  <div
                    id={`${tabsId}-content`}
                    className="builder-output-content"
                    hidden={outputCollapsed}
                  >
                    {showPrompt ? (
                      <textarea
                        className="prompt-textarea"
                        aria-label={t('Builder prompt')}
                        readOnly
                        value={p.prompt}
                      />
                    ) : (
                      selectedOptions
                    )}
                  </div>
                  {showPrompt ? (
                    promptActions
                  ) : (
                    <button
                      className="primary generate-prompt"
                      onClick={() => {
                        setGenerated(configuration);
                        setOutputCollapsed(false);
                      }}
                    >
                      <Icon name="auto_awesome" size="16" className="fill" />
                      {t('Generate prompt')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </Panel>
  );
}

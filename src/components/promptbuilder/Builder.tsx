import { useTranslation } from 'react-i18next';
import './Builder.scss';
import Icon from '../Icon';
import OptionChoices from './OptionChoices';
import ResizeHandle from './ResizeHandle';
import SavePrompt from './SavePrompt';
import Panel from '../Panel';
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
  complexity: number;
  setComplexity: (n: number) => void;
  fields: Record<string, string>;
  setFields: (fields: Record<string, string>) => void;
  photo: boolean;
  close: () => void;
  prompt: string;
  copy: (text: string) => void;
  save: (name: string) => boolean;
}
export default function Builder(p: Props) {
  const { t } = useTranslation();
  const categories = builderCategories(p.photo);
  return (
    <Panel className="builder" label={t('Prompt Builder')} close={p.close}>
      <ResizeHandle width={p.width} resize={p.resize} />
      <div className="builder-mobile-close">
        <button className="icon-button" aria-label={t('Close Builder')} onClick={p.close}>
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="builder-scroll">
        <div className="builder-wrap">
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
                            'Typography Enabled': isTypographyEnabled(p.fields) ? 'false' : 'true',
                          })
                        }
                      >
                        <span />
                      </button>
                    ) : undefined
                  }
                  showOptions={category !== 'Typography' || isTypographyEnabled(p.fields)}
                  collapsible={category !== 'Typography'}
                  multiple={category !== 'Outline'}
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
          <section className="option-section">
            <OptionChoices
              title="Aspect ratio"
              multiple={false}
              options={[...new Set(['1:1', '4:3', '3:4', '16:9', '9:16', p.fields['Aspect Ratio']])]
                .filter(Boolean)
                .map((ratio) => ({ id: ratio, label: ratio }))}
              selected={[p.fields['Aspect Ratio']]}
              choose={(ratio) => p.setFields({ ...p.fields, 'Aspect Ratio': ratio })}
            />
          </section>
          <section className="option-section complexity-option">
            <h3>
              {t('Complexity')}
              <span>{t(complexityLabels[p.complexity - 1])}</span>
            </h3>
            <input
              aria-label={t('Complexity')}
              aria-valuetext={t(complexityLabels[p.complexity - 1])}
              type="range"
              min="1"
              max="5"
              value={p.complexity}
              onChange={(e) => p.setComplexity(Number(e.target.value))}
            />
          </section>
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
        </div>
      </div>
      <div className="builder-footer">
        <div className="builder-wrap">
          <h3>{t('Prompt')}</h3>
          <textarea
            className="prompt-textarea"
            aria-label={t('Builder prompt')}
            readOnly
            value={p.prompt}
          />
          <div className="prompt-actions">
            <SavePrompt save={p.save} prompt={p.prompt} />
            <button className="primary builder-copy" onClick={() => p.copy(p.prompt)}>
              <Icon name="content_copy" size={14} />
              {t('Copy')}
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

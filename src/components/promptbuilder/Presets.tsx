import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { useState } from 'react';
import SelectedOptions from './SelectedOptions';
import type { StylePreset } from '../../utils/presets';
import { optionLabelKey } from '../../utils/optionChoices';
import {
  builderCategories,
  imageType,
  makeMockupPrompt,
  type Option,
} from '../../utils/promptBuilder';
interface Props {
  presets: StylePreset[];
  catalog: Option[];
  edit: (preset: StylePreset) => void;
  remove: (id: string) => void;
  copy: (prompt: string) => void;
}
// The image type leads every title in English, whatever the UI language.
const typePrefix = { illustration: 'Illust', photo: 'Photo', design: 'Design' };

export default function Presets(p: Props) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <section className="presets-page" aria-label={t('Saved mockups')}>
      <div className="preset-list">
        {p.presets.length === 0 ? (
          <div className="empty-state" role="status">
            <h2>{t('No saved mockups')}</h2>
            <p>{t('Save a mockup prompt to collect it here.')}</p>
          </div>
        ) : (
          p.presets.map((preset) => {
            // Rebuild from saved settings and the canonical catalog; never duplicate prompt bodies in storage.
            const type = imageType(preset.photo, preset.design);
            const prompt = makeMockupPrompt(p.catalog, preset.selection, preset.fields, type);
            // A saved mockup is named after its Subject, or its lead style when the Subject is empty.
            const subject = preset.fields.Subject?.trim();
            const lead = builderCategories(preset.photo, preset.design)
              .flatMap((category) =>
                (preset.selection[category] ?? []).map((id) =>
                  p.catalog.find((o) => o.category === category && o.id === id),
                ),
              )
              .find(Boolean);
            const title = subject || (lead ? t(optionLabelKey(lead)) : t('Untitled mockup'));
            return (
              <article className="preset-item" key={preset.id} aria-label={title}>
                <div className="preset-item-heading">
                  <h3 className="preset-name">
                    <span className="preset-type">{typePrefix[type]}</span>
                    {title}
                  </h3>
                  <div className="preset-item-actions">
                    {deleting === preset.id ? (
                      <>
                        <button
                          className="primary"
                          aria-label={t('Confirm delete {{name}}', { name: title })}
                          onClick={() => {
                            p.remove(preset.id);
                            setDeleting(null);
                          }}
                        >
                          {t('Delete')}
                        </button>
                        <button className="secondary" onClick={() => setDeleting(null)}>
                          {t('Cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="icon-button"
                          aria-label={t('Edit {{name}} settings', { name: title })}
                          title={t('Edit mockup')}
                          onClick={() => p.edit(preset)}
                        >
                          <Icon name="edit" size="16" />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={t('Delete {{name}}', { name: title })}
                          title={t('Delete mockup')}
                          onClick={() => setDeleting(preset.id)}
                        >
                          <Icon name="delete" size="16" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="preset-selected">
                  <SelectedOptions
                    catalog={p.catalog}
                    selection={preset.selection}
                    fields={preset.fields}
                    photo={preset.photo}
                    design={preset.design}
                    mockup
                  />
                </div>
                <div className="prompt-box">
                  <div
                    className="prompt-textarea"
                    aria-label={t('{{name}} prompt', { name: title })}
                    role="region"
                    tabIndex={0}
                  >
                    {prompt}
                  </div>
                  <button
                    className="icon-button"
                    aria-label={t('Copy {{name}} prompt', { name: title })}
                    title={t('Copy prompt')}
                    onClick={() => p.copy(prompt)}
                  >
                    <Icon name="content_copy" size="16" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

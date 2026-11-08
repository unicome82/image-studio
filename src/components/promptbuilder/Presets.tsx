import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { useState } from 'react';
import SelectedOptions from './SelectedOptions';
import type { StylePreset } from '../../utils/presets';
import { makePrompt, type Option } from '../../utils/promptBuilder';
interface Props {
  presets: StylePreset[];
  catalog: Option[];
  edit: (preset: StylePreset) => void;
  remove: (id: string) => void;
  copy: (prompt: string) => void;
}
export default function Presets(p: Props) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <section className="presets-page" aria-label={t('Saved style sets')}>
      <div className="preset-list">
        {p.presets.length === 0 ? (
          <div className="empty-state" role="status">
            <h2>{t('No saved style sets')}</h2>
            <p>{t('Save a prompt to collect your style sets here.')}</p>
          </div>
        ) : (
          p.presets.map((preset) => {
            // Rebuild from saved settings and the canonical catalog; never duplicate prompt bodies in storage.
            const prompt = makePrompt(
              p.catalog,
              preset.selection,
              preset.complexity,
              preset.fields,
              preset.photo,
              preset.design,
            );
            const title = preset.fields.Subject?.trim() || t('Random image');
            return (
              <article className="preset-item" key={preset.id} aria-label={title}>
                <div className="preset-item-heading">
                  <h3 className="preset-name">{title}</h3>
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
                          title={t('Edit style set')}
                          onClick={() => p.edit(preset)}
                        >
                          <Icon name="edit" size="16" />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={t('Delete {{name}}', { name: title })}
                          title={t('Delete style set')}
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
                    complexity={preset.complexity}
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

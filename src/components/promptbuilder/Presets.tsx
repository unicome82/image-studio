import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { useState } from 'react';
import type { StylePreset } from '../../utils/presets';
import { makePrompt, type Option } from '../../utils/promptBuilder';
interface Props {
  presets: StylePreset[];
  catalog: Option[];
  rename: (id: string, name: string) => boolean;
  remove: (id: string) => void;
  copy: (prompt: string) => void;
}
export default function Presets(p: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <section className="presets-page" aria-label={t('Saved style sets')}>
      <div className="section-heading">
        <h2>
          {t('Prompts')}
          <span>{p.presets.length}</span>
        </h2>
      </div>
      <div className="preset-list">
        {p.presets.length === 0 ? (
          <div className="preset-empty">
            <Icon name="collections_bookmark" size="22" />
            <p>{t('No saved style sets')}</p>
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
            );
            return (
              <article className="preset-item" key={preset.id} aria-label={preset.name}>
                {editing === preset.id ? (
                  <form
                    className="preset-rename"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editName.trim() && p.rename(preset.id, editName.trim())) setEditing(null);
                    }}
                  >
                    <input
                      aria-label={t('Rename style set')}
                      maxLength={80}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      required
                    />
                    <button
                      className="secondary rename-cancel"
                      aria-label={t('Cancel rename')}
                      type="button"
                      onClick={() => setEditing(null)}
                    >
                      {t('Cancel')}
                    </button>
                    <button
                      className="primary rename-confirm"
                      aria-label={t('Confirm rename')}
                      type="submit"
                    >
                      {t('Save')}
                    </button>
                  </form>
                ) : (
                  <div className="preset-item-heading">
                    <div className="preset-name">
                      <h3>{preset.name}</h3>
                      <button
                        className="icon-button"
                        aria-label={t('Edit {{name}} name', { name: preset.name })}
                        onClick={() => {
                          setEditing(preset.id);
                          setEditName(preset.name);
                        }}
                      >
                        <Icon name="edit" size="16" />
                      </button>
                    </div>
                    <div className="preset-item-actions">
                      {deleting === preset.id ? (
                        <>
                          <button className="secondary" onClick={() => setDeleting(null)}>
                            {t('Cancel')}
                          </button>
                          <button
                            className="primary"
                            aria-label={t('Confirm delete {{name}}', { name: preset.name })}
                            onClick={() => {
                              p.remove(preset.id);
                              setDeleting(null);
                            }}
                          >
                            {t('Delete')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="icon-button preset-copy"
                            aria-label={t('Copy {{name}} prompt', { name: preset.name })}
                            title={t('Copy prompt')}
                            onClick={() => p.copy(prompt)}
                          >
                            <Icon name="content_copy" size="16" />
                          </button>
                          <button
                            className="icon-button preset-delete"
                            aria-label={t('Delete {{name}}', { name: preset.name })}
                            title={t('Delete style set')}
                            onClick={() => setDeleting(preset.id)}
                          >
                            <Icon name="delete" size="16" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <textarea
                  className="prompt-textarea preset-prompt"
                  aria-label={t('{{name}} prompt', { name: preset.name })}
                  value={prompt}
                  readOnly
                />
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

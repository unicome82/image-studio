import './Presets.scss';
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
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <section className="presets-page" aria-label="Saved style sets">
      <div className="section-heading">
        <h2>
          Prompts<span>{p.presets.length}</span>
        </h2>
      </div>
      <div className="preset-list">
        {p.presets.length === 0 ? (
          <div className="preset-empty">
            <Icon name="format_list_bulleted" size={22} />
            <p>No saved style sets</p>
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
                      aria-label="Rename style set"
                      maxLength={80}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      required
                    />
                    <button className="icon-button" aria-label="Confirm rename" type="submit">
                      <Icon name="check" size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Cancel rename"
                      type="button"
                      onClick={() => setEditing(null)}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </form>
                ) : (
                  <div className="preset-item-heading">
                    <div className="preset-name">
                      <h3>{preset.name}</h3>
                      <button
                        className="icon-button"
                        aria-label={`Edit ${preset.name} name`}
                        onClick={() => {
                          setEditing(preset.id);
                          setEditName(preset.name);
                        }}
                      >
                        <Icon name="edit" size={13} />
                      </button>
                    </div>
                    <div className="preset-item-actions">
                      {deleting === preset.id ? (
                        <>
                          <button className="secondary" onClick={() => setDeleting(null)}>
                            Cancel
                          </button>
                          <button
                            className="primary"
                            aria-label={`Confirm delete ${preset.name}`}
                            onClick={() => {
                              p.remove(preset.id);
                              setDeleting(null);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="primary preset-copy"
                            aria-label={`Copy ${preset.name} prompt`}
                            title="Copy prompt"
                            onClick={() => p.copy(prompt)}
                          >
                            <Icon name="content_copy" size={14} />
                            Copy
                          </button>
                          <button
                            className="icon-button type-outline"
                            aria-label={`Delete ${preset.name}`}
                            title="Delete style set"
                            onClick={() => setDeleting(preset.id)}
                          >
                            <Icon name="delete" size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <textarea
                  className="prompt-textarea preset-prompt"
                  aria-label={`${preset.name} prompt`}
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

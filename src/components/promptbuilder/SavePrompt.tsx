import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import SelectedOptions, { type SelectedOptionsProps } from './SelectedOptions';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface Props {
  save: (name: string) => boolean;
  prompt: string;
  selected: Omit<SelectedOptionsProps, 'remove'>;
  disabled?: boolean;
}
function SaveDialog({ save, prompt, selected, close }: Props & { close: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(() => (selected.fields.Subject ?? '').trim().slice(0, 80));
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className="save-style-dialog"
      aria-label={t('Save style')}
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            close();
        }
      }}
    >
      <div className="panel-heading">
        <span>{t('Save style')}</span>
        <button
          className="icon-button close-button"
          aria-label={t('Close save style')}
          onClick={close}
        >
          <Icon name="close" size="24" className="w200" />
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          if (save(name.trim())) close();
          else
            setError(
              'Could not save. Check for an existing style name or unavailable browser storage.',
            );
        }}
      >
        <label className="save-style-label">
          {t('Style name')}
          <input
            aria-label={t('Style name')}
            value={name}
            maxLength={80}
            placeholder={t('Style name')}
            autoFocus
            required
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
          />
        </label>
        <div className="save-style-selected">
          <h3>{t('Selected')}</h3>
          <SelectedOptions {...selected} />
        </div>
        <div className="save-style-label">
          <span>{t('Prompt preview')}</span>
          <textarea
            className="prompt-textarea"
            aria-label={t('Prompt preview')}
            readOnly
            value={prompt}
          />
        </div>
        {error && (
          <p className="save-style-error" role="alert">
            {t(error)}
          </p>
        )}
        <div className="save-style-actions">
          <button type="button" className="secondary" onClick={close}>
            {t('Cancel')}
          </button>
          <button type="submit" className="primary" disabled={!name.trim()}>
            {t('Save')}
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
export default function SavePrompt({ save, prompt, selected, disabled = false }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="save-prompt-control">
      <button
        className="secondary save-prompt-button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {t('Save')}
      </button>
      {open && (
        <SaveDialog save={save} prompt={prompt} selected={selected} close={() => setOpen(false)} />
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import SelectedOptions, { type SelectedOptionsProps } from './SelectedOptions';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface Props {
  save: () => boolean;
  editing?: boolean;
  prompt: string;
  selected: Omit<SelectedOptionsProps, 'remove'>;
  disabled?: boolean;
  iconOnly?: boolean;
}
function SaveDialog({ save, prompt, selected, editing, close }: Props & { close: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const fieldId = useId();
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
      aria-label={t(editing ? 'Update style set' : 'Save style')}
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
        <span>{t(editing ? 'Update style set' : 'Save style')}</span>
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
          if (save()) close();
          else setError('Could not save. Browser storage is unavailable or full.');
        }}
      >
        <div className="save-style-field">
          <h3>{t('Selected')}</h3>
          <SelectedOptions {...selected} />
        </div>
        <div className="save-style-field">
          <h3>{t('Prompt')}</h3>
          <div
            id={`${fieldId}-prompt`}
            className="prompt-textarea"
            aria-label={t('Prompt')}
            role="region"
            tabIndex={0}
          >
            {prompt}
          </div>
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
          <button type="submit" className="primary">
            {t('Save')}
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
export default function SavePrompt({
  save,
  prompt,
  selected,
  editing,
  disabled = false,
  iconOnly = false,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className={'save-prompt-control' + (iconOnly ? ' icon-only' : '')}>
      <button
        className="secondary save-prompt-button"
        disabled={disabled}
        aria-label={iconOnly ? t('Save') : undefined}
        title={iconOnly ? t('Save') : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {iconOnly ? <Icon name="bookmark_add" size="20" /> : t('Save')}
      </button>
      {open && (
        <SaveDialog
          save={save}
          prompt={prompt}
          selected={selected}
          editing={editing}
          close={() => setOpen(false)}
        />
      )}
    </div>
  );
}

import './SavePrompt.scss';
import Icon from '../Icon';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface Props {
  save: (name: string) => boolean;
  prompt: string;
}
function SaveDialog({ save, prompt, close }: Props & { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
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
      aria-label="Save style"
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
        <span>Save style</span>
        <button className="icon-button" aria-label="Close save style" onClick={close}>
          <Icon name="close" size={18} />
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
          Style name
          <input
            aria-label="Style name"
            value={name}
            maxLength={80}
            placeholder="Style name"
            autoFocus
            required
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
          />
        </label>
        <label className="save-style-label">
          Prompt preview
          <textarea
            className="prompt-textarea"
            aria-label="Prompt preview"
            readOnly
            value={prompt}
          />
        </label>
        {error && (
          <p className="save-style-error" role="alert">
            {error}
          </p>
        )}
        <div className="save-style-actions">
          <button type="button" className="secondary" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={!name.trim()}>
            Save
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
export default function SavePrompt({ save, prompt }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="save-prompt-control">
      <button
        className="secondary save-prompt-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Save
      </button>
      {open && <SaveDialog save={save} prompt={prompt} close={() => setOpen(false)} />}
    </div>
  );
}

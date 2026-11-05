import { useEffect, useRef, type ReactNode } from 'react';
import { useMediaQuery } from '../utils/useMediaQuery';
interface Props {
  className: string;
  label: string;
  close: () => void;
  children: ReactNode;
}
export default function Panel({ className, label, close, children }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)');
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobile]);
  return mobile ? (
    <dialog
      ref={ref}
      className={`${className} fullscreen-panel`}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      {children}
    </dialog>
  ) : (
    <aside className={className} aria-label={label}>
      {children}
    </aside>
  );
}

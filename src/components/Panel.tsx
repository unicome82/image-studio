import { useEffect, useRef, type ReactNode } from 'react';
import { useMediaQuery } from '../utils/useMediaQuery';
interface Props {
  className: string;
  label: string;
  close: () => void;
  children: ReactNode;
  fullscreen?: boolean;
  drawer?: boolean;
  closing?: boolean;
  closed?: () => void;
}
export default function Panel({
  className,
  label,
  close,
  children,
  fullscreen = false,
  drawer = false,
  closing = false,
  closed,
}: Props) {
  const mobile = useMediaQuery('(max-width: 600px)');
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!mobile && !fullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobile, fullscreen]);
  return mobile || fullscreen ? (
    <dialog
      ref={ref}
      className={`${className} fullscreen-panel${drawer ? ' drawer-panel' : ''}${closing ? ' closing' : ''}`}
      aria-label={label}
      onAnimationEnd={(event) => {
        if (
          closing &&
          event.target === event.currentTarget &&
          event.animationName === 'filter-slide-out'
        )
          closed?.();
      }}
      onClick={(event) => {
        if (!drawer || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          close();
      }}
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

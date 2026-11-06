import { useEffect, useRef, type ReactNode, type PointerEvent } from 'react';
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
  const swipe = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  function finishSwipe(event: PointerEvent<HTMLDialogElement>, cancelled = false) {
    const gesture = swipe.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    swipe.current = null;
    const panel = event.currentTarget;
    const distance = Math.min(0, event.clientX - gesture.x);
    if (gesture.dragging) {
      suppressClick.current = true;
      panel.removeAttribute('data-dragging');
      panel.style.removeProperty('--drawer-drag-x');
      if (!cancelled && -distance >= Math.max(64, panel.clientWidth * 0.22)) {
        panel.style.setProperty('--drawer-close-start', `${distance}px`);
        close();
      }
    }
    if (panel.hasPointerCapture(event.pointerId)) panel.releasePointerCapture(event.pointerId);
  }
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
      onPointerDown={(event) => {
        if (!mobile || !drawer || closing || !event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        if (
          (event.target as Element).closest(
            'input, textarea, select, .filter-summary, [role="slider"]',
          )
        )
          return;
        swipe.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          dragging: false,
        };
      }}
      onPointerMove={(event) => {
        const gesture = swipe.current;
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        if (!gesture.dragging) {
          if (Math.abs(dy) > 12 && Math.abs(dy) >= Math.abs(dx)) {
            swipe.current = null;
            return;
          }
          if (dx >= -12 || -dx < Math.abs(dy) * 1.2) return;
          gesture.dragging = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.setAttribute('data-dragging', '');
        }
        event.preventDefault();
        event.currentTarget.style.setProperty('--drawer-drag-x', `${Math.min(0, dx)}px`);
      }}
      onPointerUp={(event) => finishSwipe(event)}
      onPointerCancel={(event) => finishSwipe(event, true)}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      }}
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

import { useEffect, useRef } from 'react';

/** Lets a hidden-scrollbar row scroll sideways with a vertical mouse wheel or a mouse drag. */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = element.scrollWidth - element.clientWidth;
      const next = element.scrollLeft + event.deltaY;
      // Hand the wheel back to the page once the row has nowhere left to go.
      if (max <= 0 || (event.deltaY < 0 && element.scrollLeft <= 0)) return;
      if (event.deltaY > 0 && element.scrollLeft >= max) return;
      event.preventDefault();
      element.scrollLeft = Math.min(max, Math.max(0, next));
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if (element.scrollWidth <= element.clientWidth) return;
      const startX = event.clientX;
      const startLeft = element.scrollLeft;
      const move = (moveEvent: PointerEvent) => {
        element.scrollLeft = startLeft - (moveEvent.clientX - startX);
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      };
      event.preventDefault();
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', down);
    return () => {
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('pointerdown', down);
    };
  }, []);
  return ref;
}

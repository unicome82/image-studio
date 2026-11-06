import { useEffect, useRef } from 'react';

/** Keep native touch scrolling and keyboard clicks; add mouse drag and vertical wheel scrolling. */
export function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let drag: { id: number; x: number; scroll: number; moved: boolean } | null = null;
    let suppressClick = false;
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || element!.scrollWidth <= element!.clientWidth) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const pixels =
        delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element!.clientWidth : 1);
      const previous = element!.scrollLeft;
      element!.scrollLeft += pixels;
      if (element!.scrollLeft !== previous) event.preventDefault();
    }
    function down(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      suppressClick = false;
      drag = { id: event.pointerId, x: event.clientX, scroll: element!.scrollLeft, moved: false };
    }
    function move(event: PointerEvent) {
      if (!drag || drag.id !== event.pointerId) return;
      const distance = event.clientX - drag.x;
      if (!drag.moved && Math.abs(distance) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        element!.setPointerCapture(event.pointerId);
        element!.classList.add('dragging');
      }
      element!.scrollLeft = drag.scroll - distance;
      event.preventDefault();
    }
    function end(event: PointerEvent) {
      if (!drag || drag.id !== event.pointerId) return;
      suppressClick = drag.moved && event.type === 'pointerup';
      drag = null;
      element!.classList.remove('dragging');
      if (element!.hasPointerCapture(event.pointerId))
        element!.releasePointerCapture(event.pointerId);
    }
    function click(event: MouseEvent) {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
    element.addEventListener('lostpointercapture', end);
    element.addEventListener('click', click, true);
    return () => {
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      element.removeEventListener('pointercancel', end);
      element.removeEventListener('lostpointercapture', end);
      element.removeEventListener('click', click, true);
      element.classList.remove('dragging');
    };
  }, []);
  return ref;
}

import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
export const builderMinWidth = 220;
export const builderMaxWidth = 420;
export default function ResizeHandle({
  width,
  resize,
}: {
  width: number;
  resize: (width: number) => void;
}) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, width });
  const clamp = (value: number) =>
    Math.min(builderMaxWidth, Math.max(builderMinWidth, Math.round(value)));
  useEffect(() => {
    if (!dragging) return;
    const cursor = document.body.style.cursor;
    const selection = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = cursor;
      document.body.style.userSelect = selection;
    };
  }, [dragging]);
  return (
    <div
      className={'builder-resize ' + (dragging ? 'dragging' : '')}
      role="separator"
      aria-label={t('Resize Builder')}
      aria-orientation="vertical"
      aria-valuemin={builderMinWidth}
      aria-valuemax={builderMaxWidth}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        start.current = { x: e.clientX, width };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          resize(clamp(start.current.width + e.clientX - start.current.x));
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
        setDragging(false);
      }}
      onPointerCancel={() => setDragging(false)}
      onLostPointerCapture={() => setDragging(false)}
      onKeyDown={(e) => {
        const next =
          e.key === 'ArrowLeft'
            ? width - 10
            : e.key === 'ArrowRight'
              ? width + 10
              : e.key === 'Home'
                ? builderMinWidth
                : e.key === 'End'
                  ? builderMaxWidth
                  : undefined;
        if (next !== undefined) {
          e.preventDefault();
          resize(clamp(next));
        }
      }}
    />
  );
}

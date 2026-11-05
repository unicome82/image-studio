import { useTranslation } from 'react-i18next';
import './ImagePreview.scss';
import Icon from './Icon';
import { imageName } from '../utils/imageName';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface PreviewImage {
  fileName?: string;
  index?: number;
  width: number;
  height: number;
  color: string;
  label: string;
}
export const minZoom = 1;
export const maxZoom = 4;
export function clampZoom(value: number) {
  return Math.max(minZoom, Math.min(maxZoom, value));
}
export default function ImagePreview({ image, close }: { image: PreviewImage; close: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const points = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ distance: 0, zoom: 1 });
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  function changeZoom(value: number) {
    const next = clampZoom(value);
    zoomRef.current = next;
    setZoom(next);
  }
  function distance() {
    const [a, b] = [...points.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }
  function resetGesture() {
    gesture.current = { distance: distance(), zoom: zoomRef.current };
  }
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = ref.current;
    dialog?.showModal();
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
      window.removeEventListener('resize', resize);
    };
  }, []);
  useEffect(() => {
    const el = stage.current;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      changeZoom(zoomRef.current * Math.exp(-e.deltaY * 0.002));
    };
    el?.addEventListener('wheel', wheel, { passive: false });
    return () => el?.removeEventListener('wheel', wheel);
  }, []);
  const ratio = image.width / image.height;
  const width = Math.min(
    Math.max(1, viewport.width - 32),
    Math.max(1, viewport.height - 32) * ratio,
  );
  return createPortal(
    <dialog
      ref={ref}
      className="image-viewer"
      aria-label={t('Image preview')}
      data-zoom={zoom}
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
      onKeyDown={(e) => {
        if (['+', '=', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          changeZoom(zoomRef.current + 0.25);
        } else if (['-', '_', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
          changeZoom(zoomRef.current - 0.25);
        } else if (e.key === '0') {
          e.preventDefault();
          changeZoom(1);
        }
      }}
    >
      <div
        ref={stage}
        className="image-viewer-stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className="image-viewer-image"
          role="img"
          aria-label={imageName(image)}
          tabIndex={0}
          aria-description={t(
            'Scroll or pinch to zoom from 1 to 4 times; double-click or press 0 to reset.',
          )}
          style={{
            width,
            height: width / ratio,
            backgroundColor: image.color,
            transform: `scale(${zoom})`,
          }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={() => changeZoom(1)}
          onPointerDown={(e) => {
            if (e.pointerType !== 'touch') return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            resetGesture();
          }}
          onPointerMove={(e) => {
            if (!points.current.has(e.pointerId)) return;
            points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (points.current.size > 1 && gesture.current.distance > 0)
              changeZoom((gesture.current.zoom * distance()) / gesture.current.distance);
          }}
          onPointerUp={(e) => {
            points.current.delete(e.pointerId);
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
            resetGesture();
          }}
          onPointerCancel={(e) => {
            points.current.delete(e.pointerId);
            resetGesture();
          }}
          onLostPointerCapture={(e) => {
            points.current.delete(e.pointerId);
            resetGesture();
          }}
        />
      </div>
      <button className="image-viewer-close" aria-label={t('Close image preview')} onClick={close}>
        <Icon name="close" size={40} weight={200} />
      </button>
    </dialog>,
    document.body,
  );
}

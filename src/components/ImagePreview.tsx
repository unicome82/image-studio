import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { imageName } from '../utils/imageName';
import { imageStyle } from '../utils/sampleImages';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface PreviewImage {
  fileName?: string;
  index?: number;
  width: number;
  height: number;
  color: string;
  src?: string;
  thumb?: string;
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const points = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ distance: 0, zoom: 1 });
  // One pointer drags a zoomed image; the start point and offset anchor the move.
  const pan = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const ratio = image.width / image.height;
  const width = Math.min(
    Math.max(1, viewport.width - 32),
    Math.max(1, viewport.height - 32) * ratio,
  );
  const size = useRef({ width, height: width / ratio, viewport });
  size.current = { width, height: width / ratio, viewport };
  // The image edge never moves inside the screen edge, and an unzoomed image stays centered.
  function moveTo(x: number, y: number, scale = zoomRef.current) {
    const { width: w, height: h, viewport: v } = size.current;
    const limitX = Math.max(0, (w * scale - v.width) / 2);
    const limitY = Math.max(0, (h * scale - v.height) / 2);
    const next = {
      x: Math.max(-limitX, Math.min(limitX, x)),
      y: Math.max(-limitY, Math.min(limitY, y)),
    };
    offsetRef.current = next;
    setOffset(next);
  }
  function changeZoom(value: number) {
    const next = clampZoom(value);
    zoomRef.current = next;
    setZoom(next);
    moveTo(offsetRef.current.x, offsetRef.current.y, next);
  }
  function startPan() {
    const [point] = [...points.current.values()];
    pan.current =
      points.current.size === 1 && point
        ? { x: point.x, y: point.y, offset: offsetRef.current }
        : null;
  }
  function distance() {
    const [a, b] = [...points.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }
  function resetGesture() {
    gesture.current = { distance: distance(), zoom: zoomRef.current };
    startPan();
  }
  function releasePointer(id: number) {
    points.current.delete(id);
    resetGesture();
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
  function downloadImage() {
    // Generated images download as their original file; color samples export at their native size.
    if (image.src) {
      const link = document.createElement('a');
      link.href = image.src;
      link.download = imageName(image);
      document.body.append(link);
      link.click();
      link.remove();
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = image.color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageName(image)
        .replace(/\.[^.]+$/, '')
        .replace(/[<>:"/\\|?*]/g, '_')}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, 'image/png');
  }
  useEffect(() => {
    moveTo(offsetRef.current.x, offsetRef.current.y);
  }, [viewport]);
  return createPortal(
    <dialog
      ref={ref}
      className="image-viewer"
      aria-label={t('Image preview')}
      data-zoom={zoom}
      data-panning={zoom > 1 || undefined}
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
            'Scroll or pinch to zoom from 1 to 4 times and drag to move; double-click or press 0 to reset.',
          )}
          style={{
            width,
            height: width / ratio,
            ...imageStyle(image),
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={() => changeZoom(1)}
          onPointerDown={(e) => {
            // Touch always tracks for pinch; a mouse drags only once the image is zoomed.
            if (e.pointerType !== 'touch' && (e.button !== 0 || zoomRef.current <= 1)) return;
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
            else if (pan.current && zoomRef.current > 1)
              moveTo(
                pan.current.offset.x + e.clientX - pan.current.x,
                pan.current.offset.y + e.clientY - pan.current.y,
              );
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
            releasePointer(e.pointerId);
          }}
          onPointerCancel={(e) => releasePointer(e.pointerId)}
          onLostPointerCapture={(e) => releasePointer(e.pointerId)}
        />
      </div>
      <button
        type="button"
        className="image-viewer-download"
        aria-label={t('Download sample PNG')}
        title={t('Download sample PNG')}
        onClick={downloadImage}
      >
        <Icon name="download" size="32" className="w200" />
      </button>
      <button
        className="image-viewer-close close-button"
        aria-label={t('Close image preview')}
        onClick={close}
      >
        <Icon name="close" size="32" className="w200" />
      </button>
    </dialog>,
    document.body,
  );
}

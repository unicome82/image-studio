import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function OptionSummary({
  labels,
  fallback,
}: {
  labels: string[];
  fallback: string;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(labels.length);
  const labelsKey = JSON.stringify(labels);
  useLayoutEffect(() => {
    const row = ref.current;
    const probe = measureRef.current;
    if (!row || !probe) return;
    let active = true;
    const values = (JSON.parse(labelsKey) as string[]).map((label) => `#${label}`);
    const measure = () => {
      if (!active) return;
      const style = getComputedStyle(row);
      const width =
        row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (width <= 0) return;
      let count = values.length;
      for (; count > 1; count--) {
        const remaining = values.length - count;
        probe.textContent =
          values.slice(0, count).join(', ') +
          (remaining ? ' ' + t('and {{count}} more', { count: remaining }) : '');
        if (probe.getBoundingClientRect().width <= width) break;
      }
      setVisible(count);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    measure();
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener('loadingdone', measure);
    return () => {
      active = false;
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', measure);
    };
  }, [labelsKey, t]);
  const count = Math.min(visible, labels.length);
  const remaining = labels.length - count;
  const tags = labels.map((label) => `#${label}`);
  return (
    <p className="option-summary" ref={ref} title={tags.length ? tags.join(', ') : `#${fallback}`}>
      <span className="option-summary-values">
        {tags.length ? tags.slice(0, count).join(', ') : `#${fallback}`}
      </span>
      {remaining > 0 && (
        <span className="option-summary-more">
          {' ' + t('and {{count}} more', { count: remaining })}
        </span>
      )}
      <span className="option-summary-measure" ref={measureRef} aria-hidden="true" />
    </p>
  );
}

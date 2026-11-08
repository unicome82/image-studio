import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

export default function SelectionSummary({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const id = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const content = contentRef.current;
    if (!content || expanded) return;
    const check = () => setOverflowing(content.scrollWidth > content.clientWidth);
    const observer = new ResizeObserver(check);
    observer.observe(content);
    if (content.firstElementChild) observer.observe(content.firstElementChild);
    check();
    return () => observer.disconnect();
  }, [expanded, children]);
  return (
    <section
      className={
        'selection-summary' +
        (expanded ? '' : ' collapsed') +
        (expanded || overflowing ? ' overflowing' : '')
      }
      aria-label={label}
    >
      <div id={id} ref={contentRef} className="selection-summary-content">
        {children}
      </div>
      <button
        className="choice-toggle"
        aria-label={t(expanded ? 'Collapse {{title}} section' : 'Expand {{title}} section', {
          title: label,
        })}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon name="more_horiz" size="20" />
      </button>
    </section>
  );
}

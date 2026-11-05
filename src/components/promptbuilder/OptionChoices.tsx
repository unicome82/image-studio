import './OptionChoices.scss';
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
interface Choice {
  id: string;
  label: string;
}
interface Props {
  title: string;
  headerControl?: ReactNode;
  disabledHint?: string;
  options: Choice[];
  selected: string[];
  choose: (id: string) => void;
  disabled?: boolean;
}
export default function OptionChoices({
  title,
  options,
  selected,
  choose,
  disabled = false,
  headerControl,
  disabledHint,
}: Props) {
  const rowId = useId();
  const [expanded, setExpanded] = useState(false);
  const [count, setCount] = useState(options.length);
  const row = useRef<HTMLDivElement>(null);
  const measures = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    function measure() {
      if (!row.current || !measures.current) return;
      const width = row.current.clientWidth;
      const gap = parseFloat(getComputedStyle(row.current).columnGap) || 0;
      const widths = Array.from(
        measures.current.querySelectorAll<HTMLElement>('[data-choice]'),
      ).map((el) => el.getBoundingClientRect().width);
      const toggleWidth = measures.current
        .querySelector<HTMLElement>('[data-toggle]')!
        .getBoundingClientRect().width;
      if (
        widths.reduce((total, value) => total + value, 0) + Math.max(0, widths.length - 1) * gap <=
        width
      ) {
        setCount(widths.length);
        return;
      }
      let used = 0,
        fit = 0;
      for (const value of widths) {
        const next = used + (fit ? gap : 0) + value;
        if (next + gap + toggleWidth > width) break;
        used = next;
        fit++;
      }
      setCount(fit);
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (row.current) observer.observe(row.current);
    let active = true;
    document.fonts.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [options]);
  const overflow = count < options.length;
  return (
    <>
      <h3 className="option-heading" aria-label={title}>
        {title}
        {headerControl && <span className="option-heading-actions">{headerControl}</span>}
      </h3>
      <div className="option-choices" title={disabled ? disabledHint : undefined}>
        <div
          id={rowId}
          className={'pills choice-row ' + (expanded ? 'expanded' : 'collapsed')}
          ref={row}
        >
          {(expanded ? options : options.slice(0, count)).map((option) => (
            <button
              className="option-choice"
              key={option.id}
              aria-pressed={selected.includes(option.id)}
              disabled={disabled}
              onClick={() => choose(option.id)}
            >
              {option.label.replace(/\s+illustration\b/gi, '')}
            </button>
          ))}
          {overflow && (
            <button
              className="choice-toggle"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title} options`}
              aria-expanded={expanded}
              aria-controls={rowId}
              onClick={() => setExpanded(!expanded)}
            >
              …
            </button>
          )}
        </div>
        <div className="option-measurements" aria-hidden="true">
          <div className="pills" ref={measures}>
            {options.map((option) => (
              <span className="option-choice" data-choice key={option.id}>
                {option.label.replace(/\s+illustration\b/gi, '')}
              </span>
            ))}
            <span className="choice-toggle" data-toggle>
              …
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

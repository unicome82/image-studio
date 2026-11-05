import { useTranslation } from 'react-i18next';
import './OptionChoices.scss';
import { prioritizeSelectedOptions } from '../../utils/optionChoices';
import Icon from '../Icon';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
interface Choice {
  id: string;
  label: string;
}
interface Props {
  title: string;
  headerControl?: ReactNode;
  afterHeading?: ReactNode;
  showOptions?: boolean;
  collapsible?: boolean;
  multiple?: boolean;
  options: Choice[];
  selected: string[];
  choose: (id: string) => void;
}
export default function OptionChoices({
  title,
  options,
  selected,
  choose,
  headerControl,
  afterHeading,
  showOptions = true,
  collapsible = true,
  multiple = true,
}: Props) {
  const { t } = useTranslation();
  const orderedOptions = useMemo(
    () => prioritizeSelectedOptions(options, selected, multiple),
    [options, selected, multiple],
  );
  const rowId = useId();
  const [expanded, setExpanded] = useState(false);
  const mobile = useMediaQuery('(max-width: 600px)');
  const isExpanded = mobile || !collapsible || expanded;
  const row = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    left: number;
    target: HTMLElement;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const element = row.current;
    if (!element || isExpanded || !showOptions) return;
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey || !element) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      const next = Math.max(
        0,
        Math.min(element.scrollWidth - element.clientWidth, element.scrollLeft + delta * unit),
      );
      if (next === element.scrollLeft) return;
      event.preventDefault();
      element.scrollLeft = next;
    }
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [isExpanded, showOptions]);
  return (
    <>
      <h3 className="option-heading" aria-label={t(title)}>
        {t(title)}
        {headerControl && <span className="option-heading-actions">{headerControl}</span>}
        {!mobile && collapsible && showOptions && options.length > 0 && (
          <button
            className="choice-toggle"
            aria-label={t(expanded ? 'Collapse {{title}} options' : 'Expand {{title}} options', {
              title: t(title),
            })}
            aria-expanded={expanded}
            aria-controls={rowId}
            onClick={() => setExpanded(!expanded)}
          >
            <Icon name={expanded ? 'expand_less' : 'expand_more'} size={16} />
          </button>
        )}
      </h3>
      {afterHeading}
      {showOptions && (
        <div className="option-choices">
          <div
            ref={row}
            id={rowId}
            role="group"
            aria-label={t(title)}
            tabIndex={isExpanded ? undefined : 0}
            className={
              'pills choice-row ' +
              (isExpanded ? 'expanded' : 'collapsed') +
              (dragging ? ' dragging' : '')
            }
            onPointerDown={(event) => {
              if (isExpanded || event.pointerType !== 'mouse' || event.button !== 0) return;
              suppressClick.current = false;
              const target = event.target as HTMLElement;
              target.setPointerCapture(event.pointerId);
              drag.current = {
                id: event.pointerId,
                x: event.clientX,
                left: event.currentTarget.scrollLeft,
                target,
                moved: false,
              };
            }}
            onPointerMove={(event) => {
              const current = drag.current;
              if (!current || current.id !== event.pointerId) return;
              const distance = event.clientX - current.x;
              if (!current.moved && Math.abs(distance) < 4) return;
              current.moved = true;
              suppressClick.current = true;
              setDragging(true);
              event.preventDefault();
              event.currentTarget.scrollLeft = current.left - distance;
            }}
            onPointerUp={(event) => {
              const current = drag.current;
              if (!current || current.id !== event.pointerId) return;
              drag.current = null;
              setDragging(false);
              if (current.target.hasPointerCapture(event.pointerId))
                current.target.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => {
              drag.current = null;
              suppressClick.current = false;
              setDragging(false);
            }}
            onLostPointerCapture={() => {
              drag.current = null;
              setDragging(false);
            }}
            onClickCapture={(event) => {
              if (suppressClick.current) {
                event.preventDefault();
                event.stopPropagation();
                suppressClick.current = false;
              }
            }}
            onKeyDownCapture={() => {
              suppressClick.current = false;
            }}
          >
            {orderedOptions.map((option) => (
              <button
                className="option-choice"
                key={option.id}
                aria-pressed={selected.includes(option.id)}
                onClick={() => choose(option.id)}
              >
                {t(option.label.replace(/\s+illustration\b/gi, ''))}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

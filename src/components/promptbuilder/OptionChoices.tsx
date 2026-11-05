import { useTranslation } from 'react-i18next';
import './OptionChoices.scss';
import { prioritizeSelectedOptions } from '../../utils/optionChoices';
import Icon from '../Icon';
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
  const isExpanded = !collapsible || expanded;
  const row = useRef<HTMLDivElement>(null);
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
        {collapsible && showOptions && options.length > 0 && (
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
            className={'pills choice-row ' + (isExpanded ? 'expanded' : 'collapsed')}
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

import { useTranslation } from 'react-i18next';
import './OptionChoices.scss';
import { prioritizeSelectedOptions } from '../../utils/optionChoices';
import Icon from '../Icon';
import { useId, useMemo, useState, type ReactNode } from 'react';
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

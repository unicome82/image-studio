import { useTranslation } from 'react-i18next';
import { optionLabelKey, prioritizeSelectedOptions } from '../../utils/optionChoices';
import Icon from '../Icon';
import OptionSummary from './OptionSummary';
import { useId, useMemo, useState, type ReactNode } from 'react';
interface Choice {
  id: string;
  label: string;
  category?: string;
}
interface Props {
  title: string;
  headerControl?: ReactNode;
  afterHeading?: ReactNode;
  showOptions?: boolean;
  collapsible?: boolean;
  multiple?: boolean;
  allIsUnfiltered?: boolean;
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
  allIsUnfiltered = false,
}: Props) {
  const { t } = useTranslation();
  const orderedOptions = useMemo(
    () => prioritizeSelectedOptions(options, selected, multiple),
    [options, selected, multiple],
  );
  const rowId = useId();
  const [expanded, setExpanded] = useState(true);
  const isExpanded = !collapsible || expanded;
  const canCollapse = collapsible && showOptions && options.length > 0;
  const label = (option: Choice) => t(optionLabelKey(option));
  const labels = options.filter((option) => selected.includes(option.id)).map(label);
  const unfiltered = allIsUnfiltered && (labels.length === 0 || labels.length === options.length);
  return (
    <>
      <h3 className="option-heading" aria-label={t(title)}>
        {canCollapse ? (
          <button
            className="option-heading-label"
            aria-expanded={expanded}
            aria-controls={rowId}
            onClick={() => setExpanded(!expanded)}
          >
            {t(title)}
          </button>
        ) : (
          t(title)
        )}
        {headerControl && <span className="option-heading-actions">{headerControl}</span>}
        {canCollapse && (
          <button
            className="choice-toggle"
            aria-label={t(expanded ? 'Collapse {{title}} options' : 'Expand {{title}} options', {
              title: t(title),
            })}
            aria-expanded={expanded}
            aria-controls={rowId}
            onClick={() => setExpanded(!expanded)}
          >
            <Icon name={expanded ? 'expand_less' : 'expand_more'} size="16" />
          </button>
        )}
      </h3>
      {showOptions && isExpanded && afterHeading}
      {showOptions && (
        <div className="option-choices" id={rowId} role="group" aria-label={t(title)}>
          {isExpanded ? (
            <>
              <div className="option-list">
                {orderedOptions.map((option) => (
                  <button
                    className="option-choice"
                    key={option.id}
                    aria-pressed={selected.includes(option.id)}
                    onClick={() => choose(option.id)}
                  >
                    {label(option)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <OptionSummary
              labels={unfiltered ? [] : labels}
              fallback={t(unfiltered ? 'All' : 'None selected')}
            />
          )}
        </div>
      )}
    </>
  );
}

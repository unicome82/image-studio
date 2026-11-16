import { useTranslation } from 'react-i18next';
import { optionLabelKey } from '../../utils/optionChoices';
import Icon from '../Icon';
import OptionSummary from './OptionSummary';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
interface Choice {
  id: string;
  label: string;
  category?: string;
}
interface Props {
  title: string;
  headerControl?: ReactNode;
  /** Catalog category whose option definitions open from a help button beside the title. */
  helpCategory?: string;
  afterHeading?: ReactNode;
  showOptions?: boolean;
  collapsible?: boolean;
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
  helpCategory,
  afterHeading,
  showOptions = true,
  collapsible = true,
  allIsUnfiltered = false,
}: Props) {
  const { t } = useTranslation();
  const rowId = useId();
  const [expanded, setExpanded] = useState(true);
  const isExpanded = !collapsible || expanded;
  const canCollapse = collapsible && showOptions && options.length > 0;
  const label = (option: Choice) => t(optionLabelKey(option));
  const labels = options.filter((option) => selected.includes(option.id)).map(label);
  const helpId = useId();
  const helpRef = useRef<HTMLSpanElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    if (!helpOpen) return;
    const outside = (event: PointerEvent) => {
      if (!helpRef.current?.contains(event.target as Node)) setHelpOpen(false);
    };
    // Capture Escape before the dialog so it closes the definitions, not the Builder.
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setHelpOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape, true);
    };
  }, [helpOpen]);
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
        {helpCategory && (
          <span
            className="option-heading-actions option-help"
            ref={helpRef}
            onPointerEnter={(event) => event.pointerType === 'mouse' && setHelpOpen(true)}
            onPointerLeave={(event) => event.pointerType === 'mouse' && setHelpOpen(false)}
          >
            <button
              className="option-help-button"
              aria-label={t('Show {{title}} definitions', { title: t(title) })}
              aria-expanded={helpOpen}
              aria-controls={helpId}
              onClick={() => setHelpOpen(!helpOpen)}
            >
              <Icon name="help" size="14" className="w200" />
            </button>
            {helpOpen && (
              <table className="option-help-popup" id={helpId} role="tooltip">
                <tbody>
                  {options.map((option) => (
                    <tr key={option.id}>
                      <th scope="row">{label(option)}</th>
                      <td>{t(`Help ${helpCategory} ${option.id}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </span>
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
                {options.map((option) => (
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

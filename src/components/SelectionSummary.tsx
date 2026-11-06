import { useId, useState, type ReactNode } from 'react';
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
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={'selection-summary' + (expanded ? '' : ' collapsed')} aria-label={label}>
      <div id={id} className="selection-summary-content">
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

import { useId, useState, type TextareaHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

export default function ExpandableTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { t } = useTranslation();
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={'expandable-textarea' + (expanded ? ' expanded' : '')}>
      <textarea
        {...props}
        id={id}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.key === 'Escape' && expanded) {
            event.preventDefault();
            event.stopPropagation();
            setExpanded(false);
          }
        }}
      />
      <button
        type="button"
        className="icon-button textarea-size-toggle"
        aria-label={t(expanded ? 'Collapse text area' : 'Expand text area')}
        title={t(expanded ? 'Collapse text area' : 'Expand text area')}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon name={expanded ? 'fullscreen_exit' : 'fullscreen'} size="24" />
      </button>
    </div>
  );
}

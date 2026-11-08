import { useDragScroll } from '../../utils/useDragScroll';

export default function OptionSummary({
  labels,
  fallback,
}: {
  labels: string[];
  fallback: string;
}) {
  const tags = labels.length ? labels : [fallback];
  const valuesRef = useDragScroll<HTMLSpanElement>();
  return (
    <p className="option-summary" title={tags.join(', ')}>
      <span className="option-summary-values" ref={valuesRef}>
        {tags.map((tag, index) => (
          <span key={`${index}-${tag}`}>{tag}</span>
        ))}
      </span>
    </p>
  );
}

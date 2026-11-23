import { useDragScroll } from '../../utils/useDragScroll';

// Collapsed options show their chosen values in the heading row, right after the title.
export default function OptionSummary({
  id,
  labels,
  fallback,
}: {
  id?: string;
  labels: string[];
  fallback: string;
}) {
  const tags = labels.length ? labels : [fallback];
  const valuesRef = useDragScroll<HTMLSpanElement>();
  return (
    <span className="option-summary" id={id} title={tags.join(', ')}>
      <span className="option-summary-values" ref={valuesRef}>
        {tags.map((tag, index) => (
          <span key={`${index}-${tag}`}>{tag}</span>
        ))}
      </span>
    </span>
  );
}

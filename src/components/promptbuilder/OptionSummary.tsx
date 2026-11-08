export default function OptionSummary({
  labels,
  fallback,
}: {
  labels: string[];
  fallback: string;
}) {
  const tags = labels.length ? labels : [fallback];
  return (
    <p className="option-summary" title={tags.join(', ')}>
      <span className="option-summary-values">
        {tags.map((tag, index) => (
          <span key={`${index}-${tag}`}>{tag}</span>
        ))}
      </span>
    </p>
  );
}

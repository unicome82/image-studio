export default function OptionSummary({
  labels,
  fallback,
}: {
  labels: string[];
  fallback: string;
}) {
  const summary = labels.length ? labels.map((label) => `#${label}`).join(', ') : `#${fallback}`;
  return (
    <p className="option-summary" title={summary}>
      <span className="option-summary-values">{summary}</span>
    </p>
  );
}

export default function Logo() {
  return (
    <svg className="brand-logo" viewBox="376 446 550 440" aria-hidden="true" focusable="false">
      <defs>
        <mask id="brand-logo-mask">
          <rect x="360" y="320" width="584" height="584" fill="#fff" />
          <circle cx="692" cy="570" r="48" />
          <path d="M428 758Q428 742 439 731L524 646Q540 630 556 646L632 722Q648 738 664 722L692 694Q708 678 724 694L753 723Q764 734 764 750V782A52 52 0 0 1 712 834H480A52 52 0 0 1 428 782Z" />
        </mask>
      </defs>
      <g fill="currentColor">
        <rect x="376" y="446" width="440" height="440" rx="104" mask="url(#brand-logo-mask)" />
        <path d="M840 336Q852 400 930 425Q852 450 840 514Q828 450 750 425Q828 400 840 336Z" />
      </g>
    </svg>
  );
}

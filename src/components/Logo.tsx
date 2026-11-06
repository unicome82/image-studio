export default function Logo() {
  return (
    <svg className="brand-logo" viewBox="360 320 584 584" aria-hidden="true" focusable="false">
      <defs>
        <mask id="brand-logo-mask">
          <rect x="360" y="320" width="584" height="584" fill="#fff" />
          <circle cx="692" cy="570" r="48" />
          <path d="M416 770Q416 754 427 743L524 646Q540 630 556 646L632 722Q648 738 664 722L692 694Q708 678 724 694L765 735Q776 746 776 762V782A64 64 0 0 1 712 846H480A64 64 0 0 1 416 782Z" />
        </mask>
      </defs>
      <g fill="currentColor">
        <rect x="376" y="446" width="440" height="440" rx="104" mask="url(#brand-logo-mask)" />
        <path d="M840 336Q852 400 930 425Q852 450 840 514Q828 450 750 425Q828 400 840 336Z" />
      </g>
    </svg>
  );
}

export default function Logo() {
  return (
    <svg className="brand-logo" viewBox="360 324 584 576" aria-hidden="true" focusable="false">
      <defs>
        <mask id="brand-logo-mask">
          <rect x="360" y="324" width="584" height="576" fill="#fff" />
          <circle cx="697" cy="580" r="48" />
          <path d="M418 744 520 636Q540 616 560 636L643 722 686 678Q702 662 718 678L772 734Q790 754 778 776Q762 806 728 806H462Q428 806 412 776Q400 756 418 744Z" />
        </mask>
      </defs>
      <g fill="currentColor">
        <rect x="375" y="452" width="442" height="433" rx="105" mask="url(#brand-logo-mask)" />
        <path d="M840 336Q852 400 930 425Q852 450 840 514Q828 450 750 425Q828 400 840 336Z" />
      </g>
    </svg>
  );
}

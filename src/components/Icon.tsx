import './Icon.scss';
export type IconName =
  | 'favorite'
  | 'star'
  | 'language'
  | 'bookmark'
  | 'content_copy'
  | 'close'
  | 'cloud_upload'
  | 'auto_awesome'
  | 'search'
  | 'check'
  | 'fullscreen'
  | 'format_list_bulleted'
  | 'save'
  | 'edit'
  | 'delete'
  | 'more_horiz'
  | 'expand_less'
  | 'expand_more';
interface Props {
  name: IconName;
  size?: number;
  className?: string;
  fill?: boolean;
  weight?: number;
}
/** Google Material Symbols Outlined, loaded through the jsDelivr CDN. */
export default function Icon({
  name,
  size = 18,
  className = '',
  fill = false,
  weight = 400,
}: Props) {
  const pixelSize = Math.max(2, Math.round(size / 2) * 2);
  return (
    <span
      className={`material-symbol ${className}`.trim()}
      data-icon={name}
      {...(fill ? { fill: '' } : {})}
      style={{ fontSize: pixelSize, width: pixelSize, height: pixelSize, fontWeight: weight }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

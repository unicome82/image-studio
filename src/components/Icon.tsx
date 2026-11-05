import './Icon.scss';
export type IconName =
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
  | 'expand_less';
interface Props {
  name: IconName;
  size?: number;
  className?: string;
  fill?: boolean;
}
/** Google Material Symbols Outlined, loaded through the jsDelivr CDN. */
export default function Icon({ name, size = 18, className = '', fill = false }: Props) {
  return (
    <span
      className={`material-symbol ${className}`.trim()}
      data-icon={name}
      {...(fill ? { fill: '' } : {})}
      style={{ fontSize: size, width: size, height: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

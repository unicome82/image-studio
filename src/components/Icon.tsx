export type IconName =
  | 'grid_view'
  | 'view_agenda'
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
  | 'fullscreen_exit'
  | 'format_list_bulleted'
  | 'save'
  | 'edit'
  | 'delete'
  | 'more_horiz'
  | 'expand_less'
  | 'expand_more';
export type IconSize = `${12 | 14 | 16 | 18 | 20 | 22 | 24 | 28 | 32 | 36}`;
interface Props {
  name: IconName;
  size?: IconSize;
  className?: string;
}
/** Size is an HTML attribute; weight and fill are CSS classes, with no inline dimensions. */
export default function Icon({ name, size = '20', className = '' }: Props) {
  return (
    <span
      {...{ size }}
      className={`material-symbol ${className}`.trim()}
      data-icon={name}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

import symbols from '../assets/material-symbols.svg?no-inline';
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
  | 'delete';
interface Props {
  name: IconName;
  size?: number;
  className?: string;
}
/** Local Google Material Symbols SVG; never loads a remote stylesheet or icon font. */
export default function Icon({ name, size = 18, className = '' }: Props) {
  return (
    <svg
      className={`material-symbol ${className}`.trim()}
      data-icon={name}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`${symbols}#${name}`} width={size} height={size} />
    </svg>
  );
}

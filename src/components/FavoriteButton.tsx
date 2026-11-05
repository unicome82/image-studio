import Icon from './Icon';
import './FavoriteButton.scss';
interface Props {
  active: boolean;
  label: string;
  toggle: () => void;
  className?: string;
}
export default function FavoriteButton({ active, label, toggle, className = '' }: Props) {
  return (
    <button
      className={`favorite-button ${className}`.trim()}
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation();
        toggle();
      }}
    >
      <Icon name="favorite" size={24} fill={active} />
    </button>
  );
}

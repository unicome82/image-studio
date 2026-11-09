import { useState } from 'react';
import Icon from './Icon';
import { mobileQuery, useMediaQuery } from '../utils/useMediaQuery';
interface Props {
  active: boolean;
  label: string;
  toggle: () => void;
  className?: string;
}
export default function FavoriteButton({ active, label, toggle, className = '' }: Props) {
  const mobile = useMediaQuery(mobileQuery);
  const [pulse, setPulse] = useState(false);
  return (
    <button
      className={`favorite-button ${className} ${pulse ? 'favorite-pulse' : ''}`.trim()}
      aria-label={label}
      aria-pressed={active}
      onAnimationEnd={() => setPulse(false)}
      onClick={(event) => {
        event.stopPropagation();
        setPulse(!active);
        toggle();
      }}
    >
      <Icon name="favorite" size={mobile ? '28' : '24'} className="fill" />
    </button>
  );
}

import Icon from './Icon';
import './Navigation.scss';
interface Props {
  builder: boolean;
  photo: boolean;
  active: string;
  groups: { id: string; label: string }[];
  toggleBuilder: () => void;
  switchType: (photo: boolean) => void;
  navigate: (id: string) => void;
}
export default function Navigation(p: Props) {
  return (
    <nav className="navigation" aria-label="Gallery navigation">
      <button
        className={'builder-toggle ' + (p.builder ? 'active' : '')}
        aria-label="Toggle Builder"
        aria-pressed={p.builder}
        aria-expanded={p.builder}
        onClick={p.toggleBuilder}
      >
        <Icon name="auto_awesome" size={19} />
      </button>
      <div className="type-tabs" aria-label="Image type">
        <button aria-pressed={!p.photo} onClick={() => p.switchType(false)}>
          Illustration
        </button>
        <button aria-pressed={p.photo} onClick={() => p.switchType(true)}>
          Photo
        </button>
      </div>
      <div className="style-tabs" aria-label="Style filters">
        <button className={p.active === 'all' ? 'active' : ''} onClick={() => p.navigate('all')}>
          All
        </button>
        {p.groups.map((group) => (
          <button
            key={group.id}
            className={p.active === group.id ? 'active' : ''}
            onClick={() => p.navigate(group.id)}
          >
            {group.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

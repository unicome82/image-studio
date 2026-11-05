import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import BuilderSelect from './promptbuilder/BuilderSelect';
import { useMediaQuery } from '../utils/useMediaQuery';
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
  const { t } = useTranslation();
  const mobile = useMediaQuery('(max-width: 600px)');
  return (
    <nav className="navigation" aria-label={t('Gallery navigation')}>
      <button
        className={'builder-toggle ' + (p.builder ? 'active' : '')}
        aria-label={t('Toggle Builder')}
        aria-pressed={p.builder}
        aria-expanded={p.builder}
        onClick={p.toggleBuilder}
      >
        <Icon name="auto_awesome" size={16} fill />
      </button>
      {mobile ? (
        <div className="type-dropdown">
          <BuilderSelect
            label={t('Image type')}
            value={p.photo ? 'photo' : 'illustration'}
            options={[
              { value: 'illustration', label: t('Illustration') },
              { value: 'photo', label: t('Photo') },
            ]}
            change={(value) => p.switchType(value === 'photo')}
          />
        </div>
      ) : (
        <div className="type-tabs" aria-label={t('Image type')}>
          <button aria-pressed={!p.photo} onClick={() => p.switchType(false)}>
            {t('Illustration')}
          </button>
          <button aria-pressed={p.photo} onClick={() => p.switchType(true)}>
            {t('Photo')}
          </button>
        </div>
      )}
      <div className="style-tabs" aria-label={t('Style filters')}>
        <button className={p.active === 'all' ? 'active' : ''} onClick={() => p.navigate('all')}>
          {t('All')}
        </button>
        {p.groups.map((group) => (
          <button
            key={group.id}
            className={p.active === group.id ? 'active' : ''}
            onClick={() => p.navigate(group.id)}
          >
            {t(group.label.replace(/\s+illustration\b/gi, ''))}
          </button>
        ))}
      </div>
    </nav>
  );
}

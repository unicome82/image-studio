import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import BuilderSelect from './promptbuilder/BuilderSelect';
import { useHorizontalScroll } from '../utils/useHorizontalScroll';
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
  const scrollRef = useHorizontalScroll();
  return (
    <nav className="navigation" aria-label={t('Gallery navigation')}>
      <button
        className={'builder-toggle ' + (p.builder ? 'active' : '')}
        aria-label={t('Toggle filters')}
        aria-pressed={p.builder}
        aria-expanded={p.builder}
        onClick={p.toggleBuilder}
      >
        <Icon name="filter_list" size="20" className={p.builder ? 'fill' : ''} />
      </button>
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
      <div ref={scrollRef} className="style-tabs" aria-label={t('Style filters')}>
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

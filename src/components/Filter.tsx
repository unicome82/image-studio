import { useTranslation } from 'react-i18next';
import Panel from './Panel';
import Icon from './Icon';
import OptionChoices from './promptbuilder/OptionChoices';
import ResizeHandle from './promptbuilder/ResizeHandle';
import type { Option, Selection } from '../utils/promptBuilder';
import { filterCategories, type FilterType } from '../utils/filters';
import BuilderSelect from './promptbuilder/BuilderSelect';

interface Props {
  width: number;
  resize: (width: number) => void;
  catalog: Option[];
  filters: Selection;
  type: FilterType;
  setType: (type: FilterType) => void;
  toggle: (category: string, id: string) => void;
  reset: () => void;
  close: () => void;
  compose: () => void;
}

export default function Filter(p: Props) {
  const { t } = useTranslation();
  return (
    <Panel className="builder filter-panel" label={t('Filter')} close={p.close} drawer>
      <ResizeHandle width={p.width} resize={p.resize} />
      <div className="builder-viewport">
        <div className="builder-wrap builder-heading">
          <div className="builder-title filter-type">
            <FilterTypeSelect type={p.type} setType={p.setType} />
            <button
              className="icon-button"
              aria-label={t('Reset filters')}
              title={t('Reset filters')}
              onClick={p.reset}
            >
              <Icon name="restart_alt" size="20" />
            </button>
          </div>
          <div className="builder-mobile-close">
            <button
              className="icon-button close-button"
              aria-label={t('Close filters')}
              onClick={p.close}
            >
              <Icon name="close" size="24" className="w200" />
            </button>
          </div>
        </div>
        <div className="builder-scroll">
          <div className="builder-wrap">
            {filterCategories(p.type).map((category) => (
              <section className="option-section" key={category}>
                <OptionChoices
                  title={
                    category === 'Base Style'
                      ? 'Style'
                      : category === 'Aspect Ratio'
                        ? 'Aspect ratio'
                        : category
                  }
                  options={p.catalog
                    .filter((option) => option.category === category)
                    .map((option) => ({
                      id: option.id,
                      label: option.label.replace(' Modern', ''),
                    }))}
                  selected={p.filters[category] ?? []}
                  choose={(id) => p.toggle(category, id)}
                />
              </section>
            ))}
          </div>
        </div>
        <div className="builder-footer">
          <div className="builder-wrap">
            <button className="primary generate-prompt" onClick={p.compose}>
              <Icon name="auto_awesome" size="20" className="fill" />
              {t('Generate prompt')}
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function FilterTypeSelect({ type, setType }: Pick<Props, 'type' | 'setType'>) {
  const { t } = useTranslation();
  return (
    <BuilderSelect
      className="filter-type-select"
      label={t('Image type')}
      value={type}
      options={(['all', 'illustration', 'photo', 'design'] as const).map((value) => ({
        value,
        label: t(
          { all: 'All', illustration: 'Illustration', photo: 'Photo', design: 'Design' }[value],
        ),
      }))}
      change={(value) => setType(value as FilterType)}
    />
  );
}

export function SelectedFilters({
  catalog,
  filters,
  remove,
}: Pick<Props, 'catalog' | 'filters'> & { remove: Props['toggle'] }) {
  const { t } = useTranslation();
  const options = catalog.filter((option) => filters[option.category]?.includes(option.id));
  if (!options.length) return null;
  return (
    <div className="filter-summary">
      <div className="selected-options" role="group" aria-label={t('Selected filters')}>
        {options.map((option) => {
          const label = t(option.label.replace(' Modern', '').replace(/\s+illustration\b/gi, ''));
          return (
            <span
              className="selected-option"
              key={`${option.category}:${option.id}`}
              title={`${t(option.category === 'Aspect Ratio' ? 'Aspect ratio' : option.category)}: ${label}`}
            >
              <span className="selected-option-label">{label}</span>
              <button
                className="selected-option-remove"
                aria-label={t('Remove {{label}} option', { label })}
                onClick={() => remove(option.category, option.id)}
              >
                <Icon name="close" size="16" />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

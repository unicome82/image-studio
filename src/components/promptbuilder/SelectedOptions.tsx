import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import type { Option, Selection } from '../../utils/promptBuilder';
import { selectedBuilderOptions } from '../../utils/selectedOptions';
import './SelectedOptions.scss';
interface Props {
  catalog: Option[];
  selection: Selection;
  fields: Record<string, string>;
  photo: boolean;
  remove: (category: string, id: string) => void;
}
export default function SelectedOptions({ catalog, selection, fields, photo, remove }: Props) {
  const { t } = useTranslation();
  const options = selectedBuilderOptions(catalog, selection, fields, photo);
  if (!options.length) return null;
  return (
    <div className="selected-options" role="group" aria-label={t('Selected options')}>
      {options.map((option) => {
        const label = t(option.label.replace(' Modern', '').replace(/\s+illustration\b/gi, ''));
        return (
          <span
            className="selected-option"
            key={`${option.category}:${option.id}`}
            title={`${t(option.category)}: ${label}`}
          >
            <span className="selected-option-label">{label}</span>
            <button
              className="selected-option-remove"
              aria-label={t('Remove {{label}} option', { label })}
              onClick={() => remove(option.category, option.id)}
            >
              <Icon name="close" size={12} />
            </button>
          </span>
        );
      })}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import type { Option, Selection } from '../../utils/promptBuilder';
import { complexityLabels } from '../../utils/promptBuilder';
import { selectedBuilderOptions } from '../../utils/selectedOptions';
import './SelectedOptions.scss';
interface Props {
  catalog: Option[];
  selection: Selection;
  fields: Record<string, string>;
  photo: boolean;
  complexity: number;
  remove: (category: string, id: string) => void;
}
export default function SelectedOptions({
  catalog,
  selection,
  fields,
  photo,
  complexity,
  remove,
}: Props) {
  const { t } = useTranslation();
  const options = selectedBuilderOptions(catalog, selection, fields, photo);
  return (
    <div className="selected-options" role="group" aria-label={t('Selected options')}>
      <span className="selected-option fixed-option" title={t('Aspect ratio')}>
        {t('Aspect ratio')}: {fields['Aspect Ratio'] || '1:1'}
      </span>
      <span className="selected-option fixed-option" title={t('Complexity')}>
        {t('Complexity')}: {t(complexityLabels[complexity - 1])}
      </span>
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
              className="selected-option-remove close-button"
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

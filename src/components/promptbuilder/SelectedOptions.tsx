import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import type { Option, Selection } from '../../utils/promptBuilder';
import { complexityUiLabels as complexityLabels } from '../../utils/promptBuilder';
import { selectedBuilderOptions } from '../../utils/selectedOptions';
export interface SelectedOptionsProps {
  catalog: Option[];
  selection: Selection;
  fields: Record<string, string>;
  photo: boolean;
  design?: boolean;
  complexity: number;
  remove?: (category: string, id: string) => void;
}
export default function SelectedOptions({
  catalog,
  selection,
  fields,
  photo,
  design = false,
  complexity,
  remove,
}: SelectedOptionsProps) {
  const { t } = useTranslation();
  const options = selectedBuilderOptions(catalog, selection, fields, photo, design).filter(
    (option) => option.category !== 'Outline',
  );
  const outline =
    !photo && !design
      ? catalog.find(
          (option) =>
            option.category === 'Outline' && option.id === (selection.Outline?.[0] ?? 'coloronly'),
        )
      : undefined;
  return (
    <div className="selected-options" role="group" aria-label={t('Selected options')}>
      <span className="selected-option fixed-option" title={t('Aspect ratio')}>
        {fields['Aspect Ratio'] || '1:1'}
      </span>
      <span className="selected-option fixed-option" title={t('Complexity')}>
        {t(complexityLabels[complexity - 1])}
      </span>
      {outline && (
        <span className="selected-option fixed-option" title={t('Outline')}>
          {t(outline.label)}
        </span>
      )}
      {options.map((option) => {
        const label = t(option.label.replace(' Modern', '').replace(/\s+illustration\b/gi, ''));
        return (
          <span
            className={'selected-option' + (remove ? '' : ' fixed-option')}
            key={`${option.category}:${option.id}`}
            title={`${t(option.category)}: ${label}`}
          >
            <span className="selected-option-label">{label}</span>
            {remove && (
              <button
                className="selected-option-remove"
                aria-label={t('Remove {{label}} option', { label })}
                onClick={() => remove(option.category, option.id)}
              >
                <Icon name="close" size="16" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
